# Phase 1 — 핵심 도메인 + 데이터 동기화

## 개요

tarkov.dev GraphQL API에서 게임 데이터를 가져와 DB에 저장하고,
REST API로 프론트엔드에 제공하는 기반 구조를 구축한다.

---

## 1. design.md 대비 수정 사항

### 1.1 동기화 주기 변경

| 항목 | 기존 설계 | 수정 |
|------|----------|------|
| cron | `0 0 */24 * * *` (24시간) | `0 0 3 1 * *` (매월 1일 03시) |
| 근거 | - | 게임 데이터는 패치 시에만 변경 (수 주~수 개월 간격). 24시간은 과잉 |
| 보완 | - | `POST /api/v1/admin/sync` 수동 트리거로 패치 직후 즉시 반영 가능 |

### 1.2 동기화 시 유저 데이터 보호 정책

**핵심 원칙: 동기화는 게임 데이터(quests, items, maps, traders)만 건드린다. 유저 데이터(user_quest_progress, user_item_progress)는 절대 건드리지 않는다.**

#### 상황별 처리

| 상황 | 게임 데이터 처리 | 유저 데이터 영향 |
|------|-----------------|-----------------|
| 퀘스트 내용 수정 | `api_id` 기준 UPDATE (upsert) | 영향 없음. 내부 PK 불변 |
| 새 퀘스트 추가 | INSERT | progress 행 없음 = NOT_STARTED 표시 |
| 퀘스트 삭제 (와이프/패치) | `removed = true` (soft delete) | FK 유지, 데이터 보존 |

#### 스키마 변경: `quests` 테이블에 soft delete 컬럼 추가

```sql
ALTER TABLE quests ADD COLUMN removed    BOOLEAN DEFAULT FALSE;
ALTER TABLE quests ADD COLUMN removed_at TIMESTAMP NULL;
```

- API 조회 시: `WHERE removed = false` 조건으로 제외
- 유저의 기존 progress 레코드는 그대로 유지 (FK 깨지지 않음)
- 제거된 퀘스트의 progress는 통계에서 자연스럽게 제외 (JOIN 시 removed 필터)

#### 와이프 초기화: 유저 주도

동기화가 자동으로 유저 데이터를 삭제하지 않는다.
와이프 후 진행 초기화는 유저가 직접 수행한다.

```
설정 페이지 → [새 시즌 시작 (진행 초기화)] 버튼
    ↓
확인 다이얼로그: "모든 퀘스트/아이템 진행이 초기화됩니다. 되돌릴 수 없습니다."
    ↓
PUT /api/v1/progress/reset
    → user_quest_progress DELETE WHERE user_id = ?
    → user_item_progress DELETE WHERE user_id = ?
```

이 API는 Phase 2 (Progress 도메인) 구현 시 추가한다.

### 1.3 Phase 1 범위 축소

#### 제외 항목

| 항목 | 사유 | 대체 |
|------|------|------|
| `sync_history` 테이블 | 관리자 대시보드가 없는 현 단계에서 불필요 | `logger.info/warn`으로 기록 |
| `GET /api/v1/admin/sync/history` | sync_history 제외에 따라 함께 제외 | - |
| `GET /api/v1/items` (아이템 검색) | 이 앱은 아이템 백과사전이 아님. 아이템은 퀘스트 상세 내에서만 사용 | QuestDetail 응답에 포함 |
| `GET /api/v1/items/{id}` (아이템 상세) | 위와 동일 | QuestDetail 응답에 포함 |

#### 유지 항목

- `items` 테이블 자체는 유지 (quest_objective_items FK 대상)
- `POST /api/v1/admin/sync` 수동 트리거는 유지

---

## 2. 동기화 흐름

```
매월 1일 03시 스케줄러 or POST /api/v1/admin/sync
        |
        v
  tarkov.dev GraphQL API 호출
        |
        v
  게임 데이터 Upsert (api_id 기준)
  +-- 기존 데이터 존재 → UPDATE (내용 갱신)
  +-- 새 데이터       → INSERT
  +-- API에서 사라짐  → removed = true, removed_at = now
        |
        v
  유저 Progress는 일절 미접촉
        |
        v
  로그 기록: "동기화 완료 - 갱신 N건, 추가 N건, 제거 N건"
```

### 동기화 순서 (FK 의존성)

```
1. Map + MapFloor   (의존 없음)
2. Trader           (의존 없음)
3. Item             (의존 없음)
4. Quest            (trader_id → Trader, map_id → Map)
5. QuestPrerequisite (quest_id, prereq_quest_id → Quest)
6. QuestObjective   (quest_id → Quest, map_id → Map)
7. QuestObjectiveItem (objective_id → QuestObjective, item_id → Item)
```

1~3은 서로 의존이 없으므로 병렬 처리 가능.
4~7은 순차 처리 필수.

### 서버 시작 시 초기 동기화

```java
@PostConstruct
public void initSync() {
    if (questRepository.count() == 0) {
        // DB 비어있으면 최초 1회 동기화 실행
        dataSyncService.syncAll();
    }
}
```

---

## 3. 구현 대상 목록

### 3.1 Backend — Entity

| 클래스 | 패키지 | 비고 |
|--------|--------|------|
| Trader | domain/trader/entity | api_id, name, imageUrl |
| GameMap | domain/map/entity | api_id, name, normalizedName, defaultFloor. 클래스명 `Map` 회피 |
| MapFloor | domain/map/entity | mapId, floorId, floorLabel, floorOrder |
| Quest | domain/quest/entity | removed, removedAt 컬럼 포함 |
| QuestPrerequisite | domain/quest/entity | quest_id, prereqQuestId |
| QuestObjective | domain/quest/entity | type, description, mapId, floorId, positionX/Y |
| Item | domain/item/entity | api_id, name, shortName, iconUrl |
| QuestObjectiveItem | domain/quest/entity | objectiveId, itemId, count, foundInRaid |

### 3.2 Backend — Repository

| 클래스 | 주요 메서드 |
|--------|------------|
| TraderRepository | findByApiId() |
| GameMapRepository | findByApiId(), findByNormalizedName() |
| MapFloorRepository | findByGameMap() |
| QuestRepository | findByApiId(), findByRemovedFalse() |
| QuestObjectiveRepository | findByApiId(), findByQuestId() |
| ItemRepository | findByApiId() |

### 3.3 Backend — Sync

| 클래스 | 역할 |
|--------|------|
| TarkovApiClient | WebClient로 tarkov.dev GraphQL 호출 |
| DataSyncService | 동기화 오케스트레이션 (upsert + soft delete 로직) |
| SyncScheduler | @Scheduled 월 1회 cron 실행 |

### 3.4 Backend — API (조회용)

| 엔드포인트 | Controller | 비고 |
|-----------|------------|------|
| GET /api/v1/quests | QuestController | 필터: trader, kappa, map |
| GET /api/v1/quests/{id} | QuestController | 목표+아이템 포함 상세 |
| GET /api/v1/quests/map/{mapId} | QuestController | 맵 마커용 |
| GET /api/v1/maps | MapController | 전체 맵 목록 |
| GET /api/v1/maps/{normalizedName} | MapController | 층 정보 포함 상세 |
| POST /api/v1/admin/sync | SyncController | 수동 동기화 트리거 |

### 3.5 Backend — DTO

| DTO | 용도 |
|-----|------|
| QuestListItem | 퀘스트 목록 응답 |
| QuestDetail | 퀘스트 상세 응답 (objectives, prerequisites 포함) |
| QuestMapMarker | 맵 마커 응답 |
| MapListItem | 맵 목록 응답 |
| MapDetail | 맵 상세 응답 (floors 포함) |
| TraderInfo | 퀘스트 내 딜러 정보 (id, name, imageUrl) |

### 3.6 Backend — Service

| 클래스 | 역할 |
|--------|------|
| QuestService | 퀘스트 목록/상세/맵마커 조회 (removed=false 필터) |
| MapService | 맵 목록/상세 조회 |

---

## 4. Phase 1에서 하지 않는 것

| 항목 | 사유 | 예정 Phase |
|------|------|-----------|
| Item 독립 API | 퀘스트 상세 내 포함으로 충분 | 필요 시 추가 |
| SyncHistory 테이블/API | 로그로 대체 | 필요 시 추가 |
| Progress 도메인 전체 | Phase 2 범위 | Phase 2 |
| 프론트엔드 퀘스트/맵 UI | Phase 2~3 범위 | Phase 2, 3 |
| 와이프 초기화 API (PUT /progress/reset) | Progress 도메인 의존 | Phase 2 |

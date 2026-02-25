# 맵 위치 데이터 동기화 구현 계획

## Context

현재 맵 뷰에는 **퀘스트 마커만** 표시되며, The Lab/Streets 등은 `objective_gps.json`에 GPS 데이터가 없어 마커가 0개인 상태. tarkov.dev API가 모든 맵에 대해 탈출구, 잠긴문, 스폰 등의 3D 좌표를 제공하며, tarkovdata `maps.json`의 bounds로 2D 백분율 변환이 가능함을 검증 완료. 기존 동기화 패턴(시작 시 1회 + cron)을 확장하여 DB에 저장하고, 프론트엔드에서 카테고리별 토글로 표시한다.

---

## Phase 1: Backend 데이터 레이어

### 1.1 `maps-metadata.json`에 bounds + floorRanges 추가

파일: `backend/src/main/resources/data/maps-metadata.json`

각 맵에 `bounds`(tarkovdata maps.json 출처)와 다층 맵용 `floorRanges` 추가:

```json
"shoreline": {
  "svgFile": "shoreline.svg",
  "defaultFloor": "Ground_Level",
  "coordinateRotation": 180,
  "bounds": [[506, -405], [-1060, 618]],
  "floors": [...]
}
```

```json
"the-lab": {
  "bounds": [[-91, -477], [-287, -193]],
  "floorRanges": [
    { "floorId": "Technical_Level", "yMin": -6, "yMax": 2 },
    { "floorId": "First_Level", "yMin": 2, "yMax": 5 },
    { "floorId": "Second_Level", "yMin": 5, "yMax": 99 }
  ]
}
```

bounds 보유 맵: customs, factory, woods, shoreline, interchange, reserve, the-lab, lighthouse, streets-of-tarkov, ground-zero (10개)
bounds 없음: terminal, the-labyrinth → positionX/Y = null 저장 (기존 필터 로직으로 자동 제외)

### 1.2 새 엔티티 (3개)

| 파일 | 테이블 | 주요 컬럼 |
|---|---|---|
| `domain/map/entity/MapExtract.java` | `map_extracts` | map_id, api_id(UK), name, faction, floor_id, position_x, position_y |
| `domain/map/entity/MapLock.java` | `map_locks` | map_id, lock_type, needs_power, key_api_id, key_name, key_short_name, key_icon_url, floor_id, position_x, position_y |
| `domain/map/entity/MapSpawn.java` | `map_spawns` | map_id, zone_name, sides(CSV), categories(CSV), floor_id, position_x, position_y |

Lock은 key 정보를 **비정규화** 저장 (Item FK 불필요 - 표시용 데이터, 동기화 순서 의존성 제거)

### 1.3 새 리포지토리 (3개)

`MapExtractRepository`, `MapLockRepository`, `MapSpawnRepository`
- 패턴: `findByGameMap()`, `@Modifying deleteByGameMap()` (기존 MapFloorRepository와 동일)

---

## Phase 2: Backend 동기화 레이어

### 2.1 TarkovMapDto 확장

파일: `sync/dto/TarkovMapDto.java`

내부 static 클래스로 추가: `TarkovExtractDto`, `TarkovLockDto`, `TarkovSpawnDto`, `TarkovBossDto`, `TarkovPositionDto`, `TarkovKeyDto`

### 2.2 MAPS_QUERY 확장

파일: `sync/client/TarkovApiClient.java`

```graphql
{ maps { id name normalizedName
    extracts { id name faction position { x y z } top bottom }
    locks { lockType needsPower key { id name shortName iconLink } position { x y z } top bottom }
    spawns { zoneName position { x y z } sides categories }
    bosses { name spawnChance spawnLocations { name chance } }
} }
```

기존 1회 호출에서 쿼리만 확장 → 추가 API 호출 없음

### 2.3 좌표 변환 유틸리티 (신규)

파일: `sync/service/CoordinateConverter.java`

```
leftPercent = (bounds[0][0] - gameX) / (bounds[0][0] - bounds[1][0]) * 100
topPercent  = (gameZ - bounds[0][1]) / (bounds[1][1] - bounds[0][1]) * 100
```

+ `detectFloor(gameY, floorRanges, defaultFloor)` — y좌표로 층 결정

### 2.4 MapPositionSyncService (신규)

파일: `sync/service/MapPositionSyncService.java`

- DataSyncService에서 분리 (300줄 제한 준수)
- 맵별 delete-all + rebuild 패턴 (MapFloor과 동일, 유저 FK 없음)
- 동기화 시 3D→2D% 변환 + 층 감지 후 DB 저장

### 2.5 DataSyncService 수정

파일: `sync/service/DataSyncService.java`

- MapMetadata record에 `bounds`, `floorRanges` 필드 추가 (→ 별도 파일 `sync/dto/MapMetadata.java` 추출)
- `syncAll()` 1단계(맵) 직후 `mapPositionSyncService.syncMapPositions()` 호출 추가
- SyncResult에 extractsProcessed, locksProcessed, spawnsProcessed 추가

---

## Phase 3: Backend API 레이어

### 3.1 응답 DTO (4개)

| 파일 | 용도 |
|---|---|
| `domain/map/dto/MapExtractMarker.java` | 탈출구 마커 (name, faction, floor, posX/Y) |
| `domain/map/dto/MapLockMarker.java` | 잠금 마커 (lockType, needsPower, keyName, keyShortName, keyIconUrl, floor, posX/Y) |
| `domain/map/dto/MapSpawnMarker.java` | 스폰 마커 (zoneName, sides[], categories[], floor, posX/Y) |
| `domain/map/dto/MapPositionData.java` | 통합 응답 (extracts + locks + spawns) |

### 3.2 MapService 확장

파일: `domain/map/service/MapService.java`

```java
public MapPositionData getMapPositions(String normalizedName) {
    // findByGameMap → 각 DTO로 변환 → MapPositionData 반환
}
```

### 3.3 MapController 엔드포인트 추가

파일: `domain/map/controller/MapController.java`

```
GET /api/v1/maps/{normalizedName}/positions
```

응답: `{ extracts: [...], locks: [...], spawns: [...] }`

---

## Phase 4: Frontend 타입/API/스토어

### 4.1 타입 추가

파일: `frontend/src/types/map.ts`

`MapExtractMarker`, `MapLockMarker`, `MapSpawnMarker`, `MapPositionData` 인터페이스

### 4.2 API 호출 추가

파일: `frontend/src/api/mapApi.ts`

`getMapPositions(normalizedName)` 추가

### 4.3 mapStore 확장

파일: `frontend/src/store/mapStore.ts`

- `positions: MapPositionData | null` state
- `markerVisibility: { extracts, locks, spawns, quests }` toggle state
- `fetchPositions()`, `toggleMarkerCategory()` action

### 4.4 마커 설정 상수

신규 파일: `frontend/src/features/map/constants/markerConfig.ts`

카테고리별 색상/아이콘 정의:
- 탈출구: PMC(파랑), Scav(주황), 공용(보라)
- 잠금: 빨강 + 자물쇠 아이콘
- 스폰: PMC(초록), Scav(노랑) — 작은 점(w-3)

---

## Phase 5: Frontend 맵 뷰 UI

### 5.1 마커 렌더링 컴포넌트 분리

신규 파일: `frontend/src/features/map/components/MapMarkerLayer.tsx` (~180줄)

- extract/lock/spawn 마커 렌더링
- 기존 MapViewPage의 퀘스트 마커 렌더링도 여기로 이동
- floor distance 기반 블러 적용 (기존 로직 재사용)

### 5.2 팝업 컴포넌트 분리

신규 파일: `frontend/src/features/map/components/MapMarkerPopup.tsx` (~120줄)

- 마커 타입별 팝업 내용 분기 (퀘스트/탈출구/잠금/스폰)
- 잠금 팝업: 키 아이콘 + 키 이름 + needsPower 뱃지

### 5.3 카테고리 토글 버튼

MapViewPage 컨트롤바에 추가:

```
[탈출구] [잠금] [스폰] [퀘스트]  ← 각각 ON/OFF 토글
```

- 스폰은 **기본 OFF** (2,797개로 시각적 과부하 방지)
- 나머지는 기본 ON

### 5.4 보스 정보 패널

신규 파일: `frontend/src/features/map/components/MapBossPanel.tsx` (~60줄)

- 좌표 없이 메타데이터만 표시 (이름, 스폰 확률, 위치명)
- 층 선택기 하단에 접을 수 있는 패널

---

## 구현 순서

```
Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5
(엔티티)   (동기화)   (API)    (FE타입)   (FE UI)
```

Phase 2 완료 후 서버 재시작으로 동기화 검증 가능
Phase 3 완료 후 API 응답 확인 가능
Phase 5 완료 후 브라우저에서 전체 검증

## 파일 요약

### 신규 파일 (15개)
- Backend 엔티티: MapExtract, MapLock, MapSpawn (3)
- Backend 리포지토리: 3개
- Backend 응답 DTO: MapExtractMarker, MapLockMarker, MapSpawnMarker, MapPositionData (4)
- Backend 동기화: CoordinateConverter, MapPositionSyncService, MapMetadata (3)
- Frontend: MapMarkerLayer, MapMarkerPopup, MapBossPanel, markerConfig (4)
- *(보스 엔티티/리포지토리는 선택사항)*

### 수정 파일 (8개)
- `maps-metadata.json` — bounds, floorRanges 추가
- `TarkovMapDto.java` — 내부 DTO 추가
- `TarkovApiClient.java` — MAPS_QUERY 확장
- `DataSyncService.java` — MapPositionSyncService 연동, MapMetadata 추출
- `SyncResult.java` — 카운트 필드 추가
- `MapService.java` — getMapPositions() 추가
- `MapController.java` — /positions 엔드포인트 추가
- `mapStore.ts`, `mapApi.ts`, `map.ts`, `MapViewPage.tsx` — FE 확장

## 검증 방법

1. **동기화 검증**: 서버 시작 → 로그에서 `맵 위치 동기화 완료: 탈출구 147건, 잠금 339건, 스폰 2797건` 확인
2. **API 검증**: `GET /api/v1/maps/shoreline/positions` 호출 → extracts/locks/spawns 배열 확인
3. **좌표 검증**: Shoreline "Path to Lighthouse" 탈출구가 left:3.6%, top:14.7% (맵 좌상단) 위치에 표시되는지 확인
4. **The Lab 검증**: `/map/the-lab` 진입 → 탈출구 7개, 잠금 14개 마커가 지도에 표시되는지 확인
5. **토글 검증**: 카테고리 버튼으로 각 마커 유형 ON/OFF 확인
6. **잠금 팝업**: 잠긴 문 마커 클릭 → 키 이름 + 아이콘 표시 확인

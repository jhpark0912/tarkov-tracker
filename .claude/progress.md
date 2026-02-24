# Tarkov Quest Helper — 진행 상태

## 최근 커밋 (dev 브랜치, push 완료)
- (Phase 2 커밋 예정)
- `9823d16` :sparkles: [feat] Phase 1 - 핵심 도메인 + tarkov.dev 데이터 동기화 구현
- `60f6560` :sparkles: [feat] JWT 기반 회원가입/로그인 인증 시스템 구현

---

## 완료된 Phase

### Phase 0 — JWT 인증 시스템 (완료)
- Backend: AuthController, AuthService, User, UserRepository, JwtTokenProvider, JwtAuthenticationFilter, GlobalExceptionHandler, 커스텀 예외 4개
- Frontend: authStore(Zustand), authApi, ProtectedRoute, LoginPage, SignupPage, Header 수정

### Phase 1 — 핵심 도메인 + 데이터 동기화 (완료)

**엔티티 8개**
- Trader, GameMap, MapFloor, Item
- Quest (soft delete: removed/removedAt), QuestPrerequisite, QuestObjective, QuestObjectiveItem

**리포지토리 7개**
- TraderRepository, GameMapRepository, MapFloorRepository, ItemRepository
- QuestRepository (findWithFilters, findAllActiveApiIds, findByIdWithDetails)
- QuestObjectiveRepository (findByQuestWithItems, findMapMarkersForMap)
- QuestPrerequisiteRepository (deleteByQuest, findByQuestWithPrereqs)

**Sync 레이어**
- TarkovApiClient — WebClient GraphQL, 16MB 버퍼
- DataSyncService — 동기화 순서: 맵→딜러→아이템→퀘스트→선행조건→목표→soft delete
- SyncInitializer — ApplicationReadyEvent 기반 초기 자동 동기화
- SyncScheduler — 매월 1일 03시 (cron: "0 0 3 1 * *")
- SyncController — POST /api/v1/admin/sync (JWT 인증 필요)
- Sync DTOs 9개 (TarkovApiResponse, TarkovTaskDto, TarkovObjectiveDto 등)

**REST API**
- GET /api/v1/quests?trader=&kappa=&map= — 퀘스트 목록 필터
- GET /api/v1/quests/{id} — 퀘스트 상세 (objectives + prerequisites + items)
- GET /api/v1/quests/map/{mapId}?floor= — 맵 마커
- GET /api/v1/maps — 맵 목록
- GET /api/v1/maps/{normalizedName} — 맵 상세 (층 포함)
- POST /api/v1/admin/sync — 수동 동기화

**설정**
- WebClientConfig (16MB 버퍼)
- maps-metadata.json (10개 맵 층 정보)
- @EnableScheduling, open-in-view: false

**검증 결과**
- 퀘스트 982개, 맵 15개 자동 동기화 확인
- 유저 데이터 보호 원칙 적용 (sync는 게임 데이터만, soft delete)

---

### Phase 2 — Progress 도메인 + 퀘스트 UI (완료)

**Backend — Progress 도메인**
- 엔티티: UserQuestProgress (user × quest, status: NOT_STARTED/IN_PROGRESS/COMPLETED)
- 엔티티: UserItemProgress (user × objective, collectedCount)
- 리포지토리: UserQuestProgressRepository, UserItemProgressRepository
- DTO 7개: UserProgressResponse, ProgressSummaryResponse, QuestProgressResponse, ItemProgressResponse, QuestProgressUpdateRequest, ItemProgressUpdateRequest
- ProgressService: getUserProgress, getProgressSummary (트레이더·맵별 통계), updateQuestProgress (upsert), updateItemProgress (upsert), resetProgress
- ProgressController: GET /api/v1/progress, GET /api/v1/progress/summary, PUT /api/v1/progress/quest/{id}, PUT /api/v1/progress/item/{id}, PUT /api/v1/progress/reset
- QuestRepository.findByRemovedFalse() — fetch join 추가 (N+1 방지)

**Frontend — 퀘스트 UI + 진행 상태 연동**
- types/quest.ts, types/progress.ts — 도메인 TypeScript 타입
- api/questApi.ts, api/progressApi.ts — REST API 호출
- store/questStore.ts — 퀘스트 목록/상세, 검색·필터 상태
- store/progressStore.ts — 퀘스트·아이템 진행 상태 (fetchProgress, fetchSummary, updateQuestStatus, updateItemCount, resetProgress)
- QuestListPage.tsx — 실제 API 연동, 검색/트레이더/맵/카파 필터, 로그인 시 진행 상태 뱃지
- QuestDetailPage.tsx — 퀘스트 상세 연동, 상태 변경 버튼 (NOT_STARTED→IN_PROGRESS→COMPLETED), 아이템 +/- 수량 조절
- DashboardPage.tsx — progressStore.summary 연동, 트레이더·맵별 실 진행률, 진행 중 카운트

---

## 다음 단계: Phase 3

### 구현 예정 항목
1. **맵 뷰 (MapViewPage)** — SVG 맵 렌더링, 층별 토글, 퀘스트 마커 오버레이 (react-leaflet 또는 SVG 직접 조작)
2. **맵 API 연동** — GET /api/v1/quests/map/{mapId}?floor= 마커 데이터 사용
3. **아이템 검색 API** (후순위) — GET /api/v1/items?search=
4. **관리자 기능** — 동기화 이력 UI

### 설계 참조
- `docs/design.md` 섹션 2.3 (맵 API), 5 (SVG 맵 구조)
- `docs/architecture.md` 맵 컴포넌트 설계

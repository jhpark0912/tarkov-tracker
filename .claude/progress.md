# Tarkov Quest Helper — 진행 상태

## 최근 커밋 (dev 브랜치)
- `856d2ce` :sparkles: [feat] 맵 뷰 - 줌/패닝, 퀘스트 패널, 층 거리 블러 구현
- `8fc3173` :sparkles: [feat] Phase 3 - 맵 뷰 실데이터 연동 + SVG 렌더링 + 퀘스트 마커 오버레이
- `4f6b362` :sparkles: [feat] Phase 2 - Progress 도메인 + 퀘스트 UI 실데이터 연동

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
- objective_gps.json (TarkovTracker/tarkovdata) — 목표 좌표 동기화 소스

**REST API**
- GET /api/v1/quests?trader=&kappa=&map= — 퀘스트 목록 필터
- GET /api/v1/quests/{id} — 퀘스트 상세 (objectives + prerequisites + items)
- GET /api/v1/quests/map/{mapId}?floor= — 맵 마커
- GET /api/v1/maps — 맵 목록
- GET /api/v1/maps/{normalizedName} — 맵 상세 (층 포함)
- POST /api/v1/admin/sync — 수동 동기화

**설정**
- WebClientConfig (16MB 버퍼)
- maps-metadata.json (10개 맵, 실제 SVG <g> 그룹 ID 기준 floorId)
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

### Phase 3 — 맵 뷰 (완료)

**Backend**
- QuestObjective.updatePosition() — GPS 좌표 저장 메서드
- DataSyncService — objective_gps.json 로딩 + syncQuestObjectives에 좌표 저장 (GpsData record)

**Frontend — 맵 타입/API/스토어**
- types/map.ts — MapFloorInfo, MapListItem, MapDetail, QuestMapMarker, MarkerItemDto
- api/mapApi.ts — getMapList, getMapDetail(normalizedName), getMapMarkers(mapId, floor?)
- store/mapStore.ts — maps, currentMap, markers, loading, error / fetchMaps, fetchMapDetail, fetchMarkers, clearCurrentMap

**Frontend — 맵 페이지 기능**
- MapSelectPage.tsx — /api/v1/maps 연동, byMap 완료율 표시
- MapViewPage.tsx — SVG 인라인 렌더링 + 마커 오버레이
  - SVG viewBox 파싱 + ResizeObserver(containerSize) → svgBounds letterbox 보정으로 마커 정확도
  - 층별 `<g>` 그룹 opacity/filter transition (defaultFloor 블러 배경)
  - 마우스 휠 줌 (커서 기준, 0.3x~10x) + 드래그 패닝 + 버튼 컨트롤
  - Shift+휠 층 변경 유지
  - 팝업: zoomable 레이어 밖 화면 좌표 변환 → 줌 무관 고정 크기
  - 층 거리 블러: 같은층=선명 / 1층차=0.4투명+blur(1px) / 2+층=0.2+blur(2px)
  - MapQuestPanel: 퀘스트 다중 선택, 카파 필터, 선택 초기화, 패널 토글
- MapQuestPanel.tsx (features/map/components/) — 우측 퀘스트 목록 패널

**SVG 맵**
- public/maps/ — 10개 맵 SVG (TarkovTracker/tarkovdata)
- maps-metadata.json — 실제 SVG `<g>` 그룹 ID 기준으로 floorId 교정

**핵심 버그 수정**
- dangerouslySetInnerHTML useMemo 안정화 (innerHTML 재설정 방지)
- ResizeObserver [currentMap] 의존성 (loading 시 ref null → containerSize 미설정 버그)
- svgBounds letterbox 보정 (마커 좌표 컨테이너 기준 → SVG 실제 렌더링 영역 기준)

---

## 다음 단계

1. **아이템 검색 API** — GET /api/v1/items?search=
2. **관리자 기능** — 동기화 이력 UI
3. **기타 UX 개선** — 사용자 피드백 기반

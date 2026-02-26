# 프로젝트 구조 맵

## Backend (`backend/src/main/java/com/tarkov/helper/`)

### 도메인 패키지
| 패키지 | 주요 파일 | 역할 |
|--------|----------|------|
| `domain/map/entity/` | `GameMap`, `MapFloor`, `MapExtract`, `MapLock`, `MapLootContainer` | 맵 관련 엔티티 |
| `domain/map/repository/` | `GameMapRepository`, `MapFloorRepository`, `MapExtractRepository`, `MapLockRepository`, `MapLootContainerRepository` | JPA 레포지토리 |
| `domain/map/service/` | `MapService` | 맵 조회 (목록, 상세, 위치 데이터) |
| `domain/map/dto/` | `MapPositionData`, `MapExtractMarker`, `MapLockMarker`, `MapLootContainerMarker`, `MapDetail`, `MapListItem` | 응답 DTO |
| `domain/map/controller/` | `MapController` | `/api/v1/maps/**` |
| `domain/quest/` | entity/service/repository/dto/controller | 퀘스트 CRUD |
| `domain/item/` | entity/repository | 아이템 |
| `domain/trader/` | entity/repository | 딜러 |
| `domain/progress/` | entity/service/repository/controller | 유저 진행 상태 |

### 동기화 패키지
| 패키지 | 주요 파일 | 역할 |
|--------|----------|------|
| `sync/client/` | `TarkovApiClient` | tarkov.dev GraphQL 호출 (MAPS_QUERY, TASKS_QUERY) |
| `sync/service/` | `DataSyncService` | 전체 동기화 오케스트레이터 |
| `sync/service/` | `MapPositionSyncService` | 탈출구/잠금/컨테이너 좌표 변환 및 저장 |
| `sync/service/` | `CoordinateConverter` | 게임 좌표 → SVG % 좌표 변환 |
| `sync/dto/` | `TarkovMapDto`, `TarkovTaskDto`, `SyncResult` | API 응답 매핑 DTO |

### 글로벌
| 패키지 | 역할 |
|--------|------|
| `global/exception/` | `GlobalExceptionHandler`, `ResourceNotFoundException` |
| `config/` | Security, CORS, WebClient, Scheduler |
| `auth/` | JWT 인증 |

## Frontend (`frontend/src/`)

### 주요 디렉토리
| 경로 | 주요 파일 | 역할 |
|------|----------|------|
| `types/map.ts` | `MapPositionData`, `MapLootContainerMarker`, `MarkerCategory` 등 | 맵 타입 정의 |
| `store/mapStore.ts` | `useMapStore` | 맵 상태 (visibility, lootContainerFilter) |
| `api/mapApi.ts` | `mapApi` | 맵 API 호출 |
| `api/adminApi.ts` | `adminApi` | 동기화 트리거 |
| `features/map/MapViewPage.tsx` | | 맵 뷰 메인 (줌/팬, 층 전환, 마커 필터) |
| `features/map/components/MapMarkerLayer.tsx` | | 마커 렌더링 (quest/extract/lock/lootContainer) |
| `features/map/components/MapMarkerPopup.tsx` | | 마커 클릭 팝업 |
| `features/map/components/MapQuestPanel.tsx` | | 우측 퀘스트 목록 패널 |
| `features/map/constants/markerConfig.ts` | `MARKER_CONFIG` | 카테고리별 색상/라벨 |
| `features/map/constants/containerConfig.ts` | `getContainerConfig` | 컨테이너 타입별 아이콘/색상 |
| `features/story/StoryFlowPage.tsx` | | 메인 스토리 플로우차트 (SVG 기반, `/story`) |
| `components/layout/Sidebar.tsx` | | 사이드바 + 동기화 버튼 |

## 데이터 흐름

```
tarkov.dev API → TarkovApiClient → DataSyncService → DB
                                    ├─ syncMaps (GameMap, MapFloor)
                                    ├─ MapPositionSyncService (Extract, Lock, LootContainer)
                                    ├─ syncTraders, syncItems
                                    └─ syncQuests (Quest, Objective, Prerequisite)

DB → MapService.getMapPositions() → MapPositionData{extracts, locks, lootContainers}
   → MapController → Frontend mapApi → mapStore → MapViewPage → MapMarkerLayer
```

## 리소스 파일
| 파일 | 역할 |
|------|------|
| `backend/src/main/resources/data/maps-metadata.json` | 맵별 SVG, 층, bounds, 좌표 회전 |
| `backend/src/main/resources/data/objective_gps.json` | 퀘스트 목표 좌표 fallback |
| `frontend/public/maps/` | SVG/PNG 맵 이미지 |

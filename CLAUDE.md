# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

Tarkov Quest Helper - Escape from Tarkov 퀘스트 트래킹 웹 앱.
퀘스트 진행 추적, 인터랙티브 맵(층별 분리), 아이템 체크리스트 기능 제공.

## 빌드 및 실행

### Backend (`backend/`)
```bash
./gradlew build                    # 빌드
./gradlew bootRun                  # 실행 (port 8080)
./gradlew test                     # 전체 테스트
./gradlew test --tests "com.tarkov.helper.quest.QuestServiceTest"  # 단일 테스트 클래스
./gradlew test --tests "*.QuestServiceTest.testGetQuests"           # 단일 테스트 메소드
```

### Frontend (`frontend/`)
```bash
npm install         # 의존성 설치
npm run dev         # 개발 서버 (port 3000, /api → localhost:8080 프록시)
npm run build       # 프로덕션 빌드
npm run lint        # 린트
```

## 기술 스택

- **Backend**: Java 17+, Spring Boot 3.x, Spring Data JPA, Spring Security + JWT, WebClient
- **Frontend**: React 18+, TypeScript, Vite, Tailwind CSS, Leaflet.js (react-leaflet), Zustand
- **Database**: H2 (개발), PostgreSQL (프로덕션 대비)
- **Build**: Gradle (backend), npm (frontend)
- **외부 API**: tarkov.dev GraphQL API (`https://api.tarkov.dev/graphql`)

## 아키텍처

### 모노레포 구조
```
tarkov-quest-helper/
├── CLAUDE.md
├── backend/          # Spring Boot API 서버
├── frontend/         # React SPA
└── docs/
    └── design.md     # DB 스키마, API 명세, DTO 구조, GraphQL 쿼리 상세
    └── architecure.md     # 아키텍쳐 구조 작성시, 반드시 참조할 파일
```

### 설계 문서
```
.claude/structure.md          # 파일/패키지 구조 맵 — 코드 탐색 시 먼저 참조
.claude/progress.md           # 전체 진행 상태 + Phase별 완료 기록
.claude/story-quest-design.md # 메인 스토리 퀘스트 설계 (분기 구조, 엔딩, UI, 데이터 스키마)
docs/
├── design.md          # DB 스키마, API 명세, DTO 구조, GraphQL 쿼리 상세
├── phase1-plan.md     # Phase 1 구현 계획 (수정 사항, 동기화 정책, 유저 데이터 보호)
└── architecture.md    # 아키텍처 구조 작성 시 참조
```

### Backend 패키지 (`com.tarkov.helper`)
도메인별 패키지 구조. 각 도메인 안에 controller, service, repository, entity, dto 배치.

| 패키지 | 역할 |
|--------|------|
| `config/` | Security, CORS, WebClient, Scheduler 설정 |
| `auth/` | JWT 인증 (회원가입, 로그인, 토큰 관리) |
| `quest/` | 퀘스트 도메인 (목록, 상세, 맵별 마커) |
| `item/` | 아이템 도메인 |
| `map/` | 맵 도메인 (층 정보 포함) |
| `progress/` | 사용자 퀘스트/아이템 진행 상태 |
| `story/` | 메인 스토리 퀘스트 (챕터 진행, 분기 선택, 엔딩) — 기존 quest와 완전 별도 |
| `sync/` | tarkov.dev API 데이터 동기화 (WebClient + 스케줄러) |

### Frontend 구조 (`frontend/src/`)

| 디렉토리 | 역할 |
|----------|------|
| `api/` | Axios 인스턴스 (JWT interceptor) + API 호출 함수 |
| `store/` | Zustand 스토어 (auth, quest, progress, map, story) |
| `features/` | 페이지별 컴포넌트 (dashboard, quests, map, items, story) |
| `components/` | 공용 컴포넌트 (Layout, Header, Sidebar 등) |
| `types/` | TypeScript 타입 정의 (도메인별 분리) |
| `hooks/` | 커스텀 훅 |

### 데이터 흐름
1. **tarkov.dev GraphQL API** → `sync/DataSyncService` → DB (upsert 패턴)
2. 서버 시작 시 데이터 비어있으면 자동 동기화, 이후 24시간 스케줄러
3. Rate Limit: 분당 60회
4. 맵 SVG: TarkovTracker/tarkovdata 기반, `frontend/public/maps/`에 배치
5. 맵 메타데이터(floors, bounds 등): `backend/src/main/resources/data/maps-metadata.json`

### Security 설정
| 경로 | 인증 |
|------|------|
| `/api/v1/auth/**` | 불필요 (permitAll) |
| `/api/v1/admin/**` | 필요 |
| `/api/v1/progress/**` | 필요 |
| 기타 `/api/v1/**` | 불필요 (퀘스트/맵 조회는 비인증 허용) |

## 코딩 컨벤션

### Backend
- REST API prefix: `/api/v1/`
- Entity: Lombok (`@Getter`, `@Builder`, `@NoArgsConstructor`, `@AllArgsConstructor`)
- DTO와 Entity 분리 필수
- Service에서 비즈니스 로직, Controller는 얇게 유지
- 응답: 성공 시 데이터 직접 반환, 에러 시 `{ "error": "message" }`
- 예외 처리: `@RestControllerAdvice` 글로벌 핸들링
- Repository: 기본 JpaRepository 쿼리 메소드 사용, 복잡한 쿼리는 QueryDSL + RepositoryCustom 패턴 활용

### Frontend
- 함수형 컴포넌트 + Hooks만 사용
- 상태 관리: **Zustand** (auth 포함 모든 전역 상태)
- API 통신: Axios 인스턴스에 JWT interceptor (`useAuthStore.getState()`로 token 접근)
- 스타일링: Tailwind CSS (다크 모드 기본)
- 파일명: 컴포넌트 `PascalCase.tsx`, 유틸/훅 `camelCase.ts`
- 다크 모드 테마: 배경 `#1a1a2e`, 카드 `#16213e`, 강조 `#0f3460`, 골드 `#e6b800` (카파), 완료 `#4ecca3`, 미완료 `#e74c3c`

### Git
- 커밋 메시지: `feat:`, `fix:`, `docs:`, `refactor:`, `chore:` prefix
- 브랜치: main, develop, feature/*, fix/*

## 핵심 비즈니스 규칙

- 카파 퀘스트: `task.kappaRequired` 필드로 구분
- 퀘스트 상태: `NOT_STARTED` → `IN_PROGRESS` → `COMPLETED`
- 퀘스트 선행조건: UI에서만 잠금 표시 (서버에서 강제하지 않음)
- 맵 층 전환: SVG `<g>` 그룹 display toggle + 해당 층 마커만 필터링
- Found in Raid 아이템: 별도 아이콘 구분
- 맵 좌표: tarkovdata의 `gps.topPercent`, `gps.leftPercent`를 SVG bounds에 맞춰 변환
- **메인 스토리**: 기존 딜러 퀘스트와 **완전 별도 시스템** (도메인, UI, 라우트 모두 분리)
- 스토리 챕터 상태: `LOCKED` → `AVAILABLE` → `IN_PROGRESS` → `COMPLETED`
- 스토리 분기: 챕터 내 선택지(choice)로 다음 챕터가 결정됨
- 스토리 엔딩: 4개 (Savior, Survivor, Debtor, Fallen) — 분기 선택 조합으로 결정
- 스토리 데이터: 수동 JSON 관리 (tarkov.dev API 미사용)
- 상세 설계: `.claude/story-quest-design.md` 참조

## 외부 데이터 소스

### tarkov.dev GraphQL API
- 엔드포인트: `https://api.tarkov.dev/graphql`
- Rate Limit: 분당 60회, 라이선스: GNU GPLv3
- 동기화 순서: 맵 → 딜러 → 아이템 → 퀘스트
- GraphQL 쿼리 상세: `docs/design.md` 섹션 4 참조

### TarkovTracker/tarkovdata SVG 맵
- GitHub: https://github.com/TarkovTracker/tarkovdata
- SVG 맵: 층별 `<g>` 그룹으로 분리
- `maps.json`: 맵 메타데이터 (floors, defaultFloor, bounds, coordinateRotation)

## 상세 설계 참조

DB 스키마, REST API 명세, DTO 구조, GraphQL 쿼리, 컴포넌트 상세, Zustand Store 인터페이스, 개발 환경 설정은 **`docs/design.md`** 참조.

## 구현 완료 검증 규칙

기능 구현 완료 후, 커밋 전에 아래를 검증한다.

- **정합성**: 변경한 파일과 연관된 파일(Backend DTO ↔ Frontend 타입, 라우터 ↔ 컴포넌트)의 동기화 확인. 교체된 파일은 삭제 및 참조 정리.
- **방어 코딩**: 외부 주입 파라미터(인증 정보 등)의 null 가드. 새 엔드포인트의 Security 경로 매핑 확인.
- **성능**: 루프 내 DB 쿼리 금지. 동일 서비스 내 기존 패턴과 일관성 유지.
- **정리**: 미사용 import, 의존성, 파일 제거.

# 📏 Conventions
- Git: `.claude/COMMIT_CONVENTION.md` (예: `:sparkles: [feat]`)
- Logging: `logger.debug()` only. No `print()` or `console.log` in production.
- Error handling: 커스텀 예외 사용. bare `except:` 금지.
- Type hints: 모든 함수 시그니처에 필수.

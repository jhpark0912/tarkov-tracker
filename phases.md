# Tarkov Quest Helper — Claude Code 단계별 구현 지시서

이 문서의 각 Phase를 순서대로 Claude Code에 복사-붙여넣기하여 프로젝트를 구현합니다.
각 Phase 시작 전 반드시 CLAUDE.md와 design.md를 참조시켜 주세요.

---

## ▶ Phase 0: 프로젝트 초기화

아래 지시를 그대로 Claude Code에 전달하세요.

```
CLAUDE.md 와 docs/design.md를 읽고 프로젝트 전체 맥락을 이해한 뒤, 다음 작업을 수행해줘.

### Phase 0: 프로젝트 초기화

모노레포 구조로 프로젝트를 생성해줘.

**1. 루트 디렉토리 생성**
- tarkov-quest-helper/ 루트에 CLAUDE.md 배치

**2. Backend (Spring Boot) 초기화**
- backend/ 디렉토리에 Spring Boot 3.x + Java 17 + Gradle 프로젝트 생성
- 의존성: Spring Web, Spring Data JPA, Spring Security, H2, Lombok, Validation
- 추가 의존성: spring-boot-starter-webflux (WebClient용), jjwt (JWT 토큰)
- 패키지 루트: com.tarkov.helper
- application.yml을 design.md의 "개발 환경 설정" 섹션 참고하여 작성
- CORS 설정: localhost:3000 허용

**3. Frontend (React) 초기화**
- frontend/ 디렉토리에 Vite + React + TypeScript 프로젝트 생성
- 추가 패키지: react-router-dom, axios, zustand, tailwindcss, postcss, autoprefixer,
  leaflet, react-leaflet, @types/leaflet
- Tailwind CSS 설정 (다크 모드: class 전략)
- vite.config.ts에 /api 프록시 설정 (→ localhost:8080)
- 기본 폴더 구조 생성 (CLAUDE.md의 프로젝트 구조 참고)

**4. 기본 레이아웃**
- 다크 모드 기본 테마 적용 (타르코프 분위기: 어두운 배경 #1a1a2e, 강조색 #e6b800)
- Layout 컴포넌트: 상단 Header + 좌측 Sidebar + 메인 Content 영역
- Header: 로고 "Tarkov Quest Helper", 로그인/로그아웃 버튼
- Sidebar: 맵 목록, 딜러 목록 (데이터 없이 하드코딩 placeholder)
- React Router 기본 라우팅 설정 (/, /login, /signup, /quests, /map)
- 각 라우트에 빈 페이지 컴포넌트 배치

빌드가 되는지 확인:
- backend: ./gradlew bootRun으로 8080 포트 실행 확인
- frontend: npm run dev로 3000 포트 실행 확인
```

---

## ▶ Phase 1: 인증 시스템 (JWT)

```
CLAUDE.md와 docs/design.md를 참고하여 다음을 구현해줘.

### Phase 1: JWT 인증 시스템

**Backend**

1. auth 패키지 구현:
   - Entity: User (id, username, email, password, createdAt, updatedAt)
   - DTO: SignupRequest, LoginRequest, AuthResponse (token + user info), UserResponse
   - Repository: UserRepository (JPA)
   - Service: AuthService (signup, login, getUserById)
     - 비밀번호: BCryptPasswordEncoder
     - 중복 체크: username, email
   - Controller: AuthController
     - POST /api/v1/auth/signup → AuthResponse
     - POST /api/v1/auth/login → AuthResponse
     - GET /api/v1/auth/me → UserResponse (인증 필요)

2. JWT 설정:
   - config 패키지에 JwtTokenProvider 클래스
     - generateToken(userId): 토큰 생성
     - validateToken(token): 검증
     - getUserIdFromToken(token): 사용자 ID 추출
   - JwtAuthenticationFilter: OncePerRequestFilter 구현
     - Authorization: Bearer {token} 헤더에서 토큰 추출
     - 유효한 토큰이면 SecurityContext에 인증 정보 설정
   - SecurityConfig: SecurityFilterChain 설정
     - /api/v1/auth/** 는 permitAll
     - /api/v1/admin/** 는 인증 필요
     - /api/v1/progress/** 는 인증 필요
     - 나머지 /api/v1/** 는 permitAll (퀘스트, 맵 조회는 비인증도 가능)
     - H2 콘솔 접근 허용

3. 글로벌 예외 처리:
   - GlobalExceptionHandler (@RestControllerAdvice)
   - 중복 가입, 잘못된 로그인, JWT 만료 등 처리

**Frontend**

1. auth 관련 구현:
   - types/auth.ts: User, LoginRequest, SignupRequest, AuthResponse 타입
   - api/authApi.ts: signup, login, getMe API 호출 함수
   - store/authStore.ts: Zustand 스토어
     - user, token 상태
     - login, signup, logout 액션
     - token은 localStorage에도 저장
   - api/axiosInstance.ts: Axios 인스턴스
     - baseURL: '/api/v1'
     - request interceptor: Authorization 헤더에 token 추가
     - response interceptor: 401 시 logout 처리

2. 페이지:
   - LoginPage.tsx: 이메일 + 비밀번호 입력 폼, 회원가입 링크
   - SignupPage.tsx: 유저명 + 이메일 + 비밀번호 입력 폼
   - 로그인 성공 시 / (대시보드)로 리다이렉트
   - Header 컴포넌트에 로그인 상태에 따라 유저명 표시 / 로그인 버튼 전환

3. ProtectedRoute 컴포넌트:
   - 인증되지 않은 사용자는 /login으로 리다이렉트

모든 구현 후 로그인/회원가입 플로우가 정상 동작하는지 확인해줘.
```

---

## ▶ Phase 2: 데이터 동기화 (tarkov.dev API)

```
CLAUDE.md와 docs/design.md를 참고하여 다음을 구현해줘.

### Phase 2: tarkov.dev API 데이터 동기화

**Backend**

1. Entity 생성 (design.md의 DB 스키마 참고):
   - Trader, Map, MapFloor, Quest, QuestPrerequisite, QuestObjective,
     Item, QuestObjectiveItem, SyncHistory
   - 각 Entity에 @Getter, @Builder, @NoArgsConstructor, @AllArgsConstructor 적용
   - Map ↔ MapFloor: OneToMany
   - Quest ↔ Trader: ManyToOne
   - Quest ↔ QuestObjective: OneToMany (cascade)
   - QuestObjective ↔ QuestObjectiveItem: OneToMany (cascade)

2. Repository 생성:
   - 각 Entity에 대한 JpaRepository 인터페이스
   - QuestRepository: findByTraderId, findByMapId, findByKappaRequired 등 쿼리 메소드

3. sync 패키지 구현:
   - TarkovApiClient:
     - Spring WebClient를 사용하여 tarkov.dev GraphQL API 호출
     - design.md의 GraphQL 쿼리 사용
     - 응답을 파싱할 DTO 클래스들 (TarkovTaskResponse, TarkovMapResponse 등)
   - DataSyncService:
     - syncAll(): 전체 동기화 (맵 → 딜러 → 아이템 → 퀘스트 순서)
     - syncMaps(): 맵 + 층 정보 동기화
     - syncTasks(): 퀘스트 + 목표 + 아이템 동기화
     - 이미 존재하는 데이터는 업데이트, 새 데이터는 삽입 (upsert 패턴)
     - SyncHistory에 동기화 결과 기록
   - DataSyncScheduler:
     - @Scheduled: 24시간 주기로 syncAll() 실행
     - 애플리케이션 시작 시 데이터가 비어있으면 자동 동기화 실행
   - SyncController:
     - POST /api/v1/admin/sync → 수동 동기화 트리거 (인증 필요)
     - GET /api/v1/admin/sync/history → 동기화 이력

4. 맵 메타데이터:
   - TarkovTracker/tarkovdata의 maps.json 데이터를 기반으로
     src/main/resources/data/maps-metadata.json 파일 생성
   - 각 맵의 floors, defaultFloor, coordinateRotation, bounds 정보 포함
   - DataSyncService에서 맵 동기화 시 이 메타데이터도 함께 반영

구현 후:
- 서버를 시작하고 H2 콘솔(http://localhost:8080/h2-console)에서
  퀘스트, 아이템, 맵 데이터가 정상적으로 저장되었는지 확인
- POST /api/v1/admin/sync를 호출하여 수동 동기화도 테스트
```

---

## ▶ Phase 3: 퀘스트 트래킹 기능

```
CLAUDE.md와 docs/design.md를 참고하여 다음을 구현해줘.

### Phase 3: 퀘스트 트래킹

**Backend**

1. quest 패키지:
   - DTO: QuestListItem, QuestDetail, QuestObjectiveDto, QuestItemDto 등
     (design.md의 DTO 구조 참고)
   - QuestService:
     - getQuests(trader, kappa, map, search): 필터링된 퀘스트 목록
     - getQuestDetail(id, userId): 퀘스트 상세 (인증된 경우 진행 상태 포함)
     - getQuestsByMap(mapId, floor): 맵별 퀘스트 마커 목록
   - QuestController:
     - GET /api/v1/quests → QuestListItem[]
     - GET /api/v1/quests/{id} → QuestDetail
     - GET /api/v1/quests/map/{mapId} → QuestMapMarker[]
   - 인증된 요청이면 userStatus, userCollectedCount 포함, 아니면 null

2. progress 패키지:
   - Entity: UserQuestProgress, UserItemProgress (design.md 참고)
   - DTO: ProgressSummary, QuestProgressDto, ItemProgressDto
   - ProgressService:
     - getSummary(userId): 진행률 요약 (전체, 카파, 딜러별, 맵별)
     - getFullProgress(userId): 전체 퀘스트/아이템 진행 상태
     - updateQuestStatus(userId, questId, status): 퀘스트 상태 변경
     - updateItemProgress(userId, objectiveId, count): 아이템 수집 수량 변경
   - ProgressController:
     - GET /api/v1/progress → UserProgress
     - GET /api/v1/progress/summary → ProgressSummary
     - PUT /api/v1/progress/quest/{questId} → QuestProgress
     - PUT /api/v1/progress/item/{objectiveId} → ItemProgress

**Frontend**

1. types/quest.ts, types/progress.ts: 타입 정의

2. api/questApi.ts, api/progressApi.ts: API 호출 함수

3. store/questStore.ts, store/progressStore.ts: Zustand 스토어

4. 퀘스트 목록 페이지 (QuestListPage.tsx):
   - 상단: 필터 바 (딜러 드롭다운, 카파 토글, 맵 드롭다운, 검색창)
   - 필터 결과 카운트 표시
   - 퀘스트 카드 그리드/리스트 뷰
   - 각 카드: 퀘스트명, 딜러 아이콘, 맵, 레벨, 카파 뱃지, 상태 뱃지
   - 로그인 시: 체크박스로 상태 변경 가능
   - 카드 클릭 → /quests/:id로 이동

5. 퀘스트 상세 페이지 (QuestDetailPage.tsx):
   - 퀘스트 기본 정보 (이름, 딜러, 맵, 레벨, 경험치)
   - 목표 리스트 (타입별 아이콘, 설명, 맵 표시)
   - 필요 아이템 체크리스트 (아이콘, 이름, 수량, FIR 마크, 수집 카운터)
   - 선행/후속 퀘스트 링크
   - 위키 링크 (외부)
   - 맵에서 보기 버튼 → /map/:mapName으로 이동 (해당 퀘스트 하이라이트)

6. 대시보드 페이지 (DashboardPage.tsx):
   - 전체 진행률 프로그레스 바
   - 카파 퀘스트 진행률
   - 딜러별 진행률 카드
   - 맵별 진행률 카드
   - 비로그인 시: "로그인하면 진행 상태를 추적할 수 있습니다" 안내

다크 모드 테마를 일관되게 유지해줘:
- 배경: #1a1a2e (메인), #16213e (카드), #0f3460 (강조 영역)
- 텍스트: #e0e0e0 (기본), #ffffff (강조)
- 강조색: #e6b800 (골드 — 카파), #4ecca3 (완료), #e74c3c (미완료)
```

---

## ▶ Phase 4: 인터랙티브 맵

```
CLAUDE.md와 docs/design.md를 참고하여 다음을 구현해줘.

### Phase 4: 인터랙티브 맵 (층별 분리 포함)

**Backend**

1. map 패키지:
   - DTO: MapListItem, MapDetail (floors 포함)
   - MapService:
     - getMaps(): 전체 맵 목록
     - getMapDetail(normalizedName): 맵 상세 + 층 정보
   - MapController:
     - GET /api/v1/maps → MapListItem[]
     - GET /api/v1/maps/{normalizedName} → MapDetail

**Frontend**

1. SVG 맵 파일 준비:
   - TarkovTracker/tarkovdata 레포에서 SVG 맵 파일들을 public/maps/ 에 배치
   - 최소한 Customs, Interchange, Reserve, Woods 4개 맵 우선 (개발용)
   - SVG 파일이 없으면 placeholder 이미지로 대체

2. store/mapStore.ts: Zustand 스토어 (design.md 참고)

3. 맵 선택 페이지 (MapSelectPage.tsx):
   - 맵 카드 그리드 (맵 이미지 썸네일, 이름, 퀘스트 수)
   - 카드 클릭 → /map/:normalizedName

4. 인터랙티브 맵 페이지 (MapViewPage.tsx):
   - **맵 렌더링 (MapContainer.tsx)**:
     - Leaflet CRS.Simple 사용
     - SVG 맵을 Leaflet ImageOverlay 또는 SVGOverlay로 렌더링
     - bounds 설정 (maps-metadata.json 참고)
     - 줌인/줌아웃, 드래그 이동 지원
     - 맵 전체가 보이도록 초기 줌 레벨 설정

   - **층 선택기 (FloorSelector.tsx)**:
     - 맵에 floors 배열이 있는 경우에만 표시
     - 탭 버튼 형태: [Ground] [1F] [2F]
     - 선택된 층 강조 표시
     - 층 전환 시:
       a. SVG 내부 해당 층 그룹만 표시 (다른 층 숨김)
       b. 퀘스트 마커도 해당 층 것만 필터링

   - **퀘스트 마커 (QuestMarker.tsx)**:
     - 마커 아이콘: 딜러별 색상 구분
     - 카파 퀘스트: 골드 테두리
     - 완료된 퀘스트: 반투명 처리 (토글로 숨기기 가능)
     - floorId가 null인 마커: 모든 층에서 표시
     - floorId가 있는 마커: 해당 층에서만 표시

   - **마커 팝업 (MarkerPopup.tsx)**:
     - 퀘스트명 + 딜러명
     - 목표 설명
     - 필요 아이템 목록 (아이콘, 이름, 수량, FIR 뱃지)
     - 로그인 시: 수집 카운터 조절 가능
     - "퀘스트 상세 보기" 링크

   - **컨트롤 패널**:
     - 맵 선택 드롭다운 (다른 맵으로 빠른 전환)
     - "완료된 퀘스트 숨기기" 토글
     - 카파 퀘스트만 보기 토글
     - 딜러별 필터 체크박스

구현 시 주의사항:
- SVG 파일이 없는 맵은 "준비 중" placeholder 표시
- 좌표가 없는 퀘스트 목표는 맵에 표시하지 않음
- 모바일에서도 기본적인 터치 줌/드래그 동작 확인
```

---

## ▶ Phase 5: 통합 및 마무리

```
CLAUDE.md와 docs/design.md를 참고하여 다음을 구현해줘.

### Phase 5: 통합 및 마무리

1. **크로스 기능 연결**:
   - 퀘스트 상세 → "맵에서 보기" 클릭 시 해당 맵 + 해당 마커 하이라이트
   - 맵 팝업 → "퀘스트 상세" 클릭 시 퀘스트 상세 페이지 이동
   - 대시보드 → 딜러/맵 카드 클릭 시 해당 필터가 적용된 퀘스트 목록으로 이동
   - Sidebar에 실제 맵 목록, 딜러 목록 API 데이터 연결

2. **UX 개선**:
   - 로딩 스피너/스켈레톤 UI (데이터 로딩 중)
   - Empty state (필터 결과 없을 때, 데이터 미동기화 시)
   - 에러 상태 표시 (API 실패, 네트워크 에러)
   - 토스트 알림 (퀘스트 상태 변경, 로그인/로그아웃)
   - 퀘스트 목록 페이지네이션 또는 무한 스크롤

3. **반응형 디자인**:
   - 모바일 (< 768px): Sidebar를 햄버거 메뉴로 전환
   - 태블릿 (768~1024px): Sidebar 축소 모드
   - 데스크탑 (> 1024px): 풀 레이아웃

4. **성능 최적화**:
   - 퀘스트 목록: React.memo로 불필요한 리렌더링 방지
   - 맵 마커: useMemo로 필터링 결과 캐싱
   - 이미지 lazy loading
   - API 응답 캐싱 (stale-while-revalidate 패턴)

5. **코드 정리**:
   - 미사용 import, 변수 제거
   - TypeScript strict 모드에서 에러 없는지 확인
   - backend: 불필요한 로그 제거, 프로덕션 프로파일 정리

전체 앱이 다음 시나리오로 동작하는지 E2E로 확인해줘:
1. 회원가입 → 로그인
2. 대시보드에서 진행률 확인 (초기 0%)
3. 퀘스트 목록에서 "Prapor" 딜러로 필터링
4. 첫 번째 퀘스트를 "진행 중"으로 변경
5. 퀘스트 상세에서 필요 아이템 수집 카운터 조절
6. "맵에서 보기" 클릭 → 맵에서 해당 마커 확인
7. 맵에서 층 전환 (Interchange인 경우)
8. 대시보드 돌아와서 진행률 변경 확인
```

---

## 📋 Phase 실행 순서 요약

| 순서 | Phase | 예상 시간 | 핵심 산출물 |
|------|-------|----------|------------|
| 1 | Phase 0: 초기화 | 30분~1시간 | 빌드 가능한 빈 프로젝트 |
| 2 | Phase 1: 인증 | 1~2시간 | JWT 로그인/회원가입 동작 |
| 3 | Phase 2: 데이터 동기화 | 2~3시간 | DB에 퀘스트/아이템/맵 데이터 적재 |
| 4 | Phase 3: 퀘스트 트래킹 | 3~4시간 | 퀘스트 목록/상세/진행 추적 |
| 5 | Phase 4: 맵 | 3~4시간 | 인터랙티브 맵 + 층별 마커 |
| 6 | Phase 5: 통합 | 2~3시간 | 전체 연결 + UX 완성 |

---

## ⚠️ Claude Code 사용 팁

1. **각 Phase 시작 전**: "CLAUDE.md와 docs/design.md를 읽어줘"라고 먼저 요청
2. **Phase 완료 후**: 반드시 빌드 + 실행 테스트 확인 후 다음 Phase로
3. **에러 발생 시**: 에러 메시지를 그대로 붙여넣고 "이 에러를 수정해줘"
4. **수정 요청**: "Phase 3의 퀘스트 카드 디자인을 변경하고 싶어. ~~로 바꿔줘"
5. **추가 기능**: Phase 5 이후에 새 기능을 요청할 때는 기존 구조와 컨벤션을 설명

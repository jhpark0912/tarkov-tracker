# Phase 0: 프로젝트 초기화 + 샘플 페이지 구현 계획

## Context
Tarkov Quest Helper 프로젝트의 초기 구조를 세팅하고, 디자인 확정 전에 **모든 페이지의 샘플**을 먼저 보여준다.
각 샘플 페이지는 Debug 오버레이 토글 버튼을 통해 컴포넌트의 태그/ID/클래스명을 시각적으로 확인할 수 있어,
사용자가 "이 부분을 수정해줘"라고 특정 요소를 지정할 수 있도록 한다.

---

## 1. Backend 초기화

### 1-1. Gradle 프로젝트 생성 (`backend/`)
- Spring Boot 3.x + Java 17 + Gradle
- 의존성: Spring Web, Spring Data JPA, Spring Security, H2, Lombok, Validation, WebFlux (WebClient), jjwt
- 패키지 루트: `com.tarkov.helper`

### 1-2. 확장 가능한 패키지 구조
```
com.tarkov.helper/
├── TarkovHelperApplication.java
├── global/                    # 공통/글로벌 (확장 대비)
│   ├── config/                # SecurityConfig, CorsConfig, WebClientConfig, SchedulerConfig
│   ├── exception/             # GlobalExceptionHandler, 커스텀 예외
│   ├── common/                # 공통 유틸, BaseEntity (createdAt, updatedAt)
│   └── auth/                  # JWT 관련 (JwtTokenProvider, JwtAuthFilter)
├── domain/                    # 비즈니스 도메인
│   ├── auth/                  # 사용자 인증
│   │   ├── controller/
│   │   ├── service/
│   │   ├── repository/
│   │   ├── entity/
│   │   └── dto/
│   ├── quest/                 # 퀘스트
│   ├── item/                  # 아이템
│   ├── map/                   # 맵
│   ├── progress/              # 사용자 진행 상태
│   └── trader/                # 딜러 (독립 도메인으로 분리)
├── sync/                      # 외부 API 동기화
│   ├── client/                # TarkovApiClient
│   ├── service/               # DataSyncService
│   ├── scheduler/             # DataSyncScheduler
│   ├── dto/                   # API 응답 DTO
│   └── controller/            # SyncController (admin)
└── api/                       # (향후) 프론트엔드 전용 API 컨트롤러 계층
```

> **design.md와의 차이**: design.md의 flat 패키지 구조(auth/, quest/ 등)를 `global/` + `domain/` + `sync/`로 계층화.
> 각 도메인 내부에 controller/service/repository/entity/dto 서브패키지 추가.
> `trader/`를 독립 도메인으로 분리 (design.md에서는 quest 안에 포함).

### 1-3. 기본 설정 파일
- `application.yml`: design.md 섹션 7 기준
- CORS: localhost:3000 허용
- H2 콘솔 활성화

### 1-4. Phase 0에서의 Backend 코드
- `TarkovHelperApplication.java` (메인 클래스)
- `global/config/SecurityConfig.java` (기본 보안 설정, 모든 경로 permitAll)
- `global/config/CorsConfig.java` (CORS 설정)
- 각 도메인 패키지에 빈 `package-info.java` 생성 (구조 확인용)

---

## 2. Frontend 초기화

### 2-1. Vite + React + TypeScript 프로젝트 (`frontend/`)
- 패키지: react-router-dom, axios, zustand, tailwindcss, postcss, autoprefixer, leaflet, react-leaflet, @types/leaflet
- Tailwind CSS: 다크 모드 class 전략
- vite.config.ts: /api 프록시 → localhost:8080

### 2-2. 프론트엔드 디렉토리 구조
```
frontend/src/
├── main.tsx
├── App.tsx                    # 라우팅 설정
├── api/                       # (빈 구조)
│   └── axiosInstance.ts       # 기본 Axios 인스턴스
├── components/                # 공용 컴포넌트
│   ├── layout/
│   │   ├── Layout.tsx         # id="app-layout"
│   │   ├── Header.tsx         # id="app-header"
│   │   └── Sidebar.tsx        # id="app-sidebar"
│   ├── ProtectedRoute.tsx
│   └── debug/
│       ├── DebugProvider.tsx   # Debug 모드 Context
│       ├── DebugToggle.tsx     # 토글 버튼 (화면 우하단 고정)
│       └── DebugOverlay.tsx    # 컴포넌트 래퍼 (태그/ID 표시)
├── features/
│   ├── dashboard/
│   │   └── DashboardPage.tsx
│   ├── quests/
│   │   ├── QuestListPage.tsx
│   │   └── QuestDetailPage.tsx
│   ├── map/
│   │   ├── MapSelectPage.tsx
│   │   └── MapViewPage.tsx
│   └── auth/
│       ├── LoginPage.tsx
│       └── SignupPage.tsx
├── hooks/
├── store/
├── types/
└── utils/
```

---

## 3. Debug 오버레이 시스템

### 핵심 컴포넌트

**DebugProvider.tsx**
- React Context로 debug 모드 on/off 상태 관리
- `useDebug()` 훅 제공

**DebugToggle.tsx**
- 화면 우하단 고정 버튼: `[🔍 Debug]`
- 클릭 시 debug 모드 토글
- 활성화 시 버튼 색상 변경 (골드)

**DebugOverlay.tsx**
- 래퍼 컴포넌트. 사용법:
```tsx
<DebugOverlay id="quest-card" tag="section" label="QuestCard">
  <div>퀘스트 카드 내용</div>
</DebugOverlay>
```
- Debug 모드 OFF: children만 렌더링 (성능 영향 없음)
- Debug 모드 ON: 컴포넌트 주변에 점선 테두리 + 좌상단에 투명 라벨 표시
  - 라벨 내용: `tag#id .className` (예: `section#quest-card .QuestCard`)
  - 라벨 색상: 컴포넌트 유형별 구분 (layout=파랑, feature=초록, component=노랑)

### 적용 방식
- 모든 주요 컴포넌트(Layout, Header, Sidebar, 각 Page, 주요 섹션)에 DebugOverlay 적용
- 중첩 가능: Layout 안에 Header, Sidebar 각각 별도 오버레이

---

## 4. 샘플 페이지 구성

모든 페이지는 **placeholder 데이터**로 구성. API 연동 없이 하드코딩된 샘플 데이터 사용.

### 4-1. Layout (Header + Sidebar + Content)
- **Header** (`id="app-header"`): 로고 "Tarkov Quest Helper", 우측 로그인 버튼 placeholder
- **Sidebar** (`id="app-sidebar"`): 맵 목록(Customs, Interchange, Reserve, Woods), 딜러 목록(Prapor, Therapist, Skier, Peacekeeper) 하드코딩
- **Content** (`id="app-content"`): 라우트별 페이지 렌더링 영역

### 4-2. DashboardPage (`id="dashboard-page"`)
- 전체 진행률 프로그레스 바 (`id="progress-total"`)
- 카파 퀘스트 진행률 (`id="progress-kappa"`)
- 딜러별 진행률 카드 그리드 (`id="progress-by-trader"`)
- 맵별 진행률 카드 그리드 (`id="progress-by-map"`)
- 샘플 데이터: 총 200퀘스트 중 45 완료 (22.5%)

### 4-3. QuestListPage (`id="quest-list-page"`)
- 필터 바 (`id="quest-filter"`): 딜러 드롭다운, 카파 토글, 맵 드롭다운, 검색창
- 퀘스트 카드 그리드 (`id="quest-grid"`)
- 각 퀘스트 카드 (`class="quest-card"`): 퀘스트명, 딜러 아이콘, 맵, 레벨, 카파 뱃지, 상태 뱃지
- 샘플 데이터: 3~5개 퀘스트 하드코딩

### 4-4. QuestDetailPage (`id="quest-detail-page"`)
- 퀘스트 기본 정보 (`id="quest-info"`)
- 목표 리스트 (`id="quest-objectives"`)
- 필요 아이템 체크리스트 (`id="quest-items"`)
- 선행 퀘스트 (`id="quest-prerequisites"`)
- 위키 링크, 맵에서 보기 버튼
- 샘플 데이터: "Debut" 퀘스트 기준

### 4-5. MapSelectPage (`id="map-select-page"`)
- 맵 카드 그리드 (`id="map-grid"`)
- 각 맵 카드 (`class="map-card"`): 맵 이름, 퀘스트 수 placeholder

### 4-6. MapViewPage (`id="map-view-page"`)
- Leaflet 맵 영역 (`id="map-container"`): placeholder 이미지 or 빈 Leaflet 맵
- 층 선택기 (`id="floor-selector"`): [Ground] [1F] [2F] 탭 버튼
- 컨트롤 패널 (`id="map-controls"`): 맵 드롭다운, 완료 숨기기 토글, 카파 필터
- 마커 placeholder 몇 개

### 4-7. LoginPage (`id="login-page"`)
- 이메일 입력 (`id="login-email"`)
- 비밀번호 입력 (`id="login-password"`)
- 로그인 버튼 (`id="login-submit"`)
- 회원가입 링크

### 4-8. SignupPage (`id="signup-page"`)
- 유저명 입력 (`id="signup-username"`)
- 이메일 입력 (`id="signup-email"`)
- 비밀번호 입력 (`id="signup-password"`)
- 가입 버튼 (`id="signup-submit"`)

---

## 5. 라우팅

```
/                       → DashboardPage
/login                  → LoginPage
/signup                 → SignupPage
/quests                 → QuestListPage
/quests/:id             → QuestDetailPage
/map                    → MapSelectPage
/map/:normalizedName    → MapViewPage
```

---

## 6. 구현 순서

1. **Backend 초기화**: Gradle 프로젝트 생성, 패키지 구조, 기본 설정, SecurityConfig, CorsConfig
2. **Frontend 초기화**: Vite 프로젝트 생성, 패키지 설치, Tailwind 설정, 디렉토리 구조
3. **Debug 오버레이 시스템**: DebugProvider, DebugToggle, DebugOverlay 구현
4. **Layout 구현**: Header, Sidebar, Layout (DebugOverlay 적용)
5. **각 샘플 페이지 구현**: Dashboard → QuestList → QuestDetail → MapSelect → MapView → Login → Signup
6. **라우팅 연결**: App.tsx에서 모든 라우트 설정

---

## 7. 검증

- `backend/`: `./gradlew bootRun`으로 8080 포트 실행 확인
- `frontend/`: `npm run dev`로 3000 포트 실행 확인
- 모든 라우트 접근 가능 확인
- Debug 토글 버튼 클릭 시 오버레이 표시/숨김 동작 확인
- 각 페이지에서 Debug 모드 ON 시 컴포넌트 ID/태그/클래스 라벨 표시 확인

# Phase 0.5: UI 개선 — 맵 드롭다운, 퀘스트 트리뷰, 색상 개선, 층 전환 UX

## Context
Phase 0 샘플 페이지 구현 및 디자인 리디자인이 완료된 상태. 사용자가 4가지 UI 개선 사항을 요청:
1. 사이드바 맵 선택을 드롭다운/아코디언 형태로 변경
2. 퀘스트를 노드 구조(선행→후행 관계)로 보여주는 트리뷰 추가
3. 전체적으로 너무 어두운 색상 개선 + 상태 색상 구분 강화
4. 맵 층 전환을 버튼 대신 Shift+Wheel로 변경

## 구현 순서

### Step 1: 색상 개선 (기반 작업, 먼저 수행)

**파일**: `frontend/src/index.css`

`@theme` 블록의 색상 토큰 업데이트:

| 토큰 | 기존 | 변경 | 이유 |
|------|------|------|------|
| `--color-bg` | `#030712` | `#0a0f1a` | 밀리터리 블루 틴트, 약간 밝게 |
| `--color-surface` | `#111827` | `#131c2e` | 카드 배경 대비 향상 |
| `--color-surface-alt` | `#1f2937` | `#1c2840` | 블루 톤 통일 |
| `--color-elevated` | `#374151` | `#2a3a54` | 블루 계열로 조정 |
| `--color-complete` | `#4ade80` | `#34d399` | 틸-그린으로 프로그레스 블루와 구분 강화 |
| `--color-progress` | `#60a5fa` | `#38bdf8` | 더 밝은 스카이블루 |
| `--color-incomplete` | `#f87171` | `#fb7185` | 따뜻한 로즈톤 |
| `--color-text` | `#ffffff` | `#f0f2f5` | 약간 따뜻한 화이트 |
| `--color-text-secondary` | `#9ca3af` | `#94a3b8` | 밝기 향상 |
| `--color-text-muted` | `#6b7280` | `#64748b` | 밝기 향상 |

추가 토큰:
- `--color-border: rgba(255, 255, 255, 0.06)` — 카드 테두리용

추가 CSS:
- 슬라이드 인 애니메이션 (사이드바 플라이아웃용)
- 페이드 인/아웃 애니메이션 (층 전환 토스트용)

**카드 테두리 적용** — 모든 `bg-surface rounded-2xl` 요소에 `border border-border` 추가:
- `frontend/src/features/dashboard/DashboardPage.tsx` — StatCard, 트레이더/맵 프로그레스 카드
- `frontend/src/features/quests/QuestListPage.tsx` — 필터 바, 퀘스트 그리드
- `frontend/src/features/quests/QuestDetailPage.tsx` — 헤더, 목표, 아이템, 선행퀘스트 카드
- `frontend/src/features/map/MapViewPage.tsx` — 컨트롤, 맵 컨테이너
- `frontend/src/features/map/MapSelectPage.tsx` — 맵 카드
- `frontend/src/features/auth/LoginPage.tsx`, `SignupPage.tsx` — 폼 카드

**하드코딩된 색상 수정**:
- `DashboardPage.tsx` SVG 원형차트: `stroke="#1f2937"` → `stroke="var(--color-surface-alt)"`, `stroke="#4ade80"` → `stroke="var(--color-complete)"`
- `DebugToggle.tsx` 하드코딩 HEX → 새 색상 매칭

---

### Step 2: 사이드바 맵 플라이아웃 패널

**파일**: `frontend/src/components/layout/Sidebar.tsx`

현재 상태: 4개 맵 바로가기 (Customs, Interchange, Woods, Reserve) 하드코딩

변경 내용:
- `navItems`에서 Maps 항목 제거, 별도 Maps 토글 버튼으로 분리
- 맵 바로가기 4개 삭제 → 전체 10개 맵 목록의 **플라이아웃 패널** 추가
- Maps 아이콘 클릭 시 사이드바 오른쪽으로 w-52 패널이 슬라이드 인
- 패널 외부 클릭 또는 ESC로 닫힘
- 현재 맵 경로와 일치하는 항목에 `bg-gold/20 text-gold` 하이라이트

구조:
```
[Sidebar w-16] [Flyout w-52 (조건부)]
               ├─ "Maps" 헤더 + 닫기 버튼
               ├─ Customs
               ├─ Interchange
               ├─ Reserve
               ├─ Woods
               ├─ Shoreline
               ├─ Factory
               ├─ The Lab
               ├─ Lighthouse
               ├─ Streets of Tarkov
               └─ Ground Zero
```

추가 import: `useState, useEffect, useRef` (React), `X, MapPin` (lucide-react)

---

### Step 3: 맵 층 전환 Shift+Wheel

**파일**: `frontend/src/features/map/MapViewPage.tsx`

현재 상태: 좌측 수직 버튼으로 Basement/Ground/1F/2F 전환

변경 내용:
- 수직 층 선택 버튼 블록 (`<DebugOverlay id="floor-selector">`) 전체 제거
- `mapContainerRef`에 `wheel` 이벤트 리스너 추가 (`{ passive: false }`)
- `e.shiftKey` 체크 → `deltaY < 0`: 위층, `deltaY > 0`: 아래층
- 맵 컨테이너 좌상단에 **층 인디케이터 오버레이** 추가 (현재층 + 도트 표시)
- 층 변경 시 **토스트 알림** (1.5초 페이드 인/아웃)
- 좌하단에 "Shift + Scroll to change floors" 힌트 텍스트
- flex 레이아웃 단순화 (플로어 셀렉터 제거로 맵 컨테이너가 전체 너비 차지)

---

### Step 4: 퀘스트 트리뷰

**파일**: `frontend/src/features/quests/QuestListPage.tsx`

현재 상태: 플랫 테이블 형태의 퀘스트 목록

변경 내용:

**데이터 구조 확장**:
- `QuestNode` 인터페이스: 기존 필드 + `prerequisiteIds: string[]` + `status: 'LOCKED'` 추가
- 9개 샘플 퀘스트로 선행/후행 체인 구성 (Prapor 4체인, Therapist 2체인, Skier 1개, Jaeger 2체인)

**트리 구축 함수**: `buildQuestTree(quests)` → `Map<trader, TreeNode[]>`
- 루트 퀘스트(prerequisiteIds 비어있음) 찾기
- 재귀적으로 자식 노드 빌드
- 트레이더별 그룹핑

**새 컴포넌트**:
1. `QuestTreeNode` — 재귀 렌더링, depth별 들여쓰기(28px × depth), CSS 연결선
   - COMPLETED: 초록 체크 + 취소선
   - IN_PROGRESS: 파란 원형 인디케이터
   - NOT_STARTED: 회색 빈 상태
   - LOCKED: opacity-50 + 자물쇠 아이콘 + 클릭 불가
2. `TraderTreeSection` — 트레이더별 접이식 섹션 (이름 + 아이콘 + 펼침/접기)

**뷰 모드 토글**: 필터 바에 List/Tree 전환 버튼 추가
- `List` 아이콘: 기존 플랫 목록
- `GitBranch` 아이콘: 트리뷰

---

## 수정 대상 파일 요약

| 파일 | 변경 내용 |
|------|-----------|
| `frontend/src/index.css` | @theme 색상 토큰 업데이트, 애니메이션 추가 |
| `frontend/src/components/layout/Sidebar.tsx` | 맵 바로가기 → 플라이아웃 패널 |
| `frontend/src/features/map/MapViewPage.tsx` | 층 버튼 → Shift+Wheel + 토스트 |
| `frontend/src/features/quests/QuestListPage.tsx` | 트리뷰 모드 추가 |
| `frontend/src/features/dashboard/DashboardPage.tsx` | 카드 테두리 + SVG 색상 수정 |
| `frontend/src/features/quests/QuestDetailPage.tsx` | 카드 테두리 추가 |
| `frontend/src/features/map/MapSelectPage.tsx` | 카드 테두리 추가 |
| `frontend/src/features/auth/LoginPage.tsx` | 카드 테두리 추가 |
| `frontend/src/features/auth/SignupPage.tsx` | 카드 테두리 추가 |
| `frontend/src/components/debug/DebugToggle.tsx` | 하드코딩 색상 수정 |

## 추가 패키지

없음 — 기존 설치된 Radix UI + lucide-react로 모두 구현 가능

## 검증

1. `npm run build` 성공 확인
2. Playwright로 각 페이지 스크린샷:
   - 대시보드: 색상 개선 + 카드 테두리 확인
   - 사이드바: Maps 아이콘 클릭 → 플라이아웃 패널 열림 확인
   - 퀘스트 목록: 트리뷰 전환 + 잠금 상태 표시 확인
   - 맵뷰: 층 인디케이터 + 힌트 텍스트 표시 확인
3. Debug 모드 토글 정상 동작 확인

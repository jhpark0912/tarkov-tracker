# 메인 스토리 퀘스트 설계

## 개요

타르코프 1.0 정식 출시로 추가된 **메인 스토리 퀘스트** 시스템.
기존 딜러 퀘스트와 **완전 별개**이며, 분기형 진행 + 4개 엔딩 구조를 가진다.

## 기존 퀘스트와의 차이

| | 기존 딜러 퀘스트 | 메인 스토리 퀘스트 |
|---|---|---|
| 구조 | 딜러별 독립 퀘스트 트리 | 9개 챕터 기반 연쇄 구조 |
| 진행 | 선형 (선행 퀘스트 충족) | **분기형** (선택에 따라 경로 변경) |
| 결말 | 없음 | **4개 엔딩** |
| 데이터 소스 | tarkov.dev API `tasks` 쿼리 | **수동 JSON 관리** |
| DB 엔티티 | Quest, QuestObjective 등 | StoryChapter, StoryChoice 등 (별도) |
| 추적 수준 | 퀘스트·아이템 개별 추적 | **챕터 단위 완료 체크** |

## 9개 스토리 챕터

1. **Tour** — 타르코프 입문, 각 맵 순회하며 딜러 해금 (선형)
2. **Falling Skies** — 추락 비행기 조사, 블랙박스 회수 (선형)
3. **The Ticket** — 탈출 티켓 확보, Kerman 첫 접촉 (**첫 번째 분기점**)
4. **They Are Already Here** — 컬티스트 활동 조사 (Kerman 루트)
5. **Batya** — BEAR 전초기지 조사 (Prapor 루트)
6. **Blue Fire** — TerraGroup 연구시설 침투 (**두 번째 분기점**, Kerman 루트)
7. **The Labyrinth** — 지하 시설 탐험 (**두 번째 분기점**, Prapor 루트)
8. **Accidental Witness** — 터미널 최종 미션 (**엔딩 분기**)
9. **The Unheard** — 진실 외면의 대가 (**엔딩 분기**)

## 4개 엔딩

| 엔딩 | 이름 | 경로 | 설명 |
|------|------|------|------|
| Savior | 인류를 위한 탈출 | Kerman 신뢰 → 증거 공개 → Kerman에게 전달 | 최선의 결말. TerraGroup 진실 폭로 |
| Survivor | 생존자의 탈출 | Prapor 신뢰 → 5억 루블 지불 → Prapor에게 전달 | 생존했지만 파괴의 사슬 일부 |
| Debtor | 빚진 자 | 어느 루트든 → 망설임/거부 → 후회 | 진실에 거의 닿았지만 멈춤 |
| Fallen | 어둠 속으로 | 어느 루트든 → 망설임/거부 → 포기 | 최악의 결말 |

## 분기 구조 (플로우)

```
Tour (선형)
  ↓
Falling Skies (선형)
  ↓
The Ticket ──── [분기점 1] ────┐
  │                            │
  │ Kerman 신뢰                │ Prapor 신뢰
  ↓                            ↓
They Are Already Here        Batya
  ↓                            ↓
Blue Fire ── [분기점 2] ──   The Labyrinth ── [분기점 2] ──
  │              │              │                    │
  │ 증거 공개    │ 망설임       │ Prapor 지불       │ 거부
  ↓              ↓              ↓                    ↓
Accidental    The Unheard    Accidental           The Unheard
Witness                      Witness
  │                            │
  ├─ Kerman 전달 → Savior      ├─ 후회 → Debtor
  └─ Prapor 전달 → Survivor    └─ 포기 → Fallen
```

## 데이터 관리 방식

### 수동 JSON (확정)
- 스토리 챕터 메타데이터를 JSON 파일로 직접 관리
- 분기 선택지와 엔딩 매핑을 JSON에 정의
- tarkov.dev API에 의존하지 않음 (API에 스토리 퀘스트 구분 필드 미확인)

### JSON 구조 (예정)
```
backend/src/main/resources/data/story-chapters.json
```
또는 프론트엔드 전용이라면:
```
frontend/src/data/storyData.ts
```

### JSON 스키마 설계

```typescript
interface StoryChapter {
  id: string;            // "tour", "falling_skies" 등
  name: string;          // 챕터 표시명
  description: string;   // 챕터 설명
  maps: string[];        // 관련 맵 목록
  column: number;        // 플로우차트 X 위치
  row: number;           // 플로우차트 Y 위치
  nextChapterId?: string;     // 선형 진행 시 다음 챕터
  choices?: StoryChoice[];    // 분기점일 때 선택지
  endingId?: string;          // 엔딩으로 직접 연결될 때
}

interface StoryChoice {
  id: string;            // "trust_kerman", "trust_prapor" 등
  label: string;         // 선택지 표시명
  description: string;   // 선택지 설명
  nextChapterId: string; // 선택 시 다음 챕터/엔딩 ID
}

interface StoryEnding {
  id: string;            // "ending_savior" 등
  name: string;          // 엔딩 이름
  subtitle: string;      // 짧은 부제
  description: string;   // 엔딩 설명
  color: string;         // UI 색상 클래스
  column: number;
  row: number;
}
```

## UI 구현 방향 (확정)

### 플로우차트 기반 (SVG 커스텀)
- **프로토타입 완료**: `frontend/src/features/story/StoryFlowPage.tsx`
- 라우트: `/story`
- SVG foreignObject 기반 노드 렌더링
- 베지어 커브 엣지 (선형=실선, 분기=점선)
- 선택된 경로 하이라이트 (초록색)

### 레이아웃
- 좌측: 플로우차트 (스크롤 가능)
- 우측: 선택된 챕터 상세 패널 (관련 맵, 분기 선택지 표시)

### 노드 상태
| 상태 | 표시 | 색상 |
|------|------|------|
| locked | 잠김 (반투명) | 회색 |
| available | 진행 가능 | accent 파랑 |
| in_progress | 진행 중 | kappa 금색 |
| completed | 완료 | complete 초록 |

### 범례
- 실선: 선형 진행
- 점선 (금색): 분기 선택지
- 굵은 실선 (초록): 사용자가 선택한 경로

## 사용자 진행 추적

### 챕터 단위 완료 체크 (확정)
- 각 챕터의 완료 여부만 추적 (세부 목표 추적 없음)
- 분기점에서 어떤 선택을 했는지 기록 (엔딩 예측용)

### 데이터 모델 (Backend)
```java
// 기존 progress 도메인에 추가 또는 별도 story 도메인
UserStoryProgress {
  user: User
  chapterId: String      // "tour", "falling_skies" 등
  status: ChapterStatus  // LOCKED, AVAILABLE, IN_PROGRESS, COMPLETED
  choiceId: String       // 분기점에서의 선택 (nullable)
}
```

### 프론트엔드 스토어
```typescript
// store/storyStore.ts
interface StoryStore {
  progress: Record<string, { status: ChapterStatus; choiceId?: string }>;
  fetchProgress(): Promise<void>;
  updateChapterStatus(chapterId: string, status: ChapterStatus): Promise<void>;
  setChoice(chapterId: string, choiceId: string): Promise<void>;
}
```

## 구현 순서 (예정)

### Step 1 — 데이터 + 프론트엔드 기본
- [ ] 스토리 챕터 JSON 데이터 확정 (위키 기반 검증)
- [ ] StoryFlowPage 레이아웃 개선 (잘리는 노드 해결, 반응형)
- [ ] 사이드바에 "메인 스토리" 메뉴 추가

### Step 2 — Backend 도메인
- [ ] StoryChapter 데이터 로딩 (JSON → 메모리 or DB)
- [ ] UserStoryProgress 엔티티 + 리포지토리
- [ ] StoryService + StoryController API

### Step 3 — 프론트엔드 연동
- [ ] storyStore (Zustand)
- [ ] storyApi (REST 호출)
- [ ] 챕터 상태 변경 UI (완료 체크, 분기 선택)
- [ ] 엔딩 예측 표시

### Step 4 — 추가 개선
- [ ] 엔딩 달성 시 보상 표시
- [ ] 챕터별 가이드/팁 (위키 링크)
- [ ] 반응형 모바일 레이아웃

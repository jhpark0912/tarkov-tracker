# Tarkov Quest Helper — 기술 설계서

이 문서는 Claude Code에게 단계별로 전달하여 프로젝트를 구현하기 위한 설계서입니다.

---

## 1. 데이터베이스 스키마

### 1.1 인증

```sql
CREATE TABLE users (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    username    VARCHAR(50)  NOT NULL UNIQUE,
    email       VARCHAR(100) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,  -- BCrypt 해시
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 1.2 딜러 (Trader)

```sql
CREATE TABLE traders (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    api_id      VARCHAR(100) NOT NULL UNIQUE,  -- tarkov.dev API ID
    name        VARCHAR(50)  NOT NULL,
    name_ko     VARCHAR(50),                    -- 한국어명 (추후)
    image_url   VARCHAR(500),
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 1.3 맵 (Map)

```sql
CREATE TABLE maps (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    api_id              VARCHAR(100) NOT NULL UNIQUE,
    name                VARCHAR(50)  NOT NULL,
    normalized_name     VARCHAR(50)  NOT NULL UNIQUE,  -- URL용 (예: "customs")
    svg_file            VARCHAR(100),                   -- SVG 파일명
    default_floor       VARCHAR(50),                    -- 기본 층
    coordinate_rotation INT DEFAULT 0,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE map_floors (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    map_id      BIGINT NOT NULL REFERENCES maps(id),
    floor_id    VARCHAR(50) NOT NULL,   -- SVG 그룹 ID (예: "Ground_Level")
    floor_label VARCHAR(50) NOT NULL,   -- 표시명 (예: "1층")
    floor_order INT NOT NULL DEFAULT 0, -- 정렬 순서
    UNIQUE(map_id, floor_id)
);
```

### 1.4 퀘스트 (Quest/Task)

```sql
CREATE TABLE quests (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    api_id              VARCHAR(100) NOT NULL UNIQUE,
    name                VARCHAR(200) NOT NULL,
    trader_id           BIGINT REFERENCES traders(id),
    map_id              BIGINT REFERENCES maps(id),     -- 주요 진행 맵 (nullable)
    kappa_required      BOOLEAN DEFAULT FALSE,
    min_player_level    INT DEFAULT 1,
    wiki_link           VARCHAR(500),
    task_image_link     VARCHAR(500),
    experience          INT DEFAULT 0,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE quest_prerequisites (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    quest_id        BIGINT NOT NULL REFERENCES quests(id),
    prereq_quest_id BIGINT NOT NULL REFERENCES quests(id),
    UNIQUE(quest_id, prereq_quest_id)
);

CREATE TABLE quest_objectives (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    quest_id        BIGINT NOT NULL REFERENCES quests(id),
    api_id          VARCHAR(100) NOT NULL UNIQUE,
    type            VARCHAR(50)  NOT NULL,  -- "mark", "find", "collect", "kill", "visit", "extract", etc.
    description     VARCHAR(500) NOT NULL,
    map_id          BIGINT REFERENCES maps(id),
    floor_id        VARCHAR(50),            -- SVG 층 그룹 ID
    position_x      DOUBLE,                 -- 맵 위 X 좌표 (percentage)
    position_y      DOUBLE,                 -- 맵 위 Y 좌표 (percentage)
    optional        BOOLEAN DEFAULT FALSE
);
```

### 1.5 아이템 (Item)

```sql
CREATE TABLE items (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    api_id          VARCHAR(100) NOT NULL UNIQUE,
    name            VARCHAR(200) NOT NULL,
    short_name      VARCHAR(100),
    image_url       VARCHAR(500),
    icon_url        VARCHAR(500),
    wiki_link       VARCHAR(500),
    width           INT,
    height          INT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 퀘스트 목표에 필요한 아이템 (quest_objectives와 items의 관계)
CREATE TABLE quest_objective_items (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    objective_id    BIGINT NOT NULL REFERENCES quest_objectives(id),
    item_id         BIGINT NOT NULL REFERENCES items(id),
    count           INT NOT NULL DEFAULT 1,
    found_in_raid   BOOLEAN DEFAULT FALSE
);
```

### 1.6 사용자 진행 상태

```sql
-- 퀘스트 진행 상태
CREATE TABLE user_quest_progress (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT NOT NULL REFERENCES users(id),
    quest_id    BIGINT NOT NULL REFERENCES quests(id),
    status      VARCHAR(20) NOT NULL DEFAULT 'NOT_STARTED',  -- NOT_STARTED, IN_PROGRESS, COMPLETED
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, quest_id)
);

-- 아이템 수집 진행 상태
CREATE TABLE user_item_progress (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES users(id),
    objective_id    BIGINT NOT NULL REFERENCES quest_objectives(id),
    collected_count INT NOT NULL DEFAULT 0,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, objective_id)
);
```

### 1.7 데이터 동기화 이력

```sql
CREATE TABLE sync_history (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    sync_type   VARCHAR(50) NOT NULL,   -- "FULL", "QUESTS", "ITEMS", "MAPS"
    status      VARCHAR(20) NOT NULL,   -- "SUCCESS", "FAILED"
    item_count  INT DEFAULT 0,
    error_msg   TEXT,
    started_at  TIMESTAMP NOT NULL,
    completed_at TIMESTAMP
);
```

---

## 2. REST API 명세

### 2.1 인증 API

| Method | Endpoint | Request Body | Response | 설명 |
|--------|----------|-------------|----------|------|
| POST | `/api/v1/auth/signup` | `{ username, email, password }` | `{ token, user }` | 회원가입 |
| POST | `/api/v1/auth/login` | `{ email, password }` | `{ token, user }` | 로그인 |
| GET | `/api/v1/auth/me` | - | `{ id, username, email }` | 내 정보 (JWT 필요) |

### 2.2 퀘스트 API

| Method | Endpoint | Query Params | Response | 설명 |
|--------|----------|-------------|----------|------|
| GET | `/api/v1/quests` | `?trader=prapor&kappa=true&map=customs` | `Quest[]` | 퀘스트 목록 (필터) |
| GET | `/api/v1/quests/{id}` | - | `QuestDetail` | 퀘스트 상세 (목표+아이템 포함) |
| GET | `/api/v1/quests/map/{mapId}` | `?floor=Ground_Level` | `QuestMapMarker[]` | 맵용 퀘스트 마커 목록 |

### 2.3 맵 API

| Method | Endpoint | Response | 설명 |
|--------|----------|----------|------|
| GET | `/api/v1/maps` | `Map[]` | 전체 맵 목록 |
| GET | `/api/v1/maps/{normalizedName}` | `MapDetail` | 맵 상세 (층 정보 포함) |

### 2.4 아이템 API

| Method | Endpoint | Query Params | Response | 설명 |
|--------|----------|-------------|----------|------|
| GET | `/api/v1/items` | `?search=keyword` | `Item[]` | 아이템 검색 |
| GET | `/api/v1/items/{id}` | - | `ItemDetail` | 아이템 상세 |

### 2.5 사용자 진행 상태 API (JWT 인증 필요)

| Method | Endpoint | Request Body | Response | 설명 |
|--------|----------|-------------|----------|------|
| GET | `/api/v1/progress` | - | `UserProgress` | 전체 진행 상태 |
| GET | `/api/v1/progress/summary` | - | `ProgressSummary` | 진행률 요약 (대시보드용) |
| PUT | `/api/v1/progress/quest/{questId}` | `{ status }` | `QuestProgress` | 퀘스트 상태 변경 |
| PUT | `/api/v1/progress/item/{objectiveId}` | `{ collectedCount }` | `ItemProgress` | 아이템 수집 수량 변경 |

### 2.6 동기화 API (관리용)

| Method | Endpoint | Response | 설명 |
|--------|----------|----------|------|
| POST | `/api/v1/admin/sync` | `SyncResult` | 수동 동기화 실행 |
| GET | `/api/v1/admin/sync/history` | `SyncHistory[]` | 동기화 이력 |

---

## 3. 주요 DTO 구조

### QuestListItem (목록용)
```json
{
  "id": 1,
  "name": "Debut",
  "trader": { "id": 1, "name": "Prapor", "imageUrl": "..." },
  "mapName": "Customs",
  "kappaRequired": true,
  "minPlayerLevel": 1,
  "objectiveCount": 3,
  "requiredItemCount": 2,
  "userStatus": "IN_PROGRESS"     // JWT 인증 시만 포함
}
```

### QuestDetail (상세용)
```json
{
  "id": 1,
  "name": "Debut",
  "trader": { "id": 1, "name": "Prapor", "imageUrl": "..." },
  "map": { "id": 1, "name": "Customs", "normalizedName": "customs" },
  "kappaRequired": true,
  "minPlayerLevel": 1,
  "wikiLink": "...",
  "experience": 4700,
  "objectives": [
    {
      "id": 1,
      "type": "kill",
      "description": "Eliminate 5 Scavs on Customs",
      "mapName": "Customs",
      "floorId": null,
      "positionX": 45.2,
      "positionY": 67.8,
      "optional": false,
      "requiredItems": [
        {
          "item": { "id": 1, "name": "Salewa", "shortName": "Salewa", "iconUrl": "..." },
          "count": 3,
          "foundInRaid": true
        }
      ],
      "userCollectedCount": 1   // JWT 인증 시만 포함
    }
  ],
  "prerequisites": [
    { "id": 2, "name": "Checking", "status": "COMPLETED" }
  ],
  "userStatus": "IN_PROGRESS"
}
```

### QuestMapMarker (맵 표시용)
```json
{
  "questId": 1,
  "questName": "Debut",
  "objectiveId": 1,
  "objectiveDescription": "Eliminate 5 Scavs on Customs",
  "objectiveType": "kill",
  "traderName": "Prapor",
  "floorId": "Ground_Level",
  "positionX": 45.2,
  "positionY": 67.8,
  "kappaRequired": true,
  "requiredItems": [
    { "itemName": "Salewa", "iconUrl": "...", "count": 3, "foundInRaid": true }
  ],
  "userQuestStatus": "IN_PROGRESS",
  "userCollectedCount": 1
}
```

### ProgressSummary (대시보드용)
```json
{
  "totalQuests": 200,
  "completedQuests": 45,
  "totalProgressPercent": 22.5,
  "kappaQuests": { "total": 150, "completed": 30, "percent": 20.0 },
  "byTrader": [
    { "traderName": "Prapor", "total": 25, "completed": 10, "percent": 40.0 }
  ],
  "byMap": [
    { "mapName": "Customs", "total": 30, "completed": 15, "percent": 50.0 }
  ]
}
```

---

## 4. tarkov.dev GraphQL 동기화 쿼리

### 퀘스트 + 목표 + 아이템 통합 쿼리
```graphql
query {
  tasks {
    id
    name
    kappaRequired
    minPlayerLevel
    wikiLink
    taskImageLink
    experience
    trader {
      id
      name
      imageLink
    }
    map {
      id
      name
      normalizedName
    }
    taskRequirements {
      task {
        id
      }
    }
    objectives {
      id
      type
      description
      optional
      maps {
        id
        normalizedName
      }
      ... on TaskObjectiveItem {
        item {
          id
          name
          shortName
          iconLink
          wikiLink
          width
          height
        }
        items {
          id
          name
          shortName
          iconLink
          wikiLink
          width
          height
        }
        count
        foundInRaid
      }
      ... on TaskObjectiveMark {
        markerItem {
          id
          name
          shortName
          iconLink
        }
      }
    }
  }
}
```

### 맵 쿼리
```graphql
query {
  maps {
    id
    name
    normalizedName
    wiki
    players
    raidDuration
    enemies
    bosses {
      name
      spawnLocations {
        name
      }
    }
  }
}
```

---

## 5. 프론트엔드 페이지 및 컴포넌트 구조

### 5.1 라우팅
```
/                       → 대시보드 (ProgressSummary)
/login                  → 로그인
/signup                 → 회원가입
/quests                 → 퀘스트 목록 (필터: 딜러, 카파, 맵)
/quests/:id             → 퀘스트 상세
/map                    → 맵 선택
/map/:normalizedName    → 인터랙티브 맵 (퀘스트 마커 + 층 전환)
```

### 5.2 핵심 컴포넌트

```
components/
├── Layout.tsx              # 전체 레이아웃 (Header + Sidebar + Content)
├── Header.tsx              # 상단 네비게이션
├── Sidebar.tsx             # 사이드바 (맵 목록, 딜러 목록)
├── ProtectedRoute.tsx      # JWT 인증 필요 라우트 래퍼
├── QuestCard.tsx           # 퀘스트 카드 (목록에서 사용)
├── QuestStatusBadge.tsx    # 상태 뱃지 (NOT_STARTED/IN_PROGRESS/COMPLETED)
├── ItemBadge.tsx           # 아이템 뱃지 (아이콘 + 이름 + 수량)
├── ProgressBar.tsx         # 진행률 바
└── FloorSelector.tsx       # 맵 층 선택기

features/
├── dashboard/
│   └── DashboardPage.tsx   # 진행률 요약, 딜러별/맵별 차트
├── quests/
│   ├── QuestListPage.tsx   # 퀘스트 목록 + 필터
│   ├── QuestDetailPage.tsx # 퀘스트 상세 + 목표 + 아이템
│   └── QuestFilter.tsx     # 필터 컴포넌트 (딜러, 카파, 맵)
├── map/
│   ├── MapSelectPage.tsx   # 맵 선택 그리드
│   ├── MapViewPage.tsx     # 인터랙티브 맵 메인
│   ├── MapContainer.tsx    # Leaflet 맵 래퍼
│   ├── QuestMarker.tsx     # 퀘스트 위치 마커
│   └── MarkerPopup.tsx     # 마커 클릭 팝업 (퀘스트+아이템 정보)
└── items/
    └── ItemChecklist.tsx   # 아이템 체크리스트 (퀘스트 상세 내)
```

### 5.3 인터랙티브 맵 구현 상세

**Leaflet.js + SVG 오버레이 방식**
1. Leaflet CRS.Simple (좌표계) 사용 — 실제 지도가 아닌 커스텀 이미지
2. SVG 맵 파일을 Leaflet SVG Overlay로 렌더링
3. 층 전환: SVG 내부 `<g>` 그룹의 display 속성 toggle
4. 퀘스트 마커: Leaflet Marker로 좌표에 배치, 현재 층과 일치하는 것만 표시
5. 마커 클릭 → Leaflet Popup으로 퀘스트 정보 + 필요 아이템 표시

**맵 좌표 매핑**
- tarkovdata의 gps.topPercent, gps.leftPercent를 SVG bounds에 맞춰 변환
- bounds: `[[y1, x1], [y2, x2]]` → Leaflet LatLngBounds로 매핑

**층 전환 로직**
```typescript
// 의사코드
const [currentFloor, setCurrentFloor] = useState(map.defaultFloor);

// SVG 층 전환
svgElement.querySelectorAll('[id]').forEach(group => {
  group.style.display = floors.includes(group.id)
    ? (group.id === currentFloor ? 'block' : 'none')
    : 'block'; // 층과 무관한 요소는 항상 표시
});

// 마커 필터링
const visibleMarkers = markers.filter(m =>
  m.floorId === null || m.floorId === currentFloor
);
```

---

## 6. Zustand Store 구조

```typescript
// auth store
interface AuthStore {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

// quest store
interface QuestStore {
  quests: QuestListItem[];
  filters: { trader?: string; kappa?: boolean; map?: string; search?: string };
  loading: boolean;
  fetchQuests: () => Promise<void>;
  setFilter: (filter: Partial<QuestStore['filters']>) => void;
}

// progress store
interface ProgressStore {
  summary: ProgressSummary | null;
  questProgress: Record<number, QuestStatus>;
  itemProgress: Record<number, number>;
  fetchSummary: () => Promise<void>;
  updateQuestStatus: (questId: number, status: QuestStatus) => Promise<void>;
  updateItemCount: (objectiveId: number, count: number) => Promise<void>;
}

// map store
interface MapStore {
  maps: MapInfo[];
  currentMap: MapDetail | null;
  currentFloor: string;
  markers: QuestMapMarker[];
  showCompleted: boolean;
  fetchMaps: () => Promise<void>;
  fetchMapDetail: (normalizedName: string) => Promise<void>;
  setFloor: (floorId: string) => void;
  toggleShowCompleted: () => void;
}
```

---

## 7. 개발 환경 설정

### Backend (application.yml)
```yaml
server:
  port: 8080

spring:
  datasource:
    url: jdbc:h2:file:./data/tarkov-helper
    driver-class-name: org.h2.Driver
    username: sa
    password:
  h2:
    console:
      enabled: true
      path: /h2-console
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
    properties:
      hibernate:
        format_sql: true

jwt:
  secret: tarkov-helper-jwt-secret-key-for-development-only-change-in-production
  expiration: 86400000  # 24시간

tarkov:
  api:
    url: https://api.tarkov.dev/graphql
  sync:
    cron: "0 0 */24 * * *"  # 24시간마다
    enabled: true

logging:
  level:
    com.tarkov.helper: DEBUG
```

### Frontend (vite.config.ts)
```typescript
export default defineConfig({
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  }
});
```

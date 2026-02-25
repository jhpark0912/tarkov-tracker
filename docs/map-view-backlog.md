# 맵 뷰 잔여 작업 목록

> 최종 업데이트: 2026-02-25
> Phase 3 맵 뷰 구현 이후 확인된 미해결 항목

---

## 1. Streets of Tarkov · The Lab 퀘스트 마커 미표시

### 현상
- `/map/streets-of-tarkov`, `/map/the-lab` 진입 시 우측 퀘스트 패널은 표시되지만 지도 마커가 0개
- 다른 맵(Customs, Woods 등)은 정상 표시

### 원인 분석

| 맵 | 원인 |
|---|---|
| Streets of Tarkov | tarkovdata `objective_gps.json`에 해당 맵 API ID(`5714dc692459777137212e12`) 항목 자체 없음 → 모든 objective의 `positionX/Y = null` |
| The Lab | 동일 원인 추정 (확인 필요). 또는 floorId 매핑 불일치 가능성 |

### 해결 방향
- **단기**: tarkovdata GPS 데이터 업데이트 대기. 현재는 패널에서만 확인 가능
- **장기**: 아래 항목 3번의 Fandom wiki JSON 방식으로 전환 시 자체 마커 좌표 확보 가능

---

## 2. 탈출 경로 · 보스 스폰 등 추가 맵 정보

### 현재 상태
- 현재 맵에는 **퀘스트 마커만** 표시됨
- 게임 공략에 실질적으로 필요한 정보 (탈출구, 보스, PMC/Scav 스폰, 열쇠 위치 등) 없음

### 추가 가능한 정보 소스

| 카테고리 | 데이터 소스 | 비고 |
|---|---|---|
| 탈출 경로 | tarkov.dev GraphQL `maps { extracts }` | API에 존재, 현재 미동기화 |
| 보스 스폰 | tarkov.dev GraphQL `maps { bosses { spawnLocations } }` | API에 존재, 현재 미동기화 |
| PMC/Scav 스폰 | Fandom wiki 인터랙티브 맵 JSON (`spawn_pmc`, `spawn_scav` 카테고리) | Labyrinth_sample 파일 구조 참고 |
| 자물쇠 문/열쇠 | Fandom wiki 인터랙티브 맵 JSON (`locked`, `loot_key` 카테고리) | 위와 동일 |
| 루스 루트 | Fandom wiki 인터랙티브 맵 JSON (`loot_loose` 등) | 위와 동일 |

### 구현 방향 (tarkov.dev API 활용)
1. `DataSyncService`에 탈출구 · 보스 동기화 추가
2. `map_extracts`, `map_boss_spawns` 테이블 설계
3. 맵 뷰에서 카테고리별 토글 (탈출구 ON/OFF, 보스 ON/OFF 등)
4. tarkov.dev GraphQL 쿼리 추가:
```graphql
maps {
  id
  normalizedName
  extracts {
    id
    name
    faction
    position { x y z }
  }
  bosses {
    name
    spawnChance
    spawnLocations { name chance }
  }
}
```

---

## 3. Fandom Wiki 인터랙티브 맵 방식 검토

### 현재 구현 방식의 한계
- **TarkovTracker/tarkovdata SVG 기반**: 커뮤니티 기여로 유지되며, 신규 맵(Labyrinth, Terminal) 대응이 느림
- GPS 좌표 데이터(`objective_gps.json`)가 일부 맵에서 누락됨
- SVG 층 그룹 구조가 맵마다 일관되지 않아 유지보수 부담 있음

### Fandom Wiki 방식 분석
`docs/Labyrinth_sample` 파일 참고 (fandom.com 인터랙티브 맵 JSON 설정)

```json
{
  "mapImage": "The Labyrinth Interactive Map Base.png",  // PNG 베이스 이미지
  "mapBounds": [[0, 0], [4145, 3840]],                  // 픽셀 좌표 범위
  "origin": "bottom-left",                               // 좌표 원점
  "categories": [ ... ],                                 // 마커 카테고리 정의
  "markers": [                                           // 각 마커 좌표 + 정보
    { "categoryId": "quest", "position": [x, y], "popup": { "title": "...", "description": "..." } }
  ]
}
```

**장점**:
- 신규 맵도 PNG + JSON으로 빠르게 대응 가능 (이미 Labyrinth, Terminal PNG 확보)
- 탈출구, 보스, 스폰, 열쇠 등 퀘스트 외 정보 포함
- 좌표 정밀도가 SVG 방식보다 높음

**단점**:
- Fandom wiki 데이터는 공식 라이선스 확인 필요 (CC BY-SA 3.0)
- 현재 우리 시스템의 `positionX/Y` 백분율 좌표와 변환 작업 필요
  - Fandom: 픽셀 좌표 (origin: bottom-left)
  - 우리 시스템: 백분율 (topPercent, leftPercent)
  - 변환식: `leftPercent = (x / mapWidth) * 100`, `topPercent = ((mapHeight - y) / mapHeight) * 100`
- SVG 층 전환(`<g>` 그룹 display toggle) 대신 마커 floorId 기반 필터링으로 전환 필요

### 권장 접근 방식
1. **하이브리드**: SVG 있는 맵은 현행 유지, PNG만 있는 맵(Labyrinth, Terminal)은 Fandom JSON 마커 방식
2. **좌표 변환 유틸리티** 추가: Fandom 픽셀 좌표 → 백분율 변환
3. 마커 카테고리 토글 UI 추가 (퀘스트 / 탈출구 / 보스 등)

---

## 진행 우선순위

| 우선순위 | 항목 | 작업량 |
|---|---|---|
| 1 | The Lab GPS 마커 원인 확인 및 수동 좌표 입력 검토 | 소 |
| 2 | tarkov.dev API에서 탈출구 데이터 동기화 + 맵 표시 | 중 |
| 3 | Fandom JSON 마커 import 도구 구현 (Labyrinth, Terminal 우선) | 중 |
| 4 | 맵 마커 카테고리 토글 UI | 중 |
| 5 | Streets of Tarkov GPS 데이터 확보 (tarkovdata PR 또는 수동) | 대 |

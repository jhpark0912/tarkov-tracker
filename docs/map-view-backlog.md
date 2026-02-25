# 맵 뷰 잔여 작업 목록

> 최종 업데이트: 2026-02-25

---

## 검증 필요

| 항목 | 설명 |
|------|------|
| Ground Zero | 퀘스트가 1층에 정상 표시되는지 (지하 아님) |
| Lab | 층 전환 시 PNG 이미지 교체 동작 |
| Interchange | floorRanges(25/34) 적용 후 층 분배 |
| debug 로그 | mapStore.ts console.log 제거 (검증 완료 후) |

---

## 미완료 항목

### 1. Streets of Tarkov 퀘스트 마커 좌표 정밀도
- API zones로 일부 해결되었으나, 전체 커버리지 확인 필요
- 작업량: 소

### 2. Terminal · Labyrinth 맵 마커
- bounds 미설정 → 좌표 변환 불가
- Fandom wiki JSON 마커 import 검토 필요
- 작업량: 중

### 3. Fandom Wiki 인터랙티브 맵 방식 (하이브리드)
- SVG 있는 맵은 현행 유지
- PNG만 있는 맵(Terminal, Labyrinth)은 Fandom JSON 마커 방식
- 좌표 변환 유틸리티: Fandom 픽셀 좌표 → 백분율 변환
- 작업량: 중

### 4. 보스 스폰 정보 표시
- tarkov.dev API `maps { bosses }` 데이터는 이미 동기화 쿼리에 포함
- 맵 뷰에 보스 스폰 마커 추가 필요
- 작업량: 중

---

## 진행 우선순위

| 우선순위 | 항목 | 작업량 |
|---|---|---|
| 1 | 검증: 백엔드 재시작 + 동기화 후 전체 맵 확인 | 소 |
| 2 | debug 로그 정리 (mapStore.ts console.log) | 소 |
| 3 | Streets of Tarkov 퀘스트 좌표 커버리지 확인 | 소 |
| 4 | Terminal · Labyrinth bounds + Fandom JSON import | 중 |
| 5 | 보스 스폰 정보 표시 | 중 |

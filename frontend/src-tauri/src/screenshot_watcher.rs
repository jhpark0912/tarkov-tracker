use notify::{Event, EventKind, RecommendedWatcher, RecursiveMode, Watcher};
use regex::Regex;
use serde::{Deserialize, Serialize};
use std::path::Path;
use std::sync::{Arc, Mutex};
use tauri::Emitter;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PlayerPosition {
    pub x: f64,
    pub y: f64,
    pub z: f64,
    pub timestamp: String,
    pub filename: String,
}

struct WatcherInner {
    positions: Vec<PlayerPosition>,
}

pub struct ScreenshotWatcher {
    _watcher: RecommendedWatcher,
    inner: Arc<Mutex<WatcherInner>>,
}

impl ScreenshotWatcher {
    pub fn new(watch_path: &str, app_handle: tauri::AppHandle) -> Result<Self, Box<dyn std::error::Error>> {
        let inner = Arc::new(Mutex::new(WatcherInner {
            positions: Vec::new(),
        }));

        // 기존 파일에서 위치 로드
        Self::load_existing(watch_path, &inner);

        let inner_clone = inner.clone();
        let app_clone = app_handle.clone();

        let mut watcher = notify::recommended_watcher(move |res: Result<Event, notify::Error>| {
            if let Ok(event) = res {
                if matches!(event.kind, EventKind::Create(_)) {
                    for path in &event.paths {
                        if let Some(filename) = path.file_name().and_then(|f| f.to_str()) {
                            if let Some(pos) = parse_filename(filename) {
                                let mut guard = inner_clone.lock().unwrap();
                                guard.positions.push(pos.clone());
                                // 프론트엔드로 이벤트 전송
                                let _ = app_clone.emit("screenshot-position", &pos);
                            }
                        }
                    }
                }
            }
        })?;

        watcher.watch(Path::new(watch_path), RecursiveMode::NonRecursive)?;

        Ok(Self {
            _watcher: watcher,
            inner,
        })
    }

    fn load_existing(dir: &str, inner: &Arc<Mutex<WatcherInner>>) {
        let path = Path::new(dir);
        if let Ok(entries) = std::fs::read_dir(path) {
            let mut positions: Vec<PlayerPosition> = entries
                .filter_map(|e| e.ok())
                .filter_map(|e| {
                    let filename = e.file_name().to_str()?.to_string();
                    parse_filename(&filename)
                })
                .collect();
            // 타임스탬프 기준 정렬
            positions.sort_by(|a, b| a.timestamp.cmp(&b.timestamp));
            let mut guard = inner.lock().unwrap();
            guard.positions = positions;
        }
    }

    pub fn get_latest(&self) -> Option<PlayerPosition> {
        let guard = self.inner.lock().unwrap();
        guard.positions.last().cloned()
    }

    pub fn get_history(&self, limit: usize) -> Vec<PlayerPosition> {
        let guard = self.inner.lock().unwrap();
        let len = guard.positions.len();
        let start = if len > limit { len - limit } else { 0 };
        guard.positions[start..].to_vec()
    }

    pub fn stop(self) {
        // watcher가 drop되면서 자동 정리
        drop(self._watcher);
    }
}

/// 타르코프 스크린샷 파일명에서 좌표 파싱
/// 형식: 2026-01-17[08-33]_29.17, -11.39, -176.68_quaternion_time (0).png
fn parse_filename(filename: &str) -> Option<PlayerPosition> {
    let re = Regex::new(
        r"^(\d{4}-\d{2}-\d{2})\[(\d{2}-\d{2})\]_([-\d.]+),\s*([-\d.]+),\s*([-\d.]+)_"
    ).ok()?;

    let caps = re.captures(filename)?;
    let date = caps.get(1)?.as_str();
    let time = caps.get(2)?.as_str().replace('-', ":");
    let x: f64 = caps.get(3)?.as_str().parse().ok()?;
    let y: f64 = caps.get(4)?.as_str().parse().ok()?;
    let z: f64 = caps.get(5)?.as_str().parse().ok()?;

    Some(PlayerPosition {
        x,
        y,
        z,
        timestamp: format!("{}T{}", date, time),
        filename: filename.to_string(),
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_filename() {
        let filename = "2026-01-17[08-33]_29.17, -11.39, -176.68_0.01131, 0.98126, -0.18592, 0.04939_11.94 (0).png";
        let pos = parse_filename(filename).unwrap();
        assert!((pos.x - 29.17).abs() < 0.01);
        assert!((pos.y - (-11.39)).abs() < 0.01);
        assert!((pos.z - (-176.68)).abs() < 0.01);
        assert_eq!(pos.timestamp, "2026-01-17T08:33");
    }
}

mod screenshot_watcher;

use screenshot_watcher::ScreenshotWatcher;
use std::sync::Mutex;

pub struct WatcherState(pub Mutex<Option<ScreenshotWatcher>>);

#[tauri::command]
fn get_latest_position(state: tauri::State<'_, WatcherState>) -> Option<screenshot_watcher::PlayerPosition> {
    let guard = state.0.lock().unwrap();
    guard.as_ref().and_then(|w| w.get_latest())
}

#[tauri::command]
fn get_position_history(
    state: tauri::State<'_, WatcherState>,
    limit: Option<usize>,
) -> Vec<screenshot_watcher::PlayerPosition> {
    let guard = state.0.lock().unwrap();
    guard
        .as_ref()
        .map(|w| w.get_history(limit.unwrap_or(50)))
        .unwrap_or_default()
}

#[tauri::command]
fn start_watching(
    state: tauri::State<'_, WatcherState>,
    path: String,
    app_handle: tauri::AppHandle,
) -> Result<String, String> {
    let mut guard = state.0.lock().unwrap();
    // 기존 watcher 종료
    if let Some(old) = guard.take() {
        old.stop();
    }
    let watcher = ScreenshotWatcher::new(&path, app_handle).map_err(|e| e.to_string())?;
    *guard = Some(watcher);
    Ok(format!("Watching: {}", path))
}

#[tauri::command]
fn stop_watching(state: tauri::State<'_, WatcherState>) -> String {
    let mut guard = state.0.lock().unwrap();
    if let Some(old) = guard.take() {
        old.stop();
        "Stopped watching".to_string()
    } else {
        "Not watching".to_string()
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .manage(WatcherState(Mutex::new(None)))
        .invoke_handler(tauri::generate_handler![
            get_latest_position,
            get_position_history,
            start_watching,
            stop_watching,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

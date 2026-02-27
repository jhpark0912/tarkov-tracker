import { useEffect, lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import DebugProvider from './components/debug/DebugProvider';
import DebugToggle from './components/debug/DebugToggle';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuthStore } from './store/authStore';
import DashboardPage from './features/dashboard/DashboardPage';
import QuestListPage from './features/quests/QuestListPage';
import QuestDetailPage from './features/quests/QuestDetailPage';
import QuestTreePage from './features/quests/QuestTreePage';
import MapSelectPage from './features/map/MapSelectPage';
import MapViewPage from './features/map/MapViewPage';
import KeyListPage from './features/keys/KeyListPage';
import KeyDetailPage from './features/keys/KeyDetailPage';
import HideoutPage from './features/hideout/HideoutPage';
import HideoutStationPage from './features/hideout/HideoutStationPage';
import DecisionMapPage from './features/story/DecisionMapPage';
import EndingPathPage from './features/story/EndingPathPage';
import FullMapPage from './features/story/FullMapPage';
import LoginPage from './features/auth/LoginPage';
import SignupPage from './features/auth/SignupPage';

const SettingsPage = lazy(() => import('./features/settings/SettingsPage'));

export default function App() {
  const initFromStorage = useAuthStore((s) => s.initFromStorage);

  useEffect(() => {
    initFromStorage();
  }, [initFromStorage]);

  return (
    <DebugProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/quests" element={<QuestListPage />} />
          <Route path="/quests/tree/:type" element={<QuestTreePage />} />
          <Route path="/quests/:id" element={<QuestDetailPage />} />
          <Route path="/keys" element={<KeyListPage />} />
          <Route path="/keys/:apiId" element={<KeyDetailPage />} />
          <Route path="/hideout" element={<HideoutPage />} />
          <Route path="/hideout/:apiId" element={<HideoutStationPage />} />
          <Route path="/map" element={<MapSelectPage />} />
          <Route path="/map/:normalizedName" element={<MapViewPage />} />
          <Route path="/story" element={<DecisionMapPage />} />
          <Route path="/story/full" element={<FullMapPage />} />
          <Route path="/story/:endingId" element={<EndingPathPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Suspense fallback={<div className="flex items-center justify-center py-20 text-text-muted text-sm">로딩 중...</div>}>
                  <SettingsPage />
                </Suspense>
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
      <DebugToggle />
    </DebugProvider>
  );
}

import { Routes, Route } from 'react-router-dom';
import DebugProvider from './components/debug/DebugProvider';
import DebugToggle from './components/debug/DebugToggle';
import Layout from './components/layout/Layout';
import DashboardPage from './features/dashboard/DashboardPage';
import QuestListPage from './features/quests/QuestListPage';
import QuestDetailPage from './features/quests/QuestDetailPage';
import MapSelectPage from './features/map/MapSelectPage';
import MapViewPage from './features/map/MapViewPage';
import LoginPage from './features/auth/LoginPage';
import SignupPage from './features/auth/SignupPage';

export default function App() {
  return (
    <DebugProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/quests" element={<QuestListPage />} />
          <Route path="/quests/:id" element={<QuestDetailPage />} />
          <Route path="/map" element={<MapSelectPage />} />
          <Route path="/map/:normalizedName" element={<MapViewPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Route>
      </Routes>
      <DebugToggle />
    </DebugProvider>
  );
}

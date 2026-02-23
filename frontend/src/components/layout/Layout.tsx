import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import DebugOverlay from '../debug/DebugOverlay';

export default function Layout() {
  return (
    <DebugOverlay id="app-layout" tag="div" label="Layout" variant="layout">
      <div id="app-layout" className="min-h-screen bg-bg">
        <Sidebar />
        <div className="ml-16 flex flex-col min-h-screen">
          <Header />
          <DebugOverlay id="app-content" tag="main" label="Content" variant="layout">
            <main
              id="app-content"
              className="flex-1 px-6 pb-6 overflow-y-auto"
            >
              <Outlet />
            </main>
          </DebugOverlay>
        </div>
      </div>
    </DebugOverlay>
  );
}

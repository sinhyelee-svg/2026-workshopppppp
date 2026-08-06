import React, { useState } from 'react';
import { WorkshopProvider, useWorkshop } from './context/WorkshopContext';
import { Sidebar } from './components/Sidebar';
import { MemberTray } from './components/MemberTray';
import { ChecklistView } from './components/ChecklistView';
import { ScheduleView } from './components/ScheduleView';
import { IdeasView } from './components/IdeasView';
import { PlacesView } from './components/PlacesView';
import { TeamsView } from './components/TeamsView';
import { ShareModal } from './components/ShareModal';
import { Loader2 } from 'lucide-react';

function MainContent() {
  const { activeTab, loading } = useWorkshop();
  const [showShareModal, setShowShareModal] = useState(false);
  const [isOpenMobile, setIsOpenMobile] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-600">
            Firebase Firestore 실시간 데이터 불러오는 중...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 font-sans antialiased flex flex-col lg:flex-row">
      {/* Left Sidebar Navigation */}
      <Sidebar
        onOpenShareModal={() => setShowShareModal(true)}
        isOpenMobile={isOpenMobile}
        setIsOpenMobile={setIsOpenMobile}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Sticky Draggable Member Tray for Drag & Drop */}
          <MemberTray />

          {/* Active Tab Views */}
          {activeTab === 'checklist' && <ChecklistView />}
          {activeTab === 'schedule' && <ScheduleView />}
          {activeTab === 'ideas' && <IdeasView />}
          {activeTab === 'places' && <PlacesView />}
          {activeTab === 'teams' && <TeamsView />}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-slate-200/80 py-4 px-6 text-center text-xs text-slate-400 mt-auto">
          <p>
            WORKSHOP 2024 ✨ 14인 워크샵 준비 스페이스 &bull; Firebase Firestore 실시간 연동
          </p>
        </footer>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <ShareModal onClose={() => setShowShareModal(false)} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <WorkshopProvider>
      <MainContent />
    </WorkshopProvider>
  );
}

import React, { useState } from 'react';
import {
  CheckSquare,
  Calendar,
  Lightbulb,
  MapPin,
  Users,
  Wallet,
  Share2,
  RefreshCw,
  UserCheck,
  Sparkles,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';
import { useWorkshop } from '../context/WorkshopContext';
import { WORKSHOP_MEMBERS, ActiveTab, MemberName } from '../types';

interface SidebarProps {
  onOpenShareModal: () => void;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onOpenShareModal,
  isOpenMobile,
  setIsOpenMobile,
}) => {
  const {
    currentUser,
    setCurrentUser,
    activeTab,
    setActiveTab,
    resetToInitialData,
  } = useWorkshop();

  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleReset = async () => {
    setIsResetting(true);
    await resetToInitialData();
    setIsResetting(false);
    setShowResetConfirm(false);
  };

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'checklist', label: '해야할 일 & 역할분담', icon: <CheckSquare className="w-5 h-5" /> },
    { id: 'schedule', label: '일정표', icon: <Calendar className="w-5 h-5" /> },
    { id: 'ideas', label: '아이디어 올리기', icon: <Lightbulb className="w-5 h-5" /> },
    { id: 'places', label: '맛집/카페 리스트', icon: <MapPin className="w-5 h-5" /> },
    { id: 'teams', label: '차량조 & 활동조', icon: <Users className="w-5 h-5" /> },
    { id: 'budget', label: '예산 관리', icon: <Wallet className="w-5 h-5" />, badge: '220만원' },
  ];

  const CORE_MANAGERS: MemberName[] = ['유옥', '현정', '권웅', '신혜', '다온'];
  const managerMembers = WORKSHOP_MEMBERS.filter((m) =>
    CORE_MANAGERS.includes(m.name as MemberName)
  );

  const currentMemberObj = WORKSHOP_MEMBERS.find((m) => m.id === currentUser);

  return (
    <>
      {/* Mobile Top Navigation Header */}
      <header className="lg:hidden bg-white border-b border-slate-200 sticky top-0 z-30 px-4 py-3 flex items-center justify-between shadow-2xs">
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => setIsOpenMobile(!isOpenMobile)}
            className="p-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
            aria-label="메뉴 열기"
          >
            {isOpenMobile ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-900 tracking-tight leading-none">
                2026 가을 워크샵 ✨
              </h1>
              <p className="text-[10px] text-slate-500 mt-0.5">워크샵 준비 스페이스</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* User selector on mobile header */}
          <button
            type="button"
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center space-x-1 px-2.5 py-1.5 bg-slate-100 rounded-lg text-xs font-semibold text-slate-700"
          >
            <span className={`w-2 h-2 rounded-full ${currentMemberObj?.avatarBg || 'bg-emerald-500'}`} />
            <span>{currentUser}</span>
          </button>

          <button
            type="button"
            onClick={onOpenShareModal}
            className="p-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold shadow-2xs"
            title="공유"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setIsOpenMobile(false)}
        />
      )}

      {/* LEFT SIDEBAR CONTAINER */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-72 bg-white border-r border-slate-200/90 flex flex-col justify-between p-5 transition-transform duration-300 ease-in-out shadow-lg lg:shadow-none ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="space-y-6">
          {/* Brand Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-100">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base font-black text-emerald-600 tracking-tight leading-none">
                  2026 가을 워크샵 ✨
                </h1>
                <p className="text-[11px] font-medium text-slate-400 mt-1">
                  워크샵 준비 공간
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpenMobile(false)}
              className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* NAVIGATION MENU LIST (LEFT SIDEBAR) */}
          <div className="space-y-1">
            <div className="px-3 py-1 text-[11px] font-black text-slate-400 tracking-wider uppercase">
              메뉴 목록
            </div>
            <nav className="space-y-1.5" aria-label="Left Sidebar Navigation">
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsOpenMobile(false);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200 scale-[1.02]'
                        : 'text-slate-700 hover:bg-slate-100/80 hover:text-emerald-600'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className={isActive ? 'text-white' : 'text-slate-400'}>
                        {item.icon}
                      </span>
                      <span className="tracking-tight">{item.label}</span>
                    </div>
                    {isActive && <ChevronRight className="w-4 h-4 text-white/80" />}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* BOTTOM USER & ACTIONS PANEL */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          {/* User Select Box */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="w-full flex items-center justify-between p-2.5 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200/80 transition"
            >
              <div className="flex items-center space-x-2.5 min-w-0">
                <div
                  className={`w-7 h-7 rounded-full ${
                    currentMemberObj?.avatarBg || 'bg-emerald-500'
                  } text-white flex items-center justify-center text-xs font-bold shrink-0`}
                >
                  {currentUser[0]}
                </div>
                <div className="text-left min-w-0">
                  <p className="text-[10px] font-bold text-slate-400 leading-none">내 이름 (현재)</p>
                  <p className="text-xs font-black text-slate-800 truncate mt-0.5">
                    {currentUser}
                  </p>
                </div>
              </div>
              <span className="text-slate-400 text-xs">▼</span>
            </button>

            {/* Dropdown Menu */}
            {showUserDropdown && (
              <div className="absolute left-0 bottom-full mb-2 w-full bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 max-h-60 overflow-y-auto">
                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 border-b border-slate-100 mb-1">
                  담당자 변경 (5인):
                </div>
                {managerMembers.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      setCurrentUser(m.id as MemberName);
                      setShowUserDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-emerald-50 transition ${
                      currentUser === m.id ? 'bg-emerald-50 font-bold text-emerald-600' : 'text-slate-700'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${m.avatarBg}`} />
                      <span>{m.name}</span>
                    </div>
                    {currentUser === m.id && <span className="text-xs font-bold">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Share & Reset Buttons */}
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onOpenShareModal}
              className="flex-1 flex items-center justify-center space-x-1.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share & Sync</span>
            </button>

            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="p-2.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl border border-slate-200 transition"
              title="기본 데이터로 리셋"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Reset Confirmation Modal */}
        {showResetConfirm && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 text-center">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-3">
                <RefreshCw className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">
                기본 데이터로 리셋하시겠습니까?
              </h3>
              <p className="text-xs text-slate-500 mb-5">
                수정된 내용이 초기 템플릿 데이터로 복원됩니다.
              </p>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={isResetting}
                  className="flex-1 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl transition"
                >
                  {isResetting ? '초기화 중...' : '리셋하기'}
                </button>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

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
  Zap,
  Sparkles,
} from 'lucide-react';
import { useWorkshop } from '../context/WorkshopContext';
import { WORKSHOP_MEMBERS, ActiveTab, MemberName } from '../types';

interface NavbarProps {
  onOpenShareModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenShareModal }) => {
  const {
    currentUser,
    setCurrentUser,
    activeTab,
    setActiveTab,
    isOnline,
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
    { id: 'checklist', label: '해야할 일 & 역할분담', icon: <CheckSquare className="w-4 h-4" /> },
    { id: 'schedule', label: '일정표', icon: <Calendar className="w-4 h-4" /> },
    { id: 'ideas', label: '아이디어 올리기', icon: <Lightbulb className="w-4 h-4" /> },
    { id: 'places', label: '맛집/카페 리스트', icon: <MapPin className="w-4 h-4" /> },
    { id: 'teams', label: '차량조 & 활동조', icon: <Users className="w-4 h-4" /> },
    { id: 'budget', label: '예산 관리', icon: <Wallet className="w-4 h-4" />, badge: '250만' },
  ];

  const currentMemberObj = WORKSHOP_MEMBERS.find((m) => m.id === currentUser);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Title */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-100">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                2026 가을 워크샵 ✨
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-ping" />
                실시간 동기화
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              14명 팀원이 함께 만드는 즐거운 워크샵 준비 공간 (새길 · 유옥 · 현정 · 민규 · 혜선 · 윤배 · 현하 · 유진 · 다온 · 선경 · 권웅 · 소연 · 신혜 · 승아)
            </p>
          </div>
        </div>

        {/* User Selector & Action Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3 ml-auto">
          {/* User selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center space-x-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-medium text-slate-700 transition"
              title="내 이름 변경"
            >
              <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span>내 이름:</span>
              <span className={`font-bold ${currentMemberObj?.textColor || 'text-slate-900'}`}>
                {currentUser}
              </span>
              <span className="text-slate-400 text-[10px]">▼</span>
            </button>

            {showUserDropdown && (
              <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50">
                <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-semibold text-slate-400">
                  내가 누구인지 선택해주세요:
                </div>
                {WORKSHOP_MEMBERS.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      setCurrentUser(m.id as MemberName);
                      setShowUserDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition ${
                      currentUser === m.id ? 'bg-indigo-50 font-bold text-indigo-600' : 'text-slate-700'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${m.avatarBg}`} />
                      <span>{m.name}</span>
                    </div>
                    {currentUser === m.id && <span className="text-xs">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Share Button */}
          <button
            type="button"
            onClick={onOpenShareModal}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>공유하기</span>
          </button>

          {/* Reset Button */}
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
            title="기본 데이터로 초기화"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-100">
        <nav className="flex space-x-1 sm:space-x-4 overflow-x-auto py-2 no-scrollbar" aria-label="Tabs">
          {navItems.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/60 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span className={isActive ? 'text-indigo-600' : 'text-slate-400'}>
                  {tab.icon}
                </span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Reset confirmation modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 text-center">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-3">
              <RefreshCw className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              기본 데이터로 리셋하시겠습니까?
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              현재 수정된 모든 내용(할일, 일정, 아이디어, 맛집, 차량조)이 초기 템플릿 데이터로 복원됩니다.
            </p>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleReset}
                disabled={isResetting}
                className="flex-1 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl transition"
              >
                {isResetting ? '초기화 중...' : '리셋하기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

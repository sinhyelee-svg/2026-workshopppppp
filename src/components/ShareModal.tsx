import React, { useState } from 'react';
import { Copy, Check, Share2, X, Sparkles, Globe, Users } from 'lucide-react';
import { WORKSHOP_MEMBERS } from '../types';

interface ShareModalProps {
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ onClose }) => {
  const [copied, setCopied] = useState(false);

  // Current page URL
  const shareUrl = window.location.href;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              워크샵 준비 스페이스 공유하기
            </h3>
            <p className="text-xs text-slate-500">
              링크를 팀원들에게 전달하면 실시간으로 같이 편집할 수 있습니다.
            </p>
          </div>
        </div>

        {/* Shareable URL Input */}
        <div className="space-y-3 mb-5">
          <label className="block text-xs font-bold text-slate-700">
            공유 링크 (Firebase Firestore 실시간 연동)
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-mono focus:outline-hidden"
            />
            <button
              type="button"
              onClick={handleCopy}
              className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center space-x-1.5 transition ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>복사완료!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>링크 복사</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Team Members Chips List */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
          <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
            <span>👥 같이 준비할 5인 멤버:</span>
            <span className="text-[10px] text-indigo-600 font-semibold">
              실시간 접속 중
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {WORKSHOP_MEMBERS.map((m) => (
              <div
                key={m.id}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-bold ${m.badgeBg}`}
              >
                <div className={`w-2.5 h-2.5 rounded-full ${m.avatarBg}`} />
                <span>{m.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={onClose}
            className="w-full px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

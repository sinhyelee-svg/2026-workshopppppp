import React, { useState } from 'react';
import { Lightbulb, ThumbsUp, Plus, Trash2, Heart, Sparkles, Filter } from 'lucide-react';
import { useWorkshop } from '../context/WorkshopContext';
import { IdeaItem, WORKSHOP_MEMBERS, MemberName } from '../types';

export const IdeasView: React.FC = () => {
  const { ideas, addIdea, voteIdea, deleteIdea, currentUser } = useWorkshop();

  const [showAddModal, setShowAddModal] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('전체');

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<IdeaItem['category']>('팀빌딩 활동');
  const [color, setColor] = useState<IdeaItem['color']>('yellow');

  const categories = ['전체', '팀빌딩 활동', '저녁 프로그램', '준비물/참고', '기타 아이디어'];

  const colorStyles: Record<
    IdeaItem['color'],
    { bg: string; border: string; badgeBg: string; text: string }
  > = {
    yellow: {
      bg: 'bg-amber-50/90 hover:bg-amber-50',
      border: 'border-amber-200/80',
      badgeBg: 'bg-amber-100 text-amber-800',
      text: 'text-amber-900',
    },
    pink: {
      bg: 'bg-rose-50/90 hover:bg-rose-50',
      border: 'border-rose-200/80',
      badgeBg: 'bg-rose-100 text-rose-800',
      text: 'text-rose-900',
    },
    blue: {
      bg: 'bg-sky-50/90 hover:bg-sky-50',
      border: 'border-sky-200/80',
      badgeBg: 'bg-sky-100 text-sky-800',
      text: 'text-sky-900',
    },
    green: {
      bg: 'bg-emerald-50/90 hover:bg-emerald-50',
      border: 'border-emerald-200/80',
      badgeBg: 'bg-emerald-100 text-emerald-800',
      text: 'text-emerald-900',
    },
    purple: {
      bg: 'bg-purple-50/90 hover:bg-purple-50',
      border: 'border-purple-200/80',
      badgeBg: 'bg-purple-100 text-purple-800',
      text: 'text-purple-900',
    },
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    await addIdea({
      title: title.trim(),
      content: content.trim(),
      author: currentUser,
      category,
      votes: [currentUser], // auto-vote for own idea
      color,
      createdAt: new Date().toISOString(),
    });

    setTitle('');
    setContent('');
    setShowAddModal(false);
  };

  const filteredIdeas = ideas.filter(
    (i) => filterCategory === '전체' || i.category === filterCategory
  );

  return (
    <div className="space-y-6">
      {/* Header & New Idea Button */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <span>💡 워크샵 아이디어 보드</span>
            <span className="text-xs bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full font-bold">
              총 {ideas.length}개
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            저녁 팀빌딩 활동, 레크레이션, 준비물, 꿀팁 아이디어를 팍팍 올려주세요!
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-semibold shadow-xs transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>아이디어 등록하기</span>
        </button>
      </div>

      {/* Category Filter */}
      <div className="flex items-center space-x-1.5 overflow-x-auto py-1 no-scrollbar">
        <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 mr-1" />
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              filterCategory === cat
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Sticky Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredIdeas.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl p-10 text-center border border-dashed border-slate-200">
            <Lightbulb className="w-10 h-10 text-amber-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-500">
              아직 등록된 아이디어가 없습니다.
            </p>
            <p className="text-xs text-slate-400 mt-1">
              팀원들과 함께할 저녁 게임이나 재미있는 보드게임 아이디어를 공유해 보세요!
            </p>
          </div>
        ) : (
          filteredIdeas.map((idea) => {
            const style = colorStyles[idea.color || 'yellow'];
            const authorInfo = WORKSHOP_MEMBERS.find((m) => m.name === idea.author);
            const votes = idea.votes || [];
            const hasVoted = votes.includes(currentUser);

            return (
              <div
                key={idea.id}
                className={`group relative rounded-2xl p-5 border transition-all duration-200 shadow-2xs hover:shadow-md flex flex-col justify-between ${style.bg} ${style.border}`}
              >
                <div>
                  {/* Category & Author Badge */}
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${style.badgeBg}`}
                    >
                      {idea.category}
                    </span>

                    <div className="flex items-center space-x-1.5">
                      <div
                        className={`w-5 h-5 rounded-full ${
                          authorInfo?.avatarBg || 'bg-slate-400'
                        } text-white flex items-center justify-center text-[10px] font-bold`}
                      >
                        {idea.author[0]}
                      </div>
                      <span className="text-xs font-semibold text-slate-700">
                        {idea.author}
                      </span>
                    </div>
                  </div>

                  {/* Title & Content */}
                  <h3 className={`text-base font-bold mb-2 ${style.text}`}>
                    {idea.title}
                  </h3>
                  {idea.content && (
                    <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap mb-4">
                      {idea.content}
                    </p>
                  )}
                </div>

                {/* Footer: Voters & Vote Button */}
                <div className="pt-3 border-t border-slate-900/10 flex items-center justify-between">
                  {/* Voter Avatars */}
                  <div className="flex items-center space-x-1">
                    <div className="flex -space-x-1.5 overflow-hidden">
                      {votes.map((voter) => {
                        const voterInfo = WORKSHOP_MEMBERS.find((m) => m.name === voter);
                        return (
                          <div
                            key={voter}
                            className={`inline-block h-5 w-5 rounded-full ring-2 ring-white ${
                              voterInfo?.avatarBg || 'bg-slate-400'
                            } text-white text-[9px] font-bold flex items-center justify-center`}
                            title={`${voter}님이 공감함`}
                          >
                            {voter[0]}
                          </div>
                        );
                      })}
                    </div>
                    {votes.length > 0 && (
                      <span className="text-[11px] text-slate-500 font-semibold ml-1">
                        {votes.length}명
                      </span>
                    )}
                  </div>

                  {/* Upvote Button */}
                  <div className="flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={() => voteIdea(idea.id, currentUser)}
                      className={`flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                        hasVoted
                          ? 'bg-amber-500 text-white shadow-xs'
                          : 'bg-white/80 hover:bg-white text-slate-700 border border-slate-200/80'
                      }`}
                    >
                      <ThumbsUp className={`w-3 h-3 ${hasVoted ? 'fill-white' : ''}`} />
                      <span>{hasVoted ? '공감됨' : '공감'}</span>
                    </button>

                    {/* Delete if author or admin */}
                    <button
                      type="button"
                      onClick={() => deleteIdea(idea.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg transition opacity-60 group-hover:opacity-100"
                      title="삭제"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Idea Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span>새로운 아이디어 올리기</span>
            </h3>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  아이디어 제목 *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="예: 저녁 먹고 밤샘 밸런스 게임 & 보드게임 대항전!"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  카테고리
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-white"
                >
                  <option value="팀빌딩 활동">팀빌딩 활동</option>
                  <option value="저녁 프로그램">저녁 프로그램</option>
                  <option value="준비물/참고">준비물/참고</option>
                  <option value="기타 아이디어">기타 아이디어</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  상세 설명
                </label>
                <textarea
                  rows={3}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="구체적인 규칙이나 진행 방식 등을 적어주세요..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Color selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  카드 색상 선택
                </label>
                <div className="flex space-x-3">
                  {(['yellow', 'pink', 'blue', 'green', 'purple'] as const).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-7 h-7 rounded-full transition-transform ${
                        c === 'yellow'
                          ? 'bg-amber-300'
                          : c === 'pink'
                          ? 'bg-rose-300'
                          : c === 'blue'
                          ? 'bg-sky-300'
                          : c === 'green'
                          ? 'bg-emerald-300'
                          : 'bg-purple-300'
                      } ${color === c ? 'ring-2 ring-slate-900 scale-110 shadow-xs' : 'hover:scale-105'}`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-xl shadow-xs transition"
                >
                  올리기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

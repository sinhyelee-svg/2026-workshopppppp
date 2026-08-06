import React, { useState } from 'react';
import {
  MapPin,
  ExternalLink,
  ThumbsUp,
  Plus,
  Trash2,
  Utensils,
  Coffee,
  Compass,
  Star,
  Search,
  Filter,
} from 'lucide-react';
import { useWorkshop } from '../context/WorkshopContext';
import { PlaceItem, WORKSHOP_MEMBERS } from '../types';

export const PlacesView: React.FC = () => {
  const { places, addPlace, votePlace, deletePlace, currentUser } = useWorkshop();

  const [showAddModal, setShowAddModal] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('전체');
  const [searchQuery, setSearchQuery] = useState('');

  // Form state
  const [name, setName] = useState('');
  const [category, setCategory] = useState<PlaceItem['category']>('맛집');
  const [address, setAddress] = useState('');
  const [mapUrl, setMapUrl] = useState('');
  const [notes, setNotes] = useState('');

  const categories = ['전체', '맛집', '카페', '가볼만한 곳'];

  const getCategoryIcon = (cat: PlaceItem['category']) => {
    switch (cat) {
      case '맛집':
        return <Utensils className="w-3.5 h-3.5 text-amber-500" />;
      case '카페':
        return <Coffee className="w-3.5 h-3.5 text-rose-500" />;
      case '가볼만한 곳':
        return <Compass className="w-3.5 h-3.5 text-emerald-500" />;
    }
  };

  const getCategoryBadge = (cat: PlaceItem['category']) => {
    switch (cat) {
      case '맛집':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case '카페':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case '가볼만한 곳':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Default search link if mapUrl not provided
    const finalMapUrl =
      mapUrl.trim() ||
      `https://map.naver.com/v5/search/${encodeURIComponent(name.trim())}`;

    await addPlace({
      name: name.trim(),
      category,
      recommendedBy: currentUser,
      address: address.trim(),
      mapUrl: finalMapUrl,
      notes: notes.trim(),
      votes: [currentUser],
      rating: 5,
      createdAt: new Date().toISOString(),
    });

    setName('');
    setAddress('');
    setMapUrl('');
    setNotes('');
    setShowAddModal(false);
  };

  const filteredPlaces = places.filter((p) => {
    const matchCat = filterCategory === '전체' || p.category === filterCategory;
    const matchSearch =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.notes && p.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.address && p.address.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header & New Place Button */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <span>🍱 맛집 / 카페 / 가볼만한 곳 리스트</span>
            <span className="text-xs bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-bold">
              총 {places.length}곳
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            워크샵 장소 주변의 추천 식당, 예쁜 카페, 관광 명소를 추천하고 투표해주세요!
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>장소 추천하기</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Category Tabs */}
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

        {/* Search Input */}
        <div className="relative w-full sm:w-60">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="장소명, 메뉴, 주소 검색..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200/80 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Places Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPlaces.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl p-10 text-center border border-dashed border-slate-200">
            <Utensils className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-500">
              등록된 장소가 없습니다.
            </p>
            <p className="text-xs text-slate-400 mt-1">
              상단의 '장소 추천하기' 버튼을 눌러 맛집과 카페를 등록해 보세요!
            </p>
          </div>
        ) : (
          filteredPlaces.map((place) => {
            const recommenderInfo = WORKSHOP_MEMBERS.find((m) => m.name === place.recommendedBy);
            const votes = place.votes || [];
            const hasVoted = votes.includes(currentUser);

            return (
              <div
                key={place.id}
                className="group bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs hover:shadow-md transition duration-200 flex flex-col justify-between"
              >
                <div>
                  {/* Category & Recommender */}
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`flex items-center space-x-1 text-[10px] font-bold px-2.5 py-0.5 rounded-lg border ${getCategoryBadge(
                        place.category
                      )}`}
                    >
                      {getCategoryIcon(place.category)}
                      <span>{place.category}</span>
                    </span>

                    <div
                      className="flex items-center space-x-1 bg-slate-100 px-2 py-0.5 rounded-full text-[10px] font-semibold text-slate-600"
                      title="추천인"
                    >
                      <span>추천:</span>
                      <span className="font-bold text-slate-900">
                        {place.recommendedBy}
                      </span>
                    </div>
                  </div>

                  {/* Name & Map Link */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-600 transition">
                      {place.name}
                    </h3>

                    {place.mapUrl && (
                      <a
                        href={place.mapUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center space-x-1 px-2 py-1 bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 text-[10px] font-bold rounded-lg border border-slate-200 transition shrink-0"
                        title="지도에서 열기"
                      >
                        <MapPin className="w-3 h-3 text-emerald-600" />
                        <span>지도</span>
                        <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                      </a>
                    )}
                  </div>

                  {/* Address */}
                  {place.address && (
                    <p className="text-xs text-slate-500 mb-2.5 flex items-center space-x-1">
                      <span>📍 {place.address}</span>
                    </p>
                  )}

                  {/* Notes / Recommendation reasons */}
                  {place.notes && (
                    <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed mb-4">
                      💡 {place.notes}
                    </p>
                  )}
                </div>

                {/* Footer: Voters & Upvote */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  {/* Voters */}
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
                            title={`${voter}님이 가고싶어함`}
                          >
                            {voter[0]}
                          </div>
                        );
                      })}
                    </div>
                    {votes.length > 0 && (
                      <span className="text-[11px] text-slate-500 font-semibold ml-1">
                        {votes.length}표
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={() => votePlace(place.id, currentUser)}
                      className={`flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                        hasVoted
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      <ThumbsUp className={`w-3 h-3 ${hasVoted ? 'fill-white' : ''}`} />
                      <span>{hasVoted ? '여기 가요!' : '가고싶어요'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => deletePlace(place.id)}
                      className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition"
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

      {/* Add Place Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center space-x-2">
              <Utensils className="w-5 h-5 text-emerald-600" />
              <span>새 맛집 / 카페 / 장소 추천하기</span>
            </h3>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  장소 이름 *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="예: 가평 통나무 숯불닭갈비"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  구분
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="맛집">맛집</option>
                  <option value="카페">카페</option>
                  <option value="가볼만한 곳">가볼만한 곳</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  주소 (선택)
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="예: 경기 가평군 설악면 신천리 123"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  네이버 / 카카오 지도 링크 (선택)
                </label>
                <input
                  type="url"
                  value={mapUrl}
                  onChange={(e) => setMapUrl(e.target.value)}
                  placeholder="https://map.naver.com/..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  추천 이유 / 주메뉴 / 특징
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="추천하는 대표 메뉴나 주차 정보 등을 적어주세요..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
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
                  className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition"
                >
                  등록하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Plus,
  Trash2,
  Edit3,
  Users,
  Compass,
  Coffee,
  Utensils,
  Smile,
  FileText,
} from 'lucide-react';
import { useWorkshop } from '../context/WorkshopContext';
import { ScheduleItem } from '../types';

export const ScheduleView: React.FC = () => {
  const { schedules, addSchedule, updateSchedule, deleteSchedule } = useWorkshop();

  const [selectedDay, setSelectedDay] = useState<'Day 1' | 'Day 2' | 'Day 3'>('Day 1');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null);

  // Form state
  const [time, setTime] = useState('14:00 - 15:00');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'이동' | '식사' | '세션' | '팀빌딩' | '휴식' | '기타'>('세션');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');

  const days = ['Day 1', 'Day 2', 'Day 3'] as const;

  const currentSchedules = schedules.filter((s) => s.day === selectedDay);

  const getCategoryIcon = (cat: ScheduleItem['category']) => {
    switch (cat) {
      case '이동':
        return <Compass className="w-3.5 h-3.5 text-blue-500" />;
      case '식사':
        return <Utensils className="w-3.5 h-3.5 text-amber-500" />;
      case '세션':
        return <FileText className="w-3.5 h-3.5 text-indigo-500" />;
      case '팀빌딩':
        return <Smile className="w-3.5 h-3.5 text-purple-500" />;
      case '휴식':
        return <Coffee className="w-3.5 h-3.5 text-emerald-500" />;
      default:
        return <CalendarIcon className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  const getCategoryColor = (cat: ScheduleItem['category']) => {
    switch (cat) {
      case '이동':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case '식사':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case '세션':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case '팀빌딩':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case '휴식':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingItem) {
      await updateSchedule(editingItem.id, {
        day: selectedDay,
        time,
        title,
        category,
        location,
        description,
      });
      setEditingItem(null);
    } else {
      await addSchedule({
        day: selectedDay,
        time,
        title,
        category,
        location,
        description,
        order: schedules.length + 1,
      });
    }

    setTitle('');
    setDescription('');
    setLocation('');
    setShowAddModal(false);
  };

  const openEdit = (item: ScheduleItem) => {
    setEditingItem(item);
    setTime(item.time);
    setTitle(item.title);
    setCategory(item.category);
    setLocation(item.location || '');
    setDescription(item.description || '');
    setShowAddModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Collaboration Callout */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-indigo-500/10 rounded-2xl p-4 border border-amber-200/80 flex items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs">
            🤝
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900">
              일정짜기는 다함께! (유옥 · 현정 · 권웅 · 신혜 · 다온)
            </h3>
            <p className="text-[11px] text-slate-600 mt-0.5">
              실시간으로 일정을 변경하고 추가하면 5명 화면에 즉시 반영됩니다.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingItem(null);
            setTitle('');
            setDescription('');
            setLocation('');
            setShowAddModal(true);
          }}
          className="flex items-center space-x-1 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shrink-0 shadow-2xs transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>일정 추가</span>
        </button>
      </div>

      {/* Day Selector Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          {days.map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedDay === day
                  ? 'bg-slate-900 text-white shadow-md shadow-slate-200 scale-[1.02]'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              {day} {day === 'Day 1' ? '(첫째 날)' : day === 'Day 2' ? '(둘째 날)' : '(셋째 날)'}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline List */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-6">
        {currentSchedules.length === 0 ? (
          <div className="text-center py-10">
            <CalendarIcon className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-500">
              {selectedDay} 일정이 아직 등록되지 않았습니다.
            </p>
            <p className="text-xs text-slate-400 mt-1">
              상단의 '일정 추가' 버튼을 눌러 팀원들과 첫 일정을 짜보세요!
            </p>
          </div>
        ) : (
          <div className="relative border-l-2 border-indigo-100 ml-4 pl-6 space-y-6">
            {currentSchedules.map((item) => (
              <div key={item.id} className="relative group">
                {/* Timeline Dot */}
                <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-white border-2 border-indigo-600 flex items-center justify-center shadow-2xs">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                </div>

                {/* Card Container */}
                <div className="bg-slate-50/70 hover:bg-slate-50 border border-slate-200/80 rounded-2xl p-4 transition duration-200 shadow-2xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="flex items-center space-x-1 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 shadow-2xs">
                        <Clock className="w-3 h-3 text-indigo-500" />
                        <span>{item.time}</span>
                      </span>

                      <span
                        className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-bold border ${getCategoryColor(
                          item.category
                        )}`}
                      >
                        {getCategoryIcon(item.category)}
                        <span>{item.category}</span>
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-1 opacity-80 group-hover:opacity-100 transition">
                      <button
                        type="button"
                        onClick={() => openEdit(item)}
                        className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg transition"
                        title="수정"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteSchedule(item.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg transition"
                        title="삭제"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mb-1">
                    {item.title}
                  </h3>

                  {item.location && (
                    <p className="text-xs text-indigo-600 font-medium flex items-center space-x-1 mb-1.5">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      <span>{item.location}</span>
                    </p>
                  )}

                  {item.description && (
                    <p className="text-xs text-slate-600 leading-relaxed bg-white/80 p-2.5 rounded-xl border border-slate-200/60 mt-2">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Schedule Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-base font-bold text-slate-900 mb-4">
              {editingItem ? '✏️ 일정 수정하기' : '🗓️ 새로운 일정 추가하기'}
            </h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    일자
                  </label>
                  <select
                    value={selectedDay}
                    onChange={(e) => setSelectedDay(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="Day 1">Day 1</option>
                    <option value="Day 2">Day 2</option>
                    <option value="Day 3">Day 3</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    시간 (예: 14:00 - 15:30)
                  </label>
                  <input
                    type="text"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  일정 제목 *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="예: 팀빌딩 활동 & 저녁 레크레이션"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    카테고리
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="이동">이동</option>
                    <option value="식사">식사</option>
                    <option value="세션">세션</option>
                    <option value="팀빌딩">팀빌딩</option>
                    <option value="휴식">휴식</option>
                    <option value="기타">기타</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    장소
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="예: 숙소 대회의실"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  세부설명 / 참고사항
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="추가 세부 일정 정보를 적어주세요..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
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
                  className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition"
                >
                  {editingItem ? '수정 완료' : '추가하기'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

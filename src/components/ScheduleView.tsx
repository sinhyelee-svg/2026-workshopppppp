import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Plus,
  Trash2,
  Edit3,
  Compass,
  Coffee,
  Utensils,
  Smile,
  FileText,
  Sparkles,
  GripVertical,
} from 'lucide-react';
import { useWorkshop } from '../context/WorkshopContext';
import { ScheduleItem } from '../types';

export const ScheduleView: React.FC = () => {
  const { schedules, addSchedule, updateSchedule, deleteSchedule } = useWorkshop();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null);

  // Drag and drop state
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<{ day: 'Day 1' | 'Day 2'; hour: number } | null>(null);

  // Form state
  const [selectedDay, setSelectedDay] = useState<'Day 1' | 'Day 2'>('Day 1');
  const [time, setTime] = useState('10:00 - 11:30');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'이동' | '식사' | '세션' | '팀빌딩' | '휴식' | '기타'>('세션');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');

  const hours = Array.from({ length: 16 }, (_, i) => i + 8); // 8 to 23

  const getStartHour = (timeStr: string): number => {
    const match = timeStr.match(/(\d{1,2}):/);
    if (match) {
      const h = parseInt(match[1], 10);
      if (h >= 8 && h <= 23) return h;
      if (h < 8) return 8;
      if (h > 23) return 23;
    }
    return 12;
  };

  const computeNewTimeOnDrop = (oldTimeStr: string, newStartHour: number): string => {
    const timeParts = oldTimeStr.split('-').map((s) => s.trim());
    let durationMins = 60; // default 1 hr

    if (timeParts.length === 2) {
      const parseMins = (t: string) => {
        const match = t.match(/(\d{1,2}):(\d{2})/);
        if (match) {
          return parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
        }
        return null;
      };
      const startM = parseMins(timeParts[0]);
      const endM = parseMins(timeParts[1]);
      if (startM !== null && endM !== null && endM > startM) {
        durationMins = endM - startM;
      }
    }

    const startHourStr = newStartHour < 10 ? `0${newStartHour}:00` : `${newStartHour}:00`;
    const endTotalMins = newStartHour * 60 + durationMins;
    const endHour = Math.floor(endTotalMins / 60);
    const endMin = endTotalMins % 60;
    const endHourStr = endHour < 10 ? `0${endHour}` : `${endHour}`;
    const endMinStr = endMin < 10 ? `0${endMin}` : `${endMin}`;

    return `${startHourStr} - ${endHourStr}:${endMinStr}`;
  };

  const handleDropOnSlot = async (
    e: React.DragEvent,
    targetDay: 'Day 1' | 'Day 2',
    targetHour: number
  ) => {
    e.preventDefault();
    setDragOverSlot(null);
    const itemId = e.dataTransfer.getData('text/plain') || draggingId;
    if (!itemId) return;

    const item = schedules.find((s) => s.id === itemId);
    if (!item) return;

    const newTime = computeNewTimeOnDrop(item.time, targetHour);
    await updateSchedule(item.id, {
      day: targetDay,
      time: newTime,
    });
    setDraggingId(null);
  };

  const getCategoryIcon = (cat: ScheduleItem['category']) => {
    switch (cat) {
      case '이동':
        return <Compass className="w-3.5 h-3.5 text-blue-500 shrink-0" />;
      case '식사':
        return <Utensils className="w-3.5 h-3.5 text-amber-500 shrink-0" />;
      case '세션':
        return <FileText className="w-3.5 h-3.5 text-emerald-600 shrink-0" />;
      case '팀빌딩':
        return <Smile className="w-3.5 h-3.5 text-teal-600 shrink-0" />;
      case '휴식':
        return <Coffee className="w-3.5 h-3.5 text-emerald-500 shrink-0" />;
      default:
        return <CalendarIcon className="w-3.5 h-3.5 text-slate-500 shrink-0" />;
    }
  };

  const getCategoryBadgeClass = (cat: ScheduleItem['category']) => {
    switch (cat) {
      case '이동':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case '식사':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case '세션':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case '팀빌딩':
        return 'bg-teal-50 text-teal-800 border-teal-200';
      case '휴식':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
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

  const openAddForSlot = (day: 'Day 1' | 'Day 2', hour: number) => {
    setEditingItem(null);
    setSelectedDay(day);
    const startStr = hour < 10 ? `0${hour}:00` : `${hour}:00`;
    const endStr = hour + 1 < 10 ? `0${hour + 1}:00` : `${hour + 1}:00`;
    setTime(`${startStr} - ${endStr}`);
    setTitle('');
    setLocation('');
    setDescription('');
    setShowAddModal(true);
  };

  const openEdit = (item: ScheduleItem) => {
    setEditingItem(item);
    setSelectedDay(item.day);
    setTime(item.time);
    setTitle(item.title);
    setCategory(item.category);
    setLocation(item.location || '');
    setDescription(item.description || '');
    setShowAddModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Collaboration Callout Header */}
      <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-emerald-500/10 rounded-2xl p-4 border border-emerald-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-base shrink-0 shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              🗓️ 일정표
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              08:00~23:00 고정 타임라인에서 일정을 드래그하여 이동 및 시간을 자유롭게 변경할 수 있습니다.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingItem(null);
            setSelectedDay('Day 1');
            setTime('10:00 - 11:30');
            setTitle('');
            setDescription('');
            setLocation('');
            setShowAddModal(true);
          }}
          className="flex items-center justify-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shrink-0 shadow-2xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>일정 추가</span>
        </button>
      </div>

      {/* SINGLE PAGE 2-DAY TIMELINE GRID (08:00 - 23:00) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        {/* Table Header Row: Fixed Left Hour Title + 2 Days */}
        <div className="grid grid-cols-12 bg-slate-100/80 border-b border-slate-200 text-xs font-bold text-slate-700">
          <div className="col-span-2 sm:col-span-2 p-3 text-center border-r border-slate-200 text-slate-500 flex items-center justify-center space-x-1">
            <Clock className="w-3.5 h-3.5" />
            <span>시간</span>
          </div>
          <div className="col-span-5 sm:col-span-5 p-3 text-center border-r border-slate-200 font-extrabold text-emerald-800 bg-emerald-50/70">
            Day 1 (첫째 날)
          </div>
          <div className="col-span-5 sm:col-span-5 p-3 text-center font-extrabold text-teal-800 bg-teal-50/70">
            Day 2 (둘째 날)
          </div>
        </div>

        {/* Hour Rows: 08:00 to 23:00 */}
        <div className="divide-y divide-slate-100">
          {hours.map((hour) => {
            const hourLabel = hour < 10 ? `0${hour}:00` : `${hour}:00`;

            const isOverDay1 = dragOverSlot?.day === 'Day 1' && dragOverSlot?.hour === hour;
            const isOverDay2 = dragOverSlot?.day === 'Day 2' && dragOverSlot?.hour === hour;

            return (
              <div key={hour} className="grid grid-cols-12 min-h-[90px] group hover:bg-slate-50/50 transition">
                {/* Fixed Hour Left Column */}
                <div className="col-span-2 sm:col-span-2 p-2 bg-slate-50 border-r border-slate-200 text-center flex flex-col items-center justify-start pt-3">
                  <span className="text-xs font-extrabold text-slate-700 tracking-tight font-mono">
                    {hourLabel}
                  </span>
                </div>

                {/* Day 1 Slot */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                  }}
                  onDragEnter={() => setDragOverSlot({ day: 'Day 1', hour })}
                  onDragLeave={() => setDragOverSlot(null)}
                  onDrop={(e) => handleDropOnSlot(e, 'Day 1', hour)}
                  className={`col-span-5 sm:col-span-5 p-2.5 border-r border-slate-100 relative min-h-[80px] flex flex-col justify-start space-y-1.5 transition ${
                    isOverDay1 ? 'bg-emerald-100/60 ring-2 ring-emerald-500 ring-inset' : ''
                  }`}
                >
                  {schedules
                    .filter((s) => s.day === 'Day 1' && getStartHour(s.time) === hour)
                    .map((item) => (
                      <div
                        key={item.id}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData('text/plain', item.id);
                          setDraggingId(item.id);
                        }}
                        onDragEnd={() => setDraggingId(null)}
                        className={`bg-white border border-emerald-200 hover:border-emerald-500 rounded-xl p-3 shadow-2xs transition group/card relative cursor-grab active:cursor-grabbing ${
                          draggingId === item.id ? 'opacity-40 scale-95 border-emerald-500' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span
                            className={`inline-flex items-center space-x-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold border ${getCategoryBadgeClass(
                              item.category
                            )}`}
                          >
                            {getCategoryIcon(item.category)}
                            <span>{item.category}</span>
                          </span>
                          <span className="text-[10px] font-bold text-slate-500 font-mono flex items-center space-x-1">
                            <GripVertical className="w-3 h-3 text-slate-300 group-hover/card:text-slate-500" />
                            <span>{item.time}</span>
                          </span>
                        </div>

                        <h4 className="text-xs font-bold text-slate-900 leading-snug">
                          {item.title}
                        </h4>

                        {item.location && (
                          <p className="text-[11px] text-emerald-700 font-medium flex items-center space-x-0.5 mt-0.5">
                            <MapPin className="w-3 h-3 shrink-0" />
                            <span className="truncate">{item.location}</span>
                          </p>
                        )}

                        {item.description && (
                          <p className="text-[10px] text-slate-500 mt-1 line-clamp-2 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                            {item.description}
                          </p>
                        )}

                        {/* Action buttons */}
                        <div className="absolute top-1.5 right-1.5 hidden group-hover/card:flex items-center space-x-0.5 bg-white/90 p-0.5 rounded-lg shadow-2xs border border-slate-200">
                          <button
                            type="button"
                            onClick={() => openEdit(item)}
                            className="p-1 text-slate-400 hover:text-emerald-600 rounded"
                            title="수정"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteSchedule(item.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded"
                            title="삭제"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}

                  {/* Add Slot Button on Hover */}
                  <button
                    type="button"
                    onClick={() => openAddForSlot('Day 1', hour)}
                    className="w-full py-1 border border-dashed border-slate-200 hover:border-emerald-400 rounded-lg text-[10px] text-slate-400 hover:text-emerald-600 hover:bg-emerald-50/50 font-semibold transition opacity-0 group-hover:opacity-100 flex items-center justify-center space-x-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>일정 추가</span>
                  </button>
                </div>

                {/* Day 2 Slot */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                  }}
                  onDragEnter={() => setDragOverSlot({ day: 'Day 2', hour })}
                  onDragLeave={() => setDragOverSlot(null)}
                  onDrop={(e) => handleDropOnSlot(e, 'Day 2', hour)}
                  className={`col-span-5 sm:col-span-5 p-2.5 relative min-h-[80px] flex flex-col justify-start space-y-1.5 transition ${
                    isOverDay2 ? 'bg-teal-100/60 ring-2 ring-teal-500 ring-inset' : ''
                  }`}
                >
                  {schedules
                    .filter((s) => s.day === 'Day 2' && getStartHour(s.time) === hour)
                    .map((item) => (
                      <div
                        key={item.id}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData('text/plain', item.id);
                          setDraggingId(item.id);
                        }}
                        onDragEnd={() => setDraggingId(null)}
                        className={`bg-white border border-teal-200 hover:border-teal-500 rounded-xl p-3 shadow-2xs transition group/card relative cursor-grab active:cursor-grabbing ${
                          draggingId === item.id ? 'opacity-40 scale-95 border-teal-500' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span
                            className={`inline-flex items-center space-x-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold border ${getCategoryBadgeClass(
                              item.category
                            )}`}
                          >
                            {getCategoryIcon(item.category)}
                            <span>{item.category}</span>
                          </span>
                          <span className="text-[10px] font-bold text-slate-500 font-mono flex items-center space-x-1">
                            <GripVertical className="w-3 h-3 text-slate-300 group-hover/card:text-slate-500" />
                            <span>{item.time}</span>
                          </span>
                        </div>

                        <h4 className="text-xs font-bold text-slate-900 leading-snug">
                          {item.title}
                        </h4>

                        {item.location && (
                          <p className="text-[11px] text-teal-700 font-medium flex items-center space-x-0.5 mt-0.5">
                            <MapPin className="w-3 h-3 shrink-0" />
                            <span className="truncate">{item.location}</span>
                          </p>
                        )}

                        {item.description && (
                          <p className="text-[10px] text-slate-500 mt-1 line-clamp-2 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                            {item.description}
                          </p>
                        )}

                        {/* Action buttons */}
                        <div className="absolute top-1.5 right-1.5 hidden group-hover/card:flex items-center space-x-0.5 bg-white/90 p-0.5 rounded-lg shadow-2xs border border-slate-200">
                          <button
                            type="button"
                            onClick={() => openEdit(item)}
                            className="p-1 text-slate-400 hover:text-teal-600 rounded"
                            title="수정"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteSchedule(item.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded"
                            title="삭제"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}

                  {/* Add Slot Button on Hover */}
                  <button
                    type="button"
                    onClick={() => openAddForSlot('Day 2', hour)}
                    className="w-full py-1 border border-dashed border-slate-200 hover:border-teal-400 rounded-lg text-[10px] text-slate-400 hover:text-teal-600 hover:bg-teal-50/50 font-semibold transition opacity-0 group-hover:opacity-100 flex items-center justify-center space-x-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>일정 추가</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add / Edit Schedule Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-base font-bold text-slate-900 mb-4">
              {editingItem ? '✏️ 일정 수정하기' : '🗓️ 새로운 일정 추가하기'}
            </h3>
            <form onSubmit={handleCreateOrUpdate} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    일자 *
                  </label>
                  <select
                    value={selectedDay}
                    onChange={(e) => setSelectedDay(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="Day 1">Day 1 (첫째 날)</option>
                    <option value="Day 2">Day 2 (둘째 날)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    시간 (예: 10:00 - 11:30) *
                  </label>
                  <input
                    type="text"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
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
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
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
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
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
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
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

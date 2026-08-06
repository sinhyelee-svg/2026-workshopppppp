import React, { useState } from 'react';
import {
  Car,
  Users,
  Plus,
  Trash2,
  Shuffle,
  GripVertical,
  X,
  UserCheck,
  Sparkles,
  Info,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import { useWorkshop } from '../context/WorkshopContext';
import { WORKSHOP_MEMBERS, MemberName, GroupItem } from '../types';

export const TeamsView: React.FC = () => {
  const {
    groups,
    addGroup,
    updateGroup,
    deleteGroup,
    assignMemberToGroup,
    removeMemberFromGroup,
    setDriverForCar,
  } = useWorkshop();

  const [activeGroupType, setActiveGroupType] = useState<'car' | 'activity'>('car');
  const [dragOverTarget, setDragOverTarget] = useState<{ groupId: string; slot?: 'driver' | 'passenger' } | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // New Group Form state
  const [groupName, setGroupName] = useState('');
  const [driver, setDriver] = useState<string>('미정');
  const [capacity, setCapacity] = useState<number>(5);
  const [notes, setNotes] = useState('');

  const currentGroups = groups.filter((g) => g.type === activeGroupType);

  // All assigned member names for this group type
  const assignedMemberNames = currentGroups.flatMap((g) => g.members || []);

  // Members not assigned to any group in this tab
  const unassignedMembers = WORKSHOP_MEMBERS.filter(
    (m) => !assignedMemberNames.includes(m.name)
  );

  // Handle Drag Over & Leave
  const handleDragOver = (e: React.DragEvent, groupId: string, slot?: 'driver' | 'passenger') => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverTarget({ groupId, slot });
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverTarget(null);
  };

  // Handle Drop onto group or specific driver slot
  const handleDrop = async (
    e: React.DragEvent,
    groupId: string,
    slot?: 'driver' | 'passenger'
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverTarget(null);

    try {
      const dataStr = e.dataTransfer.getData('application/json');
      if (!dataStr) return;
      const data = JSON.parse(dataStr);
      if (data.type === 'MEMBER' && data.name) {
        const memberName = data.name as MemberName;

        if (activeGroupType === 'car' && slot === 'driver') {
          // Drop directly onto driver slot -> set as car driver (max 1 person)
          await setDriverForCar(groupId, memberName);
        } else {
          // Drop onto general group area -> assign as group member
          await assignMemberToGroup(memberName, groupId, activeGroupType);
        }
      }
    } catch (err) {
      console.error('Drop error:', err);
    }
  };

  // Random Shuffle all 14 members
  const handleRandomShuffle = async () => {
    if (currentGroups.length === 0) return;

    const allMemberNames = WORKSHOP_MEMBERS.map((m) => m.name);
    // Fisher-Yates shuffle
    const shuffled = [...allMemberNames];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    const numGroups = currentGroups.length;
    for (let i = 0; i < currentGroups.length; i++) {
      const g = currentGroups[i];
      const membersForGroup: string[] = [];
      shuffled.forEach((mName, idx) => {
        if (idx % numGroups === i) {
          membersForGroup.push(mName);
        }
      });

      const updates: Partial<GroupItem> = { members: membersForGroup };
      // For cars, assign the first member as driver
      if (g.type === 'car') {
        updates.driver = membersForGroup[0] || '미정';
      }
      await updateGroup(g.id, updates);
    }
  };

  // Create new group handler
  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) return;

    await addGroup({
      type: activeGroupType,
      groupName: groupName.trim(),
      driver: activeGroupType === 'car' ? driver : undefined,
      capacity: activeGroupType === 'car' ? capacity : undefined,
      members: driver && driver !== '미정' ? [driver] : [],
      notes: notes.trim(),
    });

    setGroupName('');
    setNotes('');
    setDriver('미정');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-bold text-slate-900">
              14인 팀원 조 짜기 (차량 3개 · 활동조 4개)
            </h2>
            <span className="text-xs bg-indigo-100 text-indigo-800 px-2.5 py-0.5 rounded-full font-bold">
              드래그 & 드롭
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            이름 태그를 **드래그**하여 아래 **차량 (운전자 칸 / 동승자 칸)**이나 **활동 조**로 이동시켜보세요!
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            type="button"
            onClick={handleRandomShuffle}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold border border-indigo-200 transition"
            title="14명 무작위 조 배치"
          >
            <Shuffle className="w-3.5 h-3.5 text-indigo-600" />
            <span>🎲 14명 랜덤 배치</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setGroupName(
                activeGroupType === 'car'
                  ? `🚘 ${currentGroups.length + 1}호차`
                  : `🎯 ${currentGroups.length + 1}조`
              );
              setShowAddModal(true);
            }}
            className="flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>
              {activeGroupType === 'car' ? '차량 추가' : '활동 조 추가'}
            </span>
          </button>
        </div>
      </div>

      {/* 14 Members Drag Tray */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-4 shadow-lg border border-indigo-900/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center space-x-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <h3 className="text-xs font-bold text-indigo-100 flex items-center space-x-1.5">
              <span>👥 14명 팀원 전체 명단</span>
              <span className="text-[11px] bg-indigo-800/80 text-indigo-200 px-2 py-0.5 rounded-full border border-indigo-700/60">
                미배정: {unassignedMembers.length}명 / 총 14명
              </span>
            </h3>
          </div>
          <p className="text-[11px] text-indigo-300">
            💡 태그를 끌어서 **운전자 칸**에 넣으면 **운전자(1명)**로 등록됩니다!
          </p>
        </div>

        {/* 14 Member Tags */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
          {WORKSHOP_MEMBERS.map((m) => {
            const isAssigned = assignedMemberNames.includes(m.name);
            return (
              <div
                key={m.id}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData(
                    'application/json',
                    JSON.stringify({ type: 'MEMBER', name: m.name })
                  );
                }}
                className={`group relative flex items-center justify-between px-2.5 py-1.5 rounded-xl cursor-grab active:cursor-grabbing select-none transition-all border ${
                  isAssigned
                    ? 'bg-slate-800/50 border-slate-700 text-slate-400 opacity-60 hover:opacity-100'
                    : 'bg-indigo-600/90 border-indigo-400/80 text-white shadow-sm hover:scale-[1.02] hover:bg-indigo-500'
                }`}
              >
                <div className="flex items-center space-x-1.5 min-w-0">
                  <GripVertical className="w-3 h-3 text-slate-400 shrink-0" />
                  <div
                    className={`w-5 h-5 rounded-full ${m.avatarBg} text-white flex items-center justify-center text-[10px] font-bold shrink-0`}
                  >
                    {m.name[0]}
                  </div>
                  <span className="text-xs font-bold truncate">{m.name}</span>
                </div>
                {isAssigned ? (
                  <span className="text-[9px] bg-slate-700 text-slate-300 px-1 rounded">
                    배정됨
                  </span>
                ) : (
                  <span className="text-[9px] bg-emerald-500 text-white px-1 rounded animate-pulse">
                    대기
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Mode Sub-Tabs Toggle */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-3">
        <button
          type="button"
          onClick={() => setActiveGroupType('car')}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeGroupType === 'car'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Car className="w-4 h-4" />
          <span>🚘 차량조 (3개 차량 · 운전자 지정)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveGroupType('activity')}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeGroupType === 'activity'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>🎯 활동조 (4개 팀)</span>
        </button>
      </div>

      {/* CAR GROUPS VIEW */}
      {activeGroupType === 'car' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {currentGroups.length === 0 ? (
            <div className="col-span-3 bg-white rounded-2xl p-10 text-center border border-dashed border-slate-200">
              <Car className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-500">
                등록된 차량이 없습니다.
              </p>
            </div>
          ) : (
            currentGroups.map((group) => {
              const isGroupDragOver =
                dragOverTarget?.groupId === group.id && !dragOverTarget?.slot;
              const isDriverDragOver =
                dragOverTarget?.groupId === group.id && dragOverTarget?.slot === 'driver';
              const isPassengerDragOver =
                dragOverTarget?.groupId === group.id && dragOverTarget?.slot === 'passenger';

              const members = group.members || [];
              const driverName = group.driver && group.driver !== '미정' ? group.driver : null;
              // Passengers are members except the driver
              const passengers = members.filter((m) => m !== driverName);

              return (
                <div
                  key={group.id}
                  onDragOver={(e) => handleDragOver(e, group.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, group.id)}
                  className={`group relative bg-white rounded-3xl border-2 transition-all duration-200 overflow-hidden shadow-sm flex flex-col justify-between ${
                    isGroupDragOver
                      ? 'border-indigo-500 ring-4 ring-indigo-500/20 scale-[1.01]'
                      : 'border-slate-800 hover:shadow-md'
                  }`}
                >
                  {/* CAR SHAPED TOP HEADER (Windshield & License Plate) */}
                  <div className="bg-slate-900 text-white p-4 relative border-b-4 border-indigo-600">
                    {/* Headlights simulation */}
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] bg-amber-400 text-slate-900 px-2 py-0.5 rounded-full font-black tracking-widest shadow-2xs flex items-center gap-1">
                        <span>💡</span> Headlight
                      </span>
                      {/* Licence Plate */}
                      <span className="bg-white text-slate-900 px-3 py-0.5 rounded-md font-black text-xs tracking-wider border border-slate-300 shadow-inner">
                        {group.groupName}
                      </span>
                      <span className="text-[10px] bg-amber-400 text-slate-900 px-2 py-0.5 rounded-full font-black tracking-widest shadow-2xs flex items-center gap-1">
                        Headlight <span>💡</span>
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold">
                          🚘
                        </div>
                        <div>
                          <h3 className="text-sm font-black text-white">
                            {group.groupName}
                          </h3>
                          <p className="text-[11px] text-slate-300">
                            승차인원: {members.length}명 / 최대 {group.capacity || 5}명
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => deleteGroup(group.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
                        title="차량 삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* CAR INTERIOR SEATING LAYOUT */}
                  <div className="p-4 space-y-4 bg-slate-50/80 flex-grow">
                    {/* Notes if any */}
                    {group.notes && (
                      <div className="text-[11px] text-slate-600 bg-amber-50 p-2 rounded-xl border border-amber-200 flex items-start space-x-1">
                        <span className="shrink-0">💡</span>
                        <span>{group.notes}</span>
                      </div>
                    )}

                    {/* FRONT ROW (운전석 & 보조석) */}
                    <div>
                      <div className="text-[10px] font-black text-slate-400 mb-1.5 uppercase tracking-wider flex items-center space-x-1">
                        <span>🪟 앞좌석 (운전석 + 보조석)</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {/* DRIVER SLOT (운전자 칸 - STRICTLY 1 PERSON ONLY) */}
                        <div
                          onDragOver={(e) => handleDragOver(e, group.id, 'driver')}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDrop(e, group.id, 'driver')}
                          className={`p-2.5 rounded-2xl border-2 transition-all flex flex-col justify-between min-h-[90px] ${
                            isDriverDragOver
                              ? 'border-indigo-600 bg-indigo-100/80 ring-2 ring-indigo-400'
                              : driverName
                              ? 'border-indigo-500 bg-indigo-50/90 shadow-2xs'
                              : 'border-dashed border-indigo-300 bg-white hover:border-indigo-500'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-black text-indigo-700 flex items-center space-x-1">
                              <span>🎯 운전자 (1명)</span>
                            </span>
                            <span className="text-[9px] bg-indigo-200 text-indigo-900 px-1.5 py-0.2 rounded-full font-extrabold">
                              운전석
                            </span>
                          </div>

                          {driverName ? (
                            <div className="flex items-center justify-between bg-indigo-600 text-white p-2 rounded-xl shadow-xs">
                              <div className="flex items-center space-x-1.5 min-w-0">
                                <span className="text-xs">🚘</span>
                                <span className="text-xs font-black truncate">{driverName}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => setDriverForCar(group.id, '미정')}
                                className="text-indigo-200 hover:text-white p-0.5"
                                title="운전자 해제"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="text-center py-2">
                              <span className="text-[11px] font-bold text-indigo-500 block">
                                + 운전자 드래그
                              </span>
                              <span className="text-[9px] text-indigo-400">
                                (여기에 이름을 놓으세요)
                              </span>
                            </div>
                          )}

                          {/* Quick Select Driver */}
                          <div className="mt-1">
                            <select
                              value={driverName || '미정'}
                              onChange={(e) => setDriverForCar(group.id, e.target.value)}
                              className="w-full text-[10px] font-bold bg-white border border-indigo-200 rounded-lg px-1.5 py-1 text-slate-700"
                            >
                              <option value="미정">운전자 직접 선택</option>
                              {WORKSHOP_MEMBERS.map((m) => (
                                <option key={m.id} value={m.name}>
                                  {m.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* PASSENGER SLOT INFO (보조석) */}
                        <div className="p-2.5 rounded-2xl border border-slate-200 bg-white flex flex-col justify-between min-h-[90px]">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-black text-slate-500">🪑 보조석</span>
                            <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.2 rounded-full">
                              동승1
                            </span>
                          </div>
                          {passengers.length > 0 ? (
                            <div className="bg-slate-100 text-slate-800 p-2 rounded-xl text-xs font-bold flex items-center justify-between">
                              <span className="truncate">{passengers[0]}</span>
                              <span className="text-[9px] text-slate-400">동승자</span>
                            </div>
                          ) : (
                            <div className="text-center py-2 text-[10px] text-slate-400">
                              비어있음
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* BACK ROW (뒷좌석 동승자 Dropzone) */}
                    <div>
                      <div className="text-[10px] font-black text-slate-400 mb-1.5 uppercase tracking-wider flex items-center justify-between">
                        <span>💺 뒷좌석 & 동승자 ({passengers.length}명)</span>
                        <span className="text-[10px] text-indigo-600 font-bold">
                          드래그하여 탑승
                        </span>
                      </div>

                      <div
                        onDragOver={(e) => handleDragOver(e, group.id, 'passenger')}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, group.id, 'passenger')}
                        className={`min-h-[90px] p-2.5 rounded-2xl border-2 transition-all flex flex-wrap gap-1.5 content-start items-center ${
                          isPassengerDragOver || isGroupDragOver
                            ? 'border-indigo-500 bg-indigo-50/80 ring-2 ring-indigo-300'
                            : 'border-dashed border-slate-300 bg-white'
                        }`}
                      >
                        {passengers.length === 0 ? (
                          <div className="w-full text-center py-4 text-xs text-slate-400 font-medium">
                            여기로 팀원 태그를 드래그해서 배치하세요!
                          </div>
                        ) : (
                          passengers.map((memberName) => {
                            const mInfo = WORKSHOP_MEMBERS.find((m) => m.name === memberName);
                            return (
                              <div
                                key={memberName}
                                className={`flex items-center space-x-1 px-2.5 py-1 rounded-xl text-xs font-bold border shadow-2xs ${
                                  mInfo
                                    ? mInfo.badgeBg
                                    : 'bg-white text-slate-700 border-slate-200'
                                }`}
                              >
                                <div
                                  className={`w-3.5 h-3.5 rounded-full ${
                                    mInfo?.avatarBg || 'bg-indigo-500'
                                  } text-white flex items-center justify-center text-[9px]`}
                                >
                                  {memberName[0]}
                                </div>
                                <span>{memberName}</span>
                                <button
                                  type="button"
                                  onClick={() => removeMemberFromGroup(group.id, memberName)}
                                  className="text-slate-400 hover:text-rose-600 ml-1"
                                  title="차량에서 제외"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>

                  {/* CAR WHEELS & FOOTER DECORATION */}
                  <div className="p-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs">
                    <span className="text-[10px] font-extrabold text-slate-500 flex items-center gap-1">
                      <span>🛞</span> 바퀴 안전 점검 완료
                    </span>
                    {/* Quick Add Member button */}
                    <div className="flex flex-wrap gap-1">
                      {WORKSHOP_MEMBERS.map((m) => {
                        const isInThisGroup = members.includes(m.name);
                        if (isInThisGroup) return null;
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => assignMemberToGroup(m.name, group.id, 'car')}
                            className="px-1.5 py-0.5 text-[9px] font-bold bg-white hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 rounded border border-slate-200 transition"
                          >
                            + {m.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* ACTIVITY GROUPS VIEW (4개 조) */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {currentGroups.length === 0 ? (
            <div className="col-span-full bg-white rounded-2xl p-10 text-center border border-dashed border-slate-200">
              <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-500">
                등록된 활동 조가 없습니다.
              </p>
            </div>
          ) : (
            currentGroups.map((group) => {
              const isDragOver = dragOverTarget?.groupId === group.id;
              const members = group.members || [];

              return (
                <div
                  key={group.id}
                  onDragOver={(e) => handleDragOver(e, group.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, group.id)}
                  className={`bg-white rounded-3xl p-5 border-2 transition-all duration-200 flex flex-col justify-between shadow-sm ${
                    isDragOver
                      ? 'border-indigo-500 ring-4 ring-indigo-500/20 bg-indigo-50/40 scale-[1.01]'
                      : 'border-slate-200 hover:border-indigo-300 hover:shadow-md'
                  }`}
                >
                  <div>
                    {/* Title & Badge */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-1.5">
                        <h3 className="text-base font-black text-slate-900">
                          {group.groupName}
                        </h3>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                          {members.length}명
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => deleteGroup(group.id)}
                        className="p-1.5 text-slate-300 hover:text-rose-600 rounded-lg transition"
                        title="조 삭제"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Notes */}
                    {group.notes && (
                      <p className="text-xs text-slate-500 mb-3 bg-slate-50 p-2 rounded-xl border border-slate-100">
                        💡 {group.notes}
                      </p>
                    )}

                    {/* Members Container Dropzone */}
                    <div className="min-h-[140px] p-3 rounded-2xl bg-slate-50/80 border-2 border-dashed border-slate-200 flex flex-col gap-2">
                      {members.length === 0 ? (
                        <div className="text-center py-8 text-xs text-slate-400 font-medium">
                          팀원 태그를 끌어서 놓으세요!
                        </div>
                      ) : (
                        members.map((memberName) => {
                          const mInfo = WORKSHOP_MEMBERS.find((m) => m.name === memberName);
                          return (
                            <div
                              key={memberName}
                              className={`flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-bold border shadow-2xs ${
                                mInfo
                                  ? mInfo.badgeBg
                                  : 'bg-white text-slate-700 border-slate-200'
                              }`}
                            >
                              <div className="flex items-center space-x-2">
                                <div
                                  className={`w-4 h-4 rounded-full ${
                                    mInfo?.avatarBg || 'bg-indigo-500'
                                  } text-white flex items-center justify-center text-[9px]`}
                                >
                                  {memberName[0]}
                                </div>
                                <span>{memberName}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeMemberFromGroup(group.id, memberName)}
                                className="text-slate-400 hover:text-rose-600"
                                title="조에서 제외"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Quick Member Add */}
                  <div className="mt-4 pt-2 border-t border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold block mb-1">
                      클릭 추가:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {WORKSHOP_MEMBERS.map((m) => {
                        const isInThisGroup = members.includes(m.name);
                        if (isInThisGroup) return null;
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => assignMemberToGroup(m.name, group.id, 'activity')}
                            className="px-1.5 py-0.5 text-[9px] font-bold bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 rounded border border-slate-200 transition"
                          >
                            + {m.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Add Group Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-base font-bold text-slate-900 mb-4">
              {activeGroupType === 'car' ? '🚘 새로운 차량 추가' : '🎯 새로운 활동 조 추가'}
            </h3>

            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  이름 *
                </label>
                <input
                  type="text"
                  required
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder={
                    activeGroupType === 'car' ? '예: 4호차 (SUV)' : '예: 5조 (열정 조)'
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {activeGroupType === 'car' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      운전자 (1명)
                    </label>
                    <select
                      value={driver}
                      onChange={(e) => setDriver(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
                    >
                      <option value="미정">미정</option>
                      {WORKSHOP_MEMBERS.map((m) => (
                        <option key={m.id} value={m.name}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      최대 승차 인원
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={capacity}
                      onChange={(e) => setCapacity(parseInt(e.target.value) || 5)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  메모 / 설명
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="예: 트렁크 짐 보관 여유 있음"
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
                  생성하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

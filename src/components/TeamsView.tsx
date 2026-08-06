import React, { useState } from 'react';
import {
  Car,
  Users,
  Plus,
  Trash2,
  Shuffle,
  X,
  UserCheck,
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
  const [showAddModal, setShowAddModal] = useState(false);

  // New Group Form state
  const [groupName, setGroupName] = useState('');
  const [driver, setDriver] = useState<string>('미정');
  const [notes, setNotes] = useState('');

  const currentGroups = groups.filter((g) => g.type === activeGroupType);

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

  // Create new group handler (Fixed Firestore undefined values issue)
  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) return;

    const groupPayload: Omit<GroupItem, 'id'> = {
      type: activeGroupType,
      groupName: groupName.trim(),
      members: activeGroupType === 'car' && driver && driver !== '미정' ? [driver] : [],
      notes: notes.trim(),
    };

    if (activeGroupType === 'car') {
      groupPayload.driver = driver;
    }

    await addGroup(groupPayload);

    setGroupName('');
    setNotes('');
    setDriver('미정');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-bold text-slate-900">
              👥 14인 팀원 조 짜기 ({activeGroupType === 'car' ? '차량조' : '활동조'})
            </h2>
            <span className="text-xs bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold">
              {currentGroups.length}개 {activeGroupType === 'car' ? '차량' : '활동 조'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            원하는 멤버를 클릭하여 빠르게 팀을 구성하고 운전자를 지정하세요.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            type="button"
            onClick={handleRandomShuffle}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 transition"
            title="14명 무작위 조 배치"
          >
            <Shuffle className="w-3.5 h-3.5 text-slate-600" />
            <span>🎲 14명 랜덤 배치</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setGroupName(
                activeGroupType === 'car'
                  ? `${currentGroups.length + 1}호차`
                  : `${currentGroups.length + 1}조`
              );
              setShowAddModal(true);
            }}
            className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>
              {activeGroupType === 'car' ? '차량 추가' : '활동 조 추가'}
            </span>
          </button>
        </div>
      </div>

      {/* Mode Sub-Tabs Toggle */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-3">
        <button
          type="button"
          onClick={() => setActiveGroupType('car')}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeGroupType === 'car'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-100'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Car className="w-4 h-4" />
          <span>🚘 차량조 (차량별 탑승 인원 & 운전자)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveGroupType('activity')}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeGroupType === 'activity'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-100'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>🎯 활동조 (워크숍 활동 팀)</span>
        </button>
      </div>

      {/* CAR GROUPS VIEW (Standard Rectangle Square Box Layout) */}
      {activeGroupType === 'car' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {currentGroups.length === 0 ? (
            <div className="col-span-3 bg-white rounded-2xl p-10 text-center border border-dashed border-slate-200">
              <Car className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-500">
                등록된 차량이 없습니다.
              </p>
            </div>
          ) : (
            currentGroups.map((group) => {
              const members = group.members || [];
              const driverName = group.driver && group.driver !== '미정' ? group.driver : null;
              const passengers = members.filter((m) => m !== driverName);

              return (
                <div
                  key={group.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col justify-between p-5 hover:border-slate-300 transition-all"
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-2xs">
                          🚘
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">
                            {group.groupName}
                          </h3>
                          <span className="text-[11px] text-slate-500 font-medium">
                            탑승 {members.length}명
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => deleteGroup(group.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="차량 삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Notes */}
                    {group.notes && (
                      <div className="text-xs text-slate-600 bg-amber-50/80 p-2.5 rounded-xl border border-amber-200/80 flex items-start space-x-1.5">
                        <span className="shrink-0 text-amber-700 font-bold">💡</span>
                        <span>{group.notes}</span>
                      </div>
                    )}

                    {/* DRIVER SLOT */}
                    <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/60 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
                        <span className="flex items-center space-x-1">
                          <span>🎯 운전자</span>
                        </span>
                        <span className="text-[10px] bg-emerald-200 text-emerald-800 px-1.5 py-0.5 rounded-full font-bold">
                          운전석
                        </span>
                      </div>

                      <select
                        value={driverName || '미정'}
                        onChange={(e) => setDriverForCar(group.id, e.target.value)}
                        className="w-full text-xs font-bold bg-white border border-emerald-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="미정">운전자 선택 (미정)</option>
                        {WORKSHOP_MEMBERS.map((m) => (
                          <option key={m.id} value={m.name}>
                            {m.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* PASSENGERS LIST */}
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-slate-600 block">
                        💺 동승자 ({passengers.length}명)
                      </span>

                      <div className="min-h-[70px] p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap gap-1.5 align-start">
                        {passengers.length === 0 ? (
                          <span className="text-xs text-slate-400 font-medium my-auto mx-auto py-2">
                            동승자가 없습니다. 아래 버튼으로 추가해보세요.
                          </span>
                        ) : (
                          passengers.map((memberName) => {
                            const mInfo = WORKSHOP_MEMBERS.find((m) => m.name === memberName);
                            return (
                              <div
                                key={memberName}
                                className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${
                                  mInfo
                                    ? mInfo.badgeBg
                                    : 'bg-white text-slate-700 border-slate-200'
                                }`}
                              >
                                <div
                                  className={`w-4 h-4 rounded-full ${
                                    mInfo?.avatarBg || 'bg-emerald-500'
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

                  {/* QUICK MEMBER ADD */}
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 block mb-1">
                      탑승자 추가 클릭:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {WORKSHOP_MEMBERS.map((m) => {
                        const isInThisGroup = members.includes(m.name);
                        if (isInThisGroup) return null;
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => assignMemberToGroup(m.name, group.id, 'car')}
                            className="px-1.5 py-0.5 text-[10px] font-bold bg-slate-100 hover:bg-emerald-50 hover:text-emerald-600 text-slate-600 rounded-md border border-slate-200 transition"
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
        /* ACTIVITY GROUPS VIEW (Standard Rectangle Square Box Layout) */
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
              const members = group.members || [];

              return (
                <div
                  key={group.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition-all"
                >
                  <div className="space-y-3">
                    {/* Title & Badge */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-sm font-bold text-slate-900">
                          {group.groupName}
                        </h3>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                          {members.length}명
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => deleteGroup(group.id)}
                        className="p-1 text-slate-300 hover:text-rose-600 rounded-lg transition"
                        title="조 삭제"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Notes */}
                    {group.notes && (
                      <p className="text-xs text-slate-500 bg-slate-50 p-2 rounded-xl border border-slate-100">
                        💡 {group.notes}
                      </p>
                    )}

                    {/* Members List Container */}
                    <div className="min-h-[120px] p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-1.5">
                      {members.length === 0 ? (
                        <div className="text-center py-6 text-xs text-slate-400 font-medium">
                          조원이 없습니다. 아래에서 팀원을 추가해보세요.
                        </div>
                      ) : (
                        members.map((memberName) => {
                          const mInfo = WORKSHOP_MEMBERS.find((m) => m.name === memberName);
                          return (
                            <div
                              key={memberName}
                              className={`flex items-center justify-between px-2.5 py-1 rounded-lg text-xs font-bold border ${
                                mInfo
                                  ? mInfo.badgeBg
                                  : 'bg-white text-slate-700 border-slate-200'
                              }`}
                            >
                              <div className="flex items-center space-x-2">
                                <div
                                  className={`w-4 h-4 rounded-full ${
                                    mInfo?.avatarBg || 'bg-emerald-500'
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
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold block mb-1">
                      팀원 추가 클릭:
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
                            className="px-1.5 py-0.5 text-[10px] font-bold bg-slate-100 hover:bg-emerald-50 hover:text-emerald-600 text-slate-600 rounded-md border border-slate-200 transition"
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
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
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
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {activeGroupType === 'car' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    운전자 지정
                  </label>
                  <select
                    value={driver}
                    onChange={(e) => setDriver(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="미정">미정</option>
                    {WORKSHOP_MEMBERS.map((m) => (
                      <option key={m.id} value={m.name}>
                        {m.name}
                      </option>
                    ))}
                  </select>
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

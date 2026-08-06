import React from 'react';
import { GripVertical, UserPlus, Info } from 'lucide-react';
import { WORKSHOP_MEMBERS, MemberName } from '../types';
import { useWorkshop } from '../context/WorkshopContext';

interface MemberTrayProps {
  compact?: boolean;
}

export const MemberTray: React.FC<MemberTrayProps> = ({ compact = false }) => {
  const { tasks, currentUser, setCurrentUser } = useWorkshop();

  // Calculate assigned tasks count for each member
  const getTaskCount = (memberName: MemberName) => {
    return tasks.filter((t) => t.assignee === memberName).length;
  };

  const handleDragStart = (e: React.DragEvent, memberName: MemberName) => {
    e.dataTransfer.setData(
      'application/json',
      JSON.stringify({ type: 'MEMBER', name: memberName })
    );
    e.dataTransfer.effectAllowed = 'copyMove';
  };

  return (
    <div className="bg-white rounded-2xl p-4.5 shadow-2xs mb-6 border border-slate-200/90 space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center space-x-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
          <h2 className="text-sm font-bold tracking-tight text-slate-900 flex items-center space-x-1.5">
            <span>👥 전체 팀원 드래그 배정</span>
          </h2>
          <span className="text-[11px] bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-200 font-bold">
            {WORKSHOP_MEMBERS.length}명 참여
          </span>
        </div>
        <p className="text-xs text-slate-500 flex items-center space-x-1">
          <Info className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>팀원 이름 태그를 **드래그**하여 체크리스트 및 작업에 손쉽게 배정해주세요!</span>
        </p>
      </div>

      {/* Member Drag Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
        {WORKSHOP_MEMBERS.map((member) => {
          const taskCount = getTaskCount(member.name);
          const isCurrent = currentUser === member.name;

          return (
            <div
              key={member.id}
              draggable
              onDragStart={(e) => handleDragStart(e, member.name)}
              className={`group relative flex items-center justify-between p-2 rounded-xl cursor-grab active:cursor-grabbing select-none transition-all duration-200 border ${
                isCurrent
                  ? 'bg-emerald-600 border-emerald-700 ring-2 ring-emerald-200 text-white shadow-xs'
                  : 'bg-slate-50 hover:bg-emerald-50/70 border-slate-200 hover:border-emerald-300 text-slate-800'
              }`}
            >
              <div className="flex items-center space-x-2 min-w-0">
                <GripVertical className={`w-3.5 h-3.5 shrink-0 ${isCurrent ? 'text-emerald-200' : 'text-slate-400 group-hover:text-emerald-600'}`} />
                <div
                  className={`w-6 h-6 rounded-full ${member.avatarBg} flex items-center justify-center text-white text-[11px] font-bold shrink-0 shadow-2xs`}
                >
                  {member.name[0]}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center space-x-1">
                    <span className="text-xs font-bold truncate">
                      {member.name}
                    </span>
                  </div>
                </div>
              </div>

              {/* Task Count Badge */}
              <div
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                  isCurrent
                    ? 'bg-emerald-700/80 text-emerald-100'
                    : taskCount > 0
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : 'bg-slate-200/70 text-slate-500'
                }`}
                title={`담당 역할 ${taskCount}개`}
              >
                {taskCount}개
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

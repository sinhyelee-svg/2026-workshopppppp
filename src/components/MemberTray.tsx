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
    <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white rounded-2xl p-4 shadow-lg mb-6 border border-emerald-900/40">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div className="flex items-center space-x-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
          <h2 className="text-sm font-bold tracking-tight text-emerald-100 flex items-center space-x-1.5">
            <span>👥 전체 팀원 드래그 배정</span>
          </h2>
          <span className="text-[11px] bg-emerald-800/60 text-emerald-200 px-2 py-0.5 rounded-full border border-emerald-700/50">
            {WORKSHOP_MEMBERS.length}명 참여
          </span>
        </div>
        <p className="text-xs text-emerald-300 flex items-center space-x-1">
          <Info className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>팀원 이름 태그를 **드래그**하여 차량조 및 활동조에 배정해주세요!</span>
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
              className={`group relative flex items-center justify-between p-2.5 rounded-xl cursor-grab active:cursor-grabbing select-none transition-all duration-200 border shadow-xs ${
                isCurrent
                  ? 'bg-emerald-600/90 border-emerald-400/80 ring-2 ring-emerald-400/40 text-white'
                  : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700/60 hover:border-emerald-500/50 text-slate-200'
              }`}
            >
              <div className="flex items-center space-x-2 min-w-0">
                <GripVertical className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-300 shrink-0" />
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
                  taskCount > 0
                    ? 'bg-emerald-500/30 text-emerald-200 border border-emerald-400/30'
                    : 'bg-slate-700/60 text-slate-400'
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

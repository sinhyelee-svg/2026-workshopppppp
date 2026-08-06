import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Clock,
  Plus,
  Trash2,
  User,
  Grip,
  Edit2,
  Sparkles,
  Filter,
  Check,
  ChevronDown,
} from 'lucide-react';
import { useWorkshop } from '../context/WorkshopContext';
import { Task, MemberName, WORKSHOP_MEMBERS, TaskStatus } from '../types';

export const ChecklistView: React.FC = () => {
  const {
    tasks,
    assignTask,
    updateTaskStatus,
    addTask,
    deleteTask,
    updateTask,
    currentUser,
  } = useWorkshop();

  const [dragOverTaskId, setDragOverTaskId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('전체');
  const [filterStatus, setFilterStatus] = useState<string>('전체');

  // New task form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('운영');
  const [newAssignee, setNewAssignee] = useState<MemberName | '미정'>('미정');
  const [newNotes, setNewNotes] = useState('');

  // Editing notes ID state
  const [editingNotesTaskId, setEditingNotesTaskId] = useState<string | null>(null);
  const [editingNotesText, setEditingNotesText] = useState('');

  // Categories list
  const categories = ['전체', '행정/기안', '재무/예산', '답사/식음료', '코스/관광', '프로그램', '운영', '기획'];

  // Core 5 Task Assignee Members
  const CORE_MEMBER_NAMES: MemberName[] = ['유옥', '현정', '권웅', '신혜', '다온'];
  const coreMembers = WORKSHOP_MEMBERS.filter((m) =>
    CORE_MEMBER_NAMES.includes(m.name as MemberName)
  );

  // Handle Drag Over & Drop
  const handleDragOver = (e: React.DragEvent, taskId: string) => {
    e.preventDefault();
    setDragOverTaskId(taskId);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverTaskId(null);
  };

  const handleDrop = async (e: React.DragEvent, taskId: string) => {
    e.preventDefault();
    setDragOverTaskId(null);
    try {
      const dataStr = e.dataTransfer.getData('application/json');
      if (dataStr) {
        const data = JSON.parse(dataStr);
        if (data.type === 'MEMBER' && data.name) {
          await assignTask(taskId, data.name as MemberName);
        }
      }
    } catch (err) {
      console.error('Failed to handle drop task assignee:', err);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    await addTask({
      title: newTitle.trim(),
      category: newCategory,
      assignee: newAssignee,
      status: 'todo',
      notes: newNotes.trim(),
      order: tasks.length + 1,
    });

    setNewTitle('');
    setNewNotes('');
    setNewAssignee('미정');
    setShowAddModal(false);
  };

  const handleSaveNotes = async (taskId: string) => {
    await updateTask(taskId, { notes: editingNotesText });
    setEditingNotesTaskId(null);
  };

  // Filtered tasks
  const filteredTasks = tasks.filter((t) => {
    const matchCat = filterCategory === '전체' || t.category === filterCategory;
    const matchStatus =
      filterStatus === '전체' ||
      (filterStatus === 'todo' && t.status === 'todo') ||
      (filterStatus === 'in_progress' && t.status === 'in_progress') ||
      (filterStatus === 'done' && t.status === 'done');
    return matchCat && matchStatus;
  });

  // Calculate statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'done').length;
  const assignedTasks = tasks.filter((t) => t.assignee !== '미정').length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header & Progress Stats */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <span>📋 역할 분담 & 체크리스트</span>
              <span className="text-xs bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-bold">
                {completedTasks}/{totalTasks} 완료
              </span>
            </h2>
          </div>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>새 할 일 추가</span>
          </button>
        </div>

        {/* Progress bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-semibold text-slate-600">
            <span>워크샵 준비 진행률 ({progressPercent}%)</span>
            <span>담당자 지정률: {assignedTasks}/{totalTasks}명</span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
            <div
              className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-full transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Category filter */}
        <div className="flex items-center space-x-1.5 overflow-x-auto py-1 no-scrollbar">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 mr-1" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                filterCategory === cat
                  ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Status filter */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl">
          {[
            { id: '전체', label: '전체' },
            { id: 'todo', label: '대기' },
            { id: 'in_progress', label: '진행중' },
            { id: 'done', label: '완료' },
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => setFilterStatus(s.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                filterStatus === s.id
                  ? 'bg-white text-slate-900 font-bold shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tasks List (Dropzone enabled) */}
      <div className="grid grid-cols-1 gap-3.5">
        {filteredTasks.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-dashed border-slate-200">
            <p className="text-sm font-semibold text-slate-500">
              해당하는 할 일이 없습니다.
            </p>
            <p className="text-xs text-slate-400 mt-1">
              '새 할 일 추가' 버튼을 눌러 목록을 구성해 보세요!
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isDragOver = dragOverTaskId === task.id;
            const assigneeInfo = WORKSHOP_MEMBERS.find((m) => m.name === task.assignee);
            const isMyTask = task.assignee === currentUser;

            return (
              <div
                key={task.id}
                onDragOver={(e) => handleDragOver(e, task.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, task.id)}
                className={`group relative bg-white rounded-2xl p-4 border transition-all duration-200 ${
                  isDragOver
                    ? 'border-emerald-500 ring-4 ring-emerald-500/10 bg-emerald-50/40 scale-[1.01]'
                    : task.status === 'done'
                    ? 'border-slate-200/60 bg-slate-50/60 opacity-80'
                    : 'border-slate-200 hover:border-slate-300 shadow-2xs'
                }`}
              >
                {/* Drag over overlay hint */}
                {isDragOver && (
                  <div className="absolute inset-0 bg-emerald-600/10 rounded-2xl flex items-center justify-center border-2 border-dashed border-emerald-500 pointer-events-none z-10">
                    <span className="bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-md flex items-center space-x-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>이 할 일에 담당자 배정하기</span>
                    </span>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Left: Status Checkbox & Title */}
                  <div className="flex items-start space-x-3 min-w-0 flex-1">
                    {/* Status Toggle Button */}
                    <button
                      type="button"
                      onClick={() => {
                        const nextStatus: TaskStatus =
                          task.status === 'todo'
                            ? 'in_progress'
                            : task.status === 'in_progress'
                            ? 'done'
                            : 'todo';
                        updateTaskStatus(task.id, nextStatus);
                      }}
                      className="mt-0.5 text-slate-400 hover:text-emerald-600 transition shrink-0"
                      title="상태 변경 (대기 -> 진행중 -> 완료)"
                    >
                      {task.status === 'done' ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-50" />
                      ) : task.status === 'in_progress' ? (
                        <Clock className="w-5 h-5 text-amber-500" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-300 hover:text-slate-400" />
                      )}
                    </button>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200/80">
                          {task.category}
                        </span>

                        {/* Status Badge */}
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            task.status === 'done'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : task.status === 'in_progress'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {task.status === 'done'
                            ? '완료'
                            : task.status === 'in_progress'
                            ? '진행중'
                            : '대기'}
                        </span>
                      </div>

                      <h3
                        className={`text-sm font-bold text-slate-900 mt-1 ${
                          task.status === 'done' ? 'line-through text-slate-400' : ''
                        }`}
                      >
                        {task.title}
                      </h3>

                      {/* Notes Section */}
                      {editingNotesTaskId === task.id ? (
                        <div className="mt-2 flex items-center space-x-2">
                          <input
                            type="text"
                            value={editingNotesText}
                            onChange={(e) => setEditingNotesText(e.target.value)}
                            className="flex-1 px-2.5 py-1 text-xs border border-emerald-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                            placeholder="메모를 입력하세요..."
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveNotes(task.id)}
                            className="px-2.5 py-1 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700"
                          >
                            저장
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingNotesTaskId(null)}
                            className="px-2 py-1 text-slate-400 hover:text-slate-600 text-xs"
                          >
                            취소
                          </button>
                        </div>
                      ) : (
                        <div className="mt-1 flex items-center space-x-2 text-xs text-slate-500">
                          {task.notes && <span>💡 {task.notes}</span>}
                          <button
                            type="button"
                            onClick={() => {
                              setEditingNotesTaskId(task.id);
                              setEditingNotesText(task.notes || '');
                            }}
                            className="text-slate-400 hover:text-emerald-600 opacity-0 group-hover:opacity-100 transition p-0.5"
                            title="메모 수정"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Assignee Badge & Quick Actions */}
                  <div className="flex items-center justify-between sm:justify-end space-x-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 shrink-0">
                    {/* Assignee Selector Dropdown / Badge */}
                    <div className="relative group/assignee">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-[11px] text-slate-400 font-medium hidden xs:inline">
                          담당자:
                        </span>
                        <div
                          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition shadow-2xs ${
                            assigneeInfo
                              ? assigneeInfo.badgeBg
                              : 'bg-slate-100 text-slate-500 border-dashed border-slate-300 hover:bg-slate-200'
                          }`}
                        >
                          {assigneeInfo ? (
                            <>
                              <div className={`w-3.5 h-3.5 rounded-full ${assigneeInfo.avatarBg} text-white flex items-center justify-center text-[9px]`}>
                                {assigneeInfo.name[0]}
                              </div>
                              <span>{assigneeInfo.name}</span>
                            </>
                          ) : (
                            <>
                              <User className="w-3.5 h-3.5 text-slate-400" />
                              <span>미정 (드래그/클릭)</span>
                            </>
                          )}
                          <ChevronDown className="w-3 h-3 opacity-60 ml-0.5" />
                        </div>
                      </div>

                      {/* Dropdown Menu to click-assign */}
                      <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-30 hidden group-hover/assignee:block">
                        <div className="px-3 py-1 text-[10px] text-slate-400 font-bold border-b border-slate-100">
                          담당자 지정
                        </div>
                        <button
                          type="button"
                          onClick={() => assignTask(task.id, '미정')}
                          className="w-full text-left px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-50 font-medium"
                        >
                          미정 (해제)
                        </button>
                        {coreMembers.map((m) => (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => assignTask(task.id, m.name)}
                            className={`w-full text-left px-3 py-1.5 text-xs flex items-center space-x-2 hover:bg-slate-50 font-medium ${
                              task.assignee === m.name ? 'font-bold text-emerald-600 bg-emerald-50' : 'text-slate-700'
                            }`}
                          >
                            <div className={`w-2 h-2 rounded-full ${m.avatarBg}`} />
                            <span>{m.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Quick "Assign Me" button if unassigned */}
                    {task.assignee !== currentUser && (
                      <button
                        type="button"
                        onClick={() => assignTask(task.id, currentUser)}
                        className="px-2.5 py-1 text-[11px] font-semibold text-emerald-600 hover:bg-emerald-50 rounded-lg border border-emerald-200 transition"
                        title="내가 이 할 일 맡기"
                      >
                        내 담당
                      </button>
                    )}

                    {/* Delete task */}
                    <button
                      type="button"
                      onClick={() => deleteTask(task.id)}
                      className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
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

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-base font-bold text-slate-900 mb-4">
              ✨ 새로운 역할 / 할 일 추가하기
            </h3>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  할 일 제목 *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="예: 저녁 바베큐 재료 장보기 리스트 작성"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    카테고리
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    {categories.filter((c) => c !== '전체').map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    담당자
                  </label>
                  <select
                    value={newAssignee}
                    onChange={(e) => setNewAssignee(e.target.value as MemberName | '미정')}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="미정">미정</option>
                    {coreMembers.map((m) => (
                      <option key={m.id} value={m.name}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  메모 / 세부사항
                </label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="참고사항을 입력해주세요..."
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
                  추가하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import {
  Wallet,
  Plus,
  Trash2,
  Edit3,
  Search,
  Filter,
  DollarSign,
  TrendingUp,
  PieChart,
  CheckCircle2,
  AlertCircle,
  Building2,
  Utensils,
  Car,
  PartyPopper,
  Coffee,
  MoreHorizontal,
  UserCheck,
  Receipt,
  Sparkles,
  ArrowUpDown,
} from 'lucide-react';
import { useWorkshop } from '../context/WorkshopContext';
import { BudgetItem, WORKSHOP_MEMBERS, MemberName } from '../types';
import { TOTAL_BUDGET_LIMIT } from '../data/initialData';

export const BudgetView: React.FC = () => {
  const { budgets, addBudget, updateBudget, deleteBudget, currentUser } = useWorkshop();

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null);

  // Form State
  const [itemTitle, setItemTitle] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [payer, setPayer] = useState<MemberName | string>(currentUser);
  const [category, setCategory] = useState<BudgetItem['category']>('식비');
  const [date, setDate] = useState('10/18');
  const [notes, setNotes] = useState('');

  // Filter & Search State
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');
  const [selectedPayer, setSelectedPayer] = useState<string>('전체');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<'createdAt' | 'amount'>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Calculations
  const totalSpent = budgets.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const remainingBudget = TOTAL_BUDGET_LIMIT - totalSpent;
  const usagePercentage = Math.min(
    100,
    Math.max(0, (totalSpent / TOTAL_BUDGET_LIMIT) * 100)
  );
  const exactPercentageStr = ((totalSpent / TOTAL_BUDGET_LIMIT) * 100).toFixed(1);

  // Category totals breakdown
  const categoryTotals = budgets.reduce((acc, item) => {
    const cat = item.category || '기타';
    acc[cat] = (acc[cat] || 0) + (Number(item.amount) || 0);
    return acc;
  }, {} as Record<string, number>);

  const categoryOptions: BudgetItem['category'][] = [
    '숙소',
    '식비',
    '교통',
    '레크레이션',
    '간식',
    '기타',
  ];

  const getCategoryIcon = (cat: BudgetItem['category']) => {
    switch (cat) {
      case '숙소':
        return <Building2 className="w-3.5 h-3.5 text-blue-600" />;
      case '식비':
        return <Utensils className="w-3.5 h-3.5 text-amber-600" />;
      case '교통':
        return <Car className="w-3.5 h-3.5 text-emerald-600" />;
      case '레크레이션':
        return <PartyPopper className="w-3.5 h-3.5 text-purple-600" />;
      case '간식':
        return <Coffee className="w-3.5 h-3.5 text-rose-600" />;
      default:
        return <Receipt className="w-3.5 h-3.5 text-slate-600" />;
    }
  };

  const getCategoryBadgeClass = (cat: BudgetItem['category']) => {
    switch (cat) {
      case '숙소':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case '식비':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case '교통':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case '레크레이션':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case '간식':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const openAddModal = () => {
    setEditingItem(null);
    setItemTitle('');
    setAmountStr('');
    setPayer(currentUser);
    setCategory('식비');
    setDate('10/18');
    setNotes('');
    setShowModal(true);
  };

  const openEditModal = (item: BudgetItem) => {
    setEditingItem(item);
    setItemTitle(item.item);
    setAmountStr(item.amount.toString());
    setPayer(item.payer);
    setCategory(item.category);
    setDate(item.date || '');
    setNotes(item.notes || '');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemTitle.trim()) return;

    const amountNum = parseInt(amountStr.replace(/,/g, ''), 10) || 0;

    if (editingItem) {
      await updateBudget(editingItem.id, {
        item: itemTitle,
        amount: amountNum,
        payer,
        category,
        date,
        notes,
      });
    } else {
      await addBudget({
        item: itemTitle,
        amount: amountNum,
        payer,
        category,
        date,
        notes,
        order: budgets.length + 1,
      });
    }

    setShowModal(false);
  };

  // Filtered & Sorted items
  const filteredBudgets = budgets
    .filter((b) => {
      const matchCat = selectedCategory === '전체' || b.category === selectedCategory;
      const matchPayer = selectedPayer === '전체' || b.payer === selectedPayer;
      const matchQuery =
        !searchQuery.trim() ||
        b.item.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.notes && b.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
        b.payer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchPayer && matchQuery;
    })
    .sort((a, b) => {
      if (sortField === 'amount') {
        return sortDirection === 'asc' ? a.amount - b.amount : b.amount - a.amount;
      }
      return sortDirection === 'asc' ? (a.order || 0) - (b.order || 0) : (b.order || 0) - (a.order || 0);
    });

  const filteredTotal = filteredBudgets.reduce((sum, b) => sum + (Number(b.amount) || 0), 0);

  // Status progress color
  const getProgressColor = () => {
    if (usagePercentage > 90) return 'bg-rose-500';
    if (usagePercentage > 75) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  const getProgressBg = () => {
    if (usagePercentage > 90) return 'bg-rose-50 border-rose-200 text-rose-800';
    if (usagePercentage > 75) return 'bg-amber-50 border-amber-200 text-amber-800';
    return 'bg-emerald-50 border-emerald-200 text-emerald-800';
  };

  return (
    <div className="space-y-6">
      {/* HEADER CALLOUT & STATS */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-xs">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-slate-900">💰 예산 관리 & 지출 내역</h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  총 예산 {TOTAL_BUDGET_LIMIT.toLocaleString()}원
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                총 가용 예산 220만원 대비 현재 지출 및 남아있는 예산을 실시간으로 정산합니다.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={openAddModal}
            className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>지출 내역 추가</span>
          </button>
        </div>

        {/* 3 TOP METRICS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Card 1: Total Available Budget */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                총 가용 예산
              </p>
              <p className="text-xl font-extrabold text-slate-900 mt-1 font-mono">
                {TOTAL_BUDGET_LIMIT.toLocaleString()}원
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">220만원 지원 예산</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-200/70 flex items-center justify-center text-slate-700">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>

          {/* Card 2: Spent Sum */}
          <div className="bg-emerald-50/60 rounded-xl p-4 border border-emerald-200/80 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide">
                현재 지출 합계
              </p>
              <p className="text-xl font-extrabold text-emerald-900 mt-1 font-mono">
                {totalSpent.toLocaleString()}원
              </p>
              <p className="text-[10px] text-emerald-700 font-medium mt-0.5">
                총 {budgets.length}건 정산 등록
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-2xs">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>

          {/* Card 3: Remaining Budget & Usage % */}
          <div
            className={`rounded-xl p-4 border flex items-center justify-between ${
              remainingBudget >= 0
                ? 'bg-blue-50/60 border-blue-200/80'
                : 'bg-rose-50/80 border-rose-300'
            }`}
          >
            <div>
              <p
                className={`text-[11px] font-bold uppercase tracking-wide ${
                  remainingBudget >= 0 ? 'text-blue-800' : 'text-rose-800'
                }`}
              >
                {remainingBudget >= 0 ? '남은 잔여 예산' : '예산 초과 금액'}
              </p>
              <p
                className={`text-xl font-extrabold mt-1 font-mono ${
                  remainingBudget >= 0 ? 'text-blue-900' : 'text-rose-700'
                }`}
              >
                {remainingBudget.toLocaleString()}원
              </p>
              <p
                className={`text-[10px] font-bold mt-0.5 ${
                  remainingBudget >= 0 ? 'text-blue-700' : 'text-rose-600'
                }`}
              >
                사용률: {exactPercentageStr}%
              </p>
            </div>
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                remainingBudget >= 0 ? 'bg-blue-600 text-white' : 'bg-rose-600 text-white'
              }`}
            >
              {remainingBudget >= 0 ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
            </div>
          </div>
        </div>

        {/* PROGRESS BAR SECTION */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span className="flex items-center space-x-1.5">
              <PieChart className="w-4 h-4 text-emerald-600" />
              <span>예산 집행률</span>
            </span>
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-0.5 rounded-md text-[11px] border font-bold ${getProgressBg()}`}>
                {exactPercentageStr}% 사용됨
              </span>
              <span className="text-slate-500 font-mono text-[11px]">
                ({totalSpent.toLocaleString()} / {TOTAL_BUDGET_LIMIT.toLocaleString()}원)
              </span>
            </div>
          </div>

          {/* Visual Progress Track */}
          <div className="w-full h-3.5 bg-slate-200 rounded-full overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-500 ${getProgressColor()}`}
              style={{ width: `${Math.min(100, usagePercentage)}%` }}
            />
          </div>

          {/* Category Breakdown Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[10px] font-bold text-slate-400">카테고리별 지출:</span>
            {categoryOptions.map((cat) => {
              const catTotal = categoryTotals[cat] || 0;
              if (catTotal === 0) return null;
              return (
                <span
                  key={cat}
                  className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-lg text-[10px] font-bold border ${getCategoryBadgeClass(
                    cat
                  )}`}
                >
                  {getCategoryIcon(cat)}
                  <span>{cat}:</span>
                  <span className="font-mono">{catTotal.toLocaleString()}원</span>
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH CONTROLS */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="항목명, 지출자, 메모로 검색..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Category selector */}
            <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <span className="text-[10px] text-slate-400 px-1">분류:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-700 focus:outline-hidden"
              >
                <option value="전체">전체 카테고리</option>
                {categoryOptions.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Payer selector */}
            <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <span className="text-[10px] text-slate-400 px-1">지출자:</span>
              <select
                value={selectedPayer}
                onChange={(e) => setSelectedPayer(e.target.value)}
                className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-700 focus:outline-hidden"
              >
                <option value="전체">전체 멤버</option>
                {WORKSHOP_MEMBERS.map((m) => (
                  <option key={m.id} value={m.name}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Order */}
            <button
              type="button"
              onClick={() => {
                if (sortField === 'amount') {
                  setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                } else {
                  setSortField('amount');
                  setSortDirection('desc');
                }
              }}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                sortField === 'amount'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>금액순 ({sortDirection === 'desc' ? '높은순' : '낮은순'})</span>
            </button>
          </div>
        </div>
      </div>

      {/* EXPENSE TABLE (표 형식) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/90 border-b border-slate-200 text-[11px] font-extrabold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4 w-12 text-center">No.</th>
                <th className="py-3 px-4 w-28">카테고리</th>
                <th className="py-3 px-4">지출 항목</th>
                <th className="py-3 px-4 text-right">금액 (원)</th>
                <th className="py-3 px-4">지출자</th>
                <th className="py-3 px-4">일자 / 참고사항</th>
                <th className="py-3 px-4 text-center w-20">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredBudgets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    <Receipt className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-xs">등록된 지출 내역이 없습니다.</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      상단의 [지출 내역 추가] 버튼을 눌러 새 항목을 등록해보세요!
                    </p>
                  </td>
                </tr>
              ) : (
                filteredBudgets.map((item, index) => {
                  const memberObj = WORKSHOP_MEMBERS.find((m) => m.name === item.payer);

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Index */}
                      <td className="py-3 px-4 text-center font-bold text-slate-400 text-[11px] font-mono">
                        {index + 1}
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${getCategoryBadgeClass(
                            item.category
                          )}`}
                        >
                          {getCategoryIcon(item.category)}
                          <span>{item.category}</span>
                        </span>
                      </td>

                      {/* Item Title */}
                      <td className="py-3 px-4 font-bold text-slate-900 leading-snug">
                        {item.item}
                      </td>

                      {/* Amount */}
                      <td className="py-3 px-4 text-right font-extrabold text-slate-900 font-mono text-sm">
                        {item.amount.toLocaleString()}원
                      </td>

                      {/* Payer */}
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-1.5">
                          <div
                            className={`w-5 h-5 rounded-full ${
                              memberObj?.avatarBg || 'bg-slate-400'
                            } text-white flex items-center justify-center text-[10px] font-bold shrink-0 shadow-2xs`}
                          >
                            {item.payer.charAt(0)}
                          </div>
                          <span className="font-semibold text-slate-800 text-xs">
                            {item.payer}
                          </span>
                        </div>
                      </td>

                      {/* Date & Notes */}
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          {item.date && (
                            <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold font-mono shrink-0 border border-slate-200">
                              {item.date}
                            </span>
                          )}
                          <span className="text-slate-500 text-[11px] truncate max-w-xs">
                            {item.notes || '-'}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center space-x-1 opacity-80 group-hover:opacity-100">
                          <button
                            type="button"
                            onClick={() => openEditModal(item)}
                            className="p-1 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition"
                            title="수정"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteBudget(item.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                            title="삭제"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {/* Table Footer Summary Row */}
            {filteredBudgets.length > 0 && (
              <tfoot>
                <tr className="bg-slate-50 border-t-2 border-slate-200 font-bold text-slate-900">
                  <td colSpan={3} className="py-3 px-4 text-right text-xs">
                    조회된 항목 지출 합계 ({filteredBudgets.length}건):
                  </td>
                  <td className="py-3 px-4 text-right text-sm font-extrabold text-emerald-800 font-mono">
                    {filteredTotal.toLocaleString()}원
                  </td>
                  <td colSpan={3} className="py-3 px-4 text-xs text-slate-500 font-normal">
                    (가용 예산 220만원 중 {((filteredTotal / TOTAL_BUDGET_LIMIT) * 100).toFixed(1)}% 해당)
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* ADD / EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center space-x-2">
              <Wallet className="w-5 h-5 text-emerald-600" />
              <span>{editingItem ? '✏️ 지출 항목 수정' : '💰 새로운 지출 내역 추가'}</span>
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  지출 항목명 *
                </label>
                <input
                  type="text"
                  required
                  value={itemTitle}
                  onChange={(e) => setItemTitle(e.target.value)}
                  placeholder="예: 저녁 바베큐 식자재 장보기"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    금액 (원) *
                  </label>
                  <input
                    type="number"
                    required
                    value={amountStr}
                    onChange={(e) => setAmountStr(e.target.value)}
                    placeholder="예: 150000"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    카테고리 *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as BudgetItem['category'])}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    {categoryOptions.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Quick Amount Helper Buttons */}
              <div className="flex items-center space-x-1.5 pt-0.5">
                <span className="text-[10px] text-slate-400 font-bold">빠른 금액:</span>
                {[10000, 50000, 100000, 500000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      const cur = parseInt(amountStr || '0', 10);
                      setAmountStr((cur + amt).toString());
                    }}
                    className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-[10px] font-bold font-mono border border-slate-200"
                  >
                    +{amt >= 10000 ? `${amt / 10000}만` : amt}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    지출자 *
                  </label>
                  <select
                    value={payer}
                    onChange={(e) => setPayer(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    {WORKSHOP_MEMBERS.map((m) => (
                      <option key={m.id} value={m.name}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    지출일자 (예: 10/18)
                  </label>
                  <input
                    type="text"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    placeholder="10/18"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  참고사항 / 메모
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="예: 법인카드 결제 또는 단체 영수증 수집 완료"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition"
                >
                  {editingItem ? '수정 완료' : '등록하기'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

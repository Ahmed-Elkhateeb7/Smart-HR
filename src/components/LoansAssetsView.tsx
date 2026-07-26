import React, { useState } from 'react';
import {
  Briefcase,
  DollarSign,
  Laptop,
  Plus,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Car,
  Monitor,
  User,
  X
} from 'lucide-react';
import { Loan, Asset, Employee } from '../types';

interface LoansAssetsViewProps {
  loans: Loan[];
  assets: Asset[];
  employees: Employee[];
  onAddLoan: (loan: Loan) => void;
  onAddAsset: (asset: Asset) => void;
  onAssignAsset: (assetId: string, employeeId?: string, employeeName?: string) => void;
  currencySymbol: string;
}

export const LoansAssetsView: React.FC<LoansAssetsViewProps> = ({
  loans,
  assets,
  employees,
  onAddLoan,
  onAddAsset,
  onAssignAsset,
  currencySymbol,
}) => {
  const [activeTab, setActiveTab] = useState<'loans' | 'assets'>('loans');

  // New Loan Modal
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [newLoan, setNewLoan] = useState({
    employeeId: employees[0]?.id || '',
    totalAmount: 10000,
    monthlyInstallment: 1000,
    startDate: '2026-08-01',
    notes: 'سلفة شخصية طارئة',
  });

  // New Asset Modal
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [newAsset, setNewAsset] = useState<Partial<Asset>>({
    assetName: 'MacBook Pro M3 14"',
    assetCode: `AST-LAP-00${assets.length + 1}`,
    category: 'لاب توب',
    serialNumber: 'SN-992211',
    condition: 'جديد',
    status: 'المخزن',
    value: 9500,
  });

  const handleCreateLoan = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find((e) => e.id === newLoan.employeeId);
    if (!emp) return;

    const created: Loan = {
      id: `loan-${Date.now()}`,
      employeeId: emp.id,
      employeeName: emp.name,
      totalAmount: Number(newLoan.totalAmount),
      paidAmount: 0,
      remainingAmount: Number(newLoan.totalAmount),
      monthlyInstallment: Number(newLoan.monthlyInstallment),
      startDate: newLoan.startDate,
      endDate: '2027-08-01',
      status: 'active',
      notes: newLoan.notes,
    };

    onAddLoan(created);
    setShowLoanModal(false);
  };

  const handleCreateAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAsset.assetName) return;

    const created: Asset = {
      id: `ast-${Date.now()}`,
      assetName: newAsset.assetName,
      assetCode: newAsset.assetCode || `AST-${Date.now()}`,
      category: newAsset.category as any || 'لاب توب',
      serialNumber: newAsset.serialNumber || 'SN-0000',
      condition: newAsset.condition as any || 'جديد',
      status: 'المخزن',
      value: Number(newAsset.value) || 5000,
    };

    onAddAsset(created);
    setShowAssetModal(false);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'لاب توب':
        return Laptop;
      case 'هاتف ذكي':
        return Smartphone;
      case 'سيارة':
        return Car;
      default:
        return Monitor;
    }
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header & Sub-Tab Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-blue-600" />
            <span>إدارة السلف والخصومات والعهد والأصول</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            تسجيل أقساط السلف والخصم التلقائي من مسير الرواتب، وتوثيق تسليم الأجهزة والمعدات بحوزة الموظفين.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 shrink-0">
          <button
            onClick={() => setActiveTab('loans')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'loans'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            سجل السلف والقروض
          </button>
          <button
            onClick={() => setActiveTab('assets')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'assets'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            سجل العهد والأصول
          </button>
        </div>
      </div>

      {activeTab === 'loans' ? (
        /* Loans Tab Content */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              السلف القائمة والأقساط الشهرية
            </h3>
            <button
              onClick={() => setShowLoanModal(true)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>تسجيل سلفة جديدة</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {loans.map((loan) => {
              const percentagePaid = Math.round((loan.paidAmount / loan.totalAmount) * 100);

              return (
                <div
                  key={loan.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{loan.employeeName}</h4>
                      <p className="text-[11px] text-slate-400">{loan.notes}</p>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      سلفة نشطة
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-white dark:bg-slate-900 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">المبلغ الإجمالي</span>
                      <span className="font-extrabold">{loan.totalAmount.toLocaleString()} {currencySymbol}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">المسدد حتى الآن</span>
                      <span className="font-bold text-emerald-600">{loan.paidAmount.toLocaleString()} {currencySymbol}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">المتبقي</span>
                      <span className="font-extrabold text-amber-600">{loan.remainingAmount.toLocaleString()} {currencySymbol}</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500">القسط الشهري الخصم التلقائي:</span>
                      <span className="font-bold text-blue-600 dark:text-blue-400">-{loan.monthlyInstallment} {currencySymbol} / شهر</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${percentagePaid}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Assets Tab Content */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              أصول ومعدات الشركة والعهد المسلمة
            </h3>
            <button
              onClick={() => setShowAssetModal(true)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة أصل / عهدة جديدة</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {assets.map((ast) => {
              const Icon = getCategoryIcon(ast.category);

              return (
                <div
                  key={ast.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{ast.assetName}</h4>
                        <p className="text-[10px] text-slate-400">{ast.assetCode} | {ast.serialNumber}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 text-xs space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-500">الحالة والموقع:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{ast.status}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">بحوزة الموظف:</span>
                      <span className="font-bold text-blue-600 dark:text-blue-400">
                        {ast.assignedToName || 'المخزن (غير مسند)'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">القيمة التقديرية:</span>
                      <span className="font-extrabold">{ast.value.toLocaleString()} {currencySymbol}</span>
                    </div>
                  </div>

                  {/* Assign Controls */}
                  <div className="pt-1">
                    {ast.assignedToEmployeeId ? (
                      <button
                        onClick={() => onAssignAsset(ast.id, undefined, undefined)}
                        className="w-full py-1.5 rounded-xl border border-red-200 dark:border-red-900 text-red-600 text-xs font-bold hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                      >
                        استرجاع العهدة للمخزن
                      </button>
                    ) : (
                      <select
                        onChange={(e) => {
                          const emp = employees.find((emp) => emp.id === e.target.value);
                          if (emp) onAssignAsset(ast.id, emp.id, emp.name);
                        }}
                        defaultValue=""
                        className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 text-xs font-bold"
                      >
                        <option value="" disabled>
                          -- تسليم العهدة لموظف --
                        </option>
                        {employees.map((e) => (
                          <option key={e.id} value={e.id}>
                            {e.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Loan Modal */}
      {showLoanModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateLoan}
            className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 border border-slate-200 dark:border-slate-700 shadow-sm animate-fade-in"
          >
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">تسجيل طلب سلفة جديدة</h3>
              <button
                type="button"
                onClick={() => setShowLoanModal(false)}
                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">اختر الموظف *</label>
                <select
                  value={newLoan.employeeId}
                  onChange={(e) => setNewLoan({ ...newLoan, employeeId: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                >
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>{e.name} ({e.employeeCode})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">المبلغ الإجمالي للسلفة ({currencySymbol})</label>
                <input
                  type="number"
                  value={newLoan.totalAmount}
                  onChange={(e) => setNewLoan({ ...newLoan, totalAmount: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-extrabold text-blue-600"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">القسط الشهري للخصم التلقائي ({currencySymbol})</label>
                <input
                  type="number"
                  value={newLoan.monthlyInstallment}
                  onChange={(e) => setNewLoan({ ...newLoan, monthlyInstallment: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-emerald-600"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">سبب السلفة / ملاحظات</label>
                <input
                  type="text"
                  value={newLoan.notes}
                  onChange={(e) => setNewLoan({ ...newLoan, notes: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowLoanModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 font-bold text-xs"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm"
              >
                إعتماد وحفظ السلفة
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Asset Modal */}
      {showAssetModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateAsset}
            className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 border border-slate-200 dark:border-slate-700 shadow-sm animate-fade-in"
          >
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">إضافة أصل / عهدة جديدة</h3>
              <button
                type="button"
                onClick={() => setShowAssetModal(false)}
                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">اسم الأصل *</label>
                <input
                  required
                  type="text"
                  value={newAsset.assetName}
                  onChange={(e) => setNewAsset({ ...newAsset, assetName: e.target.value })}
                  placeholder="مثال: MacBook Pro M3"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">الفئة</label>
                <select
                  value={newAsset.category}
                  onChange={(e) => setNewAsset({ ...newAsset, category: e.target.value as any })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                >
                  <option value="لاب توب">لاب توب</option>
                  <option value="هاتف ذكي">هاتف ذكي</option>
                  <option value="سيارة">سيارة</option>
                  <option value="شاشة / ملحقات">شاشة / ملحقات</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">الرقم التسلسلي (Serial Number)</label>
                <input
                  type="text"
                  value={newAsset.serialNumber}
                  onChange={(e) => setNewAsset({ ...newAsset, serialNumber: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">القيمة التقديرية ({currencySymbol})</label>
                <input
                  type="number"
                  value={newAsset.value}
                  onChange={(e) => setNewAsset({ ...newAsset, value: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAssetModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 font-bold text-xs"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm"
              >
                إضافة الأصل للمخزن
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

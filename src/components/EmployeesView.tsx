import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Filter,
  Eye,
  FileText,
  Briefcase,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  DollarSign,
  ShieldAlert,
  Building2,
  X,
  CreditCard,
  Laptop
} from 'lucide-react';
import { Employee, Asset, Loan, Department } from '../types';

interface EmployeesViewProps {
  employees: Employee[];
  departments: Department[];
  assets: Asset[];
  loans: Loan[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onAddEmployee: (emp: Employee, initialAssetCode?: string) => void;
  currencySymbol: string;
}

export const EmployeesView: React.FC<EmployeesViewProps> = ({
  employees,
  departments,
  assets,
  loans,
  searchTerm,
  setSearchTerm,
  onAddEmployee,
  currencySymbol,
}) => {
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [activeProfileEmployee, setActiveProfileEmployee] = useState<Employee | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // New Employee Form State
  const [newEmp, setNewEmp] = useState<Partial<Employee>>({
    name: '',
    position: '',
    department: 'تكنولوجيا المعلومات',
    email: '',
    phone: '',
    baseSalary: 10000,
    housingAllowance: 2500,
    transportAllowance: 800,
    otherAllowances: 200,
    gosiInsurance: 975,
    iqamaOrIdNumber: '',
    iqamaExpiryDate: '2028-01-01',
    contractType: 'سعودي',
    contractExpiryDate: '2027-12-31',
    joinDate: new Date().toISOString().split('T')[0],
    bankName: 'مصرف الراجحي',
    bankAccount: 'SA',
    status: 'active',
  });
  const [initialAssetCode, setInitialAssetCode] = useState<string>('');

  // Filter Employees
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.name.includes(searchTerm) ||
      emp.employeeCode.includes(searchTerm) ||
      emp.position.includes(searchTerm) ||
      emp.iqamaOrIdNumber.includes(searchTerm);

    const matchesDept = selectedDept === 'all' || emp.department === selectedDept;
    const matchesStatus = selectedStatus === 'all' || emp.status === selectedStatus;

    return matchesSearch && matchesDept && matchesStatus;
  });

  const handleCreateEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmp.name || !newEmp.position) return;

    const created: Employee = {
      id: `emp-${Date.now()}`,
      employeeCode: `SHR-${Math.floor(100 + Math.random() * 900)}`,
      name: newEmp.name || 'موظف جديد',
      position: newEmp.position || 'موظف',
      department: newEmp.department || 'تكنولوجيا المعلومات',
      email: newEmp.email || `${newEmp.name?.split(' ')[0]}@smarthr.sa`,
      phone: newEmp.phone || '+966 50 000 0000',
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
      baseSalary: Number(newEmp.baseSalary) || 8000,
      housingAllowance: Number(newEmp.housingAllowance) || 2000,
      transportAllowance: Number(newEmp.transportAllowance) || 800,
      otherAllowances: Number(newEmp.otherAllowances) || 0,
      gosiInsurance: Number(newEmp.gosiInsurance) || 780,
      iqamaOrIdNumber: newEmp.iqamaOrIdNumber || '1000000000',
      iqamaExpiryDate: newEmp.iqamaExpiryDate || '2028-01-01',
      contractType: newEmp.contractType as any || 'سعودي',
      contractExpiryDate: newEmp.contractExpiryDate || '2028-01-01',
      joinDate: newEmp.joinDate || new Date().toISOString().split('T')[0],
      status: 'active',
      bankAccount: newEmp.bankAccount || 'SA0000000000000000000000',
      bankName: newEmp.bankName || 'مصرف الراجحي',
    };

    onAddEmployee(created, initialAssetCode);
    setShowAddModal(false);
  };

  // Document Expiry Helper
  const getExpiryBadge = (expiryDateStr: string) => {
    const today = new Date();
    const expiry = new Date(expiryDateStr);
    const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 3600 * 24));

    if (diffDays < 0) {
      return { label: 'منتهٍ!', color: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300' };
    } else if (diffDays <= 30) {
      return { label: `ينتهي خلال ${diffDays} يومًا`, color: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' };
    } else {
      return { label: 'سارٍ', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' };
    }
  };

  return (
    <div className="space-y-6 pb-10">
      {/* View Header & Action bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            <span>إدارة الموظفين والملفات الشاملة</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            سجل كادر العمل، الهياكل والرواتب، متابعة انتهاء العقود والإقامات والعهد.
          </p>
        </div>

        <button
          id="add-employee-modal-open-btn"
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs md:text-sm shadow-sm shadow-blue-600/30 flex items-center justify-center gap-2 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة موظف جديد (Onboarding)</span>
        </button>
      </div>

      {/* Search & Filters Toolbar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          {/* Search bar */}
          <div className="relative flex-1 max-w-xs">
            <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ابحث بالاسم أو الرقم الوظيفي..."
              className="w-full pl-3 pr-9 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Department Filter */}
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="py-2 px-3 text-xs rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-semibold focus:outline-none"
          >
            <option value="all">جميع الأقسام ({departments.length})</option>
            {departments.map((d) => (
              <option key={d.id} value={d.name}>
                {d.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="py-2 px-3 text-xs rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-semibold focus:outline-none"
          >
            <option value="all">جميع الحالات</option>
            <option value="active">على رأس العمل</option>
            <option value="on_leave">في إجازة</option>
            <option value="suspended">موقوف موقتاً</option>
          </select>
        </div>

        {/* View mode buttons */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'table'
                ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            جدول مفصل
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'grid'
                ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            بطاقات
          </button>
        </div>
      </div>

      {/* Employees Table Mode */}
      {viewMode === 'table' ? (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xs">
          <table className="w-full text-right text-xs">
            <thead className="bg-white dark:bg-slate-900/80 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-3.5">الموظف</th>
                <th className="p-3.5">الكود الوظيفي</th>
                <th className="p-3.5">القسم والوظيفة</th>
                <th className="p-3.5">الراتب الأساسي</th>
                <th className="p-3.5">إجمالي البدلات</th>
                <th className="p-3.5">صلاحية الإقامة / العقد</th>
                <th className="p-3.5">الحالة</th>
                <th className="p-3.5 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {filteredEmployees.map((emp) => {
                const totalAllowances = emp.housingAllowance + emp.transportAllowance + emp.otherAllowances;
                const iqamaBadge = getExpiryBadge(emp.iqamaExpiryDate);

                return (
                  <tr
                    key={emp.id}
                    className="hover:bg-white/80 dark:hover:bg-slate-700/40 transition-colors"
                  >
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={emp.avatar}
                          alt={emp.name}
                          className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-300"
                        />
                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-100">{emp.name}</p>
                          <p className="text-[10px] text-slate-400">{emp.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5 font-bold text-slate-700 dark:text-slate-300">
                      {emp.employeeCode}
                    </td>
                    <td className="p-3.5">
                      <p className="font-bold text-slate-800 dark:text-slate-200">{emp.position}</p>
                      <span className="inline-block text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md mt-0.5">
                        {emp.department}
                      </span>
                    </td>
                    <td className="p-3.5 font-extrabold text-slate-900 dark:text-white">
                      {emp.baseSalary.toLocaleString()} {currencySymbol}
                    </td>
                    <td className="p-3.5 font-bold text-emerald-600 dark:text-emerald-400">
                      +{totalAllowances.toLocaleString()} {currencySymbol}
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${iqamaBadge.color}`}>
                        {iqamaBadge.label}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        على رأس العمل
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      <button
                        id={`view-profile-btn-${emp.id}`}
                        onClick={() => setActiveProfileEmployee(emp)}
                        className="px-3 py-1 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-bold hover:bg-blue-100 transition-colors flex items-center justify-center gap-1 mx-auto"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>الملف الشامل</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* Employees Grid Cards Mode */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEmployees.map((emp) => {
            const totalSalary = emp.baseSalary + emp.housingAllowance + emp.transportAllowance + emp.otherAllowances;

            return (
              <div
                key={emp.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs hover:shadow-sm transition-all space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img src={emp.avatar} alt={emp.name} className="w-12 h-12 rounded-2xl object-cover ring-2 ring-blue-500/20" />
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{emp.name}</h4>
                      <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">{emp.position}</p>
                      <p className="text-[10px] text-slate-400">{emp.department}</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                    {emp.employeeCode}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-white dark:bg-slate-900 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400">الإجمالي المستحق</span>
                    <p className="font-extrabold text-slate-900 dark:text-white">{totalSalary.toLocaleString()} {currencySymbol}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400">نوع العقد</span>
                    <p className="font-bold text-slate-700 dark:text-slate-200">{emp.contractType}</p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveProfileEmployee(emp)}
                  className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1"
                >
                  <Eye className="w-4 h-4" />
                  <span>عرض الملف الشامل والعهد والرواتب</span>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Comprehensive Employee Profile Modal */}
      {activeProfileEmployee && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-3xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-700 shadow-sm animate-fade-in">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-700 pb-4">
              <div className="flex items-center gap-4">
                <img
                  src={activeProfileEmployee.avatar}
                  alt={activeProfileEmployee.name}
                  className="w-16 h-16 rounded-2xl object-cover ring-4 ring-blue-500/20"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                      {activeProfileEmployee.name}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                      {activeProfileEmployee.employeeCode}
                    </span>
                  </div>
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-bold">
                    {activeProfileEmployee.position} - {activeProfileEmployee.department}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    تاريخ الانضمام: {activeProfileEmployee.joinDate} | نوع العقد: {activeProfileEmployee.contractType}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveProfileEmployee(null)}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-500 hover:text-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Content Tabs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Financial Breakdown Card */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 space-y-3">
                <h4 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 text-sm">
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  <span>الهيكل المالي والراتب</span>
                </h4>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">الراتب الأساسي:</span>
                    <span className="font-extrabold">{activeProfileEmployee.baseSalary.toLocaleString()} {currencySymbol}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">بدل السكن:</span>
                    <span className="font-bold text-emerald-600">+{activeProfileEmployee.housingAllowance.toLocaleString()} {currencySymbol}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">بدل المواصلات:</span>
                    <span className="font-bold text-emerald-600">+{activeProfileEmployee.transportAllowance.toLocaleString()} {currencySymbol}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">بدلات أخرى:</span>
                    <span className="font-bold text-emerald-600">+{activeProfileEmployee.otherAllowances.toLocaleString()} {currencySymbol}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                    <span className="text-slate-500">خصم التأمينات الاجتماعية (GOSI):</span>
                    <span className="font-bold text-red-500">-{activeProfileEmployee.gosiInsurance.toLocaleString()} {currencySymbol}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-300 dark:border-slate-600 text-sm font-extrabold">
                    <span>صافي الراتب المتوقع:</span>
                    <span className="text-blue-600 dark:text-blue-400">
                      {(
                        activeProfileEmployee.baseSalary +
                        activeProfileEmployee.housingAllowance +
                        activeProfileEmployee.transportAllowance +
                        activeProfileEmployee.otherAllowances -
                        activeProfileEmployee.gosiInsurance
                      ).toLocaleString()}{' '}
                      {currencySymbol}
                    </span>
                  </div>
                </div>
              </div>

              {/* Documents & Expiry Dates */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 space-y-3">
                <h4 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 text-sm">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>المستندات والصلاحية الرسمية</span>
                </h4>

                <div className="space-y-3">
                  <div>
                    <span className="text-slate-500 block text-[11px]">رقم الهوية / الإقامة:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{activeProfileEmployee.iqamaOrIdNumber}</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block">انتهاء الإقامة/الهوية</span>
                      <span className="font-bold">{activeProfileEmployee.iqamaExpiryDate}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getExpiryBadge(activeProfileEmployee.iqamaExpiryDate).color}`}>
                      {getExpiryBadge(activeProfileEmployee.iqamaExpiryDate).label}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block">انتهاء عقد العمل</span>
                      <span className="font-bold">{activeProfileEmployee.contractExpiryDate}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getExpiryBadge(activeProfileEmployee.contractExpiryDate).color}`}>
                      {getExpiryBadge(activeProfileEmployee.contractExpiryDate).label}
                    </span>
                  </div>
                </div>
              </div>

              {/* Assigned Assets & Custody */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 space-y-3 md:col-span-2">
                <h4 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 text-sm">
                  <Laptop className="w-4 h-4 text-purple-600" />
                  <span>العهد والأصول المسجلة بحوزته</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {assets
                    .filter((a) => a.assignedToEmployeeId === activeProfileEmployee.id)
                    .map((asset) => (
                      <div
                        key={asset.id}
                        className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between"
                      >
                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-100">{asset.assetName}</p>
                          <p className="text-[10px] text-slate-400">{asset.assetCode} | S/N: {asset.serialNumber}</p>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                          {asset.condition}
                        </span>
                      </div>
                    ))}
                  {assets.filter((a) => a.assignedToEmployeeId === activeProfileEmployee.id).length === 0 && (
                    <p className="text-slate-400 text-xs py-2 col-span-2">لا توجد أصول مسجلة بحوزة الموظف حالياً.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-end">
              <button
                onClick={() => setActiveProfileEmployee(null)}
                className="px-5 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs"
              >
                إغلاق الملف
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Employee Onboarding Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateEmployee}
            className="bg-white dark:bg-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-700 shadow-sm animate-fade-in"
          >
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" />
                <span>تسجيل موظف جديد (Onboarding)</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">الاسم الرباعي للموظف *</label>
                <input
                  required
                  type="text"
                  value={newEmp.name}
                  onChange={(e) => setNewEmp({ ...newEmp, name: e.target.value })}
                  placeholder="مثال: عبد الله بن حمد القحطاني"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">المسمى الوظيفي *</label>
                <input
                  required
                  type="text"
                  value={newEmp.position}
                  onChange={(e) => setNewEmp({ ...newEmp, position: e.target.value })}
                  placeholder="مثال: مهندس برمجيات"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">القسم التنظيمي</label>
                <input
                  type="text"
                  value={newEmp.department}
                  onChange={(e) => setNewEmp({ ...newEmp, department: e.target.value })}
                  placeholder="مثال: التسويق"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">نوع العقد</label>
                <select
                  value={newEmp.contractType}
                  onChange={(e) => setNewEmp({ ...newEmp, contractType: e.target.value as any })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                >
                  <option value="مصري">مصري</option>
                  <option value="أجنبي">أجنبي</option>
                  <option value="دوام جزئي">دوام جزئي</option>
                  <option value="عقد محدد">عقد محدد</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">الراتب الأساسي ({currencySymbol})</label>
                <input
                  type="number"
                  value={newEmp.baseSalary}
                  onChange={(e) => setNewEmp({ ...newEmp, baseSalary: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-blue-600"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">بدل السكن ({currencySymbol})</label>
                <input
                  type="number"
                  value={newEmp.housingAllowance}
                  onChange={(e) => setNewEmp({ ...newEmp, housingAllowance: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">الرقم القومي / إقامة الموظف</label>
                <input
                  type="text"
                  value={newEmp.iqamaOrIdNumber}
                  onChange={(e) => setNewEmp({ ...newEmp, iqamaOrIdNumber: e.target.value })}
                  placeholder="الرقم القومي (14 رقم)"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">تاريخ انتهاء الإقامة/الهوية</label>
                <input
                  type="date"
                  value={newEmp.iqamaExpiryDate}
                  onChange={(e) => setNewEmp({ ...newEmp, iqamaExpiryDate: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="font-bold text-slate-700 dark:text-slate-300">تسليم عهدة أولية (اختياري)</label>
                <input
                  type="text"
                  value={initialAssetCode}
                  onChange={(e) => setInitialAssetCode(e.target.value)}
                  placeholder="مثال: لابتوب ديل XPS 15"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm"
              >
                حفظ وإضافة الموظف
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

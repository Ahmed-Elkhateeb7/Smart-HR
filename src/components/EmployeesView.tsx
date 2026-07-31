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
  Laptop,
  Edit3,
  Trash2,
  ChevronDown
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
  onUpdateEmployee: (emp: Employee) => void;
  onDeleteEmployee: (employeeId: string) => void;
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
  onUpdateEmployee,
  onDeleteEmployee,
  currencySymbol,
}) => {
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [activeProfileEmployee, setActiveProfileEmployee] = useState<Employee | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editEmpForm, setEditEmpForm] = useState<Employee | null>(null);
  const [showNewDeptDropdown, setShowNewDeptDropdown] = useState(false);
  const [showEditDeptDropdown, setShowEditDeptDropdown] = useState(false);

  // New Employee Form State
  const [newEmp, setNewEmp] = useState<Partial<Employee>>({
    employeeCode: '',
    name: '',
    position: '',
    department: 'تكنولوجيا المعلومات',
    email: '',
    phone: '',
    baseSalary: 0,
    housingAllowance: 0,
    transportAllowance: 0,
    otherAllowances: 0,
    gosiInsurance: 0,
    iqamaOrIdNumber: '',
    iqamaExpiryDate: '',
    contractType: 'مصري',
    contractExpiryDate: '',
    joinDate: new Date().toISOString().split('T')[0],
    bankName: '',
    bankAccount: '',
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
      employeeCode: newEmp.employeeCode?.trim() || `SHR-${Math.floor(100 + Math.random() * 900)}`,
      name: newEmp.name || '',
      position: newEmp.position || '',
      department: newEmp.department || 'تكنولوجيا المعلومات',
      email: newEmp.email || '',
      phone: newEmp.phone || '',
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
      baseSalary: Number(newEmp.baseSalary) || 0,
      housingAllowance: Number(newEmp.housingAllowance) || 0,
      transportAllowance: Number(newEmp.transportAllowance) || 0,
      otherAllowances: Number(newEmp.otherAllowances) || 0,
      gosiInsurance: Number(newEmp.gosiInsurance) || 0,
      iqamaOrIdNumber: newEmp.iqamaOrIdNumber || '',
      iqamaExpiryDate: newEmp.iqamaExpiryDate || '',
      contractType: newEmp.contractType as any || 'مصري',
      contractExpiryDate: newEmp.contractExpiryDate || '',
      joinDate: newEmp.joinDate || new Date().toISOString().split('T')[0],
      status: (newEmp.status as any) || 'active',
      bankAccount: newEmp.bankAccount || '',
      bankName: newEmp.bankName || '',
    };

    onAddEmployee(created, initialAssetCode);
    setShowAddModal(false);
    setNewEmp({
      employeeCode: '',
      name: '',
      position: '',
      department: 'تكنولوجيا المعلومات',
      email: '',
      phone: '',
      baseSalary: 0,
      housingAllowance: 0,
      transportAllowance: 0,
      otherAllowances: 0,
      gosiInsurance: 0,
      iqamaOrIdNumber: '',
      iqamaExpiryDate: '',
      contractType: 'مصري',
      contractExpiryDate: '',
      joinDate: new Date().toISOString().split('T')[0],
      bankName: '',
      bankAccount: '',
      status: 'active',
    });
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
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs md:text-sm shadow-sm shadow-blue-600/30 flex items-center justify-center gap-2 transition-all shrink-0 cursor-pointer"
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
                <th className="p-3.5">الحوافز والبدلات</th>
                <th className="p-3.5">صلاحية الهوية / العقد</th>
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
                        <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                          {emp.name.charAt(0)}
                        </div>
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
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        emp.status === 'active' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                        emp.status === 'on_leave' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' :
                        emp.status === 'suspended' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                        'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}>
                        {emp.status === 'active' ? 'على رأس العمل' :
                         emp.status === 'on_leave' ? 'في إجازة' :
                         emp.status === 'suspended' ? 'موقوف موقتاً' :
                         'ترك العمل'}
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          id={`view-profile-btn-${emp.id}`}
                          onClick={() => setActiveProfileEmployee(emp)}
                          className="px-2.5 py-1 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-bold hover:bg-blue-100 transition-colors flex items-center justify-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>الملف الشامل</span>
                        </button>
                        <button
                          id={`edit-employee-btn-${emp.id}`}
                          onClick={() => setEditEmpForm(emp)}
                          className="px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 font-bold hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors flex items-center justify-center gap-1"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>تعديل</span>
                        </button>
                        <button
                          id={`delete-employee-btn-${emp.id}`}
                          onClick={() => onDeleteEmployee(emp.id)}
                          className="px-2.5 py-1 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 font-bold hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors flex items-center justify-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>حذف</span>
                        </button>
                      </div>
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
                    <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-lg ring-2 ring-blue-500/20">
                      {emp.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{emp.name}</h4>
                      <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">{emp.position}</p>
                      <p className="text-[10px] text-slate-400">{emp.department}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 items-end">
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                      {emp.employeeCode}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                      emp.status === 'active' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                      emp.status === 'on_leave' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' :
                      emp.status === 'suspended' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                      'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                    }`}>
                      {emp.status === 'active' ? 'على رأس العمل' :
                       emp.status === 'on_leave' ? 'في إجازة' :
                       emp.status === 'suspended' ? 'موقوف موقتاً' :
                       'ترك العمل'}
                    </span>
                  </div>
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

                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveProfileEmployee(emp)}
                    className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>الملف الشامل</span>
                  </button>
                  <button
                    onClick={() => setEditEmpForm(emp)}
                    className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>تعديل</span>
                  </button>
                  <button
                    onClick={() => onDeleteEmployee(emp.id)}
                    className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>حذف</span>
                  </button>
                </div>
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
                <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-2xl ring-4 ring-blue-500/20">
                  {activeProfileEmployee.name.charAt(0)}
                </div>
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
                    <span className="text-slate-500">الحوافز والبدلات:</span>
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
                    <span className="text-slate-500">خصم التأمينات الاجتماعية:</span>
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
                    <span className="text-slate-500 block text-[11px]">رقم الهوية الوطنية / جواز السفر:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{activeProfileEmployee.iqamaOrIdNumber}</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block">انتهاء الهوية/جواز السفر</span>
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateEmployee}
            className="bg-white dark:bg-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-700 shadow-xl animate-fade-in relative z-10"
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
                <label className="font-bold text-slate-700 dark:text-slate-300">الكود التوظيفي / الرقم الوظيفي</label>
                <input
                  type="text"
                  value={newEmp.employeeCode || ''}
                  onChange={(e) => setNewEmp({ ...newEmp, employeeCode: e.target.value })}
                  placeholder="مثال: SHR-105 (تلقائي إذا ترك فارغاً)"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-blue-600"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">الاسم الرباعي للموظف *</label>
                <input
                  required
                  type="text"
                  value={newEmp.name || ''}
                  onChange={(e) => setNewEmp({ ...newEmp, name: e.target.value })}
                  placeholder="مثال: أحمد عبد الفتاح الشناوي"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">المسمى الوظيفي *</label>
                <input
                  required
                  type="text"
                  value={newEmp.position || ''}
                  onChange={(e) => setNewEmp({ ...newEmp, position: e.target.value })}
                  placeholder="مثال: مهندس برمجيات"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                />
              </div>

              <div className="space-y-1 relative">
                <label className="font-bold text-slate-700 dark:text-slate-300">القسم التنظيمي</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowNewDeptDropdown(!showNewDeptDropdown)}
                    className="w-full text-right p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold cursor-pointer flex justify-between items-center focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors text-xs"
                  >
                    <span>{newEmp.department || 'اختر القسم'}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showNewDeptDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  {showNewDeptDropdown && (
                    <div className="absolute z-50 mt-1 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                      {departments.map((d) => (
                        <div
                          key={d.id}
                          onClick={() => {
                            setNewEmp({ ...newEmp, department: d.name });
                            setShowNewDeptDropdown(false);
                          }}
                          className="p-2.5 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer font-bold text-xs text-slate-700 dark:text-slate-200"
                        >
                          {d.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">حالة العمل</label>
                <select
                  value={newEmp.status || 'active'}
                  onChange={(e) => setNewEmp({ ...newEmp, status: e.target.value as any })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold cursor-pointer transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none text-xs"
                >
                  <option value="active">على رأس العمل</option>
                  <option value="on_leave">في إجازة</option>
                  <option value="suspended">موقوف موقتاً</option>
                  <option value="resigned">ترك العمل</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">رقم الهاتف</label>
                <input
                  type="text"
                  value={newEmp.phone || ''}
                  onChange={(e) => setNewEmp({ ...newEmp, phone: e.target.value })}
                  placeholder="مثال: +20 100 000 0000"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">تاريخ التعيين</label>
                <input
                  type="date"
                  value={newEmp.joinDate || ''}
                  onChange={(e) => setNewEmp({ ...newEmp, joinDate: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">الراتب الأساسي ({currencySymbol})</label>
                <input
                  type="number"
                  value={newEmp.baseSalary || ''}
                  onChange={(e) => setNewEmp({ ...newEmp, baseSalary: e.target.value === '' ? 0 : Number(e.target.value) })}
                  placeholder="أدخل الراتب الأساسي..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-blue-600"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">الحوافز والبدلات ({currencySymbol})</label>
                <input
                  type="number"
                  value={newEmp.housingAllowance || ''}
                  onChange={(e) => setNewEmp({ ...newEmp, housingAllowance: e.target.value === '' ? 0 : Number(e.target.value) })}
                  placeholder="أدخل الحوافز والبدلات..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">بدل المواصلات ({currencySymbol})</label>
                <input
                  type="number"
                  value={newEmp.transportAllowance || ''}
                  onChange={(e) => setNewEmp({ ...newEmp, transportAllowance: e.target.value === '' ? 0 : Number(e.target.value) })}
                  placeholder="أدخل بدل المواصلات..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">بدلات أخرى ({currencySymbol})</label>
                <input
                  type="number"
                  value={newEmp.otherAllowances || ''}
                  onChange={(e) => setNewEmp({ ...newEmp, otherAllowances: e.target.value === '' ? 0 : Number(e.target.value) })}
                  placeholder="أدخل بدلات أخرى..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">تأمين اجتماعي مستقطع ({currencySymbol})</label>
                <input
                  type="number"
                  value={newEmp.gosiInsurance || ''}
                  onChange={(e) => setNewEmp({ ...newEmp, gosiInsurance: e.target.value === '' ? 0 : Number(e.target.value) })}
                  placeholder="أدخل التأمين الاجتماعي المستقطع..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-red-600"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">اسم البنك</label>
                <input
                  type="text"
                  value={newEmp.bankName || ''}
                  onChange={(e) => setNewEmp({ ...newEmp, bankName: e.target.value })}
                  placeholder="أدخل اسم البنك..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">رقم الحساب البنكي / IBAN</label>
                <input
                  type="text"
                  value={newEmp.bankAccount || ''}
                  onChange={(e) => setNewEmp({ ...newEmp, bankAccount: e.target.value })}
                  placeholder="أدخل رقم الحساب البنكي أو الـ IBAN..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">الرقم القومي / جواز السفر</label>
                <input
                  type="text"
                  value={newEmp.iqamaOrIdNumber || ''}
                  onChange={(e) => setNewEmp({ ...newEmp, iqamaOrIdNumber: e.target.value })}
                  placeholder="الرقم القومي (14 رقم)"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
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

      {/* Edit Employee Modal */}
      {editEmpForm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!editEmpForm.name || !editEmpForm.position) return;
              onUpdateEmployee(editEmpForm);
              setEditEmpForm(null);
            }}
            className="bg-white dark:bg-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-700 shadow-xl animate-fade-in relative z-10"
          >
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-500" />
                <span>تعديل بيانات الموظف: {editEmpForm.name}</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditEmpForm(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">الكود التوظيفي / الرقم الوظيفي *</label>
                <input
                  required
                  type="text"
                  value={editEmpForm.employeeCode}
                  onChange={(e) => setEditEmpForm({ ...editEmpForm, employeeCode: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-blue-600"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">الاسم الرباعي للموظف *</label>
                <input
                  required
                  type="text"
                  value={editEmpForm.name}
                  onChange={(e) => setEditEmpForm({ ...editEmpForm, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">المسمى الوظيفي *</label>
                <input
                  required
                  type="text"
                  value={editEmpForm.position}
                  onChange={(e) => setEditEmpForm({ ...editEmpForm, position: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                />
              </div>

              <div className="space-y-1 relative">
                <label className="font-bold text-slate-700 dark:text-slate-300">القسم التنظيمي</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowEditDeptDropdown(!showEditDeptDropdown)}
                    className="w-full text-right p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold cursor-pointer flex justify-between items-center focus:ring-2 focus:ring-amber-500 focus:outline-none transition-colors text-xs"
                  >
                    <span>{editEmpForm.department || 'اختر القسم'}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showEditDeptDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  {showEditDeptDropdown && (
                    <div className="absolute z-50 mt-1 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                      {departments.map((d) => (
                        <div
                          key={d.id}
                          onClick={() => {
                            setEditEmpForm({ ...editEmpForm, department: d.name });
                            setShowEditDeptDropdown(false);
                          }}
                          className="p-2.5 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer font-bold text-xs text-slate-700 dark:text-slate-200"
                        >
                          {d.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>



              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">حالة العمل</label>
                <select
                  value={editEmpForm.status}
                  onChange={(e) => setEditEmpForm({ ...editEmpForm, status: e.target.value as any })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold cursor-pointer transition-colors focus:ring-2 focus:ring-amber-500 focus:outline-none text-xs"
                >
                  <option value="active" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">على رأس العمل</option>
                  <option value="on_leave" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">في إجازة</option>
                  <option value="suspended" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">موقوف موقتاً</option>
                  <option value="resigned" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">ترك العمل</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">رقم الهاتف</label>
                <input
                  type="text"
                  value={editEmpForm.phone || ''}
                  onChange={(e) => setEditEmpForm({ ...editEmpForm, phone: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">تاريخ التعيين</label>
                <input
                  type="date"
                  value={editEmpForm.joinDate}
                  onChange={(e) => setEditEmpForm({ ...editEmpForm, joinDate: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                />
              </div>



              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">الراتب الأساسي ({currencySymbol})</label>
                <input
                  type="number"
                  value={editEmpForm.baseSalary}
                  onChange={(e) => setEditEmpForm({ ...editEmpForm, baseSalary: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-blue-600"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">الحوافز والبدلات ({currencySymbol})</label>
                <input
                  type="number"
                  value={editEmpForm.housingAllowance}
                  onChange={(e) => setEditEmpForm({ ...editEmpForm, housingAllowance: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">بدل المواصلات ({currencySymbol})</label>
                <input
                  type="number"
                  value={editEmpForm.transportAllowance}
                  onChange={(e) => setEditEmpForm({ ...editEmpForm, transportAllowance: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">بدلات أخرى ({currencySymbol})</label>
                <input
                  type="number"
                  value={editEmpForm.otherAllowances}
                  onChange={(e) => setEditEmpForm({ ...editEmpForm, otherAllowances: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">تأمين اجتماعي مستقطع ({currencySymbol})</label>
                <input
                  type="number"
                  value={editEmpForm.gosiInsurance}
                  onChange={(e) => setEditEmpForm({ ...editEmpForm, gosiInsurance: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-red-600"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">اسم البنك</label>
                <input
                  type="text"
                  value={editEmpForm.bankName}
                  onChange={(e) => setEditEmpForm({ ...editEmpForm, bankName: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">رقم الحساب البنكي / IBAN</label>
                <input
                  type="text"
                  value={editEmpForm.bankAccount}
                  onChange={(e) => setEditEmpForm({ ...editEmpForm, bankAccount: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">الرقم القومي / جواز السفر</label>
                <input
                  type="text"
                  value={editEmpForm.iqamaOrIdNumber}
                  onChange={(e) => setEditEmpForm({ ...editEmpForm, iqamaOrIdNumber: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditEmpForm(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm"
              >
                حفظ التغييرات
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { EmployeesView } from './components/EmployeesView';
import { EmployeeEffectsView } from './components/EmployeeEffectsView';
import { AttendanceView } from './components/AttendanceView';
import { PayrollView } from './components/PayrollView';
import { LoansAssetsView } from './components/LoansAssetsView';
import { AiAssistantView } from './components/AiAssistantView';
import { ReportsView } from './components/ReportsView';
import { SettingsView } from './components/SettingsView';
import { DatabaseView } from './components/DatabaseView';
import { DocumentsView } from './components/DocumentsView';
import { LoginView } from './components/LoginView';

import {
  initialEmployees,
  initialAttendanceRecords,
  initialPayrollRecords,
  initialLoans,
  initialAssets,
  initialSystemAlerts,
  initialDepartments,
  initialShifts,
  initialCompanySettings
} from './data/initialData';

import {
  Employee,
  AttendanceRecord,
  PayrollRecord,
  Loan,
  Asset,
  SystemAlert,
  Department,
  Shift,
  TabType,
  DocumentItem
} from './types';

import {
  loadAllState,
  saveEmployees,
  saveAttendanceRecords,
  savePayrollRecords,
  saveLoans,
  saveAssets,
  saveAlerts,
  saveShifts,
  saveDocuments,
  saveCurrencySymbol
} from './utils/storage';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('isAuthenticated') === 'true';
  });
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [darkMode, setDarkMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Persistent Core State initialization
  const [initialLoaded] = useState(() => loadAllState());

  const [currencySymbol, setCurrencySymbol] = useState(initialLoaded.currencySymbol);
  const [employees, setEmployees] = useState<Employee[]>(initialLoaded.employees);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(initialLoaded.attendanceRecords);
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>(initialLoaded.payrollRecords);
  const [loans, setLoans] = useState<Loan[]>(initialLoaded.loans);
  const [assets, setAssets] = useState<Asset[]>(initialLoaded.assets);
  const [alerts, setAlerts] = useState<SystemAlert[]>(initialLoaded.alerts);
  const [departments] = useState<Department[]>(initialDepartments);
  const [shifts, setShifts] = useState<Shift[]>(initialLoaded.shifts);
  const [documents, setDocuments] = useState<DocumentItem[]>(initialLoaded.documents);

  // Auto-persist state changes
  useEffect(() => { saveEmployees(employees); }, [employees]);
  useEffect(() => { saveAttendanceRecords(attendanceRecords); }, [attendanceRecords]);
  useEffect(() => { savePayrollRecords(payrollRecords); }, [payrollRecords]);
  useEffect(() => { saveLoans(loans); }, [loans]);
  useEffect(() => { saveAssets(assets); }, [assets]);
  useEffect(() => { saveAlerts(alerts); }, [alerts]);
  useEffect(() => { saveShifts(shifts); }, [shifts]);
  useEffect(() => { saveDocuments(documents); }, [documents]);
  useEffect(() => { saveCurrencySymbol(currencySymbol); }, [currencySymbol]);

  const handleRestoreData = (restored: {
    employees: Employee[];
    attendanceRecords: AttendanceRecord[];
    payrollRecords: PayrollRecord[];
    loans: Loan[];
    assets: Asset[];
    alerts: SystemAlert[];
    shifts: Shift[];
    documents: DocumentItem[];
    currencySymbol: string;
  }) => {
    setEmployees(restored.employees);
    setAttendanceRecords(restored.attendanceRecords);
    setPayrollRecords(restored.payrollRecords);
    setLoans(restored.loans);
    setAssets(restored.assets);
    setAlerts(restored.alerts);
    setShifts(restored.shifts);
    setDocuments(restored.documents);
    setCurrencySymbol(restored.currencySymbol);
  };

  const handleClearData = () => {
    setEmployees([]);
    setAttendanceRecords([]);
    setPayrollRecords([]);
    setLoans([]);
    setAssets([]);
    setAlerts([]);
    setDocuments([]);
  };

  const handleAddDocument = (doc: DocumentItem) => {
    setDocuments((prev) => [doc, ...prev]);
  };

  const handleDeleteDocument = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  // Dark Mode Sync
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Handle Add Employee
  const handleAddEmployee = (newEmp: Employee, initialAssetCode?: string) => {
    setEmployees((prev) => {
      const existing = prev.find(
        (e) => e.id === newEmp.id || (e.employeeCode && newEmp.employeeCode && e.employeeCode === newEmp.employeeCode)
      );
      const mergedEmp = existing ? { ...existing, ...newEmp } : newEmp;
      const filtered = prev.filter(
        (e) => e.id !== mergedEmp.id && (!e.employeeCode || !mergedEmp.employeeCode || e.employeeCode !== mergedEmp.employeeCode)
      );
      return [mergedEmp, ...filtered];
    });

    // Create or update default Payroll Record for new employee
    setPayrollRecords((prev) => {
      const existingIdx = prev.findIndex((p) => p.employeeId === newEmp.id && p.month === '2026-07');
      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx] = {
          ...copy[existingIdx],
          employeeName: newEmp.name,
          employeeCode: newEmp.employeeCode,
          position: newEmp.position,
          department: newEmp.department,
          baseSalary: newEmp.baseSalary,
          allowances: newEmp.housingAllowance + newEmp.transportAllowance + newEmp.otherAllowances,
          socialInsurance: newEmp.gosiInsurance,
        };
        return copy;
      }

      const uniquePayId = `pay-${newEmp.id}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const newPayrollRec: PayrollRecord = {
        id: uniquePayId,
        employeeId: newEmp.id,
        employeeName: newEmp.name,
        employeeCode: newEmp.employeeCode,
        position: newEmp.position,
        department: newEmp.department,
        month: '2026-07',
        baseSalary: newEmp.baseSalary,
        allowances: newEmp.housingAllowance + newEmp.transportAllowance + newEmp.otherAllowances,
        overtimeHours: 0,
        overtimeRate: 1.5,
        overtimePay: 0,
        overtimeHoursDay: 0,
        overtimeHoursNight: 0,
        overtimeRateDay: 1.5,
        overtimeRateNight: 2.0,
        fridayOvertimeHours: 0,
        fridayOvertimeRate: 2.0,
        fridayOvertimePay: 0,
        bonus: 0,
        deductions: 0,
        latePenaltyDeduction: 0,
        loanInstallment: 0,
        socialInsurance: newEmp.gosiInsurance,
        netSalary:
          newEmp.baseSalary +
          newEmp.housingAllowance +
          newEmp.transportAllowance +
          newEmp.otherAllowances -
          newEmp.gosiInsurance,
        status: 'draft',
      };
      return [newPayrollRec, ...prev];
    });

    // Assign initial asset if provided
    if (initialAssetCode) {
      setAssets((prev) => {
        const existingAsset = prev.find(a => a.assetCode === initialAssetCode || a.assetName === initialAssetCode);
        if (existingAsset) {
          return prev.map((ast) =>
            ast.id === existingAsset.id
              ? {
                  ...ast,
                  assignedToEmployeeId: newEmp.id,
                  assignedToName: newEmp.name,
                  assignedDate: new Date().toISOString().split('T')[0],
                  status: 'مع موظف',
                }
              : ast
          );
        } else {
          const newAsset = {
            id: `ast-${Date.now()}`,
            assetCode: `AST-${Math.floor(Math.random() * 10000)}`,
            assetName: initialAssetCode,
            category: 'أخرى',
            status: 'مع موظف' as const,
            purchaseDate: new Date().toISOString().split('T')[0],
            value: 0,
            assignedToEmployeeId: newEmp.id,
            assignedToName: newEmp.name,
            assignedDate: new Date().toISOString().split('T')[0]
          };
          return [newAsset, ...prev];
        }
      });
    }
  };

  // Handle Update Employee
  const handleUpdateEmployee = (updatedEmp: Employee) => {
    setEmployees((prev) =>
      prev.map((emp) => (emp.id === updatedEmp.id ? updatedEmp : emp))
    );

    // Also update any matching fields in payroll records if needed (e.g. name, position, department, baseSalary, etc.)
    setPayrollRecords((prev) =>
      prev.map((p) =>
        p.employeeId === updatedEmp.id
          ? {
              ...p,
              employeeName: updatedEmp.name,
              position: updatedEmp.position,
              department: updatedEmp.department,
              baseSalary: updatedEmp.baseSalary,
              allowances: updatedEmp.housingAllowance + updatedEmp.transportAllowance + updatedEmp.otherAllowances,
              socialInsurance: updatedEmp.gosiInsurance,
              netSalary:
                updatedEmp.baseSalary +
                updatedEmp.housingAllowance +
                updatedEmp.transportAllowance +
                updatedEmp.otherAllowances -
                updatedEmp.gosiInsurance -
                p.loanInstallment, // keep loanInstallment intact
            }
          : p
      )
    );
  };

  // Handle Delete Employee
  const handleDeleteEmployee = (employeeId: string) => {
    if (window.confirm('هل أنت متأكد من رغبتك في حذف هذا الموظف نهائياً؟')) {
      setEmployees((prev) => prev.filter((emp) => emp.id !== employeeId));
      setPayrollRecords((prev) => prev.filter((p) => p.employeeId !== employeeId));
      setAssets((prev) =>
        prev.map((a) =>
          a.assignedToEmployeeId === employeeId
            ? {
                ...a,
                assignedToEmployeeId: undefined,
                assignedToName: undefined,
                status: 'المخزن',
              }
            : a
        )
      );
    }
  };

  // Handle Update Loan
  const handleUpdateLoan = (updatedLoan: Loan) => {
    setLoans((prev) =>
      prev.map((loan) => (loan.id === updatedLoan.id ? updatedLoan : loan))
    );

    setPayrollRecords((prev) =>
      prev.map((p) =>
        p.employeeId === updatedLoan.employeeId
          ? {
              ...p,
              loanInstallment: updatedLoan.monthlyInstallment,
              netSalary:
                p.baseSalary +
                p.allowances -
                p.deductions -
                p.latePenaltyDeduction -
                updatedLoan.monthlyInstallment -
                p.socialInsurance,
            }
          : p
      )
    );
  };

  // Handle Delete Loan
  const handleDeleteLoan = (loanId: string) => {
    if (window.confirm('هل أنت متأكد من رغبتك في حذف هذه السلفة؟')) {
      const loanToDelete = loans.find(l => l.id === loanId);
      setLoans((prev) => prev.filter((l) => l.id !== loanId));

      if (loanToDelete) {
        setPayrollRecords((prev) =>
          prev.map((p) =>
            p.employeeId === loanToDelete.employeeId
              ? {
                  ...p,
                  loanInstallment: 0,
                  netSalary:
                    p.baseSalary +
                    p.allowances -
                    p.deductions -
                    p.latePenaltyDeduction -
                    p.socialInsurance,
                }
              : p
          )
        );
      }
    }
  };

  // Handle Update Asset
  const handleUpdateAsset = (updatedAsset: Asset) => {
    setAssets((prev) =>
      prev.map((asset) => (asset.id === updatedAsset.id ? updatedAsset : asset))
    );
  };

  // Handle Delete Asset
  const handleDeleteAsset = (assetId: string) => {
    if (window.confirm('هل أنت متأكد من رغبتك في حذف هذا الأصل/العهدة؟')) {
      setAssets((prev) => prev.filter((ast) => ast.id !== assetId));
    }
  };

  // Update Attendance
  const handleUpdateAttendanceRecord = (updatedRec: AttendanceRecord) => {
    setAttendanceRecords((prev) => {
      const idx = prev.findIndex(
        (rec) =>
          rec.id === updatedRec.id ||
          (rec.employeeId === updatedRec.employeeId && rec.date === updatedRec.date)
      );
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], ...updatedRec };
        return copy;
      }
      return [...prev, updatedRec];
    });
  };

  const handleAddAttendanceRecord = (newRec: AttendanceRecord) => {
    setAttendanceRecords((prev) => {
      const idx = prev.findIndex(
        (rec) =>
          rec.id === newRec.id ||
          (rec.employeeId === newRec.employeeId && rec.date === newRec.date)
      );
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], ...newRec };
        return copy;
      }
      return [...prev, newRec];
    });
  };

  // Add Shift
  const handleAddShift = (shift: Shift) => {
    setShifts((prev) => [...prev, shift]);
  };

  // Update Shift
  const handleUpdateShift = (updatedShift: Shift) => {
    setShifts((prev) =>
      prev.map((s) => (s.id === updatedShift.id ? updatedShift : s))
    );
  };

  // Approve / Unlock Payroll
  const handleApprovePayroll = (month: string) => {
    setPayrollRecords((prev) => {
      const monthRecs = prev.filter((p) => p.month === month);
      const isAllApproved = monthRecs.length > 0 && monthRecs.every((p) => p.status === 'approved');
      const targetStatus = isAllApproved ? 'draft' : 'approved';

      return prev.map((p) =>
        p.month === month
          ? {
              ...p,
              status: targetStatus,
              approvalDate: targetStatus === 'approved' ? new Date().toISOString().split('T')[0] : undefined,
              approverName: targetStatus === 'approved' ? 'مدير الموارد البشرية' : undefined,
            }
          : p
      );
    });

    // Resolve payroll alerts
    setAlerts((prev) =>
      prev.map((a) => (a.category === 'payroll' ? { ...a, resolved: true } : a))
    );
  };

  // Update Payroll Record
  const handleUpdatePayrollRecord = (updatedRec: PayrollRecord) => {
    setPayrollRecords((prev) =>
      prev.map((p) => (p.id === updatedRec.id ? updatedRec : p))
    );
  };

  // Generate payroll for a given month
  const handleGeneratePayroll = (month: string) => {
    const existing = payrollRecords.some((p) => p.month === month);
    if (existing) return;

    const newRecords: PayrollRecord[] = employees.map((emp) => {
      const empLoan = loans.find(l => l.employeeId === emp.id && l.status === 'نشط');
      const loanInstallment = empLoan ? empLoan.monthlyInstallment : 0;

      return {
        id: `pay-${emp.id}-${month}-${Date.now()}`,
        employeeId: emp.id,
        employeeName: emp.name,
        employeeCode: emp.employeeCode,
        position: emp.position,
        department: emp.department,
        month: month,
        baseSalary: emp.baseSalary,
        allowances: emp.housingAllowance + emp.transportAllowance + emp.otherAllowances,
        overtimeHours: 0,
        overtimeRate: 1.5,
        overtimePay: 0,
        overtimeHoursDay: 0,
        overtimeHoursNight: 0,
        overtimeRateDay: 1.5,
        overtimeRateNight: 2.0,
        fridayOvertimeHours: 0,
        fridayOvertimeRate: 2.0,
        fridayOvertimePay: 0,
        bonus: 0,
        deductions: 0,
        latePenaltyDeduction: 0,
        loanInstallment: loanInstallment,
        socialInsurance: emp.gosiInsurance,
        netSalary:
          emp.baseSalary +
          emp.housingAllowance +
          emp.transportAllowance +
          emp.otherAllowances -
          loanInstallment -
          emp.gosiInsurance,
        status: 'draft',
      };
    });

    if (newRecords.length > 0) {
      setPayrollRecords((prev) => [...newRecords, ...prev]);
    }
  };

  // Add Loan
  const handleAddLoan = (loan: Loan) => {
    setLoans((prev) => [loan, ...prev]);

    // Update payroll record with new monthly installment
    setPayrollRecords((prev) =>
      prev.map((p) =>
        p.employeeId === loan.employeeId
          ? {
              ...p,
              loanInstallment: loan.monthlyInstallment,
              netSalary:
                p.baseSalary +
                p.allowances -
                p.deductions -
                p.latePenaltyDeduction -
                loan.monthlyInstallment -
                p.socialInsurance,
            }
          : p
      )
    );
  };

  // Add Asset
  const handleAddAsset = (asset: Asset) => {
    setAssets((prev) => [asset, ...prev]);
  };

  // Assign Asset
  const handleAssignAsset = (assetId: string, employeeId?: string, employeeName?: string) => {
    setAssets((prev) =>
      prev.map((a) =>
        a.id === assetId
          ? {
              ...a,
              assignedToEmployeeId: employeeId,
              assignedToName: employeeName,
              assignedDate: employeeId ? new Date().toISOString().split('T')[0] : undefined,
              status: employeeId ? 'مع موظف' : 'المخزن',
            }
          : a
      )
    );
  };

  // Resolve Alert
  const handleResolveAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, resolved: true } : a))
    );
  };

  const handleLogin = (password: string) => {
    if (password === '1001') {
      localStorage.setItem('isAuthenticated', 'true');
      setIsAuthenticated(true);
      return { success: true };
    }
    if (password === '0000') {
      let trialStart = localStorage.getItem('trialStartDate');
      if (!trialStart) {
        trialStart = new Date().toISOString();
        localStorage.setItem('trialStartDate', trialStart);
      }
      
      const startDate = new Date(trialStart);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays > 7) {
        return { success: false, message: 'انتهت فترة التجربة (7 أيام). يرجى التواصل مع الإدارة.' };
      }
      
      localStorage.setItem('isAuthenticated', 'true');
      setIsAuthenticated(true);
      return { success: true };
    }
    return { success: false, message: 'كلمة المرور غير صحيحة' };
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <LoginView onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex transition-colors font-sans" dir="rtl">
      {/* Right Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        unresolvedAlertsCount={alerts.filter((a) => !a.resolved).length}
        onLogout={handleLogout}
      />

      {/* Main Content View Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          alerts={alerts}
          onResolveAlert={handleResolveAlert}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          todayAttendanceCount={attendanceRecords.filter((a) => a.status === 'present' || a.status === 'late').length}
          totalEmployeesCount={employees.length}
        />

        {/* View Switcher */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              employees={employees}
              attendance={attendanceRecords}
              payroll={payrollRecords}
              alerts={alerts}
              departments={departments}
              setActiveTab={setActiveTab}
              onQuickCheckIn={(id) => {
                const emp = employees.find(e => e.id === id);
                if (!emp) return;
                const now = new Date();
                const newRecord: AttendanceRecord = {
                  id: `att-quick-${Date.now()}`,
                  employeeId: id,
                  employeeName: emp.name,
                  department: emp.department,
                  date: now.toISOString().split('T')[0],
                  checkIn: `${now.getHours()}:${now.getMinutes()}`,
                  checkOut: '',
                  status: 'present',
                  delayMinutes: 0,
                  earlyLeaveMinutes: 0,
                  shiftName: 'صباحي'
                };
                setAttendanceRecords((prev) => [...prev, newRecord]);
              }}
              onOpenAddEmployeeModal={() => setActiveTab('employees')}
              onResolveAlert={handleResolveAlert}
              currencySymbol={currencySymbol}
            />
          )}

          {activeTab === 'employees' && (
            <EmployeesView
              employees={employees}
              departments={departments}
              assets={assets}
              loans={loans}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              onAddEmployee={handleAddEmployee}
              onUpdateEmployee={handleUpdateEmployee}
              onDeleteEmployee={handleDeleteEmployee}
              currencySymbol={currencySymbol}
            />
          )}

          {activeTab === 'employee_effects' && (
            <EmployeeEffectsView
              employees={employees}
              attendance={attendanceRecords}
              payroll={payrollRecords}
              currencySymbol={currencySymbol}
              departments={departments}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              onUpdateAttendanceRecord={handleUpdateAttendanceRecord}
              onAddAttendanceRecord={handleAddAttendanceRecord}
            />
          )}

          {activeTab === 'attendance' && (
            <AttendanceView
              attendance={attendanceRecords}
              shifts={shifts}
              employees={employees}
              onUpdateAttendanceRecord={handleUpdateAttendanceRecord}
              onAddAttendanceRecord={handleAddAttendanceRecord}
              onAddEmployee={handleAddEmployee}
              onAddShift={handleAddShift}
              onUpdateShift={handleUpdateShift}
            />
          )}

          {activeTab === 'payroll' && (
            <PayrollView
              payrollRecords={payrollRecords}
              employees={employees}
              departments={departments}
              onApprovePayroll={handleApprovePayroll}
              onUpdatePayrollRecord={handleUpdatePayrollRecord}
              onGeneratePayroll={handleGeneratePayroll}
              currencySymbol={currencySymbol}
            />
          )}

          {(activeTab === 'loans-assets' || (activeTab as string) === 'loans_assets') && (
            <LoansAssetsView
              loans={loans}
              assets={assets}
              employees={employees}
              onAddLoan={handleAddLoan}
              onAddAsset={handleAddAsset}
              onAssignAsset={handleAssignAsset}
              onUpdateLoan={handleUpdateLoan}
              onDeleteLoan={handleDeleteLoan}
              onUpdateAsset={handleUpdateAsset}
              onDeleteAsset={handleDeleteAsset}
              currencySymbol={currencySymbol}
            />
          )}

          {(activeTab === 'ai-assistant' || (activeTab as string) === 'ai_assistant') && (
            <AiAssistantView />
          )}

          {activeTab === 'reports' && (
            <ReportsView
              departments={departments}
              payroll={payrollRecords}
              employees={employees}
              currencySymbol={currencySymbol}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              darkMode={darkMode}
              setDarkMode={setDarkMode}
              currencySymbol={currencySymbol}
              setCurrencySymbol={setCurrencySymbol}
            />
          )}

          {activeTab === 'database' && (
            <DatabaseView
              employees={employees}
              attendanceRecords={attendanceRecords}
              payrollRecords={payrollRecords}
              loans={loans}
              assets={assets}
              alerts={alerts}
              shifts={shifts}
              documents={documents}
              currencySymbol={currencySymbol}
              onRestoreData={handleRestoreData}
              onClearData={handleClearData}
            />
          )}

          {activeTab === 'documents' && (
            <DocumentsView
              documents={documents}
              onAddDocument={handleAddDocument}
              onDeleteDocument={handleDeleteDocument}
            />
          )}
        </main>
      </div>
    </div>
  );
}

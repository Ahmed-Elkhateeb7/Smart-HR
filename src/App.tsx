import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { EmployeesView } from './components/EmployeesView';
import { AttendanceView } from './components/AttendanceView';
import { PayrollView } from './components/PayrollView';
import { LoansAssetsView } from './components/LoansAssetsView';
import { AiAssistantView } from './components/AiAssistantView';
import { ReportsView } from './components/ReportsView';
import { SettingsView } from './components/SettingsView';
import { DatabaseView } from './components/DatabaseView';

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
  TabType
} from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [darkMode, setDarkMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currencySymbol, setCurrencySymbol] = useState(initialCompanySettings.currencySymbol);

  // Core State
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(initialAttendanceRecords);
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>(initialPayrollRecords);
  const [loans, setLoans] = useState<Loan[]>(initialLoans);
  const [assets, setAssets] = useState<Asset[]>(initialAssets);
  const [alerts, setAlerts] = useState<SystemAlert[]>(initialSystemAlerts);
  const [departments] = useState<Department[]>(initialDepartments);
  const [shifts, setShifts] = useState<Shift[]>(initialShifts);

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
    setEmployees((prev) => [newEmp, ...prev]);

    // Create default Payroll Record for new employee
    const newPayrollRec: PayrollRecord = {
      id: `pay-${Date.now()}`,
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
    setPayrollRecords((prev) => [newPayrollRec, ...prev]);

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

  // Update Attendance
  const handleUpdateAttendanceRecord = (updatedRec: AttendanceRecord) => {
    setAttendanceRecords((prev) =>
      prev.map((rec) => (rec.id === updatedRec.id ? updatedRec : rec))
    );
  };

  // Add Shift
  const handleAddShift = (shift: Shift) => {
    setShifts((prev) => [...prev, shift]);
  };

  // Approve Payroll & Lock
  const handleApprovePayroll = (month: string) => {
    setPayrollRecords((prev) =>
      prev.map((p) =>
        p.month === month
          ? {
              ...p,
              status: 'approved',
              approvalDate: new Date().toISOString().split('T')[0],
              approverName: 'مدير الموارد البشرية',
            }
          : p
      )
    );

    // Resolve payroll alerts
    setAlerts((prev) =>
      prev.map((a) => (a.category === 'payroll' ? { ...a, resolved: true } : a))
    );
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
                p.allowances +
                p.overtimePay -
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

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex transition-colors font-sans" dir="rtl">
      {/* Right Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        unresolvedAlertsCount={alerts.filter((a) => !a.resolved).length}
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
              currencySymbol={currencySymbol}
            />
          )}

          {activeTab === 'attendance' && (
            <AttendanceView
              attendance={attendanceRecords}
              shifts={shifts}
              onUpdateAttendanceRecord={handleUpdateAttendanceRecord}
              onAddShift={handleAddShift}
            />
          )}

          {activeTab === 'payroll' && (
            <PayrollView
              payrollRecords={payrollRecords}
              onApprovePayroll={handleApprovePayroll}
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
            <DatabaseView />
          )}
        </main>
      </div>
    </div>
  );
}

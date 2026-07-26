export type TabType =
  | 'dashboard'
  | 'employees'
  | 'attendance'
  | 'payroll'
  | 'loans-assets'
  | 'ai-assistant'
  | 'reports'
  | 'settings'
  | 'database';

export type EmployeeStatus = 'active' | 'on_leave' | 'suspended' | 'resigned';

export interface Employee {
  id: string;
  employeeCode: string;
  name: string;
  position: string;
  department: string;
  email: string;
  phone: string;
  avatar: string;
  baseSalary: number;
  housingAllowance: number;
  transportAllowance: number;
  otherAllowances: number;
  gosiInsurance: number; // Insurance deduction
  iqamaOrIdNumber: string;
  iqamaExpiryDate: string; // YYYY-MM-DD
  contractType: 'مصري' | 'أجنبي' | 'سعودي' | 'مقيم' | 'دوام جزئي' | 'عقد محدد';
  contractExpiryDate: string; // YYYY-MM-DD
  joinDate: string; // YYYY-MM-DD
  status: EmployeeStatus;
  bankAccount: string;
  bankName: string;
}

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'leave' | 'early_leave';

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  date: string; // YYYY-MM-DD
  checkIn: string; // HH:MM
  checkOut: string; // HH:MM
  delayMinutes: number;
  earlyLeaveMinutes: number;
  status: AttendanceStatus;
  shiftName: string;
  notes?: string;
}

export interface Shift {
  id: string;
  name: string;
  type: 'morning' | 'evening' | 'flexible' | 'night';
  startTime: string; // e.g. "08:00"
  endTime: string;   // e.g. "16:00"
  gracePeriodMinutes: number;
  workingHours: number;
  activeDays: string[]; // e.g. ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس"]
}

export interface PayrollRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  position: string;
  department: string;
  month: string; // e.g. "2026-07"
  baseSalary: number;
  allowances: number;
  overtimeHours: number;
  overtimeRate: number;
  overtimePay: number;
  deductions: number;
  latePenaltyDeduction: number;
  loanInstallment: number;
  socialInsurance: number;
  netSalary: number;
  status: 'draft' | 'approved';
  approvalDate?: string;
  approvedBy?: string;
}

export interface Loan {
  id: string;
  employeeId: string;
  employeeName: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  monthlyInstallment: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'pending';
  notes?: string;
}

export interface Asset {
  id: string;
  assetName: string;
  assetCode: string;
  category: 'لاب توب' | 'هاتف ذكي' | 'سيارة' | 'معدات مكتبية' | 'شاشة / ملحقات';
  serialNumber: string;
  assignedToEmployeeId?: string;
  assignedToName?: string;
  assignedDate?: string;
  condition: 'جديد' | 'ممتاز' | 'جيد' | 'يحتاج صيانة';
  status: 'مع موظف' | 'المخزن' | 'صيانة';
  value: number;
}

export interface SystemAlert {
  id: string;
  title: string;
  description: string;
  severity: 'danger' | 'warning' | 'info';
  category: 'payroll' | 'document' | 'attendance' | 'asset';
  date: string;
  resolved: boolean;
  relatedEmployeeId?: string;
}

export interface Department {
  id: string;
  name: string;
  managerName: string;
  employeeCount: number;
  monthlyBudget: number;
  iconName?: string;
}

export interface CompanySettings {
  companyName: string;
  taxNumber: string;
  commercialRecord: string;
  overtimeRateMultiplier: number; // e.g. 1.5
  gosiEmployeePercent: number; // e.g. 9.75%
  lateGraceMinutes: number; // e.g. 15 mins
  enableSmartGuard: boolean;
  currencySymbol: string; // "ج.م"
  workDaysPerMonth: number; // e.g. 22 or 30
}

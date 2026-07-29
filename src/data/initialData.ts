import {
  Employee,
  AttendanceRecord,
  Shift,
  PayrollRecord,
  Loan,
  Asset,
  SystemAlert,
  Department,
  CompanySettings
} from '../types';

export const initialDepartments: Department[] = [
  { id: 'dep-1', name: 'تكنولوجيا المعلومات', managerName: 'م. أحمد علي', employeeCount: 0, monthlyBudget: 150000 },
  { id: 'dep-2', name: 'الموارد البشرية', managerName: 'أ. سارة محمود', employeeCount: 0, monthlyBudget: 80000 },
  { id: 'dep-3', name: 'التسويق والمبيعات', managerName: 'أ. كريم حسن', employeeCount: 0, monthlyBudget: 120000 },
  { id: 'dep-4', name: 'المالية والمحاسبة', managerName: 'أ. طارق عبدالفتاح', employeeCount: 0, monthlyBudget: 95000 },
  { id: 'dep-5', name: 'التشغيل والخدمات', managerName: 'م. خالد مصطفى', employeeCount: 0, monthlyBudget: 70000 },
  { id: 'dep-6', name: 'قسم الإدارة', managerName: 'د. محمد إبراهيم', employeeCount: 0, monthlyBudget: 200000 },
  { id: 'dep-7', name: 'قسم المخازن', managerName: 'أ. محمود سامي', employeeCount: 0, monthlyBudget: 65000 },
  { id: 'dep-8', name: 'قسم الجودة', managerName: 'م. ياسمين نبيل', employeeCount: 0, monthlyBudget: 75000 },
  { id: 'dep-9', name: 'قسم الحركة والنقل', managerName: 'أ. حسن السيد', employeeCount: 0, monthlyBudget: 85000 },
  { id: 'dep-10', name: 'قسم المشتريات', managerName: 'أ. عمر الخولي', employeeCount: 0, monthlyBudget: 90000 },
];

export const initialEmployees: Employee[] = [];

export const initialShifts: Shift[] = [
  {
    id: 'sh-1',
    name: 'الوردية الصباحية الأساسية',
    type: 'morning',
    startTime: '08:00',
    endTime: '16:00',
    gracePeriodMinutes: 15,
    workingHours: 8,
    activeDays: ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'],
  },
  {
    id: 'sh-2',
    name: 'الوردية المسائية الدعم',
    type: 'evening',
    startTime: '16:00',
    endTime: '00:00',
    gracePeriodMinutes: 15,
    workingHours: 8,
    activeDays: ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'],
  },
  {
    id: 'sh-3',
    name: 'وردية الدوام المرن',
    type: 'flexible',
    startTime: '09:00',
    endTime: '17:00',
    gracePeriodMinutes: 30,
    workingHours: 8,
    activeDays: ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'],
  },
];

export const initialAttendanceRecords: AttendanceRecord[] = [];

export const initialPayrollRecords: PayrollRecord[] = [];

export const initialLoans: Loan[] = [];

export const initialAssets: Asset[] = [];

export const initialSystemAlerts: SystemAlert[] = [];

export const initialCompanySettings: CompanySettings = {
  companyName: 'شركة جديدة',
  taxNumber: '',
  commercialRecord: '',
  overtimeRateMultiplier: 1.5,
  gosiEmployeePercent: 11,
  lateGraceMinutes: 15,
  enableSmartGuard: true,
  currencySymbol: 'ج.م',
  workDaysPerMonth: 30,
};

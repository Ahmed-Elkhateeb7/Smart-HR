import {
  Employee,
  AttendanceRecord,
  PayrollRecord,
  Loan,
  Asset,
  SystemAlert,
  Shift,
  DocumentItem
} from '../types';

import {
  initialEmployees,
  initialAttendanceRecords,
  initialPayrollRecords,
  initialLoans,
  initialAssets,
  initialSystemAlerts,
  initialShifts,
  initialCompanySettings
} from '../data/initialData';

export const STORAGE_KEYS = {
  EMPLOYEES: 'hr_app_employees_v1',
  ATTENDANCE: 'hr_app_attendance_v1',
  PAYROLL: 'hr_app_payroll_v1',
  LOANS: 'hr_app_loans_v1',
  ASSETS: 'hr_app_assets_v1',
  ALERTS: 'hr_app_alerts_v1',
  SHIFTS: 'hr_app_shifts_v1',
  DOCUMENTS: 'hr_app_documents_v1',
  CURRENCY: 'hr_app_currency_v1',
};

// Safe JSON parser
function safeParse<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    const parsed = JSON.parse(item);
    return parsed !== null && parsed !== undefined ? parsed : fallback;
  } catch (error) {
    console.error(`Error loading key ${key} from localStorage:`, error);
    return fallback;
  }
}

// Save helper
function safeSave(key: string, data: any): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving key ${key} to localStorage:`, error);
  }
}

// Load all initial state
export function loadAllState() {
  return {
    employees: safeParse<Employee[]>(STORAGE_KEYS.EMPLOYEES, initialEmployees),
    attendanceRecords: safeParse<AttendanceRecord[]>(STORAGE_KEYS.ATTENDANCE, initialAttendanceRecords),
    payrollRecords: safeParse<PayrollRecord[]>(STORAGE_KEYS.PAYROLL, initialPayrollRecords),
    loans: safeParse<Loan[]>(STORAGE_KEYS.LOANS, initialLoans),
    assets: safeParse<Asset[]>(STORAGE_KEYS.ASSETS, initialAssets),
    alerts: safeParse<SystemAlert[]>(STORAGE_KEYS.ALERTS, initialSystemAlerts),
    shifts: safeParse<Shift[]>(STORAGE_KEYS.SHIFTS, initialShifts),
    documents: safeParse<DocumentItem[]>(STORAGE_KEYS.DOCUMENTS, []),
    currencySymbol: safeParse<string>(STORAGE_KEYS.CURRENCY, initialCompanySettings.currencySymbol),
  };
}

// Save state functions
export function saveEmployees(employees: Employee[]) {
  safeSave(STORAGE_KEYS.EMPLOYEES, employees);
}

export function saveAttendanceRecords(records: AttendanceRecord[]) {
  safeSave(STORAGE_KEYS.ATTENDANCE, records);
}

export function savePayrollRecords(records: PayrollRecord[]) {
  safeSave(STORAGE_KEYS.PAYROLL, records);
}

export function saveLoans(loans: Loan[]) {
  safeSave(STORAGE_KEYS.LOANS, loans);
}

export function saveAssets(assets: Asset[]) {
  safeSave(STORAGE_KEYS.ASSETS, assets);
}

export function saveAlerts(alerts: SystemAlert[]) {
  safeSave(STORAGE_KEYS.ALERTS, alerts);
}

export function saveShifts(shifts: Shift[]) {
  safeSave(STORAGE_KEYS.SHIFTS, shifts);
}

export function saveDocuments(documents: DocumentItem[]) {
  safeSave(STORAGE_KEYS.DOCUMENTS, documents);
}

export function saveCurrencySymbol(currencySymbol: string) {
  safeSave(STORAGE_KEYS.CURRENCY, currencySymbol);
}

// Calculate storage size in MB
export function calculateStorageSizeMB(): number {
  let totalBytes = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      const val = localStorage.getItem(key) || '';
      totalBytes += (key.length + val.length) * 2; // UTF-16 bytes approx
    }
  }
  const sizeMB = totalBytes / (1024 * 1024);
  return Number(sizeMB.toFixed(3));
}

export interface BackupDataFormat {
  version: string;
  timestamp: string;
  appName: string;
  data: {
    employees?: Employee[];
    attendanceRecords?: AttendanceRecord[];
    payrollRecords?: PayrollRecord[];
    loans?: Loan[];
    assets?: Asset[];
    alerts?: SystemAlert[];
    shifts?: Shift[];
    documents?: DocumentItem[];
    currencySymbol?: string;
  };
}

// Create complete backup payload
export function createBackupPayload(state: {
  employees: Employee[];
  attendanceRecords: AttendanceRecord[];
  payrollRecords: PayrollRecord[];
  loans: Loan[];
  assets: Asset[];
  alerts: SystemAlert[];
  shifts: Shift[];
  documents: DocumentItem[];
  currencySymbol: string;
}): BackupDataFormat {
  return {
    version: 'HR-SYSTEM-DATABASE-v2.0',
    timestamp: new Date().toISOString(),
    appName: 'نظام الموارد البشرية المتكامل',
    data: {
      employees: state.employees,
      attendanceRecords: state.attendanceRecords,
      payrollRecords: state.payrollRecords,
      loans: state.loans,
      assets: state.assets,
      alerts: state.alerts,
      shifts: state.shifts,
      documents: state.documents,
      currencySymbol: state.currencySymbol,
    }
  };
}

// Restore state from JSON content
export function parseAndRestoreBackup(jsonString: string): {
  success: boolean;
  message: string;
  restoredData?: {
    employees: Employee[];
    attendanceRecords: AttendanceRecord[];
    payrollRecords: PayrollRecord[];
    loans: Loan[];
    assets: Asset[];
    alerts: SystemAlert[];
    shifts: Shift[];
    documents: DocumentItem[];
    currencySymbol: string;
  };
} {
  try {
    const parsed = JSON.parse(jsonString);

    // Support both direct data wrapper and root payload formats
    let rawData: any = parsed.data || parsed;

    if (!rawData || typeof rawData !== 'object') {
      return { success: false, message: 'ملف غير صالح: لا يحتوي على تنسيق بيانات متاح.' };
    }

    const employees = Array.isArray(rawData.employees) ? rawData.employees : (Array.isArray(parsed.employees) ? parsed.employees : undefined);
    const attendanceRecords = Array.isArray(rawData.attendanceRecords) ? rawData.attendanceRecords : (Array.isArray(parsed.attendanceRecords) ? parsed.attendanceRecords : undefined);
    const payrollRecords = Array.isArray(rawData.payrollRecords) ? rawData.payrollRecords : (Array.isArray(parsed.payrollRecords) ? parsed.payrollRecords : undefined);
    const loans = Array.isArray(rawData.loans) ? rawData.loans : (Array.isArray(parsed.loans) ? parsed.loans : undefined);
    const assets = Array.isArray(rawData.assets) ? rawData.assets : (Array.isArray(parsed.assets) ? parsed.assets : undefined);
    const alerts = Array.isArray(rawData.alerts) ? rawData.alerts : (Array.isArray(parsed.alerts) ? parsed.alerts : undefined);
    const shifts = Array.isArray(rawData.shifts) ? rawData.shifts : (Array.isArray(parsed.shifts) ? parsed.parsedShifts : undefined);
    const documents = Array.isArray(rawData.documents) ? rawData.documents : (Array.isArray(parsed.documents) ? parsed.documents : undefined);
    const currencySymbol = typeof rawData.currencySymbol === 'string' ? rawData.currencySymbol : (typeof parsed.currencySymbol === 'string' ? parsed.currencySymbol : undefined);

    // If none of the main tables exist
    if (!employees && !attendanceRecords && !payrollRecords && !loans && !assets) {
      return {
        success: false,
        message: 'عذراً، الملف المرفق لا يحتوي على الجداول الرئيسية للنظام (الموظفين، المرتبات، الحضور...).'
      };
    }

    // Load current state as base
    const current = loadAllState();

    const restored = {
      employees: employees || current.employees,
      attendanceRecords: attendanceRecords || current.attendanceRecords,
      payrollRecords: payrollRecords || current.payrollRecords,
      loans: loans || current.loans,
      assets: assets || current.assets,
      alerts: alerts || current.alerts,
      shifts: shifts || current.shifts,
      documents: documents || current.documents,
      currencySymbol: currencySymbol || current.currencySymbol,
    };

    // Save to localStorage immediately
    saveEmployees(restored.employees);
    saveAttendanceRecords(restored.attendanceRecords);
    savePayrollRecords(restored.payrollRecords);
    saveLoans(restored.loans);
    saveAssets(restored.assets);
    saveAlerts(restored.alerts);
    saveShifts(restored.shifts);
    saveDocuments(restored.documents);
    saveCurrencySymbol(restored.currencySymbol);

    const counts = [
      restored.employees ? `${restored.employees.length} موظف` : null,
      restored.payrollRecords ? `${restored.payrollRecords.length} سجل مرتبات` : null,
      restored.attendanceRecords ? `${restored.attendanceRecords.length} سجل حضور` : null,
      restored.loans ? `${restored.loans.length} سلفة` : null,
      restored.assets ? `${restored.assets.length} أصل/عهدة` : null,
    ].filter(Boolean).join('، ');

    return {
      success: true,
      message: `تم استعادة قاعدة البيانات بنجاح! (${counts})`,
      restoredData: restored
    };
  } catch (err: any) {
    return {
      success: false,
      message: `فشل قراءة الملف. تأكد من أن الملف بصيغة JSON صحيحة. (${err?.message || 'خطأ غير معروف'})`
    };
  }
}

// Clear storage
export function clearAllStorage() {
  Object.values(STORAGE_KEYS).forEach((key) => {
    localStorage.removeItem(key);
  });
}

import React, { useState } from 'react';
import {
  Calculator,
  ShieldCheck,
  Lock,
  Printer,
  Calendar,
  CheckCircle2,
  DollarSign,
  AlertTriangle,
  Download,
  Eye,
  Sparkles
} from 'lucide-react';
import { PayrollRecord } from '../types';
import { PayslipModal } from './PayslipModal';

interface PayrollViewProps {
  payrollRecords: PayrollRecord[];
  onApprovePayroll: (month: string) => void;
  currencySymbol: string;
}

export const PayrollView: React.FC<PayrollViewProps> = ({
  payrollRecords,
  onApprovePayroll,
  currencySymbol,
}) => {
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-07');
  const [activePayslipRecord, setActivePayslipRecord] = useState<PayrollRecord | null>(null);

  const monthRecords = payrollRecords.filter((p) => p.month === selectedMonth);
  const isApproved = monthRecords.length > 0 && monthRecords.every((p) => p.status === 'approved');

  const totalBaseSalary = monthRecords.reduce((sum, p) => sum + p.baseSalary, 0);
  const totalAllowances = monthRecords.reduce((sum, p) => sum + p.allowances, 0);
  const totalOvertime = monthRecords.reduce((sum, p) => sum + p.overtimePay, 0);
  const totalDeductions = monthRecords.reduce(
    (sum, p) => sum + p.deductions + p.latePenaltyDeduction + p.loanInstallment + p.socialInsurance,
    0
  );
  const totalNetSalary = monthRecords.reduce((sum, p) => sum + p.netSalary, 0);

  return (
    <div className="space-y-6 pb-10">
      {/* Header & Lock Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Calculator className="w-6 h-6 text-blue-600" />
            <span>مسير الرواتب والمرتبات (Payroll Engine)</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            احتساب الراتب الأساسي + البدلات + الساعات الإضافية - الاستقطاعات والسلف والتأمينات = الصافي.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700">
            <Calendar className="w-4 h-4 text-blue-600" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="text-xs font-bold bg-transparent text-slate-800 dark:text-slate-100 focus:outline-none"
            >
              <option value="2026-07">مسير يوليو 2026</option>
              <option value="2026-06">مسير يونيو 2026</option>
              <option value="2026-05">مسير مايو 2026</option>
            </select>
          </div>

          <button
            id="approve-payroll-lock-btn"
            onClick={() => onApprovePayroll(selectedMonth)}
            disabled={isApproved || monthRecords.length === 0}
            className={`px-5 py-2.5 rounded-xl font-extrabold text-xs shadow-sm transition-all flex items-center gap-2 ${
              isApproved
                ? 'bg-emerald-600 text-white cursor-default'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-blue-500/20'
            }`}
          >
            {isApproved ? (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>الرواتب معتمدة ومقفولة رسمياً ✓</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 text-amber-300" />
                <span>اعتماد المرتبات وإقفال الشهر</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
          <span className="text-[11px] text-slate-400 font-bold block">الراتب الأساسي</span>
          <p className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">
            {totalBaseSalary.toLocaleString()} {currencySymbol}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
          <span className="text-[11px] text-slate-400 font-bold block">إجمالي البدلات</span>
          <p className="text-lg font-extrabold text-emerald-600 mt-1">
            +{totalAllowances.toLocaleString()} {currencySymbol}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
          <span className="text-[11px] text-slate-400 font-bold block">ساعات إضافية (Overtime)</span>
          <p className="text-lg font-extrabold text-blue-600 mt-1">
            +{totalOvertime.toLocaleString()} {currencySymbol}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
          <span className="text-[11px] text-slate-400 font-bold block">إجمالي الخصومات والسلف</span>
          <p className="text-lg font-extrabold text-red-500 mt-1">
            -{totalDeductions.toLocaleString()} {currencySymbol}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-tr from-blue-900 to-indigo-900 text-white col-span-2 lg:col-span-1 shadow-sm">
          <span className="text-[11px] text-blue-200 font-bold block">إجمالي الصافي المستحق</span>
          <p className="text-xl font-black mt-1">
            {totalNetSalary.toLocaleString()} {currencySymbol}
          </p>
        </div>
      </div>

      {/* Payroll Worksheet Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xs">
        <table className="w-full text-right text-xs">
          <thead className="bg-white dark:bg-slate-900/80 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="p-3.5">الموظف</th>
              <th className="p-3.5">القسم</th>
              <th className="p-3.5">الأساسي</th>
              <th className="p-3.5">البدلات</th>
              <th className="p-3.5">ساعات إضافية</th>
              <th className="p-3.5">قسط السلفة</th>
              <th className="p-3.5">تأمينات GOSI</th>
              <th className="p-3.5">تأخير/جزاءات</th>
              <th className="p-3.5 font-black text-blue-600 dark:text-blue-400">الصافي المستحق</th>
              <th className="p-3.5 text-center">قسيمة المرتب</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
            {monthRecords.map((rec) => (
              <tr key={rec.id} className="hover:bg-white/80 dark:hover:bg-slate-700/40 transition-colors">
                <td className="p-3.5">
                  <p className="font-extrabold text-slate-800 dark:text-slate-100">{rec.employeeName}</p>
                  <p className="text-[10px] text-slate-400">{rec.position} ({rec.employeeCode})</p>
                </td>
                <td className="p-3.5 text-slate-600 dark:text-slate-300">{rec.department}</td>
                <td className="p-3.5 font-bold text-slate-800 dark:text-slate-200">
                  {rec.baseSalary.toLocaleString()}
                </td>
                <td className="p-3.5 font-bold text-emerald-600">
                  +{rec.allowances.toLocaleString()}
                </td>
                <td className="p-3.5 font-bold text-blue-600">
                  +{rec.overtimePay.toLocaleString()} <span className="text-[10px] font-normal">({rec.overtimeHours}س)</span>
                </td>
                <td className="p-3.5 font-bold text-amber-600">
                  {rec.loanInstallment > 0 ? `-${rec.loanInstallment}` : '-'}
                </td>
                <td className="p-3.5 font-bold text-red-500">
                  -{rec.socialInsurance}
                </td>
                <td className="p-3.5 font-bold text-red-500">
                  {rec.latePenaltyDeduction > 0 ? `-${rec.latePenaltyDeduction}` : '-'}
                </td>
                <td className="p-3.5 font-black text-sm text-blue-600 dark:text-blue-400 bg-blue-50/40 dark:bg-blue-950/20">
                  {rec.netSalary.toLocaleString()} {currencySymbol}
                </td>
                <td className="p-3.5 text-center">
                  <button
                    id={`open-payslip-${rec.id}`}
                    onClick={() => setActivePayslipRecord(rec)}
                    className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold transition-colors flex items-center justify-center gap-1 mx-auto"
                  >
                    <Printer className="w-3.5 h-3.5 text-blue-600" />
                    <span>عرض القسيمة</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Printable Payslip Modal */}
      {activePayslipRecord && (
        <PayslipModal
          payrollRecord={activePayslipRecord}
          onClose={() => setActivePayslipRecord(null)}
          currencySymbol={currencySymbol}
        />
      )}
    </div>
  );
};

import React from 'react';
import {
  BarChart3,
  Printer,
  Globe,
  ExternalLink,
  Building2,
  Users,
  Wallet,
  TrendingUp,
  Briefcase,
  CheckCircle2
} from 'lucide-react';
import { Department, PayrollRecord, Employee } from '../types';

interface ReportsViewProps {
  departments: Department[];
  payroll: PayrollRecord[];
  employees: Employee[];
  currencySymbol: string;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  departments,
  payroll,
  employees,
  currencySymbol,
}) => {
  const totalPayrollCost = payroll.reduce((sum, p) => sum + p.netSalary, 0);
  const totalOvertimeCost = payroll.reduce((sum, p) => sum + p.overtimePay, 0);
  const totalDeductionsCost = payroll.reduce((sum, p) => sum + p.deductions + p.latePenaltyDeduction, 0);

  const recruitmentPlatforms = [
    {
      name: 'منصة جدارات (Jadarat)',
      type: 'منصة التوظيف الوطنية',
      iconColor: 'bg-emerald-600',
      connected: true,
      activeJobsCount: 3,
      link: 'https://jadarat.sa',
    },
    {
      name: 'LinkedIn Talent Solutions',
      type: 'شبكة التوظيف الاحترافية',
      iconColor: 'bg-blue-600',
      connected: true,
      activeJobsCount: 5,
      link: 'https://linkedin.com',
    },
    {
      name: 'منصة بيت.كوم (Bayt.com)',
      type: 'بوابة التوظيف الإقليمية',
      iconColor: 'bg-indigo-600',
      connected: true,
      activeJobsCount: 2,
      link: 'https://bayt.com',
    },
    {
      name: 'محرك تنقيب (Tanqeeb)',
      type: 'مُحرك أبحاث الوظائف',
      iconColor: 'bg-purple-600',
      connected: true,
      activeJobsCount: 4,
      link: 'https://tanqeeb.com',
    },
  ];

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <span>التقارير التنفيذية وتكامل منصات التوظيف</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            تحليل تكاليف الأجور، التوزيع المالي للأقسام، ومتابعة ربط وظائف الشركة مع المنصات الخارجية.
          </p>
        </div>

        <button
          onClick={handlePrintReport}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm flex items-center gap-2 self-start md:self-auto"
        >
          <Printer className="w-4 h-4" />
          <span>طباعة التقرير التنفيذي</span>
        </button>
      </div>

      {/* High-Level Financial Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
          <span className="text-xs font-bold text-slate-400 block">إجمالي كلفة الرواتب الشهرية</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {totalPayrollCost.toLocaleString()} {currencySymbol}
          </p>
          <p className="text-[10px] text-emerald-600 font-bold mt-2">ضمن الميزانية المعتمدة ✓</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
          <span className="text-xs font-bold text-slate-400 block">تكلفة الساعات الإضافية (Overtime)</span>
          <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
            +{totalOvertimeCost.toLocaleString()} {currencySymbol}
          </p>
          <p className="text-[10px] text-slate-400 mt-2">شملت 28 ساعة عمل إضافي هذا الشهر</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
          <span className="text-xs font-bold text-slate-400 block">وفورات جزاءات التأخير والخصم</span>
          <p className="text-2xl font-black text-red-500 mt-1">
            -{totalDeductionsCost.toLocaleString()} {currencySymbol}
          </p>
          <p className="text-[10px] text-slate-400 mt-2">خصمت تلقائياً بموجب السياسات</p>
        </div>
      </div>

      {/* Department Budget Breakdown Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              تحليل الميزانية المعتمدة مقابل الكلفة الفعلية لكل قسم
            </h3>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-white dark:bg-slate-900/80 text-slate-500 dark:text-slate-400 font-bold">
              <tr>
                <th className="p-3">القسم</th>
                <th className="p-3">مدير القسم</th>
                <th className="p-3">عدد الكادر</th>
                <th className="p-3">الميزانية الشهرية</th>
                <th className="p-3">الكلفة الفعلية للرواتب</th>
                <th className="p-3">نسبة الاستهلاك</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {departments.map((dept) => {
                const deptEmps = employees.filter((e) => e.department === dept.name);
                const actualCost = payroll
                  .filter((p) => p.department === dept.name)
                  .reduce((sum, p) => sum + p.netSalary, 0);

                const usagePercent = Math.round((actualCost / dept.monthlyBudget) * 100) || 0;

                return (
                  <tr key={dept.id} className="hover:bg-white/80 dark:hover:bg-slate-700/40">
                    <td className="p-3 font-extrabold text-slate-800 dark:text-slate-100">{dept.name}</td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">{dept.managerName}</td>
                    <td className="p-3 font-bold">{deptEmps.length} موظفين</td>
                    <td className="p-3 font-bold text-slate-700 dark:text-slate-200">
                      {dept.monthlyBudget.toLocaleString()} {currencySymbol}
                    </td>
                    <td className="p-3 font-extrabold text-blue-600 dark:text-blue-400">
                      {actualCost.toLocaleString()} {currencySymbol}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{usagePercent}%</span>
                        <div className="w-20 bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-2 rounded-full ${
                              usagePercent > 90 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(usagePercent, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recruitment Platforms Section */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                تكامل منصات التوظيف والاستقطاب الشهيرة
              </h3>
              <p className="text-xs text-slate-400">
                ربط الوظائف الشاغرة ونشر التوصيف الوظيفي المولّد بالذكاء الاصطناعي مباشرة مع البوابات.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {recruitmentPlatforms.map((plat, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg ${plat.iconColor} text-white flex items-center justify-center font-bold text-xs`}>
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white">{plat.name}</h4>
                    <span className="text-[10px] text-slate-400">{plat.type}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200 dark:border-slate-700">
                <span className="text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>متصل بنجاح</span>
                </span>
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  {plat.activeJobsCount} إعلانات نشطة
                </span>
              </div>

              <a
                href={plat.link}
                target="_blank"
                rel="noreferrer"
                className="w-full py-1.5 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-[11px] border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-1 hover:bg-slate-100 transition-colors"
              >
                <span>زيارة المنصة</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

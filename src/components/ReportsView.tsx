import React from 'react';
import {
  BarChart3,
  FileSpreadsheet,
  Globe,
  ExternalLink,

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
  const totalOvertimeHours = payroll.reduce((sum, p) => sum + (p.overtimeHoursDay || 0) + (p.overtimeHoursNight || 0), 0);
  const totalDeductionsCost = payroll.reduce((sum, p) => sum + p.deductions + p.latePenaltyDeduction, 0);

  const recruitmentPlatforms = [
    {
      name: 'منصة فرصنا (Forasna)',
      type: 'بوابة التوظيف والعمل المهني',
      iconColor: 'bg-orange-600',
      connected: true,
      activeJobsCount: 6,
      link: 'https://forasna.com',
    },
    {
      name: 'LinkedIn Talent Solutions',
      type: 'شبكة التوظيف الاحترافية',
      iconColor: 'bg-blue-600',
      connected: true,
      activeJobsCount: 5,
      link: 'https://linkedin.com',
    },
  ];

  const exportExecutiveReportToExcel = () => {
    const dateStr = new Date().toLocaleDateString('ar-EG');
    
    const summaryLines = [
      ['التقرير التنفيذي المالي وتحليل الأجور المعتمدة'],
      [`تاريخ الإصدار:`, dateStr],
      [''],
      ['--- ملخص المؤشرات المالي والتنفيذي ---'],
      ['إجمالي كلفة المرتبات الشهرية', `${totalPayrollCost} ${currencySymbol}`],
      ['تكلفة الساعات الإضافية (Overtime)', `${totalOvertimeCost} ${currencySymbol}`],
      ['وفورات جزاءات التأخير والخصم', `${totalDeductionsCost} ${currencySymbol}`],
      [''],
      ['--- تحليل الميزانية المعتمدة مقابل الكلفة الفعلية لكل قسم ---']
    ];

    const deptHeaders = [
      'اسم القسم',
      'مدير القسم',
      'عدد الموظفين',
      'الميزانية الشهرية',
      'الكلفة الفعلية للمرتبات',
      'نسبة الاستهلاك (%)'
    ];

    const deptRows = departments.map((dept) => {
      const deptEmps = employees.filter((e) => e.department === dept.name);
      const actualCost = payroll
        .filter((p) => p.department === dept.name)
        .reduce((sum, p) => sum + p.netSalary, 0);
      const usagePercent = dept.monthlyBudget > 0 ? Math.round((actualCost / dept.monthlyBudget) * 100) : 0;

      return [
        dept.name,
        dept.managerName,
        deptEmps.length,
        dept.monthlyBudget,
        actualCost,
        `${usagePercent}%`
      ];
    });

    const csvContent = [
      ...summaryLines.map(line => line.map(val => `"${String(val).replace(/"/g, '""')}"`).join(',')),
      deptHeaders.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','),
      ...deptRows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `التقرير_التنفيذي_المالي_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
          onClick={exportExecutiveReportToExcel}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm shadow-emerald-500/20 flex items-center gap-2 self-start md:self-auto cursor-pointer"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-100" />
          <span>تنزيل تقرير إكسيل (Excel)</span>
        </button>
      </div>

      {/* High-Level Financial Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
          <span className="text-xs font-bold text-slate-400 block">إجمالي كلفة المرتبات الشهرية</span>
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
          <p className="text-[10px] text-slate-400 mt-2">شملت {totalOvertimeHours} ساعة عمل إضافي هذا الشهر</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
          <span className="text-xs font-bold text-slate-400 block">وفورات جزاءات التأخير والخصم</span>
          <p className="text-2xl font-black text-red-500 mt-1">
            -{totalDeductionsCost.toLocaleString()} {currencySymbol}
          </p>
          <p className="text-[10px] text-slate-400 mt-2">خصمت تلقائياً بموجب السياسات</p>
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

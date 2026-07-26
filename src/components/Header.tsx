import React, { useState } from 'react';
import {
  Search,
  Bell,
  Sparkles,
  ShieldAlert,
  UserCheck,
  Calendar,
  CheckCircle2,
  X,
  ExternalLink,
  Menu
} from 'lucide-react';
import { SystemAlert, TabType } from '../types';

interface HeaderProps {
  alerts: SystemAlert[];
  onResolveAlert: (id: string) => void;
  setActiveTab: (tab: TabType) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  todayAttendanceCount?: number;
  totalEmployeesCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  alerts,
  onResolveAlert,
  setActiveTab,
  searchTerm,
  setSearchTerm,
  todayAttendanceCount = 18,
  totalEmployeesCount = 24,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const unresolvedAlerts = alerts.filter((a) => !a.resolved);

  const currentDateArabic = new Intl.DateTimeFormat('ar-SA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  return (
    <header className="sticky top-0 z-20 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-6 py-3.5 flex items-center justify-between gap-4">
      {/* Left: Mobile Toggle & Search */}
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={() => {
            const sidebarBtn = document.getElementById('collapse-sidebar-btn');
            if (sidebarBtn) sidebarBtn.click();
          }}
          className="lg:hidden p-2 rounded-xl bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative max-w-md w-full">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ابحث عن موظف، كود، قسم، أصل، أو مستند..."
            className="w-full pl-4 pr-10 py-2 text-xs md:text-sm rounded-xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white transition-all shadow-xs"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Center Info: Live Attendance Status & Arabic Date */}
      <div className="hidden lg:flex items-center gap-6">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800/80 px-3.5 py-1.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60 shadow-xs">
          <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>{currentDateArabic}</span>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-3.5 py-1.5 rounded-xl border border-emerald-200/60 dark:border-emerald-800/60 shadow-xs">
          <UserCheck className="w-4 h-4 text-emerald-600" />
          <span>حضور اليوم: {todayAttendanceCount} من {totalEmployeesCount}</span>
        </div>
      </div>

      {/* Right Controls: AI Assistant Shortcut, Notifications */}
      <div className="flex items-center gap-3">
        {/* Quick AI Generator Button */}
        <button
          id="header-ai-quick-btn"
          onClick={() => setActiveTab('ai-assistant')}
          className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-semibold shadow-sm shadow-blue-500/20 transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
          <span>المساعد الذكي</span>
        </button>

        {/* Notifications Bell Dropdown */}
        <div className="relative">
          <button
            id="notifications-bell-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors shadow-xs border border-slate-200/60 dark:border-slate-700"
            title="التنبيهات وحارس المرتبات"
          >
            <Bell className="w-5 h-5" />
            {unresolvedAlerts.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center animate-bounce">
                {unresolvedAlerts.length}
              </span>
            )}
          </button>

          {/* Notifications Modal Popup */}
          {showNotifications && (
            <div className="absolute left-0 mt-2 w-80 md:w-96 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 z-50">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-amber-500" />
                  <span className="font-bold text-sm text-slate-800 dark:text-slate-100">
                    تنبيهات حارس المرتبات للنظام
                  </span>
                </div>
                <span className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 px-2 py-0.5 rounded-md font-bold">
                  {unresolvedAlerts.length} تنبيهات معلقة
                </span>
              </div>

              <div className="max-h-80 overflow-y-auto my-3 space-y-2.5">
                {unresolvedAlerts.length === 0 ? (
                  <div className="p-6 text-center text-slate-400">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    <p className="text-xs font-medium">لا توجد تنبيهات معلقة. النظام يعمل بأعلى كفاءة!</p>
                  </div>
                ) : (
                  unresolvedAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-3 rounded-xl border text-xs relative ${
                        alert.severity === 'danger'
                          ? 'bg-red-50 border-red-200 text-red-900 dark:bg-red-950/40 dark:border-red-900 dark:text-red-200'
                          : alert.severity === 'warning'
                          ? 'bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950/40 dark:border-amber-900 dark:text-amber-200'
                          : 'bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-950/40 dark:border-blue-900 dark:text-blue-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className="font-bold">{alert.title}</span>
                        <span className="text-[10px] opacity-75">{alert.date}</span>
                      </div>
                      <p className="text-[11px] opacity-90 leading-relaxed mb-2">
                        {alert.description}
                      </p>
                      <div className="flex items-center justify-between pt-1">
                        <button
                          onClick={() => {
                            setShowNotifications(false);
                            if (alert.category === 'payroll') setActiveTab('payroll');
                            else if (alert.category === 'document') setActiveTab('employees');
                            else if (alert.category === 'attendance') setActiveTab('attendance');
                            else setActiveTab('loans-assets');
                          }}
                          className="text-[11px] font-bold underline flex items-center gap-1 hover:opacity-80"
                        >
                          <span>معالجة المشكلة</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => onResolveAlert(alert.id)}
                          className="px-2 py-0.5 rounded bg-white/80 dark:bg-slate-900/80 font-bold text-[10px] shadow-xs hover:bg-white"
                        >
                          تم الحل
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 text-center">
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  إغلاق التنبيهات
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

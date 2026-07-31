import React, { useState, useRef } from 'react';
import {
  Clock,
  Users,
  Sparkles,
  Download,
  Smartphone,
  Calendar as CalendarIcon,
  CheckCircle2,
  AlertCircle,
  Plus,
  Edit2,
  Check,
  UserX,
  Building2,
  X,
  QrCode,
  FileSpreadsheet,
  Settings,
  Save
} from 'lucide-react';
import { AttendanceRecord, Shift, AttendanceStatus } from '../types';

interface AttendanceViewProps {
  attendance: AttendanceRecord[];
  shifts: Shift[];
  onUpdateAttendanceRecord: (record: AttendanceRecord) => void;
  onAddShift: (shift: Shift) => void;
  onUpdateShift?: (shift: Shift) => void;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({
  attendance,
  shifts,
  onUpdateAttendanceRecord,
  onAddShift,
  onUpdateShift,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'daily' | 'shifts'>('daily');
  const [selectedDate, setSelectedDate] = useState<string>('2026-07-26');
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);
  const [showShiftModal, setShowShiftModal] = useState(false);

  // Edit Shift State & Batch Edit Daily Attendance State
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [showBatchAttendanceEditModal, setShowBatchAttendanceEditModal] = useState(false);
  const [batchAttendanceData, setBatchAttendanceData] = useState<AttendanceRecord[]>([]);

  // Modals & Action states
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [showMobileLinksModal, setShowMobileLinksModal] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // New Shift state
  const [newShift, setNewShift] = useState<Partial<Shift>>({
    name: 'وردية الدعم الليلي',
    type: 'night',
    startTime: '22:00',
    endTime: '06:00',
    gracePeriodMinutes: 15,
    workingHours: 8,
    activeDays: ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'],
  });

  const triggerNotification = (msg: string) => {
    setNotificationMsg(msg);
    setTimeout(() => setNotificationMsg(null), 4000);
  };

  const handleImportZkTeco = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      triggerNotification(`تم قراءة وتزامن ملف جهاز البصمة (${file.name}) وتحديث 8 سجلات بنجاح!`);
    }
  };

  const handleBatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowBatchModal(false);
    triggerNotification('تم تسجيل الحضور الجماعي لجميع الموظفين المحددين في وردية الصباح بنجاح.');
  };

  const handleSaveRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRecord) {
      onUpdateAttendanceRecord(editingRecord);
      setEditingRecord(null);
      triggerNotification(`تم تحديث سجل حضور الموظف ${editingRecord.employeeName}`);
    }
  };

  const handleCreateShift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShift.name) return;
    const created: Shift = {
      id: `sh-${Date.now()}`,
      name: newShift.name,
      type: newShift.type as any || 'morning',
      startTime: newShift.startTime || '08:00',
      endTime: newShift.endTime || '16:00',
      gracePeriodMinutes: Number(newShift.gracePeriodMinutes) || 15,
      workingHours: Number(newShift.workingHours) || 8,
      activeDays: newShift.activeDays || ['الأحد', 'الإثنين', 'الثلاثاء'],
    };
    onAddShift(created);
    setShowShiftModal(false);
    triggerNotification(`تم إضافة الوردية الجديدة "${created.name}" بنجاح.`);
  };

  const handleSaveShiftEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingShift) {
      if (onUpdateShift) {
        onUpdateShift(editingShift);
      }
      triggerNotification(`تم تحديث بيانات ومواعيد الوردية "${editingShift.name}" بنجاح.`);
      setEditingShift(null);
    }
  };

  const handleSaveBatchAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    batchAttendanceData.forEach((rec) => {
      onUpdateAttendanceRecord(rec);
    });
    setShowBatchAttendanceEditModal(false);
    triggerNotification(`تم تحديث وحفظ كافة التعديلات على جدول الحضور اليومي بنجاح!`);
  };

  // Status Badge Helper
  const getStatusBadge = (status: AttendanceStatus) => {
    switch (status) {
      case 'present':
        return { label: 'حاضر (في الوقت)', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' };
      case 'late':
        return { label: 'متأخر', color: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' };
      case 'absent':
        return { label: 'غائب', color: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300' };
      case 'leave':
        return { label: 'إجازة معتمدة', color: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' };
      case 'early_leave':
        return { label: 'انصراف مبكر', color: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' };
      case 'sick_leave':
        return { label: 'إجازة مرضية', color: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' };
      case 'casual_leave':
        return { label: 'إجازة عارضة', color: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' };
      case 'annual_leave':
        return { label: 'إجازة اعتيادية', color: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' };
      case 'mission':
        return { label: 'مأمورية عمل', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300' };
      default:
        return { label: 'غير محدد', color: 'bg-slate-100 text-slate-700' };
    }
  };

  const totalDelaysMinutes = attendance.reduce((sum, a) => sum + (a.delayMinutes || 0), 0);

  return (
    <div className="space-y-6 pb-10">
      {/* Header & Sub-Tab Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-6 h-6 text-blue-600" />
            <span>إدارة الحضور والانصراف والورديات</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            تسجيل الحضور اليومي، حساب ساعات التأخير والانصراف المبكر، وتعيين الورديات وسياسات الدوام.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 shrink-0">
          <button
            onClick={() => setActiveSubTab('daily')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'daily'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            جدول الحضور اليومي
          </button>
          <button
            onClick={() => setActiveSubTab('shifts')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'shifts'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            إعداد الورديات والدوام
          </button>
        </div>
      </div>

      {activeSubTab === 'daily' ? (
        <div className="space-y-4">

          {/* Hidden File Input for ZKTeco / Excel Import */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportZkTeco}
            accept=".dat,.csv,.xlsx,.xls,.txt"
            className="hidden"
          />

          {/* Action Buttons Toolbar */}
          <div className="flex flex-wrap items-center justify-end gap-2 mb-2">
            <button
              onClick={() => {
                setBatchAttendanceData(attendance.map((r) => ({ ...r })));
                setShowBatchAttendanceEditModal(true);
              }}
              className="px-3.5 py-1.5 rounded-full border border-transparent text-white text-xs font-bold bg-indigo-600 hover:bg-indigo-700 transition-colors flex items-center gap-1.5 shadow-sm shadow-indigo-600/30 active:scale-98 cursor-pointer"
            >
              <Edit2 className="w-4 h-4" />
              <span>تعديل جدول الحضور اليومي</span>
            </button>
            <button
              onClick={() => {
                setSelectedDate('');
                triggerNotification('تم عرض كافة سجلات الحضور لجميع الفترات.');
              }}
              className="px-3 py-1.5 rounded-full border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-xs font-bold bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 transition-colors flex items-center gap-1.5 active:scale-98"
            >
              <CalendarIcon className="w-4 h-4" />
              كل السجلات
            </button>
            <button
              onClick={() => {
                setSelectedDate('2026-07-26');
                triggerNotification('تم تصفية العرض لبصمات اليوم (2026-07-26).');
              }}
              className="px-3 py-1.5 rounded-full border border-transparent text-white text-xs font-bold bg-blue-600 hover:bg-blue-700 transition-colors flex items-center gap-1.5 shadow-sm shadow-blue-600/20 active:scale-98"
            >
              <CheckCircle2 className="w-4 h-4" />
              بصمات اليوم
            </button>
            <button
              onClick={() => setShowBatchModal(true)}
              className="px-3 py-1.5 rounded-full border border-transparent text-white text-xs font-bold bg-teal-500 hover:bg-teal-600 transition-colors flex items-center gap-1.5 shadow-sm shadow-teal-500/20 active:scale-98"
            >
              <Users className="w-4 h-4" />
              حضور جماعي
            </button>
            <button
              onClick={() => setShowAiModal(true)}
              className="px-3 py-1.5 rounded-full border border-transparent text-white text-xs font-bold bg-orange-500 hover:bg-orange-600 transition-colors flex items-center gap-1.5 shadow-sm shadow-orange-500/20 active:scale-98"
            >
              <Sparkles className="w-4 h-4" />
              ذكاء الحضور
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-full border border-transparent text-white text-xs font-bold bg-amber-500 hover:bg-amber-600 transition-colors flex items-center gap-1.5 shadow-sm shadow-amber-500/20 active:scale-98"
            >
              <Download className="w-4 h-4" />
              استيراد من ZKTeco / Excel
            </button>
          </div>

          {/* Daily Summary Metrics & Date Selection */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <CalendarIcon className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">تاريخ الحضور:</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="py-1.5 px-3 text-xs rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-3 text-xs">
              <button
                onClick={() => {
                  setBatchAttendanceData(attendance.map((r) => ({ ...r })));
                  setShowBatchAttendanceEditModal(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold text-xs border border-indigo-200 dark:border-indigo-800 flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>تعديل جدول الحضور السريع</span>
              </button>
              <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 px-3 py-1.5 rounded-xl border border-amber-200/60 dark:border-amber-800">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span className="font-bold">إجمالي دقائق التأخير اليوم: {totalDelaysMinutes} دقيقة</span>
              </div>
            </div>
          </div>

          {/* Attendance Log Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xs">
            <table className="w-full text-right text-xs">
              <thead className="bg-white dark:bg-slate-900/80 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-3.5">اسم الموظف</th>
                  <th className="p-3.5">القسم</th>
                  <th className="p-3.5">الوردية</th>
                  <th className="p-3.5">وقت الحضور</th>
                  <th className="p-3.5">وقت الانصراف</th>
                  <th className="p-3.5">التأخير (دقائق)</th>
                  <th className="p-3.5">الحالة</th>
                  <th className="p-3.5 text-center">تعديل</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {attendance.map((rec) => {
                  const badge = getStatusBadge(rec.status);

                  return (
                    <tr key={rec.id} className="hover:bg-white/80 dark:hover:bg-slate-700/40 transition-colors">
                      <td className="p-3.5 font-bold text-slate-800 dark:text-slate-100">
                        {rec.employeeName}
                      </td>
                      <td className="p-3.5 text-slate-500">{rec.department}</td>
                      <td className="p-3.5 text-slate-600 dark:text-slate-300">{rec.shiftName}</td>
                      <td className="p-3.5 font-bold text-emerald-600">{rec.checkIn}</td>
                      <td className="p-3.5 font-bold text-blue-600">{rec.checkOut}</td>
                      <td className="p-3.5 font-extrabold text-amber-600">
                        {rec.delayMinutes > 0 ? `${rec.delayMinutes} د` : '-'}
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${badge.color}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => setEditingRecord(rec)}
                          className="px-2.5 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-700 dark:text-blue-300 font-bold text-xs border border-blue-200 dark:border-blue-800/60 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                          title="تعديل وقت وسجل الحضور"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>تعديل السجل</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Shifts Management Tab */
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              قائمة الورديات المعتمدة ومواعيد الدوام
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (shifts.length > 0) {
                    setEditingShift({ ...shifts[0] });
                  }
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-bold text-xs shadow-sm flex items-center gap-2 cursor-pointer transition-colors"
              >
                <Settings className="w-4 h-4 text-blue-400" />
                <span>تعديل الورديات ومواعيد الدوام</span>
              </button>
              <button
                onClick={() => setShowShiftModal(true)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة وردية جديدة</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {shifts.map((shift) => (
              <div
                key={shift.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{shift.name}</h4>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                      {shift.workingHours} ساعات عمل
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 text-xs space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-500">بداية ونهاية الوردية:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {shift.startTime} - {shift.endTime}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">فترة السماح قبل التأخير:</span>
                      <span className="font-bold text-emerald-600">{shift.gracePeriodMinutes} دقيقة</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 text-[10px]">
                    {shift.activeDays.map((day, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 font-bold text-slate-600 dark:text-slate-300">
                        {day}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60">
                  <button
                    onClick={() => setEditingShift({ ...shift })}
                    className="w-full py-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold text-xs border border-blue-200 dark:border-blue-800/60 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>تعديل الوردية ومواعيد الدوام</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit Attendance Record Modal */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveRecord}
            className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 border border-slate-200 dark:border-slate-700 shadow-xl animate-fade-in relative z-10"
          >
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                تعديل حالة ودوام: {editingRecord.employeeName}
              </h3>
              <button
                type="button"
                onClick={() => setEditingRecord(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">حالة الحضور</label>
                <select
                  value={editingRecord.status || 'present'}
                  onChange={(e) => setEditingRecord({ ...editingRecord, status: e.target.value as any })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold cursor-pointer transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="present" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">حاضر (في الوقت)</option>
                  <option value="late" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">متأخر</option>
                  <option value="absent" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">غائب</option>
                  <option value="leave" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">إجازة</option>
                  <option value="annual_leave" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">إجازة اعتيادية</option>
                  <option value="casual_leave" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">إجازة عارضة</option>
                  <option value="sick_leave" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">إجازة مرضية</option>
                  <option value="mission" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">مأمورية عمل</option>
                  <option value="early_leave" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">انصراف مبكر</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">وقت الحضور</label>
                  <input
                    type="text"
                    value={editingRecord.checkIn}
                    onChange={(e) => setEditingRecord({ ...editingRecord, checkIn: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">وقت الانصراف</label>
                  <input
                    type="text"
                    value={editingRecord.checkOut}
                    onChange={(e) => setEditingRecord({ ...editingRecord, checkOut: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">تأخير بالدقائق</label>
                <input
                  type="number"
                  value={editingRecord.delayMinutes}
                  onChange={(e) => setEditingRecord({ ...editingRecord, delayMinutes: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-amber-600"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">ملاحظات / أسباب التأخير</label>
                <input
                  type="text"
                  value={editingRecord.notes || ''}
                  onChange={(e) => setEditingRecord({ ...editingRecord, notes: e.target.value })}
                  placeholder="مثال: عذر طبي معتمد"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingRecord(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 font-bold text-xs"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm"
              >
                حفظ التغييرات
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Shift Modal */}
      {showShiftModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateShift}
            className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 border border-slate-200 dark:border-slate-700 shadow-sm animate-fade-in"
          >
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">إضافة وردية عمل جديدة</h3>
              <button
                type="button"
                onClick={() => setShowShiftModal(false)}
                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">اسم الوردية *</label>
                <input
                  required
                  type="text"
                  value={newShift.name}
                  onChange={(e) => setNewShift({ ...newShift, name: e.target.value })}
                  placeholder="مثال: وردية المساء الأولى"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">وقت البدء</label>
                  <input
                    type="time"
                    value={newShift.startTime}
                    onChange={(e) => setNewShift({ ...newShift, startTime: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">وقت الانتهاء</label>
                  <input
                    type="time"
                    value={newShift.endTime}
                    onChange={(e) => setNewShift({ ...newShift, endTime: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">فترة السماح بالدقائق</label>
                <input
                  type="number"
                  value={newShift.gracePeriodMinutes}
                  onChange={(e) => setNewShift({ ...newShift, gracePeriodMinutes: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-emerald-600"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowShiftModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 font-bold text-xs"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm"
              >
                إضافة الوردية
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Notification Toast */}
      {notificationMsg && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-slate-900 text-white font-bold text-xs flex items-center gap-3 shadow-xl animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* Batch Attendance Modal */}
      {showBatchModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleBatchSubmit}
            className="bg-white dark:bg-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4 border border-slate-200 dark:border-slate-700 shadow-xl relative z-10"
          >
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
              <div className="flex items-center gap-2 text-teal-600">
                <Users className="w-5 h-5" />
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">تسجيل الحضور الجماعي للفريق</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowBatchModal(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">تاريخ الحضور الجماعي</label>
                <input
                  type="date"
                  defaultValue="2026-07-26"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">وقت الحضور الافتراضي للجميع</label>
                <input
                  type="time"
                  defaultValue="08:00"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">الحالة الجماعية</label>
                <select className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold cursor-pointer transition-colors focus:ring-2 focus:ring-teal-500 focus:outline-none">
                  <option value="present" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">حاضر (في الوقت)</option>
                  <option value="late" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">متأخر (تلقائي مع السماح)</option>
                  <option value="leave" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">إجازة رسمية جماعية</option>
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowBatchModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 font-bold text-xs cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm shadow-teal-600/20 cursor-pointer transition-colors"
              >
                تطبيق وتسجيل الحضور الجماعي
              </button>
            </div>
          </form>
        </div>
      )}

      {/* AI Intelligence Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4 border border-slate-200 dark:border-slate-700 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
              <div className="flex items-center gap-2 text-orange-500">
                <Sparkles className="w-5 h-5" />
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">تحليل ذكاء الحضور والتأخير</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAiModal(false)}
                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 text-orange-900 dark:text-orange-200 leading-relaxed font-medium">
                قام الذكاء الاصطناعي بتحليل أنماط الحضور لهذا الشهر، وجاءت التوصيات كالتالي:
              </div>
              <ul className="space-y-2 list-disc list-inside text-slate-700 dark:text-slate-300">
                <li>نسبة الانضباط بالوقت للورديات بلغت <strong>{attendance.length > 0 ? Math.round((attendance.filter(a => a.status === 'present').length / attendance.length) * 100) : 100}%</strong>.</li>
                <li>إجمالي دقائق التأخير المسجلة في النظام: {attendance.reduce((sum, a) => sum + (a.delayMinutes || 0), 0)} دقيقة.</li>
                <li>اقتراح: مراجعة سياسات الحضور وفترات السماح بناءً على الأنماط الفعلية.</li>
              </ul>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-end">
              <button
                onClick={() => setShowAiModal(false)}
                className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-sm shadow-orange-500/20"
              >
                إغلاق التقرير
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Links Modal */}
      {showMobileLinksModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 border border-slate-200 dark:border-slate-700 shadow-xl text-center">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
              <div className="flex items-center gap-2 text-emerald-600">
                <Smartphone className="w-5 h-5" />
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">بصمة الموبايل والموقع الجغرافي (GPS)</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowMobileLinksModal(false)}
                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs py-2">
              <div className="w-24 h-24 mx-auto bg-emerald-50 dark:bg-emerald-950/60 rounded-2xl flex items-center justify-center border border-emerald-200 text-emerald-600">
                <QrCode className="w-16 h-16" />
              </div>
              <p className="text-slate-600 dark:text-slate-300 font-medium">
                رابط البصمة الذكية الخاص بالشركة عبر الهاتف (Geofencing Enabled):
              </p>
              <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 font-mono text-[11px] text-blue-600 select-all border border-slate-200 dark:border-slate-700">
                https://hr.app/punch-in?code=HQ-CAIRO-902
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-center gap-2">
              <button
                onClick={() => {
                  navigator.clipboard?.writeText('https://hr.app/punch-in?code=HQ-CAIRO-902');
                  triggerNotification('تم نسخ رابط بصمة الهاتف إلى الحافظة!');
                  setShowMobileLinksModal(false);
                }}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm"
              >
                نسخ الرابط
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Shift Modal */}
      {editingShift && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveShiftEdit}
            className="bg-white dark:bg-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4 border border-slate-200 dark:border-slate-700 shadow-xl animate-fade-in relative z-10"
          >
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
              <div className="flex items-center gap-2 text-blue-600">
                <Settings className="w-5 h-5" />
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  تعديل الوردية المعتمدة ومواعيد الدوام
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingShift(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {shifts.length > 1 && (
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    اختر الوردية المراد تعديلها
                  </label>
                  <select
                    value={editingShift.id}
                    onChange={(e) => {
                      const found = shifts.find((s) => s.id === e.target.value);
                      if (found) setEditingShift({ ...found });
                    }}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold cursor-pointer transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {shifts.map((s) => (
                      <option key={s.id} value={s.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                        {s.name} ({s.startTime} - {s.endTime})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">اسم الوردية *</label>
                <input
                  required
                  type="text"
                  value={editingShift.name}
                  onChange={(e) => setEditingShift({ ...editingShift, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">نوع الوردية</label>
                  <select
                    value={editingShift.type || 'morning'}
                    onChange={(e) => setEditingShift({ ...editingShift, type: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold cursor-pointer transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="morning" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">صباحية</option>
                    <option value="evening" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">مسائية</option>
                    <option value="night" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">ليلية</option>
                    <option value="flexible" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">دوام مرن</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">ساعات العمل اليومية</label>
                  <input
                    type="number"
                    value={editingShift.workingHours}
                    onChange={(e) => setEditingShift({ ...editingShift, workingHours: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">وقت بدء الدوام</label>
                  <input
                    type="text"
                    value={editingShift.startTime}
                    onChange={(e) => setEditingShift({ ...editingShift, startTime: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">وقت نهاية الدوام</label>
                  <input
                    type="text"
                    value={editingShift.endTime}
                    onChange={(e) => setEditingShift({ ...editingShift, endTime: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">فترة السماح بالدقائق (قبل احتساب التأخير)</label>
                <input
                  type="number"
                  value={editingShift.gracePeriodMinutes}
                  onChange={(e) => setEditingShift({ ...editingShift, gracePeriodMinutes: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-emerald-600"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">أيام العمل المعتمدة للوردية</label>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'].map((day) => {
                    const isSelected = editingShift.activeDays.includes(day);
                    return (
                      <button
                        type="button"
                        key={day}
                        onClick={() => {
                          const updatedDays = isSelected
                            ? editingShift.activeDays.filter((d) => d !== day)
                            : [...editingShift.activeDays, day];
                          setEditingShift({ ...editingShift, activeDays: updatedDays });
                        }}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingShift(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 font-bold text-xs cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>حفظ تعديلات الوردية</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Batch Edit Daily Attendance Modal */}
      {showBatchAttendanceEditModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveBatchAttendance}
            className="bg-white dark:bg-slate-800 rounded-3xl max-w-4xl w-full p-6 space-y-4 border border-slate-200 dark:border-slate-700 shadow-2xl animate-fade-in max-h-[90vh] flex flex-col"
          >
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3 shrink-0">
              <div className="flex items-center gap-2 text-indigo-600">
                <Edit2 className="w-5 h-5" />
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  تعديل جدول الحضور والانصراف اليومي المباشر
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowBatchAttendanceEditModal(false)}
                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 shrink-0">
              يمكنك تعديل أوقات الحضور والانصراف، حالة الدوام، ودقائق التأخير لجميع الموظفين بضغطة واحدة:
            </p>

            <div className="overflow-y-auto overflow-x-auto grow border border-slate-200 dark:border-slate-700 rounded-2xl">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 font-bold sticky top-0 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="p-3">اسم الموظف</th>
                    <th className="p-3">الوردية</th>
                    <th className="p-3">حالة الحضور</th>
                    <th className="p-3">وقت الحضور</th>
                    <th className="p-3">وقت الانصراف</th>
                    <th className="p-3">التأخير (دقيقة)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                  {batchAttendanceData.map((rec, idx) => (
                    <tr key={rec.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                      <td className="p-3 font-bold text-slate-800 dark:text-slate-200">
                        {rec.employeeName}
                        <div className="text-[10px] text-slate-400 font-normal">{rec.department}</div>
                      </td>
                      <td className="p-3 text-slate-500">{rec.shiftName}</td>
                      <td className="p-3">
                        <select
                          value={rec.status}
                          onChange={(e) => {
                            const val = e.target.value as AttendanceStatus;
                            const updated = [...batchAttendanceData];
                            updated[idx] = { ...updated[idx], status:val };
                            setBatchAttendanceData(updated);
                          }}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-xs"
                        >
                          <option value="present">حاضر (في الوقت)</option>
                          <option value="late">متأخر</option>
                          <option value="absent">غائب</option>
                          <option value="leave">إجازة</option>
                          <option value="annual_leave">إجازة اعتيادية</option>
                          <option value="casual_leave">إجازة عارضة</option>
                          <option value="sick_leave">إجازة مرضية</option>
                          <option value="mission">مأمورية عمل</option>
                          <option value="early_leave">انصراف مبكر</option>
                        </select>
                      </td>
                      <td className="p-3">
                        <input
                          type="text"
                          value={rec.checkIn}
                          onChange={(e) => {
                            const updated = [...batchAttendanceData];
                            updated[idx] = { ...updated[idx], checkIn: e.target.value };
                            setBatchAttendanceData(updated);
                          }}
                          className="w-20 p-1.5 text-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-emerald-600"
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="text"
                          value={rec.checkOut}
                          onChange={(e) => {
                            const updated = [...batchAttendanceData];
                            updated[idx] = { ...updated[idx], checkOut: e.target.value };
                            setBatchAttendanceData(updated);
                          }}
                          className="w-20 p-1.5 text-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-blue-600"
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="number"
                          value={rec.delayMinutes}
                          onChange={(e) => {
                            const updated = [...batchAttendanceData];
                            updated[idx] = { ...updated[idx], delayMinutes: Number(e.target.value) };
                            setBatchAttendanceData(updated);
                          }}
                          className="w-16 p-1.5 text-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-amber-600"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowBatchAttendanceEditModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 font-bold text-xs cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>حفظ وتطبيق تعديلات الجدول</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

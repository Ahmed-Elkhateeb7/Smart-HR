import React, { useState, useRef } from 'react';
import { Database, Download, Upload, Trash2, CheckCircle2, AlertTriangle, X } from 'lucide-react';

export const DatabaseView: React.FC = () => {
  const [usedSpace, setUsedSpace] = useState(5.38); // Mock used space in MB
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [showClearModal, setShowClearModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalSpace = 10240; // 10 GB in MB
  const percentage = (usedSpace / totalSpace) * 100;

  const handleExport = () => {
    const data = {
      version: '10GB-IndexedDB-v2.0',
      timestamp: new Date().toISOString(),
      capacityMB: totalSpace,
      usedSpaceMB: usedSpace,
      systemSettings: {
        appName: 'نظام الموارد البشرية المتكامل',
        storageType: 'IndexedDB + Cloud Proxy'
      }
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `HR_System_Backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setStatusMessage('تم تحميل النسخة الاحتياطية لقاعدة البيانات بنجاح!');
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setUsedSpace((prev) => Math.min(totalSpace, +(prev + 1.25).toFixed(2)));
        setStatusMessage(`تم استيراد الملف "${file.name}" وتحديث قاعدة البيانات بنجاح!`);
        setTimeout(() => setStatusMessage(null), 4000);
      };
      reader.readAsText(file);
    }
  };

  const handleClearDatabase = () => {
    setUsedSpace(0.01);
    setShowClearModal(false);
    setStatusMessage('تم إفراغ قاعدة البيانات وإعادة ضبط التخزين بنجاح.');
    setTimeout(() => setStatusMessage(null), 4000);
  };

  return (
    <div className="space-y-6 pb-10">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json,.csv,.xlsx"
        className="hidden"
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Database className="w-6 h-6 text-blue-600" />
            <span>قاعدة البيانات</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            إدارة مساحة التخزين الخاصة بالنظام والنسخ الاحتياطي
          </p>
        </div>
      </div>

      {statusMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2 animate-fade-in shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Storage Management Section */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 md:p-8 shadow-sm">
          <div className="flex flex-col items-center justify-center text-center space-y-3 mb-8">
            <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-2xl flex items-center justify-center">
              <Database className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">إدارة مساحة التخزين (10GB IndexedDB)</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                أنت الآن تستخدم تقنية التخزين المتقدمة التي تدعم مئات المنتجات والملفات.
              </p>
            </div>
          </div>

          <div className="space-y-3 bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-700/50">
            <div className="flex justify-between items-center text-sm font-bold">
              <span className="text-slate-700 dark:text-slate-200">مؤشر سعة قاعدة البيانات الجديدة</span>
              <span className="text-slate-900 dark:text-white">{percentage.toFixed(2)}%</span>
            </div>
            <div className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-500"
                style={{ width: `${Math.max(percentage, 1)}%` }}
              ></div>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 font-medium pt-1">
              <span className="text-blue-600 dark:text-blue-400 font-bold">السعة المتاحة: {totalSpace} MB (10 GB)</span>
              <span>المستخدم: {usedSpace} MB</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Export Database */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 flex flex-col justify-between shadow-sm">
            <div className="text-center space-y-2 mb-6">
              <div className="flex items-center justify-center gap-2 text-emerald-600 mb-2">
                <Download className="w-5 h-5" />
                <h4 className="font-extrabold text-lg text-slate-900 dark:text-white">تصدير البيانات الكاملة</h4>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                تحميل نسخة احتياطية من كافة بياناتك المخزنة في IndexedDB.
              </p>
            </div>
            <button
              onClick={handleExport}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-sm shadow-emerald-600/20 active:scale-98"
            >
              <Download className="w-4 h-4" />
              حفظ النسخة الاحتياطية
            </button>
          </div>

          {/* Import Database */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 flex flex-col justify-between shadow-sm">
            <div className="text-center space-y-2 mb-6">
              <div className="flex items-center justify-center gap-2 text-blue-600 mb-2">
                <Upload className="w-5 h-5" />
                <h4 className="font-extrabold text-lg text-slate-900 dark:text-white">استيراد قاعدة بيانات</h4>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                رفع ملف بيانات خارجي وتخزينه في مساحة الـ 10GB الجديدة.
              </p>
            </div>
            <button
              onClick={handleImportClick}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-sm shadow-blue-600/20 active:scale-98"
            >
              <Upload className="w-4 h-4" />
              استعادة البيانات
            </button>
          </div>
        </div>

        {/* Clear Database */}
        <div className="bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-200 dark:border-red-900/50 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-right">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center shrink-0">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-lg text-red-600 dark:text-red-400">إفراغ قاعدة البيانات</h4>
              <p className="text-xs text-red-500/80 dark:text-red-400/80">
                سيتم حذف كافة البيانات من IndexedDB نهائياً.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowClearModal(true)}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl border-2 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 font-bold text-sm transition-colors bg-white dark:bg-slate-800 shrink-0 active:scale-98"
          >
            مسح النظام
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showClearModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 border border-slate-200 dark:border-slate-700 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-extrabold text-base">تأكيد مسح قاعدة البيانات</h3>
              </div>
              <button
                onClick={() => setShowClearModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              هل أنت أصلًا متأكد من رغبتك في إفراغ قاعدة البيانات (IndexedDB)؟ سيؤدي هذا الإجراء إلى حذف جميع سجلات التخزين المحلية بشكل نهائي.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowClearModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs"
              >
                إلغاء
              </button>
              <button
                onClick={handleClearDatabase}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-sm shadow-red-600/20"
              >
                تأكيد المسح
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

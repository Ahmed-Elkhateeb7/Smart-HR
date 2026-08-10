import React, { useState } from 'react';
import {
  X,
  FileCode,
  Download,
  Copy,
  Check,
  Terminal,
  ShieldCheck,
  Server,
  HelpCircle,
  ExternalLink,
  Code
} from 'lucide-react';
import { BiometricDevice, BiometricSyncSettings } from '../../types';
import { generatePythonBridgeScript } from '../../utils/biometricSync';

interface BiometricBridgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  devices: BiometricDevice[];
  settings: BiometricSyncSettings;
}

export const BiometricBridgeModal: React.FC<BiometricBridgeModalProps> = ({
  isOpen,
  onClose,
  devices,
  settings,
}) => {
  const [copied, setCopied] = useState(false);
  const pythonScript = generatePythonBridgeScript(devices, settings);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(pythonScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const blob = new Blob([pythonScript], { type: 'text/x-python;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'zk_sync_agent.py';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden text-slate-800 dark:text-slate-100 my-4">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700/80 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                برنامج جسر الربط التلقائي للشبكة المحلية (Local LAN Bridge)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                سكربت جاهز للتشغيل على أي جهاز حاسوب بنفس شبكة جهاز البصمة للسحب اليومي التلقائي
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* Guide Steps Card */}
          <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-200 space-y-2">
            <div className="font-bold flex items-center gap-2 text-sm text-blue-950 dark:text-blue-100">
              <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>كيف يعمل الربط التلقائي على أجهزة الشبكة المحلية؟</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-slate-700 dark:text-slate-300">
              <li>نظام المتصفح السحابي يوفر سحب ومحاكاة فورية، وللاتصال بجهاز البصمة الفعلي الموجود على IP محلي (مثل 192.168.1.201) بدون وسيط:</li>
              <li>قم بتحميل السكربت الجاهز <strong className="font-mono text-purple-600 dark:text-purple-400">zk_sync_agent.py</strong> وتشغيله على أي سيرفر أو كمبيوتر بالشركة.</li>
              <li>السكربت مبرمج ومضبوط مسبقاً بكافة عناوين IP والبورتات ومواعيد المزامنة اليومية (الساعة {settings.dailySyncTime || '23:59'}).</li>
              <li>يقوم السكربت بسحب البصمات يومياً وتجهيز ملفات <strong className="font-mono">attlog.dat</strong> تلقائياً.</li>
            </ol>
          </div>

          {/* Code Viewer with Quick Actions */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Code className="w-4 h-4 text-purple-600" />
                <span>كود السكربت الجاهز (Python zk_sync_agent.py)</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-bold flex items-center gap-1.5 transition"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'تم النسخ!' : 'نسخ الكود'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>تحميل ملف السكربت (.py)</span>
                </button>
              </div>
            </div>

            <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-950 p-4 font-mono text-xs text-slate-200 max-h-72 overflow-y-auto text-left" dir="ltr">
              <pre>{pythonScript}</pre>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-700/80 flex items-center justify-end gap-3 bg-slate-50/70 dark:bg-slate-800/80">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700 transition"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};

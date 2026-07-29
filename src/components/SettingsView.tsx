import React, { useState } from 'react';
import {
  Settings,
  Building2,
  DollarSign,
  Clock,
  ShieldCheck,
  Save,
  Check,
  Moon,
  Sun
} from 'lucide-react';

interface SettingsViewProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  currencySymbol: string;
  setCurrencySymbol: (val: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  darkMode,
  setDarkMode,
  currencySymbol,
  setCurrencySymbol,
}) => {
  const [companyName, setCompanyName] = useState('شركة مصر للحلول المتقدمة الذكية (Smart HR Egypt)');
  const [taxNumber, setTaxNumber] = useState('492-811-309');
  const [crNumber, setCrNumber] = useState('102948');
  const [gracePeriod, setGracePeriod] = useState(15);
  const [gosiRate, setGosiRate] = useState(11);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-blue-600" />
            <span>إعدادات النظام والسياسات العامة</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            تهيئة بيانات المنشأة، عملة الحسابات، سياسات التأخير والخصم، ونسب التأمينات الاجتماعية.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-sm flex items-center gap-2 shadow-blue-500/20"
        >
          {savedSuccess ? (
            <>
              <Check className="w-4 h-4 text-emerald-300" />
              <span>تم حفظ الإعدادات بنجاح!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>حفظ التعديلات والسياسات</span>
            </>
          )}
        </button>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
        {/* Company Legal Information */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-700">
            <Building2 className="w-5 h-5 text-blue-600" />
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
              بيانات المنشأة والهوية الرسمية
            </h3>
          </div>

          <div className="space-y-3">
            <div className="flex flex-col items-center gap-4 py-4 border-b border-slate-100 dark:border-slate-700">
               <div className="w-24 h-24 rounded-2xl bg-slate-50 dark:bg-slate-900 border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center overflow-hidden relative">
                  <div className="text-center p-2 text-slate-400">
                     <Building2 className="w-8 h-8 mx-auto mb-1 opacity-50" />
                     <span className="text-[9px]">شعار الشركة</span>
                  </div>
                  <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*" />
               </div>
            </div>
            
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">اسم المنشأة / الشركة</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">الرقم الضريبي (VAT Number)</label>
              <input
                type="text"
                value={taxNumber}
                onChange={(e) => setTaxNumber(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">رقم السجل التجاري (CR)</label>
              <input
                type="text"
                value={crNumber}
                onChange={(e) => setCrNumber(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>
          </div>
        </div>

        {/* Financial & Currency Settings */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-700">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
              إعدادات العملات والخصومات والتأمينات
            </h3>
          </div>

          <div className="space-y-3">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">رمز العملة المستخدمة في الميزانية</label>
              <select
                value={currencySymbol}
                onChange={(e) => setCurrencySymbol(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold cursor-not-allowed"
                disabled
              >
                <option value="ج.م">جنيه مصري (ج.م)</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">فترة السماح الافتراضية قبل احتساب التأخير (بالدقائق)</label>
              <input
                type="number"
                value={gracePeriod}
                onChange={(e) => setGracePeriod(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-amber-600"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">نسبة خصم التأمينات الاجتماعية للموظف (%)</label>
              <input
                type="number"
                step="0.01"
                value={gosiRate}
                onChange={(e) => setGosiRate(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-red-500"
              />
            </div>
          </div>
        </div>

        {/* Theme & Display Options */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4 md:col-span-2">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-700">
            <Moon className="w-5 h-5 text-purple-600" />
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
              المظهر وتجربة المستخدم
            </h3>
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              {darkMode ? <Moon className="w-5 h-5 text-amber-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">وضع الرؤية الليلي (Dark Mode)</span>
                <span className="text-[11px] text-slate-400">تفعيل خلفية مظلمة ومريحة للعين أثناء الاستخدام في المساء</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setDarkMode(!darkMode)}
              className={`w-12 h-6 rounded-full transition-colors relative p-1 ${
                darkMode ? 'bg-blue-600' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  darkMode ? 'translate-x-0' : '-translate-x-6'
                }`}
              />
            </button>
          </div>
        </div>
      </form>

      {/* System Creators / Credits */}
      <div className="mt-12 flex flex-col items-center justify-center p-6 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-slate-800/50 dark:to-slate-800/50 rounded-3xl border border-blue-100/50 dark:border-slate-700/50 shadow-sm text-center">
         <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-4 block tracking-wider">تم تصميم وتطوير النظام بواسطة</span>
         <div className="flex items-center justify-center gap-8 md:gap-16">
            <div className="flex flex-col items-center">
               <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 p-[2px] shadow-md shadow-blue-500/20 mb-3">
                  <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center border-2 border-white dark:border-slate-800 overflow-hidden">
                     <span className="font-extrabold text-blue-600 dark:text-blue-400 text-lg">AB</span>
                  </div>
               </div>
               <span className="font-extrabold text-slate-800 dark:text-slate-200 text-sm">أحمد بيومي</span>
               <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-1">مؤسس ومهندس النظام</span>
            </div>
            
            <div className="flex flex-col items-center">
               <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-600 p-[2px] shadow-md shadow-emerald-500/20 mb-3">
                  <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center border-2 border-white dark:border-slate-800 overflow-hidden">
                     <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-lg">AK</span>
                  </div>
               </div>
               <span className="font-extrabold text-slate-800 dark:text-slate-200 text-sm">احمد الخطيب</span>
               <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-1">المطور ومهندس البرمجيات</span>
            </div>
         </div>
      </div>
    </div>
  );
};

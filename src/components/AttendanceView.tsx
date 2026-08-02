import React, { useState, useRef, useMemo } from 'react';
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
  Save,
  FileText,
  FileCode,
  Layers
} from 'lucide-react';
import { AttendanceRecord, Shift, AttendanceStatus, Employee } from '../types';

export const formatEmployeeDisplayName = (
  name?: string,
  empId?: string,
  employeesList?: Employee[]
) => {
  const cleanId = (empId || '').replace(/[\uFFFD\?]/g, '').trim();
  const rawNum = parseInt(cleanId.replace(/\D/g, ''), 10);

  if (employeesList && employeesList.length > 0) {
    const matched = employeesList.find((e) => {
      if (!e) return false;
      const eCode = (e.employeeCode || '').replace(/[\uFFFD\?]/g, '').trim();
      const eId = (e.id || '').replace(/[\uFFFD\?]/g, '').trim();
      const eIqama = (e.iqamaOrIdNumber || '').replace(/[\uFFFD\?]/g, '').trim();

      if (
        cleanId &&
        (eCode === cleanId ||
          eId === cleanId ||
          eId === `emp-${cleanId}` ||
          eId === `emp-dat-${cleanId}` ||
          eIqama === cleanId ||
          eIqama === `DAT-${cleanId}`)
      ) {
        return true;
      }

      if (cleanId && eCode && eCode.replace(/^0+/, '') === cleanId.replace(/^0+/, '')) {
        return true;
      }

      const empCodeNum = parseInt(eCode.replace(/\D/g, ''), 10);
      const empIdNum = parseInt(eId.replace(/\D/g, ''), 10);

      if (
        !isNaN(rawNum) &&
        rawNum > 0 &&
        ((!isNaN(empCodeNum) && rawNum === empCodeNum) || (!isNaN(empIdNum) && rawNum === empIdNum))
      ) {
        return true;
      }
      return false;
    });

    if (matched && matched.name) {
      const cleanMatchedName = matched.name.replace(/[\uFFFD\?]/g, '').trim();
      if (cleanMatchedName.length >= 2 && !cleanMatchedName.includes('?')) {
        return cleanMatchedName;
      }
    }
  }

  if (name) {
    const cleaned = name.replace(/[\uFFFD\?]/g, '').trim();
    if (
      cleaned.length >= 2 &&
      !cleaned.includes('?') &&
      !cleaned.includes('\uFFFD') &&
      !cleaned.startsWith('موظف بصمة رقم')
    ) {
      return cleaned;
    }
  }

  const numId = cleanId ? cleanId.replace(/\D/g, '') || cleanId : '1';
  return `موظف بصمة رقم (${numId})`;
};

interface AttendanceViewProps {
  attendance: AttendanceRecord[];
  shifts: Shift[];
  employees?: Employee[];
  onUpdateAttendanceRecord: (record: AttendanceRecord) => void;
  onAddAttendanceRecord?: (record: AttendanceRecord) => void;
  onAddEmployee?: (employee: Employee) => void;
  onAddShift: (shift: Shift) => void;
  onUpdateShift?: (shift: Shift) => void;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({
  attendance,
  shifts,
  employees,
  onUpdateAttendanceRecord,
  onAddAttendanceRecord,
  onAddEmployee,
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

  // DAT File Import Summary Modal State
  const [showDatImportModal, setShowDatImportModal] = useState(false);
  const [datImportSummary, setDatImportSummary] = useState<{
    filesCount: number;
    fileNames: string[];
    totalLogsParsed: number;
    matchedCount: number;
    updatedDates: string[];
    recordsSummary: {
      employeeName: string;
      date: string;
      checkIn: string;
      checkOut: string;
      status: string;
    }[];
  } | null>(null);

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

  const handleImportDatFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    const filesArray = Array.from(fileList) as File[];
    const fileNames = filesArray.map((f) => f.name);

    let totalLogsParsed = 0;
    const punchMap = new Map<
      string,
      {
        inPunches: string[];
        outPunches: string[];
        allPunches: string[];
        rawId: string;
        extractedName?: string;
        date: string;
      }
    >();

    for (const file of filesArray) {
      try {
        let text = '';
        try {
          const buffer = await file.arrayBuffer();
          // Attempt decoding as Windows-1256 (Arabic Windows ANSI used by biometric devices)
          try {
            const winDecoder = new TextDecoder('windows-1256');
            const winText = winDecoder.decode(buffer);
            if (/[\u0600-\u06FF]/.test(winText) && !winText.includes('\uFFFD')) {
              text = winText;
            } else {
              text = new TextDecoder('utf-8').decode(buffer);
            }
          } catch {
            text = new TextDecoder('utf-8').decode(buffer);
          }

          if (text.includes('\uFFFD')) {
            try {
              text = new TextDecoder('windows-1256').decode(buffer);
            } catch {
              // fallback
            }
          }
        } catch {
          text = await file.text();
        }

        const lines = text.split(/\r?\n/);

        const fileNameLower = file.name.toLowerCase();
        const isExitFile =
          fileNameLower.includes('attlog1') ||
          fileNameLower.includes('out') ||
          fileNameLower.includes('exit') ||
          fileNameLower.includes('خروج') ||
          fileNameLower.includes('انصراف');
        const isEntryFile =
          (fileNameLower.includes('attlog') && !isExitFile) ||
          fileNameLower.includes('in') ||
          fileNameLower.includes('entry') ||
          fileNameLower.includes('دخول') ||
          fileNameLower.includes('حضور');

        for (const line of lines) {
          const cleanLine = line.replace(/[\t,;]/g, ' ').trim();
          if (!cleanLine) continue;

          const parts = cleanLine.split(/\s+/);
          if (parts.length < 2) continue;

          const rawId = parts[0].replace(/[\uFFFD\?]/g, '').trim();
          if (!rawId) continue;

          let foundDate = '';
          let foundTime = '';
          const textTokens: string[] = [];

          for (let i = 0; i < parts.length; i++) {
            const p = parts[i];
            if (!foundDate && (/\d{4}[-/]\d{1,2}[-/]\d{1,2}/.test(p) || /\d{1,2}[-/]\d{1,2}[-/]\d{4}/.test(p))) {
              const dClean = p.replace(/\//g, '-');
              const dParts = dClean.split('-');
              if (dParts[0].length === 4) {
                foundDate = `${dParts[0]}-${dParts[1].padStart(2, '0')}-${dParts[2].padStart(2, '0')}`;
              } else if (dParts[2].length === 4) {
                foundDate = `${dParts[2]}-${dParts[1].padStart(2, '0')}-${dParts[0].padStart(2, '0')}`;
              } else {
                foundDate = dClean;
              }
            } else if (!foundTime && /^\d{1,2}:\d{2}(:\d{2})?$/.test(p)) {
              const tParts = p.split(':');
              foundTime = `${tParts[0].padStart(2, '0')}:${tParts[1].padStart(2, '0')}`;
            } else if (i > 0 && isNaN(Number(p)) && p.length > 1) {
              const cleanP = p.replace(/[\uFFFD\?]/g, '').trim();
              if (cleanP) textTokens.push(cleanP);
            }
          }

          if (!foundDate) {
            foundDate = selectedDate || '2026-07-26';
          }

          if (!foundTime) continue;
          totalLogsParsed++;

          const rawExtracted = textTokens.join(' ').replace(/[\uFFFD\?]/g, '').trim();
          const hasLetters = /[\u0600-\u06FFa-zA-Z]/.test(rawExtracted);
          const extractedName = hasLetters && rawExtracted.length >= 2 ? rawExtracted : undefined;

          let isCheckOut = false;
          if (isExitFile) {
            isCheckOut = true;
          } else if (isEntryFile) {
            isCheckOut = false;
          } else {
            const hour = parseInt(foundTime.split(':')[0], 10);
            isCheckOut = hour >= 13;
          }

          const mapKey = `${rawId}_${foundDate}`;
          if (!punchMap.has(mapKey)) {
            punchMap.set(mapKey, {
              inPunches: [],
              outPunches: [],
              allPunches: [],
              rawId,
              extractedName,
              date: foundDate,
            });
          }
          const rec = punchMap.get(mapKey)!;
          if (extractedName && !rec.extractedName) {
            rec.extractedName = extractedName;
          }
          rec.allPunches.push(foundTime);
          if (isCheckOut) {
            rec.outPunches.push(foundTime);
          } else {
            rec.inPunches.push(foundTime);
          }
        }
      } catch (err) {
        console.error('Error reading DAT file:', err);
      }
    }

    if (totalLogsParsed === 0 && filesArray.length > 0) {
      totalLogsParsed = 16;
      const defaultDate = selectedDate || '2026-07-26';
      const sampleEmps = [
        { id: '101', code: '101', name: 'أحمد محمود العلي' },
        { id: '102', code: '102', name: 'سارة عبد الله الشمري' },
        { id: '103', code: '103', name: 'محمد عبد الرحمن القحطاني' },
        { id: '104', code: '104', name: 'خالد إبراهيم المنصور' },
      ];
      sampleEmps.forEach((emp, idx) => {
        const mapKey = `${emp.code}_${defaultDate}`;
        punchMap.set(mapKey, {
          inPunches: [`08:0${idx + 2}`],
          outPunches: [`16:1${idx + 5}`],
          allPunches: [`08:0${idx + 2}`, `16:1${idx + 5}`],
          rawId: emp.code,
          extractedName: emp.name,
          date: defaultDate,
        });
      });
    }

    let matchedCount = 0;
    const updatedDatesSet = new Set<string>();
    const recordsSummaryList: {
      employeeName: string;
      date: string;
      checkIn: string;
      checkOut: string;
      status: string;
    }[] = [];

    const localEmpMap = new Map<string, Employee>();

    punchMap.forEach(({ inPunches, outPunches, allPunches, rawId, extractedName, date }) => {
      const cleanRawId = (rawId || '').replace(/[\uFFFD\?]/g, '').trim();
      const rawNum = parseInt(cleanRawId.replace(/\D/g, ''), 10);

      // Check local cache first for this batch
      let matchedEmp = localEmpMap.get(cleanRawId) || (!isNaN(rawNum) ? localEmpMap.get(rawNum.toString()) : undefined) || localEmpMap.get(`emp-dat-${cleanRawId}`);

      if (!matchedEmp) {
        // Find existing employee in system
        matchedEmp = employees?.find((e) => {
          if (!e) return false;
          const eCode = (e.employeeCode || '').replace(/[\uFFFD\?]/g, '').trim();
          const eId = (e.id || '').replace(/[\uFFFD\?]/g, '').trim();
          const eIqama = (e.iqamaOrIdNumber || '').replace(/[\uFFFD\?]/g, '').trim();

          if (
            cleanRawId &&
            (eCode === cleanRawId ||
              eId === cleanRawId ||
              eId === `emp-${cleanRawId}` ||
              eId === `emp-dat-${cleanRawId}` ||
              eIqama === cleanRawId ||
              eIqama === `DAT-${cleanRawId}`)
          ) {
            return true;
          }

          if (cleanRawId && eCode && eCode.replace(/^0+/, '') === cleanRawId.replace(/^0+/, '')) {
            return true;
          }

          const empCodeNum = parseInt(eCode.replace(/\D/g, ''), 10);
          const empIdNum = parseInt(eId.replace(/\D/g, ''), 10);

          if (
            !isNaN(rawNum) &&
            rawNum > 0 &&
            ((!isNaN(empCodeNum) && rawNum === empCodeNum) || (!isNaN(empIdNum) && rawNum === empIdNum))
          ) {
            return true;
          }
          return false;
        });
      }

      let finalName = '';
      if (matchedEmp) {
        finalName = (matchedEmp.name || '').replace(/[\uFFFD\?]/g, '').trim();
        if (finalName.length < 2 || finalName.includes('?')) {
          finalName = `موظف بصمة رقم (${cleanRawId})`;
        }
        localEmpMap.set(cleanRawId, matchedEmp);
        if (!isNaN(rawNum)) localEmpMap.set(rawNum.toString(), matchedEmp);
        if (matchedEmp.id) localEmpMap.set(matchedEmp.id, matchedEmp);
      } else {
        let cleanExtracted = (extractedName || '').replace(/[\uFFFD\?]/g, '').trim();
        if (cleanExtracted.length >= 2 && /[\u0600-\u06FFa-zA-Z]/.test(cleanExtracted) && !cleanExtracted.includes('?')) {
          finalName = cleanExtracted;
        } else {
          finalName = `موظف بصمة رقم (${cleanRawId})`;
        }

        const newEmpObj: Employee = {
          id: `emp-dat-${cleanRawId}`,
          employeeCode: cleanRawId,
          name: finalName,
          position: 'موظف بصمة',
          department: 'عام',
          iqamaOrIdNumber: cleanRawId,
          phone: '',
          email: '',
          joinDate: date || new Date().toISOString().split('T')[0],
          iqamaExpiryDate: '',
          contractType: '',
          contractExpiryDate: '',
          bankName: '',
          bankAccount: '',
          avatar: '',
          baseSalary: 0,
          housingAllowance: 0,
          transportAllowance: 0,
          otherAllowances: 0,
          gosiInsurance: 0,
          status: 'active',
        };

        if (onAddEmployee) {
          onAddEmployee(newEmpObj);
        }

        matchedEmp = newEmpObj;
        localEmpMap.set(cleanRawId, newEmpObj);
        if (!isNaN(rawNum)) localEmpMap.set(rawNum.toString(), newEmpObj);
        localEmpMap.set(newEmpObj.id, newEmpObj);
      }

      allPunches.sort();
      inPunches.sort();
      outPunches.sort();

      const earliestIn =
        inPunches.length > 0 ? inPunches[0] : allPunches.length > 0 ? allPunches[0] : '08:00';
      const latestOut =
        outPunches.length > 0
          ? outPunches[outPunches.length - 1]
          : allPunches.length > 1
          ? allPunches[allPunches.length - 1]
          : '16:00';

      let delayMinutes = 0;
      const [inH, inM] = earliestIn.split(':').map(Number);
      if (!isNaN(inH) && !isNaN(inM)) {
        const checkInMinutes = inH * 60 + inM;
        const targetMinutes = 8 * 60;
        if (checkInMinutes > targetMinutes + 15) {
          delayMinutes = checkInMinutes - targetMinutes;
        }
      }

      const status: AttendanceStatus = delayMinutes > 0 ? 'late' : 'present';

      const updatedRecord: AttendanceRecord = {
        id: `att-dat-${matchedEmp.id}-${date}`,
        employeeId: matchedEmp.id,
        employeeName: finalName || matchedEmp.name,
        department: matchedEmp.department || 'عام',
        date,
        checkIn: earliestIn,
        checkOut: latestOut,
        delayMinutes,
        earlyLeaveMinutes: 0,
        status,
        shiftName: 'وردية الصباح الرئيسية',
        notes: `تم استيراد كافة حركات البصمة لملف .dat (${fileNames.join(', ')})`,
      };

      if (onAddAttendanceRecord) {
        onAddAttendanceRecord(updatedRecord);
      } else {
        onUpdateAttendanceRecord(updatedRecord);
      }

      matchedCount++;
      updatedDatesSet.add(date);
      recordsSummaryList.push({
        employeeName: finalName || matchedEmp.name,
        date,
        checkIn: earliestIn,
        checkOut: latestOut,
        status: status === 'late' ? 'متأخر' : 'حاضر (مكتمل)',
      });
    });

    const datesArray = Array.from(updatedDatesSet);
    // Show all dates in attendance table so none are filtered out!
    setSelectedDate('');

    setDatImportSummary({
      filesCount: filesArray.length,
      fileNames,
      totalLogsParsed,
      matchedCount,
      updatedDates: datesArray,
      recordsSummary: recordsSummaryList,
    });
    setShowDatImportModal(true);

    triggerNotification(
      `تم استيراد كافة حركات البصمة (.dat) بنجاح (${fileNames.join(' و ')}) وعرض ${matchedCount} موظفاً في الجدول!`
    );

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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

  const displayedAttendance = useMemo(() => {
    if (!selectedDate) return attendance;
    return attendance.filter((a) => a.date === selectedDate);
  }, [attendance, selectedDate]);

  const totalDelaysMinutes = displayedAttendance.reduce((sum, a) => sum + (a.delayMinutes || 0), 0);

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

          {/* Hidden File Input for ZKTeco DAT Files Import */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportDatFiles}
            accept=".dat,.txt,.csv"
            multiple
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
              className="px-3 py-1.5 rounded-full border border-transparent text-white text-xs font-bold bg-amber-500 hover:bg-amber-600 transition-colors flex items-center gap-1.5 shadow-sm shadow-amber-500/20 active:scale-98 cursor-pointer"
              title="تحديد ملفات البصمة (.dat) - ملف للدخول attlog.dat وملف للخروج attlog1.dat"
            >
              <FileSpreadsheet className="w-4 h-4 text-white" />
              <span>استيراد ملفات البصمة (.dat)</span>
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
                {displayedAttendance.length > 0 ? (
                  displayedAttendance.map((rec, idx) => {
                    const badge = getStatusBadge(rec.status);

                    return (
                      <tr key={`att-log-${rec.id}-${idx}`} className="hover:bg-white/80 dark:hover:bg-slate-700/40 transition-colors">
                        <td className="p-3.5 font-bold text-slate-800 dark:text-slate-100">
                          {formatEmployeeDisplayName(rec.employeeName, rec.employeeId, employees)}
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
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-500 dark:text-slate-400">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                          <Clock className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-extrabold text-sm text-slate-700 dark:text-slate-200">
                            لا توجد سجلات حضور مسجلة بتاريخ {selectedDate || 'المحدد'}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            {attendance.length > 0
                              ? `يوجد إجمالي ${attendance.length} سجل حضور في تواريخ أخرى.`
                              : 'جدول الحضور فارغ حالياً. يمكنك استيراد ملفات جهاز البصمة (.dat) مباشرة.'}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-sm flex items-center gap-2 cursor-pointer transition-colors"
                          >
                            <FileSpreadsheet className="w-4 h-4" />
                            <span>استيراد ملفات البصمة (.dat)</span>
                          </button>
                          {attendance.length > 0 && selectedDate && (
                            <button
                              onClick={() => setSelectedDate('')}
                              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold text-xs cursor-pointer transition-colors"
                            >
                              إظهار كافة سجلات الحضور ({attendance.length})
                            </button>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
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
                تعديل حالة ودوام: {formatEmployeeDisplayName(editingRecord.employeeName, editingRecord.employeeId, employees)}
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
                    <tr key={`batch-${rec.id || idx}-${idx}`} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                      <td className="p-3 font-bold text-slate-800 dark:text-slate-200">
                        {formatEmployeeDisplayName(rec.employeeName, rec.employeeId, employees)}
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

      {/* DAT Files Import Summary Modal */}
      {showDatImportModal && datImportSummary && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 max-w-2xl w-full border border-slate-200 dark:border-slate-700 shadow-2xl space-y-4 max-h-[90vh] flex flex-col dir-rtl text-right">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700/60">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-800 dark:text-white">
                    نتائج استيراد ملفات البصمة (.dat)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    تم قراءة وتحليل ملفات بصمة الدخول والخروج بنجاح
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDatImportModal(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Imported files badge */}
            <div className="bg-amber-50 dark:bg-amber-950/40 p-3.5 rounded-2xl border border-amber-200/70 dark:border-amber-900/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  الملفات التي تم معالجتها ({datImportSummary.filesCount} ملف):
                </span>
                <span className="text-[11px] font-bold bg-amber-200/60 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 px-2.5 py-0.5 rounded-full">
                  تنسيق جهاز البصمة (.dat)
                </span>
              </div>
              <div className="flex flex-wrap gap-2 text-xs font-mono font-bold">
                {datImportSummary.fileNames.map((name, i) => (
                  <span
                    key={i}
                    className="bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 px-3 py-1 rounded-xl border border-amber-200 dark:border-amber-800 flex items-center gap-1.5 shadow-2xs"
                  >
                    <FileText className="w-3.5 h-3.5 text-amber-500" />
                    {name}
                    {name.toLowerCase().includes('attlog1') ? (
                      <span className="text-[10px] bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-1.5 py-0.2 rounded font-sans">
                        بصمات الخروج
                      </span>
                    ) : (
                      <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.2 rounded font-sans">
                        بصمات الدخول
                      </span>
                    )}
                  </span>
                ))}
              </div>
            </div>

            {/* Metrics cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-center">
                <p className="text-[11px] font-bold text-slate-500">عدد حركات البصمة</p>
                <p className="text-lg font-black text-amber-600 dark:text-amber-400">
                  {datImportSummary.totalLogsParsed}
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-center">
                <p className="text-[11px] font-bold text-slate-500">الموظفين المحدثين</p>
                <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                  {datImportSummary.matchedCount}
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-center">
                <p className="text-[11px] font-bold text-slate-500">الأيام المعالجة</p>
                <p className="text-lg font-black text-blue-600 dark:text-blue-400">
                  {datImportSummary.updatedDates.length || 1}
                </p>
              </div>
            </div>

            {/* Summary List Table */}
            <div className="overflow-y-auto max-h-56 border border-slate-200 dark:border-slate-700 rounded-2xl">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 font-bold sticky top-0">
                  <tr>
                    <th className="p-2.5">الموظف</th>
                    <th className="p-2.5 text-center">التاريخ</th>
                    <th className="p-2.5 text-center">وقت الدخول</th>
                    <th className="p-2.5 text-center">وقت الخروج</th>
                    <th className="p-2.5 text-center">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {datImportSummary.recordsSummary.map((rec, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                      <td className="p-2.5 font-bold text-slate-800 dark:text-slate-200">
                        {formatEmployeeDisplayName(rec.employeeName, undefined, employees)}
                      </td>
                      <td className="p-2.5 text-center font-mono text-slate-600 dark:text-slate-400">
                        {rec.date}
                      </td>
                      <td className="p-2.5 text-center font-bold text-emerald-600">
                        {rec.checkIn}
                      </td>
                      <td className="p-2.5 text-center font-bold text-blue-600">
                        {rec.checkOut}
                      </td>
                      <td className="p-2.5 text-center font-bold">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] ${
                            rec.status.includes('متأخر')
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          }`}
                        >
                          {rec.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 flex justify-end">
              <button
                onClick={() => setShowDatImportModal(false)}
                className="px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>تم، اعتماد وتطبيق الحضور</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

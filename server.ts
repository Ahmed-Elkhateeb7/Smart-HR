import express from 'express';
import path from 'path';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy initializer for Gemini client
let aiInstance: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI | null {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      aiInstance = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    }
  }
  return aiInstance;
}

// AI Endpoint 1: Generate Job Description
app.post('/api/ai/job-description', async (req, res) => {
  const { jobTitle = '', department = '', seniorityLevel = '', keySkills = '' } = req.body || {};

  const buildFastJobDescription = () => {
    const titleStr = jobTitle || 'مسمى وظيفي';
    const deptStr = department || 'الموارد البشرية والتطوير';
    const levelStr = seniorityLevel || 'متوسط الخبرة';
    const skillsList = keySkills
      ? keySkills.split(',').map((s: string) => s.trim()).filter(Boolean)
      : ['حل المشكلات', 'إدارة الوقت والأولويات', 'التواصل الفعال'];

    return {
      title: titleStr,
      summary: `توصيف وظيفي متكامل لمسمى ${titleStr} في قسم ${deptStr}. يختص هذا الدور بتنفيذ الخطط التشغيلية، ومتابعة الأداء اليومي، وتحقيق أعلى معايير الجودة والإنتاجية وفقاً لمتطلبات مستوى الخبرة (${levelStr}).`,
      responsibilities: [
        `التخطيط والتنفيذ المباشر لكافة الأعمال اليومية المتعلقة بـ ${titleStr}`,
        `المشاركة في وضع الخطط التشغيلية وتطوير آليات العمل بـ ${deptStr}`,
        'متابعة وتطبيق أعلى معايير الجودة والسلامة المهنية بالشركة',
        'إعداد والرفع بالتقارير الدورية والإحصائيات للإدارة المباشرة',
        'التنسيق والتكامل الفعال مع باقي الأقسام وفرق العمل ذات الصلة'
      ],
      requiredSkills: [
        'القدرة على التحليل السريع واتخاذ القرارات التشغيلية',
        'إتقان برامج الحاسوب والتطبيقات الحديثة ذات الصلة بالعمل',
        'العمل الجماعي والقدرة على تحمل ضغوط العمل',
        ...skillsList
      ],
      kpis: [
        'نسبة إنجاز المهام المطلوبة في المواعيد المحددة (Target: 95%)',
        'معدل انخفاض الأخطاء التشغيلية وجودة المخرجات (Target: < 2%)',
        'معدل رضا الإدارة والعملاء الداخليين/الخارجيين (Target: 90%)',
        'مدى الالتزام بسياسات ولائحة العمل والتعليمات المباشرة'
      ],
      suggestedSalaryRange: '15,000 - 28,000 جنيه مصري'
    };
  };

  try {
    const ai = getGemini();

    if (!ai) {
      return res.json({ success: true, data: buildFastJobDescription() });
    }

    const prompt = `أنت خبير موارد بشرية متميز في إعداد التوصيف الوظيفي ومؤشرات الأداء KPI's باللغة العربية لسوق العمل المصري.
يرجى إنتاج توصيف وظيفي موجز ومباشر ومؤشرات أداء دقيقة بصيغة JSON حصرية للمسمى:
- المسمى الوظيفي: ${jobTitle}
- القسم: ${department || 'عام'}
- مستوى الخبرة: ${seniorityLevel || 'متوسط'}
- المهارات: ${keySkills || 'مهارات مهنية متميزة'}

أرجع JSON حصري بالهيكل التالي:
{
  "title": "${jobTitle || 'اسم الوظيفة'}",
  "summary": "ملخص الوظيفة في 2-3 جمل",
  "responsibilities": ["مهام 1", "مهام 2", "مهام 3", "مهام 4", "مهام 5"],
  "requiredSkills": ["مهارة 1", "مهارة 2", "مهارة 3", "مهارة 4"],
  "kpis": ["مؤشر أداء 1", "مؤشر أداء 2", "مؤشر أداء 3", "مؤشر أداء 4"],
  "suggestedSalaryRange": "نطاق الراتب بالجنيه المصري EGP (مثال: 18,000 - 30,000 جنيه مصري)"
}`;

    // Fast generation using gemini-3.6-flash with low thinking level & timeout
    const fetchAiPromise = ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      },
    });

    const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 3000));

    const result = await Promise.race([fetchAiPromise, timeoutPromise]);

    if (result && result.text) {
      const parsed = JSON.parse(result.text);
      return res.json({ success: true, data: parsed });
    }

    // Fast fallback if timeout reached or empty result
    return res.json({ success: true, data: buildFastJobDescription() });
  } catch (error: any) {
    console.log('Fast fallback used for job description:', error?.message);
    return res.json({ success: true, data: buildFastJobDescription() });
  }
});

// AI Endpoint 2: Smart HR Assistant Chat
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message, history } = req.body;
    const ai = getGemini();

    if (!ai) {
      return res.json({
        success: true,
        reply: `مرحباً بك! أنا مساعد Smart HR الذكي.
استجابة نموذجية: بالنسبة لسؤالك حول "${message}"، فإن سياسات الموارد البشرية ونظام العمل تدعو إلى مراجعة سجلات الحضور، واعتماد الساعات الإضافية وفق نسبة 1.5x للوقت الإضافي، والتأكد من توثيق العهد والمستندات قبل اعتماد مسير الرواتب.
(ملاحظة: يمكنك إضافة GEMINI_API_KEY للحصول على إجابات مخصصة ودقيقة لحظياً).`
      });
    }

    const systemInstruction = `أنت "Smart HR Bot" المساعد الذكي لنظام Smart HR لإدارة الموارد البشرية.
تحدث باللغة العربية بأسلوب مهني وأنيق وواضح.
قم بمساعدة مدراء HR والأجوبة على استفسارات نظام العمل، الإجازات، مكافأة نهاية الخدمة، التأمينات الاجتماعية، وتدقيق ملفات الموظفين والرواتب.
حافظ على الإجابات منظمة باستخدام النقاط والرموز التعبيرية الخفيفة المناسبة.`;

    const chat = ai.chats.create({
      model: 'gemini-3.6-flash',
      config: {
        systemInstruction,
      },
    });

    // Send history if provided
    if (history && Array.isArray(history)) {
      for (const item of history) {
        if (item.text) {
          await chat.sendMessage({ message: item.text });
        }
      }
    }

    const response = await chat.sendMessage({ message: message || 'مرحبا' });
    return res.json({ success: true, reply: response.text });
  } catch (error: any) {
    console.error('Error in HR Chat:', error);
    return res.status(500).json({ success: false, error: 'حدث خطأ أثناء التواصل مع المساعد الذكي' });
  }
});

// AI Endpoint 3: Payroll Guard Smart Audit
app.post('/api/ai/audit-payroll', async (req, res) => {
  try {
    const { employees, attendance, loans } = req.body;
    const ai = getGemini();

    if (!ai) {
      const empCount = employees ? employees.length : 0;
      const loanCount = loans ? loans.length : 0;
      return res.json({
        success: true,
        auditSummary: empCount === 0 ? "لا يوجد بيانات للموظفين لفحصها حالياً." : `تم فحص بيانات ${empCount} موظف بنجاح (وضع التجربة - بدون مفتاح API).`,
        alerts: empCount === 0 ? [] : [
          {
            id: 'al-1',
            type: 'info',
            title: 'إشعار فحص أولي',
            description: `النظام يعمل في وضع التجربة. تم رصد ${loanCount} سلف قائمة ستعالج تلقائياً.`,
            actionNeeded: 'مراجعة عامة'
          }
        ]
      });
    }

    const prompt = `أنت خبير تدقيق رواتب وموارد بشرية (حارس المرتبات - Payroll Guard).
لديك قائمة الموظفين التالية وسجلاتهم:
الموظفون: ${JSON.stringify(employees.slice(0, 5))}
السلف: ${JSON.stringify(loans)}

قم بتحليل هذه البيانات واكتشاف أي أخطاء أو مخاطر قبل اعتماد المرتبات (مثال: مستندات منتهية، سلف لم تُخصم، رواتب غير متوازنة).
أرجِع النتيجة بصيغة JSON باللغة العربية كالتالي:
{
  "auditSummary": "ملخص الفحص الذكي للرواتب",
  "alerts": [
    {
      "id": "معرف فريد",
      "type": "warning | danger | info",
      "title": "عنوان التنبيه",
      "description": "تفاصيل التنبيه",
      "actionNeeded": "الإجراء المطلوب"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ success: true, ...parsed });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Smart HR Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

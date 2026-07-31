import express from 'express';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
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
  try {
    const { jobTitle, department, seniorityLevel, keySkills } = req.body;
    const ai = getGemini();

    if (!ai) {
      // Clean fallback if process.env.GEMINI_API_KEY is not set yet
      return res.json({
        success: true,
        data: {
          title: jobTitle || 'مسمى وظيفي',
          summary: `مؤهل وظيفي متكامل لمسمى ${jobTitle} في قسم ${department || 'الموارد البشرية'}. يتطلب خبرة ${seniorityLevel || 'متوسطة'}.`,
          responsibilities: [
            `إدارة ومتابعة المهام التشغيلية اليومية الخاصة بـ ${jobTitle}`,
            'التنسيق مع فريق العمل والأقسام ذات الصلة لضمان سير العمل بدقة',
            'إعداد التقارير الدورية ورفعها للإدارة المباشرة',
            'المشاركة في تطوير إجراءات العمل وتحسين الإنتاجية'
          ],
          requiredSkills: [
            'القدرة على حل المشكلات والتفكير التحليلي',
            'إتقان استخدام أدوات وبرامج الحاسوب والأوفيس',
            'مهارات التواصل الفعال والتفاوض',
            ...(keySkills ? keySkills.split(',') : ['إدارة الوقت والأولويات'])
          ],
          kpis: [
            'نسبة إنجاز المهام في الوقت المحدد (Target: 95%)',
            'مستوى جودة المخرجات والتكلفة التشغيلية',
            'معدل رضا فريق العمل والأقسام المتعاملة'
          ],
          suggestedSalaryRange: '8,000 - 15,000 ريال سعودي'
        }
      });
    }

    const prompt = `أنت خبير موارد بشرية متخصص في إعداد التوصيف الوظيفي والهياكل التنظيمية للشركات باللغة العربية.
يرجى إنتاج توصيف وظيفي احترافي ومفصل للمسمى الوظيفي التالي:
- المسمى الوظيفي: ${jobTitle}
- القسم: ${department || 'غير محدد'}
- مستوى الخبرة: ${seniorityLevel || 'متوسط'}
- مهارات إضافية مطلوبة: ${keySkills || 'مهارات قيادية وتنظيمية'}

اكتب الإجابة بصيغة JSON حصرية تحتوي الأقسام التالية باللغة العربية:
{
  "title": "اسم الوظيفة الكامل",
  "summary": "ملخص الوظيفة في 2-3 جمل",
  "responsibilities": ["مهام 1", "مهام 2", "مهام 3", "مهام 4", "مهام 5"],
  "requiredSkills": ["مهارة 1", "مهارة 2", "مهارة 3", "مهارة 4"],
  "kpis": ["مؤشر أداء 1", "مؤشر أداء 2", "مؤشر أداء 3"],
  "suggestedSalaryRange": "الراتب المقترح بالريال"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '';
    const parsed = JSON.parse(text);
    return res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error generating job description:', error);
    return res.status(500).json({ success: false, error: error.message || 'فشل في توليد التوصيف الوظيفي' });
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

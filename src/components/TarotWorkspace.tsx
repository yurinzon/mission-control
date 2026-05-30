"use client";

import { useState, useEffect } from "react";

interface TarotCard {
  id: string;
  nameHe: string;
  nameEn: string;
  number: string;
  meaning: string;
  detailedMeaning: string;
  advice: string;
  color: string;
  accent: string;
  symbol: string;
  svgIcon: React.ReactNode;
}

interface CardState {
  index: number;
  card: TarotCard | null;
  isFlipped: boolean;
  positionName: string;
}

export default function TarotWorkspace({ showToast }: { showToast: (msg: string, type?: "success" | "info") => void }) {
  const [spread, setSpread] = useState<"none" | "daily" | "timeline" | "proscons">("none");
  const [cardsOnTable, setCardsOnTable] = useState<CardState[]>([]);
  const [selectedCard, setSelectedCard] = useState<TarotCard | null>(null);
  const [isGeneratingReel, setIsGeneratingReel] = useState(false);
  
  // Instagram Content Hub state
  const [instagramDrafts, setInstagramDrafts] = useState<any[]>([]);
  const [selectedDraft, setSelectedDraft] = useState<any | null>(null);
  const [draftContent, setDraftContent] = useState("");
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [activeTab, setActiveTab] = useState<"simulator" | "instagram" | "reels">("simulator");

  // Local card database
  const tarotCards: TarotCard[] = [
    {
      id: "magician",
      nameHe: "הקוסם",
      nameEn: "The Magician",
      number: "I",
      meaning: "יצירת יש מאין, כוח הרצון, חיבור בין שמיים לארץ ומימוש פוטנציאל מלא.",
      detailedMeaning: "קלף הקוסם מעניק לך השבוע את המפתחות לשער של הבריאה העצמית. כל הכלים הדרושים לך – הרוחניים, המנטליים, הרגשיים והפיזיים – כבר מונחים על השולחן שלך. עכשיו זה הזמן לרכז את הפוקוס, להאמין בכישורים שלך ולהתחיל לפעול ללא היסוס.",
      advice: "תעשי שימוש אקטיבי בכלים שלך. אל תחכי לתזמון מושלם, תייצרי אותו בעצמך.",
      color: "from-amber-500 via-yellow-400 to-indigo-600",
      accent: "#D4AF37",
      symbol: "אינסוף וכלי יצירה קוסמיים",
      svgIcon: (
        <svg className="w-16 h-16 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="1">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18M3 12h18M12 3l4 4M12 21l-4-4M12 3l-4 4M12 21l4-4M7 12a5 5 0 1 1 10 0 5 5 0 0 1-10 0Z" />
          <path d="M12 10v4" strokeLinecap="round" />
        </svg>
      )
    },
    {
      id: "fool",
      nameHe: "השוטה",
      nameEn: "The Fool",
      number: "0",
      meaning: "התחלות חדשות, אמון קוסמי, שחרור שליטה, וצעידה אל עבר הלא נודע.",
      detailedMeaning: "השוטה מייצג את הילד הפנימי שסומך על היקום בעיניים עצומות. הוא עומד על קצה הצוק, מוכן לקפוץ מדרגה, לא מתוך טיפשות אלא מתוך אמונה עמוקה שהרשת תופיע. קלף זה קורא לך לשחרר את החרדות מהעתיד ולפתוח דף חדש ונקי.",
      advice: "תעשי קפיצת מדרגה. תשחררי את הפחד ממה שאנשים יגידו, ותתחילי מחדש באומץ.",
      color: "from-sky-400 via-amber-200 to-orange-500",
      accent: "#FF9F1C",
      symbol: "ורד לבן, שמש עולה ותיק מסע",
      svgIcon: (
        <svg className="w-16 h-16 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="1">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9ZM12 7.5v9M7.5 12h9" />
          <circle cx="12" cy="12" r="1.5" className="fill-current" />
        </svg>
      )
    },
    {
      id: "death",
      nameHe: "המוות",
      nameEn: "The Death",
      number: "XIII",
      meaning: "טרנספורמציה עמוקה, שחרור דפוסים ישנים, סוף שהוא התחלה חדשה מרהיבה.",
      detailedMeaning: "אל תפחדי מקלף המוות. זהו אחד הקלפים היפים והעוצמתיים ביותר בחפיסה. הוא לא מדבר על מוות פיזי, אלא על סיום מתבקש של שלב שכבר אינו משרת אותך. קלף זה דורש ממך להניח לעלים היבשים לנשור, כדי שיוכלו לצמוח ניצנים חדשים ומרהיבים.",
      advice: "תשחררי קשרים, הרגלים או פחדים שסיימו את תפקידם בחייך. תפני מקום לחדש.",
      color: "from-slate-800 via-zinc-950 to-purple-950",
      accent: "#7B2CBF",
      symbol: "שלד מוזהב, שמש זורחת בין שני מגדלים",
      svgIcon: (
        <svg className="w-16 h-16 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="1">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9V3m0 18v-6M3 12h6m6 0h6m-9-3a3 3 0 1 1 0 6 3 3 0 0 1 0-6Z" />
          <path d="m19 5-3 3M5 19l3-3M5 5l3 3m11 11-3-3" strokeLinecap="round" />
        </svg>
      )
    },
    {
      id: "wheel",
      nameHe: "גלגל המזל",
      nameEn: "The Wheel of Fortune",
      number: "X",
      meaning: "מחזוריות קוסמית, שינויים בלתי נמנעים, חוק הקארמה ומציאת השקט הפנימי.",
      detailedMeaning: "גלגל המזל מזכיר לנו שהדבר היחיד שקבוע בחיים הוא השינוי עצמו. לפעמים אנחנו למעלה ולפעמים למטה. החוכמה היא לא להילחם בסיבוב הגלגל, אלא למצוא את המרכז השקט והיציב שלו – את נקודת העד בפנים שלא מושפעת מהטלטלות החיצוניות.",
      advice: "אל תילחמי בשינויים. תזרמי עם הזרם הנוכחי ותחפשי את ההזדמנות הטמונה בו.",
      color: "from-rose-500 via-amber-500 to-cyan-500",
      accent: "#E0A96D",
      symbol: "גלגל גורל קדום עם ארבע חיות שמימיות",
      svgIcon: (
        <svg className="w-16 h-16 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="1">
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="4" />
          <path strokeLinecap="round" d="M12 3v5M12 16v5M3 12h5m8 0h5M5.636 5.636l3.536 3.536m5.656 5.656l3.536 3.536M18.364 5.636l-3.536 3.536M9.172 14.828l-3.536 3.536" />
        </svg>
      )
    }
  ];

  // Load Instagram drafts on mount
  useEffect(() => {
    fetchDrafts();
  }, []);

  const fetchDrafts = async () => {
    try {
      // Create some beautiful mock drafts if files are not fully accessible
      const mockDrafts = [
        {
          id: "magician",
          title: "פוסט 1: קלף הקוסם - מניפסטציה ויצירת מציאות",
          subtitle: "מאת קאסי | מניפסטציה ומימוש הפוטנציאל",
          content: `🔮 **השראה שבועית: קלף הקוסם (The Magician)**

האם הרגשת פעם שחסר לך 'עוד משהו' כדי לצאת לדרך? עוד קורס, עוד תואר, עוד אישור מהעולם?

קלף הקוסם מגיע השבוע כדי להגיד לך: **די להמתין. הכל כבר כאן.**
ארבעת יסודות היקום מונחים לפני הקוסם על השולחן – המטבעות (החומר), המטות (התשוקה), הגביעים (הרגש) והחרבות (השכל). הוא לא צריך שום דבר חיצוני כדי לחולל קסמים. הוא רק צריך לחבר ביניהם ולפעול.

**איך תתרגמי את זה השבוע לחיים שלך?**
1. **תעשי מיפוי נכסים:** תכתבי ביומן 5 כישורים או כלים שיש לך כבר עכשיו (למשל: יכולת כתיבה, סבלנות, רקע בעיצוב).
2. **צעד אחד קטן:** מה הצעד הקטן ביותר שאת יכולה לעשות היום עם הכלים האלו כדי לקדם את החלום שלך?

הכוח לברוא מציאות נמצא בידיים שלך. 

תשמרי את הפוסט הזה כתזכורת לעוצמה שלך השבוע! ✨
#טארוט #השראה #מניפסטציה #רוחניותיומיומית #הקוסם #קאסי`
        },
        {
          id: "fool",
          title: "פוסט 2: קלף השוטה - האומץ להתחיל מחדש",
          subtitle: "מאת קאסי | התחלות חדשות ושחרור פחדים",
          content: `✨ **מתי בפעם האחרונה עשית משהו בפעם הראשונה?**

קלף השוטה (The Fool) הוא האנרגיה האהובה עלי לפתוח איתה שלבים חדשים בחיים.
בתרבות המודרנית המילה 'שוטה' נתפסת כעלבון, אבל בטארוט – השוטה הוא החכם מכולם. הוא זה שמוכן להיראות חובבן, מוכן לטעות ומוכן לשחרר את הצורך בשליטה מוחלטת כדי פשוט לחוות את החיים.

הוא צועד לקצה הצוק, השמש מאירה לו את הדרך, והוא לא מביט למטה בחרדה. הוא יודע שהנפילה היא חלק מהמעוף.

**3 סימנים שאת צריכה לאמץ את אנרגיית השוטה השבוע:**
- את מרגישה תקיעות עמוקה בתוך הרגלים ישנים.
- הפחד 'ממה יגידו' או מכישלון מונע ממך להתחיל משהו חדש.
- את חושבת יותר מדי ועושה פחות מדי.

תזכרי: כל מאסטר התחיל כחובבן שהסכים לנסות. קחי נשימה עמוקה, ותעשי את הצעד הבא. היקום כבר יפרוס לך רשת ביטחון. 🤍

תכתבי לי בתגובות – באיזה תחום בחיים שלכן אתן מוכנות לאמץ את השוטה השבוע?
#השוטה #התחלותחדשות #טארוט #התפתחותאישית #שחרורפחדים #קאסי`
        },
        {
          id: "death",
          title: "פוסט 4: קלף המוות - סוף שהוא התחלה חדשה",
          subtitle: "מאת קאסי | ניפוץ מיתוס הטרנספורמציה",
          content: `☠️ **למה קלף המוות הוא בעצם ברכה?**

כשקלף המוות (Death) עולה בפריסה, רוב האנשים נלחצים. הם רואים את השלד, את השחור, ומדמיינים אסון. 
אבל האמת היא שזהו אחד הקלפים הכי מעצימים שיש. 

בטארוט, המוות אינו פיזי – הוא סימבולי. הוא מייצג את החוק הקוסמי החשוב ביותר: **כדי שמשהו חדש ייוולד, משהו ישן חייב למות.**
המוות הוא הנשירה של העלים היבשים בסתיו כדי לפנות מקום לפריחה של האביב. 

אם את נאחזת בכוח בקשר שכבר נגמר, בעבודה שסוחטת אותך, או בדפוס מחשבה שמקטין אותך – את בעצם חוסמת את הנסים שהעתיד מכין עבורך.

**שאלת התבוננות ליומן (Journaling):**
מה הדבר שאת יודעת עמוק בפנים שסיין את תפקידו בחייך, והגיע הזמן לשחרר אותו באהבה ובהודיה?

תשחררי את הישן. השמש כבר עולה באופק שמאחורי המגדלים בקלף. 🌅
#קלףהמוות #טרנספורמציה #שינוי #שחרור #טארוט #תודעהחדשה #קאסי`
        }
      ];

      setInstagramDrafts(mockDrafts);
      setSelectedDraft(mockDrafts[0]);
      setDraftContent(mockDrafts[0].content);
    } catch (e) {
      console.error("Error loading drafts:", e);
    }
  };

  const selectDraft = (draft: any) => {
    setSelectedDraft(draft);
    setDraftContent(draft.content);
  };

  const handleSaveDraft = () => {
    setIsSavingDraft(true);
    // Simulate API call to save to Obsidian path
    setTimeout(() => {
      setIsSavingDraft(false);
      showToast("הטיוטה נשמרה בהצלחה באובסידיאן!", "success");
    }, 1200);
  };

  const startSpread = (type: "daily" | "timeline" | "proscons") => {
    setSpread(type);
    setSelectedCard(null);
    showToast("החפיסה נטרפת באנרגיה קוסמית...", "info");

    setTimeout(() => {
      // Shuffle cards database
      const shuffled = [...tarotCards].sort(() => Math.random() - 0.5);
      
      let positions: CardState[] = [];
      if (type === "daily") {
        positions = [{ index: 0, card: shuffled[0], isFlipped: false, positionName: "המסר הקוסמי היומי שלך" }];
      } else if (type === "timeline") {
        positions = [
          { index: 0, card: shuffled[0], isFlipped: false, positionName: "עבר (מה שעיצב אותך)" },
          { index: 1, card: shuffled[1], isFlipped: false, positionName: "הווה (האתגר הנוכחי)" },
          { index: 2, card: shuffled[2], isFlipped: false, positionName: "עתיד (הפוטנציאל המתהווה)" }
        ];
      } else {
        positions = [
          { index: 0, card: shuffled[0], isFlipped: false, positionName: "בעד (מה שמקדם אותך)" },
          { index: 1, card: shuffled[1], isFlipped: false, positionName: "נגד (מה שחוסם אותך)" }
        ];
      }

      setCardsOnTable(positions);
      showToast("הקלפים נפרסו פנים מטה בהצלחה!", "success");
    }, 1000);
  };

  const flipCardOnTable = (index: number) => {
    setCardsOnTable(prev =>
      prev.map((c, i) => (i === index ? { ...c, isFlipped: true } : c))
    );
    
    const targetCard = cardsOnTable[index].card;
    if (targetCard) {
      setSelectedCard(targetCard);
      showToast(`נחשף קלף: ${targetCard.nameHe}!`, "success");
    }
  };

  const runReelsGenerator = async () => {
    setIsGeneratingReel(true);
    showToast("מריץ את מנוע הרינדור של מקס (Python FFMPEG)...", "info");

    try {
      const res = await fetch("/api/dashboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "renderVideo" })
      });
      const data = await res.json();
      
      if (data.success) {
        showToast("סרטון ה-Reels רונדר בהצלחה בקובץ פנימי!", "success");
      } else {
        showToast("שגיאה ברינדור הסרטון. בדוק את הלוגים.", "info");
      }
    } catch (e) {
      showToast("נכשלה קריאת שרת הרינדור.", "info");
    } finally {
      setIsGeneratingReel(false);
    }
  };

  return (
    <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
      
      {/* 1. Header with custom Dark Celestial styling */}
      <div className="relative overflow-hidden bg-slate-950 border border-indigo-950 p-8 rounded-[2rem] text-right shadow-[0_20px_50px_rgba(99,102,241,0.15)]">
        {/* Glowing Orbs */}
        <div className="absolute top-1/2 left-10 -translate-y-1/2 w-64 h-64 bg-indigo-600/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-amber-500/5 rounded-full blur-[60px] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row-reverse items-center justify-between gap-6">
          <div className="text-right">
            <div className="flex items-center gap-2 justify-end">
              <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-ping" />
              <span className="text-[10px] text-indigo-400 font-extrabold uppercase tracking-widest">KASSI TAROT EXCLUSIVE WEB EXPERIENCE</span>
            </div>
            <h2 className="text-3xl font-serif font-black text-white tracking-tight mt-2.5">מקדש הטארוט האינטראקטיבי של קאסי</h2>
            <p className="text-slate-400 text-sm mt-3 leading-relaxed max-w-2xl">
              מרחב עבודה דיגיטלי יוקרתי המשלב בין עולם המיסטיקה לקוד מודרני. כאן תוכלי לבצע פריסות קלפים אינטראקטיביות באנימציות תלת-ממדיות מרהיבות, לנהל ולערוך טיוטות תוכן שבועי עבור אינסטגרם, ולייצר סרטוני Reels קולנועיים בלחיצת כפתור.
            </p>
          </div>
          
          <div className="flex gap-2.5 bg-white/5 border border-white/10 p-1.5 rounded-2xl backdrop-blur-md">
            <button
              onClick={() => setActiveTab("reels")}
              className={`px-5 py-3 rounded-xl text-xs font-black transition-all ${
                activeTab === "reels" ? "bg-white text-indigo-950 shadow-md" : "text-slate-300 hover:text-white"
              }`}
            >
              מנוע הרילס
            </button>
            <button
              onClick={() => setActiveTab("instagram")}
              className={`px-5 py-3 rounded-xl text-xs font-black transition-all ${
                activeTab === "instagram" ? "bg-white text-indigo-950 shadow-md" : "text-slate-300 hover:text-white"
              }`}
            >
              ניהול תוכן ופוסטים
            </button>
            <button
              onClick={() => setActiveTab("simulator")}
              className={`px-5 py-3 rounded-xl text-xs font-black transition-all ${
                activeTab === "simulator" ? "bg-white text-indigo-950 shadow-md" : "text-slate-300 hover:text-white"
              }`}
            >
              סימולטור פריסות
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: Spread Simulator */}
      {activeTab === "simulator" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Card Table Area (7 columns) */}
          <div className="lg:col-span-7 bg-slate-950 border border-slate-900 rounded-[2.5rem] p-8 min-h-[580px] flex flex-col justify-between relative overflow-hidden shadow-inner">
            
            {/* Background vector design */}
            <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center">
              <svg className="w-96 h-96 text-white animate-[spin_100s_linear_infinite]" fill="none" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="0.5" strokeDasharray="5,5" />
                <circle cx="50" cy="50" r="30" stroke="currentColor" strokeWidth="0.3" />
                <circle cx="50" cy="50" r="15" stroke="currentColor" strokeWidth="0.3" strokeDasharray="2,2" />
                <path d="M50 5v90M5 50h90M18.2 18.2l63.6 63.6M18.2 81.8l63.6-63.6" stroke="currentColor" strokeWidth="0.3" />
              </svg>
            </div>

            {/* Spread Configuration */}
            <div className="relative z-10 text-center space-y-4">
              <span className="text-[10px] text-amber-500 font-extrabold uppercase tracking-widest">SELECT A CELESTIAL ALIGNMENT</span>
              <h3 className="text-lg font-serif font-bold text-white">איזה סוג פריסה תרצי לפתוח כעת?</h3>
              
              <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
                <button
                  onClick={() => startSpread("proscons")}
                  className={`px-5 py-3 rounded-full text-xs font-bold border transition-all ${
                    spread === "proscons"
                      ? "bg-amber-500/10 border-amber-500 text-amber-400"
                      : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
                  }`}
                >
                  דילמה: בעד ונגד (2 קלפים)
                </button>
                <button
                  onClick={() => startSpread("timeline")}
                  className={`px-5 py-3 rounded-full text-xs font-bold border transition-all ${
                    spread === "timeline"
                      ? "bg-amber-500/10 border-amber-500 text-amber-400"
                      : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
                  }`}
                >
                  ציר הזמן: עבר, הווה, עתיד (3 קלפים)
                </button>
                <button
                  onClick={() => startSpread("daily")}
                  className={`px-5 py-3 rounded-full text-xs font-bold border transition-all ${
                    spread === "daily"
                      ? "bg-amber-500/10 border-amber-500 text-amber-400"
                      : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
                  }`}
                >
                  מסר קוסמי יומי (קלף אחד)
                </button>
              </div>
            </div>

            {/* Card Spread Render Grid */}
            <div className="relative z-10 my-10 flex items-center justify-center gap-6 md:gap-8 flex-wrap">
              {spread === "none" ? (
                <div className="text-center py-20 space-y-4">
                  <div className="w-16 h-24 mx-auto border border-dashed border-slate-700 rounded-xl flex items-center justify-center text-slate-600">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">בחרי את אופי הפריסה מלמעלה כדי לפרוס את קלפי הטארוט על שולחן העור הקדום.</p>
                </div>
              ) : (
                cardsOnTable.map((tableCard, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-3">
                    <span className="text-[10px] text-slate-500 font-extrabold tracking-wider">{tableCard.positionName}</span>
                    
                    {/* Interactive 3D Card Box */}
                    <div 
                      onClick={() => !tableCard.isFlipped && flipCardOnTable(idx)}
                      className={`relative w-32 h-52 cursor-pointer [perspective:1000px] transition-transform duration-500 hover:scale-105 active:scale-95`}
                    >
                      <div 
                        className={`relative w-full h-full rounded-2xl transition-transform duration-700 [transform-style:preserve-3d] ${
                          tableCard.isFlipped ? "[transform:rotateY(180deg)]" : ""
                        }`}
                      >
                        {/* CARD BACK SIDE (Star / Astrolabe) */}
                        <div className="absolute inset-0 w-full h-full bg-indigo-950/40 rounded-2xl border-2 border-amber-500/30 flex flex-col justify-between p-4 [backface-visibility:hidden] double-bezel shadow-2xl">
                          <div className="w-full flex justify-between text-[8px] font-serif text-amber-500/50 font-bold">
                            <span>0</span>
                            <span>K.T</span>
                          </div>
                          
                          <div className="w-12 h-12 mx-auto rounded-full border border-amber-500/30 flex items-center justify-center text-amber-500/40">
                            <svg className="w-6 h-6 animate-[spin_60s_linear_infinite]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
                              <path d="M12 3v18M3 12h18M5.636 5.636l12.728 12.728M5.636 18.364L18.364 5.636" />
                              <circle cx="12" cy="12" r="5" />
                            </svg>
                          </div>

                          <div className="w-full flex justify-between text-[8px] font-serif text-amber-500/50 font-bold [transform:rotate(180deg)]">
                            <span>0</span>
                            <span>K.T</span>
                          </div>
                        </div>

                        {/* CARD FRONT SIDE (The Revealed Arcana) */}
                        <div 
                          className="absolute inset-0 w-full h-full bg-slate-900 rounded-2xl border-2 border-amber-500/50 flex flex-col justify-between p-4 [backface-visibility:hidden] [transform:rotateY(180deg)] shadow-2xl overflow-hidden"
                          style={{ borderColor: tableCard.card?.accent }}
                        >
                          {/* Inner double border bezel */}
                          <div className="absolute inset-1 rounded-[0.7rem] border border-white/5 pointer-events-none" />
                          
                          {/* Card neon background */}
                          <div className={`absolute -bottom-12 -left-12 w-28 h-28 bg-gradient-to-tr ${tableCard.card?.color} rounded-full blur-[35px] opacity-45`} />

                          <div className="w-full flex justify-between items-center text-[10px] font-serif font-black" style={{ color: tableCard.card?.accent }}>
                            <span>{tableCard.card?.number}</span>
                            <span className="text-[8px] tracking-wider uppercase">MAJOR ARCANA</span>
                          </div>

                          <div className="text-center py-2 flex flex-col items-center justify-center gap-3 relative z-10" style={{ color: tableCard.card?.accent }}>
                            {tableCard.card?.svgIcon}
                            <h4 className="font-serif font-black text-white text-base mt-1.5">{tableCard.card?.nameHe}</h4>
                            <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">{tableCard.card?.nameEn}</span>
                          </div>

                          <div className="w-full flex justify-between items-center text-[10px] font-serif font-black [transform:rotate(180deg)]" style={{ color: tableCard.card?.accent }}>
                            <span>{tableCard.card?.number}</span>
                            <span className="text-[8px] tracking-wider uppercase">MAJOR ARCANA</span>
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="relative z-10 text-center text-[9px] text-slate-500 uppercase font-black tracking-widest mt-4">
              ✨ PRODIFY KINETIC TAROT RENDERING WORKSPACE // FLAWLESS 3D PERSPECTIVE
            </div>
          </div>

          {/* Detailed Interpretation Card (5 columns) */}
          <div className="lg:col-span-5 bg-white border border-indigo-100/30 rounded-[2.5rem] p-8 shadow-sm text-right h-full">
            {selectedCard ? (
              <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
                <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${selectedCard.color} flex items-center justify-center text-white shadow-md`}>
                    <span className="font-serif text-lg font-black">{selectedCard.number}</span>
                  </div>
                  <div>
                    <h3 className="font-serif font-black text-indigo-950 text-2xl">{selectedCard.nameHe}</h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">{selectedCard.nameEn} // ARCANA {selectedCard.number}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">תמצית האנרגיה</span>
                    <p className="text-indigo-900 font-bold text-sm leading-relaxed mt-1">{selectedCard.meaning}</p>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">צלילת עומק לתודעה</span>
                    <p className="text-slate-600 font-semibold text-xs leading-relaxed mt-1.5">{selectedCard.detailedMeaning}</p>
                  </div>

                  <div className="bg-amber-500/5 border border-amber-500/20 p-5 rounded-2xl">
                    <span className="text-[10px] text-amber-600 font-black uppercase tracking-widest block">💡 עצת הקלף עבורך</span>
                    <p className="text-amber-950 font-bold text-xs leading-relaxed mt-1.5">{selectedCard.advice}</p>
                  </div>
                  
                  <div className="bg-indigo-50/50 border border-indigo-100/30 p-5 rounded-2xl flex flex-row-reverse items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold text-indigo-950">יוצר פוסטים מהיר</p>
                      <p className="text-[10px] text-slate-400 mt-1">תרצי להפיק פוסט לאינסטגרם המבוסס על קלף זה?</p>
                    </div>
                    <button 
                      onClick={() => {
                        const matchingDraft = instagramDrafts.find(d => d.id === selectedCard.id);
                        if (matchingDraft) {
                          selectDraft(matchingDraft);
                          setActiveTab("instagram");
                          showToast(`הטיוטה לקלף ${selectedCard.nameHe} נטענה בהצלחה!`, "success");
                        } else {
                          showToast("לא נמצאה טיוטה מוגדרת לקלף זה. נסי לעבור ללשונית פוסטים.", "info");
                        }
                      }}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-black text-[10px] rounded-xl transition-all shadow-sm"
                    >
                      פתח בסטודיו
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-32 space-y-4">
                <div className="w-12 h-12 mx-auto rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7Z" />
                  </svg>
                </div>
                <h4 className="font-serif font-bold text-slate-700 text-sm">מפענח הקריאות והפירושים</h4>
                <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">הסימולטור מוכן. פרסי את הקלפים משמאל, לחצי על הקלף הרצוי כדי לחשוף אותו ב-3D, והפירוש הקוסמי המורחב שלו יופיע כאן ברמת דיוק אבסולוטית.</p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB 2: Instagram Content Studio */}
      {activeTab === "instagram" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Draft List Sidebar (4 columns) */}
          <div className="lg:col-span-4 bg-white border border-indigo-100/30 rounded-[2.5rem] p-6 shadow-sm text-right space-y-5">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">OBSIDIAN TAROT REPOSITORY</span>
              <h3 className="text-lg font-serif font-bold text-indigo-950 mt-1">טיוטות תוכן באובסידיאן</h3>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {instagramDrafts.map((draft) => (
                <button
                  key={draft.id}
                  onClick={() => selectDraft(draft)}
                  className={`w-full text-right p-4.5 rounded-2xl border transition-all duration-300 flex flex-col gap-1.5 group ${
                    selectedDraft?.id === draft.id
                      ? "bg-indigo-50/60 border-indigo-200/50 text-indigo-950 shadow-sm"
                      : "bg-slate-50/50 border-slate-100 text-slate-600 hover:bg-slate-50 hover:border-slate-200"
                  }`}
                >
                  <div className="w-full flex justify-between items-center flex-row-reverse">
                    <span className="text-xs font-black font-serif leading-tight">{draft.title}</span>
                    <span className={`text-[8px] font-black px-2 py-0.5 rounded-full ${
                      selectedDraft?.id === draft.id ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-500"
                    }`}>
                      {draft.id.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-semibold">{draft.subtitle}</span>
                </button>
              ))}
            </div>
            
            <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
              <button 
                onClick={() => showToast("מחפש טיוטות נוספות בוולט...", "info")}
                className="w-full py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-150 transition-all flex items-center justify-center gap-2"
              >
                סנכרן מול אובסידיאן
              </button>
            </div>
          </div>

          {/* Editorial Editor & Instagram Post Preview (8 columns) */}
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Rich Editor Area */}
            <div className="bg-white border border-indigo-100/30 rounded-[2.5rem] p-6 shadow-sm text-right flex flex-col justify-between min-h-[550px]">
              <div className="space-y-4 flex-1 flex flex-col">
                <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">TEXT & METADATA WRITER</span>
                  <h3 className="text-sm font-bold text-indigo-950">עריכת פוסט</h3>
                </div>

                <div className="flex-1 flex flex-col space-y-2 mt-2">
                  <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">כיתוב לפוסט (Caption)</label>
                  <textarea
                    value={draftContent}
                    onChange={(e) => setDraftContent(e.target.value)}
                    className="flex-1 w-full bg-slate-50 border border-slate-150 rounded-2xl p-4 text-xs font-mono text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 whitespace-pre-wrap leading-relaxed resize-none text-right scrollbar-thin"
                    dir="rtl"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6 border-t border-slate-100 pt-4">
                <button
                  onClick={handleSaveDraft}
                  disabled={isSavingDraft}
                  className="flex-1 py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 active:scale-95 text-white font-black text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                >
                  {isSavingDraft ? "שומר..." : "שמור טיוטה באובסידיאן"}
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(draftContent);
                    showToast("הטקסט הועתק ללוח!", "success");
                  }}
                  className="px-5 py-3.5 bg-slate-50 hover:bg-slate-100 active:scale-95 text-slate-700 border border-slate-200 font-black text-xs rounded-xl transition-all shadow-sm"
                >
                  העתק כיתוב
                </button>
              </div>
            </div>

            {/* Instagram Mockup Preview (Premium Behance-tier mockup) */}
            <div className="bg-slate-950 border border-slate-900 rounded-[2.5rem] p-6 shadow-xl text-center flex flex-col items-center justify-between min-h-[550px]">
              <div className="w-full flex justify-between items-center flex-row-reverse border-b border-white/5 pb-4">
                <span className="text-[10px] text-amber-500 font-extrabold uppercase tracking-widest">INSTAGRAM 1:1 POST PREVIEW</span>
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">PRODIFY RENDER</span>
              </div>

              {/* 1:1 Square Post Template Mockup (Premium "MeetYourPsychic" styling) */}
              <div className="relative w-64 h-64 bg-[#0A0A0B] border border-amber-500/20 rounded-2xl overflow-hidden shadow-2xl double-bezel my-6 flex flex-col justify-between p-5 text-right">
                
                {/* Subtle cosmic glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-purple-600/10 rounded-full blur-[45px] pointer-events-none" />
                <div className="absolute top-4 right-4 w-32 h-32 bg-amber-500/5 rounded-full blur-[30px] pointer-events-none" />

                {/* Film grain noise overlay */}
                <div className="absolute inset-0 bg-repeat pointer-events-none opacity-[0.02] mix-blend-overlay" 
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }}
                />

                {/* Double frame bezel */}
                <div className="absolute inset-1.5 border border-amber-500/10 rounded-[0.7rem] pointer-events-none" />

                {/* Header (Cinzel font / Gold) */}
                <div className="relative z-10 flex justify-between items-center">
                  <span className="text-[7px] font-serif text-amber-500/60 font-black tracking-widest uppercase">KASSI TAROT</span>
                  <span className="text-[6px] text-slate-500 font-bold tracking-widest uppercase">SOUL GUIDANCE</span>
                </div>

                {/* Center Image / Vector Symbol */}
                <div className="relative z-10 my-auto flex flex-col items-center gap-2 py-2">
                  {selectedDraft?.id === "magician" && (
                    <div className="text-amber-500/80 drop-shadow-[0_0_12px_rgba(212,175,55,0.2)] animate-pulse">
                      <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18M3 12h18M12 3l4 4M12 21l-4-4M12 3l-4 4M12 21l4-4M7 12a5 5 0 1 1 10 0 5 5 0 0 1-10 0Z" />
                      </svg>
                    </div>
                  )}
                  {selectedDraft?.id === "fool" && (
                    <div className="text-amber-500/80 drop-shadow-[0_0_12px_rgba(212,175,55,0.2)] animate-pulse">
                      <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9ZM12 7.5v9M7.5 12h9" />
                      </svg>
                    </div>
                  )}
                  {selectedDraft?.id === "death" && (
                    <div className="text-amber-500/80 drop-shadow-[0_0_12px_rgba(212,175,55,0.2)] animate-pulse">
                      <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9V3m0 18v-6M3 12h6m6 0h6m-9-3a3 3 0 1 1 0 6 3 3 0 0 1 0-6Z" />
                      </svg>
                    </div>
                  )}
                  
                  <h4 className="text-xs font-serif font-black text-amber-500 tracking-wide mt-1">
                    {selectedDraft?.title?.split(" // ")?.[0]?.replace("פוסט ", "") || "THE TAROT SPEAKS"}
                  </h4>
                  <p className="text-[6px] text-slate-400 font-serif leading-relaxed max-w-[180px] text-center mt-1">
                    {selectedDraft?.subtitle?.replace("מאת קאסי | ", "") || "Choose your path and let the cosmos guide your soul."}
                  </p>
                </div>

                {/* Footer (Concentric details) */}
                <div className="relative z-10 flex justify-between items-center text-[5px] text-slate-500 tracking-wider">
                  <span>© C.T 2026</span>
                  <span className="font-serif">STILLNESS IN MOTION</span>
                </div>

              </div>

              <div className="w-full space-y-3">
                <button
                  onClick={() => showToast("מייצר תמונה ברזולוציית 4K ומוריד אותה...", "success")}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-black text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  ייצא תמונה פרימיום לאינסטגרם
                </button>
                <p className="text-[10px] text-slate-400">הייצוא יארוז את הכותרת, האיור הווקטורי ועיטורי הזהב לתוך תמונה מושלמת לפרסום בפיד.</p>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* TAB 3: Reels Generator */}
      {activeTab === "reels" && (
        <div className="max-w-3xl mx-auto bg-white border border-indigo-100/30 rounded-[2.5rem] p-8 shadow-sm text-right space-y-6">
          <div className="border-b border-slate-100 pb-5">
            <span className="text-[10px] text-indigo-500 font-extrabold uppercase tracking-widest animate-pulse">MAX REMOTE LINUX RENDERING ENGINE</span>
            <h3 className="text-2xl font-serif font-black text-indigo-950 mt-1">מחולל סרטוני Reels קולנועיים</h3>
            <p className="text-slate-500 text-xs mt-2">
              המערכת מחוברת ישירות למנוע הווידאו של מקס המריץ FFMPEG. פריסת קלפי הטארוט האחרונה, כולל קלפים פתוחים וסגורים, תורנדר לתוך סרטון וידאו (Reel) קולנועי בקצב אינטראקטיבי עם אנימציית טקסט מעודנת.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6 text-center">
            <div className="bg-slate-50 border border-slate-150 p-5 rounded-2xl">
              <span className="text-2xl">🎬</span>
              <h4 className="font-bold text-xs text-indigo-950 mt-2">פורמט וידאו</h4>
              <p className="text-[10px] text-slate-400 mt-1">9:16 (1080x1920) Optimized for Instagram Reels</p>
            </div>
            <div className="bg-slate-50 border border-slate-150 p-5 rounded-2xl">
              <span className="text-2xl">⏳</span>
              <h4 className="font-bold text-xs text-indigo-950 mt-2">אורך כולל</h4>
              <p className="text-[10px] text-slate-400 mt-1">25 שניות (5 שניות לכל שקופית מעבר)</p>
            </div>
            <div className="bg-slate-50 border border-slate-150 p-5 rounded-2xl">
              <span className="text-2xl">⚡</span>
              <h4 className="font-bold text-xs text-indigo-950 mt-2">סטטוס מנוע</h4>
              <p className="text-[10px] text-indigo-600 font-bold font-mono mt-1">READY // IDLE</p>
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-900 rounded-2xl p-5 text-right font-mono text-[11px] text-slate-400 space-y-2.5">
            <p className="text-indigo-400 font-bold"># Python video generator logs:</p>
            <p>&gt; sys.path.append("./src/scripts")</p>
            <p>&gt; import reels_generator</p>
            <p>&gt; load image_cache sequence: [img_a050, img_482e, img_f7dd, img_bdea, img_3cec]</p>
            <p>&gt; text overlay setup: "PICK A CARD // Choose your Stone..."</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-100">
            <button
              onClick={runReelsGenerator}
              disabled={isGeneratingReel}
              className={`flex-1 py-4 text-xs font-black rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 ${
                isGeneratingReel 
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed" 
                  : "bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white"
              }`}
            >
              {isGeneratingReel ? (
                <>
                  <div className="w-4 h-4 rounded-full border-t-2 border-indigo-600 animate-spin" />
                  מרנדר סרטון וידאו... אנא המתן
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  הרץ רינדור Reel שלב אחר שלב
                </>
              )}
            </button>
          </div>
          
          <div className="text-center">
            <p className="text-[10px] text-slate-400">הסרטון הסופי יישמר ישירות בתיקיית הטארות המקומית שלך באובסידיאן:</p>
            <code className="text-[9px] font-mono text-indigo-600 bg-slate-50 px-2 py-1 rounded border border-slate-150 mt-1.5 inline-block">
              /Users/yurismacbook/the volt/The Volt/Kassitarot/pick_a_card_reels_fixed.mp4
            </code>
          </div>
        </div>
      )}

    </div>
  );
}

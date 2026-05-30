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
  image: string;
  accent: string;
}

interface BlogPost {
  id: string;
  titleHe: string;
  category: string;
  date: string;
  readTime: string;
  summary: string;
  content: string;
}

export default function KassiTarotSite() {
  const [activeCard, setActiveCard] = useState<TarotCard | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  
  // Blog-related state
  const [selectedArticle, setSelectedArticle] = useState<BlogPost | null>(null);

  // Booking states
  const [bookingName, setBookingName] = useState("");
  const [bookingEmail, setBookingEmail] = useState("");
  const [bookingQuestion, setBookingQuestion] = useState("");
  const [bookingSpread, setBookingSpread] = useState("weekly");
  const [bookingStatus, setBookingStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  // Premium Tarot Card Database - Mapped to real high-res Rider-Waite assets in public symlink
  const tarotCards: TarotCard[] = [
    {
      id: "fool",
      nameHe: "השוטה",
      nameEn: "The Fool",
      number: "0",
      meaning: "התחלות חדשות, אמון קוסמי, שחרור שליטה, וצעידה אמיצה אל הלא נודע.",
      detailedMeaning: "השוטה מייצג את הארכיטיפ של הנשמה שיוצאת למסע חייה ללא דעות קדומות או פחדים מעכבים. הוא עומד על קצה המצוק, מוכן לקפוץ מדרגה - לא מתוך טיפשות, אלא מתוך הבנה אינטואיטיבית עמוקה שהיקום תמיד יפרוס תחתיו רשת ביטחון. קלף זה מזמין אותך לשחרר את הצורך בשליטה נוקשה, לסמוך על התהליך ולפתוח דף חדש ונקי.",
      advice: "תעשי קפיצת אמונה. תשחררי את הדפוסים הישנים שהגבילו אותך והרשי לעצמך להיות שוב חובבנית שיוצרת התחלה מרהיבה.",
      image: "/tarot-deck/tarot-major-0-42043244c79fc1b1.jpg",
      accent: "#D4AF37"
    },
    {
      id: "magician",
      nameHe: "הקוסם",
      nameEn: "The Magician",
      number: "I",
      meaning: "יצירת יש מאין, כוח הרצון, מיקוד מנטלי ומימוש מלא של הפוטנציאל הטמון בך.",
      detailedMeaning: "הקוסם הוא המאסטר של החומר והרוח. על שולחנו מונחים ארבעת יסודות היקום: המטבע (חומר), המטה (רצון ותשוקה), הגביע (רגש) והחרב (אינטלקט). קלף זה מעיד שיש לך ברגע זה את כל הכלים, הכישרונות והמשאבים הנדרשים כדי לממש את שאיפותייך. החיבור בין מודעות עליונה לפעולה ארצית הוא המפתח ליצירת הקסם האישי שלך.",
      advice: "אל תמתיני לתזמון מושלם חיצוני - יש לך את כל מה שצריך כבר עכשיו. רכזי את הפוקוס ותתחילי לפעול באופן ממוקד.",
      image: "/tarot-deck/tarot-major-1-6476367511504b5f.jpg",
      accent: "#C5A85C"
    },
    {
      id: "high-priestess",
      nameHe: "הכוהנת הגדולה",
      nameEn: "The High Priestess",
      number: "II",
      meaning: "אינטואיציה עמוקה, תת-מודע, ידע נסתר וחיבור לקול הפנימי השקט.",
      detailedMeaning: "הכוהנת הגדולה יושבת בשער המקדש, בין עמוד האור לעמוד החושך, ומחזיקה בידה את מגילת הסודות. היא אינה פועלת בעולם החיצוני, אלא מזמינה אותך לפנות פנימה - אל המים העמוקים של התת-מודע והאינטואיציה. קלף זה מסמן שהתשובות שאת מחפשת אינן נמצאות בהיגיון הקר או בעצות של אחרים, אלא בידע הפנימי שכבר קיים בך.",
      advice: "השקיטי את רעשי הרקע. פני זמן להתבודדות, מדיטציה או כתיבה ביומן, והקשיבי לקול העדין והמדוייק שמנחה אותך מבפנים.",
      image: "/tarot-deck/tarot-major-2-a6def1e2445cdf9f.jpg",
      accent: "#B89742"
    },
    {
      id: "empress",
      nameHe: "הקיסרית",
      nameEn: "The Empress",
      number: "III",
      meaning: "שפע קוסמי, נשיות מעצימה, יצירתיות שופעת, הזנה וצמיחה אורגנית.",
      detailedMeaning: "הקיסרית היא אמא אדמה, התגלמות השפע והבריאה האורגנית ביקום. היא מזכירה לך שהחיים פועלים במחזוריות טבעית ושלא ניתן לזרז צמיחה אמיתית בכוח. קלף זה מעניק לך השראה ליצור, לחבר בין הלב לידיים, להזין את הגוף והנפש בשפע, ולהתחבר לאנרגיות של פוריות, קבלה ואהבה ללא תנאי.",
      advice: "תני אמון בקצב הצמיחה הטבעי של הדברים. הרשי לעצמך ליהנות מהחושים, להתחבר לטבע וליצור מתוך מקום של שפע וקבלה.",
      image: "/tarot-deck/tarot-major-3-85cd590a7e0e6ec7.jpg",
      accent: "#D4AF37"
    },
    {
      id: "lovers",
      nameHe: "האוהבים",
      nameEn: "The Lovers",
      number: "VI",
      meaning: "בחירות משמעותיות מתוך הלב, הרמוניה פנימית, שותפות ואיזון ניגודים.",
      detailedMeaning: "מעבר לזוגיות ורומנטיקה, קלף האוהבים הוא קלף של קבלת החלטות גורליות ובחירה בנתיב הנכון לנשמתך. הוא מייצג את האיחוד בין ההיגיון לרגש, ואת הצורך להגיע להרמוניה פנימית לפני שאנו פונים החוצה. הבחירה המיוצגת בקלף אינה נעשית מתוך פחד או שיקולי כדאיות קרים, אלא מתוך אמת פנימית עמוקה שמחוברת ללב.",
      advice: "עמדי בפני החלטותייך ביושר מוחלט. בחרי בנתיב שמחבר אותך לעצמך, ותפעלי מתוך אהבה והרמוניה פנימית.",
      image: "/tarot-deck/tarot-major-6-3baa3420cca38224.jpg",
      accent: "#C5A85C"
    },
    {
      id: "wheel",
      nameHe: "גלגל המזל",
      nameEn: "The Wheel of Fortune",
      number: "X",
      meaning: "מחזוריות החיים, גורל, שינויים בלתי צפויים ומציאת העוגן בתוך הסערה.",
      detailedMeaning: "גלגל המזל מזכיר לנו שהדבר היחיד שקבוע ביקום הוא השינוי עצמו. החיים נעים במחזוריות של גאות ושפל, אור וחושך. החוכמה הרוחנית הטמונה בקלף זה היא לא לנסות לעצור את סיבוב הגלגל או להילחם ברוח, אלא למצוא את המרכז השקט והיציב שלו - את המהות העמוקה שבך שאינה מושפעת מהטלטלות החיצוניות.",
      advice: "קבלי את המחזוריות הנוכחית של חייך באהבה. שחררי את השליטה על מה שאינו בידייך, והתמקדי בחיזוק השקט הפנימי שלך.",
      image: "/tarot-deck/tarot-major-10-6600306b7ecf8a76.jpg",
      accent: "#B58C3D"
    },
    {
      id: "death",
      nameHe: "המוות",
      nameEn: "The Death",
      number: "XIII",
      meaning: "טרנספורמציה עמוקה, שחרור דפוסים ישנים, סוף מבורך שהוא התחלה חדשה מרהיבה.",
      detailedMeaning: "קלף המוות הוא אחד הקלפים המפוארים והמעצימים ביותר בטארוט. הוא אינו מעיד על מוות פיזי, אלא על סיום קארמי הכרחי של שלב, קשר או דפוס שכבר אינו משרת את התפתחותך. על ידי הנחת הישן ומתן רשות לעלים היבשים לנשור, את מפנה מקום אמיתי לפריחה חדשה, מרהיבה ומדוייקת הרבה יותר שממתינה לך באופק.",
      advice: "אל תאחזי בכוח במה שכבר הסתיים. שחררי באהבה ובהודיה, והרשי לטרנספורמציה העמוקה לנקות את חייך עבור החדש.",
      image: "/tarot-deck/tarot-major-13-23b8be15633f8945.jpg",
      accent: "#7B2CBF"
    },
    {
      id: "sun",
      nameHe: "השמש",
      nameEn: "The Sun",
      number: "XIX",
      meaning: "חיוניות מתפרצת, בהירות מנטלית, הצלחה מסחררת, שמחה טהורה ואמת קורנת.",
      detailedMeaning: "השמש היא התגלמות האור, החום והבהירות המוחלטת. לאחר המסעות בנתיבי החושך והתת-מודע, השמש זורחת ומאירה את דרכך באמת צרופה. היא מייצגת חיוניות פיזית ומנטלית גבוהה, תחושת שחרור וביטחון עצמי אבסולוטי. כל מה שהיה מעורפל או ספק ספיקא מקבל תחת אור השמש בהירות והבנה עמוקה המאפשרת פריחה והצלחה.",
      advice: "זה הזמן לקרון בביטחון ולחגוג את השפע בחייך. אל תקטיני את עצמך - תני לאור הפנימי שלך להאיר את העולם ללא פילטרים.",
      image: "/tarot-deck/tarot-major-19-d40d8ea7f0c0c263.jpg",
      accent: "#D4AF37"
    }
  ];

  // Premium Blog Articles Dataset
  const blogPosts: BlogPost[] = [
    {
      id: "art-1",
      category: "פסיכולוגיה וטארוט",
      date: "28 במאי 2026",
      readTime: "5 דק' קריאה",
      titleHe: "למה קלף המוות הוא בעצם הברכה הגדולה ביותר של חייך",
      summary: "הבנת קלף המוות כסמל לטרנספורמציה, שחרור עומסים, וניקוי קארמי המאפשר פריחה מחודשת ומפוארת.",
      content: `כשקלף המוות (Death) עולה בפריסת טארוט, רוב האנשים חווים רתיעה אינסטינקטיבית. השלד הניבט מהקלף, הצבעים הכהים והאסוציאציה למילה 'מוות' מייצרים מיד חרדה. 
אך האמת בעולם הטארוט הפוכה לחלוטין: קלף המוות הוא אחת הברכות המפוארות ביותר שיכולות להופיע בדרך שלך.

בטארוט, המוות אינו פיזי – הוא סימבולי. הוא מייצג את החוק הקוסמי הגדול ביותר של הבריאה: **אי אפשר לברוא משהו חדש בלי לפנות לו מקום.** המוות הוא השלכת העלים היבשים בסתיו, הפירוק של הקיים כדי להפוך לדשן שממנו יצמח האביב הבא.

אם את נאחזת בכוח במערכת יחסים שסחטה את נשמתך, בעבודה שכבר אינה מפרה אותך, או בדפוס מחשבה שמקטין אותך ונובע מחרדה – את חוסמת את הנסים שהיקום מנסה להביא לחייך. קלף המוות מגיע ואומר לך בעדינות אך בנחישות: **די. הגיע הזמן לשחרר.**

**איך לעבוד עם האנרגיה הזו השבוע?**
1. **כתיבה ביומן:** שאלי את עצמך – מה הדבר שאני נאחזת בו רק מתוך פחד משינוי, למרות שאני יודעת שהאנרגיה שלו כבר גוועה?
2. **טקסיות של שחרור:** תני לעצמך רשות לבכות את מה שהיה, להוקיר תודה על השיעור שהוא הביא, ולשחרר אותו באהבה. השמש כבר עולה באופק שמאחורי שני המגדלים בקלף. המוות מפנה את הדרך לזריחה המרהיבה של קלף השמש הניבט בהמשך המסע שלך.`
    },
    {
      id: "art-2",
      category: "רוחניות מודרנית",
      date: "14 במאי 2026",
      readTime: "4 דק' קריאה",
      titleHe: "הטארוט כראי פסיכולוגי: המעבר מחיזוי פסיבי לבוראות פעילה",
      summary: "איך להפסיק להשתמש בקלפים כמנבאי עתידות פסיביים, ולהפוך אותם לכלי טיפולי ופסיכולוגי לבוראות מציאות.",
      content: `במשך מאות שנים נתפסו קלפי הטארוט ככלי מיסטי שנועד לנבא עתידות באופן פסיבי: 'האם הוא יחזור אלי?', 'מתי אקבל כסף?', 'האם אצליח במבחן?'. 
הבעיה בגישה הזו היא שהיא לוקחת ממך את הכוח הכי גדול שלך – את ה**בחירה החופשית (Free Will)** ואת היותך בוראת המציאות של חייך.

בגישה המודרנית והטיפולית שאני מובילה, אנו מתייחסים לטארוט כאל **ראי פסיכולוגי ארכיטיפי**. הקלפים אינם קובעים את העתיד שלך באופן שרירותי, אלא מציגים תמונה מדוייקת של התת-מודע שלך, של הפחדים, השאיפות והאנרגיות שפעילות אצלך ברגע זה ממש.

כשאת פותחת קלף, הדימויים הויזואליים העשירים שלו עוקפים את מנגנוני ההגנה הרציונליים של המוח ומחברים אותך ישר לרגש ולאמת הפנימית שלך. קלף לא אומר לך 'זה מה שיקרה', אלא 'זו הדינמיקה שאת מייצרת כרגע – אם תמשיכי לפעול מתוך הפחד הזה, זה הנתיב שיווצר. אם תבחרי לשנות את התודעה שלך, העתיד ישתנה בהתאם'.

זהו מעבר דרמטי מתפיסה של קורבן של הגורל – לתפיסה של יוצרת פעילה שאוחזת בהגה של חייה.`
    },
    {
      id: "art-3",
      category: "כלים מעשיים",
      date: "05 במאי 2026",
      readTime: "3 דק' קריאה",
      titleHe: "3 שאלות התבוננות בהשראת אנרגיית הקוסם (The Magician)",
      summary: "תרגיל כתיבה עוצמתי ליומן שיסייע לך למפות את הכישרונות שלך ולפעול ללא דיחוי.",
      content: `אנרגיית הקוסם (The Magician) היא האנרגיה הממוקדת ביותר של המניפסטציה והעשייה האקטיבית. הקוסם אינו ממתין שדברים יקרו לו – הוא מרכז את כוח הרצון, רותם את הכלים שברשותו ומייצר מציאות.

הקוסם מזכיר לנו שלפעמים אנו נכנסים למעגלים אינסופיים של תכנון, קריאת עוד ספר, עשיית עוד קורס והמתנה לתחושת 'מוכנות' דמיונית. אך האמת היא שהמוכנות נוצרת רק תוך כדי תנועה ועשייה.

כדי להתחבר לאנרגיה הזו השבוע, קחי מחברת, הדליקי נר, וכתבי תשובות כנות ל-3 השאלות הבאות:
1. **מיפוי יסודות:** מהם 4 המשאבים או הכישרונות שיש לי כבר עכשיו (למשל: סבלנות, יכולת הקשבה, חוש עיצובי, קשרים חברתיים)? כיצד אוכל להשתמש בהם יחד השבוע?
2. **חסימת הדליפות:** איזה פחד מונע ממני לפעול כרגע, ואיך אוכל להפוך את הפחד הזה לתוכנית פעולה קטנה וממוקדת?
3. **הצעד של הקוסם:** מהו הצעד הפרקטי הקטן ביותר (צעד של 10 דקות) שאני יכולה לעשות כבר היום כדי להניע את הפרויקט או השאיפה שלי קדימה?`
    }
  ];

  // Shuffling Deck Action with elite visual haptic feedback
  const triggerShufflingAnimation = () => {
    setActiveCard(null);
    setIsFlipped(false);
    setIsShuffling(true);
    
    // Simulate real high-end kinetic shuffle
    setTimeout(() => {
      setIsShuffling(false);
      // Select random card
      const random = tarotCards[Math.floor(Math.random() * tarotCards.length)];
      setActiveCard(random);
      setIsFlipped(true);
    }, 1800); // 1.8 seconds of beautiful kinetic card shuffling
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingName.trim() || !bookingEmail.trim()) return;

    setBookingStatus("submitting");

    try {
      const res = await fetch("/api/dashboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "createTask",
          notePath: "Tarot/Instagram_Content_Hub.md",
          taskText: `פנייה חדשה באתר קאסי טארוט: ${bookingName} (${bookingEmail}) - סגנון פריסה: ${bookingSpread} - שאלה לקלפים: "${bookingQuestion}"`
        })
      });
      const data = await res.json();

      if (data.success) {
        setBookingStatus("success");
        setBookingName("");
        setBookingEmail("");
        setBookingQuestion("");
      } else {
        setBookingStatus("error");
      }
    } catch (error) {
      setBookingStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-[#07050E] text-white font-sans selection:bg-[#D4AF37]/20 relative overflow-x-hidden antialiased">
      
      {/* Cinematic Ambient Stars & Grids */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/20 via-slate-950 to-black pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-15 pointer-events-none z-0" />

      {/* Film Grain Noise Background Overlay */}
      <div 
        className="fixed inset-0 bg-repeat pointer-events-none opacity-[0.015] mix-blend-overlay z-50" 
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }}
      />

      {/* Luxury Navigation Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-8 flex flex-row-reverse justify-between items-center border-b border-white/5 relative z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full border border-[#D4AF37]/40 flex items-center justify-center font-serif text-[#D4AF37] font-semibold text-xs shadow-[0_0_15px_rgba(212,175,55,0.1)]">
            C
          </div>
          <span className="font-serif font-black tracking-[0.2em] text-sm uppercase text-white bg-clip-text text-transparent bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#C5A85C]">KASSI TAROT</span>
        </div>
        
        <nav className="hidden md:flex gap-8 text-xs font-bold tracking-widest text-indigo-200/55 uppercase">
          <a href="#booking" className="hover:text-[#D4AF37] transition-colors">תיאום קריאה</a>
          <a href="#blog" className="hover:text-[#D4AF37] transition-colors">בלוג רוחני</a>
          <a href="#about" className="hover:text-[#D4AF37] transition-colors">הגישה המודרנית</a>
          <a href="#draw" className="hover:text-[#D4AF37] transition-colors">מקדש הקלפים</a>
          <a href="#" className="text-[#C5A85C] border-b border-[#D4AF37]/50 pb-1">ראשי</a>
        </nav>

        <a 
          href="#booking"
          className="px-6 py-2.5 rounded-full border border-[#D4AF37]/30 text-[10px] uppercase font-black tracking-widest text-[#C5A85C] hover:bg-[#D4AF37]/10 active:scale-95 transition-all shadow-[0_4px_20px_rgba(212,175,55,0.05)]"
        >
          BOOK A READING
        </a>
      </header>

      {/* HERO SECTION */}
      <section className="relative w-full max-w-7xl mx-auto px-6 pt-12 md:pt-20 pb-16 text-center z-30">
        
        {/* Load Luxury Google Fonts */}
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Cormorant+Garamond:ital,wght@0,300;0,500;0,700;1,400&family=Montserrat:wght@300;400;700&display=swap" rel="stylesheet" />

        {/* Custom Inline CSS for premium animations, bypasses hydration issues */}
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes float-gentle {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-12px) rotate(3deg); }
          }
          @keyframes float-reverse {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(12px) rotate(-3deg); }
          }
          @keyframes orbit-slow {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes orbit-reverse {
            0% { transform: rotate(360deg); }
            100% { transform: rotate(0deg); }
          }
          @keyframes plasma-glow {
            0%, 100% { transform: scale(1); filter: drop-shadow(0 0 15px rgba(123, 44, 191, 0.4)) blur(1px); }
            50% { transform: scale(1.03); filter: drop-shadow(0 0 30px rgba(212, 175, 55, 0.6)) blur(0px); }
          }
          @keyframes star-pulse {
            0%, 100% { opacity: 0.3; transform: scale(0.8); }
            50% { opacity: 1; transform: scale(1.2); }
          }
          .animate-float {
            animation: float-gentle 8s ease-in-out infinite;
          }
          .animate-float-reverse {
            animation: float-reverse 9s ease-in-out infinite;
          }
          .animate-orbit-slow {
            animation: orbit-slow 50s linear infinite;
          }
          .animate-orbit-reverse {
            animation: orbit-reverse 70s linear infinite;
          }
          .animate-plasma {
            animation: plasma-glow 5s ease-in-out infinite;
          }
          .animate-star {
            animation: star-pulse 3s ease-in-out infinite;
          }
          .font-cinzel {
            font-family: 'Cinzel', serif;
          }
          .font-cormorant {
            font-family: 'Cormorant Garamond', serif;
          }
        `}} />

        {/* Soft Cosmic Lights */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-indigo-950/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[450px] h-[450px] bg-purple-950/10 rounded-full blur-[100px] pointer-events-none" />

        {/* Floating Astrological Glyphs (Pixel-accurate matching the image) */}
        {/* Pisces (Top Left) */}
        <div className="absolute top-10 left-10 md:left-24 text-[#D4AF37]/40 animate-float pointer-events-none z-10">
          <svg className="w-10 h-10 filter drop-shadow-[0_0_10px_rgba(212,175,55,0.2)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M4 4c6 4 6 12 0 16M20 4c-6 4-6 12 0 16M2 12h20" strokeLinecap="round" />
          </svg>
        </div>

        {/* Scorpio (Left Mid) */}
        <div className="absolute top-1/2 left-4 md:left-16 text-[#C5A85C]/30 animate-float-reverse pointer-events-none z-10" style={{ animationDelay: "2s" }}>
          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M4 6v10a2 2 0 002 2h2m0-12v12m4-12v8a2 2 0 004 0V6m0 0a2 2 0 014 0v10a2 2 0 002 2h2M18 14l3 3m0 0l-3 3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {/* Sagittarius (Bottom Left) */}
        <div className="absolute bottom-20 left-12 md:left-28 text-[#D4AF37]/35 animate-float pointer-events-none z-10" style={{ animationDelay: "4s" }}>
          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M3 21l18-18m0 0H14m7 0v7M6.5 17.5l6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {/* Libra (Right Mid) */}
        <div className="absolute top-1/3 right-6 md:right-20 text-[#C5A85C]/35 animate-float pointer-events-none z-10" style={{ animationDelay: "1s" }}>
          <svg className="w-9 h-9 filter drop-shadow-[0_0_8px_rgba(212,175,55,0.15)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M5 16h14M3 20h18M12 4v12M8 8a4 4 0 018 0" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {/* Gemini (Right Bottom) */}
        <div className="absolute bottom-1/4 right-8 md:right-24 text-[#D4AF37]/30 animate-float-reverse pointer-events-none z-10" style={{ animationDelay: "3s" }}>
          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M5 4h14M5 20h14M9 4v16M15 4v16" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {/* Astro/Zodiac Sky Map rotating behind header */}
        <div className="absolute top-[-50px] left-1/2 -translate-x-1/2 w-[550px] h-[550px] border border-white/5 rounded-full animate-orbit-slow pointer-events-none z-0">
          <div className="absolute inset-4 border border-[#D4AF37]/5 rounded-full animate-orbit-reverse" />
          <div className="absolute inset-16 border border-white/5 rounded-full" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#D4AF37]/20 rounded-full" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#D4AF37]/20 rounded-full" />
        </div>

        {/* HEADER TEXTS */}
        <div className="relative max-w-4xl mx-auto space-y-4 z-10 mb-12">
          <div className="flex items-center justify-center gap-1.5 mb-1 text-[10px] tracking-[0.4em] font-extrabold text-slate-400">
            <span>+</span>
            <span className="font-cinzel">INTUITIVE GUIDANCE</span>
            <span>+</span>
          </div>
          
          <h1 className="text-5xl md:text-8xl font-cinzel font-black tracking-[0.1em] text-white leading-none relative">
            <span className="bg-clip-text text-transparent bg-gradient-to-b from-[#FAF7F0] via-[#F3E5AB] to-[#C5A85C] filter drop-shadow-[0_4px_12px_rgba(212,175,55,0.15)]">KASSI TAROT</span>
          </h1>
          
          <div className="flex items-center justify-center gap-3 text-[10px] md:text-xs tracking-[0.25em] font-bold text-[#D4AF37] uppercase font-cinzel">
            <span>✦ INSIGHT</span>
            <span>✦ CLARITY</span>
            <span>✦ DESTINY ✦</span>
          </div>
        </div>

        {/* THREE COLUMN GRID - RECREATING SCREENSHOT WITH LUXURY METRIC PERFECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-6xl mx-auto relative z-20">
          
          {/* COLUMN 1: LEFT MENU CARD (TAROT READINGS) */}
          <div className="lg:col-span-3 text-right">
            <div className="bg-[#110925]/60 backdrop-blur-xl border border-white/5 p-6 rounded-[2.5rem] double-bezel shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative group hover:border-[#D4AF37]/20 transition-all duration-700">
              {/* Corner lights */}
              <div className="absolute top-4 right-4 w-1 h-1 bg-[#D4AF37]/40 rounded-full animate-pulse" />
              <div className="absolute bottom-4 left-4 w-1 h-1 bg-[#D4AF37]/40 rounded-full animate-pulse" />
              
              <div className="border-b border-[#D4AF37]/15 pb-4 mb-4 text-center">
                <span className="font-cinzel text-xs font-black tracking-[0.2em] text-[#C5A85C]">TAROT READINGS</span>
              </div>
              
              <ul className="space-y-4 font-cinzel text-xs font-bold tracking-[0.15em] text-slate-300">
                <li onClick={() => {
                  setBookingSpread("love");
                  document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" });
                }} className="flex flex-row-reverse items-center gap-2 cursor-pointer py-1 px-2.5 rounded-lg hover:bg-[#D4AF37]/10 hover:text-white transition-all border border-transparent hover:border-[#D4AF37]/20">
                  <span className="text-[#D4AF37] text-[10px]">♡</span>
                  <span>LOVE</span>
                </li>
                <li onClick={() => {
                  setBookingSpread("career");
                  document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" });
                }} className="flex flex-row-reverse items-center gap-2 cursor-pointer py-1 px-2.5 rounded-lg hover:bg-[#D4AF37]/10 hover:text-white transition-all border border-transparent hover:border-[#D4AF37]/20">
                  <span className="text-[#D4AF37] text-[10px]">✦</span>
                  <span>CAREER</span>
                </li>
                <li onClick={() => {
                  setBookingSpread("cross");
                  document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" });
                }} className="flex flex-row-reverse items-center gap-2 cursor-pointer py-1 px-2.5 rounded-lg hover:bg-[#D4AF37]/10 hover:text-white transition-all border border-transparent hover:border-[#D4AF37]/20">
                  <span className="text-[#D4AF37] text-[10px]">☉</span>
                  <span>SOUL PATH</span>
                </li>
                <li onClick={() => {
                  setBookingSpread("weekly");
                  document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" });
                }} className="flex flex-row-reverse items-center gap-2 cursor-pointer py-1 px-2.5 rounded-lg hover:bg-[#D4AF37]/10 hover:text-white transition-all border border-transparent hover:border-[#D4AF37]/20">
                  <span className="text-[#D4AF37] text-[10px]">☾</span>
                  <span>LIFE PURPOSE</span>
                </li>
              </ul>
            </div>
          </div>

          {/* COLUMN 2: CENTER PIECE (GLOWING INTERACTIVE CRYSTAL BALL) */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center py-6">
            
            {/* The Magic Sphere Area */}
            <div className="relative w-72 h-72 flex items-center justify-center">
              
              {/* Backglow Ambient Orb */}
              <div className="absolute inset-0 bg-radial-gradient from-purple-800/20 to-transparent rounded-full blur-[40px] pointer-events-none scale-90" />
              
              {/* Astronomical Rings Rotating Around Sphere */}
              <div className="absolute w-[260px] h-[260px] border border-[#D4AF37]/25 rounded-full animate-orbit-slow pointer-events-none z-10 opacity-70">
                <div className="absolute top-2 left-1/4 w-1.5 h-1.5 bg-[#F3E5AB] rounded-full animate-ping" />
              </div>
              <div className="absolute w-[230px] h-[230px] border border-white/5 rounded-full animate-orbit-reverse pointer-events-none z-10" />

              {/* THE CRYSTAL BALL BUTTON (Fully Interactive) */}
              <div 
                onClick={triggerShufflingAnimation}
                className="relative w-52 h-52 md:w-56 md:h-56 rounded-full cursor-pointer group flex items-center justify-center z-20"
              >
                {/* Rotating Astrological Border */}
                <div className="absolute inset-0 border-2 border-dashed border-[#D4AF37]/35 rounded-full animate-orbit-slow group-hover:scale-105 transition-all duration-700" />
                
                {/* Outer Glass Rim */}
                <div className="absolute inset-2 border border-white/10 rounded-full shadow-[inset_0_0_20px_rgba(255,255,255,0.1)] group-hover:scale-102 transition-all duration-500" />
                
                {/* Purple Plasma/Core Sphere */}
                <div className="absolute inset-3 bg-gradient-to-tr from-[#0F0825] via-[#480CA8]/30 to-[#7B2CBF]/40 rounded-full backdrop-blur-md animate-plasma flex items-center justify-center overflow-hidden">
                  
                  {/* Energy Sparkles inside sphere */}
                  <div className="absolute w-2 h-2 bg-white rounded-full animate-ping opacity-60" style={{ animationDuration: "1.5s" }} />
                  <div className="absolute w-1 h-1 bg-[#D4AF37] rounded-full animate-ping opacity-40 top-1/3 left-1/3" style={{ animationDuration: "2.5s" }} />
                  <div className="absolute w-1.5 h-1.5 bg-purple-400 rounded-full animate-ping opacity-50 bottom-1/3 right-1/4" style={{ animationDuration: "2s" }} />
                  
                  {/* Dynamic Glowing Core */}
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 blur-xl opacity-60 animate-pulse" />
                  
                  {/* Neon Purple Plasma Flame Effector */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#7B2CBF]/20 via-transparent to-transparent animate-star" />
                </div>

                {/* Central Sigil/Prompt Icon */}
                <div className="relative z-30 flex flex-col items-center justify-center text-center text-[#F3E5AB]/90 group-hover:text-white transition-all">
                  <svg className="w-12 h-12 filter drop-shadow-[0_0_15px_rgba(212,175,55,0.4)] transition-transform duration-700 group-hover:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="0.5">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 3v18M3 12h18M8 8l8 8" />
                  </svg>
                  <span className="font-cinzel text-[9px] tracking-[0.2em] font-extrabold mt-3 text-[#D4AF37]/80 group-hover:text-[#F3E5AB] transition-colors uppercase">Tap For Guidance</span>
                </div>
              </div>

            </div>

            {/* Tap indicator trigger */}
            <p className="text-[#D4AF37] font-cinzel text-[10px] tracking-[0.2em] font-black uppercase mt-1 animate-pulse pointer-events-none">
              — {isShuffling ? "Consulting Arcana..." : "TAP CRYSTAL BALL TO SHUFFLE"} —
            </p>
          </div>

          {/* COLUMN 3: RIGHT JOURNEY CARD */}
          <div className="lg:col-span-3 flex justify-center lg:justify-start">
            <div className="relative w-52 h-52 flex items-center justify-center">
              
              {/* Outer Golden Astro Compass */}
              <div className="absolute inset-0 border border-[#D4AF37]/20 rounded-full animate-orbit-slow pointer-events-none">
                {/* Tiny zodiac ticks */}
                <div className="absolute top-0 left-1/2 w-0.5 h-2 bg-[#D4AF37]/30 -translate-x-1/2" />
                <div className="absolute bottom-0 left-1/2 w-0.5 h-2 bg-[#D4AF37]/30 -translate-x-1/2" />
                <div className="absolute left-0 top-1/2 w-2 h-0.5 bg-[#D4AF37]/30 -translate-y-1/2" />
                <div className="absolute right-0 top-1/2 w-2 h-0.5 bg-[#D4AF37]/30 -translate-y-1/2" />
              </div>
              <div className="absolute inset-4 border border-dashed border-[#C5A85C]/15 rounded-full animate-orbit-reverse pointer-events-none" />
              <div className="absolute inset-10 border border-white/5 rounded-full pointer-events-none" />

              {/* Text Core Content */}
              <div className="relative z-10 text-center font-cinzel space-y-2">
                <span className="text-[10px] text-[#C5A85C] font-extrabold tracking-[0.25em] block uppercase">YOUR JOURNEY</span>
                <span className="text-[9px] text-slate-500 font-bold block uppercase">— UNFOLDS —</span>
                <p className="text-white font-extrabold text-sm tracking-[0.1em] leading-snug uppercase">
                  ONE CARD<br />
                  AT A TIME
                </p>
              </div>

            </div>
          </div>

        </div>

        {/* BOTTOM TEXT */}
        <div className="relative max-w-xl mx-auto text-center z-10 mt-12">
          <div className="flex items-center justify-center gap-2 text-[10px] tracking-[0.35em] font-extrabold text-slate-400 font-cinzel">
            <span>+</span>
            <span>TRUST THE MAGIC WITHIN</span>
            <span>+</span>
          </div>
        </div>

      </section>


      {/* CORE EXPERIENCE: DRAW A CARD (סימולטור הטארוט האינטראקטיבי) */}
      <section id="draw" className="relative w-full max-w-7xl mx-auto px-6 py-24 border-t border-white/5 z-30">
        <div className="absolute top-1/2 right-10 w-96 h-96 bg-indigo-900/5 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="text-center max-w-xl mx-auto space-y-3 mb-16">
          <span className="text-[10px] text-[#D4AF37] font-extrabold uppercase tracking-widest">INTERACTIVE CELESTIAL SHUFFLE</span>
          <h2 className="text-3xl md:text-5xl font-serif font-black text-white">משכי את קלף השבוע שלך</h2>
          <p className="text-indigo-200/50 text-xs md:text-sm font-semibold leading-relaxed">
            התרכזי בשאלה שמלווה אותך, קחי נשימה עמוקה, והפעילי את עירבוב החפיסה הקוסמית.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center max-w-5xl mx-auto">
          
          {/* Interactive Card Canvas (5 columns) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            
            {/* The Shuffling and Card Frame Box */}
            <div className="relative w-48 h-80 [perspective:1000px] flex items-center justify-center">
              
              {isShuffling ? (
                /* CELESTIAL SHUFFLING ANIMATION */
                <div className="relative w-full h-full flex items-center justify-center">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-full h-full bg-[#110925] border border-[#D4AF37]/20 rounded-3xl double-bezel flex flex-col justify-between p-5"
                      style={{
                        animation: `shuffling-slide-${i} 0.6s ease-in-out infinite alternate`,
                        transform: `rotate(${i * 2 - 4}deg) translateZ(${i * 2}px)`,
                        zIndex: 10 + i
                      }}
                    >
                      <div className="w-full flex justify-between text-[8px] font-serif text-[#D4AF37]/20 font-bold">
                        <span>XIII</span>
                        <span>K.T</span>
                      </div>
                      <div className="w-12 h-12 mx-auto rounded-full border border-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]/15">
                        <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="0.5">
                          <circle cx="12" cy="12" r="9" />
                          <circle cx="12" cy="12" r="4" />
                          <path d="M12 3v18M3 12h18" />
                        </svg>
                      </div>
                      <div className="w-full flex justify-between text-[8px] font-serif text-[#D4AF37]/20 font-bold [transform:rotate(180deg)]">
                        <span>XIII</span>
                        <span>K.T</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* THE 3D FLIPPABLE TAROT CARD (Rider-Waite Integrated) */
                <div 
                  onClick={triggerShufflingAnimation}
                  className="relative w-full h-full cursor-pointer"
                >
                  <div 
                    className={`relative w-full h-full rounded-3xl transition-transform duration-1000 [transform-style:preserve-3d] ${
                      isFlipped ? "[transform:rotateY(180deg)]" : ""
                    }`}
                  >
                    {/* BACK OF CARD (Luxury Gold/Purple Sacred Geometry) */}
                    <div className="absolute inset-0 w-full h-full bg-[#110925] rounded-3xl border-2 border-[#D4AF37]/30 flex flex-col justify-between p-5 [backface-visibility:hidden] double-bezel shadow-2xl">
                      <div className="w-full flex justify-between text-[9px] font-serif text-[#D4AF37]/40 font-bold">
                        <span>XIII</span>
                        <span>K.T</span>
                      </div>
                      
                      {/* Astrolabe */}
                      <div className="w-16 h-16 mx-auto rounded-full border border-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37]/30 relative">
                        <svg className="w-8 h-8 animate-[spin_80s_linear_infinite]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="0.75">
                          <circle cx="12" cy="12" r="9" />
                          <circle cx="12" cy="12" r="4" />
                          <path d="M12 3v18M3 12h18M5.636 5.636l12.728 12.728" />
                        </svg>
                      </div>

                      <div className="w-full flex justify-between text-[9px] font-serif text-[#D4AF37]/40 font-bold [transform:rotate(180deg)]">
                        <span>XIII</span>
                        <span>K.T</span>
                      </div>
                    </div>

                    {/* FRONT OF CARD (Real Rider-Waite High-Res JPEGs served via Next.js symlink) */}
                    <div 
                      className="absolute inset-0 w-full h-full bg-[#150F26] rounded-3xl border-2 flex flex-col justify-between [backface-visibility:hidden] [transform:rotateY(180deg)] shadow-2xl overflow-hidden"
                      style={{ borderColor: activeCard?.accent || "#D4AF37" }}
                    >
                      {/* Real Image of the Card */}
                      {activeCard ? (
                        <div className="relative w-full h-full">
                          {/* Fine luxury gold line inner frame */}
                          <div className="absolute inset-2 border border-[#D4AF37]/20 rounded-2xl pointer-events-none z-10" />
                          <img 
                            src={activeCard.image} 
                            alt={activeCard.nameHe}
                            className="w-full h-full object-cover rounded-3xl"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-full bg-[#150F26] flex items-center justify-center">
                          <span className="text-xs text-[#D4AF37]">טוען...</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={triggerShufflingAnimation}
              disabled={isShuffling}
              className="mt-10 px-8 py-4 bg-gradient-to-r from-[#20103A] to-[#120822] hover:from-[#2B184D] hover:to-[#190D2E] active:scale-95 text-[#C5A85C] border border-[#D4AF37]/30 rounded-full font-black text-[10px] tracking-widest transition-all shadow-[0_10px_25px_rgba(212,175,55,0.05)] disabled:opacity-50"
            >
              {isShuffling ? "חפיסה נטרפת..." : "ערבבי חפיסה ופתחי קלף"}
            </button>
          </div>

          {/* Interpretation Details Display (7 columns) */}
          <div className="lg:col-span-7 bg-[#110925]/90 border border-white/5 rounded-[2.5rem] p-8 md:p-10 shadow-2xl text-right">
            {activeCard ? (
              <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
                <div className="flex flex-row-reverse items-center justify-between border-b border-white/5 pb-5">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#311C54] to-[#1C0E34] border border-[#D4AF37]/30 flex items-center justify-center text-[#C5A85C] shadow-lg">
                    <span className="font-serif text-xl font-black">{activeCard.number}</span>
                  </div>
                  <div className="text-right">
                    <h3 className="font-serif font-black text-white text-3xl">{activeCard.nameHe}</h3>
                    <p className="text-xs text-[#D4AF37] font-bold uppercase tracking-widest mt-1">{activeCard.nameEn} // ARCANA {activeCard.number}</p>
                  </div>
                </div>

                <div className="space-y-5 text-right">
                  <div>
                    <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest">האנרגיה המזוקקת</span>
                    <p className="text-[#F3E5AB]/90 font-bold text-sm leading-relaxed mt-1">{activeCard.meaning}</p>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest">פירוש רוחני ומנטלי</span>
                    <p className="text-slate-400 font-semibold text-xs leading-relaxed mt-1.5">{activeCard.detailedMeaning}</p>
                  </div>

                  <div className="bg-[#D4AF37]/5 border border-[#D4AF37]/20 p-5 rounded-2xl">
                    <span className="text-[10px] text-[#D4AF37] font-black uppercase tracking-widest block">🕯️ עצת הקלף לשבוע הקרוב</span>
                    <p className="text-[#F3E5AB]/90 font-bold text-xs leading-relaxed mt-1.5">{activeCard.advice}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-20 space-y-4">
                <div className="w-14 h-14 mx-auto rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-slate-500">
                  <svg className="w-6 h-6 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707" />
                  </svg>
                </div>
                <h4 className="font-serif font-black text-slate-300 text-lg">המקדש של קאסי מוכן עבורך</h4>
                <p className="text-slate-500 text-xs max-w-sm mx-auto leading-relaxed">
                  התמקדי בשאלה שבלבך, לחצי על כפתור עירבוב החפיסה משמאל. תמונת הקלף המקורית (חפיסת Rider-Waite המקורית) והפירוש המעצים שקאסי כתבה עבורך ייחשפו כאן ברזולוציה מלאה.
                </p>
              </div>
            )}
          </div>

        </div>
      </section>

      {/* PORTFOLIO SECTION: THE PILLARS OF KASSI (עמודי התווך של המותג) */}
      <section id="about" className="relative w-full max-w-7xl mx-auto px-6 py-24 border-t border-white/5 z-30">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <div className="space-y-6 text-right order-2 lg:order-1">
            <div className="flex items-center gap-2 justify-end">
              <span className="w-2 h-0.5 bg-[#D4AF37]" />
              <span className="text-[10px] text-[#D4AF37] font-extrabold uppercase tracking-widest">ABOUT CASSIE'S MODERN METHOD</span>
            </div>
            
            <h2 className="text-3xl md:text-5xl font-serif font-black text-white leading-tight">
              הטארוט ככלי מעצים <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#D4AF37] to-[#C5A85C]">ולא כנבואה עתידית</span>
            </h2>

            <p className="text-slate-400 text-xs md:text-sm font-semibold leading-relaxed">
              הטארוט הוא לא כלי לחיזוי פסיבי של עתידות או הפחדה מגורל קבוע. בגישה שלי, הקלפים הם כלי פסיכולוגי, ארכיטיפי והתפתחותי שמאפשר לך לראות את האנרגיות הפעילות בחייך ברגע זה, להבין את התת-מודע שלך, ולעשות בחירות מודעות שמקדמות אותך לעבר המטרה שלך.
            </p>

            <div className="space-y-4 pt-4">
              <div className="flex flex-row-reverse gap-4 items-start">
                <span className="text-[#D4AF37] font-serif font-bold text-lg">01</span>
                <div>
                  <h4 className="font-serif font-black text-white text-base">קריאות פסיכולוגיות מעצימות</h4>
                  <p className="text-slate-400 text-xs mt-1">חיבור של הקלפים לחיים האמיתיים שלך, לחרדות ולשאיפות שמעסיקות אותך ביומיום.</p>
                </div>
              </div>
              <div className="flex flex-row-reverse gap-4 items-start">
                <span className="text-[#D4AF37] font-serif font-bold text-lg">02</span>
                <div>
                  <h4 className="font-serif font-black text-white text-base">ניפוץ מיתוסים ופחד</h4>
                  <p className="text-slate-400 text-xs mt-1">אני מלמדת אותך למה קלפים 'מפחידים' כמו המוות, המגדל או השטן הם בעצם ברכות המאפשרות שחרור ופריחה מחדש.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Dual-bezel Image Box / Editorial Showcase */}
          <div className="relative max-w-md mx-auto order-1 lg:order-2">
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-800/20 to-amber-500/5 rounded-[3rem] blur-[30px]" />
            <div className="relative bg-[#110925]/90 border border-[#D4AF37]/20 p-8 rounded-[3rem] double-bezel text-right space-y-6 shadow-2xl">
              <span className="text-[9px] text-[#D4AF37] font-extrabold uppercase tracking-widest">WORDS FROM CASSIE</span>
              <p className="text-[#F3E5AB]/95 font-serif font-bold italic text-base leading-relaxed">
                "הקלפים לא קובעים מי תהיי מחר. הם רק מראים לך איפה את עומדת היום, כדי שתוכלי לברוא את המחר שאת רוצה."
              </p>
              <div className="flex items-center gap-3 justify-end pt-3">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Cassie // קאסי טארוט</span>
                <div className="w-8 h-8 rounded-full bg-slate-800 border border-[#D4AF37]/30 flex items-center justify-center font-bold font-serif text-[10px] text-[#C5A85C]">
                  CT
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* NEW SECTION: EDITORIAL BLOG (הבלוג של קאסי) */}
      <section id="blog" className="relative w-full max-w-7xl mx-auto px-6 py-24 border-t border-white/5 z-30">
        <div className="absolute top-1/4 left-10 w-96 h-96 bg-purple-900/5 rounded-full blur-[90px] pointer-events-none" />

        <div className="text-center max-w-xl mx-auto space-y-3 mb-16">
          <span className="text-[10px] text-[#D4AF37] font-extrabold uppercase tracking-widest">COSMIC INSIGHTS & WISDOM</span>
          <h2 className="text-3xl md:text-5xl font-serif font-black text-white">בלוג השראה ותודעה קוסמית</h2>
          <p className="text-indigo-200/50 text-xs md:text-sm font-semibold leading-relaxed">
            מאמרי עומק, ריטואלים שבועיים ותובנות רוחניות ופסיכולוגיות שיעזרו לך לנווט בעליות ובמורדות של מסע חייך.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {blogPosts.map((post) => (
            <div 
              key={post.id}
              className="bg-[#110925]/70 border border-white/5 hover:border-[#D4AF37]/20 rounded-[2rem] p-6.5 text-right flex flex-col justify-between gap-5 transition-all duration-300 group shadow-lg"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-center flex-row-reverse text-[9px] font-bold tracking-widest text-slate-500 uppercase">
                  <span className="text-[#D4AF37]">{post.category}</span>
                  <span>{post.date}</span>
                </div>
                
                <h3 className="font-serif font-black text-white text-lg group-hover:text-[#C5A85C] transition-colors leading-snug">
                  {post.titleHe}
                </h3>
                
                <p className="text-slate-400 text-xs font-semibold leading-relaxed">
                  {post.summary}
                </p>
              </div>

              <div className="flex justify-between items-center flex-row-reverse border-t border-white/5 pt-4">
                <button
                  onClick={() => setSelectedArticle(post)}
                  className="text-[10px] font-black tracking-wider text-[#C5A85C] hover:text-[#F3E5AB] transition-colors cursor-pointer"
                >
                  קראי מאמר מלא ←
                </button>
                <span className="text-[9px] text-slate-500 font-bold">{post.readTime}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* BLOG MODAL DRAWER (מאמר בלוג מלא) */}
      {selectedArticle && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#110925] border border-[#D4AF37]/30 rounded-[2.5rem] max-w-3xl w-full max-h-[85vh] overflow-y-auto p-8 md:p-12 text-right relative shadow-2xl scrollbar-thin">
            
            {/* Inner Gold Bezel */}
            <div className="absolute inset-2 border border-[#D4AF37]/10 rounded-[2rem] pointer-events-none" />

            {/* Close Button */}
            <button 
              onClick={() => setSelectedArticle(null)}
              className="absolute top-6 left-6 w-9 h-9 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 flex items-center justify-center text-white active:scale-90 transition-all cursor-pointer"
            >
              ✕
            </button>

            <div className="space-y-6">
              <div className="flex justify-between items-center flex-row-reverse text-[10px] font-bold tracking-widest text-slate-500 uppercase pt-2">
                <span className="text-[#D4AF37]">{selectedArticle.category}</span>
                <span>{selectedArticle.date} // {selectedArticle.readTime}</span>
              </div>

              <h2 className="font-serif font-black text-white text-2xl md:text-4xl leading-tight border-b border-white/5 pb-4">
                {selectedArticle.titleHe}
              </h2>

              <div className="text-slate-300 text-xs md:text-sm font-semibold leading-relaxed whitespace-pre-wrap text-right">
                {selectedArticle.content}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BOOKING SECTION (תיאום קריאה אישית) */}
      <section id="booking" className="relative w-full max-w-7xl mx-auto px-6 py-24 border-t border-white/5 z-30">
        
        <div className="max-w-xl mx-auto space-y-8">
          <div className="text-center space-y-3">
            <span className="text-[10px] text-[#D4AF37] font-extrabold uppercase tracking-widest">COMMISSION A PRIVATE HEAVENLY READING</span>
            <h2 className="text-3xl md:text-5xl font-serif font-black text-white">תיאום קריאה אישית</h2>
            <p className="text-indigo-200/50 text-xs md:text-sm font-semibold leading-relaxed">
              מעוניינת לצלול לעומק הדילמות שלך, לקבל הכוונה מדויקת ומפת דרכים מפורטת לנשמה? מלאי את הפרטים, ואחזור אלייך באופן אישי.
            </p>
          </div>

          <form onSubmit={handleBookingSubmit} className="bg-[#110925]/90 border border-white/5 rounded-[2.5rem] p-8 md:p-10 shadow-2xl text-right space-y-6">
            
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">כיצד לקרוא לך? (שם מלא)</label>
              <input 
                type="text" 
                required
                value={bookingName}
                onChange={(e) => setBookingName(e.target.value)}
                placeholder="הכניסי את שמך..."
                className="w-full bg-[#0E071F] border border-white/10 hover:border-white/20 focus:border-[#D4AF37]/50 focus:bg-[#150F2C] rounded-2xl px-4 py-3.5 text-xs text-right focus:outline-none transition-all placeholder:text-slate-600 text-white"
                dir="rtl"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">דואר אלקטרוני ליצירת קשר</label>
              <input 
                type="email" 
                required
                value={bookingEmail}
                onChange={(e) => setBookingEmail(e.target.value)}
                placeholder="כתובת האימייל שלך..."
                className="w-full bg-[#0E071F] border border-white/10 hover:border-white/20 focus:border-[#D4AF37]/50 focus:bg-[#150F2C] rounded-2xl px-4 py-3.5 text-xs text-right focus:outline-none transition-all placeholder:text-slate-600 text-white"
                dir="rtl"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">סגנון הפריסה הרצוי</label>
              <select 
                value={bookingSpread}
                onChange={(e) => setBookingSpread(e.target.value)}
                className="w-full bg-[#0E071F] border border-white/10 hover:border-white/20 focus:border-[#D4AF37]/50 focus:bg-[#150F2C] rounded-2xl px-4 py-3.5 text-xs text-right focus:outline-none transition-all cursor-pointer text-white"
                dir="rtl"
              >
                <option value="weekly">קריאת הכוונה שבועית מורחבת (3 קלפים)</option>
                <option value="love">קריאת אהבה וזוגיות מעמיקה (5 קלפים)</option>
                <option value="cross">צלב קלטי - מפת דרכים מלאה לחיים (10 קלפים)</option>
                <option value="career">קריאת פיתוח עסקי וקריירה (4 קלפים)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">השאלה או הדילמה שמלווה אותך</label>
              <textarea 
                value={bookingQuestion}
                onChange={(e) => setBookingQuestion(e.target.value)}
                placeholder="שתפי אותי במה שמעסיק אותך, כדי שאוכל להכין את הפריסה במיוחד עבורך..."
                className="w-full bg-[#0E071F] border border-white/10 hover:border-white/20 focus:border-[#D4AF37]/50 focus:bg-[#150F2C] rounded-2xl px-4 py-4 text-xs text-right focus:outline-none transition-all h-32 resize-none placeholder:text-slate-600 leading-relaxed scrollbar-thin text-white"
                dir="rtl"
              />
            </div>

            {bookingStatus === "success" && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4.5 rounded-2xl text-xs font-bold leading-relaxed">
                ✓ פנייתך התקבלה בהצלחה! הפרטים נשמרו בוולט המקומי, וקאסי תעבור עליהם ותיצור איתך קשר באימייל בהקדם.
              </div>
            )}

            {bookingStatus === "error" && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4.5 rounded-2xl text-xs font-bold leading-relaxed">
                ✕ שגיאה בשליחת הטופס. אנא ודאי שהכל מולא כראוי ורשת האינטרנט פעילה, ונסי שוב.
              </div>
            )}

            <button
              type="submit"
              disabled={bookingStatus === "submitting"}
              className="w-full py-4 bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#C5A85C] disabled:from-amber-700 disabled:to-amber-800 disabled:text-slate-400 text-slate-950 font-black text-xs rounded-2xl hover:shadow-[0_0_20px_rgba(212,175,55,0.2)] active:scale-95 transition-all shadow-lg tracking-widest"
            >
              {bookingStatus === "submitting" ? "שולח את פנייתך לקאסי..." : "שלח בקשה לקריאת טארוט אישית"}
            </button>

          </form>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="w-full border-t border-white/5 py-12 text-center text-xs text-slate-500 relative z-40">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row-reverse justify-between items-center gap-6">
          <div className="flex gap-6 text-[10px] uppercase font-bold tracking-widest">
            <a href="https://instagram.com" className="hover:text-[#C5A85C] transition-colors">Instagram</a>
            <a href="#about" className="hover:text-[#C5A85C] transition-colors">Privacy Policy</a>
            <a href="#booking" className="hover:text-[#C5A85C] transition-colors">Terms of Service</a>
          </div>
          <div className="text-center md:text-right space-y-1.5">
            <p className="font-serif font-black uppercase text-white tracking-widest text-sm bg-clip-text text-transparent bg-gradient-to-r from-[#D4AF37] to-[#C5A85C]">C.T // KASSI TAROT</p>
            <p className="text-[10px]">© 2026 Kassi Tarot. Built with elite double-bezel spatial design. All rights reserved.</p>
          </div>
        </div>
      </footer>


    </div>
  );
}

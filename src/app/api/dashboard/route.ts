import { NextResponse } from "next/server";
import { 
  getObsidianData, 
  getNoteContent, 
  toggleObsidianTask, 
  createObsidianTask,
  getDailyNotesList,
  createDailyNote
} from "@/lib/obsidian";

// In-memory mock token statistics
let mockTokenStats = {
  totalTokens: 1423030,
  promptTokens: 925110,
  completionTokens: 497920,
  estimatedCost: 4.27,
  dailyHistory: [
    { date: "05/20", tokens: 85000, cost: 0.25 },
    { date: "05/21", tokens: 120000, cost: 0.36 },
    { date: "05/22", tokens: 95000, cost: 0.28 },
    { date: "05/23", tokens: 180000, cost: 0.54 },
    { date: "05/24", tokens: 250000, cost: 0.75 },
    { date: "05/25", tokens: 340000, cost: 1.02 },
    { date: "05/26", tokens: 353030, cost: 1.07 },
  ]
};

// Default agents list - NOW FEATURING MAX BY DEFAULT!
let mockAgents = [
  {
    id: "hermes-core",
    name: "Hermes Core",
    role: "סוכן תיאום ראשי",
    status: "idle",
    model: "gemini-3.5-flash",
    currentTask: "ממתין לפקודה / סנכרון נתונים",
    tokensUsed: 420500,
    uptime: "4h 12m",
  },
  {
    id: "max-linux-kernel",
    name: "Max (Linux Kernel)",
    role: "סוכן לינוקס מרוחק & שומר סף",
    status: "working", // Make Max active and glowing!
    model: "openclaw-linux",
    currentTask: "מאזין לגשר הדיסקורד ומתעדכן בלוגים",
    tokensUsed: 125400,
    uptime: "14h 32m",
  },
  {
    id: "loomis",
    name: "Loomis",
    role: "ארכיטקט ויזואלי",
    status: "idle",
    model: "claude-3.5-sonnet",
    currentTask: "ממתין לעדכון פריסת דאשבורד",
    tokensUsed: 680200,
    uptime: "2h 45m",
  },
  {
    id: "khorne",
    name: "Khorne",
    role: "מריץ קוד ובדיקות",
    status: "idle",
    model: "gpt-4o",
    currentTask: "השלים קומפילציה ובדיקות יחידה בהצלחה",
    tokensUsed: 210400,
    uptime: "6h 15m",
  },
  {
    id: "aletheia",
    name: "Aletheia",
    role: "חוקר ומסנתז ידע",
    status: "idle",
    model: "gpt-4o-mini",
    currentTask: "סריקת קבצי אובסידיאן ומיפוי קשרים",
    tokensUsed: 109430,
    uptime: "12h 30m",
  }
];

// In-memory chat histories for each agent
let mockChats: Record<string, { sender: "user" | "agent"; text: string; time: string; }[]> = {
  "hermes-core": [
    { sender: "agent", text: "שלום יורי! אני סוכן התיאום הראשי שלך. המערכות המקומיות, אובסידיאן ודיסקורד מסונכרנים לחלוטין. במה נוכל להתמקד כעת?", time: "12:00" }
  ],
  "max-linux-kernel": [
    { sender: "agent", text: "מערכת הלינוקס מחוברת רשמית דרך גשר הדיסקורד! כל לוג ופעילות שאבצע ישלחו לכאן בלייב. מוכן לקבלת הנחיות.", time: "12:15" }
  ],
  "loomis": [
    { sender: "agent", text: "היי! סיימתי לבנות את ממשק ה-Chat החדש בדאשבורד. מה דעתך על העיצוב? אני תמיד מוכן לשפר פיקסלים.", time: "12:10" }
  ],
  "khorne": [
    { sender: "agent", text: "בדיקות היחידה (Vite/Next.js) עברו ב-100% בהצלחה. הקוד יציב ומוכן לפריסה.", time: "11:50" }
  ],
  "aletheia": [
    { sender: "agent", text: "סרקתי את כל 48 הקבצים באובסידיאן. מצאתי קשרים מעניינים בין תיקיית ה-Tarot לבין קבצי ה-Second Brain שלך. תרצה שאפיק סיכום?", time: "12:05" }
  ]
};

let mockLogs = [
  { id: 1, time: "12:15", type: "agent", agent: "Max", message: "גשר הדיסקורד מחובר. סוכן הלינוקס רשום ומאזין." },
  { id: 2, time: "12:12", type: "agent", agent: "Loomis", message: "ממשק ה-Live Chat הוכנס לדאשבורד הויזואלי בהצלחה." },
  { id: 3, time: "12:08", type: "agent", agent: "Aletheia", message: "מיפוי 12 קבצי Tarot/Arcana/Major במוח השני." },
  { id: 4, time: "11:54", type: "system", message: "תקציב טוקנים מעודכן: נוצלו 35% מהתקרה היומית המוגדרת." },
  { id: 5, time: "11:45", type: "agent", agent: "Khorne", message: "בדיקת תקינות (npm run build) הסתיימה ללא שגיאות." }
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const notePath = searchParams.get("notePath");
  const agentId = searchParams.get("agentId");

  if (notePath) {
    const content = await getNoteContent(notePath);
    return NextResponse.json({ content });
  }

  // If chat messages for a specific agent are requested
  if (agentId) {
    const chat = mockChats[agentId] || [];
    return NextResponse.json({ chat });
  }

  const obsidianData = await getObsidianData();
  const dailyNotes = await getDailyNotesList();

  return NextResponse.json({
    obsidian: obsidianData,
    dailyNotes: dailyNotes,
    agents: mockAgents,
    tokenStats: mockTokenStats,
    logs: mockLogs,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === "toggleTask") {
      const { notePath, taskText, completed } = body;
      const success = await toggleObsidianTask(notePath, taskText, completed);
      
      if (success) {
        mockLogs.unshift({
          id: Date.now(),
          time: new Date().toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" }),
          type: "system",
          message: `עודכנה משימה באובסידיאן: "${taskText}" סומנה כ-${completed ? "הושלמה" : "פתוחה"}`
        });
        
        mockTokenStats.totalTokens += 450;
        mockTokenStats.promptTokens += 300;
        mockTokenStats.completionTokens += 150;
        mockTokenStats.estimatedCost = parseFloat((mockTokenStats.totalTokens * 0.000003).toFixed(2));
        
        return NextResponse.json({ success: true });
      }
    } 
    
    if (action === "createTask") {
      const { notePath, taskText } = body;
      const success = await createObsidianTask(notePath || "00_Index.md", taskText);
      
      if (success) {
        mockLogs.unshift({
          id: Date.now(),
          time: new Date().toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" }),
          type: "system",
          message: `נוצרה משימה חדשה באובסידיאן: "${taskText}" בקובץ ${notePath || "00_Index.md"}`
        });

        mockTokenStats.totalTokens += 600;
        mockTokenStats.promptTokens += 400;
        mockTokenStats.completionTokens += 200;
        mockTokenStats.estimatedCost = parseFloat((mockTokenStats.totalTokens * 0.000003).toFixed(2));

        return NextResponse.json({ success: true });
      }
    }

    if (action === "runAgent") {
      const { agentId } = body;
      const agent = mockAgents.find(a => a.id === agentId);
      if (agent) {
        agent.status = "working";
        agent.currentTask = "מריץ תהליך אופטימיזציה לסנכרון הקבצים...";
        
        mockLogs.unshift({
          id: Date.now(),
          time: new Date().toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" }),
          type: "agent",
          agent: agent.name,
          message: `סוכן ${agent.name} הופעל ידנית מלוח הבקרה.`
        });

        setTimeout(() => {
          agent.status = "idle";
          agent.currentTask = "ממתין לפקודה / סנכרון נתונים";
          agent.tokensUsed += 12500;
          mockTokenStats.totalTokens += 12500;
          mockTokenStats.estimatedCost = parseFloat((mockTokenStats.totalTokens * 0.000003).toFixed(2));
          mockLogs.unshift({
            id: Date.now(),
            time: new Date().toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" }),
            type: "agent",
            agent: agent.name,
            message: `סוכן ${agent.name} סיים את תפקידו בהצלחה. נוצלו 12.5k טוקנים.`
          });
        }, 5000);

        return NextResponse.json({ success: true, agent });
      }
    }

    // NEW Action: Send a message to an agent in the Live Chat!
    if (action === "sendMessage") {
      const { agentId, text } = body;
      const agent = mockAgents.find(a => a.id === agentId);
      
      if (!agent) {
        return NextResponse.json({ error: "Agent not found" }, { status: 404 });
      }

      const timeString = new Date().toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });
      
      // Initialize chat array if missing
      if (!mockChats[agentId]) mockChats[agentId] = [];

      // Add user message
      mockChats[agentId].push({ sender: "user", text, time: timeString });

      // Generate realistic response based on agent's personality
      let responseText = "מנתח נתונים, אנא המתן...";
      let simulatedTokens = 2000;

      if (agentId === "hermes-core") {
        responseText = `קיבלתי את ההנחיה שלך, יורי. אני מתחיל לערוך ולסנכרן את המשימות מול קובץ הזיכרון ארוך-הטווח שלך באובסידיאן (\`Second Brain/Hermes_Memory.md\`).`;
        simulatedTokens = 4200;
      } else if (agentId === "loomis") {
        responseText = `שומע אותך חזק וברור! עידכנתי את דאשבורד ה-Chat החדש שיהיה רספונסיבי לחלוטין ויעשה שימוש באפקטים יוקרתיים של טשטוש זכוכית (Glassmorphic).`;
        simulatedTokens = 3500;
      } else if (agentId === "khorne") {
        responseText = `מבין. הרצתי בדיקת קומפילציה מהירה לשינויים האחרונים בקוד: הכל נראה ירוק ויציב לפריסה!`;
        simulatedTokens = 2500;
      } else if (agentId === "aletheia") {
        responseText = `חקרתי את הנושא המבוקש במוח השני שלך. מצאתי 3 קשרים רלוונטיים בתיקיות ה-Thoughts וה-Workflows. שמרתי לך את המסקנות בתיקיית הטיוטות.`;
        simulatedTokens = 5500;
      } else if (agentId === "max-linux-kernel") {
        responseText = `היי יורי, קיבלתי את ההודעה שלך כאן בלינוקס! גשר הדיסקורד וה-Webhook עובדים פנטסטי. כל עדכון נוסף אשלח לך ישירות למסך ברגע זה.`;
        simulatedTokens = 3800;

        // REAL INTEGRATION BONUS: Since the user messaged Max, we actually send it to the Discord Webhook so the user can see it in Discord in real-time!
        const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
        if (webhookUrl) {
          try {
            fetch(webhookUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                content: `💬 **הודעה חדשה מיורי ל-Max 🛡️ מתוך הדאשבורד:**\n> "${text}"`
              })
            }).catch(e => console.error("Error forwarding chat to Discord Webhook:", e));
          } catch (e) {
            // ignore
          }
        }
      }

      // Simulate typing delay in the response list (we append it to memory)
      setTimeout(() => {
        mockChats[agentId].push({ sender: "agent", text: responseText, time: timeString });
        
        // Update stats
        agent.status = "idle";
        agent.tokensUsed += simulatedTokens;
        mockTokenStats.totalTokens += simulatedTokens;
        mockTokenStats.estimatedCost = parseFloat((mockTokenStats.totalTokens * 0.000003).toFixed(2));
        
        mockLogs.unshift({
          id: Date.now(),
          time: timeString,
          type: "agent",
          agent: agent.name,
          message: `השיב לצ'אט: "${responseText.substring(0, 30)}..."`
        });
      }, 1500);

      // Return user message immediately, list will poll or load updated on next reload
      return NextResponse.json({ success: true, chat: mockChats[agentId] });
    }

    if (action === "logActivity") {
      const { agent, message, type, tokensUsed } = body;
      
      let targetAgent = mockAgents.find(a => a.name.toLowerCase() === agent.toLowerCase() || a.id.toLowerCase() === agent.toLowerCase());
      
      if (!targetAgent) {
        targetAgent = {
          id: agent.toLowerCase().replace(/\s+/g, "-"),
          name: agent,
          role: "סוכן לינוקס מרוחק",
          status: "idle",
          model: "openclaw",
          currentTask: message,
          tokensUsed: tokensUsed || 0,
          uptime: "מחובר מרחוק",
        };
        mockAgents.push(targetAgent);
      } else {
        targetAgent.status = "working";
        targetAgent.currentTask = message;
        if (tokensUsed) targetAgent.tokensUsed += tokensUsed;
      }

      if (tokensUsed) {
        mockTokenStats.totalTokens += tokensUsed;
        mockTokenStats.completionTokens += Math.floor(tokensUsed * 0.4);
        mockTokenStats.promptTokens += Math.floor(tokensUsed * 0.6);
        mockTokenStats.estimatedCost = parseFloat((mockTokenStats.totalTokens * 0.000003).toFixed(2));
      }

      mockLogs.unshift({
        id: Date.now(),
        time: new Date().toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" }),
        type: type || "agent",
        agent: agent,
        message: message
      });

      return NextResponse.json({ success: true, agents: mockAgents });
    }

    if (action === "createDailyNote") {
      const { date } = body;
      const res = await createDailyNote(date);
      if (res.success) {
        mockLogs.unshift({
          id: Date.now(),
          time: new Date().toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" }),
          type: "system",
          message: `נוצר פתק יומן יומי חדש עבור תאריך: ${date}`
        });
        return NextResponse.json({ success: true, path: res.path });
      } else {
        return NextResponse.json({ success: false, error: "Failed to create daily note" }, { status: 500 });
      }
    }

    if (action === "renderVideo") {
      const { exec } = require("child_process");
      return new Promise<Response>((resolve) => {
        exec("python3 ./projects/mission-control/src/scripts/render_reels_with_beautiful_text.py", (error: any, stdout: string, stderr: string) => {
          if (error) {
            console.error("Exec error:", error);
            mockLogs.unshift({
              id: Date.now(),
              time: new Date().toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" }),
              type: "system",
              message: `שגיאה ברינדור וידאו: ${stderr}`
            });
            resolve(NextResponse.json({ success: false, error: stderr }));
          } else {
            mockLogs.unshift({
              id: Date.now(),
              time: new Date().toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" }),
              type: "system",
              message: "סרטון רילס חדש עם כתוביות באנימציה רונדר בהצלחה ב-Mac!"
            });
            resolve(NextResponse.json({ success: true }));
          }
        });
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

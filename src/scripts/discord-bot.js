const { Client, GatewayIntentBits, Partials } = require("discord.js");
require("dotenv").config();

const token = process.env.DISCORD_BOT_TOKEN;

if (!token) {
  console.error("Error: DISCORD_BOT_TOKEN is missing in .env file.");
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
  ],
  partials: [Partials.Channel, Partials.Message],
});

const fs = require("fs");
const path = require("path");
const logFile = path.join(__dirname, "../../discord-bot.log");

function logToFile(text) {
  const timestamp = new Date().toISOString();
  const logLine = `[${timestamp}] ${text}\n`;
  console.log(text);
  try {
    fs.appendFileSync(logFile, logLine, "utf-8");
  } catch (e) {
    // ignore
  }
}

client.once("ready", () => {
  logToFile(`============= DISCORD BOT ACTIVE =============`);
  logToFile(`Logged in as: ${client.user.tag}`);
  logToFile(`Guilds connected: ${client.guilds.cache.size}`);
  client.guilds.cache.forEach(guild => {
    logToFile(` - Guild: "${guild.name}" (ID: ${guild.id})`);
  });
  logToFile(`==============================================`);
});

client.on("messageCreate", async (message) => {
  // Ignore messages sent by ourselves
  if (message.author.id === client.user.id) return;

  const isDM = !message.guild;
  
  // Robust mention check
  const isMentioned = isDM || message.mentions.has(client.user);

  // Log incoming message for real-time debugging in the console and file
  logToFile(`[Message] From ${message.author.tag} in ${isDM ? "DM" : `#${message.channel.name}`}: "${message.content}"`);

  if (!isMentioned) return;

  // Clean the content: strip out the bot mention robustly
  const mentionRegex = new RegExp(`<@!?${client.user.id}>`, "g");
  let cleanContent = message.content.replace(mentionRegex, "").trim();

  // If the user just mentioned the bot with no command, treat as help
  if (!cleanContent) {
    cleanContent = "!help";
  }

  logToFile(`[Command] Parsing matching command: "${cleanContent}"`);

  // Command: !ping
  if (cleanContent === "!ping" || cleanContent === "ping" || cleanContent === "עובד?") {
    return message.reply("עובד מצוין! 🏓 סוכן השירות בדיסקורד מחובר ומוכן לקבלת לוגים ופקודות.");
  }

  // Command: !help
  if (cleanContent === "!help" || cleanContent === "help" || cleanContent === "עזרה") {
    const helpText = `
**🤖 קונסולת שליטה מבוזרת - פקודות זמינות:**
• \`!ping\` - בדיקת תקינות חיבור.
• \`!task [תוכן המשימה]\` - יצירת משימה חדשה באובסידיאן.
• \`!log [שם הסוכן] | [פעולה] | [טוקנים]\` - דיווח פעילות מהשרת המרוחק לדאשבורד הויזואלי.
  _לדוגמה:_ \`!log סוכן לינוקס | סנכרון תבניות הושלם | 5000\`
• \`!status\` - הצגת סטטוס הסוכנים החם מהדאשבורד.

_הערה: בערוצים ציבוריים יש לתייג אותי (למשל: @${client.user.username} !status). בצ'אט פרטי (DM) ניתן לשלוח את הפקודות ישירות ללא תיוג!_
    `;
    return message.reply(helpText);
  }

  // Command: !task
  if (cleanContent.startsWith("!task ")) {
    const taskText = cleanContent.slice(6).trim();
    if (!taskText) return message.reply("נא לספק את תוכן המשימה.");

    try {
      const response = await fetch("http://localhost:3000/api/dashboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "createTask",
          notePath: "00_Index.md",
          taskText: taskText,
        }),
      });

      const data = await response.json();
      if (data.success) {
        return message.reply(`🧠 **המשימה נרשמה בהצלחה באובסידיאן!**\nנוספה משימה: \`- [ ] ${taskText}\` ל-\`00_Index.md\``);
      } else {
        return message.reply("❌ שגיאה ברישום המשימה באובסידיאן.");
      }
    } catch (error) {
      logToFile(`Failed to post task: ${error}`);
      return message.reply("❌ לא ניתן לפנות לשרת הדאשבורד המקומי (Next.js אינו פעיל או שגיאת רשת).");
    }
  }

  // Command: !log [Agent] | [Message] | [Tokens]
  if (cleanContent.startsWith("!log ")) {
    const logData = cleanContent.slice(5).trim();
    const parts = logData.split("|").map(p => p.trim());
    
    if (parts.length < 2) {
      return message.reply("פורמט לא תקין. השתמש ב: `!log [שם הסוכן] | [פעולה/הודעה] | [טוקנים] (אופציונלי)`");
    }

    const agentName = parts[0];
    const logMessage = parts[1];
    const tokensUsed = parts[2] ? parseInt(parts[2], 10) : 0;

    try {
      const response = await fetch("http://localhost:3000/api/dashboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "logActivity",
          agent: agentName,
          message: logMessage,
          type: "agent",
          tokensUsed: isNaN(tokensUsed) ? 0 : tokensUsed,
        }),
      });

      const data = await response.json();
      if (data.success) {
        return message.reply(`📊 **הפעילות דווחה בהצלחה לדאשבורד הויזואלי!**\n• סוכן: \`${agentName}\`\n• פעולה: \`${logMessage}\`\n• טוקנים שנוספו: \`${tokensUsed.toLocaleString()}\``);
      } else {
        return message.reply("❌ שגיאה בעדכון הדאשבורד.");
      }
    } catch (error) {
      logToFile(`Failed to post log: ${error}`);
      return message.reply("❌ לא ניתן לפנות לשרת הדאשבורד המקומי.");
    }
  }

  // Command: !status
  if (cleanContent === "!status" || cleanContent === "status") {
    try {
      const response = await fetch("http://localhost:3000/api/dashboard");
      const data = await response.json();
      
      let statusText = `**📊 סטטוס סוכנים חם מדאשבורד השליטה:**\n\n`;
      data.agents.forEach(a => {
        const icon = a.status === "working" ? "🟢" : "⚪";
        statusText += `${icon} **${a.name}** (${a.role})\n• סטטוס: \`${a.status === "working" ? "פעיל" : "בהמתנה"}\`\n• משימה: \`${a.currentTask}\`\n• טוקנים: \`${a.tokensUsed.toLocaleString()}\`\n\n`;
      });
      
      statusText += `**📈 סה"כ עלויות טוקנים:** \`$${data.tokenStats.estimatedCost.toFixed(2)}\``;
      return message.reply(statusText);
    } catch (e) {
      return message.reply("❌ שגיאה בקבלת נתוני סטטוס מהדאשבורד.");
    }
  }

  // Auto-parse JSON blocks wrapped in markdown
  if (cleanContent.startsWith("```json") && cleanContent.endsWith("```")) {
    try {
      const jsonStr = cleanContent.substring(7, cleanContent.length - 3).trim();
      const payload = JSON.parse(jsonStr);

      if (payload.agent && payload.message) {
        const response = await fetch("http://localhost:3000/api/dashboard", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "logActivity",
            agent: payload.agent,
            message: payload.message,
            type: payload.type || "agent",
            tokensUsed: payload.tokensUsed || 0,
          }),
        });
        
        const data = await response.json();
        if (data.success) {
          await message.react("✅");
        }
      }
    } catch (e) {
      // ignore
    }
    return;
  }

  // ==========================================
  // NEW: Conversational Fallback (So it NEVER stays silent!)
  // ==========================================
  logToFile(`[Fallback] Unmatched message received, sending helper reply.`);
  
  const friendlyReply = `היי יורי! 🧠 קיבלתי את ההודעה שלך: "${cleanContent}".
  
אני מחובר ומאזין כאן מצוין, אך ההודעה הזו אינה פקודת מערכת מוכרת.

**מה תוכל לעשות כעת?**
1. 📋 שלח לי \`!help\` כדי לראות את רשימת פקודות הבקרה המדויקות.
2. 💻 פתח את **הדאשבורד הויזואלי החדש** בכתובת http://localhost:3000 לצ'אט לייב אינטראקטיבי ומלא איתי ועם כל שאר הסוכנים (כולל מקס!).
3. 📝 כתוב \`!task [משימה]\` כדי להזריק משימה ישירות למוח השני באובסידיאן.`;

  return message.reply(friendlyReply);
});

client.login(token);

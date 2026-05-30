import fs from "fs/promises";
import path from "path";

export interface ObsidianNode {
  id: string;
  label: string;
  type: "note" | "tag";
  path?: string;
  tasksCount: number;
  completedTasksCount: number;
  tags: string[];
}

export interface ObsidianLink {
  source: string;
  target: string;
  type: "link" | "tag-link";
}

export interface ObsidianGraph {
  nodes: ObsidianNode[];
  links: ObsidianLink[];
}

export interface ObsidianTask {
  id: string;
  text: string;
  completed: boolean;
  noteTitle: string;
  notePath: string;
}

const VAULT_PATH = process.env.OBSIDIAN_VAULT_PATH || "/Users/yurismacbook/the volt";

// Helper to recursively get all markdown files
async function getMarkdownFiles(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const res = path.resolve(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name.startsWith(".") || entry.name === "node_modules") {
          return [];
        }
        return getMarkdownFiles(res);
      }
      return entry.name.endsWith(".md") ? [res] : [];
    })
  );
  return files.flat();
}

export async function getObsidianData(): Promise<{
  graph: ObsidianGraph;
  tasks: ObsidianTask[];
  notesCount: number;
  tagsCount: number;
}> {
  try {
    const files = await getMarkdownFiles(VAULT_PATH);
    const nodesMap: Record<string, ObsidianNode> = {};
    const links: ObsidianLink[] = [];
    const tasks: ObsidianTask[] = [];
    const tagsSet = new Set<string>();

    // Pass 1: Create all note nodes
    for (const filePath of files) {
      const relativePath = path.relative(VAULT_PATH, filePath);
      const noteName = path.basename(filePath, ".md");
      const id = noteName; // Use note name as unique ID

      // Read file content
      const content = await fs.readFile(filePath, "utf-8");

      // Extract tasks
      const taskLines = content.matchAll(/- \[( |x|X)\] (.*)/g);
      let tasksCount = 0;
      let completedTasksCount = 0;
      let taskIndex = 0;

      for (const match of taskLines) {
        const completed = match[1].toLowerCase() === "x";
        const text = match[2].trim();
        tasks.push({
          id: `${id}-task-${taskIndex++}`,
          text,
          completed,
          noteTitle: noteName,
          notePath: relativePath,
        });

        tasksCount++;
        if (completed) completedTasksCount++;
      }

      // Extract tags
      const tagMatches = content.matchAll(/#([a-zA-Z0-9_\-/]+)/g);
      const fileTags: string[] = [];
      for (const match of tagMatches) {
        const tag = match[1].toLowerCase();
        if (!isNaN(Number(tag)) || tag.length < 2) continue;
        fileTags.push(tag);
        tagsSet.add(tag);
      }

      nodesMap[id] = {
        id,
        label: noteName,
        type: "note",
        path: relativePath,
        tasksCount,
        completedTasksCount,
        tags: Array.from(new Set(fileTags)),
      };
    }

    // Pass 2: Extract links and build connection topology
    for (const filePath of files) {
      const noteName = path.basename(filePath, ".md");
      const sourceId = noteName;

      const content = await fs.readFile(filePath, "utf-8");

      // Parse wikilinks
      const wikilinkMatches = content.matchAll(/\[\[([^\]|#\n]+)(?:#[^\]|]+)?(?:\|[^\]]+)?\]\]/g);
      const seenLinks = new Set<string>();

      for (const match of wikilinkMatches) {
        const targetName = match[1].trim();
        if (!targetName || targetName === sourceId) continue;

        if (nodesMap[targetName] && !seenLinks.has(targetName)) {
          seenLinks.add(targetName);
          links.push({
            source: sourceId,
            target: targetName,
            type: "link",
          });
        }
      }

      // Link tags to note
      for (const tag of nodesMap[sourceId].tags) {
        const tagNodeId = `tag:${tag}`;
        if (!nodesMap[tagNodeId]) {
          nodesMap[tagNodeId] = {
            id: tagNodeId,
            label: `#${tag}`,
            type: "tag",
            tasksCount: 0,
            completedTasksCount: 0,
            tags: [],
          };
        }
        links.push({
          source: sourceId,
          target: tagNodeId,
          type: "tag-link",
        });
      }
    }

    const nodes = Object.values(nodesMap);

    return {
      graph: { nodes, links },
      tasks,
      notesCount: files.length,
      tagsCount: tagsSet.size,
    };
  } catch (error) {
    console.error("Error loading Obsidian data:", error);
    return {
      graph: { nodes: [], links: [] },
      tasks: [],
      notesCount: 0,
      tagsCount: 0,
    };
  }
}

export async function getNoteContent(notePath: string): Promise<string> {
  try {
    const fullPath = path.resolve(VAULT_PATH, notePath);
    if (!fullPath.startsWith(VAULT_PATH)) {
      throw new Error("Access denied");
    }
    return await fs.readFile(fullPath, "utf-8");
  } catch (error) {
    console.error("Error reading note content:", error);
    return "שגיאה בטעינת קובץ המקור.";
  }
}

// Bidirectional support: complete or incomplete a task directly in the Obsidian markdown file!
export async function toggleObsidianTask(
  notePath: string,
  taskText: string,
  completed: boolean
): Promise<boolean> {
  try {
    const fullPath = path.resolve(VAULT_PATH, notePath);
    if (!fullPath.startsWith(VAULT_PATH)) {
      throw new Error("Access denied");
    }

    let content = await fs.readFile(fullPath, "utf-8");

    // Search for target pattern
    const oldPattern = completed 
      ? `- [ ] ${taskText}` 
      : `- [x] ${taskText}`;
    
    const newPattern = completed 
      ? `- [x] ${taskText}` 
      : `- [ ] ${taskText}`;

    // Try exact replacement first
    if (content.includes(oldPattern)) {
      content = content.replace(oldPattern, newPattern);
    } else {
      // Try case-insensitive checklist style replacement
      const regex = new RegExp(`- \\[([ xX])\\] ${escapeRegExp(taskText)}`, "g");
      content = content.replace(regex, completed ? `- [x] ${taskText}` : `- [ ] ${taskText}`);
    }

    await fs.writeFile(fullPath, content, "utf-8");
    return true;
  } catch (error) {
    console.error("Error toggling Obsidian task:", error);
    return false;
  }
}

// Bidirectional support: create a task in a specific Obsidian note
export async function createObsidianTask(
  notePath: string,
  taskText: string
): Promise<boolean> {
  try {
    const fullPath = path.resolve(VAULT_PATH, notePath);
    if (!fullPath.startsWith(VAULT_PATH)) {
      throw new Error("Access denied");
    }

    let content = await fs.readFile(fullPath, "utf-8");
    
    // Append task under an existing tasks header, or at the bottom
    const taskString = `\n- [ ] ${taskText}`;
    
    if (content.includes("## Tasks") || content.includes("## משימות") || content.includes("## משימות היום (Tasks)")) {
      content = content.replace("## Tasks", `## Tasks${taskString}`);
      content = content.replace("## משימות", `## משימות${taskString}`);
      content = content.replace("## משימות היום (Tasks)", `## משימות היום (Tasks)${taskString}`);
    } else {
      content += `\n\n${taskString}`;
    }

    await fs.writeFile(fullPath, content, "utf-8");
    return true;
  } catch (error) {
    console.error("Error creating Obsidian task:", error);
    return false;
  }
}

// Get all daily notes in the vault
export async function getDailyNotesList(): Promise<{ date: string; path: string; }[]> {
  try {
    const files = await getMarkdownFiles(VAULT_PATH);
    const dailyNotes: { date: string; path: string; }[] = [];
    
    for (const file of files) {
      const filename = path.basename(file);
      const match = filename.match(/^(\d{4}-\d{2}-\d{2})\.md$/);
      if (match) {
        dailyNotes.push({
          date: match[1],
          path: path.relative(VAULT_PATH, file)
        });
      }
    }
    return dailyNotes;
  } catch (e) {
    console.error("Error in getDailyNotesList:", e);
    return [];
  }
}

// Create a new daily note with a gorgeous markdown template
export async function createDailyNote(dateStr: string): Promise<{ success: boolean; path: string; }> {
  try {
    const dailyFolderPath = path.join(VAULT_PATH, "Daily");
    
    try {
      await fs.mkdir(dailyFolderPath, { recursive: true });
    } catch (e) {
      // ignore
    }
    
    const relativeNotePath = `Daily/${dateStr}.md`;
    const fullNotePath = path.join(VAULT_PATH, relativeNotePath);
    
    try {
      await fs.access(fullNotePath);
      return { success: true, path: relativeNotePath };
    } catch {
      const template = `# 📅 יומן יומי - ${dateStr}

## 🎯 יעדי היום (Daily Goals)
- [ ] להתחיל ספרינט עבודה ממוקד
- [ ] לסנכרן משימות מול המוח השני

## 📝 משימות היום (Tasks)
- [ ] להשלים את פריסת הדאשבורד החדש
- [ ] לעדכן את סוכן מקס בהנחיות המעודכנות

## 💭 מחשבות והרהורים (Daily Reflection)
*ממתין לתובנות והרהורים שלך לקראת סוף היום...*
`;
      await fs.writeFile(fullNotePath, template, "utf-8");
      return { success: true, path: relativeNotePath };
    }
  } catch (e) {
    console.error("Error in createDailyNote:", e);
    return { success: false, path: "" };
  }
}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

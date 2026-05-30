"use client";

import { useEffect, useRef, useState } from "react";
import TarotWorkspace from "@/components/TarotWorkspace";

interface ObsidianNode {
  id: string;
  label: string;
  type: "note" | "tag";
  path?: string;
  tasksCount: number;
  completedTasksCount: number;
  tags: string[];
}

interface ObsidianLink {
  source: string;
  target: string;
  type: "link" | "tag-link";
}

interface ObsidianGraph {
  nodes: ObsidianNode[];
  links: ObsidianLink[];
}

interface ObsidianTask {
  id: string;
  text: string;
  completed: boolean;
  noteTitle: string;
  notePath: string;
}

interface Agent {
  id: string;
  name: string;
  role: string;
  status: "idle" | "working" | "error";
  model: string;
  currentTask: string;
  tokensUsed: number;
  uptime: string;
}

interface TokenStats {
  totalTokens: number;
  promptTokens: number;
  completionTokens: number;
  estimatedCost: number;
  dailyHistory: { date: string; tokens: number; cost: number; }[];
}

interface LogEntry {
  id: number;
  time: string;
  type: string;
  agent?: string;
  message: string;
}

interface ChatMessage {
  sender: "user" | "agent";
  text: string;
  time: string;
}

interface DailyNoteInfo {
  date: string;
  path: string;
}

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [graphData, setGraphData] = useState<ObsidianGraph>({ nodes: [], links: [] });
  const [tasks, setTasks] = useState<ObsidianTask[]>([]);
  const [notesCount, setNotesCount] = useState(0);
  const [tagsCount, setTagsCount] = useState(0);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [tokenStats, setTokenStats] = useState<TokenStats | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [dailyNotes, setDailyNotes] = useState<DailyNoteInfo[]>([]);
  
  // UI Navigation / Sidebar tabs
  const [activeTab, setActiveTab] = useState<"dashboard" | "secondbrain" | "calendar" | "chat" | "logs" | "tarot">("dashboard");

  // UI state details
  const [selectedNode, setSelectedNode] = useState<ObsidianNode | null>(null);
  const [selectedNodeContent, setSelectedNodeContent] = useState<string>("");
  const [loadingContent, setLoadingContent] = useState(false);
  const [newTaskText, setNewTaskText] = useState("");
  const [newTaskTarget, setNewTaskTarget] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "info" } | null>(null);

  // Live Agent Chat states
  const [activeChatAgentId, setActiveChatAgentId] = useState<string>("max-linux-kernel");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [typedMessage, setTypedMessage] = useState("");
  const [isAgentTyping, setIsAgentTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Interactive Live Stopwatch / Time Tracker (Donezo-inspired)
  const [stopwatchSeconds, setStopwatchSeconds] = useState(0);
  const [isStopwatchRunning, setIsStopwatchRunning] = useState(false);
  const stopwatchIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Calendar workspace state variables
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [calendarMonth, setCalendarMonth] = useState<number>(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState<number>(new Date().getFullYear());
  const [selectedDateNoteContent, setSelectedDateNoteContent] = useState<string>("");
  const [loadingDailyNote, setLoadingDailyNote] = useState<boolean>(false);

  // Canvas-related refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const transformRef = useRef({ x: 0, y: 0, zoom: 0.9 });
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const draggedNodeRef = useRef<any | null>(null);
  const physicsNodesRef = useRef<any[]>([]);

  // Show Toast helper
  const showToast = (message: string, type: "success" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Stopwatch controls
  useEffect(() => {
    if (isStopwatchRunning) {
      stopwatchIntervalRef.current = setInterval(() => {
        setStopwatchSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (stopwatchIntervalRef.current) {
        clearInterval(stopwatchIntervalRef.current);
      }
    }
    return () => {
      if (stopwatchIntervalRef.current) clearInterval(stopwatchIntervalRef.current);
    };
  }, [isStopwatchRunning]);

  const handleStartPauseStopwatch = () => {
    setIsStopwatchRunning(!isStopwatchRunning);
    showToast(isStopwatchRunning ? "מעקב זמן מושהה" : "מעקב זמן פעיל!", "success");
  };

  const handleResetStopwatch = () => {
    setIsStopwatchRunning(false);
    setStopwatchSeconds(0);
    showToast("מונה זמן אופס בהצלחה", "info");
  };

  const formatStopwatchTime = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600).toString().padStart(2, "0");
    const mins = Math.floor((totalSecs % 3600) / 60).toString().padStart(2, "0");
    const secs = (totalSecs % 60).toString().padStart(2, "0");
    return `${hrs}:${mins}:${secs}`;
  };

  // Fetch full dashboard data
  const fetchData = async () => {
    try {
      const res = await fetch("/api/dashboard");
      const data = await res.json();
      
      setGraphData(data.obsidian.graph);
      setTasks(data.obsidian.tasks);
      setNotesCount(data.obsidian.notesCount);
      setTagsCount(data.obsidian.tagsCount);
      setAgents(data.agents);
      setTokenStats(data.tokenStats);
      setLogs(data.logs);
      setDailyNotes(data.dailyNotes || []);

      if (data.obsidian.graph.nodes.length > 0) {
        const firstNote = data.obsidian.graph.nodes.find((n: any) => n.type === "note");
        if (firstNote) setNewTaskTarget(firstNote.path || "");
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchChatHistory = async (agentId: string) => {
    try {
      const res = await fetch(`/api/dashboard?agentId=${agentId}`);
      const data = await res.json();
      setChatMessages(data.chat);
    } catch (error) {
      console.error("Error fetching chat history:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Poll chat messages and status periodically (every 2.5s)
  useEffect(() => {
    if (loading) return;
    const interval = setInterval(() => {
      fetchChatHistory(activeChatAgentId);
      fetch(`/api/dashboard`)
        .then(res => res.json())
        .then(data => {
          setAgents(data.agents);
          setTokenStats(data.tokenStats);
          setLogs(data.logs);
          setDailyNotes(data.dailyNotes || []);
        });
    }, 2500);
    return () => clearInterval(interval);
  }, [loading, activeChatAgentId]);

  useEffect(() => {
    if (loading) return;
    fetchChatHistory(activeChatAgentId);
  }, [activeChatAgentId, loading]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isAgentTyping]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedMessage.trim() || isAgentTyping) return;

    const messageText = typedMessage;
    setTypedMessage("");

    const timeString = new Date().toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });
    setChatMessages(prev => [...prev, { sender: "user", text: messageText, time: timeString }]);
    setIsAgentTyping(true);

    try {
      const res = await fetch("/api/dashboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "sendMessage",
          agentId: activeChatAgentId,
          text: messageText
        })
      });
      const data = await res.json();
      
      if (data.success) {
        setTimeout(() => {
          setIsAgentTyping(false);
          fetchChatHistory(activeChatAgentId);
          fetchData();
        }, 1500);
      } else {
        setIsAgentTyping(false);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setIsAgentTyping(false);
    }
  };

  const loadNoteContent = async (note: ObsidianNode) => {
    if (note.type !== "note" || !note.path) return;
    setLoadingContent(true);
    setSelectedNode(note);
    setSelectedNodeContent("");
    try {
      const res = await fetch(`/api/dashboard?notePath=${encodeURIComponent(note.path)}`);
      const data = await res.json();
      setSelectedNodeContent(data.content);
    } catch (e) {
      setSelectedNodeContent("שגיאה בטעינת הקובץ.");
    } finally {
      setLoadingContent(false);
    }
  };

  const handleToggleTask = async (task: ObsidianTask) => {
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, completed: !t.completed } : t));
    try {
      const res = await fetch("/api/dashboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggleTask",
          notePath: task.notePath,
          taskText: task.text,
          completed: !task.completed
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(task.completed ? "המשימה הוחזרה לטיפול" : "המשימה הושלמה בהצלחה!", "success");
        fetchData();
        if (activeTab === "calendar") {
          loadDailyNoteContent(selectedDate);
        }
      }
    } catch (e) {
      showToast("שגיאה בעדכון המשימה באובסידיאן", "info");
      fetchData();
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    try {
      const res = await fetch("/api/dashboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "createTask",
          notePath: newTaskTarget || "00_Index.md",
          taskText: newTaskText
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast("משימה חדשה נוספה לקובץ אובסידיאן!", "success");
        setNewTaskText("");
        fetchData();
      }
    } catch (e) {
      showToast("שגיאה ביצירת המשימה", "info");
    }
  };

  // Calendar Helpers & Actions
  const getFormattedDateStr = (date: Date) => {
    const y = date.getFullYear();
    const m = (date.getMonth() + 1).toString().padStart(2, "0");
    const d = date.getDate().toString().padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const loadDailyNoteContent = async (date: Date) => {
    setLoadingDailyNote(true);
    setSelectedDateNoteContent("");
    const dateStr = getFormattedDateStr(date);
    const existing = dailyNotes.find(n => n.date === dateStr);
    
    if (existing) {
      try {
        const res = await fetch(`/api/dashboard?notePath=${encodeURIComponent(existing.path)}`);
        const data = await res.json();
        setSelectedDateNoteContent(data.content);
      } catch (e) {
        setSelectedDateNoteContent("שגיאה בטעינת הקובץ.");
      }
    } else {
      setSelectedDateNoteContent(""); // No file
    }
    setLoadingDailyNote(false);
  };

  const handleCreateDailyNote = async (date: Date) => {
    const dateStr = getFormattedDateStr(date);
    try {
      setLoadingDailyNote(true);
      const res = await fetch("/api/dashboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "createDailyNote",
          date: dateStr
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`פתק יומי נוצר בהצלחה עבור ${dateStr}!`, "success");
        await fetchData(); // Refresh daily notes list
        setTimeout(() => {
          loadDailyNoteContent(date);
        }, 500);
      }
    } catch (e) {
      showToast("שגיאה ביצירת פתק יומי", "info");
      setLoadingDailyNote(false);
    }
  };

  useEffect(() => {
    if (activeTab === "calendar" && !loading) {
      loadDailyNoteContent(selectedDate);
    }
  }, [selectedDate, activeTab, dailyNotes.length, loading]);

  const getDaysInMonth = (year: number, month: number) => {
    const date = new Date(year, month, 1);
    const days: (Date | null)[] = [];
    const firstDayIndex = date.getDay();
    
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }
    while (date.getMonth() === month) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return days;
  };

  const handlePrevMonth = () => {
    if (calendarMonth === 0) {
      setCalendarMonth(11);
      setCalendarYear(prev => prev - 1);
    } else {
      setCalendarMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (calendarMonth === 11) {
      setCalendarMonth(0);
      setCalendarYear(prev => prev + 1);
    } else {
      setCalendarMonth(prev => prev + 1);
    }
  };

  const monthNamesHebrew = [
    "ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני",
    "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"
  ];

  // Dynamic Graph Physics Simulation & Rendering (Adapted for Light Theme)
  useEffect(() => {
    if (!canvasRef.current || loading || graphData.nodes.length === 0 || activeTab !== "secondbrain") return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      canvas.width = rect?.width || 800;
      canvas.height = rect?.height || 500;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const initializePhysics = () => {
      const existingMap = new Map(physicsNodesRef.current.map(n => [n.id, n]));
      
      const newPhysicsNodes = graphData.nodes.map(node => {
        const existing = existingMap.get(node.id);
        if (existing) {
          existing.tasksCount = node.tasksCount;
          existing.completedTasksCount = node.completedTasksCount;
          return existing;
        }
        
        const angle = Math.random() * Math.PI * 2;
        const radius = 100 + Math.random() * 150;
        return {
          ...node,
          x: canvas.width / 2 + Math.cos(angle) * radius,
          y: canvas.height / 2 + Math.sin(angle) * radius,
          vx: 0,
          vy: 0,
          radius: node.type === "note" ? 14 + (node.tasksCount * 1.5) : 10,
          mass: node.type === "note" ? 1.5 : 1.0,
        };
      });

      physicsNodesRef.current = newPhysicsNodes;
    };
    initializePhysics();

    const resolveLinks = () => {
      return graphData.links.map(link => {
        const sourceNode = physicsNodesRef.current.find(n => n.id === link.source);
        const targetNode = physicsNodesRef.current.find(n => n.id === link.target);
        return { source: sourceNode, target: targetNode, type: link.type };
      }).filter(l => l.source && l.target);
    };

    let resolvedLinks = resolveLinks();

    let animationId: number;
    const kRepulsion = 1200;
    const kGravity = 0.04;
    const kSpring = 0.06;
    const springLength = 120;
    const damping = 0.85;

    const tick = () => {
      const nodes = physicsNodesRef.current;
      const w = canvas.width;
      const h = canvas.height;
      const center = { x: w / 2, y: h / 2 };

      for (let i = 0; i < nodes.length; i++) {
        const n1 = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const n2 = nodes[j];
          const dx = n2.x - n1.x;
          const dy = n2.y - n1.y;
          const distSq = dx * dx + dy * dy || 1;
          const dist = Math.sqrt(distSq);

          if (dist < 400) {
            const force = kRepulsion / distSq;
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;

            if (n1 !== draggedNodeRef.current) {
              n1.vx -= fx / n1.mass;
              n1.vy -= fy / n1.mass;
            }
            if (n2 !== draggedNodeRef.current) {
              n2.vx += fx / n2.mass;
              n2.vy += fy / n2.mass;
            }
          }
        }
      }

      for (const link of resolvedLinks) {
        const s = link.source;
        const t = link.target;
        const dx = t.x - s.x;
        const dy = t.y - s.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const delta = dist - springLength;
        const force = delta * kSpring;

        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;

        if (s !== draggedNodeRef.current) {
          s.vx += fx / s.mass;
          s.vy += fy / s.mass;
        }
        if (t !== draggedNodeRef.current) {
          t.vx -= fx / t.mass;
          t.vy -= fy / t.mass;
        }
      }

      for (const node of nodes) {
        if (node === draggedNodeRef.current) continue;

        const dx = center.x - node.x;
        const dy = center.y - node.y;
        node.vx += dx * kGravity;
        node.vy += dy * kGravity;

        node.vx *= damping;
        node.vy *= damping;

        node.x += node.vx;
        node.y += node.vy;

        node.x = Math.max(50, Math.min(w - 50, node.x));
        node.y = Math.max(50, Math.min(h - 50, node.y));
      }

      ctx.clearRect(0, 0, w, h);
      ctx.save();
      
      ctx.translate(transformRef.current.x, transformRef.current.y);
      ctx.scale(transformRef.current.zoom, transformRef.current.zoom);

      for (const link of resolvedLinks) {
        ctx.beginPath();
        ctx.moveTo(link.source.x, link.source.y);
        ctx.lineTo(link.target.x, link.target.y);
        
        if (link.type === "tag-link") {
          ctx.strokeStyle = "rgba(99, 102, 241, 0.15)";
          ctx.lineWidth = 1;
          ctx.setLineDash([4, 4]);
        } else {
          ctx.strokeStyle = "rgba(0, 0, 0, 0.06)";
          ctx.lineWidth = 1.5;
          ctx.setLineDash([]);
        }
        ctx.stroke();
      }
      ctx.setLineDash([]);

      for (const node of nodes) {
        const isSelected = selectedNode?.id === node.id;
        
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        
        ctx.shadowBlur = isSelected ? 15 : 4;
        
        if (node.type === "note") {
          const hasTasks = node.tasksCount > 0;
          if (hasTasks) {
            const ratio = node.completedTasksCount / node.tasksCount;
            if (ratio === 1) {
              ctx.fillStyle = "rgba(22, 163, 74, 0.85)"; // Elegant Forest Green
              ctx.shadowColor = "rgba(22, 163, 74, 0.3)";
            } else {
              ctx.fillStyle = "rgba(14, 116, 144, 0.85)"; // Elegant Cyan-Teal
              ctx.shadowColor = "rgba(14, 116, 144, 0.3)";
            }
          } else {
            ctx.fillStyle = "rgba(71, 85, 105, 0.8)";
            ctx.shadowColor = "rgba(71, 85, 105, 0.15)";
          }
        } else {
          ctx.fillStyle = "rgba(79, 70, 229, 0.85)"; // Royal Indigo/Purple
          ctx.shadowColor = "rgba(79, 70, 229, 0.3)";
        }
        
        ctx.fill();

        if (isSelected) {
          ctx.strokeStyle = "#4f46e5";
          ctx.lineWidth = 2.5;
          ctx.stroke();
        }

        ctx.shadowBlur = 0;
        ctx.font = isSelected ? "bold 11px var(--font-sans), sans-serif" : "10px var(--font-sans), sans-serif";
        ctx.fillStyle = isSelected ? "#1e1b4b" : "rgba(30, 27, 75, 0.8)";
        ctx.textAlign = "center";
        
        const labelText = node.type === "note" && node.tasksCount > 0
          ? `${node.label} (${node.completedTasksCount}/${node.tasksCount})`
          : node.label;

        ctx.fillText(labelText, node.x, node.y - node.radius - 8);
      }

      ctx.restore();
      animationId = requestAnimationFrame(tick);
    };

    tick();

    const getTransformedCoords = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      const tx = (x - transformRef.current.x) / transformRef.current.zoom;
      const ty = (y - transformRef.current.y) / transformRef.current.zoom;
      return { x: tx, y: ty };
    };

    const handleMouseDown = (e: MouseEvent) => {
      const { x, y } = getTransformedCoords(e.clientX, e.clientY);
      let clickedNode = null;
      for (const node of physicsNodesRef.current) {
        const dx = node.x - x;
        const dy = node.y - y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist <= node.radius + 10) {
          clickedNode = node;
          break;
        }
      }

      if (clickedNode) {
        draggedNodeRef.current = clickedNode;
        clickedNode.vx = 0;
        clickedNode.vy = 0;
      } else {
        isDraggingRef.current = true;
        dragStartRef.current = { x: e.clientX - transformRef.current.x, y: e.clientY - transformRef.current.y };
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (draggedNodeRef.current) {
        const { x, y } = getTransformedCoords(e.clientX, e.clientY);
        draggedNodeRef.current.x = x;
        draggedNodeRef.current.y = y;
        draggedNodeRef.current.vx = 0;
        draggedNodeRef.current.vy = 0;
      } else if (isDraggingRef.current) {
        transformRef.current.x = e.clientX - dragStartRef.current.x;
        transformRef.current.y = e.clientY - dragStartRef.current.y;
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (draggedNodeRef.current) {
        const sNode = graphData.nodes.find(n => n.id === draggedNodeRef.current.id);
        if (sNode) {
          loadNoteContent(sNode);
        }
        draggedNodeRef.current = null;
      }
      isDraggingRef.current = false;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomIntensity = 0.08;
      const mouseCoords = getTransformedCoords(e.clientX, e.clientY);
      const direction = e.deltaY < 0 ? 1 : -1;
      const targetZoom = Math.max(0.2, Math.min(4, transformRef.current.zoom + direction * zoomIntensity));
      
      transformRef.current.x -= mouseCoords.x * (targetZoom - transformRef.current.zoom);
      transformRef.current.y -= mouseCoords.y * (targetZoom - transformRef.current.zoom);
      transformRef.current.zoom = targetZoom;
    };

    canvas.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("wheel", handleWheel);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resizeCanvas);
      canvas.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("wheel", handleWheel);
    };
  }, [loading, graphData, selectedNode, activeTab]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-[#f8fafc] text-slate-800">
        <div className="flex flex-col items-center gap-5">
          <div className="w-10 h-10 rounded-full border-t-2 border-r-2 border-indigo-600 animate-spin"></div>
          <p className="text-slate-500 text-xs tracking-widest uppercase">Initializing Prodify Workspace...</p>
        </div>
      </div>
    );
  }

  const activeAgent = agents.find(a => a.id === activeChatAgentId) || agents[0];

  return (
    <div className="relative min-h-[100dvh] bg-[#f4f3f8] text-slate-800 flex font-sans selection:bg-indigo-500/20 overflow-x-hidden">
      
      {/* 1. Global Glowing Grid Backdrop (Exact Prodify Style) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* Soft, beautiful grid line overlay */}
        <div className="absolute inset-0 opacity-[0.05]" style={{
          backgroundImage: "linear-gradient(to right, rgba(99, 102, 241, 0.4) 1px, transparent 1px), linear-gradient(to bottom, rgba(99, 102, 241, 0.4) 1px, transparent 1px)",
          backgroundSize: "22px 22px"
        }} />
        
        {/* Glowing atmospheric pastel meshes */}
        <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] bg-indigo-200/40 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: "12s" }} />
        <div className="absolute bottom-[10%] right-[5%] w-[500px] h-[500px] bg-sky-200/30 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: "8s" }} />
        <div className="absolute top-[35%] left-[5%] w-[450px] h-[450px] bg-emerald-100/30 rounded-full blur-[110px]" />
      </div>

      {/* Floating Alert Toast */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-[fadeIn_0.3s_cubic-bezier(0.32,0.72,0,1)]">
          <div className="bg-white/95 border border-indigo-100/50 backdrop-blur-3xl rounded-full px-6 py-3 flex items-center gap-3 shadow-[0_15px_40px_rgba(99,102,241,0.08)]">
            <span className={`w-2.5 h-2.5 rounded-full ${toast.type === "success" ? "bg-emerald-500 animate-ping" : "bg-indigo-500 animate-ping"}`} />
            <p className="text-xs font-bold tracking-wide text-indigo-950" dir="rtl">{toast.message}</p>
          </div>
        </div>
      )}

      {/* 2. Premium Light Sidebar (Doppelrand Enclosure) */}
      <aside className="w-20 md:w-24 bg-white/70 border-r border-indigo-100/30 backdrop-blur-3xl z-20 flex flex-col items-center py-10 justify-between shrink-0 shadow-[1px_0_15px_rgba(99,102,241,0.02)]">
        
        {/* Core System Brand Logo (Double-Bezel Nested) */}
        <div className="relative p-1 bg-white/80 rounded-2xl border border-indigo-100/40 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white font-black text-xs tracking-wider shadow-md">
            P.AI
          </div>
        </div>

        {/* Tab Navigation Icons (Phosphor Light / Linear Style) */}
        <nav className="flex flex-col gap-4.5 w-full px-3">
          
          <button 
            onClick={() => { setActiveTab("dashboard"); setSelectedNode(null); }}
            className={`group relative flex flex-col items-center justify-center py-4 rounded-2xl transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] gap-1 ${
              activeTab === "dashboard" 
                ? "bg-white text-indigo-600 border border-indigo-100/60 shadow-[0_4px_12px_rgba(99,102,241,0.05)]" 
                : "text-slate-400 hover:text-slate-700"
            }`}
          >
            <svg className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
            </svg>
            <span className="text-[9px] font-bold tracking-wider">לוח בקרה</span>
          </button>

          <button 
            onClick={() => { setActiveTab("secondbrain"); setSelectedNode(null); }}
            className={`group relative flex flex-col items-center justify-center py-4 rounded-2xl transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] gap-1 ${
              activeTab === "secondbrain" 
                ? "bg-white text-indigo-600 border border-indigo-100/60 shadow-[0_4px_12px_rgba(99,102,241,0.05)]" 
                : "text-slate-400 hover:text-slate-700"
            }`}
          >
            <svg className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
            </svg>
            <span className="text-[9px] font-bold tracking-wider">מוח שני</span>
          </button>

          <button 
            onClick={() => { setActiveTab("calendar"); setSelectedNode(null); }}
            className={`group relative flex flex-col items-center justify-center py-4 rounded-2xl transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] gap-1 ${
              activeTab === "calendar" 
                ? "bg-white text-emerald-600 border border-indigo-100/60 shadow-[0_4px_12px_rgba(99,102,241,0.05)]" 
                : "text-slate-400 hover:text-slate-700"
            }`}
          >
            <svg className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
            </svg>
            <span className="text-[9px] font-bold tracking-wider">יומן יומי</span>
          </button>

          <button 
            onClick={() => { setActiveTab("chat"); setSelectedNode(null); }}
            className={`group relative flex flex-col items-center justify-center py-4 rounded-2xl transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] gap-1 ${
              activeTab === "chat" 
                ? "bg-white text-indigo-600 border border-indigo-100/60 shadow-[0_4px_12px_rgba(99,102,241,0.05)]" 
                : "text-slate-400 hover:text-slate-700"
            }`}
          >
            <svg className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v5.751Z" />
            </svg>
            <span className="text-[9px] font-bold tracking-wider">צ'אט סוכנים</span>
          </button>

          <button 
            onClick={() => { setActiveTab("tarot"); setSelectedNode(null); }}
            className={`group relative flex flex-col items-center justify-center py-4 rounded-2xl transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] gap-1 ${
              activeTab === "tarot" 
                ? "bg-white text-purple-600 border border-indigo-100/60 shadow-[0_4px_12px_rgba(99,102,241,0.05)]" 
                : "text-slate-400 hover:text-slate-700"
            }`}
          >
            <svg className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-.153-8.157-.418m16.314 0a9.003 9.003 0 0 1-16.314 0" />
            </svg>
            <span className="text-[9px] font-bold tracking-wider">טארוט</span>
          </button>

          <button 
            onClick={() => { setActiveTab("logs"); setSelectedNode(null); }}
            className={`group relative flex flex-col items-center justify-center py-4 rounded-2xl transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] gap-1 ${
              activeTab === "logs" 
                ? "bg-white text-amber-500 border border-indigo-100/60 shadow-[0_4px_12px_rgba(99,102,241,0.05)]" 
                : "text-slate-400 hover:text-slate-700"
            }`}
          >
            <svg className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12M8.25 17.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.007 5.25H3.75v.008h.007V12Zm0 5.25H3.75v.008h.007v-.008Z" />
            </svg>
            <span className="text-[9px] font-bold tracking-wider">לוגים</span>
          </button>

        </nav>

        {/* User Workspace Profile Circle */}
        <div className="relative p-0.5 rounded-full bg-gradient-to-tr from-indigo-500 to-indigo-400 shadow-md cursor-pointer hover:scale-105 active:scale-95 transition-all duration-300">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center font-bold text-xs text-indigo-950 border border-indigo-100">
            GJ
          </div>
        </div>
      </aside>

      {/* 3. Main Dashboard Workspace (Right aligned) */}
      <div className="flex-1 flex flex-col min-h-screen relative z-10 overflow-hidden">
        
        {/* Top Navbar */}
        <header className="w-full px-6 py-6 md:px-10 border-b border-indigo-100/20 flex flex-col md:flex-row items-center justify-between gap-4 bg-white/40 backdrop-blur-xl">
          <div className="text-right w-full md:w-auto">
            <div className="flex items-center gap-2 justify-end md:justify-start">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]" />
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Prodify Core Engine Active</span>
            </div>
            <h1 className="text-xl font-black tracking-tight text-indigo-950 mt-1">Prodify AI // שולחן השירות והמוח השני</h1>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <div className="bg-white/80 border border-indigo-100/40 px-4 py-2 rounded-2xl flex items-center gap-3 text-xs shadow-sm">
              <span className="text-slate-400 font-semibold">שרת מרוחק:</span>
              <span className="text-indigo-600 font-black font-mono">192.168.1.26</span>
            </div>
            <button 
              onClick={fetchData}
              className="w-10 h-10 rounded-2xl bg-white border border-indigo-100/40 flex items-center justify-center text-slate-400 hover:text-slate-800 active:scale-95 transition-all duration-300 shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
            </button>
          </div>
        </header>

        {/* Dynamic Workspace content based on Tab Selection */}
        <div className="flex-1 p-6 md:p-10 overflow-y-auto">
          
          {/* TAB 1: Main Dashboard Overview */}
          {activeTab === "dashboard" && (
            <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
              
              {/* Top Bento Row: Core Analytics widgets */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* Widget 1: Token consumption (col-span-4) */}
                <div className="md:col-span-4 relative bg-white/80 border border-indigo-100/30 p-1.5 rounded-[2rem] shadow-[0_10px_30px_rgba(99,102,241,0.02)] overflow-hidden">
                  <div className="relative bg-white border border-indigo-100/10 rounded-[calc(2rem-0.375rem)] p-5">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">צריכת טוקנים כוללת</span>
                      <span className="text-[9px] bg-indigo-500/10 text-indigo-600 px-2.5 py-1 rounded-full font-black tracking-wider">TOTAL TOKENS</span>
                    </div>
                    <p className="text-3xl font-black text-slate-800 tracking-tight font-mono">{tokenStats?.totalTokens.toLocaleString()}</p>
                    
                    <div className="mt-4 w-full h-10 opacity-70">
                      {tokenStats && (
                        <svg className="w-full h-full" viewBox="0 0 100 20" preserveAspectRatio="none">
                          <path
                            d={`M 0,${18 - (tokenStats.dailyHistory[0].tokens / 400000) * 15} 
                               L 16.6,${18 - (tokenStats.dailyHistory[1].tokens / 400000) * 15} 
                               L 33.3,${18 - (tokenStats.dailyHistory[2].tokens / 400000) * 15} 
                               L 50,${18 - (tokenStats.dailyHistory[3].tokens / 400000) * 15} 
                               L 66.6,${18 - (tokenStats.dailyHistory[4].tokens / 400000) * 15} 
                               L 83.3,${18 - (tokenStats.dailyHistory[5].tokens / 400000) * 15} 
                               L 100,${18 - (tokenStats.dailyHistory[6].tokens / 400000) * 15}`}
                            fill="none"
                            stroke="#4f46e5"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>

                {/* Widget 2: Time Tracker with Stopwatch (col-span-4) (Donezo Green Accent with stripes) */}
                <div className="md:col-span-4 relative bg-white/80 border border-indigo-100/30 p-1.5 rounded-[2rem] shadow-[0_10px_30px_rgba(99,102,241,0.02)] overflow-hidden">
                  <div className="relative bg-white border border-indigo-100/10 rounded-[calc(2rem-0.375rem)] p-5 flex flex-col justify-between h-full min-h-[150px]">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 px-2.5 py-1 rounded-full font-black tracking-wider flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full bg-emerald-500 ${isStopwatchRunning ? "animate-pulse" : ""}`} />
                        TIME TRACKER
                      </span>
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">מד זמן פעילות</span>
                    </div>

                    <div className="flex items-center justify-between my-2">
                      <div className="flex gap-1.5">
                        <button 
                          onClick={handleResetStopwatch}
                          className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-200 hover:text-slate-800 active:scale-90 transition-all duration-300"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7" />
                          </svg>
                        </button>
                        <button 
                          onClick={handleStartPauseStopwatch}
                          className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all duration-300 active:scale-90 shadow-sm ${
                            isStopwatchRunning 
                              ? "bg-amber-500/10 border-amber-500/20 text-amber-600 hover:bg-amber-500/20" 
                              : "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 hover:bg-emerald-500/20"
                          }`}
                        >
                          {isStopwatchRunning ? (
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                            </svg>
                          ) : (
                            <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z"/>
                            </svg>
                          )}
                        </button>
                      </div>

                      {/* Display clock digits */}
                      <div className="relative px-3.5 py-1.5 bg-emerald-500/[0.02] border border-emerald-500/15 rounded-xl overflow-hidden flex items-center">
                        <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_6px,rgba(16,185,129,0.02)_6px,rgba(16,185,129,0.02)_12px)] pointer-events-none" />
                        <span className="text-2xl font-black text-emerald-600 tracking-wider font-mono z-10">
                          {formatStopwatchTime(stopwatchSeconds)}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between text-[10px] mt-2 border-t border-slate-100 pt-2 text-slate-400">
                      <span>סטטוס:</span>
                      <span className={isStopwatchRunning ? "text-emerald-600 font-bold" : "text-slate-500"}>
                        {isStopwatchRunning ? "ספירה פעילה בלייב..." : "מושהה"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Widget 3: Brain index metrics (col-span-4) */}
                <div className="md:col-span-4 relative bg-white/80 border border-indigo-100/30 p-1.5 rounded-[2rem] shadow-[0_10px_30px_rgba(99,102,241,0.02)] overflow-hidden">
                  <div className="relative bg-white border border-indigo-100/10 rounded-[calc(2rem-0.375rem)] p-5">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">קבצי ידע ממופים</span>
                      <span className="text-[9px] bg-purple-500/10 text-purple-600 px-2.5 py-1 rounded-full font-black tracking-wider">KNOWLEDGE BASE</span>
                    </div>
                    <p className="text-3xl font-black text-slate-800 tracking-tight font-mono">{notesCount}</p>
                    <div className="flex justify-between text-[10px] text-slate-400 mt-4 border-t border-slate-100 pt-2">
                      <span>סה"כ תגיות בשימוש:</span>
                      <span className="text-purple-600 font-bold">{tagsCount} תגיות</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Central Bento Grid Split: Active Agents Grid on the left, Live Agent Chat Console on the right */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left side: Connected agents list (5 columns) */}
                <div className="lg:col-span-5 flex flex-col gap-4 text-right">
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2 justify-end">
                    סוכנים וירטואליים מחוברים
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  </h3>

                  <div className="space-y-4">
                    {agents.map((agent) => {
                      const isSelectedForChat = agent.id === activeChatAgentId;
                      return (
                        <div 
                          key={agent.id}
                          className={`relative p-1 rounded-2xl border transition-all duration-300 text-right ${
                            isSelectedForChat ? "border-indigo-500/30 bg-white shadow-sm" : "border-indigo-100/20 bg-white/60"
                          }`}
                        >
                          <div className="relative p-4 flex items-center justify-between gap-4">
                            <button 
                              onClick={() => {
                                setActiveChatAgentId(agent.id);
                                setActiveTab("chat");
                                showToast(`מנווט לצ'אט מול ${agent.name}`, "info");
                              }}
                              className="px-3.5 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-[9px] font-black text-indigo-600 hover:bg-slate-100 hover:text-indigo-800 active:scale-95 transition-all duration-300"
                            >
                              פתח צ'אט
                            </button>
                            
                            <div className="text-right flex-1">
                              <div className="flex items-center gap-1.5 justify-end">
                                <span className={`w-1.5 h-1.5 rounded-full ${agent.status === "working" ? "bg-emerald-500 animate-pulse" : "bg-slate-300"}`} />
                                <h4 className="font-bold text-slate-800 text-xs">{agent.name}</h4>
                              </div>
                              <p className="text-[10px] text-slate-400 mt-0.5">{agent.role} • {agent.model}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right side: Live Chat Preview (7 columns) */}
                <div className="lg:col-span-7 relative bg-white/80 border border-indigo-100/30 p-1.5 rounded-[2rem] shadow-[0_10px_30px_rgba(99,102,241,0.02)] overflow-hidden">
                  <div className="relative bg-white border border-indigo-100/10 rounded-[calc(2rem-0.375rem)] p-6 h-full flex flex-col justify-between min-h-[350px]">
                    <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-100">
                      <button 
                        onClick={() => setActiveTab("chat")}
                        className="text-[10px] text-indigo-600 font-bold hover:underline"
                      >
                        הרחב לצ'אט מלא ↗
                      </button>
                      <div className="text-right">
                        <h3 className="font-bold text-slate-800 text-sm">קונסולת שידור חם: {activeAgent.name}</h3>
                        <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">{activeAgent.role}</p>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-3 max-h-[160px] pr-1.5 scrollbar-thin flex flex-col justify-end">
                      {chatMessages.slice(-3).map((msg, idx) => (
                        <div key={idx} className={`text-xs p-3.5 rounded-xl border ${msg.sender === "user" ? "bg-indigo-50/20 border-indigo-100/40 text-left" : "bg-slate-50/50 border-slate-100 text-right"}`}>
                          <p className="text-[8px] text-slate-400 mb-1 font-mono uppercase tracking-widest">{msg.sender === "user" ? "יורי" : activeAgent.name}</p>
                          <p className="text-slate-700 font-medium leading-relaxed">{msg.text}</p>
                        </div>
                      ))}
                    </div>

                    <form onSubmit={handleSendMessage} className="mt-4 flex gap-2">
                      <button 
                        type="submit"
                        className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-black text-white active:scale-95 transition-all duration-300 shadow-sm"
                      >
                        שלח
                      </button>
                      <input 
                        type="text"
                        value={typedMessage}
                        onChange={(e) => setTypedMessage(e.target.value)}
                        placeholder={`כתוב פקודה ל-${activeAgent.name}...`}
                        className="flex-1 bg-slate-50 border border-slate-150 rounded-xl px-4 py-2.5 text-xs text-right focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                        dir="rtl"
                      />
                    </form>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: Obsidian Second Brain Graph Mapping */}
          {activeTab === "secondbrain" && (
            <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Visualizer network (8 columns) */}
                <div className="lg:col-span-8 relative bg-white/80 border border-indigo-100/30 p-1.5 rounded-[2rem] shadow-[0_10px_30px_rgba(99,102,241,0.02)] overflow-hidden">
                  <div className="relative bg-white border border-indigo-100/10 rounded-[calc(2rem-0.375rem)] flex flex-col min-h-[500px]">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between relative z-10 bg-white/40 backdrop-blur-md">
                      <span className="text-[9px] font-mono bg-purple-100/50 border border-purple-200/50 text-purple-700 px-3 py-1 rounded-full uppercase tracking-widest font-black">
                        {tagsCount} TAGS RESOLVED
                      </span>
                      <div className="text-right">
                        <h3 className="font-black text-slate-800 text-sm">מיפוי רשת קשרים ויזואלית: מוח שני אובסידיאן</h3>
                        <p className="text-[10px] text-slate-400 mt-1">ניווט, גרירה, וזום באמצעות העכבר. לחיצה על קובץ תטען את תוכנו במגירה הצידית.</p>
                      </div>
                    </div>

                    <div className="flex-1 relative bg-slate-50/50 overflow-hidden min-h-[400px]">
                      {/* Grid background inside canvas view for architectural canvas feel */}
                      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
                        backgroundImage: "linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)",
                        backgroundSize: "18px 18px"
                      }} />
                      <canvas 
                        ref={canvasRef} 
                        className="w-full h-full cursor-grab active:cursor-grabbing block relative z-10"
                      />
                    </div>
                  </div>
                </div>

                {/* Tasks panel (4 columns) */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                  
                  {/* Task list */}
                  <div className="bg-white border border-indigo-100/30 rounded-[2rem] p-6 shadow-sm flex-1 flex flex-col justify-between min-h-[380px]">
                    <div>
                      <h3 className="font-black text-slate-800 text-xs mb-4 flex items-center gap-2 justify-end">
                        ניהול משימות אובסידיאן
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      </h3>

                      <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1 scrollbar-thin">
                        {tasks.length === 0 ? (
                          <p className="text-xs text-slate-400 text-center py-10">אין משימות פתוחות באובסידיאן.</p>
                        ) : (
                          tasks.map((task) => (
                            <div 
                              key={task.id} 
                              className="relative flex items-center justify-between bg-slate-50/50 border border-slate-100 rounded-xl px-4 py-3 hover:bg-white hover:shadow-sm transition-all overflow-hidden"
                            >
                              {task.completed && (
                                <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_6px,rgba(16,185,129,0.01)_6px,rgba(16,185,129,0.01)_12px)] pointer-events-none" />
                              )}
                              <input 
                                type="checkbox" 
                                checked={task.completed}
                                onChange={() => handleToggleTask(task)}
                                className="w-4.5 h-4.5 rounded border-slate-200 bg-white text-indigo-600 accent-indigo-600 cursor-pointer transition-transform active:scale-90"
                              />
                              <span className={`text-xs text-right flex-1 pr-3 font-semibold ${task.completed ? "text-slate-400 line-through font-normal" : "text-slate-700"}`} dir="rtl">
                                {task.text}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Create Task Form */}
                    <form onSubmit={handleCreateTask} className="mt-6 border-t border-slate-100 pt-4 space-y-3">
                      <input 
                        type="text" 
                        value={newTaskText}
                        onChange={(e) => setNewTaskText(e.target.value)}
                        placeholder="הוסף משימה חדשה..."
                        className="w-full bg-slate-50 border border-slate-150 rounded-xl px-3.5 py-3 text-xs text-right focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                        dir="rtl"
                      />
                      <button 
                        type="submit"
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-[10px] font-black uppercase tracking-wider text-white rounded-xl active:scale-95 transition-all shadow-md"
                      >
                        הזרק משימה לאובסידיאן ↗
                      </button>
                    </form>
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* TAB 3: GORGEOUS CALENDAR & DAILY PLANNER */}
          {activeTab === "calendar" && (
            <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Visual Month Calendar Card (7 Columns) */}
                <div className="lg:col-span-7 relative bg-white/80 border border-indigo-100/30 p-1.5 rounded-[2rem] shadow-[0_10px_30px_rgba(99,102,241,0.02)] overflow-hidden transition-all duration-500 hover:border-white/10">
                  <div className="relative bg-white border border-indigo-100/10 rounded-[calc(2rem-0.375rem)] p-6 flex flex-col min-h-[480px]">
                    
                    {/* Month Navigator Header */}
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                      <div className="flex gap-2">
                        <button 
                          onClick={handlePrevMonth}
                          className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-800 active:scale-90 transition-all duration-300 shadow-sm"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                          </svg>
                        </button>
                        <button 
                          onClick={handleNextMonth}
                          className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-800 active:scale-90 transition-all duration-300 shadow-sm"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                          </svg>
                        </button>
                      </div>
                      
                      <h3 className="text-base font-black text-slate-800 tracking-wide">
                        {monthNamesHebrew[calendarMonth]} {calendarYear}
                      </h3>
                    </div>

                    {/* Day Names Grid */}
                    <div className="grid grid-cols-7 gap-2.5 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                      <span>א'</span>
                      <span>ב'</span>
                      <span>ג'</span>
                      <span>ד'</span>
                      <span>ה'</span>
                      <span>ו'</span>
                      <span>ש'</span>
                    </div>

                    {/* Monthly Days Grid */}
                    <div className="grid grid-cols-7 gap-2.5 flex-1">
                      {getDaysInMonth(calendarYear, calendarMonth).map((day, idx) => {
                        if (!day) return <div key={`empty-${idx}`} className="opacity-0" />;
                        
                        const dateStr = getFormattedDateStr(day);
                        const hasNote = dailyNotes.some(n => n.date === dateStr);
                        const isSelected = getFormattedDateStr(selectedDate) === dateStr;
                        const isToday = getFormattedDateStr(new Date()) === dateStr;

                        return (
                          <button
                            key={dateStr}
                            onClick={() => {
                              setSelectedDate(day);
                              showToast(`נטען יומן עבור תאריך ${dateStr}`, "info");
                            }}
                            className={`relative aspect-square rounded-2xl border flex flex-col items-center justify-center transition-all duration-300 active:scale-95 ${
                              isSelected 
                                ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-700 font-bold shadow-sm" 
                                : isToday 
                                  ? "bg-slate-100 border-slate-300 text-slate-800 font-extrabold shadow-sm"
                                  : "bg-slate-50/50 border-slate-100 text-slate-500 hover:border-slate-200 hover:text-slate-800 hover:bg-slate-100/50"
                            }`}
                          >
                            <span className="text-xs">{day.getDate()}</span>
                            
                            {/* Daily Note Indicator Dot */}
                            {hasNote && (
                              <span className="absolute bottom-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                  </div>
                </div>

                {/* Selected Day's Content Planner & Editor (5 Columns) */}
                <div className="lg:col-span-5 flex flex-col">
                  <div className="bg-white border border-indigo-100/30 rounded-[2rem] p-6 shadow-sm flex-1 flex flex-col justify-between min-h-[480px]">
                    
                    {/* Header */}
                    <div className="border-b border-slate-100 pb-4 mb-4 text-right">
                      <span className="text-[9px] bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 px-3 py-1 rounded-full font-black tracking-wider uppercase">
                        DAILY PLANNER
                      </span>
                      <h3 className="font-black text-slate-800 text-base mt-2">פתק יומי: {getFormattedDateStr(selectedDate)}</h3>
                    </div>

                    {/* Content View */}
                    <div className="flex-1 overflow-y-auto max-h-[300px] pr-1 scrollbar-thin text-right">
                      {loadingDailyNote ? (
                        <div className="flex flex-col items-center justify-center h-48 gap-3">
                          <div className="w-6 h-6 rounded-full border-t-2 border-r-2 border-emerald-500 animate-spin" />
                          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Loading content...</p>
                        </div>
                      ) : selectedDateNoteContent ? (
                        <div className="space-y-5">
                          {/* Daily Tasks specific to the selected date */}
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest">משימות הפתק היומי:</span>
                            <div className="space-y-2 mt-2">
                              {tasks.filter(t => t.notePath === dailyNotes.find(n => n.date === getFormattedDateStr(selectedDate))?.path).length === 0 ? (
                                <p className="text-[10px] text-slate-500 font-medium">אין משימות מוגדרות בפתק זה.</p>
                              ) : (
                                tasks
                                  .filter(t => t.notePath === dailyNotes.find(n => n.date === getFormattedDateStr(selectedDate))?.path)
                                  .map(task => (
                                    <div 
                                      key={task.id} 
                                      className="relative flex items-center justify-between bg-slate-50/50 border border-slate-100 rounded-xl px-4 py-3 hover:bg-white hover:shadow-sm transition-all overflow-hidden"
                                    >
                                      {task.completed && (
                                        <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_6px,rgba(16,185,129,0.01)_6px,rgba(16,185,129,0.01)_12px)] pointer-events-none" />
                                      )}
                                      <input 
                                        type="checkbox" 
                                        checked={task.completed}
                                        onChange={() => handleToggleTask(task)}
                                        className="w-4.5 h-4.5 rounded border-slate-200 bg-white text-indigo-600 accent-indigo-600 cursor-pointer transition-transform active:scale-90"
                                      />
                                      <span className={`text-xs text-right flex-1 pr-3 font-semibold ${task.completed ? "text-slate-400 line-through font-normal" : "text-slate-700"}`} dir="rtl">
                                        {task.text}
                                      </span>
                                    </div>
                                  ))
                              )}
                            </div>
                          </div>

                          {/* Raw Markdown view */}
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest">תוכן פתק מקורי (Markdown):</span>
                            <pre className="mt-2 p-4 bg-slate-50 border border-slate-150 rounded-2xl text-[11px] font-mono text-slate-700 overflow-x-auto whitespace-pre-wrap leading-relaxed shadow-inner">
                              {selectedDateNoteContent}
                            </pre>
                          </div>
                        </div>
                      ) : (
                        /* Empty State CTA */
                        <div className="flex flex-col items-center justify-center text-center py-10 px-4 h-full">
                          <div className="relative p-3 bg-emerald-50 rounded-full border border-emerald-100 mb-4">
                            <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                            </svg>
                          </div>
                          <h4 className="font-black text-slate-800 text-sm">لا נמצא פתק יומן יומי</h4>
                          <p className="text-[10px] text-slate-500 mt-1.5 leading-relaxed">لا נוצר עדיין פתק אובסידיאן עבור תאריך זה. רוצה לאתחל אותו עם תבנית משימות ויעדים מהממת כעת?</p>
                          
                          <button
                            onClick={() => handleCreateDailyNote(selectedDate)}
                            className="mt-5 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-[10px] font-black uppercase tracking-wider text-white rounded-xl active:scale-95 transition-all shadow-md"
                          >
                            📝 צור פתק יומי חדש
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Actions if note exists */}
                    {selectedDateNoteContent && (
                      <div className="mt-4 border-t border-slate-100 pt-4 flex gap-2">
                        <button
                          onClick={() => {
                            const info = dailyNotes.find(n => n.date === getFormattedDateStr(selectedDate));
                            if (info) {
                              loadNoteContent({
                                id: getFormattedDateStr(selectedDate),
                                label: `Daily Note ${getFormattedDateStr(selectedDate)}`,
                                type: "note",
                                path: info.path,
                                tasksCount: 0,
                                completedTasksCount: 0,
                                tags: []
                              });
                            }
                          }}
                          className="flex-1 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-[10px] font-black text-slate-600 active:scale-95 transition-all"
                        >
                          📖 פתח פתק מלא במגירה הצידית
                        </button>
                        
                        <button
                          onClick={() => handleCreateDailyNote(selectedDate)}
                          className="px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-150 text-[10px] font-black text-indigo-600 rounded-xl active:scale-95 transition-all"
                        >
                          רענן / אתחל
                        </button>
                      </div>
                    )}

                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 4: Full Screen Dedicated Live Chat */}
          {activeTab === "chat" && (
            <div className="space-y-6 animate-[fadeIn_0.5s_ease-out] h-[650px] flex flex-col">
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 h-full">
                
                {/* Agent selector (4 columns) */}
                <div className="lg:col-span-4 bg-white border border-indigo-100/30 rounded-[2rem] p-5 flex flex-col gap-3 overflow-y-auto scrollbar-thin text-right shadow-sm">
                  <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">בחר סוכן לשיחה</h3>
                  
                  {agents.map((agent) => {
                    const isSelected = agent.id === activeChatAgentId;
                    return (
                      <button
                        key={agent.id}
                        onClick={() => {
                          setActiveChatAgentId(agent.id);
                          showToast(`צ'אט פעיל מול ${agent.name}`, "success");
                        }}
                        className={`w-full text-right p-4 rounded-2xl border transition-all duration-300 ${
                          isSelected ? "border-indigo-500/40 bg-indigo-500/[0.01]" : "border-slate-100 bg-slate-50/50 hover:border-slate-200"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className={`w-2 h-2 rounded-full ${agent.status === "working" ? "bg-emerald-500 animate-pulse" : "bg-slate-300"}`} />
                          <div className="text-right">
                            <h4 className="font-bold text-slate-800 text-xs">{agent.name}</h4>
                            <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">{agent.role}</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Big Chat viewport (8 columns) */}
                <div className="lg:col-span-8 relative bg-white/80 border border-indigo-100/30 p-1.5 rounded-[2rem] shadow-[0_10px_30px_rgba(99,102,241,0.02)] overflow-hidden h-full flex flex-col">
                  <div className="relative bg-white border border-indigo-100/10 rounded-[calc(2rem-0.375rem)] flex flex-col h-full justify-between">
                    
                    {/* Header */}
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                      {activeAgent.id === "max-linux-kernel" ? (
                        <span className="text-[9px] bg-cyan-500/10 border border-cyan-500/20 text-cyan-700 px-2.5 py-1 rounded-full animate-pulse font-black uppercase tracking-wider">
                          DISCORD WEBHOOK LINKED 🛡️
                        </span>
                      ) : (
                        <span className="text-[9px] bg-slate-100 border border-slate-200 text-slate-500 px-2.5 py-1 rounded-full font-black uppercase tracking-wider">
                          LOCAL AGENT CONNECTED
                        </span>
                      )}
                      
                      <div className="flex items-center gap-3">
                        <span className={`w-2 h-2 rounded-full ${activeAgent.status === "working" ? "bg-emerald-500 animate-pulse" : "bg-slate-300"}`} />
                        <div className="text-right">
                          <h4 className="font-bold text-slate-800 text-xs">צ'אט סוכנים חי: {activeAgent.name}</h4>
                          <p className="text-[9px] text-slate-400 font-mono">{activeAgent.model}</p>
                        </div>
                      </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin bg-slate-50/30">
                      {chatMessages.map((msg, idx) => {
                        const isUser = msg.sender === "user";
                        return (
                          <div 
                            key={idx} 
                            className={`flex flex-col max-w-[85%] ${isUser ? "ml-auto items-end" : "mr-auto items-start"}`}
                          >
                            <div className={`rounded-2xl px-4 py-3 text-xs font-semibold ${
                              isUser 
                                ? "bg-indigo-600 text-white rounded-br-none shadow-sm" 
                                : "bg-white border border-slate-150 text-slate-700 rounded-bl-none text-right shadow-sm"
                            }`} dir={isUser ? "ltr" : "rtl"}>
                              <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                            </div>
                            <span className="text-[8px] text-slate-400 mt-1 font-mono">{msg.time}</span>
                          </div>
                        );
                      })}
                      {isAgentTyping && (
                        <div className="flex flex-col items-start mr-auto">
                          <div className="bg-white border border-slate-150 rounded-2xl rounded-bl-none px-4 py-3 flex gap-1.5 items-center">
                            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                          </div>
                        </div>
                      )}
                      <div ref={chatEndRef} />
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-100 bg-white flex gap-2">
                      <button
                        type="submit"
                        disabled={isAgentTyping || !typedMessage.trim()}
                        className="px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-xs font-black text-white active:scale-95 transition-all duration-300 shadow-sm"
                      >
                        שלח ↗
                      </button>
                      <input 
                        type="text"
                        value={typedMessage}
                        onChange={(e) => setTypedMessage(e.target.value)}
                        placeholder={`פקד על ${activeAgent.name}...`}
                        className="flex-1 bg-slate-50 border border-slate-150 rounded-xl px-4 py-3 text-xs text-right focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                        dir="rtl"
                      />
                    </form>

                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB: Tarot Workspace (Cassie's Temple) */}
          {activeTab === "tarot" && (
            <TarotWorkspace showToast={showToast} />
          )}

          {/* TAB 5: Dedicated Live Logs View */}
          {activeTab === "logs" && (
            <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
              <div className="bg-white border border-indigo-100/30 rounded-[2rem] p-6 shadow-sm">
                <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-100">
                  <button 
                    onClick={() => { setLogs([]); showToast("הלוגים נוקו", "info"); }}
                    className="px-4 py-2 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-[10px] font-black text-red-600 rounded-full active:scale-95 transition-all"
                  >
                    נקה לוגים
                  </button>
                  <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest text-right">לוג פעילות מורחב</span>
                </div>
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin">
                  {logs.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-20">אין פעילויות רשומות כרגע.</p>
                  ) : (
                    logs.map((log) => (
                      <div key={log.id} className="text-xs border-b border-slate-100 pb-3 last:border-0 flex justify-between items-start gap-4">
                        <span className="text-[10px] text-slate-400 font-mono shrink-0">{log.time}</span>
                        <div className="text-right flex-1">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black font-mono ml-3 ${
                            log.type === "agent" ? "bg-purple-500/10 text-purple-700 border border-purple-500/10" : "bg-cyan-500/10 text-cyan-700 border border-cyan-500/10"
                          }`}>
                            {log.agent || "SYSTEM"}
                          </span>
                          <p className="text-slate-700 font-semibold leading-relaxed inline" dir="rtl">{log.message}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Note Reader Floating Drawer/Sidebar */}
      {selectedNode && (
        <div className="fixed inset-y-0 right-0 w-full md:w-[460px] bg-white/95 border-l border-indigo-100/30 shadow-[0_0_50px_rgba(99,102,241,0.06)] backdrop-blur-3xl z-40 flex flex-col animate-[slideLeft_0.4s_cubic-bezier(0.32,0.72,0,1)] text-right">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <button 
              onClick={() => setSelectedNode(null)}
              className="w-9 h-9 rounded-full bg-slate-50 border border-slate-200 hover:bg-slate-100 flex items-center justify-center active:scale-90 transition-all duration-300"
            >
              <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="flex items-center gap-2.5">
              <span className={`w-2.5 h-2.5 rounded-full ${selectedNode.type === "note" ? "bg-cyan-500" : "bg-purple-500"}`} />
              <h3 className="font-black text-slate-800 text-lg tracking-tight">{selectedNode.label}</h3>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {selectedNode.type === "tag" ? (
              <div className="space-y-4">
                <p className="text-zinc-400 text-xs font-semibold">קבצים המקושרים לתגית זו:</p>
                <div className="space-y-2.5">
                  {graphData.links
                    .filter(l => l.target === selectedNode.id)
                    .map(l => graphData.nodes.find(n => n.id === l.source))
                    .filter(Boolean)
                    .map((n: any) => (
                      <button
                        key={n.id}
                        onClick={() => loadNoteContent(n)}
                        className="w-full text-right bg-slate-50 hover:bg-slate-100 border border-slate-150 p-4 rounded-xl text-xs font-black text-slate-700 transition-all duration-300 flex justify-between items-center group shadow-sm"
                        dir="rtl"
                      >
                        <span className="text-[10px] text-slate-400 font-mono group-hover:text-indigo-600 transition-colors">Note ↗</span>
                        <span className="font-semibold">{n.label}</span>
                      </button>
                    ))}
                </div>
              </div>
            ) : loadingContent ? (
              <div className="flex flex-col items-center justify-center h-64 gap-4">
                <div className="w-8 h-8 rounded-full border-t-2 border-r-2 border-indigo-600 animate-spin" />
                <p className="text-xs text-slate-500 tracking-wider uppercase font-black">Loading content...</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-extrabold tracking-widest">נתיב קובץ פיזי</span>
                  <p className="text-xs font-mono text-indigo-600 mt-1.5 bg-slate-50 px-3 py-2 rounded-lg border border-slate-150 inline-block">{selectedNode.path}</p>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-extrabold tracking-widest">תוכן הקובץ (Markdown)</span>
                  <pre 
                    className="mt-3 p-5 bg-slate-50 border border-slate-150 rounded-2xl text-xs font-mono text-slate-700 overflow-x-auto whitespace-pre-wrap text-right leading-relaxed shadow-inner"
                    dir="rtl"
                  >
                    {selectedNodeContent || "הקובץ ריק."}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes slideLeft {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .scrollbar-thin::-webkit-scrollbar {
          width: 4px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 4px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.1);
        }
      `}</style>

    </div>
  );
}

"use client";

import Link from "next/link";
import { useState, useEffect, useMemo, useTransition } from "react";
import {
  getKanbanTasks,
  upsertKanbanTask,
  updateTaskStatus,
  deleteKanbanTask,
} from "@/actions/tasks";

function generateUUID(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export type TaskStatus = "todo" | "in_progress" | "done" | "on_hold";
export type TaskPriority = "urgent" | "high" | "medium" | "low";

export interface KanbanTask {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  category: string;
  createdAt: string;
}

function PaperlyLogo({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <polygon points="17,18 19,25 13,23" fill="#B2ABA0" />
      <polygon
        points="28,4 4,14 17,18"
        fill="#1E3A2B"
        stroke="#162C20"
        strokeWidth="0.5"
        strokeLinejoin="round"
      />
      <polygon
        points="28,4 17,18 20,28"
        fill="#2E553F"
        stroke="#162C20"
        strokeWidth="0.5"
        strokeLinejoin="round"
      />
      <line x1="28" y1="4" x2="17" y2="18" stroke="#3E6B52" strokeWidth="0.5" />
    </svg>
  );
}

const defaultTasks: KanbanTask[] = [];

const PRIORITY_MAP: Record<
  TaskPriority,
  {
    label: string;
    badgeBg: string;
    badgeText: string;
    badgeBorder: string;
    dot: string;
  }
> = {
  urgent: {
    label: "URGENT",
    badgeBg: "bg-[#FFF2E8]",
    badgeText: "text-[#D75800]",
    badgeBorder: "border-[#FCD8BE]",
    dot: "bg-[#D75800]",
  },
  high: {
    label: "HIGH",
    badgeBg: "bg-[#FEF3C7]",
    badgeText: "text-[#B45309]",
    badgeBorder: "border-[#FDE68A]",
    dot: "bg-[#D97706]",
  },
  medium: {
    label: "MEDIUM",
    badgeBg: "bg-[#F0EFFF]",
    badgeText: "text-[#5856D6]",
    badgeBorder: "border-[#DCD9FF]",
    dot: "bg-[#5856D6]",
  },
  low: {
    label: "LOW",
    badgeBg: "bg-[#E9EFE9]",
    badgeText: "text-[#1E3A2B]",
    badgeBorder: "border-[#CDE0CD]",
    dot: "bg-[#1E3A2B]",
  },
};

const COLUMNS: {
  id: TaskStatus;
  label: string;
  accent: string;
  badgeBg: string;
  badgeText: string;
  borderAccent: string;
}[] = [
  {
    id: "todo",
    label: "To Do",
    accent: "#007AFF",
    badgeBg: "bg-[#007AFF]/10",
    badgeText: "text-[#007AFF]",
    borderAccent: "border-[#007AFF]/30",
  },
  {
    id: "in_progress",
    label: "In Progress",
    accent: "#5856D6",
    badgeBg: "bg-[#5856D6]/10",
    badgeText: "text-[#5856D6]",
    borderAccent: "border-[#5856D6]/30",
  },
  {
    id: "done",
    label: "Done",
    accent: "#34C759",
    badgeBg: "bg-[#34C759]/15",
    badgeText: "text-[#248A3D]",
    borderAccent: "border-[#34C759]/30",
  },
  {
    id: "on_hold",
    label: "On Hold",
    accent: "#D75800",
    badgeBg: "bg-[#D75800]/10",
    badgeText: "text-[#D75800]",
    borderAccent: "border-[#D75800]/30",
  },
];

function getTodayIso(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseFormattedDateToIso(dateStr: string): string {
  if (!dateStr) return getTodayIso();
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const parts = dateStr.split(" ");
  if (parts.length >= 2) {
    const mIdx = monthNames.findIndex((m) => m.toLowerCase() === parts[0].toLowerCase());
    if (mIdx !== -1) {
      const year = new Date().getFullYear();
      const month = String(mIdx + 1).padStart(2, "0");
      const day = String(parseInt(parts[1], 10)).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }
  }
  return getTodayIso();
}

function formatIsoToDisplayDate(rawDate: string): string {
  if (rawDate && rawDate.includes("-")) {
    const parts = rawDate.split("-");
    if (parts.length === 3) {
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const mIdx = parseInt(parts[1], 10) - 1;
      const monthName = monthNames[mIdx] || "";
      const dayNum = parseInt(parts[2], 10);
      return `${monthName} ${dayNum}`;
    }
  }
  return rawDate || new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function KanbanPage() {
  const [tasks, setTasks] = useState<KanbanTask[]>(defaultTasks);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState<string>(getTodayIso);
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<KanbanTask | null>(null);
  const [activeColumnForNew, setActiveColumnForNew] = useState<TaskStatus>("todo");
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  // Load from NeonDB on mount (with localStorage fallback/migration)
  useEffect(() => {
    async function loadTasks() {
      try {
        const dbTasks = await getKanbanTasks();
        if (dbTasks && dbTasks.length > 0) {
          startTransition(() => {
            setTasks(dbTasks);
          });
          localStorage.setItem("paperly_kanban_tasks", JSON.stringify(dbTasks));
          return;
        }

        // Fallback: check localStorage and migrate
        const saved = localStorage.getItem("paperly_kanban_tasks");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const migrated: KanbanTask[] = [];
            for (const item of parsed) {
              const validUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item.id)
                ? item.id
                : generateUUID();
              const newTask: KanbanTask = {
                id: validUuid,
                title: item.title,
                description: item.description || "",
                status: item.status || "todo",
                priority: item.priority || "medium",
                category: item.category || "General",
                createdAt: item.createdAt || "Today",
              };
              migrated.push(newTask);
              await upsertKanbanTask(newTask);
            }
            startTransition(() => {
              setTasks(migrated);
            });
            localStorage.setItem("paperly_kanban_tasks", JSON.stringify(migrated));
          }
        }
      } catch (e) {
        console.error("Failed to load tasks from NeonDB", e);
      }
    }
    loadTasks();
  }, []);

  // Save to local state and localStorage cache
  const persistTasks = (newTasks: KanbanTask[]) => {
    setTasks(newTasks);
    try {
      localStorage.setItem("paperly_kanban_tasks", JSON.stringify(newTasks));
    } catch {
      // Ignore write errors
    }
  };

  // Filter tasks by search query, date, and priority
  const filteredTasks = useMemo(() => {
    let result = tasks;

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q)
      );
    }

    // Priority filter
    if (priorityFilter !== "all") {
      result = result.filter((t) => t.priority === priorityFilter);
    }

    // Date filter
    if (selectedDate) {
      const parts = selectedDate.split("-");
      if (parts.length === 3) {
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const mIdx = parseInt(parts[1], 10) - 1;
        const monthName = monthNames[mIdx] || "";
        const dayNum = parseInt(parts[2], 10);
        const shortFormat = `${monthName} ${dayNum}`.toLowerCase(); // e.g. "sep 3"
        const paddedFormat = `${monthName} ${parts[2]}`.toLowerCase(); // e.g. "sep 03"

        result = result.filter((t) => {
          const created = (t.createdAt || "").toLowerCase();

          return (
            created.includes(shortFormat) ||
            created.includes(paddedFormat) ||
            created.includes(selectedDate)
          );
        });
      }
    }

    return result;
  }, [tasks, searchQuery, priorityFilter, selectedDate]);

  // Handle Drag and Drop
  const handleDragStart = (id: string) => {
    setDraggedTaskId(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (status: TaskStatus) => {
    if (!draggedTaskId) return;
    const taskId = draggedTaskId;
    const updated = tasks.map((t) => (t.id === taskId ? { ...t, status } : t));
    persistTasks(updated);
    updateTaskStatus(taskId, status);
    setDraggedTaskId(null);
  };

  // Day navigation for date bar

  const handlePrevDay = () => {
    const base = selectedDate || getTodayIso();
    const [y, m, d] = base.split("-").map(Number);
    const dateObj = new Date(y, m - 1, d);
    dateObj.setDate(dateObj.getDate() - 1);
    const newY = dateObj.getFullYear();
    const newM = String(dateObj.getMonth() + 1).padStart(2, "0");
    const newD = String(dateObj.getDate()).padStart(2, "0");
    setSelectedDate(`${newY}-${newM}-${newD}`);
  };

  const handleNextDay = () => {
    const base = selectedDate || getTodayIso();
    const [y, m, d] = base.split("-").map(Number);
    const dateObj = new Date(y, m - 1, d);
    dateObj.setDate(dateObj.getDate() + 1);
    const newY = dateObj.getFullYear();
    const newM = String(dateObj.getMonth() + 1).padStart(2, "0");
    const newD = String(dateObj.getDate()).padStart(2, "0");
    setSelectedDate(`${newY}-${newM}-${newD}`);
  };

  // Move task to next or previous column
  const handleMoveTask = (taskId: string, direction: "prev" | "next") => {
    const order: TaskStatus[] = ["todo", "in_progress", "done", "on_hold"];
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    const currentIndex = order.indexOf(task.status);
    const newIndex = direction === "next" ? currentIndex + 1 : currentIndex - 1;
    if (newIndex >= 0 && newIndex < order.length) {
      const newStatus = order[newIndex];
      const updated = tasks.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t));
      persistTasks(updated);
      updateTaskStatus(taskId, newStatus);
    }
  };

  // Delete task
  const handleDeleteTask = (taskId: string) => {
    const updated = tasks.filter((t) => t.id !== taskId);
    persistTasks(updated);
    deleteKanbanTask(taskId);
  };

  // Add new task
  const handleCreateTask = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = (formData.get("title") as string)?.trim();
    if (!title) return;

    const rawDate = (formData.get("createdAt") as string)?.trim();
    const createdAtFormatted = formatIsoToDisplayDate(rawDate);

    const newTask: KanbanTask = {
      id: generateUUID(),
      title,
      description: (formData.get("description") as string)?.trim() || "",
      status: (formData.get("status") as TaskStatus) || activeColumnForNew,
      priority: (formData.get("priority") as TaskPriority) || "medium",
      category: (formData.get("category") as string)?.trim() || "General",
      createdAt: createdAtFormatted,
    };

    persistTasks([newTask, ...tasks]);
    setIsNewModalOpen(false);
    await upsertKanbanTask(newTask);
  };

  // Update existing task
  const handleUpdateTask = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingTask) return;
    const formData = new FormData(e.currentTarget);
    const title = (formData.get("title") as string)?.trim();
    if (!title) return;

    const rawDate = (formData.get("createdAt") as string)?.trim();
    const createdAtFormatted = formatIsoToDisplayDate(rawDate);

    const updatedTask: KanbanTask = {
      ...editingTask,
      title,
      description: (formData.get("description") as string)?.trim() || "",
      status: (formData.get("status") as TaskStatus) || editingTask.status,
      priority: (formData.get("priority") as TaskPriority) || editingTask.priority,
      category: (formData.get("category") as string)?.trim() || editingTask.category,
      createdAt: createdAtFormatted,
    };

    const updated = tasks.map((t) => (t.id === editingTask.id ? updatedTask : t));

    persistTasks(updated);
    setEditingTask(null);
    await upsertKanbanTask(updatedTask);
  };

  const openNewTaskModal = (column: TaskStatus = "todo") => {
    setActiveColumnForNew(column);
    setIsNewModalOpen(true);
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#FAF7F2] text-[#1C1C1E] overflow-hidden font-sans selection:bg-[#E2DDD3]">
      {/* Top Header */}
      <header className="h-16 px-5 sm:px-8 border-b border-[#E5E0D5] bg-[#FAF7F2]/90 backdrop-blur-xs flex items-center justify-between flex-shrink-0 z-30">
        <div className="flex items-center gap-6">
          {/* Paperly Logo & Dashboard Return */}
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 text-[#1C1C1E] hover:opacity-80 transition-opacity"
            title="Return to Dashboard"
          >
            <PaperlyLogo className="w-6 h-6 flex-shrink-0" />
            <span className="font-serif text-2xl font-bold tracking-tight">Paperly</span>
            <span className="text-[10px] uppercase font-mono font-medium tracking-wider text-[#007AFF] bg-[#007AFF]/10 px-2 py-0.5 rounded-full">
              Kanban
            </span>
          </Link>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="hidden sm:inline-flex text-xs font-medium text-[#736E65] hover:text-[#007AFF] transition-colors"
          >
            &larr; Back to Dashboard
          </Link>

          <button
            onClick={() => openNewTaskModal("todo")}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[10px] bg-[#007AFF] hover:bg-[#0066d6] text-white text-xs font-semibold shadow-xs transition-transform active:scale-95 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span>Add Task</span>
          </button>
        </div>
      </header>

      {/* Subheader Toolbar: Search, Date Filter & Priority Filter Chips */}
      <div className="px-5 sm:px-8 py-3.5 border-b border-[#E5E0D5] bg-[#FAF7F2] flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 flex-shrink-0">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <svg
              className="w-4 h-4 text-[#8E8E93] absolute left-3 top-1/2 -translate-y-1/2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks or tags..."
              className="w-full h-9 pl-9 pr-3 bg-[#F2F2F7] text-[#1C1C1E] placeholder-[#8E8E93] rounded-[8px] text-xs border border-[#E5E0D5] focus:outline-none focus:border-[#007AFF] transition-colors"
            />
          </div>

          {/* Date Bar with Previous & Next Day Arrows */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePrevDay}
              title="Previous day"
              className="w-9 h-9 flex items-center justify-center rounded-[8px] bg-[#F2F2F7] hover:bg-[#E8E8ED] text-[#6E6E73] hover:text-[#007AFF] border border-[#E5E0D5] transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>

            <div className="relative flex items-center h-9 bg-[#F2F2F7] border border-[#E5E0D5] rounded-[8px] px-2.5 focus-within:border-[#007AFF] transition-colors">
              <svg
                className="w-4 h-4 text-[#8E8E93] flex-shrink-0 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                />
              </svg>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-xs text-[#1C1C1E] focus:outline-none cursor-pointer tracking-tight"
                title="Select date to filter tasks"
              />
              {selectedDate && (
                <button
                  type="button"
                  onClick={() => setSelectedDate("")}
                  title="Clear date filter"
                  className="ml-2 text-[#8E8E93] hover:text-[#1C1C1E] p-0.5 rounded text-xs cursor-pointer font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={handleNextDay}
              title="Next day"
              className="w-9 h-9 flex items-center justify-center rounded-[8px] bg-[#F2F2F7] hover:bg-[#E8E8ED] text-[#6E6E73] hover:text-[#007AFF] border border-[#E5E0D5] transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>

          {selectedDate && (
            <span className="text-[11px] font-mono text-[#007AFF] bg-[#007AFF]/10 px-2.5 py-1 rounded-full whitespace-nowrap self-start sm:self-center">
              Filtering date: {selectedDate}
            </span>
          )}
        </div>

        {/* Priority Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#8E8E93] mr-1 select-none">
            Priority:
          </span>
          {[
            {
              id: "all",
              label: "All",
              activeClass: "bg-[#1C1C1E] text-white border-[#1C1C1E] shadow-2xs",
              inactiveClass: "bg-[#F2F2F7] text-[#4A453E] border-[#E5E0D5] hover:bg-[#E8E8ED]",
            },
            {
              id: "urgent",
              label: "Urgent",
              activeClass: "bg-[#D75800] text-white border-[#D75800] shadow-2xs",
              inactiveClass: "bg-[#FFF2E8] text-[#D75800] border-[#FCD8BE] hover:bg-[#FFE5D3]",
            },
            {
              id: "high",
              label: "High",
              activeClass: "bg-[#D97706] text-white border-[#D97706] shadow-2xs",
              inactiveClass: "bg-[#FEF3C7] text-[#B45309] border-[#FDE68A] hover:bg-[#FEF08A]",
            },
            {
              id: "medium",
              label: "Medium",
              activeClass: "bg-[#5856D6] text-white border-[#5856D6] shadow-2xs",
              inactiveClass: "bg-[#F0EFFF] text-[#5856D6] border-[#DCD9FF] hover:bg-[#E5E3FF]",
            },
            {
              id: "low",
              label: "Low",
              activeClass: "bg-[#1E3A2B] text-white border-[#1E3A2B] shadow-2xs",
              inactiveClass: "bg-[#E9EFE9] text-[#1E3A2B] border-[#CDE0CD] hover:bg-[#DCEDDC]",
            },
          ].map((chip) => {
            const isActive = priorityFilter === chip.id;
            return (
              <button
                key={chip.id}
                onClick={() => setPriorityFilter(chip.id)}
                className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                  isActive ? chip.activeClass : chip.inactiveClass
                }`}
              >
                {chip.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Kanban Board Canvas */}
      <main className="flex-1 overflow-x-auto overflow-y-hidden p-5 sm:p-6 min-h-0">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 h-full min-w-[320px] max-w-full">
          {COLUMNS.map((col) => {
            const columnTasks = filteredTasks.filter((t) => t.status === col.id);

            return (
              <div
                key={col.id}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(col.id)}
                className="flex flex-col bg-[#F2F2F7] rounded-2xl border border-[#E5E0D5] p-3.5 min-h-0 h-full shadow-2xs"
              >
                {/* Column Header */}
                <div className={`flex items-center justify-between pb-3 px-1 border-b ${col.borderAccent} flex-shrink-0`}>
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: col.accent }}
                    />
                    <h3 className="font-serif text-sm font-semibold text-[#1C1C1E]">
                      {col.label}
                    </h3>
                    <span
                      className={`text-[11px] font-mono font-medium px-2 py-0.5 rounded-full ${col.badgeBg} ${col.badgeText}`}
                    >
                      {columnTasks.length}
                    </span>
                  </div>

                  <button
                    onClick={() => openNewTaskModal(col.id)}
                    title={`Add task to ${col.label}`}
                    className="w-6 h-6 rounded-md hover:bg-white text-[#6E6E73] hover:text-[#007AFF] flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                  </button>
                </div>

                {/* Tasks List */}
                <div className="flex-1 overflow-y-auto space-y-3 pt-3 pr-1">
                  {columnTasks.length === 0 ? (
                    <div className="h-28 flex flex-col items-center justify-center text-center text-xs text-[#8E8E93] border-2 border-dashed border-[#E5E0D5] rounded-xl p-4">
                      <span>No tasks in this column</span>
                      <button
                        onClick={() => openNewTaskModal(col.id)}
                        className="mt-2 text-[#007AFF] font-medium hover:underline cursor-pointer"
                      >
                        + Create a task
                      </button>
                    </div>
                  ) : (
                    columnTasks.map((task) => {
                      const pConfig = PRIORITY_MAP[task.priority] || PRIORITY_MAP.medium;

                      return (
                        <div
                          key={task.id}
                          draggable
                          onDragStart={() => handleDragStart(task.id)}
                          className={`bg-white rounded-xl p-3.5 border border-[#E5E0D5] hover:border-[#007AFF] hover:shadow-xs transition-all cursor-grab active:cursor-grabbing group select-none ${
                            draggedTaskId === task.id ? "opacity-40" : ""
                          }`}
                        >
                          {/* Card Top: Category & Priority Division */}
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-mono uppercase tracking-wider text-[#5856D6] bg-[#5856D6]/10 px-2 py-0.5 rounded font-medium">
                              {task.category}
                            </span>
                            <span
                              className={`text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded border flex items-center gap-1.5 ${pConfig.badgeBg} ${pConfig.badgeText} ${pConfig.badgeBorder}`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${pConfig.dot}`} />
                              {task.priority}
                            </span>
                          </div>

                          {/* Card Title */}
                          <h4 className="text-xs font-semibold text-[#1C1C1E] leading-snug mb-1">
                            {task.title}
                          </h4>

                          {/* Card Description */}
                          {task.description && (
                            <p className="text-[11px] text-[#736E65] leading-relaxed line-clamp-2 mb-3">
                              {task.description}
                            </p>
                          )}

                          {/* Card Footer: Created At Date & Actions */}
                          <div className="pt-2 border-t border-[#F5F2EC] flex items-center justify-between text-[11px] text-[#8E8E93]">
                            <span className="flex items-center gap-1 font-mono text-[10px]" title="Created at">
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {task.createdAt}
                            </span>

                            {/* Move and Delete Controls */}
                            <div className="flex items-center gap-1">
                              {col.id !== "todo" && (
                                <button
                                  onClick={() => handleMoveTask(task.id, "prev")}
                                  title="Move to previous column"
                                  className="w-5 h-5 rounded hover:bg-[#F2F2F7] text-[#6E6E73] hover:text-[#007AFF] flex items-center justify-center transition-colors cursor-pointer"
                                >
                                  &larr;
                                </button>
                              )}
                              {col.id !== "on_hold" && (
                                <button
                                  onClick={() => handleMoveTask(task.id, "next")}
                                  title="Move to next column"
                                  className="w-5 h-5 rounded hover:bg-[#F2F2F7] text-[#6E6E73] hover:text-[#007AFF] flex items-center justify-center transition-colors cursor-pointer"
                                >
                                  &rarr;
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => setEditingTask(task)}
                                title="Edit task"
                                className="w-5 h-5 rounded hover:bg-[#F2F2F7] text-[#8E8E93] hover:text-[#007AFF] flex items-center justify-center transition-colors cursor-pointer"
                              >
                                <svg className="w-3.2 h-3.2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                </svg>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteTask(task.id)}
                                title="Delete task"
                                className="w-5 h-5 rounded hover:bg-red-50 text-[#8E8E93] hover:text-red-600 flex items-center justify-center transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                              >
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* New Task Modal */}
      {isNewModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-xs p-4"
          onClick={() => setIsNewModalOpen(false)}
        >
          <div
            className="bg-white border border-[#E5E0D5] rounded-2xl p-6 shadow-xl max-w-md w-full select-none"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#F0ECE3] mb-4">
              <h2 className="font-serif text-lg font-bold text-[#1C1C1E]">
                Create New Task
              </h2>
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="w-7 h-7 rounded-md hover:bg-[#F2F2F7] text-[#8E8E93] flex items-center justify-center text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#1C1C1E] mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="e.g., Build mobile navigation drawer"
                  className="w-full h-9 px-3 bg-[#F2F2F7] rounded-[8px] text-xs border border-[#E5E0D5] focus:outline-none focus:border-[#007AFF]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1C1C1E] mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  rows={3}
                  placeholder="Key deliverables and acceptance criteria..."
                  className="w-full p-3 bg-[#F2F2F7] rounded-[8px] text-xs border border-[#E5E0D5] focus:outline-none focus:border-[#007AFF] resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#1C1C1E] mb-1">
                    Initial Column
                  </label>
                  <select
                    name="status"
                    defaultValue={activeColumnForNew}
                    className="w-full h-9 px-2 bg-[#F2F2F7] rounded-[8px] text-xs border border-[#E5E0D5] focus:outline-none focus:border-[#007AFF]"
                  >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="done">Done</option>
                    <option value="on_hold">On Hold</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1C1C1E] mb-1">
                    Priority
                  </label>
                  <select
                    name="priority"
                    defaultValue="medium"
                    className="w-full h-9 px-2 bg-[#F2F2F7] rounded-[8px] text-xs border border-[#E5E0D5] focus:outline-none focus:border-[#007AFF]"
                  >
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#1C1C1E] mb-1">
                    Category Tag
                  </label>
                  <input
                    type="text"
                    name="category"
                    defaultValue="Dev"
                    placeholder="e.g. Design, Dev, QA"
                    className="w-full h-9 px-3 bg-[#F2F2F7] rounded-[8px] text-xs border border-[#E5E0D5] focus:outline-none focus:border-[#007AFF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1C1C1E] mb-1">
                    Task on Date
                  </label>
                  <input
                    type="date"
                    name="createdAt"
                    defaultValue={getTodayIso()}
                    className="w-full h-9 px-3 bg-[#F2F2F7] rounded-[8px] text-xs border border-[#E5E0D5] focus:outline-none focus:border-[#007AFF] text-[#1C1C1E] cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#F0ECE3]">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 rounded-[8px] border border-[#E5E0D5] hover:bg-[#F2F2F7] text-xs font-medium text-[#736E65] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-[8px] bg-[#007AFF] hover:bg-[#0066d6] text-white text-xs font-semibold shadow-xs cursor-pointer"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {editingTask && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-xs p-4"
          onClick={() => setEditingTask(null)}
        >
          <div
            className="bg-white border border-[#E5E0D5] rounded-2xl p-6 shadow-xl max-w-md w-full select-none"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#F0ECE3] mb-4">
              <h2 className="font-serif text-lg font-bold text-[#1C1C1E]">
                Edit Task
              </h2>
              <button
                type="button"
                onClick={() => setEditingTask(null)}
                className="w-7 h-7 rounded-md hover:bg-[#F2F2F7] text-[#8E8E93] flex items-center justify-center text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#1C1C1E] mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  defaultValue={editingTask.title}
                  placeholder="Task title"
                  className="w-full h-9 px-3 bg-[#F2F2F7] rounded-[8px] text-xs border border-[#E5E0D5] focus:outline-none focus:border-[#007AFF]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1C1C1E] mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  rows={3}
                  defaultValue={editingTask.description}
                  placeholder="Key deliverables and acceptance criteria..."
                  className="w-full p-3 bg-[#F2F2F7] rounded-[8px] text-xs border border-[#E5E0D5] focus:outline-none focus:border-[#007AFF] resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#1C1C1E] mb-1">
                    Column
                  </label>
                  <select
                    name="status"
                    defaultValue={editingTask.status}
                    className="w-full h-9 px-2 bg-[#F2F2F7] rounded-[8px] text-xs border border-[#E5E0D5] focus:outline-none focus:border-[#007AFF]"
                  >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="done">Done</option>
                    <option value="on_hold">On Hold</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1C1C1E] mb-1">
                    Priority
                  </label>
                  <select
                    name="priority"
                    defaultValue={editingTask.priority}
                    className="w-full h-9 px-2 bg-[#F2F2F7] rounded-[8px] text-xs border border-[#E5E0D5] focus:outline-none focus:border-[#007AFF]"
                  >
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#1C1C1E] mb-1">
                    Category Tag
                  </label>
                  <input
                    type="text"
                    name="category"
                    defaultValue={editingTask.category}
                    placeholder="e.g. Design, Dev, QA"
                    className="w-full h-9 px-3 bg-[#F2F2F7] rounded-[8px] text-xs border border-[#E5E0D5] focus:outline-none focus:border-[#007AFF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1C1C1E] mb-1">
                    Task on Date
                  </label>
                  <input
                    type="date"
                    name="createdAt"
                    defaultValue={parseFormattedDateToIso(editingTask.createdAt)}
                    className="w-full h-9 px-3 bg-[#F2F2F7] rounded-[8px] text-xs border border-[#E5E0D5] focus:outline-none focus:border-[#007AFF] text-[#1C1C1E] cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#F0ECE3]">
                <button
                  type="button"
                  onClick={() => setEditingTask(null)}
                  className="px-4 py-2 rounded-[8px] border border-[#E5E0D5] hover:bg-[#F2F2F7] text-xs font-medium text-[#736E65] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-[8px] bg-[#007AFF] hover:bg-[#0066d6] text-white text-xs font-semibold shadow-xs cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

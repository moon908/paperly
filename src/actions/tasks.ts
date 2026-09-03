"use server";

import { auth } from "@clerk/nextjs/server";
import { sql } from "@/lib/db";

export type TaskStatus = "todo" | "in_progress" | "done" | "on_hold";
export type TaskPriority = "urgent" | "high" | "medium" | "low";

export interface DbKanbanTask {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  category: string;
  createdAt: string;
  dueDate?: string;
}

function formatIsoToDisplay(rawDate: string): string {
  if (rawDate && rawDate.includes("-")) {
    const parts = rawDate.split("-");
    if (parts.length === 3) {
      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const mIdx = parseInt(parts[1], 10) - 1;
      const monthName = monthNames[mIdx] || "";
      const dayNum = parseInt(parts[2], 10);
      return `${monthName} ${dayNum}`;
    }
  }
  return rawDate;
}

function parseDateToIso(dateStr: string): string | null {
  if (!dateStr) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const parts = dateStr.split(" ");
  if (parts.length >= 2) {
    const mIdx = monthNames.findIndex(
      (m) => m.toLowerCase() === parts[0].toLowerCase()
    );
    if (mIdx !== -1) {
      const year = new Date().getFullYear();
      const month = String(mIdx + 1).padStart(2, "0");
      const day = String(parseInt(parts[1], 10)).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }
  }
  return null;
}

export async function getKanbanTasks(): Promise<DbKanbanTask[]> {
  const { userId } = await auth();
  if (!userId) return [];

  try {
    const rows = await sql`
      SELECT id, title, description, status, priority, category, due_date, created_at
      FROM kanban_tasks
      WHERE user_id = ${userId}
      ORDER BY created_at DESC;
    `;

    return rows.map((r: any) => {
      let displayDate = "Today";
      let dueDateIso = "";

      if (r.due_date) {
        const dateStr =
          typeof r.due_date === "object" && r.due_date instanceof Date
            ? r.due_date.toISOString().slice(0, 10)
            : String(r.due_date).slice(0, 10);
        dueDateIso = dateStr;
        displayDate = formatIsoToDisplay(dateStr);
      } else if (r.created_at) {
        displayDate = new Date(r.created_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
      }

      return {
        id: String(r.id),
        title: r.title,
        description: r.description || "",
        status: r.status as TaskStatus,
        priority: r.priority as TaskPriority,
        category: r.category || "General",
        createdAt: displayDate,
        dueDate: dueDateIso,
      };
    });
  } catch (error) {
    console.error("Failed to fetch kanban tasks from NeonDB:", error);
    return [];
  }
}

export async function upsertKanbanTask(task: {
  id: string;
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  category?: string;
  createdAt?: string;
  dueDate?: string;
}): Promise<boolean> {
  const { userId } = await auth();
  if (!userId) return false;

  try {
    const description = task.description || "";
    const status = task.status || "todo";
    const priority = task.priority || "medium";
    const category = task.category || "General";

    let dueDate: string | null = null;
    if (task.dueDate && /^\d{4}-\d{2}-\d{2}$/.test(task.dueDate)) {
      dueDate = task.dueDate;
    } else if (task.createdAt) {
      dueDate = parseDateToIso(task.createdAt);
    }

    await sql`
      INSERT INTO kanban_tasks (id, user_id, title, description, status, priority, category, due_date, updated_at)
      VALUES (${task.id}, ${userId}, ${task.title}, ${description}, ${status}, ${priority}, ${category}, ${dueDate}, CURRENT_TIMESTAMP)
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        status = EXCLUDED.status,
        priority = EXCLUDED.priority,
        category = EXCLUDED.category,
        due_date = EXCLUDED.due_date,
        updated_at = CURRENT_TIMESTAMP
      WHERE kanban_tasks.user_id = ${userId};
    `;
    return true;
  } catch (error) {
    console.error("Failed to upsert kanban task in NeonDB:", error);
    return false;
  }
}

export async function updateTaskStatus(
  id: string,
  status: TaskStatus
): Promise<boolean> {
  const { userId } = await auth();
  if (!userId) return false;

  try {
    await sql`
      UPDATE kanban_tasks
      SET status = ${status}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id} AND user_id = ${userId};
    `;
    return true;
  } catch (error) {
    console.error("Failed to update task status in NeonDB:", error);
    return false;
  }
}

export async function deleteKanbanTask(id: string): Promise<boolean> {
  const { userId } = await auth();
  if (!userId) return false;

  try {
    await sql`
      DELETE FROM kanban_tasks
      WHERE id = ${id} AND user_id = ${userId};
    `;
    return true;
  } catch (error) {
    console.error("Failed to delete kanban task from NeonDB:", error);
    return false;
  }
}

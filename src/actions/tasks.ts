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
}

export async function getKanbanTasks(): Promise<DbKanbanTask[]> {
  const { userId } = await auth();
  if (!userId) return [];

  try {
    const rows = await sql`
      SELECT id, title, description, status, priority, category, created_at
      FROM kanban_tasks
      WHERE user_id = ${userId}
      ORDER BY created_at DESC;
    `;

    return rows.map((r: any) => ({
      id: String(r.id),
      title: r.title,
      description: r.description || "",
      status: r.status as TaskStatus,
      priority: r.priority as TaskPriority,
      category: r.category || "General",
      createdAt: r.created_at
        ? new Date(r.created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })
        : "Today",
    }));
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
}): Promise<boolean> {
  const { userId } = await auth();
  if (!userId) return false;

  try {
    const description = task.description || "";
    const status = task.status || "todo";
    const priority = task.priority || "medium";
    const category = task.category || "General";

    await sql`
      INSERT INTO kanban_tasks (id, user_id, title, description, status, priority, category, updated_at)
      VALUES (${task.id}, ${userId}, ${task.title}, ${description}, ${status}, ${priority}, ${category}, CURRENT_TIMESTAMP)
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        status = EXCLUDED.status,
        priority = EXCLUDED.priority,
        category = EXCLUDED.category,
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

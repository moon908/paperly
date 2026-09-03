"use server";

import { auth } from "@clerk/nextjs/server";
import { sql } from "@/lib/db";

export interface DbWhiteboard {
  id: string;
  title: string;
  content: string;
  dateDisplay: string;
  updatedAt: string;
}

export async function getWhiteboards(): Promise<DbWhiteboard[]> {
  const { userId } = await auth();
  if (!userId) return [];

  try {
    const rows = await sql`
      SELECT id, title, content, date_display, updated_at
      FROM whiteboards
      WHERE user_id = ${userId}
      ORDER BY updated_at DESC;
    `;

    return rows.map((r: any) => ({
      id: String(r.id),
      title: r.title || "Untitled Whiteboard",
      content: r.content || '{"elements":[]}',
      dateDisplay: r.date_display || "TODAY",
      updatedAt: r.updated_at
        ? new Date(r.updated_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })
        : "Just now",
    }));
  } catch (error) {
    console.error("Failed to fetch whiteboards from NeonDB:", error);
    return [];
  }
}

export async function upsertWhiteboard(board: {
  id: string;
  title: string;
  content: string;
  dateDisplay?: string;
}): Promise<boolean> {
  const { userId } = await auth();
  if (!userId) return false;

  try {
    const title = board.title || "Untitled Whiteboard";
    const content = board.content || '{"elements":[]}';
    const dateDisplay = board.dateDisplay || "TODAY";

    await sql`
      INSERT INTO whiteboards (id, user_id, title, content, date_display, updated_at)
      VALUES (${board.id}, ${userId}, ${title}, ${content}, ${dateDisplay}, CURRENT_TIMESTAMP)
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        content = EXCLUDED.content,
        date_display = EXCLUDED.date_display,
        updated_at = CURRENT_TIMESTAMP
      WHERE whiteboards.user_id = ${userId};
    `;
    return true;
  } catch (error) {
    console.error("Failed to upsert whiteboard in NeonDB:", error);
    return false;
  }
}

export async function deleteWhiteboard(id: string): Promise<boolean> {
  const { userId } = await auth();
  if (!userId) return false;

  try {
    await sql`
      DELETE FROM whiteboards
      WHERE id = ${id} AND user_id = ${userId};
    `;
    return true;
  } catch (error) {
    console.error("Failed to delete whiteboard from NeonDB:", error);
    return false;
  }
}

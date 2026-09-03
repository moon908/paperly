"use server";

import { auth } from "@clerk/nextjs/server";
import { sql } from "@/lib/db";

export interface DbDocument {
  id: string;
  title: string;
  content: string;
  dateDisplay: string;
  updatedAt: string;
}

export async function getDocuments(): Promise<DbDocument[]> {
  const { userId } = await auth();
  if (!userId) return [];

  try {
    const rows = await sql`
      SELECT id, title, content, date_display, updated_at
      FROM documents
      WHERE user_id = ${userId}
      ORDER BY updated_at DESC;
    `;

    return rows.map((r: any) => ({
      id: String(r.id),
      title: r.title || "Untitled Document",
      content: r.content || "",
      dateDisplay: r.date_display || "TODAY",
      updatedAt: r.updated_at
        ? new Date(r.updated_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })
        : "Just now",
    }));
  } catch (error) {
    console.error("Failed to fetch documents from NeonDB:", error);
    return [];
  }
}

export async function upsertDocument(doc: {
  id: string;
  title: string;
  content: string;
  dateDisplay?: string;
}): Promise<boolean> {
  const { userId } = await auth();
  if (!userId) return false;

  try {
    const title = doc.title || "Untitled Document";
    const content = doc.content || "";
    const dateDisplay = doc.dateDisplay || "TODAY";

    await sql`
      INSERT INTO documents (id, user_id, title, content, date_display, updated_at)
      VALUES (${doc.id}, ${userId}, ${title}, ${content}, ${dateDisplay}, CURRENT_TIMESTAMP)
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        content = EXCLUDED.content,
        date_display = EXCLUDED.date_display,
        updated_at = CURRENT_TIMESTAMP
      WHERE documents.user_id = ${userId};
    `;
    return true;
  } catch (error) {
    console.error("Failed to upsert document in NeonDB:", error);
    return false;
  }
}

export async function deleteDocument(id: string): Promise<boolean> {
  const { userId } = await auth();
  if (!userId) return false;

  try {
    await sql`
      DELETE FROM documents
      WHERE id = ${id} AND user_id = ${userId};
    `;
    return true;
  } catch (error) {
    console.error("Failed to delete document from NeonDB:", error);
    return false;
  }
}

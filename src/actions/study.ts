"use server";

import { auth } from "@clerk/nextjs/server";
import { sql } from "@/lib/db";

export interface DbStudyFile {
  id: string;
  name: string;
  size: string;
  fileUrl: string;
  uploadedAt: string;
}

export async function getStudyFiles(): Promise<DbStudyFile[]> {
  const { userId } = await auth();
  if (!userId) return [];

  try {
    const rows = await sql`
      SELECT id, name, size, file_url, uploaded_at
      FROM study_files
      WHERE user_id = ${userId}
      ORDER BY uploaded_at DESC;
    `;

    return rows.map((r: any) => ({
      id: String(r.id),
      name: r.name,
      size: r.size,
      fileUrl: r.file_url || "",
      uploadedAt: r.uploaded_at
        ? new Date(r.uploaded_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "Recently",
    }));
  } catch (error) {
    console.error("Failed to fetch study files from NeonDB:", error);
    return [];
  }
}

export async function addStudyFile(file: {
  id: string;
  name: string;
  size: string;
  fileUrl?: string;
}): Promise<boolean> {
  const { userId } = await auth();
  if (!userId) return false;

  try {
    const fileUrl = file.fileUrl || "";

    await sql`
      INSERT INTO study_files (id, user_id, name, size, file_url, uploaded_at)
      VALUES (${file.id}, ${userId}, ${file.name}, ${file.size}, ${fileUrl}, CURRENT_TIMESTAMP)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        size = EXCLUDED.size,
        file_url = EXCLUDED.file_url,
        uploaded_at = CURRENT_TIMESTAMP
      WHERE study_files.user_id = ${userId};
    `;
    return true;
  } catch (error) {
    console.error("Failed to add study file to NeonDB:", error);
    return false;
  }
}

export async function deleteStudyFile(id: string): Promise<boolean> {
  const { userId } = await auth();
  if (!userId) return false;

  try {
    await sql`
      DELETE FROM study_files
      WHERE id = ${id} AND user_id = ${userId};
    `;
    return true;
  } catch (error) {
    console.error("Failed to delete study file from NeonDB:", error);
    return false;
  }
}

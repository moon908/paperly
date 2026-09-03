# Paperly Database Configuration (NeonDB)

This directory contains the production database schema for Paperly, fully compatible with **Neon PostgreSQL** and **Clerk Authentication**.

---

## 1. How to Apply Schema in NeonDB SQL Editor

1. Open your [Neon Console](https://console.neon.tech/).
2. Select your project: `ep-small-hall-b3sfrzsn`.
3. In the left navigation, click on **SQL Editor**.
4. Open the file [`database/schema.sql`](./schema.sql), copy the entire SQL script, and paste it into the editor.
5. Click **Run** (or press `Ctrl+Enter`).
6. All 6 tables, indexes, and automated `updated_at` triggers will be created immediately.

---

## 2. Tables Overview

| Table | Description | Key Columns |
| :--- | :--- | :--- |
| `users` | Clerk user profile records | `id` (Clerk ID), `email`, `first_name`, `last_name` |
| `documents` | BlockNote rich text notes & specs | `id`, `user_id`, `title`, `content`, `updated_at` |
| `whiteboards` | Excalidraw visual canvas sketches | `id`, `user_id`, `title`, `content` (JSON), `updated_at` |
| `kanban_tasks` | 4-column agile task manager | `id`, `user_id`, `title`, `status`, `priority`, `category` |
| `study_files` | Uploaded PDFs & research papers | `id`, `user_id`, `name`, `size`, `file_url`, `uploaded_at` |
| `calendar_events` | Scheduled meetings & reminders | `id`, `user_id`, `title`, `event_time`, `color` |

---

## 3. Connecting in Next.js

NeonDB works with `@neondatabase/serverless`:

```bash
npm install @neondatabase/serverless
```

Example database client (`src/lib/db.ts`):
```ts
import { neon } from "@neondatabase/serverless";

export const sql = neon(process.env.DATABASE_URL!);
```

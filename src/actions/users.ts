"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { sql } from "@/lib/db";

export async function syncUser() {
  try {
    const { userId } = await auth();
    if (!userId) return null;

    const user = await currentUser();
    if (!user) return null;

    const email =
      user.primaryEmailAddress?.emailAddress ||
      user.emailAddresses?.[0]?.emailAddress ||
      null;
    const firstName = user.firstName || null;
    const lastName = user.lastName || null;
    const imageUrl = user.imageUrl || null;

    await sql`
      INSERT INTO users (id, email, first_name, last_name, image_url)
      VALUES (${userId}, ${email}, ${firstName}, ${lastName}, ${imageUrl})
      ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        image_url = EXCLUDED.image_url,
        updated_at = CURRENT_TIMESTAMP;
    `;

    return { id: userId, email, firstName, lastName, imageUrl };
  } catch (error) {
    console.error("Error syncing user with NeonDB:", error);
    return null;
  }
}

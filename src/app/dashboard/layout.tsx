import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { syncUser } from "@/actions/users";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Automatically sync Clerk user with NeonDB users table
  await syncUser();

  return <>{children}</>;
}


import { AdminDashboard } from "./components/admin-dashboard";
import isUserAdmin from "@/library/isUserAdmin";
import { redirect } from "next/navigation";
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!(await isUserAdmin())) {
    redirect("/auth/login?returnTo=/admin");
  }

  return (
    <div>
      <AdminDashboard />
    </div>
  );
}

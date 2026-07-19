import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, ADMIN_TOKEN } from "@/lib/adminAuth";
import AdminEditor from "@/components/AdminEditor";

export const metadata = { title: "관리자", robots: { index: false } };

export default async function AdminPage() {
  const c = await cookies();
  if (c.get(ADMIN_COOKIE)?.value !== ADMIN_TOKEN) {
    redirect("/admin/login");
  }
  return <AdminEditor />;
}

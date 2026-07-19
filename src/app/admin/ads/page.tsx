import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, ADMIN_TOKEN } from "@/lib/adminAuth";
import AdsManager from "@/components/AdsManager";

export const metadata = { title: "광고 관리", robots: { index: false } };

export default async function AdminAdsPage() {
  const c = await cookies();
  if (c.get(ADMIN_COOKIE)?.value !== ADMIN_TOKEN) redirect("/admin/login");
  return <AdsManager />;
}

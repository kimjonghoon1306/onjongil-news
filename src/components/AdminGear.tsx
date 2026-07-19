import Link from "next/link";
import { GearIcon } from "@/icons";

/* 우하단 은은한 관리자 진입 톱니 (티 안 나게) */
export default function AdminGear() {
  return (
    <Link href="/admin" className="admin-gear" aria-label="관리자" title="관리자">
      <GearIcon size={18} strokeWidth={2} />
    </Link>
  );
}

import { cookies } from "next/headers";
import { ADMIN_ID, ADMIN_PW, ADMIN_TOKEN, ADMIN_COOKIE } from "@/lib/adminAuth";

export async function POST(req: Request) {
  let id = "", pw = "";
  try {
    const b = await req.json();
    id = (b.id || "").toString();
    pw = (b.pw || "").toString();
  } catch {
    return Response.json({ error: "요청 형식이 올바르지 않아요." }, { status: 400 });
  }

  if (id.trim() === ADMIN_ID && pw === ADMIN_PW) {
    const c = await cookies();
    c.set(ADMIN_COOKIE, ADMIN_TOKEN, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 12, // 12시간
    });
    return Response.json({ ok: true });
  }
  return Response.json({ error: "아이디 또는 비밀번호가 올바르지 않아요." }, { status: 401 });
}

// 맞춤법·띄어쓰기 교정 (제미나이 → Groq fallback)
// 본문의 오타·띄어쓰기·조사만 고치고, 템플릿 마커/구조/의미는 그대로 유지.
import { getStoredKeys } from "@/lib/supabase";

export const runtime = "nodejs";

const GEMINI_MODELS = [
  "gemini-2.0-flash", "gemini-2.0-flash-lite", "gemini-2.0-flash-exp",
  "gemini-exp-1206", "gemini-2.5-flash", "gemini-2.5-flash-lite",
];
const GROQ_MODELS = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant"];

const GUIDE = `아래는 온종일뉴스 기사 본문입니다. 한국어 맞춤법과 띄어쓰기만 자연스럽게 교정하세요.

규칙:
- 문장 내용·순서·의미를 바꾸지 마세요. 오타·띄어쓰기·조사·문장부호만 고칩니다.
- 다음 마커와 구조는 절대 수정·삭제하지 말고 그대로 두세요:
  "## 소제목", "[팁]" "[주의]" "[중요]", [참고자료시작]~[참고자료끝], [FAQ시작]~[FAQ끝], [관련글시작]~[관련글끝],
  그 안의 "LINK1:", "POST1:", "Q1:", "A1:" 형식과 "|" 구분, 모든 URL(http...).
- 줄바꿈(빈 줄)을 원문 그대로 유지하세요.
- 교정된 본문 전체만 출력하세요. 인사말·설명·따옴표로 감싸기·코드블록 표시를 넣지 마세요.`;

function isQuota(status: number, msg: string) {
  const m = msg.toLowerCase();
  return status === 429 || status === 503 || status === 404 ||
    m.includes("quota") || m.includes("resource_exhausted") ||
    m.includes("rate") || m.includes("overloaded") || m.includes("limit") || m.includes("not found");
}

// 코드펜스 등 군더더기 제거
function clean(text: string): string {
  return text.replace(/^```[a-z]*\n?/i, "").replace(/\n?```$/i, "").trim();
}

export async function POST(req: Request) {
  let body = "";
  try {
    const b = await req.json();
    body = (b.body || "").toString();
  } catch {
    return Response.json({ error: "요청 형식이 올바르지 않아요." }, { status: 400 });
  }
  if (!body.trim()) return Response.json({ error: "교정할 본문이 없어요." }, { status: 400 });

  const stored = await getStoredKeys();
  const geminiKey = stored.gemini || process.env.GEMINI_API_KEY;
  const groqKey = stored.groq || process.env.GROQ_API_KEY;
  if (!geminiKey && !groqKey) {
    return Response.json({ error: "AI 키가 없어요. AI 키 설정을 확인해 주세요." }, { status: 503 });
  }

  const prompt = `${GUIDE}\n\n---본문 시작---\n${body}\n---본문 끝---`;
  let lastError: string | null = null;

  // Gemini
  if (geminiKey) {
    for (const model of GEMINI_MODELS) {
      try {
        const resp = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { maxOutputTokens: 8192, temperature: 0.2 } }),
          }
        );
        if (!resp.ok) {
          const err = await resp.json().catch(() => ({}));
          const msg = err.error?.message || "";
          if (msg.toLowerCase().includes("api key") || resp.status === 403) {
            return Response.json({ error: "제미나이 키가 올바르지 않아요." }, { status: 401 });
          }
          lastError = isQuota(resp.status, msg) ? `${model} 한도` : `Gemini ${resp.status}`;
          continue;
        }
        const data = await resp.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        if (text.trim()) return Response.json({ body: clean(text), model });
        lastError = `${model} 빈 응답`;
      } catch (e) {
        lastError = e instanceof Error ? e.message : `${model} 오류`;
      }
    }
  }

  // Groq
  if (groqKey) {
    for (const model of GROQ_MODELS) {
      try {
        const resp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${groqKey}` },
          body: JSON.stringify({
            model,
            messages: [
              { role: "system", content: "당신은 한국어 교정 전문가입니다. 지시대로 맞춤법·띄어쓰기만 고치고 교정본만 출력합니다." },
              { role: "user", content: prompt },
            ],
            max_tokens: 8000, temperature: 0.2,
          }),
        });
        if (!resp.ok) { lastError = `Groq ${resp.status}`; continue; }
        const data = await resp.json();
        const text = data.choices?.[0]?.message?.content || "";
        if (text.trim()) return Response.json({ body: clean(text), model });
        lastError = `Groq ${model} 빈 응답`;
      } catch (e) {
        lastError = e instanceof Error ? e.message : `Groq 오류`;
      }
    }
  }

  return Response.json({ error: `교정에 실패했어요. 잠시 후 다시 시도해 주세요. (${lastError})` }, { status: 502 });
}

// 온종일뉴스 자체 AI 초안 생성 (블로그오토프로 방식 그대로)
// POST { title, category } → { excerpt, body, model }
// 모델을 순서대로 시도(fallback):
//   1) Gemini 모델 6종을 우선순위대로 → 한도 초과 시 다음 모델로
//   2) Gemini가 모두 막히면 Groq(라마)로 자동 전환
// → 한 곳 토큰이 떨어져도 꼬이지 않고 다음으로 넘어감.
// 초안은 반드시 사람이 사실 확인·검증 후 발행(윤리강령).

import { getStoredKeys } from "@/lib/supabase";

export const runtime = "nodejs";

const GEMINI_MODELS = [
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-2.0-flash-exp",
  "gemini-exp-1206",
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
];
const GROQ_MODELS = [
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
];

const GUIDE = `당신은 온종일뉴스의 기사 초안 작성 보조입니다.
온종일뉴스는 정치를 뺀 실용정보 매체로, 사장님·창업자·소상공인에게 진짜 도움 되는 정보를 전합니다.
톤은 친근하지만 신뢰감 있게, 반말이 아닌 쉽고 따뜻한 설명체입니다.

규칙:
- 본문은 마크다운형: 소제목은 "## 소제목", 강조 상자는 줄 맨 앞에 [팁] / [주의] / [중요].
- 소제목 3~4개, 각 문단 2~4문장, 전체 700~1100자.
- 과장·확정 표현을 피하고, 수치·조건은 "공식 공고를 확인하세요"처럼 검증 여지를 남긴다.
- 사실을 지어내지 말 것. 불확실하면 일반적 설명으로.
- 반드시 아래 JSON만 출력(그 외 텍스트 금지):
{"excerpt": "한 줄 요약(45자 내외)", "body": "본문(마크다운형)"}`;

// 응답 텍스트에서 JSON만 뽑아 {excerpt, body}로
function parseDraft(text: string): { excerpt: string; body: string } | null {
  const m = text.match(/\{[\s\S]*\}/);
  if (!m) return null;
  try {
    const p = JSON.parse(m[0]);
    return { excerpt: (p.excerpt || "").toString(), body: (p.body || "").toString() };
  } catch {
    return null;
  }
}

// 한도/일시 오류면 다음 모델로 넘어가야 하는지 판단
function isQuota(status: number, msg: string) {
  const m = msg.toLowerCase();
  return status === 429 || status === 503 || status === 404 ||
    m.includes("quota") || m.includes("resource_exhausted") ||
    m.includes("rate") || m.includes("overloaded") ||
    m.includes("limit") || m.includes("not found");
}

export async function POST(req: Request) {
  let title = "", category = "", bodyGemini = "", bodyGroq = "";
  try {
    const b = await req.json();
    title = (b.title || "").toString().slice(0, 200);
    category = (b.category || "").toString().slice(0, 40);
    bodyGemini = (b.geminiKey || "").toString().trim();
    bodyGroq = (b.groqKey || "").toString().trim();
  } catch {
    return Response.json({ error: "요청 형식이 올바르지 않아요." }, { status: 400 });
  }
  if (!title.trim()) return Response.json({ error: "제목이 필요해요." }, { status: 400 });

  // 키 우선순위: 요청 본문 → Supabase 저장(모든 기기 공유) → 환경변수
  const stored = await getStoredKeys();
  const geminiKey = bodyGemini || stored.gemini || process.env.GEMINI_API_KEY;
  const groqKey = bodyGroq || stored.groq || process.env.GROQ_API_KEY;
  if (!geminiKey && !groqKey) {
    return Response.json(
      { error: "AI 키가 없어요. 관리자 페이지의 'AI 키 설정'에 제미나이 또는 Groq 키를 넣어 주세요." },
      { status: 503 }
    );
  }

  const prompt = `${GUIDE}\n\n카테고리: ${category}\n제목: ${title}\n\n위 제목으로 온종일뉴스 기사 초안을 JSON으로 작성해 주세요.`;
  let lastError: string | null = null;

  // ── 1) Gemini 모델 순서대로 ──
  if (geminiKey) {
    for (const model of GEMINI_MODELS) {
      try {
        const resp = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { maxOutputTokens: 4096 },
            }),
          }
        );
        if (!resp.ok) {
          const err = await resp.json().catch(() => ({}));
          const msg = err.error?.message || "";
          if (!isQuota(resp.status, msg)) { lastError = `Gemini(${model}) 오류 ${resp.status}`; }
          else { lastError = `${model} 한도 초과`; }
          continue; // 다음 모델(또는 Groq)로
        }
        const data = await resp.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        const draft = text && parseDraft(text);
        if (draft) return Response.json({ ...draft, model });
        lastError = `${model} 응답 해석 실패`;
      } catch (e) {
        lastError = e instanceof Error ? e.message : `${model} 오류`;
      }
    }
  }

  // ── 2) Groq(라마)로 전환 ──
  if (groqKey) {
    for (const model of GROQ_MODELS) {
      try {
        const resp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${groqKey}`,
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: "system", content: "당신은 온종일뉴스 기사 초안 작성 보조입니다. 반드시 지정된 JSON만 출력하세요." },
              { role: "user", content: prompt },
            ],
            max_tokens: 4096,
            temperature: 0.7,
          }),
        });
        if (!resp.ok) {
          const err = await resp.json().catch(() => ({}));
          lastError = `Groq(${model}) 오류 ${resp.status} ${err.error?.message || ""}`.trim();
          continue;
        }
        const data = await resp.json();
        const text = data.choices?.[0]?.message?.content || "";
        const draft = text && parseDraft(text);
        if (draft) return Response.json({ ...draft, model });
        lastError = `Groq(${model}) 응답 해석 실패`;
      } catch (e) {
        lastError = e instanceof Error ? e.message : `Groq(${model}) 오류`;
      }
    }
  }

  return Response.json(
    { error: `AI 초안 생성에 실패했어요. 잠시 후 다시 시도해 주세요. (${lastError})` },
    { status: 502 }
  );
}

// 온종일뉴스 자체 AI 초안 생성 (Claude API)
// POST { title, category } → { excerpt, body }
// 초안은 반드시 사람이 사실 확인·검증 후 발행한다는 원칙(윤리강령)에 따름.

export const runtime = "nodejs";

const SYSTEM = `당신은 온종일뉴스의 기사 초안 작성 보조입니다.
온종일뉴스는 정치를 뺀 실용정보 매체로, 사장님·창업자·소상공인에게 진짜 도움 되는 정보를 전합니다.
톤은 친근하지만 신뢰감 있게, 반말이 아닌 쉽고 따뜻한 설명체입니다.

규칙:
- 본문은 마크다운형으로 작성: 소제목은 "## 소제목", 강조 상자는 줄 맨 앞에 [팁] / [주의] / [중요] 로 시작.
- 소제목 3~4개, 각 문단은 2~4문장. 전체 700~1100자.
- 과장·확정 표현을 피하고, 수치나 조건은 "공식 공고를 확인하세요"처럼 검증 여지를 남긴다.
- 사실을 지어내지 말 것. 구체 수치가 불확실하면 일반적 설명으로.
- 반드시 아래 JSON 형식만 출력. 그 외 텍스트 금지.
{"excerpt": "한 줄 요약(45자 내외)", "body": "본문(마크다운형)"}`;

export async function POST(req: Request) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    return Response.json(
      { error: "AI 키가 아직 설정되지 않았어요. (ANTHROPIC_API_KEY 필요)" },
      { status: 503 }
    );
  }

  let title = "", category = "";
  try {
    const b = await req.json();
    title = (b.title || "").toString().slice(0, 200);
    category = (b.category || "").toString().slice(0, 40);
  } catch {
    return Response.json({ error: "요청 형식이 올바르지 않아요." }, { status: 400 });
  }
  if (!title.trim()) {
    return Response.json({ error: "제목이 필요해요." }, { status: 400 });
  }

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 2000,
        system: SYSTEM,
        messages: [{
          role: "user",
          content: `카테고리: ${category}\n제목: ${title}\n\n위 제목으로 온종일뉴스 기사 초안을 JSON으로 작성해 주세요.`,
        }],
      }),
    });

    if (!r.ok) {
      const t = await r.text();
      return Response.json(
        { error: `AI 응답 오류 (${r.status}). 키/한도를 확인해 주세요.`, detail: t.slice(0, 200) },
        { status: 502 }
      );
    }

    const data = await r.json();
    const text: string = data?.content?.[0]?.text ?? "";
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) {
      return Response.json({ error: "초안 형식을 해석하지 못했어요. 다시 시도해 주세요." }, { status: 502 });
    }
    const parsed = JSON.parse(match[0]);
    return Response.json({
      excerpt: (parsed.excerpt || "").toString(),
      body: (parsed.body || "").toString(),
    });
  } catch (e) {
    return Response.json(
      { error: "AI 생성 중 오류가 발생했어요.", detail: e instanceof Error ? e.message : "" },
      { status: 500 }
    );
  }
}

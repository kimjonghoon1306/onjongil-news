import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ARTICLES, ADS, REPORTERS, catOf, articleById } from "@/data";
import { parseBody, BOX_META } from "@/lib/parseBody";
import { fmtAbs, fmtRel, readMinutes } from "@/lib/format";
import { CategoryIcon, MailIcon } from "@/icons";
import { Card } from "@/components/news";
import ArticleTools from "@/components/ArticleTools";

export function generateStaticParams() {
  return ARTICLES.map((a) => ({ id: a.id }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params;
  const a = articleById(id);
  if (!a) return { title: "기사를 찾을 수 없습니다" };
  return {
    title: a.title,
    description: a.excerpt,
    openGraph: {
      type: "article",
      title: a.title,
      description: a.excerpt,
      publishedTime: a.publishedAt,
      modifiedTime: a.updatedAt,
      authors: [REPORTERS[a.reporter]?.name ?? "온종일뉴스"],
    },
  };
}

export default async function ArticlePage(
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const a = articleById(id);
  if (!a) notFound();

  const cat = catOf(a.category);
  const reporter = REPORTERS[a.reporter];
  const body = a.body ?? a.excerpt;
  const blocks = parseBody(body);
  const readMin = readMinutes(body);
  const related = ARTICLES.filter((x) => x.category === a.category && x.id !== a.id).slice(0, 4);
  const ad = ADS[1];

  // NewsArticle 구조화데이터(JSON-LD) — 검색엔진 신뢰
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: a.title,
    description: a.excerpt,
    datePublished: a.publishedAt,
    dateModified: a.updatedAt ?? a.publishedAt,
    author: [{ "@type": "Person", name: reporter?.name ?? "온종일뉴스 편집팀" }],
    publisher: { "@type": "Organization", name: "온종일뉴스" },
    articleSection: cat.name,
  };

  return (
    <main className="wrap">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="article magazine">
        {/* 헤더 */}
        <div className="article-head">
          <Link href={`/#${a.category}`} className="article-cat" style={{ color: cat.color }}>
            <CategoryIcon id={a.category} size={17} strokeWidth={2.2} /> {cat.name}
          </Link>
          <div className="rule-top" />
          <h1>{a.title}</h1>
          <p className="article-lead">{a.excerpt}</p>
          <div className="rule-bottom" />

          {/* 신뢰 헤더: 기자 · 입력/수정 시각 */}
          <div className="byline">
            <div className="byline-left">
              <span className="byline-avatar" style={{ background: cat.color }}>
                {(reporter?.name ?? "온")[0]}
              </span>
              <div className="byline-info">
                <span className="byline-name">{reporter?.name ?? "온종일뉴스 편집팀"}</span>
                {reporter && (
                  <a className="byline-mail" href={`mailto:${reporter.email}`}>
                    <MailIcon size={13} strokeWidth={2} /> {reporter.email}
                  </a>
                )}
              </div>
            </div>
            <div className="byline-time">
              <span>입력 {fmtAbs(a.publishedAt)}</span>
              {a.updatedAt && <span className="upd">수정 {fmtRel(a.updatedAt)}</span>}
            </div>
          </div>

          <ArticleTools title={a.title} readMin={readMin} />
        </div>

        {/* 대표 이미지 */}
        <figure className="article-hero">
          <div className="article-hero-img" style={{ background: a.image }} />
          <figcaption>대표 이미지 · 온종일뉴스</figcaption>
        </figure>

        {/* 본문 */}
        <div className="article-body">
          {blocks.map((b, i) => {
            if (b.type === "h2") return <h2 key={i}>{b.content}</h2>;
            if (b.type === "box") {
              const m = BOX_META[b.boxType];
              return (
                <blockquote key={i} className="art-box" style={{ borderColor: m.color }}>
                  <strong style={{ color: m.color }}>{m.label}</strong> {b.content}
                </blockquote>
              );
            }
            return <p key={i}>{b.content}</p>;
          })}
        </div>

        {/* 출처 / AI 표기 (신뢰장치) */}
        <div className="article-provenance">
          {a.source && <p><strong>자료 출처</strong> {a.source}</p>}
          {a.aiAssisted && (
            <p className="ai-note">
              이 기사는 AI로 초안을 작성하고 온종일뉴스 편집자가 사실을 확인·검증했습니다.
            </p>
          )}
          <p className="correction">
            사실과 다른 내용이 있나요? <a href="mailto:tarry9653@daum.net">정정·오류 신고</a> ·
            기사번호 {a.id.toUpperCase()}
          </p>
        </div>

        {/* 본문 하단 광고 */}
        <a
          className="article-ad"
          href={ad.url}
          target={ad.url.startsWith("http") ? "_blank" : undefined}
          rel="noreferrer"
          style={{ background: ad.bg }}
        >
          <div className="ad-text">
            <span className="ad-badge-inline">{ad.house ? "AD · 자사서비스" : "AD · 광고"}</span>
            <h3>{ad.title}</h3>
            <p>{ad.sub}</p>
          </div>
          <span className="ad-cta">{ad.cta} →</span>
        </a>

        <Link className="back-link" href="/">← 대문으로</Link>
      </article>

      {/* 관련 기사 */}
      {related.length > 0 && (
        <section className="section">
          <div className="section-head">
            <h2 className="section-title">
              <span className="sec-icon" style={{ color: cat.color }}>
                <CategoryIcon id={a.category} size={22} strokeWidth={2} />
              </span>
              이 기자의 다른 기사 · 관련 기사
            </h2>
          </div>
          <div className="card-grid">
            {related.map((r) => <Card key={r.id} a={r} />)}
          </div>
        </section>
      )}
    </main>
  );
}

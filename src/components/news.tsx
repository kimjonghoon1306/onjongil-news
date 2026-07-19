import Link from "next/link";
import {
  DEADLINES, REPORTERS, catOf,
  type Article, type CategoryId,
} from "@/data";
import { fmtRel } from "@/lib/format";
import { CategoryIcon, ChevronRight } from "@/icons";

const reporterName = (a: Article) => REPORTERS[a.reporter]?.name ?? "온종일뉴스";

// 대표 이미지: 사진(imageUrl)이 있으면 사진, 없으면 색상 배너
const imgStyle = (a: Article): React.CSSProperties =>
  a.imageUrl
    ? { backgroundImage: `url(${a.imageUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
    : { background: a.image };

/* ===== 톱기사 ===== */
export function TopStory({ a }: { a: Article }) {
  const cat = catOf(a.category);
  return (
    <Link href={`/article/${a.id}`} className="topstory">
      <div className="topstory-img" style={imgStyle(a)} />
      <div className="topstory-body">
        <span className="topstory-badge" style={{ background: cat.color }}>{cat.name}</span>
        <h2>{a.title}</h2>
        <p>{a.excerpt}</p>
        <div className="meta">{reporterName(a)} · {fmtRel(a.publishedAt)}</div>
      </div>
    </Link>
  );
}

/* ===== 헤드라인 리스트 ===== */
export function HeadlineList({ items }: { items: Article[] }) {
  return (
    <aside className="headlines">
      <div className="headlines-head">헤드라인 뉴스</div>
      {items.map((a, i) => {
        const cat = catOf(a.category);
        return (
          <Link href={`/article/${a.id}`} className="hl-item" key={a.id}>
            <span className="hl-num" style={{ color: cat.color }}>{i + 1}</span>
            <div className="hl-thumb" style={imgStyle(a)} />
            <div className="hl-text">
              <span className="hl-cat" style={{ color: cat.color }}>{cat.name}</span>
              <p>{a.title}</p>
            </div>
          </Link>
        );
      })}
    </aside>
  );
}

/* ===== 마감임박 ===== */
export function DeadlineStrip() {
  return (
    <div className="deadline-strip">
      <div className="ds-label">
        <strong>이번주 놓치면 손해</strong>
        <span>마감 임박</span>
      </div>
      <div className="ds-items">
        {DEADLINES.map((d, i) => {
          const cat = catOf(d.category);
          return (
            <div className="ds-item" key={i}>
              <span className="dday" style={{ background: cat.color }}>D-{d.dday}</span>
              <span className="ds-txt">{d.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ===== 기사 카드 ===== */
export function Card({ a }: { a: Article }) {
  const cat = catOf(a.category);
  return (
    <Link href={`/article/${a.id}`} className="card">
      <div className="card-img" style={imgStyle(a)}>
        <span className="card-cat" style={{ background: cat.color }}>{cat.name}</span>
      </div>
      <div className="card-body">
        <h3>{a.title}</h3>
        <p className="excerpt">{a.excerpt}</p>
        <div className="meta">
          <span>{reporterName(a)}</span>
          <span>{fmtRel(a.publishedAt)}</span>
        </div>
      </div>
    </Link>
  );
}

/* ===== 카테고리 섹션 ===== */
export function Section({ id, articles }: { id: CategoryId; articles: Article[] }) {
  const cat = catOf(id);
  const items = articles.filter((a) => a.category === id && !a.featured).slice(0, 4);
  if (items.length === 0) return null;
  return (
    <section className="section" id={id}>
      <div className="section-head">
        <h2 className="section-title">
          <span className="sec-icon" style={{ color: cat.color }}>
            <CategoryIcon id={id} size={22} strokeWidth={2} />
          </span>
          {cat.name}
        </h2>
        <Link className="more-link" href={`/#${id}`}>
          더보기 <ChevronRight size={15} strokeWidth={2.4} />
        </Link>
      </div>
      <div className="card-grid">
        {items.map((a) => <Card key={a.id} a={a} />)}
      </div>
    </section>
  );
}

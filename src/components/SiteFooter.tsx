import Link from "next/link";

/* 언론사 필수 정보 — 인터넷신문 등록 심사에도 쓰이는 발행 정보 */
export default function SiteFooter() {
  return (
    <footer className="footer">
      <div className="wrap footer-inner">
        <div className="footer-top">
          <Link className="brand footer-brand" href="/">
            <span className="brand-ko">온종일뉴스</span>
            <span className="brand-en">ONJONGIL NEWS</span>
          </Link>
          <nav className="footer-links" aria-label="회사 정보">
            <Link href="/about">회사소개</Link>
            <Link href="/ethics">윤리강령</Link>
            <Link href="/contact">제휴·광고문의</Link>
            <Link href="/tip">기사제보</Link>
            <Link href="/privacy">개인정보처리방침</Link>
          </nav>
        </div>
        <div className="footer-slogan">정치는 뺀다. 진짜 도움 되는 것만 전합니다.</div>
        <div className="footer-reg">
          온종일뉴스 · 발행인 테리 · 편집인 테리 · 인터넷신문 등록번호 (등록 예정) ·
          청소년보호책임자 테리 · 대표전화 준비중 · 이메일 tarry9653@daum.net<br />
          © 2026 ONJONGIL NEWS. 온종일그룹. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

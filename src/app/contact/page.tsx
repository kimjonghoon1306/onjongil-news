import type { Metadata } from "next";
import { MailIcon } from "@/icons";

export const metadata: Metadata = {
  title: "제휴·광고문의",
  description: "온종일뉴스 광고·제휴 문의 안내. 배너 광고, 협찬 콘텐츠, 사업 제휴를 환영합니다.",
};

export default function ContactPage() {
  return (
    <main className="wrap page">
      <div className="page-hero">
        <span className="page-kicker">CONTACT</span>
        <h1>제휴·광고문의</h1>
        <p>사장님과 예비 창업자가 모이는 곳. 온종일뉴스와 함께 알려보세요.</p>
      </div>

      <div className="prose">
        <h2>이런 광고를 진행할 수 있어요</h2>
        <ul>
          <li><strong>배너 광고</strong> — 대문·기사 사이에 노출되는 이미지/텍스트 배너</li>
          <li><strong>협찬 콘텐츠</strong> — 제품·서비스를 소개하는 기사형 콘텐츠(‘협찬’ 표시)</li>
          <li><strong>사업 제휴</strong> — 정부지원·창업·마케팅 관련 공동 기획·이벤트</li>
        </ul>
        <div className="page-note">
          온종일뉴스는 <strong>광고와 기사를 분명히 구분</strong>합니다. 대가를 받은 콘텐츠에는
          ‘광고·협찬’을 반드시 표시하며, 독자의 신뢰를 최우선으로 합니다.
        </div>

        <h2>문의처</h2>
        <div className="contact-cards">
          <div className="contact-card">
            <h3>광고 문의</h3>
            <p>배너·협찬 등 광고 상품 안내와 단가를 보내드립니다.</p>
            <a href="mailto:ad@onjongilnews.com">
              <MailIcon size={16} strokeWidth={2} /> ad@onjongilnews.com
            </a>
          </div>
          <div className="contact-card">
            <h3>제휴 문의</h3>
            <p>공동 기획·이벤트·콘텐츠 제휴를 제안해 주세요.</p>
            <a href="mailto:partner@onjongilnews.com">
              <MailIcon size={16} strokeWidth={2} /> partner@onjongilnews.com
            </a>
          </div>
          <div className="contact-card">
            <h3>일반 문의</h3>
            <p>그 밖의 모든 문의는 편집국으로 연락 주세요.</p>
            <a href="mailto:desk@onjongilnews.com">
              <MailIcon size={16} strokeWidth={2} /> desk@onjongilnews.com
            </a>
          </div>
        </div>

        <h2>매체 정보</h2>
        <table className="info-table">
          <tbody>
            <tr><th>매체명</th><td>온종일뉴스 (ONJONGIL NEWS)</td></tr>
            <tr><th>발행</th><td>온종일그룹 · 발행인 테리</td></tr>
            <tr><th>독자층</th><td>소상공인·자영업자·예비 창업자</td></tr>
            <tr><th>연락처</th><td>대표전화 준비중 · desk@onjongilnews.com</td></tr>
          </tbody>
        </table>

        <p className="page-updated">온종일뉴스 · 온종일그룹</p>
      </div>
    </main>
  );
}

import type { Metadata } from "next";
import { MailIcon } from "@/icons";

export const metadata: Metadata = {
  title: "기사제보",
  description: "온종일뉴스 기사 제보. 사장님들에게 도움 될 정보·현장의 목소리를 기다립니다. 제보자 신원은 철저히 보호됩니다.",
};

export default function TipPage() {
  return (
    <main className="wrap page">
      <div className="page-hero">
        <span className="page-kicker">TIP</span>
        <h1>기사제보</h1>
        <p>현장의 목소리가 가장 좋은 기사가 됩니다. 사장님의 이야기를 들려주세요.</p>
      </div>

      <div className="prose">
        <h2>이런 제보를 기다려요</h2>
        <ul>
          <li>다른 사장님에게 도움 될 <strong>실전 노하우·성공/실패 경험</strong></li>
          <li>놓치기 쉬운 <strong>정부지원금·정책·마감 정보</strong></li>
          <li>창업·프랜차이즈·마케팅 관련 <strong>제보와 문제 제기</strong></li>
          <li>기사에서 <strong>사실과 다른 부분</strong>에 대한 정정 요청</li>
        </ul>

        <h2>제보하는 방법</h2>
        <p>
          아래 이메일로 <strong>제목에 [제보]</strong>를 붙여 내용을 보내주세요. 사진·자료가
          있으면 함께 첨부해 주시면 확인이 빨라집니다. 연락 가능한 방법을 남겨주시면
          취재 과정에서 연락드릴 수 있습니다.
        </p>
        <div className="contact-cards">
          <div className="contact-card">
            <h3>제보 이메일</h3>
            <p>제목에 [제보]를 붙여 보내주세요.</p>
            <a href="mailto:tip@onjongilnews.com?subject=%5B%EC%A0%9C%EB%B3%B4%5D%20">
              <MailIcon size={16} strokeWidth={2} /> tip@onjongilnews.com
            </a>
          </div>
        </div>

        <div className="page-note">
          <strong>제보자 보호</strong> — 온종일뉴스는 제보자의 신원을 철저히 비밀로 하며,
          동의 없이 신원이 드러나는 정보를 공개하지 않습니다. 원하시면 익명으로 처리합니다.
        </div>

        <p className="page-updated">온종일뉴스 편집국</p>
      </div>
    </main>
  );
}

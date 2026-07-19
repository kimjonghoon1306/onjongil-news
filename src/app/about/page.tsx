import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "회사소개",
  description: "온종일뉴스는 정치를 뺀 실용정보 매체입니다. 사장님·창업자·소상공인에게 진짜 도움 되는 정보만 전합니다.",
};

export default function AboutPage() {
  return (
    <main className="wrap page">
      <div className="page-hero">
        <span className="page-kicker">ABOUT</span>
        <h1>온종일뉴스 소개</h1>
        <p>정치는 뺀다. 사장님·창업자·소상공인에게 진짜 도움 되는 것만 전합니다.</p>
      </div>

      <div className="prose">
        <h2>우리는 왜 시작했나요</h2>
        <p>
          세상엔 뉴스가 넘치지만, 정작 <strong>가게를 운영하는 사장님과 창업을 준비하는
          분들에게 바로 쓸모 있는 정보</strong>는 흩어져 있고 찾기 어렵습니다. 온종일뉴스는
          복잡한 정치·자극적인 이슈를 걷어내고, 돈을 벌고 아끼고 성장하는 데 실제로
          도움 되는 정보만 골라 전하기 위해 만들어졌습니다.
        </p>
        <p>
          온종일뉴스는 <strong>온종일그룹</strong>이 만드는 온라인 매체입니다. 친구가 옆에서
          알려주듯 쉽고 따뜻하게, 그러나 언론의 기본인 정확성과 책임을 지키며 전하겠습니다.
        </p>

        <h2>무엇을 다루나요</h2>
        <p>사장님의 하루에 꼭 필요한 6가지 분야를 다룹니다.</p>
        <ul>
          <li><strong>AI 이슈</strong> — 작은 가게도 쓸 수 있는 실전 AI 활용</li>
          <li><strong>프랜차이즈</strong> — 창업 전 꼭 확인할 손익과 계약</li>
          <li><strong>정부지원금</strong> — 아는 사람만 챙기는 지원사업·마감 정보</li>
          <li><strong>마케팅</strong> — 돈 안 쓰고 단골 만드는 현실적인 방법</li>
          <li><strong>컨설팅</strong> — 세무·노무·경영 전문가의 조언</li>
          <li><strong>무료로 쓰는 툴</strong> — 비용 없이 바로 쓰는 실용 도구</li>
        </ul>

        <h2>어떻게 기사를 만드나요</h2>
        <p>
          온종일뉴스는 편집팀과 기자가 직접 취재·정리하며, 일부 기사는 <strong>AI로 초안을
          작성한 뒤 반드시 사람이 사실을 확인·검증</strong>해 발행합니다. AI의 도움을 받은
          기사에는 그 사실을 명확히 밝힙니다. 자세한 원칙은{" "}
          <Link href="/ethics">윤리강령</Link>에서 확인하실 수 있습니다.
        </p>

        <h2>독자와의 약속</h2>
        <ul>
          <li>광고와 기사를 분명히 구분하고, 협찬·자사서비스는 반드시 표시합니다.</li>
          <li>사실과 다른 내용은 빠르게 바로잡고 정정 사실을 공개합니다.</li>
          <li>어렵게 쓰지 않습니다. 누구나 이해할 수 있게 전합니다.</li>
        </ul>

        <div className="page-note">
          제휴·광고 문의는 <Link href="/contact">제휴·광고문의</Link>,
          제보는 <Link href="/tip">기사제보</Link>로 연락 주세요.
        </div>

        <p className="page-updated">온종일뉴스 · 온종일그룹 · 발행인 테리</p>
      </div>
    </main>
  );
}

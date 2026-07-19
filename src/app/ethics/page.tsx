import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "윤리강령",
  description: "온종일뉴스 취재·보도 윤리강령. 정확성, 독립성, 이해상충 방지, 정정보도, AI 활용 원칙을 담았습니다.",
};

export default function EthicsPage() {
  return (
    <main className="wrap page">
      <div className="page-hero">
        <span className="page-kicker">ETHICS</span>
        <h1>온종일뉴스 윤리강령</h1>
        <p>독자의 신뢰가 매체의 존재 이유입니다. 온종일뉴스는 아래 원칙을 지킵니다.</p>
      </div>

      <div className="prose">
        <h2>1. 정확성과 공정성</h2>
        <ul>
          <li>사실 확인을 거친 정보만 보도하며, 확인되지 않은 내용은 그 사실을 밝힙니다.</li>
          <li>수치·날짜·지원 조건 등은 공식 출처를 확인하고, 가능한 원문 링크를 함께 제공합니다.</li>
          <li>특정 개인·업체를 부당하게 홍보하거나 비방하지 않습니다.</li>
        </ul>

        <h2>2. 독립성과 이해상충 방지</h2>
        <ul>
          <li>광고·협찬이 기사의 내용과 판단에 영향을 주지 않도록 편집과 광고를 분리합니다.</li>
          <li>대가를 받은 콘텐츠에는 <strong>‘광고’ ‘협찬’ ‘파트너 콘텐츠’</strong>를 명확히 표시합니다.</li>
          <li>온종일그룹 계열 서비스를 다룰 때는 <strong>‘자사서비스’</strong>임을 밝힙니다.</li>
        </ul>

        <h2>3. 광고와 기사의 구분</h2>
        <p>
          독자가 기사와 광고를 혼동하지 않도록, 광고에는 언제나 ‘AD’ 등 식별 표시를 붙이고
          기사와 시각적으로 구분합니다.
        </p>

        <h2>4. 정정·반론</h2>
        <ul>
          <li>오류가 확인되면 지체 없이 바로잡고, 정정 사실과 시점을 공개합니다.</li>
          <li>보도로 피해를 주장하는 분의 반론을 성실히 검토하고 반영합니다.</li>
          <li>모든 기사 하단에서 <strong>정정·오류 신고</strong>를 받습니다.</li>
        </ul>

        <h2>5. AI 활용 원칙</h2>
        <ul>
          <li>AI는 초안 작성·자료 정리를 돕는 <strong>보조 도구</strong>로만 사용합니다.</li>
          <li>AI가 만든 내용은 <strong>반드시 사람이 사실을 확인·검증</strong>한 뒤 발행합니다.</li>
          <li>AI의 도움을 받은 기사에는 그 사실을 명확히 밝힙니다.</li>
        </ul>

        <h2>6. 개인정보와 인격권 존중</h2>
        <ul>
          <li>취재원과 독자의 개인정보를 보호하며, 제보자의 신원은 철저히 비밀로 합니다.</li>
          <li>사생활·명예·초상권을 존중하고, 공익과 무관한 사적 정보를 다루지 않습니다.</li>
        </ul>

        <div className="page-note">
          윤리강령 위반이 의심되거나 정정이 필요하면{" "}
          <a href="mailto:tarry9653@daum.net">tarry9653@daum.net</a> 또는{" "}
          <Link href="/contact">문의 페이지</Link>로 알려주세요.
        </div>

        <p className="page-updated">시행 2026.07.19 · 온종일뉴스 편집국</p>
      </div>
    </main>
  );
}

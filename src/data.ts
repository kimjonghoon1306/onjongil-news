// 온종일뉴스 · 데모 데이터 (추후 Supabase 발행 시스템으로 대체)
// 언론사 신뢰장치를 위해 상대시간(minutesAgo)을 실제 발행일시(publishedAt)로 전환.

export type CategoryId =
  | "ai" | "franchise" | "fund" | "marketing" | "consulting" | "free";

export interface Category {
  id: CategoryId;
  name: string;
  color: string;   // 포인트 컬러
}

export const CATEGORIES: Category[] = [
  { id: "ai",         name: "AI 이슈",       color: "#7c3aed" },
  { id: "franchise",  name: "프랜차이즈",     color: "#0369a1" },
  { id: "fund",       name: "정부지원금",     color: "#059669" },
  { id: "marketing",  name: "마케팅",        color: "#d97706" },
  { id: "consulting", name: "컨설팅",        color: "#c8102e" },
  { id: "free",       name: "무료로 쓰는 툴", color: "#2563eb" },
];

export const catOf = (id: CategoryId) =>
  CATEGORIES.find((c) => c.id === id)!;

// 기자(바이라인) — 언론사 신뢰장치
export interface Reporter {
  id: string;
  name: string;
  role: string;
  email: string;
}
export const REPORTERS: Record<string, Reporter> = {
  desk:      { id: "desk",      name: "온종일뉴스 편집팀", role: "편집국", email: "desk@onjongilnews.com" },
  jiwon:     { id: "jiwon",     name: "김지원 기자",       role: "AI·테크",  email: "jiwon@onjongilnews.com" },
  sumin:     { id: "sumin",     name: "이수민 기자",       role: "생활경제", email: "sumin@onjongilnews.com" },
  daepyo:    { id: "daepyo",    name: "박대표 기자",       role: "창업",     email: "daepyo@onjongilnews.com" },
  marketing: { id: "marketing", name: "최마케팅 기자",     role: "마케팅",   email: "choi@onjongilnews.com" },
};

export interface Article {
  id: string;
  category: CategoryId;
  title: string;
  excerpt: string;
  image: string;      // 썸네일 (그라디언트 placeholder)
  reporter: string;   // REPORTERS 키
  publishedAt: string; // ISO 발행일시
  updatedAt?: string;  // ISO 수정일시(있으면 '수정' 표기)
  featured?: boolean; // 오늘의 톱기사
  template?: string;
  body?: string;      // ## 소제목 · [팁]/[주의]/[중요]
  source?: string;    // 자료 출처(기관/원문)
  aiAssisted?: boolean; // AI 초안 보조 여부
}

const grad = (a: string, b: string) =>
  `linear-gradient(135deg, ${a}, ${b})`;

// 데모 발행일시(오늘 2026-07-19 기준 역순)
const T = (iso: string) => iso;

export const ARTICLES: Article[] = [
  {
    id: "a1", category: "fund", featured: true,
    title: "2026 청년창업 지원금 3,000만원, 이렇게 받으세요",
    excerpt: "올해 바뀐 청년창업사관학교 지원 조건과 서류 준비법을 단계별로 정리했습니다. 마감 전에 꼭 확인하세요.",
    image: grad("#059669", "#065f46"),
    reporter: "desk", publishedAt: T("2026-07-19T09:00:00"),
    updatedAt: T("2026-07-19T11:20:00"), template: "magazine",
    source: "중소벤처기업부 창업진흥원 공고", aiAssisted: true,
    body: `창업을 준비하는 청년이라면 올해 꼭 챙겨야 할 소식입니다. 정부가 청년창업사관학교를 통해 최대 3,000만원까지 사업화 자금을 지원하는데, 조건만 맞으면 상환 부담 없이 받을 수 있는 돈입니다. 무엇이 바뀌었고, 어떻게 준비해야 하는지 하나씩 짚어드리겠습니다.

## 누가 받을 수 있나요?
만 39세 이하, 창업 3년 이내 기업 대표라면 신청 대상입니다. 업종 제한이 예전보다 완화돼서 제조업뿐 아니라 지식서비스·온라인 유통 분야도 폭넓게 지원됩니다. 이미 다른 정부지원을 받고 있어도 중복만 아니라면 신청이 가능합니다.

[팁] 사업자등록 전이라도 '예비창업자' 트랙으로 지원할 수 있습니다. 아이디어만 확실하면 도전해 보세요.

## 얼마나, 어떻게 주나요?
총 사업비의 70%까지, 최대 3,000만원을 지원합니다. 나머지 30%는 자기부담이지만 현물(본인 인건비 등)로도 인정됩니다. 자금은 마케팅·시제품 제작·인건비 등 실제 창업에 쓰는 비용으로 집행할 수 있습니다.

[주의] 지원금은 '먼저 쓰고 나중에 정산'하는 방식이 대부분입니다. 초기 현금 흐름 계획을 반드시 세워두세요.

## 합격을 가르는 서류 준비
심사에서 가장 중요한 건 사업계획서입니다. 시장 규모, 차별점, 매출 계획을 숫자로 구체적으로 적을수록 유리합니다. 특히 '왜 지금, 왜 나여야 하는가'를 설득력 있게 담는 것이 핵심입니다.

[중요] 마감 임박해서 몰리면 서버가 느려집니다. 접수 시작일에 미리 서류를 준비해 두고, 여유 있게 제출하세요.

## 마무리
정부지원금은 아는 사람만 챙기는 기회입니다. 온종일뉴스는 앞으로도 사장님과 예비 창업자에게 진짜 도움 되는 정보만 골라 전해드리겠습니다. 신청 링크와 세부 요강은 중소벤처기업부 공고를 꼭 확인하세요.`,
  },
  {
    id: "a2", category: "ai",
    title: "무료로 쓰는 AI 이미지 생성, 사장님도 5분이면 끝",
    excerpt: "상세페이지 사진이 부담이라면? 무료 AI 도구 3가지로 제품 이미지를 뚝딱 만드는 법.",
    image: grad("#7c3aed", "#4c1d95"), reporter: "jiwon",
    publishedAt: T("2026-07-19T08:30:00"), aiAssisted: true,
  },
  {
    id: "a3", category: "ai",
    title: "챗봇 상담, 인건비 없이 24시간 돌리는 현실적인 방법",
    excerpt: "작은 가게도 쓸 수 있는 저비용 AI 상담 세팅. 실제 도입 사례로 봅니다.",
    image: grad("#8b5cf6", "#6d28d9"), reporter: "sumin",
    publishedAt: T("2026-07-19T07:40:00"),
  },
  {
    id: "a4", category: "franchise",
    title: "요즘 뜨는 무인 창업, 진짜 남는 걸까? 손익 계산해봤다",
    excerpt: "무인 아이스크림·밀키트·세탁, 초기비용과 월 순익을 실제 점주 인터뷰로 비교.",
    image: grad("#0369a1", "#075985"), reporter: "daepyo",
    publishedAt: T("2026-07-18T18:10:00"), source: "점주 인터뷰",
  },
  {
    id: "a5", category: "franchise",
    title: "프랜차이즈 계약 전, 이 3가지 안 보면 반드시 후회한다",
    excerpt: "가맹본부가 잘 안 알려주는 위약금·인테리어·물류 마진 체크리스트.",
    image: grad("#0ea5e9", "#0369a1"), reporter: "desk",
    publishedAt: T("2026-07-18T15:00:00"),
  },
  {
    id: "a6", category: "marketing",
    title: "돈 안 쓰고 단골 만드는 인스타 운영법 7가지",
    excerpt: "광고비 0원으로 동네 손님을 단골로 바꾼 실제 자영업자들의 공통점.",
    image: grad("#d97706", "#b45309"), reporter: "marketing",
    publishedAt: T("2026-07-18T11:20:00"),
  },
  {
    id: "a7", category: "consulting",
    title: "세무사가 알려주는 1인 사장님 절세 5계명",
    excerpt: "몰라서 못 받는 공제, 놓치면 손해인 신고 타이밍을 전문가가 짚어줍니다.",
    image: grad("#c8102e", "#991b1b"), reporter: "desk",
    publishedAt: T("2026-07-17T16:30:00"), source: "세무사 인터뷰",
  },
  {
    id: "a8", category: "free",
    title: "홈페이지 무료로 만드는 사이트 BEST 4 (2026)",
    excerpt: "코딩 몰라도 되는 무료 홈페이지 빌더, 장단점과 추천 대상을 정리했습니다.",
    image: grad("#2563eb", "#1d4ed8"), reporter: "desk",
    publishedAt: T("2026-07-17T10:00:00"),
  },
  {
    id: "a9", category: "free",
    title: "무료 디자인 툴 '캔바', 전단지 10분 완성 실전 가이드",
    excerpt: "포토샵 없이 홍보물 만드는 법. 사장님용 템플릿 활용 꿀팁까지.",
    image: grad("#3b82f6", "#2563eb"), reporter: "sumin",
    publishedAt: T("2026-07-16T14:00:00"),
  },
  {
    id: "a10", category: "marketing",
    title: "네이버 플레이스 상위노출, 돈 안 들이고 올리는 법",
    excerpt: "리뷰·사진·소식 3박자로 검색 순위를 끌어올린 실제 매장 사례.",
    image: grad("#f59e0b", "#d97706"), reporter: "marketing",
    publishedAt: T("2026-07-16T09:30:00"),
  },
];

export const articleById = (id: string) => ARTICLES.find((a) => a.id === id);

// 📌 이번주 놓치면 손해 (마감임박)
export interface Deadline {
  label: string;
  dday: number;       // D-n
  category: CategoryId;
}
export const DEADLINES: Deadline[] = [
  { label: "청년창업사관학교 2기 모집",   dday: 3, category: "fund" },
  { label: "소상공인 정책자금 저금리 융자", dday: 5, category: "fund" },
  { label: "무료 AI 마케팅 특강 신청",     dday: 2, category: "marketing" },
  { label: "지역 창업 컨설팅 무료 매칭",   dday: 6, category: "consulting" },
];

// 🔥 광고 슬라이드 (3.5초 자동회전 · 이미지/텍스트 겸용)
export interface Ad {
  id: string;
  title?: string;
  sub?: string;
  cta?: string;
  url: string;
  bg?: string;
  img?: string;      // 배너 이미지(있으면 contain + blur backdrop)
  house?: boolean;   // 자사 서비스 여부 → 'AD·자사서비스' 표기
}
export const ADS: Ad[] = [
  {
    id: "ad1", title: "온종일팜 — 산지직송 신선먹거리",
    sub: "사장님도 손님도 만족하는 특가", cta: "구경하기",
    url: "https://app.yuanfnb.com", bg: grad("#059669", "#047857"), house: true,
  },
  {
    id: "ad2", title: "온파트너 — 제휴마케팅으로 부수입",
    sub: "가입 무료 · 클릭 한 번으로 시작", cta: "무료 가입",
    url: "#", bg: grad("#2563eb", "#1e40af"), house: true,
  },
  {
    id: "ad3", title: "블로그오토프로 — AI가 글을 대신",
    sub: "제목·본문·이미지까지 자동 생성", cta: "체험하기",
    url: "#", bg: grad("#7c3aed", "#5b21b6"), house: true,
  },
  {
    id: "ad4", title: "여기에 우리 매장 광고를!",
    sub: "온종일뉴스 광고 문의 환영", cta: "광고 문의",
    url: "#", bg: grad("#d97706", "#b45309"),
  },
];

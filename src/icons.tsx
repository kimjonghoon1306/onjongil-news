// 온종일뉴스 SVG 아이콘 세트 (이모지 대신 · 라인 스타일, currentColor 상속)
import type * as React from "react";
import type { CategoryId } from "./data";

type P = { size?: number; className?: string; strokeWidth?: number };

const base = (size = 24, strokeWidth = 1.8) => ({
  width: size, height: size, viewBox: "0 0 24 24",
  fill: "none", stroke: "currentColor",
  strokeWidth, strokeLinecap: "round" as const, strokeLinejoin: "round" as const,
});

/* ── 카테고리 아이콘 ── */
export const AiIcon = ({ size, className, strokeWidth }: P) => (
  <svg {...base(size, strokeWidth)} className={className}>
    <rect x="7" y="7" width="10" height="10" rx="2" />
    <path d="M10 10.5h4v3h-4z" />
    <path d="M9 3v2M15 3v2M9 19v2M15 19v2M3 9h2M3 15h2M19 9h2M19 15h2" />
  </svg>
);
export const StoreIcon = ({ size, className, strokeWidth }: P) => (
  <svg {...base(size, strokeWidth)} className={className}>
    <path d="M4 9h16l-1-4H5L4 9z" />
    <path d="M4 9v1a2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0V9" />
    <path d="M5 12v8h14v-8" />
    <path d="M9 20v-5h6v5" />
  </svg>
);
export const FundIcon = ({ size, className, strokeWidth }: P) => (
  <svg {...base(size, strokeWidth)} className={className}>
    <circle cx="12" cy="12" r="9" />
    <path d="M8 8l4 5 4-5" />
    <path d="M12 13v5M9 15h6M9 12.5h6" />
  </svg>
);
export const MegaphoneIcon = ({ size, className, strokeWidth }: P) => (
  <svg {...base(size, strokeWidth)} className={className}>
    <path d="M4 9v4a1 1 0 0 0 1 1h2l7 4V4L7 8H5a1 1 0 0 0-1 1z" />
    <path d="M17 8a4 4 0 0 1 0 6" />
    <path d="M7 14v4a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-2" />
  </svg>
);
export const CompassIcon = ({ size, className, strokeWidth }: P) => (
  <svg {...base(size, strokeWidth)} className={className}>
    <circle cx="12" cy="12" r="9" />
    <path d="M15.5 8.5l-2 5-5 2 2-5 5-2z" />
  </svg>
);
export const TagIcon = ({ size, className, strokeWidth }: P) => (
  <svg {...base(size, strokeWidth)} className={className}>
    <path d="M3 12l8.5-8.5a2 2 0 0 1 1.4-.6H19a2 2 0 0 1 2 2v6.1a2 2 0 0 1-.6 1.4L12 21a1.5 1.5 0 0 1-2.1 0L3 14.1a1.5 1.5 0 0 1 0-2.1z" />
    <circle cx="16.5" cy="7.5" r="1.3" />
  </svg>
);

const CAT_ICON: Record<CategoryId, (p: P) => React.ReactElement> = {
  ai: AiIcon, franchise: StoreIcon, fund: FundIcon,
  marketing: MegaphoneIcon, consulting: CompassIcon, free: TagIcon,
};
export const CategoryIcon = ({ id, ...p }: P & { id: CategoryId }) => {
  const C = CAT_ICON[id];
  return <C {...p} />;
};

/* ── UI 아이콘 ── */
export const SearchIcon = ({ size, className, strokeWidth }: P) => (
  <svg {...base(size, strokeWidth)} className={className}>
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.3-4.3" />
  </svg>
);
export const MenuIcon = ({ size, className, strokeWidth }: P) => (
  <svg {...base(size, strokeWidth)} className={className}>
    <path d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);
export const ClockIcon = ({ size, className, strokeWidth }: P) => (
  <svg {...base(size, strokeWidth)} className={className}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);
export const ChevronRight = ({ size, className, strokeWidth }: P) => (
  <svg {...base(size, strokeWidth)} className={className}>
    <path d="M9 6l6 6-6 6" />
  </svg>
);
export const MoonIcon = ({ size, className, strokeWidth }: P) => (
  <svg {...base(size, strokeWidth)} className={className}>
    <path d="M20 14.5A8 8 0 0 1 9.5 4a7 7 0 1 0 10.5 10.5z" />
  </svg>
);
export const SunIcon = ({ size, className, strokeWidth }: P) => (
  <svg {...base(size, strokeWidth)} className={className}>
    <circle cx="12" cy="12" r="4.5" />
    <path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19" />
  </svg>
);
export const PauseIcon = ({ size, className, strokeWidth }: P) => (
  <svg {...base(size, strokeWidth)} className={className}>
    <rect x="7" y="6" width="3.2" height="12" rx="1" fill="currentColor" stroke="none" />
    <rect x="13.8" y="6" width="3.2" height="12" rx="1" fill="currentColor" stroke="none" />
  </svg>
);
export const PlayIcon = ({ size, className, strokeWidth }: P) => (
  <svg {...base(size, strokeWidth)} className={className}>
    <path d="M8 5.5v13l11-6.5-11-6.5z" fill="currentColor" stroke="none" />
  </svg>
);
export const ShareIcon = ({ size, className, strokeWidth }: P) => (
  <svg {...base(size, strokeWidth)} className={className}>
    <circle cx="18" cy="5" r="2.6" />
    <circle cx="6" cy="12" r="2.6" />
    <circle cx="18" cy="19" r="2.6" />
    <path d="M8.3 10.8l7.4-4.3M8.3 13.2l7.4 4.3" />
  </svg>
);
export const PrinterIcon = ({ size, className, strokeWidth }: P) => (
  <svg {...base(size, strokeWidth)} className={className}>
    <path d="M7 9V4h10v5" />
    <path d="M7 18H5a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-2" />
    <rect x="7" y="15" width="10" height="6" rx="1" />
  </svg>
);
export const MailIcon = ({ size, className, strokeWidth }: P) => (
  <svg {...base(size, strokeWidth)} className={className}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M4 7l8 6 8-6" />
  </svg>
);
export const GearIcon = ({ size, className, strokeWidth }: P) => (
  <svg {...base(size, strokeWidth)} className={className}>
    <circle cx="12" cy="12" r="3.2" />
    <path d="M12 3v2.2M12 18.8V21M4.2 7.5l1.9 1.1M17.9 15.4l1.9 1.1M4.2 16.5l1.9-1.1M17.9 8.6l1.9-1.1" />
  </svg>
);
export const BookIcon = ({ size, className, strokeWidth }: P) => (
  <svg {...base(size, strokeWidth)} className={className}>
    <path d="M4 5a2 2 0 0 1 2-2h5v16H6a2 2 0 0 0-2 2V5z" />
    <path d="M20 5a2 2 0 0 0-2-2h-5v16h5a2 2 0 0 1 2 2V5z" />
  </svg>
);

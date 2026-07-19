"use client";

import { useState } from "react";
import { ShareIcon, PrinterIcon, BookIcon } from "@/icons";

export default function ArticleTools({
  title, readMin,
}: { title: string; readMin: number }) {
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      try { await navigator.share({ title, url }); } catch { /* 취소 */ }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      } catch { /* noop */ }
    }
  };

  return (
    <div className="art-tools">
      <span className="art-readtime">
        <BookIcon size={15} strokeWidth={2} /> 읽는 데 약 {readMin}분
      </span>
      <div className="art-tools-btns">
        <button onClick={share} aria-label="공유" title="공유">
          <ShareIcon size={17} strokeWidth={2} />
          <span>{copied ? "복사됨!" : "공유"}</span>
        </button>
        <button onClick={() => window.print()} aria-label="인쇄" title="인쇄">
          <PrinterIcon size={17} strokeWidth={2} />
          <span>인쇄</span>
        </button>
      </div>
    </div>
  );
}

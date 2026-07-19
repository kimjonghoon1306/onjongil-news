"use client";

import { useEffect, useRef, useState } from "react";
import { ADS, type Ad } from "@/data";
import { PauseIcon, PlayIcon } from "@/icons";

function AdInner({ ad }: { ad: Ad }) {
  const label = ad.house ? "AD · 자사서비스" : "AD · 광고";
  const hasText = !!(ad.title || ad.sub || ad.cta);

  if (ad.img) {
    // 이미지 배너: 안 잘리게 contain + 뒤에 같은 이미지 흐리게(blur backdrop)
    return (
      <>
        <div className="ad-imgbg" style={{ backgroundImage: `url(${ad.img})` }} />
        <img className="ad-img" src={ad.img} alt={ad.title || "광고"} />
        <span className="ad-badge">{label}</span>
        {hasText && (
          <div className="ad-overlay">
            <div className="ad-text">
              {ad.title && <h3>{ad.title}</h3>}
              {ad.sub && <p>{ad.sub}</p>}
            </div>
            {ad.cta && <span className="ad-cta">{ad.cta}</span>}
          </div>
        )}
      </>
    );
  }

  // 텍스트/색상 배너
  return (
    <>
      <span className="ad-badge">{label}</span>
      <div className="ad-text">
        {ad.title && <h3>{ad.title}</h3>}
        {ad.sub && <p>{ad.sub}</p>}
      </div>
      {ad.cta && <span className="ad-cta">{ad.cta}</span>}
    </>
  );
}

export default function AdSlider() {
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(true);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!playing) return;
    timer.current = setInterval(() => setI((p) => (p + 1) % ADS.length), 3500);
    return () => { if (timer.current) clearInterval(timer.current); };
  }, [playing]);

  return (
    <div
      className="ad-slider"
      onMouseEnter={() => setPlaying(false)}
      onMouseLeave={() => setPlaying(true)}
      aria-label="광고"
    >
      {ADS.map((ad, idx) => (
        <a
          key={ad.id}
          href={ad.url}
          target={ad.url.startsWith("http") ? "_blank" : undefined}
          rel="noreferrer"
          className={"ad-slide" + (idx === i ? " active" : "")}
          style={ad.img ? undefined : { background: ad.bg }}
          aria-hidden={idx !== i}
          tabIndex={idx === i ? 0 : -1}
        >
          <AdInner ad={ad} />
        </a>
      ))}

      {/* 재생/정지 버튼 (고연령 배려 — 자동회전 멈춤) */}
      <button
        className="ad-play"
        onClick={() => setPlaying((p) => !p)}
        aria-label={playing ? "광고 자동넘김 멈춤" : "광고 자동넘김 재생"}
        title={playing ? "멈춤" : "재생"}
      >
        {playing ? <PauseIcon size={15} /> : <PlayIcon size={15} />}
      </button>

      <div className="ad-dots" role="tablist" aria-label="광고 선택">
        {ADS.map((_, idx) => (
          <button
            key={idx}
            className={"ad-dot" + (idx === i ? " on" : "")}
            onClick={() => setI(idx)}
            aria-label={`광고 ${idx + 1}`}
            aria-selected={idx === i}
            role="tab"
          />
        ))}
      </div>
    </div>
  );
}

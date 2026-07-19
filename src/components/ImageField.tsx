"use client";

import { useRef, useState } from "react";

// 이미지 입력 = 사진 직접 올리기 + URL 직접 입력 겸용
export default function ImageField({
  value, onChange, label = "대표 이미지", hint,
}: {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  hint?: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState("");

  const pick = () => fileRef.current?.click();

  const upload = async (file: File) => {
    setErr("");
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "업로드 실패");
      onChange(j.url);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "업로드에 실패했어요.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="field imgfield">
      <label>{label}</label>
      {hint && <span className="hint">{hint}</span>}

      {value && (
        <div className="imgfield-preview">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="미리보기" />
          <button type="button" className="imgfield-remove" onClick={() => onChange("")} aria-label="사진 지우기">✕ 사진 지우기</button>
        </div>
      )}

      <div className="imgfield-row">
        <button type="button" className="btn btn-fix btn-sm" onClick={pick} disabled={uploading}>
          {uploading ? "올리는 중…" : "📷 사진 올리기"}
        </button>
        <input
          className="imgfield-url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="또는 사진 주소(URL) 붙여넣기"
          autoComplete="off" spellCheck={false}
        />
      </div>
      <input ref={fileRef} type="file" accept="image/*" hidden
        onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = ""; }} />
      {err && <span className="imgfield-err">{err}</span>}
    </div>
  );
}

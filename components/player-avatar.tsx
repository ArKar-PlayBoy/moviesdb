"use client";

import { useState, useEffect } from "react";

const WIKI_BASE = "https://en.wikipedia.org/api/rest_v1/page/summary";

interface PlayerAvatarProps {
  name: string;
  photoUrl?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeMap = {
  sm: "w-10 h-10",
  md: "w-14 h-14",
  lg: "w-20 h-20",
  xl: "w-28 h-28",
};

const iconSizeMap = {
  sm: "h-5 w-5",
  md: "h-7 w-7",
  lg: "h-10 w-10",
  xl: "h-14 w-14",
};

export default function PlayerAvatar({ name, photoUrl, size = "md", className = "" }: PlayerAvatarProps) {
  const [photo, setPhoto] = useState<string | null>(photoUrl || null);
  const [loading, setLoading] = useState(!photoUrl);

  useEffect(() => {
    if (photoUrl) {
      setPhoto(photoUrl);
      setLoading(false);
      return;
    }
    setLoading(true);
    const cacheKey = `wiki-${name}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      setPhoto(cached);
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    fetch(`${WIKI_BASE}/${encodeURIComponent(name)}`, { signal: controller.signal })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        const url = data?.thumbnail?.source || null;
        if (url) {
          sessionStorage.setItem(cacheKey, url);
          setPhoto(url);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
    return () => controller.abort();
  }, [name, photoUrl]);

  if (loading) {
    return (
      <div className={`${sizeMap[size]} rounded-full bg-gradient-to-br from-secondary to-card flex items-center justify-center ring-2 ring-border ${className}`}>
        <FootballIcon className={iconSizeMap[size]} />
      </div>
    );
  }

  if (photo) {
    return (
      <div className={`${sizeMap[size]} rounded-full overflow-hidden ring-2 ring-border shrink-0 ${className}`}>
        <img src={photo} alt={name} className="w-full h-full object-cover" />
      </div>
    );
  }

  return (
    <div className={`${sizeMap[size]} rounded-full bg-gradient-to-br from-green-500/20 to-green-500/5 flex items-center justify-center ring-2 ring-green-500/20 ${className}`}>
      <FootballIcon className={iconSizeMap[size]} />
    </div>
  );
}

function FootballIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={`text-green-600 ${className || "h-6 w-6"}`}>
      {/* Player body */}
      <circle cx="12" cy="5" r="3.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 22c0-4 3.5-7 7-7s7 3 7 7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 13l-3 2" strokeLinecap="round" />
      <path d="M16 13l3 2" strokeLinecap="round" />
      {/* Football */}
      <circle cx="19" cy="6" r="2.5" fill="currentColor" stroke="none" />
      <path d="M17.5 5l1.5 2M20.5 5l-1.5 2" stroke="white" strokeWidth="0.5" />
    </svg>
  );
}

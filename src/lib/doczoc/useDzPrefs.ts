"use client";
import { useState, useEffect } from "react";

const FONT_MAP: Record<string, string> = {
  inter: "Inter, -apple-system, sans-serif",
  system: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  mono: "'SF Mono', 'Fira Code', 'Consolas', monospace",
  serif: "Georgia, 'Times New Roman', serif",
  rounded: "'Nunito', 'Varela Round', system-ui, sans-serif",
  geometric: "'Poppins', 'Futura', system-ui, sans-serif",
};

export function useDzPrefs() {
  const [bgId, setBgId] = useState(() => {
    if (typeof window !== "undefined") return localStorage.getItem("dz-bg") || "none";
    return "none";
  });
  const [fontFamily, setFontFamily] = useState(() => {
    if (typeof window !== "undefined") return localStorage.getItem("dz-font") || "inter";
    return "inter";
  });
  useEffect(() => {
    const onStorage = () => {
      setBgId(localStorage.getItem("dz-bg") || "none");
      setFontFamily(localStorage.getItem("dz-font") || "inter");
    };
    window.addEventListener("storage", onStorage);
    const interval = setInterval(onStorage, 500);
    return () => { window.removeEventListener("storage", onStorage); clearInterval(interval); };
  }, []);

  // Apply font to CSS variable so .dz-platform picks it up
  useEffect(() => {
    const family = FONT_MAP[fontFamily] || FONT_MAP.inter;
    document.documentElement.style.setProperty("--dz-font", family);
  }, [fontFamily]);

  return { bgId, fontFamily };
}

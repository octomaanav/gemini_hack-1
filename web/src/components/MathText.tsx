import React, { useEffect, useRef } from "react";

declare global {
  interface Window {
    MathJax?: {
      typesetPromise?: (elements?: Element[]) => Promise<void>;
    };
  }
}

const loadMathJax = async () => {
  if (window.MathJax) return;
  // Configure MathJax to recognize $...$ and $$...$$ and support \text{}
  (window as any).MathJax = {
    tex: {
      inlineMath: [["$", "$"], ["\\(", "\\)"]],
      displayMath: [["$$", "$$"], ["\\[", "\\]"]],
      processEscapes: true,
      packages: { '[+]': ['textmacros'] }
    },
  };
  await new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load MathJax"));
    document.head.appendChild(script);
  });
};

interface MathTextProps {
  text: string;
  className?: string;
}

export const MathText: React.FC<MathTextProps> = ({ text, className }) => {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await loadMathJax();
      if (cancelled || !ref.current) return;
      // Set raw content; MathJax will find TeX like $...$ and $$...$$
      ref.current.innerHTML = text;
      try {
        await window.MathJax?.typesetPromise?.([ref.current]);
      } catch {
        // ignore typeset errors
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [text]);

  return <span ref={ref} className={className} />;
};

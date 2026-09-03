"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function TopLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Complete progress bar on route/search change
  useEffect(() => {
    if (!isVisible) return;

    const startTimer = setTimeout(() => {
      setProgress(100);
    }, 0);

    const finishTimer = setTimeout(() => {
      setIsVisible(false);
      setProgress(0);
    }, 280);

    return () => {
      clearTimeout(startTimer);
      clearTimeout(finishTimer);
    };
  }, [pathname, searchParams, isVisible]);

  // Intercept internal link clicks to trigger progress bar smoothly
  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (
        href &&
        href.startsWith("/") &&
        !href.startsWith("//") &&
        target.target !== "_blank" &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.shiftKey &&
        !e.altKey
      ) {
        // Skip if clicking the current route
        try {
          const targetUrl = new URL(href, window.location.href);
          if (
            targetUrl.pathname === window.location.pathname &&
            targetUrl.search === window.location.search
          ) {
            return;
          }
        } catch {
          // Ignore URL constructor errors
        }

        setIsVisible(true);
        setProgress(28);

        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
          setProgress((prev) => {
            if (prev < 60) return prev + Math.floor(Math.random() * 12) + 8;
            if (prev < 86) return prev + Math.floor(Math.random() * 4) + 2;
            return prev;
          });
        }, 120);
      }
    };

    document.addEventListener("click", handleLinkClick, true);

    return () => {
      document.removeEventListener("click", handleLinkClick, true);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  if (!isVisible && progress === 0) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 z-[99999] pointer-events-none h-[3px] overflow-hidden"
      style={{
        opacity: isVisible || progress > 0 ? 1 : 0,
        transition: "opacity 200ms ease",
      }}
    >
      {/* Gradient Progress Bar */}
      <div
        className="h-full bg-gradient-to-r from-[#007AFF] via-[#5856D6] to-[#D75800] transition-all ease-out"
        style={{
          width: `${progress}%`,
          transitionDuration: progress === 100 ? "150ms" : "250ms",
          boxShadow: "0 0 10px rgba(0, 122, 255, 0.8), 0 0 5px rgba(88, 86, 214, 0.6)",
        }}
      />
      {/* Light glow shimmer on the head */}
      <div
        className="absolute top-0 right-0 w-24 h-full bg-gradient-to-r from-transparent to-white/40 pointer-events-none"
        style={{
          transform: `translateX(${progress - 100}%)`,
          transition: "transform 250ms ease-out",
        }}
      />
    </div>
  );
}

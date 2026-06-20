"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export function AnalyticsTracker() {
  const pathname = usePathname();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    // Exclude admin panel pages from public analytics
    if (pathname && !pathname.startsWith("/admin") && pathname !== lastPath.current) {
      lastPath.current = pathname;

      const trackPageView = async () => {
        try {
          await fetch("/api/analytics", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              path: pathname,
              referrer: document.referrer || null,
            }),
          });
        } catch (err) {
          console.error("Failed to send analytics page view:", err);
        }
      };

      // Delay tracking slightly to avoid blocking page load
      const timer = setTimeout(trackPageView, 1000);
      return () => clearTimeout(timer);
    }
  }, [pathname]);

  return null;
}
export default AnalyticsTracker;

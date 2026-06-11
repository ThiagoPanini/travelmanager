"use client";

import { useEffect, useState } from "react";

export function UtcClock() {
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const hh = String(now.getUTCHours()).padStart(2, "0");
      const mm = String(now.getUTCMinutes()).padStart(2, "0");
      setLabel(`${hh}:${mm} UTC`);
    };
    tick();
    const timer = setInterval(tick, 30_000);
    return () => clearInterval(timer);
  }, []);

  // null on first paint to avoid SSR/CSR mismatch
  return (
    <span className="utc-clock" suppressHydrationWarning>
      {label ?? ""}
    </span>
  );
}

"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { normalizeManualTheme } from "@/lib/theme-preference";

/** Explicit two-state control: it never follows the operating system. */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Render a stable light-state control until mounted. This avoids a hydration
  // mismatch while next-themes restores a saved preference before paint.
  const current = mounted ? normalizeManualTheme(theme) : "light";
  const dark = current === "dark";
  const label = dark ? "Switch to light theme" : "Switch to dark theme";

  return (
    <button
      type="button"
      className={`theme-toggle${dark ? " is-dark" : ""}`}
      title={label}
      aria-label={label}
      aria-pressed={dark}
      onClick={() => setTheme(dark ? "light" : "dark")}
    >
      <span className="theme-toggle-thumb" aria-hidden="true" />
      <Sun className="theme-toggle-icon theme-toggle-sun" aria-hidden="true" size={15} strokeWidth={2} />
      <Moon className="theme-toggle-icon theme-toggle-moon" aria-hidden="true" size={15} strokeWidth={2} />
    </button>
  );
}

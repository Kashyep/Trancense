"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";
import { useEffect, useId, useRef, useState } from "react";

export type MenuItem = { label: string; href: string; ariaLabel?: string };

/** A reduced, accessible implementation inspired by the provided React Bits menu. */
export function StaggeredMenu({ items }: { items: MenuItem[] }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (open) {
      document.body.style.overflow = "hidden";
      panel.hidden = false;
      const links = panel.querySelectorAll<HTMLElement>("a, button");
      if (reduceMotion) gsap.set(panel, { autoAlpha: 1 });
      else gsap.fromTo(panel, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2, ease: "power1.out" });
      requestAnimationFrame(() => links[0]?.focus());
    } else {
      document.body.style.overflow = "";
      if (reduceMotion) {
        panel.hidden = true;
      } else {
        gsap.to(panel, { autoAlpha: 0, duration: 0.15, ease: "power1.in", onComplete: () => { panel.hidden = true; } });
      }
    }
    return () => { document.body.style.overflow = ""; gsap.killTweensOf(panel); };
  }, [open]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setOpen(false); toggleRef.current?.focus(); }
      if (event.key !== "Tab" || !open || !panelRef.current) return;
      const focusable = Array.from(panelRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'));
      if (!focusable.length) return;
      const first = focusable[0]; const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return <div className="staggered-menu">
    <button ref={toggleRef} className="menu-toggle" type="button" aria-expanded={open} aria-controls={id} onClick={() => setOpen((value) => !value)}>
      <span>{open ? "Close" : "Menu"}</span><span className="menu-mark" aria-hidden="true"><i /><i /></span>
    </button>
    <div id={id} ref={panelRef} className="staggered-menu-panel" hidden aria-label="Main navigation" role="dialog" aria-modal="true">
      <div className="staggered-menu-inner">
        <p className="kicker">Navigate</p>
        <nav aria-label="Main navigation"><ol>
          {items.map((item, index) => <li key={item.href}>
            <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
            <Link href={item.href} aria-label={item.ariaLabel ?? item.label} aria-current={pathname === item.href ? "page" : undefined} onClick={() => setOpen(false)}>{item.label}</Link>
          </li>)}
        </ol></nav>
      </div>
    </div>
  </div>;
}

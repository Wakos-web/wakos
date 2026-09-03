import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { NAV_ITEMS, SCHOOL_NAME, LOGO_URL } from "@/lib/content";

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isHome = pathname === "/";

  useEffect(() => { setMenuOpen(false); }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  useEffect(() => {
    if (!isHome) { setScrolled(true); return; }
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  const headerBg = isHome && !scrolled ? "bg-transparent" : "bg-cream/95 backdrop-blur-md shadow-sm";
  const textColor = isHome && !scrolled ? "text-white" : "text-foreground";

  return (
    <>
      <header className={"fixed inset-x-0 top-0 z-40 transition-all duration-300 " + headerBg} role="banner">
        <div className={"hidden items-center justify-between px-6 py-4 lg:flex xl:px-10 " + textColor}>
          <Link to="/" className="flex items-center gap-3">
            <img src={LOGO_URL} alt="" className="h-14 w-auto drop-shadow-lg" aria-hidden="true" />
            <div className="flex flex-col leading-none"><span className="font-display text-lg font-semibold tracking-[0.1em] xl:text-xl" style={{textShadow: "0 0 8px rgba(255,255,255,0.35), 0 0 14px rgba(255,255,255,0.15)"}}>M.M College</span><span className="font-display text-sm font-medium tracking-[0.15em] xl:text-base" style={{textShadow: "0 0 6px rgba(255,255,255,0.3)"}}>Wairaka</span></div>
          </Link>
          <nav className="flex items-center gap-6 xl:gap-8" aria-label="Main navigation">
            {NAV_ITEMS.map((item) => (
              <Link key={item.to} to={item.to} className={"text-sm font-medium tracking-wide transition-colors hover:underline hover:underline-offset-8 " + (isHome && !scrolled ? "text-white/80 hover:text-white" : "text-muted-foreground hover:text-foreground")}>{item.label}</Link>
            ))}
          </nav>
          <Link to="/admissions" className={"rounded-full px-5 py-2 text-sm font-semibold transition-all " + (isHome && !scrolled ? "border border-white/40 text-white hover:bg-white/10" : "bg-primary text-primary-foreground hover:bg-primary/90")}>Admissions</Link>
        </div>
        <div className={"flex items-center justify-between px-4 py-3 lg:hidden " + textColor}>
          <Link to="/" className="flex items-center gap-2">
            <img src={LOGO_URL} alt="" className="h-10 w-auto drop-shadow-lg" aria-hidden="true" />
            <div className="flex flex-col leading-none"><span className="font-display text-sm font-semibold tracking-[0.1em]">M.M College</span><span className="font-display text-xs font-medium tracking-[0.12em]">Wairaka</span></div>
          </Link>
          <button type="button" aria-label="Open menu" aria-expanded={menuOpen} onClick={() => setMenuOpen(true)} className={"rounded-full p-2.5 transition-colors " + (isHome && !scrolled ? "bg-white/15 text-white hover:bg-white/25" : "bg-secondary text-foreground hover:bg-secondary/80")}>
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>
      {menuOpen && <MobileMenu onClose={() => setMenuOpen(false)} />}
    </>
  );
}
function MobileMenu({ onClose }: { onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => { closeRef.current?.focus(); }, []);
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation menu" onKeyDown={handleKeyDown}>
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className="absolute inset-x-0 bottom-0 top-0 flex flex-col bg-cream animate-in slide-in-from-top duration-300">
        <div className="flex items-center justify-between px-5 py-4">
          <span className="font-display text-lg font-semibold tracking-[0.14em] text-foreground">{SCHOOL_NAME}</span>
          <button ref={closeRef} type="button" aria-label="Close menu" onClick={onClose} className="rounded-full bg-primary p-2.5 text-primary-foreground transition-transform hover:scale-105">
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-5 pb-8 pt-4" aria-label="Mobile navigation">
          {NAV_ITEMS.map((item) => (
            <Link key={item.to} to={item.to} className="flex items-center justify-between rounded-2xl px-5 py-4 font-display text-2xl font-medium text-foreground transition-colors hover:bg-secondary sm:text-3xl">
              {item.label}
              <span className="text-lg text-muted-foreground">&rarr;</span>
            </Link>
          ))}
        </nav>
        <div className="border-t border-border px-5 py-4">
          <Link to="/admissions" className="mb-3 block w-full rounded-full bg-primary py-3 text-center text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90">Apply Now</Link>
          <p className="text-center text-xs text-muted-foreground">{SCHOOL_NAME} &mdash; Est. 1953</p>
        </div>
      </div>
    </div>
  );
}
import { Link, useRouterState } from "@tanstack/react-router";
import { CalendarDays, Menu, Search, UserRound, X } from "lucide-react";
import { useEffect, useState } from "react";
import { NAV_ITEMS, SCHOOL_NAME } from "@/lib/content";

function Crest({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="2" />
      <path
        d="M24 10 L34 15 V26 C34 32 29.5 36.5 24 38.5 C18.5 36.5 14 32 14 26 V15 Z"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M19 24.5 L22.5 28 L29.5 20"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header className="absolute inset-x-0 top-0 z-40">
        {/* Desktop bar (Regis-style) */}
        <div className="hidden items-center justify-between px-8 py-5 lg:flex">
          <Link to="/" className="flex items-center gap-3 text-white">
            <Crest className="h-12 w-12" />
            <span className="font-display text-4xl font-semibold tracking-[0.18em]">
              ALDERMONT
            </span>
          </Link>
          <nav className="flex items-center gap-7">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="text-sm font-medium tracking-wide text-white/90 transition-colors hover:text-white hover:underline hover:underline-offset-8"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-5 text-white">
            <span className="flex items-center gap-2 text-sm font-medium">
              <UserRound className="h-4 w-4" /> Login
            </span>
            <CalendarDays className="h-5 w-5" />
          </div>
        </div>

        {/* Mobile bar */}
        <div className="flex items-center justify-between px-4 pt-4 lg:hidden">
          <Link
            to="/"
            className="flex items-center gap-2 rounded-full bg-cream/95 px-4 py-2 text-foreground shadow-sm"
          >
            <Crest className="h-7 w-7 text-primary" />
            <span className="font-display text-xl font-semibold tracking-[0.14em]">
              ALDERMONT
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Search"
              className="rounded-full bg-cream/95 p-2.5 text-foreground shadow-sm"
            >
              <Search className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setOpen(true)}
              className="rounded-full bg-primary p-2.5 text-primary-foreground shadow-sm"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay (WUR-style rounded sheet) */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-foreground/50"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-x-3 bottom-3 top-16 flex flex-col overflow-hidden rounded-[2rem] bg-cream shadow-2xl">
            <div className="flex items-center justify-between px-6 py-5">
              <span className="font-display text-2xl font-semibold tracking-[0.14em] text-primary">
                MENU
              </span>
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
                className="rounded-full bg-primary p-2.5 text-primary-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-4 pb-6">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="flex items-center justify-between rounded-2xl px-4 py-4 font-display text-3xl font-medium text-foreground transition-colors hover:bg-secondary"
                >
                  {item.label}
                  <span className="text-gold">&rarr;</span>
                </Link>
              ))}
            </nav>
            <div className="border-t border-border px-6 py-4 text-sm text-muted-foreground">
              {SCHOOL_NAME} &mdash; Est. 1916
            </div>
          </div>
        </div>
      )}
    </>
  );
}

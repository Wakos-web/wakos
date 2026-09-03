import { Link } from "@tanstack/react-router";
import { NAV_ITEMS, SCHOOL_NAME, SCHOOL_TAGLINE } from "@/lib/content";

export function SiteFooter() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid gap-12 md:grid-cols-3">
          <div>
            <p className="font-display text-2xl font-semibold tracking-[0.18em]">
              M.M COLLEGE WAIRAKA
            </p>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-primary-foreground/80">
              {SCHOOL_TAGLINE}.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground/60">
              Explore
            </p>
            <ul className="mt-4 space-y-2">
              {NAV_ITEMS.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="text-sm text-primary-foreground/90 hover:underline hover:underline-offset-4"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground/60">
              Visit
            </p>
            <address className="mt-4 text-sm not-italic leading-relaxed text-primary-foreground/90">
              Wairaka, Jinja
              <br />
              Uganda
              <br />
              info@wacos.ac.ug
            </address>
          </div>
        </div>
        <div className="mt-8 flex flex-col gap-2 border-t border-primary-foreground/20 pt-6 text-xs text-primary-foreground/60 md:flex-row md:items-center md:justify-between">
          <p>&copy; {new Date().getFullYear()} {SCHOOL_NAME}. All rights reserved.</p>
          <p>Powered by <a href="https://www.alerotek.co.ke" target="_blank" rel="noopener noreferrer" class="hover:underline hover:underline-offset-4">Alerotek</a></p>
        </div>
      </div>
    </footer>
  );
}

import type { ReactNode } from "react";
import { IMAGES } from "@/lib/content";

export function PageHero({
  title,
  subtitle,
  image,
  imageAlt,
}: {
  title: string;
  subtitle?: string;
  image?: string;
  imageAlt?: string;
}) {
  return (
    <section className="relative">
      {/* Desktop: image band */}
      <div className="relative hidden h-[46vh] min-h-[22rem] lg:block">
        <img
          src={image ?? IMAGES.campus}
          alt={imageAlt ?? title}
          width={1600}
          height={900}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/50 to-foreground/40" />
        <div className="absolute inset-x-0 bottom-14 text-center">
          <h1 className="font-display text-6xl font-medium text-white">{title}</h1>
          {subtitle && (
            <p className="mx-auto mt-4 max-w-2xl text-lg text-white/85">{subtitle}</p>
          )}
        </div>
      </div>
      {/* Mobile: WUR-style rounded card */}
      <div className="px-4 pt-24 lg:hidden">
        <div className="relative overflow-hidden rounded-[2rem]">
          <img
            src={image ?? IMAGES.campus}
            alt={imageAlt ?? title}
            width={1600}
            height={900}
            className="h-72 w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/85 to-transparent" />
          <div className="absolute inset-x-5 bottom-5">
            <h1 className="font-display text-4xl font-semibold text-white">
              {title}
            </h1>
          </div>
        </div>
        {subtitle && (
          <p className="mt-6 text-center text-muted-foreground">{subtitle}</p>
        )}
      </div>
    </section>
  );
}

export function Prose({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl space-y-5 px-6 leading-relaxed text-muted-foreground">
      {children}
    </div>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { StoreBanner } from "@/lib/data";
import { cn } from "@/lib/utils";

const AUTOPLAY_MS = 6000;

export function HeroCarousel({ banners }: { banners: StoreBanner[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const goTo = useCallback(
    (index: number) => {
      const track = trackRef.current;
      if (!track) return;
      const next = (index + banners.length) % banners.length;
      track.scrollTo({ left: next * track.clientWidth, behavior: "smooth" });
    },
    [banners.length],
  );

  useEffect(() => {
    if (paused || banners.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => goTo(active + 1), AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [active, paused, banners.length, goTo]);

  if (banners.length === 0) return null;

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Promo dan koleksi"
      className="relative bg-ink"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div
        ref={trackRef}
        onScroll={(event) => {
          const track = event.currentTarget;
          setActive(Math.round(track.scrollLeft / track.clientWidth));
        }}
        className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto"
      >
        {banners.map((banner, index) => {
          const image = (
            <Image
              src={banner.imageUrl}
              alt={banner.title}
              fill
              priority={index === 0}
              sizes="100vw"
              className="object-cover"
            />
          );
          return (
            <div
              key={banner.id}
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} dari ${banners.length}`}
              className="relative aspect-[2/1] max-h-[78vh] w-full shrink-0 snap-center"
            >
              {banner.linkUrl ? (
                <Link href={banner.linkUrl} className="absolute inset-0">
                  {image}
                </Link>
              ) : (
                image
              )}
            </div>
          );
        })}
      </div>

      {banners.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Banner sebelumnya"
            onClick={() => goTo(active - 1)}
            className="absolute left-3 top-1/2 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full bg-paper/90 text-ink hover:bg-paper sm:flex"
          >
            <ChevronLeft aria-hidden className="size-5" />
          </button>
          <button
            type="button"
            aria-label="Banner berikutnya"
            onClick={() => goTo(active + 1)}
            className="absolute right-3 top-1/2 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full bg-paper/90 text-ink hover:bg-paper sm:flex"
          >
            <ChevronRight aria-hidden className="size-5" />
          </button>
          <div className="absolute inset-x-0 bottom-2 flex justify-center sm:bottom-4">
            {banners.map((banner, index) => (
              <button
                key={banner.id}
                type="button"
                aria-label={`Tampilkan banner ${index + 1}`}
                aria-current={index === active}
                onClick={() => goTo(index)}
                className="flex h-6 w-8 items-center justify-center"
              >
                <span
                  className={cn(
                    "h-1 w-6 rounded-full transition-colors",
                    index === active ? "bg-white" : "bg-white/40",
                  )}
                />
              </button>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

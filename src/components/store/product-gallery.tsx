"use client";

import Image from "next/image";
import { useState } from "react";
import { Play } from "lucide-react";
import { cn } from "@/lib/utils";

type GalleryProps = {
  name: string;
  images: { url: string; alt: string | null }[];
  videoUrl: string | null;
};

export function ProductGallery({ name, images, videoUrl }: GalleryProps) {
  const [active, setActive] = useState(0);
  const videoIndex = videoUrl ? images.length : -1;
  const total = images.length + (videoUrl ? 1 : 0);
  const current = images[active];

  return (
    <div className="flex min-w-0 flex-col gap-3 lg:flex-row-reverse lg:items-start">
      <div className="relative aspect-square w-full min-w-0 overflow-hidden bg-sand lg:flex-1">
        {active === videoIndex && videoUrl ? (
          <video
            key={videoUrl}
            src={videoUrl}
            poster={images[0]?.url}
            controls
            playsInline
            preload="metadata"
            className="size-full bg-ink object-contain"
          />
        ) : current ? (
          <Image
            key={current.url}
            src={current.url}
            alt={current.alt ?? name}
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        ) : null}
      </div>

      {total > 1 && (
        <ul className="no-scrollbar flex shrink-0 gap-2 overflow-x-auto lg:w-20 lg:flex-col lg:overflow-y-auto">
          {images.map((image, index) => (
            <li key={image.url} className="shrink-0">
              <button
                type="button"
                aria-label={`Lihat foto ${index + 1}`}
                aria-current={index === active}
                onClick={() => setActive(index)}
                className={cn(
                  "relative block size-16 overflow-hidden border-2 bg-sand lg:size-20",
                  index === active ? "border-ink" : "border-transparent hover:border-line",
                )}
              >
                <Image src={image.url} alt="" fill sizes="80px" className="object-cover" />
              </button>
            </li>
          ))}
          {videoUrl && (
            <li className="shrink-0">
              <button
                type="button"
                aria-label="Putar video produk"
                aria-current={active === videoIndex}
                onClick={() => setActive(videoIndex)}
                className={cn(
                  "relative flex size-16 items-center justify-center overflow-hidden border-2 bg-ink text-paper lg:size-20",
                  active === videoIndex ? "border-fuji" : "border-transparent hover:border-line",
                )}
              >
                {images[0] && <Image src={images[0].url} alt="" fill sizes="80px" className="object-cover opacity-50" />}
                <Play aria-hidden className="relative size-6 fill-current" />
              </button>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

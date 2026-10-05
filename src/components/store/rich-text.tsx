import { Fragment } from "react";
import { cn } from "@/lib/utils";

type Block =
  | { type: "heading"; text: string }
  | { type: "list"; items: string[] }
  | { type: "paragraph"; text: string };

function parse(content: string): Block[] {
  const blocks: Block[] = [];
  for (const raw of content.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    if (line.startsWith("## ")) {
      blocks.push({ type: "heading", text: line.slice(3) });
    } else if (line.startsWith("- ")) {
      const last = blocks.at(-1);
      if (last?.type === "list") last.items.push(line.slice(2));
      else blocks.push({ type: "list", items: [line.slice(2)] });
    } else {
      blocks.push({ type: "paragraph", text: line });
    }
  }
  return blocks;
}

/** Ubah **teks** menjadi tebal. Sisanya dirender sebagai teks biasa (aman dari HTML). */
function inline(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={index} className="font-semibold text-ink">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <Fragment key={index}>{part}</Fragment>
    ),
  );
}

/**
 * Format ringan untuk konten dari admin:
 * `## Judul`, `- butir daftar`, `**tebal**`, dan paragraf per baris.
 */
export function RichText({ content, className }: { content: string; className?: string }) {
  return (
    <div className={cn("space-y-4 text-[15px] leading-relaxed text-ink/80", className)}>
      {parse(content).map((block, index) => {
        if (block.type === "heading") {
          return (
            <h2 key={index} className="pt-3 font-display text-2xl tracking-wide text-ink">
              {block.text}
            </h2>
          );
        }
        if (block.type === "list") {
          return (
            <ul key={index} className="list-disc space-y-1.5 pl-5 marker:text-fuji">
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>{inline(item)}</li>
              ))}
            </ul>
          );
        }
        return <p key={index}>{inline(block.text)}</p>;
      })}
    </div>
  );
}

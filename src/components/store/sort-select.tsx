"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function SortSelect({ value, options }: { value: string; options: Record<string, string> }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <div>
      <label htmlFor="sort" className="sr-only">
        Urutkan
      </label>
      <select
        id="sort"
        value={value}
        onChange={(event) => {
          const params = new URLSearchParams(searchParams.toString());
          if (event.target.value === "terbaru") params.delete("urut");
          else params.set("urut", event.target.value);
          params.delete("halaman");
          const query = params.toString();
          router.push(query ? `${pathname}?${query}` : pathname);
        }}
        className="input sm:w-48"
      >
        {Object.entries(options).map(([key, label]) => (
          <option key={key} value={key}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
}

import { useState } from "react";
import { Search } from "lucide-react";

export function TopBar() {
  const [query, setQuery] = useState("");

  return (
    <header className="flex h-[72px] shrink-0 items-center justify-between px-8">
      <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-black/35">
        Playlist
        <span className="ml-1 text-base leading-none tracking-normal">···</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex items-center">
          <input
            type="text"
            placeholder="Search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="w-[180px] rounded-full border-none bg-white/40 py-1.5 pr-9 pl-4 text-sm text-black placeholder:text-black/30 transition-[background-color] duration-200 focus:bg-white/60 focus:outline-none"
          />
          <Search
            size={13}
            className="pointer-events-none absolute right-3 text-black/30"
          />
        </div>

        <div className="flex h-8 w-8 cursor-default items-center justify-center rounded-full bg-white/60 text-xs font-bold text-black/50 shadow-sm">
          N
        </div>
      </div>
    </header>
  );
}

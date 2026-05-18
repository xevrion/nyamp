import { useState } from 'react'
import { Search } from 'lucide-react'

export function TopBar() {
  const [query, setQuery] = useState('')

  return (
    <header className="h-[72px] shrink-0 flex items-center justify-between px-8">
      <div className="flex items-center gap-1 text-[10px] font-bold text-black/35 uppercase tracking-widest">
        Playlist
        <span className="text-base leading-none ml-1 tracking-normal">···</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex items-center">
          <input
            type="text"
            placeholder="Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-4 pr-9 py-1.5 text-sm rounded-full bg-white/40 text-black placeholder:text-black/30 focus:outline-none focus:bg-white/60 w-[180px] transition-[background-color] duration-200 border-none"
          />
          <Search size={13} className="absolute right-3 text-black/30 pointer-events-none" />
        </div>

        <div className="w-8 h-8 rounded-full bg-white/60 shadow-sm flex items-center justify-center text-xs font-bold text-black/50 cursor-default">
          N
        </div>
      </div>
    </header>
  )
}

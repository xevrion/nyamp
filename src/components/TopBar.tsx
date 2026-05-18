import { useState } from 'react'
import { Search } from 'lucide-react'

export function TopBar() {
  const [query, setQuery] = useState('')

  return (
    <header className="h-[56px] shrink-0 flex items-center justify-end px-6 gap-4 bg-[#f5f5f5]">
      <div className="relative flex items-center">
        <Search size={13} className="absolute left-3 text-black/30 pointer-events-none" />
        <input
          type="text"
          placeholder="Search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="
            pl-8 pr-4 py-1.5 text-sm rounded-full
            bg-black/6 text-black placeholder:text-black/30
            focus:outline-none focus:bg-black/9
            w-[190px] focus:w-[250px] transition-[width,background-color] duration-200
          "
        />
      </div>

      <div className="w-8 h-8 rounded-full bg-black/10 shrink-0 cursor-default" />
    </header>
  )
}

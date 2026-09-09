import { Plus, Search, X } from 'lucide-react';

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onNewEntry: () => void;
  entryCount: number;
}

export const Navbar = ({
  searchQuery,
  onSearchChange,
  onNewEntry,
  entryCount,
}: NavbarProps) => {
  return (
    <header className="sticky top-0 z-30 backdrop-blur-xl bg-[#060a14]/85 border-b border-blue-950/60 transition-all">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Brand & Subtitle */}
        <div className="flex items-baseline gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400 shadow-[0_0_10px_#38bdf8]"></span>
            <span
              className="text-2xl font-serif tracking-tight text-white font-medium hover:text-sky-300 transition-colors cursor-pointer"
              onClick={() => onSearchChange('')}
            >
              logs.
            </span>
          </div>
          <span className="hidden sm:inline-block text-xs font-medium tracking-wider uppercase text-sky-400/60 border-l border-blue-900/40 pl-3">
            personal journal
          </span>
          <span className="text-xs text-slate-500 font-mono hidden md:inline-block">
            {entryCount} {entryCount === 1 ? 'entry' : 'entries'}
          </span>
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-3">
          {/* Search Box */}
          <div className="relative group">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-sky-400 transition-colors" />
            <input
              type="text"
              placeholder="Search entries..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-36 sm:w-56 md:w-64 pl-9 pr-8 py-1.5 text-xs sm:text-sm bg-blue-950/25 hover:bg-blue-950/40 focus:bg-blue-950/60 text-slate-200 placeholder-slate-500 rounded-full border border-blue-900/40 focus:border-sky-500/50 focus:outline-none focus:ring-1 focus:ring-sky-500/30 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* New Entry Button */}
          <button
            onClick={onNewEntry}
            className="flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.25)] hover:shadow-[0_0_20px_rgba(56,189,248,0.35)] transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>New Entry</span>
          </button>
        </div>
      </div>
    </header>
  );
};

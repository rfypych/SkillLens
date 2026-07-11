'use client';

import { BellIcon, MagnifyingGlassIcon } from '@radix-ui/react-icons';

export default function Header() {
  return (
    <header className="h-16 border-b border-border bg-card sticky top-0 z-10 px-6 flex items-center justify-between flex-shrink-0">
      {/* Search */}
      <div className="flex-1 max-w-sm relative group">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
        <input
          id="global-search"
          type="text"
          className="ink-input pl-9 pr-10 py-2 text-sm"
          placeholder="Search roles, candidates…"
          style={{ border: '1px solid var(--border)' }}
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <kbd
            className="hidden sm:inline-block text-[10px] font-mono font-semibold text-muted-foreground border border-border rounded px-1 py-0.5"
            style={{ background: 'var(--muted)' }}
          >
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right cluster */}
      <div className="flex items-center gap-4 ml-4">
        {/* Notification bell */}
        <button
          id="notification-bell"
          className="relative p-2 rounded hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
          aria-label="Notifications"
        >
          <BellIcon className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-accent" />
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-border" />

        {/* User profile */}
        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="text-right hidden md:block">
            <p className="text-sm font-semibold text-foreground leading-tight">
              Sarah Jenkins
            </p>
            <p
              className="text-[10px] text-muted-foreground uppercase tracking-widest"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              Head of TA
            </p>
          </div>
          <div
            className="w-8 h-8 rounded overflow-hidden border-2 border-border group-hover:border-accent transition-colors flex-shrink-0"
            style={{ background: 'var(--muted)' }}
          >
            <img
              src="https://api.dicebear.com/7.x/notionists/svg?seed=Sarah&backgroundColor=transparent"
              alt="Sarah Jenkins"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </header>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  DashboardIcon,
  PersonIcon,
  ArchiveIcon,
  GearIcon,
  ExitIcon,
  PlusIcon,
  HamburgerMenuIcon,
} from '@radix-ui/react-icons';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const navigation = [
  { name: 'Overview', href: '/recruiter', icon: DashboardIcon },
  { name: 'Roles', href: '/recruiter/jobs', icon: ArchiveIcon },
  { name: 'Candidates', href: '/recruiter/candidates', icon: PersonIcon },
  { name: 'Settings', href: '/recruiter/settings', icon: GearIcon },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.aside
      animate={{ width: expanded ? 220 : 60 }}
      transition={{ type: 'spring', stiffness: 400, damping: 40 }}
      className="relative flex flex-col h-screen bg-primary text-primary-foreground sticky top-0 z-30 flex-shrink-0"
      style={{ minWidth: expanded ? 220 : 60, overflow: 'hidden' }}
    >
      {/* ── Top: hamburger + logotype ─────────────────────── */}
      <div className="flex items-center h-16 border-b border-white/10 px-3 flex-shrink-0 gap-3">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-9 h-9 flex items-center justify-center rounded hover:bg-white/10 transition-colors flex-shrink-0"
          aria-label="Toggle sidebar"
        >
          <HamburgerMenuIcon className="w-4 h-4 text-primary-foreground/60" />
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
              className="flex items-baseline gap-0.5 whitespace-nowrap overflow-hidden"
            >
              <span className="text-[16px] font-bold text-white tracking-tight">
                Skill
              </span>
              <span className="text-[16px] font-bold text-white/50 tracking-tight">
                Lens
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── New Role CTA ────────────────────────────────────── */}
      <div className="px-3 py-3 border-b border-white/10 flex-shrink-0">
        <Link href="/recruiter/jobs/new">
          {expanded ? (
            <motion.div
              layout
              className="flex items-center gap-2 w-full cursor-pointer rounded px-3 py-2.5 bg-accent text-accent-foreground font-bold text-[11px] uppercase tracking-widest hover:opacity-90 transition-opacity whitespace-nowrap"
            >
              <PlusIcon className="w-3.5 h-3.5 flex-shrink-0" />
              Post a Role
            </motion.div>
          ) : (
            <motion.div
              layout
              className="flex items-center justify-center w-9 h-9 cursor-pointer rounded bg-accent text-accent-foreground hover:opacity-90 transition-opacity mx-auto"
              title="Post a Role"
            >
              <PlusIcon className="w-4 h-4" />
            </motion.div>
          )}
        </Link>
      </div>

      {/* ── Navigation ──────────────────────────────────────── */}
      <nav className="flex-1 px-2 py-3 space-y-0.5">
        {expanded && (
          <div className="px-2 pb-2 pt-1">
            <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/25 whitespace-nowrap">
              Workspace
            </span>
          </div>
        )}

        {navigation.map((item) => {
          const isActive =
            pathname === item.href ||
            (pathname?.startsWith(`${item.href}/`) && item.href !== '/');

          return (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                'group flex items-center rounded transition-all duration-150 relative',
                expanded ? 'gap-3 px-3 py-2.5' : 'justify-center w-9 h-9 mx-auto',
                isActive
                  ? 'bg-white/10 text-primary-foreground font-semibold'
                  : 'text-primary-foreground/50 hover:bg-white/5 hover:text-primary-foreground/80'
              )}
              title={!expanded ? item.name : undefined}
            >
              {/* Active indicator — right edge pill */}
              {isActive && !expanded && (
                <motion.div
                  layoutId="active-indicator"
                  className="absolute -right-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-accent rounded-l-full"
                />
              )}

              <item.icon
                className={clsx(
                  'flex-shrink-0 transition-colors',
                  expanded ? 'w-4 h-4' : 'w-[18px] h-[18px]',
                  isActive ? 'text-accent' : 'text-primary-foreground/40 group-hover:text-primary-foreground/70'
                )}
              />

              {expanded && (
                <span className="text-[13px] truncate whitespace-nowrap">{item.name}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Footer: logout ──────────────────────────────────── */}
      <div className="px-2 py-3 border-t border-white/10 flex-shrink-0">
        <button
          onClick={() => {
            localStorage.removeItem('token');
            router.push('/login');
          }}
          className={clsx(
            'group flex items-center rounded transition-colors duration-150 text-primary-foreground/40 hover:bg-red-900/20 hover:text-red-400',
            expanded ? 'gap-3 px-3 py-2.5 w-full' : 'justify-center w-9 h-9 mx-auto'
          )}
          title={!expanded ? 'Log out' : undefined}
        >
          <ExitIcon className="w-4 h-4 flex-shrink-0" />
          {expanded && (
            <span className="text-[13px] whitespace-nowrap">Log out</span>
          )}
        </button>
      </div>
    </motion.aside>
  );
}

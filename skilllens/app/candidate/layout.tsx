'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'motion/react';
import { 
  LayoutDashboard, 
  Code,
  Settings, 
  LogOut,
  Bell,
  Aperture
} from 'lucide-react';

const sidebarLinks = [
  { name: 'Dashboard', href: '/candidate/dashboard', icon: LayoutDashboard },
];

export default function CandidateLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // If we are in the actual test environment, we shouldn't show this layout
  if (pathname.includes('/candidate/test/')) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#F7F9F9] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-brand-white border-r border-brand-gray-light/30 flex flex-col fixed inset-y-0 left-0 z-50">
        <div className="p-6">
          <Link href="/candidate/dashboard" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
            <div className="w-8 h-8 rounded-lg bg-brand-secondary flex items-center justify-center text-brand-accent shadow-sm">
              <Aperture className="w-5 h-5" />
            </div>
            <span className="text-xl font-display font-bold text-brand-secondary tracking-tight">SkillLens</span>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-6 flex flex-col gap-2">
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/candidate/dashboard' && pathname.startsWith(link.href));
            const Icon = link.icon;
            
            return (
              <Link 
                key={link.name} 
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                  isActive 
                    ? 'bg-brand-primary/10 text-brand-primary font-semibold' 
                    : 'text-brand-gray-dark hover:bg-brand-gray-light/10 hover:text-brand-secondary font-medium'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm">{link.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-brand-gray-light/30">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-brand-gray-light/20 text-brand-gray-dark transition-colors cursor-pointer mb-2">
            <Settings className="w-5 h-5" />
            <span className="font-medium text-sm">Settings</span>
          </div>
          <Link href="/login" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 text-red-600 transition-colors cursor-pointer">
            <LogOut className="w-5 h-5" />
            <span className="font-medium text-sm">Log out</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="h-20 bg-brand-white/90 backdrop-blur-md border-b border-brand-gray-light/30 flex items-center justify-end px-8 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button className="p-2 text-brand-gray-dark hover:bg-brand-gray-light/20 rounded-full transition-colors relative">
              <Bell className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-bold text-brand-secondary">Alex Developer</p>
                <p className="text-xs text-brand-gray-dark">Candidate</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-brand-gray-light/30 flex items-center justify-center text-brand-secondary font-bold">
                AD
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8 flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}

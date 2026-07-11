'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Settings, 
  LogOut, 
  Bell, 
  Aperture,
  Menu,
  X
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import clsx from 'clsx';

const sidebarLinks = [
  { name: 'Dashboard', href: '/candidate/dashboard', icon: LayoutDashboard },
];

export default function CandidateLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [userName, setUserName] = useState('Candidate');
  const [userInitials, setUserInitials] = useState('CA');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    api.get('/auth/me').then((data: any) => {
      if (data?.role !== 'candidate') {
        router.push('/login');
        return;
      }
      if (data?.full_name) {
        setUserName(data.full_name);
        const parts = data.full_name.split(' ');
        setUserInitials(parts.map((p: string) => p[0]).join('').toUpperCase().slice(0, 2));
      }
    }).catch(() => {
      router.push('/login');
    });
  }, [router]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      console.error('Logout error', e);
    } finally {
      router.push('/login');
    }
  };

  // Hide sidebar/header for test environment
  if (pathname.includes('/candidate/test/')) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#F7F9F9] flex overflow-hidden">
      
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-brand-dark/50 z-40 md:hidden backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={clsx(
        "w-64 bg-brand-white border-r border-brand-gray-light/30 flex flex-col fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out md:translate-x-0",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 flex items-center justify-between">
          <Link href="/candidate/dashboard" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
            <img src="/logo.svg" alt="SkillLens Logo" className="h-8 w-auto" />
            <span className="text-xl font-display font-bold text-brand-secondary tracking-tight">SkillLens</span>
          </Link>
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden p-2 text-brand-gray-dark hover:bg-brand-gray-light/20 rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 flex flex-col gap-2 overflow-y-auto">
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/candidate/dashboard' && pathname.startsWith(link.href));
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={clsx(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                  isActive
                    ? "bg-brand-primary/10 text-brand-primary font-semibold"
                    : "text-brand-gray-dark hover:bg-brand-gray-light/10 hover:text-brand-secondary font-medium"
                )}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">{link.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-brand-gray-light/30 flex-shrink-0">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-brand-gray-light/20 text-brand-gray-dark transition-colors cursor-pointer mb-2">
            <Settings className="w-5 h-5" />
            <span className="font-medium text-sm">Settings</span>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 text-red-600 transition-colors cursor-pointer">
            <LogOut className="w-5 h-5" />
            <span className="font-medium text-sm">Log out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 flex flex-col min-h-screen w-full">
        {/* Top Header */}
        <header className="h-16 md:h-20 bg-brand-white/90 backdrop-blur-md border-b border-brand-gray-light/30 flex items-center justify-between px-4 md:px-8 sticky top-0 z-30">
          <div className="flex items-center">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 text-brand-gray-dark hover:bg-brand-gray-light/20 rounded-xl mr-2"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
          <div className="flex items-center gap-3 md:gap-4">
            <button className="p-2 text-brand-gray-dark hover:bg-brand-gray-light/20 rounded-full transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 cursor-pointer">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-brand-secondary">{userName}</p>
                <p className="text-xs text-brand-gray-dark">Candidate</p>
              </div>
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-brand-gray-light/30 flex items-center justify-center text-brand-secondary font-bold text-sm md:text-base border border-brand-gray-light/50">
                {userInitials}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 sm:p-6 md:p-8 flex-1 overflow-x-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, History, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/home', label: 'Home', icon: Home },
  { href: '/home/history', label: 'Ritten', icon: History },
  { href: '/home/settings', label: 'Instellingen', icon: Settings },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-1/2 w-full max-w-md -translate-x-1/2 border-t bg-background/95 backdrop-blur-sm sm:bottom-4 sm:rounded-lg">
      <div className="flex h-16 items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 p-2 text-sm font-medium transition-colors',
                isActive
                  ? 'text-accent-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <item.icon
                className="h-6 w-6"
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className="text-xs">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Crown, 
  LayoutDashboard, 
  Sparkles, 
  Users, 
  Network, 
  ShieldAlert, 
  BookOpen, 
  RefreshCw,
  Sliders
} from 'lucide-react';

const navItems = [
  { href: '/admin', label: '대시보드 & 동기화', icon: LayoutDashboard },
  { href: '/admin/studio', label: '창작자 스튜디오', icon: Sparkles },
  { href: '/admin/characters', label: '인물 정밀 명세서', icon: Users },
  { href: '/admin/relationships', label: '인물 관계도 맵', icon: Network },
  { href: '/admin/forensic', label: '포렌식 유출 역추적', icon: ShieldAlert },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-[#0E0E12] border-r border-[#222228] flex flex-col h-screen fixed left-0 top-0 z-30 select-none">
      {/* Brand Header */}
      <div className="h-16 px-6 flex items-center gap-3 border-b border-[#222228]">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#D4AF37] to-[#8C6D1F] flex items-center justify-center text-[#0A0A0C] font-black shadow-lg shadow-[#D4AF37]/20">
          <Crown className="w-5 h-5 fill-current" />
        </div>
        <div>
          <h1 className="font-bold text-sm tracking-widest text-[#F3F3F5] uppercase">
            CROWN GRID
          </h1>
          <p className="text-[10px] text-[#D4AF37] tracking-wider uppercase font-medium">
            Creator Studio
          </p>
        </div>
      </div>

      {/* Universe Switcher Mini */}
      <div className="px-4 py-3 border-b border-[#1A1A20] bg-[#0A0A0C]/50">
        <label className="text-[10px] text-[#71717A] uppercase font-bold tracking-wider block mb-1">
          Active Universe
        </label>
        <div className="flex items-center justify-between px-3 py-1.5 rounded bg-[#17171C] border border-[#2A2A32] text-xs text-[#E4E4E7]">
          <span className="truncate font-medium">👑 성황 유니버스</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#D4AF37]/20 text-[#D4AF37] font-semibold">
            Canon
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="px-3 text-[10px] uppercase font-bold text-[#71717A] tracking-wider mb-2">
          Studio Modules
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 shadow-sm'
                  : 'text-[#A1A1AA] hover:text-[#F4F4F5] hover:bg-[#1A1A22]'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#D4AF37]' : 'text-[#71717A]'}`} />
              {item.label}
            </Link>
          );
        })}

        <div className="pt-4 mt-4 border-t border-[#1C1C24]">
          <p className="px-3 text-[10px] uppercase font-bold text-[#71717A] tracking-wider mb-2">
            Reader Simulator
          </p>
          <Link
            href="/read/s-midnight-01/1"
            target="_blank"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium text-[#A1A1AA] hover:text-[#D4AF37] hover:bg-[#1A1A22] transition-colors"
          >
            <BookOpen className="w-4 h-4 text-[#D4AF37]" />
            보안 뷰어 열람 (새 창)
          </Link>
        </div>
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-[#222228] bg-[#0A0A0C]/40 text-[11px] text-[#71717A]">
        <div className="flex items-center justify-between mb-1">
          <span>Security Engine</span>
          <span className="text-emerald-400 font-semibold">ST-ZeroWidth</span>
        </div>
        <div className="flex items-center justify-between">
          <span>AI Engine</span>
          <span className="text-[#D4AF37] font-semibold">Gemini 1.5 (Pro/Flash)</span>
        </div>
      </div>
    </aside>
  );
}

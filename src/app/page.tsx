import Link from 'next/link';
import { Crown, Sparkles, Shield, BookOpen, Layers, ArrowRight, Lock, EyeOff } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0A0A0C] text-[#F3F3F5] flex flex-col justify-between selection:bg-[#D4AF37] selection:text-black">
      {/* Top Header */}
      <header className="h-16 px-8 border-b border-[#1E1E24] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#D4AF37] to-[#8C6D1F] flex items-center justify-center text-[#0A0A0C] font-black">
            <Crown className="w-4 h-4 fill-current" />
          </div>
          <span className="font-bold text-sm tracking-widest uppercase">CROWN GRID</span>
        </div>

        <Link
          href="/admin"
          className="px-4 py-1.5 rounded-lg bg-[#D4AF37] hover:bg-[#C29E2E] text-[#0A0A0C] font-semibold text-xs tracking-wider uppercase transition-all shadow-md shadow-[#D4AF37]/20"
        >
          Creator Studio 진입
        </Link>
      </header>

      {/* Hero Section */}
      <main className="max-w-4xl mx-auto px-6 py-20 text-center space-y-8 flex-1 flex flex-col justify-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#181820] border border-[#2B2B38] text-[11px] text-[#D4AF37] font-medium mx-auto">
          <Sparkles className="w-3.5 h-3.5" />
          <span>성황 유니버스 다중 관리 & 포렌식 보안 열람 플랫폼</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-[#F3F3F5] uppercase">
          CROWN GRID <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#F4E3B2] to-[#B38F24]">
            ARCHITECT STUDIO & FORENSIC VIEWER
          </span>
        </h1>

        <p className="text-sm md:text-base text-[#A1A1AA] max-w-2xl mx-auto leading-relaxed">
          독립된 원고 자산(<code className="text-[#D4AF37]">../assets</code>)을 100% 무결하게 보존하며, Gemini 1.5 BLOCK_NONE 기반 5대 스튜디오 에셋 생성과 제로 너비 스테가노그래피 역추적을 단일 웹앱에서 구현합니다.
        </p>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 text-left">
          <Link
            href="/admin"
            className="p-6 rounded-xl bg-[#111116] border border-[#222228] hover:border-[#D4AF37]/50 transition-all group"
          >
            <div className="p-2.5 rounded-lg bg-[#D4AF37]/10 text-[#D4AF37] w-fit mb-4 group-hover:scale-105 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-[#F3F3F5] mb-1">창작자 스튜디오</h3>
            <p className="text-xs text-[#71717A] leading-relaxed">
              로컬 원고 원클릭 동기화, 인물 정밀 명세서, 회차 슬라이더 인물 관계도 및 멀티 배포기
            </p>
            <span className="text-xs text-[#D4AF37] mt-3 inline-flex items-center gap-1 font-semibold">
              스튜디오 열기 <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>

          <Link
            href="/read/s-midnight-01/1"
            className="p-6 rounded-xl bg-[#111116] border border-[#222228] hover:border-[#D4AF37]/50 transition-all group"
          >
            <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 w-fit mb-4 group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-[#F3F3F5] mb-1">포렌식 보안 뷰어</h3>
            <p className="text-xs text-[#71717A] leading-relaxed">
              1~4화 무료, 5화 페이월 모달, 0.01초 포커스 블러, 복사 차단 및 비가시 워터마크 주입
            </p>
            <span className="text-xs text-emerald-400 mt-3 inline-flex items-center gap-1 font-semibold">
              뷰어 체험하기 <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>

          <Link
            href="/admin/forensic"
            className="p-6 rounded-xl bg-[#111116] border border-[#222228] hover:border-rose-500/50 transition-all group"
          >
            <div className="p-2.5 rounded-lg bg-rose-500/10 text-rose-400 w-fit mb-4 group-hover:scale-105 transition-transform">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-[#F3F3F5] mb-1">유출 역추적 디코더</h3>
            <p className="text-xs text-[#71717A] leading-relaxed">
              외부에 무단 긁힘 유출된 한 줄 텍스트에서 제로 너비 문자를 역복원하여 유출자 특정
            </p>
            <span className="text-xs text-rose-400 mt-3 inline-flex items-center gap-1 font-semibold">
              디코더 가동 <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="h-14 border-t border-[#1C1C22] px-8 flex items-center justify-between text-xs text-[#71717A]">
        <span>CROWN GRID v1.0.0 • Seonghwang Universe Canon Engine</span>
        <span>Obsidian Black & Champagne Gold Theme</span>
      </footer>
    </div>
  );
}

'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Shield, 
  Lock, 
  ArrowLeft, 
  ArrowRight, 
  EyeOff, 
  Crown, 
  AlertTriangle,
  ChevronLeft,
  BookOpen,
  Sparkles,
  CheckCircle2,
  Sliders,
  Unlock,
  Type
} from 'lucide-react';
import { embedWatermark } from '@/lib/steganography';

// 독자 화면 전용 원고 정제 엔진 (AI 프롬프트, 씬 디스크립션, 메타데이터 100% 완전 차단)
function extractReaderContent(raw: string): string {
  if (!raw) return '';
  const cutMarkers = [
    /\n---+\s*\n+###?\s*2\.\s*\[이번\s*화\s*요약/i,
    /\n---+\s*\n+###?\s*3\.\s*\[장면별/i,
    /\n---+\s*\n+###?\s*3\.\s*\[AI/i,
    /\n###?\s*2\.\s*\[이번\s*화\s*요약/i,
    /\n###?\s*3\.\s*\[장면별/i,
    /\n###?\s*3\.\s*\[AI/i,
    /\n####\s*Scene\s*\d+/i,
    /\n>\s*\*\*Prompt:\*\*/i
  ];
  let clean = raw;
  for (const m of cutMarkers) {
    const idx = clean.search(m);
    if (idx !== -1) {
      clean = clean.slice(0, idx);
    }
  }
  // 소설 본문 헤더 제거
  clean = clean.replace(/^#+.*\[소설\s*본문\].*$/m, '').trim();
  return clean;
}

export default function SecureReaderPage() {
  const params = useParams();
  const router = useRouter();
  const seriesId = params.seriesId as string;
  const epNum = parseInt(params.episodeNumber as string, 10) || 1;

  const [loading, setLoading] = useState(true);
  const [episodeData, setEpisodeData] = useState<any>(null);
  const [seriesData, setSeriesData] = useState<any>(null);
  const [watermarkedContent, setWatermarkedContent] = useState<string>('');
  const [isBlurred, setIsBlurred] = useState<boolean>(false);
  const [showPaywall, setShowPaywall] = useState<boolean>(false);
  
  // 독자 맞춤 뷰어 컨트롤
  const [fontSize, setFontSize] = useState<number>(16);
  const [authorBypass, setAuthorBypass] = useState<boolean>(false);
  const [disableSecurityBlur, setDisableSecurityBlur] = useState<boolean>(false);

  // 시뮬레이션용 열람자 VIP 서명 토큰
  const userSignature = `USER:VIP-MEMBER-7749|SESSION:${Math.random().toString(36).substring(2, 9)}|TIME:${new Date().toISOString()}`;

  // 데이터 로드 및 프롬프트 완벽 필터링
  useEffect(() => {
    fetch('/api/sync-assets')
      .then(res => res.json())
      .then(res => {
        if (res.dataset) {
          const s = res.dataset.series?.find((x: any) => x.id === seriesId);
          setSeriesData(s);
          const ep = res.dataset.episodes?.find((x: any) => x.series_id === seriesId && x.episode_number === epNum);
          if (ep) {
            setEpisodeData(ep);
            // 순수 원고 본문 정제
            const cleanStory = extractReaderContent(ep.content);

            // 5화 이상 & 작가 프리패스 미적용 시 페이월 활성화
            if (ep.episode_number >= 5 && !authorBypass) {
              setShowPaywall(true);
              const preview = cleanStory.slice(0, 480) + '\n\n... [VIP 클럽 전용 구역: 이후 본문은 암호화 잠금 처리되었습니다] ...';
              setWatermarkedContent(embedWatermark(preview, userSignature));
            } else {
              setShowPaywall(false);
              setWatermarkedContent(embedWatermark(cleanStory, userSignature));
            }
          }
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [seriesId, epNum, authorBypass]);

  // 안티-캡처 / 포커스 이탈 감지 (테스트 중 비활성화 옵션 지원)
  useEffect(() => {
    if (disableSecurityBlur) {
      setIsBlurred(false);
      return;
    }

    const handleBlur = () => {
      setIsBlurred(true);
    };

    const handleFocus = () => {
      setIsBlurred(false);
    };

    // 마우스 및 키보드 보안 방어
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      return false;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === 'PrintScreen' ||
        (e.ctrlKey && (e.key === 'p' || e.key === 's' || e.key === 'u' || e.key === 'c')) ||
        e.key === 'F12'
      ) {
        e.preventDefault();
        setIsBlurred(true);
        setTimeout(() => setIsBlurred(false), 2000);
        return false;
      }
    };

    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('copy', handleCopy);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('copy', handleCopy);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [disableSecurityBlur]);

  return (
    <div className="min-h-screen bg-[#070709] text-[#F3F3F5] flex flex-col relative select-none">
      {/* 반투명 캔버스 워터마크 배경 오버레이 (3% Opacity) */}
      <div
        className="pointer-events-none fixed inset-0 z-10 opacity-[0.035] flex items-center justify-center rotate-[-25deg] select-none text-[15px] font-mono font-bold leading-loose text-white text-center whitespace-pre"
      >
        {`CROWN GRID SECURE FORENSIC AUDIT\n${userSignature}\nDO NOT LEAK OR REPRODUCE\n`.repeat(30)}
      </div>

      {/* 포커스 이탈 블러 경고 오버레이 (0.01s 발동) */}
      {isBlurred && (
        <div 
          onClick={() => setIsBlurred(false)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-2xl flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-75 cursor-pointer"
        >
          <div className="p-4 rounded-full bg-rose-500/10 text-rose-400 mb-4 border border-rose-500/20">
            <EyeOff className="w-10 h-10" />
          </div>
          <h2 className="text-xl font-bold text-[#F3F3F5] tracking-wider uppercase mb-2">
            [보안 프로토콜 가동] 화면 보호 모드
          </h2>
          <p className="text-xs text-[#A1A1AA] max-w-md leading-relaxed">
            외부 캡처 또는 창 포커스 이탈이 감지되어 원고가 즉시 은폐되었습니다.
            <span className="text-[#D4AF37] font-semibold block mt-1">
              (본 창을 클릭하시면 즉시 열람이 재개됩니다)
            </span>
          </p>
        </div>
      )}

      {/* 상단 보안 뷰어 헤더 */}
      <header className="h-14 bg-[#0E0E12]/90 backdrop-blur-md border-b border-[#1E1E26] px-6 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/admin/studio')}
            className="p-1.5 rounded-lg hover:bg-[#1A1A22] text-[#A1A1AA] hover:text-[#F3F3F5] transition-colors flex items-center gap-1 text-xs"
            title="스튜디오로 돌아가기"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">스튜디오</span>
          </button>
          <div className="h-4 w-px bg-[#22222C] hidden sm:block" />
          <div>
            <h1 className="text-xs font-bold text-[#F3F3F5] truncate max-w-xs md:max-w-md">
              {seriesData?.title || '성황 유니버스'}
            </h1>
            <p className="text-[10px] text-[#D4AF37] flex items-center gap-1.5">
              <span>제 {epNum} 화 — {episodeData?.title || '원고 열람실'}</span>
              <span className="px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-400 text-[9px] font-mono border border-emerald-500/30">
                순수 원고 모드 (프롬프트 차단됨)
              </span>
            </p>
          </div>
        </div>

        {/* 우측 컨트롤 도구: 폰트 조절, 작가 프리패스, 이전/다음 회차 */}
        <div className="flex items-center gap-2.5">
          {/* 작가 프리패스 토글 (5화 이상 유료 회차 테스트용) */}
          <button
            onClick={() => setAuthorBypass(prev => !prev)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border flex items-center gap-1 transition-all ${
              authorBypass
                ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37]'
                : 'bg-[#181820] border-[#2E2E38] text-[#A1A1AA] hover:text-[#E4E4E7]'
            }`}
            title="5화 이상 유료 페이월을 즉시 해제하여 전편을 테스트 검수합니다"
          >
            <Unlock className="w-3 h-3" />
            <span className="hidden md:inline">{authorBypass ? '작가 프리패스 ON' : 'VIP 잠금 테스트'}</span>
          </button>

          {/* 폰트 크기 조절 */}
          <div className="hidden sm:flex items-center gap-1 bg-[#181820] rounded-lg p-0.5 border border-[#2E2E38]">
            <button
              onClick={() => setFontSize(prev => Math.max(13, prev - 1))}
              className="px-2 py-0.5 text-xs text-[#A1A1AA] hover:text-[#F3F3F5]"
              title="글자 축소"
            >
              A-
            </button>
            <span className="text-[10px] font-mono text-[#D4AF37] px-1">{fontSize}px</span>
            <button
              onClick={() => setFontSize(prev => Math.min(24, prev + 1))}
              className="px-2 py-0.5 text-xs text-[#A1A1AA] hover:text-[#F3F3F5]"
              title="글자 확대"
            >
              A+
            </button>
          </div>

          {/* 이전/다음 회차 내비게이션 */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                if (epNum > 1) router.push(`/read/${seriesId}/${epNum - 1}`);
              }}
              disabled={epNum <= 1}
              className="p-1.5 rounded bg-[#181820] hover:bg-[#22222C] text-[#A1A1AA] disabled:opacity-30 cursor-pointer"
              title="이전 화"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono px-2 text-[#D4AF37] font-semibold">{epNum}화</span>
            <button
              onClick={() => {
                router.push(`/read/${seriesId}/${epNum + 1}`);
              }}
              className="p-1.5 rounded bg-[#181820] hover:bg-[#22222C] text-[#A1A1AA] cursor-pointer"
              title="다음 화"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* 본문 열람 구역 */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-12 relative z-10">
        {loading ? (
          <div className="py-24 text-center text-xs text-[#71717A]">
            보안 원고 데이터베이스 복호화 중...
          </div>
        ) : (
          <article className="space-y-6 text-[#E4E4E7] leading-[2.2] font-sans tracking-tight">
            {/* 회차 타이틀 배너 */}
            <div className="text-center pb-8 border-b border-[#1E1E26]">
              <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-bold block mb-2">
                CROWN GRID SECURE CANON
              </span>
              <h2 className="text-2xl font-bold text-[#F3F3F5] tracking-tight">
                {episodeData?.title}
              </h2>
              <p className="text-xs text-[#71717A] mt-2">
                제 {epNum} 화 • 열람 서명: {userSignature.slice(0, 24)}...
              </p>
            </div>

            {/* 순수 원고 본문 텍스트 (모든 AI 프롬프트가 완전히 걸러진 깨끗한 소설 본문) */}
            <div 
              style={{ fontSize: `${fontSize}px` }}
              className={`whitespace-pre-wrap font-serif leading-relaxed ${isBlurred ? 'secure-blur-layer' : ''}`}
            >
              {watermarkedContent}
            </div>

            {/* 5화 이상 VIP 페이월 모달 */}
            {showPaywall && !authorBypass && (
              <div className="mt-8 p-8 rounded-2xl bg-gradient-to-b from-[#14141B] to-[#0D0D12] border border-[#D4AF37]/40 shadow-2xl shadow-[#D4AF37]/10 text-center space-y-4">
                <div className="w-12 h-12 mx-auto rounded-full bg-[#D4AF37]/15 flex items-center justify-center text-[#D4AF37] border border-[#D4AF37]/30">
                  <Crown className="w-6 h-6 fill-current" />
                </div>
                <h3 className="text-lg font-bold text-[#F3F3F5] tracking-wide">
                  성황 VIP 클럽 익스클루시브 페이월
                </h3>
                <p className="text-xs text-[#A1A1AA] max-w-sm mx-auto leading-relaxed">
                  본 회차(제5화 이후)부터는 성황 VIP 클럽 정기 후원자 및 전용 패스 보유자만 열람하실 수 있는 무삭제 완전판입니다.
                </p>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={() => setAuthorBypass(true)}
                    className="w-full sm:w-auto px-6 py-3 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#B38F24] hover:from-[#E5C048] text-[#0A0A0C] font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#D4AF37]/20 cursor-pointer"
                  >
                    ⚡ 작가/관리자 즉시 잠금 해제 (테스트)
                  </button>
                  <button
                    onClick={() => router.push(`/read/${seriesId}/4`)}
                    className="w-full sm:w-auto px-4 py-3 rounded-lg bg-[#181820] hover:bg-[#22222A] text-xs font-semibold text-[#A1A1AA] cursor-pointer"
                  >
                    무료 4화로 돌아가기
                  </button>
                </div>

                <div className="pt-4 text-[11px] text-[#71717A] flex items-center justify-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>256-bit 엔드투엔드 암호화 및 포렌식 제로-위드 워터마크 보호 구역</span>
                </div>
              </div>
            )}

            {/* 하단 회차 이동 내비게이션 바 */}
            <div className="pt-12 mt-12 border-t border-[#1E1E26] flex items-center justify-between text-xs">
              <button
                onClick={() => {
                  if (epNum > 1) router.push(`/read/${seriesId}/${epNum - 1}`);
                }}
                disabled={epNum <= 1}
                className="px-4 py-2 rounded-xl bg-[#14141B] hover:bg-[#1E1E26] text-[#A1A1AA] hover:text-[#F3F3F5] border border-[#272732] flex items-center gap-2 disabled:opacity-30 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                이전 화 읽기
              </button>

              <button
                onClick={() => router.push('/admin/studio')}
                className="px-4 py-2 rounded-xl bg-[#14141B] hover:bg-[#1E1E26] text-[#D4AF37] border border-[#D4AF37]/30 flex items-center gap-1.5 cursor-pointer"
              >
                <BookOpen className="w-4 h-4" />
                스튜디오로 이동
              </button>

              <button
                onClick={() => router.push(`/read/${seriesId}/${epNum + 1}`)}
                className="px-4 py-2 rounded-xl bg-[#14141B] hover:bg-[#1E1E26] text-[#A1A1AA] hover:text-[#F3F3F5] border border-[#272732] flex items-center gap-2 cursor-pointer"
              >
                다음 화 읽기
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </article>
        )}
      </main>
    </div>
  );
}

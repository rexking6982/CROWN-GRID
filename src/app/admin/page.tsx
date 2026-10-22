'use client';

import { useState, useEffect } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { 
  FolderSync, 
  Terminal, 
  BookOpen, 
  Sparkles, 
  Users, 
  ShieldCheck, 
  Layers,
  ArrowRight,
  Database
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [data, setData] = useState<any>(null);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([
    '[INIT] CROWN GRID v1.0.0 시스템 코어 가동',
    '[READY] 로컬 Assets 폴더(../assets) 연동 대기 중...'
  ]);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/sync-assets');
      const resJson = await res.json();
      if (resJson.success && resJson.dataset) {
        setData(resJson.dataset);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRunSync = async () => {
    try {
      setSyncing(true);
      setConsoleLogs(prev => [...prev, '[SYNC-START] 로컬 assets 폴더 원클릭 동기화 작업 시작...']);
      const res = await fetch('/api/sync-assets', { method: 'POST' });
      const result = await res.json();
      if (result.logs) {
        setConsoleLogs(prev => [...prev, ...result.logs]);
      }
      if (result.data) {
        setData(result.data);
      }
    } catch (err: any) {
      setConsoleLogs(prev => [...prev, `[ERROR] 동기화 중 에러 발생: ${err.message}`]);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-[#F3F3F5] flex">
      <AdminSidebar />

      <main className="flex-1 ml-64 flex flex-col min-h-screen">
        <AdminHeader 
          title="성황 유니버스 창작자 대시보드" 
          subtitle="CROWN GRID - Multi-Universe Studio & Asset Synchronizer"
          onSyncComplete={(res) => {
            if (res.data) setData(res.data);
            if (res.logs) setConsoleLogs(prev => [...prev, ...res.logs]);
          }}
        />

        <div className="p-8 space-y-8 flex-1">
          {/* 상단 핵심 지표 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-xl bg-[#111116] border border-[#222228] relative overflow-hidden group hover:border-[#D4AF37]/50 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-[#A1A1AA] font-bold">유니버스</span>
                <Database className="w-4 h-4 text-[#D4AF37]" />
              </div>
              <p className="text-2xl font-bold mt-2 text-[#F3F3F5]">1</p>
              <p className="text-[11px] text-[#71717A] mt-1">성황 유니버스 (Canon)</p>
            </div>

            <div className="p-5 rounded-xl bg-[#111116] border border-[#222228] relative overflow-hidden group hover:border-[#D4AF37]/50 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-[#A1A1AA] font-bold">등록 시리즈</span>
                <Layers className="w-4 h-4 text-[#D4AF37]" />
              </div>
              <p className="text-2xl font-bold mt-2 text-[#F3F3F5]">{data?.series?.length || 5}</p>
              <p className="text-[11px] text-[#71717A] mt-1">심야 검열 / 킹카 목줄 / 아이돌 등</p>
            </div>

            <div className="p-5 rounded-xl bg-[#111116] border border-[#222228] relative overflow-hidden group hover:border-[#D4AF37]/50 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-[#A1A1AA] font-bold">동기화 에피소드</span>
                <BookOpen className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-2xl font-bold mt-2 text-emerald-400">{data?.episodes?.length || 0}</p>
              <p className="text-[11px] text-[#71717A] mt-1">로컬 .md 원고 완벽 인덱싱</p>
            </div>

            <div className="p-5 rounded-xl bg-[#111116] border border-[#222228] relative overflow-hidden group hover:border-[#D4AF37]/50 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-[#A1A1AA] font-bold">인물 명세서</span>
                <Users className="w-4 h-4 text-rose-400" />
              </div>
              <p className="text-2xl font-bold mt-2 text-rose-400">{data?.characters?.length || 4}</p>
              <p className="text-[11px] text-[#71717A] mt-1">비공개 아나토미 치수 탑재</p>
            </div>
          </div>

          {/* 원클릭 동기화 및 실시간 로그 콘솔 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl bg-[#111116] border border-[#222228] flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 rounded-lg bg-[#D4AF37]/10 text-[#D4AF37]">
                    <FolderSync className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#F3F3F5]">로컬 Assets 폴더 원클릭 동기화</h3>
                    <p className="text-xs text-[#71717A]">C:\NMaker\assets 폴더 (Read-Only 보존)</p>
                  </div>
                </div>
                <p className="text-xs text-[#A1A1AA] leading-relaxed mt-2">
                  작가님의 로컬 <code className="text-[#D4AF37]">../assets</code> 폴더 내 마스터 설정집 및 시리즈별 에피소드 원고 파일들을 자동 감지하여 데이터베이스와 로컬 캐시에 즉각 인덱싱합니다.
                </p>
                <div className="mt-4 p-3 rounded-lg bg-[#18181F] border border-[#262630] text-[11px] text-[#A1A1AA] space-y-1">
                  <p>✓ 원본 파일 무수정(Read-Only) 철저 보장</p>
                  <p>✓ 1~4화 무료 / 5화 유료 VIP 페이월 자동 분류</p>
                  <p>✓ 제로너비 포렌식 워터마크 자동 주입 준비</p>
                </div>
              </div>

              <button
                onClick={handleRunSync}
                disabled={syncing}
                className="mt-6 w-full py-3 px-4 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#B38F24] hover:from-[#E5C048] hover:to-[#C49F33] text-[#0A0A0C] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#D4AF37]/15 disabled:opacity-50"
              >
                <FolderSync className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                {syncing ? '원클릭 동기화 실행 중...' : '로컬 Assets 폴더 원클릭 동기화 실행'}
              </button>
            </div>

            {/* 실시간 콘솔 터미널 */}
            <div className="lg:col-span-2 p-6 rounded-xl bg-[#0E0E12] border border-[#222228] flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b border-[#1C1C24] mb-3">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-[#D4AF37]" />
                  <span className="text-xs font-bold text-[#E4E4E7] tracking-wider uppercase">
                    Sync Engine Live Terminal
                  </span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono">
                  ACTIVE
                </span>
              </div>
              <div className="flex-1 bg-[#070709] rounded-lg p-4 font-mono text-[11px] text-[#A1A1AA] overflow-y-auto max-h-60 space-y-1 border border-[#181820]">
                {consoleLogs.map((log, idx) => (
                  <div key={idx} className="leading-tight">
                    <span className="text-[#71717A]">[{new Date().toLocaleTimeString()}]</span>{' '}
                    <span className={log.includes('ERROR') ? 'text-rose-400' : log.includes('DONE') ? 'text-emerald-400' : log.includes('SYNC') ? 'text-[#D4AF37]' : 'text-[#D4D4D8]'}>
                      {log}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 시리즈 목록 카드 */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#F3F3F5]">
                성황 유니버스 집필 시리즈 목록
              </h3>
              <a
                href="/admin/studio"
                className="text-xs text-[#D4AF37] hover:underline flex items-center gap-1"
              >
                스튜디오에서 에피소드 가공하기 <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(data?.series || []).map((s: any, idx: number) => (
                <div
                  key={s.id || idx}
                  className="p-5 rounded-xl bg-[#111116] border border-[#222228] hover:border-[#D4AF37]/40 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[#1C1C24] text-[#D4AF37] font-semibold border border-[#2E2E38]">
                        Series {idx + 1}
                      </span>
                      <span className="text-[11px] text-[#71717A]">
                        {s.total_episodes || 0}개 에피소드
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-[#F3F3F5] mb-1">{s.title}</h4>
                    <p className="text-[11px] text-[#A1A1AA] line-clamp-2 leading-relaxed">
                      {s.synopsis}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-[#1C1C24] flex items-center justify-between text-xs">
                    <span className="text-[11px] text-[#71717A]">{s.genre}</span>
                    <a
                      href={`/read/${s.id}/1`}
                      target="_blank"
                      className="text-[#D4AF37] hover:text-[#F3F3F5] text-xs font-semibold flex items-center gap-1"
                    >
                      뷰어 열람 <ArrowRight className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

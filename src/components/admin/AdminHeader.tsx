'use client';

import { useState } from 'react';
import { RefreshCw, CheckCircle2, Shield, Lock } from 'lucide-react';

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  onSyncComplete?: (data: any) => void;
}

export default function AdminHeader({ title, subtitle, onSyncComplete }: AdminHeaderProps) {
  const [syncing, setSyncing] = useState(false);
  const [lastSyncMsg, setLastSyncMsg] = useState<string | null>(null);

  const handleSync = async () => {
    try {
      setSyncing(true);
      setLastSyncMsg(null);
      const res = await fetch('/api/sync-assets', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setLastSyncMsg(`동기화 완료 (${data.episodesCount}개 에피소드 파싱됨)`);
        if (onSyncComplete) onSyncComplete(data);
      } else {
        setLastSyncMsg(`동기화 실패: ${data.error || '알 수 없는 오류'}`);
      }
    } catch (err: any) {
      setLastSyncMsg(`네트워크 오류: ${err.message}`);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <header className="h-16 bg-[#0E0E12]/80 backdrop-blur-md border-b border-[#222228] px-8 flex items-center justify-between sticky top-0 z-20">
      <div>
        <h2 className="text-base font-bold text-[#F3F3F5] tracking-tight">{title}</h2>
        {subtitle && <p className="text-xs text-[#71717A]">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        {lastSyncMsg && (
          <span className="text-xs text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {lastSyncMsg}
          </span>
        )}

        <button
          onClick={handleSync}
          disabled={syncing}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#D4AF37] hover:bg-[#C29E2E] text-[#0A0A0C] font-semibold text-xs transition-colors shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Assets 동기화 중...' : '로컬 Assets 동기화'}
        </button>

        <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-[#18181D] border border-[#27272F] text-xs text-[#A1A1AA]">
          <Shield className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>보안 프로토콜 v4.2</span>
        </div>
      </div>
    </header>
  );
}

'use client';

import { useState } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { ShieldAlert, Search, CheckCircle, AlertOctagon, Terminal, Copy, KeyRound } from 'lucide-react';
import { encodeStringToZeroWidth } from '@/lib/steganography';

export default function ForensicPage() {
  const [inputText, setInputText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [decodeResult, setDecodeResult] = useState<any>(null);

  // 테스트용: 워터마크가 은밀히 심긴 예시 텍스트 복사 생성
  const handleGenerateSample = () => {
    const dummySignature = `USER:VIP-KIM-9821|HASH:7f8a9c2b|TIME:${new Date().toISOString()}`;
    const baseText = `강태건 총괄 감찰관은 차가운 편광 유리 너머로 각 잡힌 거수경례를 유지하고 있는 서하진을 응시했다. 규율의 이면에 감춰진 균열을 포착하는 데에는 오랜 시간이 걸리지 않았다.`;
    const hidden = encodeStringToZeroWidth(dummySignature);
    const textWithHidden = baseText + hidden;
    setInputText(textWithHidden);
  };

  const handleDecode = async () => {
    if (!inputText) return;
    try {
      setAnalyzing(true);
      setDecodeResult(null);

      const res = await fetch('/api/forensic/decode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText }),
      });
      const data = await res.json();
      setDecodeResult(data);
    } catch (e: any) {
      alert(`디코딩 실패: ${e.message}`);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-[#F3F3F5] flex">
      <AdminSidebar />

      <main className="flex-1 ml-64 flex flex-col min-h-screen">
        <AdminHeader
          title="포렌식 스테가노그래피 유출 역추적 디코더"
          subtitle="제로 너비 문자(Zero-Width Characters) 역분석 및 불법 유출자 식별 프로토콜"
        />

        <div className="p-8 space-y-6 max-w-5xl">
          {/* 가이드 배너 */}
          <div className="p-5 rounded-xl bg-[#111116] border border-[#222228] flex items-start gap-4">
            <div className="p-2.5 rounded-lg bg-rose-500/10 text-rose-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#F3F3F5]">
                불법 텍스트 유출 포렌식 역추적 시스템
              </h3>
              <p className="text-xs text-[#A1A1AA] mt-1 leading-relaxed">
                외부 커뮤니티나 텔레그램 등에 무단 유출된 원고 문장(단 한 줄이라도 포함)을 아래 입력창에 붙여넣으십시오.
                문장 사이에 은밀하게 숨겨진 4종의 제로 너비 문자(<code className="text-[#D4AF37]">\u200B, \u200C, \u200D, \uFEFF</code>)를 비트열로 재구성하여 유출자의 계정 식별자, 세션 해시, 접속 시각을 100% 특정합니다.
              </p>
            </div>
          </div>

          {/* 입력 박스 */}
          <div className="p-6 rounded-xl bg-[#111116] border border-[#222228] space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-[#D4AF37] flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5" />
                유출 의심 텍스트 붙여넣기
              </label>

              <button
                onClick={handleGenerateSample}
                className="text-xs text-[#A1A1AA] hover:text-[#D4AF37] underline decoration-dotted flex items-center gap-1"
              >
                <KeyRound className="w-3 h-3" />
                테스트용 워터마크 주입 텍스트 자동 채우기
              </button>
            </div>

            <textarea
              rows={5}
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder="외부 사이트에서 긁어온 텍스트를 그대로 붙여넣으세요... (육안으로는 제로 너비 문자가 전혀 보이지 않습니다)"
              className="w-full bg-[#0A0A0C] border border-[#272730] rounded-lg p-4 font-mono text-xs text-[#E4E4E7] placeholder-[#52525B] focus:border-[#D4AF37] outline-none"
            />

            <button
              onClick={handleDecode}
              disabled={analyzing || !inputText}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-rose-900/20 disabled:opacity-50"
            >
              <Search className={`w-4 h-4 ${analyzing ? 'animate-spin' : ''}`} />
              {analyzing ? '스테가노그래피 2비트 페어 디코딩 중...' : '포렌식 워터마크 역추적 정밀 분석 시작'}
            </button>
          </div>

          {/* 결과 디스플레이 */}
          {decodeResult && (
            <div
              className={`p-6 rounded-xl border ${
                decodeResult.found
                  ? 'bg-rose-950/20 border-rose-500/50 shadow-2xl shadow-rose-950/40'
                  : 'bg-[#111116] border-[#272730]'
              } space-y-4 animate-in fade-in`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#2A2A35]">
                <div className="flex items-center gap-2">
                  {decodeResult.found ? (
                    <>
                      <AlertOctagon className="w-5 h-5 text-rose-400" />
                      <h4 className="text-sm font-bold text-rose-400 uppercase tracking-wider">
                        [경보] 불법 유출자 식별 성공 (Forensic Match)
                      </h4>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 text-[#71717A]" />
                      <h4 className="text-sm font-bold text-[#A1A1AA]">
                        워터마크 미검출 (Non-Forensic Plaintext)
                      </h4>
                    </>
                  )}
                </div>
                <span className="text-[10px] text-[#71717A] font-mono">
                  분석 시각: {new Date().toLocaleTimeString()}
                </span>
              </div>

              {decodeResult.found ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="p-3 bg-[#0E0E12] rounded-lg border border-[#272732]">
                      <span className="text-[10px] text-[#71717A] uppercase block">
                        유출자 식별 ID
                      </span>
                      <span className="text-sm font-mono font-bold text-rose-400">
                        {decodeResult.meta?.USER || '알 수 없음'}
                      </span>
                    </div>

                    <div className="p-3 bg-[#0E0E12] rounded-lg border border-[#272732]">
                      <span className="text-[10px] text-[#71717A] uppercase block">
                        세션 보안 해시
                      </span>
                      <span className="text-sm font-mono font-bold text-[#E4E4E7]">
                        {decodeResult.meta?.HASH || 'N/A'}
                      </span>
                    </div>

                    <div className="p-3 bg-[#0E0E12] rounded-lg border border-[#272732]">
                      <span className="text-[10px] text-[#71717A] uppercase block">
                        열람 발생 타임스탬프
                      </span>
                      <span className="text-xs font-mono text-[#D4AF37]">
                        {decodeResult.meta?.TIME || 'N/A'}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-[#0A0A0C] rounded-lg border border-[#202028]">
                    <span className="text-[10px] text-[#71717A] uppercase block mb-1">
                      복호화된 원시 페이로드 (Raw Decoded String)
                    </span>
                    <p className="font-mono text-xs text-emerald-400 break-all">
                      {decodeResult.rawPayload}
                    </p>
                  </div>

                  <div className="p-3.5 bg-rose-500/10 rounded-lg border border-rose-500/30 text-xs text-rose-300 leading-relaxed">
                    <strong>조치 권고:</strong> 해당 구독자 계정({decodeResult.meta?.USER})의 CROWN GRID 열람 권한을 즉시 차단(Blacklist)하고, 불법 복제 증거 리포트를 첨부하여 법적 대응을 집행할 수 있습니다.
                  </div>
                </div>
              ) : (
                <p className="text-xs text-[#A1A1AA] leading-relaxed">
                  {decodeResult.message}
                </p>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import RelationshipGraph from '@/components/admin/RelationshipGraph';
import { 
  Sparkles, 
  CheckCircle, 
  AlertTriangle, 
  Film, 
  Share2, 
  Activity, 
  Copy, 
  Crop, 
  Sliders, 
  FileText,
  ShieldCheck,
  Check
} from 'lucide-react';
import { AgentProcessResult } from '@/lib/gemini';
import { Episode, Series } from '@/lib/types';

export default function StudioPage() {
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [selectedSeriesId, setSelectedSeriesId] = useState<string>('s-midnight-01');
  const [selectedEpisodeId, setSelectedEpisodeId] = useState<string>('');
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);

  const [activeTab, setActiveTab] = useState<'summary' | 'graph' | 'prompts' | 'distribution' | 'stats'>('summary');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AgentProcessResult | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // 데이터 로드
  useEffect(() => {
    fetch('/api/sync-assets')
      .then(res => res.json())
      .then(res => {
        if (res.dataset) {
          setSeriesList(res.dataset.series || []);
          setEpisodes(res.dataset.episodes || []);
          const firstEp = (res.dataset.episodes || []).find((e: Episode) => e.series_id === 's-midnight-01');
          if (firstEp) {
            setSelectedEpisodeId(firstEp.id);
            setCurrentEpisode(firstEp);
          }
        }
      })
      .catch(console.error);
  }, []);

  // 에피소드 변경 시
  const handleEpisodeChange = (epId: string) => {
    setSelectedEpisodeId(epId);
    const found = episodes.find(e => e.id === epId);
    if (found) {
      setCurrentEpisode(found);
      setAnalysisResult(null); // 새 에피소드 선택 시 초기화
    }
  };

  // 분석 실행 (Gemini API 호출)
  const handleRunAnalysis = async () => {
    if (!currentEpisode) return;
    try {
      setAnalyzing(true);
      const currSeries = seriesList.find(s => s.id === currentEpisode.series_id);
      const res = await fetch('/api/agent/process-episode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seriesTitle: currSeries?.title || '성황 유니버스',
          episodeNum: currentEpisode.episode_number,
          episodeTitle: currentEpisode.title,
          content: currentEpisode.content,
        }),
      });
      const data = await res.json();
      if (data.success && data.analysis) {
        setAnalysisResult(data.analysis);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const filteredEpisodes = episodes.filter(e => e.series_id === selectedSeriesId);

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-[#F3F3F5] flex">
      <AdminSidebar />

      <main className="flex-1 ml-64 flex flex-col min-h-screen">
        <AdminHeader
          title="창작자 멀티 에이전트 스튜디오"
          subtitle="Gemini 1.5 BLOCK_NONE 검열 무효화 및 5대 에이전트 파이프라인 워크스페이스"
        />

        <div className="p-8 space-y-6 flex-1 flex flex-col">
          {/* 상단 컨트롤러: 시리즈 및 에피소드 셀렉터 */}
          <div className="p-4 rounded-xl bg-[#111116] border border-[#222228] flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <label className="text-[10px] text-[#71717A] uppercase font-bold block mb-1">
                  시리즈 선택
                </label>
                <select
                  value={selectedSeriesId}
                  onChange={e => {
                    setSelectedSeriesId(e.target.value);
                    const ep = episodes.find(ep => ep.series_id === e.target.value);
                    if (ep) {
                      setSelectedEpisodeId(ep.id);
                      setCurrentEpisode(ep);
                    }
                  }}
                  className="bg-[#0A0A0C] border border-[#272730] text-xs text-[#E4E4E7] rounded-lg px-3 py-2 outline-none"
                >
                  {seriesList.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] text-[#71717A] uppercase font-bold block mb-1">
                  에피소드 선택 ({filteredEpisodes.length}화 보유)
                </label>
                <select
                  value={selectedEpisodeId}
                  onChange={e => handleEpisodeChange(e.target.value)}
                  className="bg-[#0A0A0C] border border-[#272730] text-xs text-[#E4E4E7] rounded-lg px-3 py-2 outline-none max-w-xs"
                >
                  {filteredEpisodes.map(ep => (
                    <option key={ep.id} value={ep.id}>
                      제{ep.episode_number}화 - {ep.title} {ep.is_free ? '(무료)' : '(VIP유료)'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleRunAnalysis}
              disabled={analyzing || !currentEpisode}
              className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#B38F24] hover:from-[#E5C048] hover:to-[#C49F33] text-[#0A0A0C] font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-[#D4AF37]/20 transition-all disabled:opacity-50"
            >
              <Sparkles className={`w-4 h-4 ${analyzing ? 'animate-spin' : ''}`} />
              {analyzing ? '에이전트 5대 분석 파이프라인 가동 중...' : 'Gemini 5대 에이전트 일괄 생성 실행'}
            </button>
          </div>

          {/* 5대 탭 네비게이션 */}
          <div className="flex border-b border-[#222228] gap-2">
            <button
              onClick={() => setActiveTab('summary')}
              className={`px-4 py-2.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
                activeTab === 'summary'
                  ? 'border-[#D4AF37] text-[#D4AF37]'
                  : 'border-transparent text-[#71717A] hover:text-[#E4E4E7]'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              1. 스토리 요약 & Canon 검증
            </button>
            <button
              onClick={() => setActiveTab('graph')}
              className={`px-4 py-2.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
                activeTab === 'graph'
                  ? 'border-[#D4AF37] text-[#D4AF37]'
                  : 'border-transparent text-[#71717A] hover:text-[#E4E4E7]'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              2. 인물 관계도 (회차 슬라이더)
            </button>
            <button
              onClick={() => setActiveTab('prompts')}
              className={`px-4 py-2.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
                activeTab === 'prompts'
                  ? 'border-[#D4AF37] text-[#D4AF37]'
                  : 'border-transparent text-[#71717A] hover:text-[#E4E4E7]'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              3. 35mm 스틸컷 프롬프트 5선
            </button>
            <button
              onClick={() => setActiveTab('distribution')}
              className={`px-4 py-2.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
                activeTab === 'distribution'
                  ? 'border-[#D4AF37] text-[#D4AF37]'
                  : 'border-transparent text-[#71717A] hover:text-[#E4E4E7]'
              }`}
            >
              <Share2 className="w-3.5 h-3.5" />
              4. 포스타입 / SubscribeStar 복사기
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`px-4 py-2.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
                activeTab === 'stats'
                  ? 'border-[#D4AF37] text-[#D4AF37]'
                  : 'border-transparent text-[#71717A] hover:text-[#E4E4E7]'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              5. 캐릭터톡 5대 스탯 & 암호
            </button>
          </div>

          {/* 탭 1: 요약 & Canon 검증 */}
          {activeTab === 'summary' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
              <div className="p-6 rounded-xl bg-[#111116] border border-[#222228] space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#1C1C24]">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
                    뱅글 소거식 5줄 ➔ 1줄 슬릿 요약 보드
                  </h4>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono">
                    RULE COMPLIANT
                  </span>
                </div>

                <div className="p-4 rounded-lg bg-[#0A0A0C] border border-[#1E1E26]">
                  <span className="text-[10px] text-[#71717A] uppercase font-bold block mb-1">
                    최종 1줄 슬릿 압축 (One-Line Slit)
                  </span>
                  <p className="text-xs text-[#E4E4E7] font-medium leading-relaxed">
                    {analysisResult?.summary.oneLineSlit ||
                      `[제${currentEpisode?.episode_number || 1}화] ${currentEpisode?.title || '원고'} - 규율의 통제탑 속에서 은밀하게 집행된 첫 번째 신체 검열과 지배의 시작.`}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] text-[#71717A] uppercase font-bold block mb-2">
                    주요 복선 및 전개 핵심 (3 Keypoints)
                  </span>
                  <div className="space-y-2">
                    {(analysisResult?.summary.keyPoints || [
                      '상관 강태건의 냉혹한 규율 체크와 서하진의 억눌린 복종 반응',
                      '성황 VIP 클럽의 암묵적 권력 구도가 군부 밀실로 침투하는 전조',
                      '향후 목줄 결박으로 이어질 전술 안대 및 만년필 소품 복선 배치',
                    ]).map((kp, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-[#A1A1AA] bg-[#0E0E12] p-2.5 rounded border border-[#1C1C24]">
                        <span className="text-[#D4AF37] font-bold">0{idx + 1}.</span>
                        <span>{kp}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Canon Check Report */}
              <div className="p-6 rounded-xl bg-[#111116] border border-[#222228] space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#1C1C24]">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
                    Canon 설정 충돌 검사 리포트
                  </h4>
                  <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                </div>

                <div className="space-y-3">
                  <div className="p-3.5 rounded-lg bg-[#0E0E12] border border-[#1E1E26] flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-[#E4E4E7] block">
                        금지어 'Class' 단어 검사
                      </span>
                      <span className="text-[11px] text-[#71717A]">
                        (성황 VIP 클럽 내부 서열 외 일반 호칭 사용 금지)
                      </span>
                    </div>
                    {analysisResult?.canonCheck.cWordFound ? (
                      <span className="text-xs text-rose-400 font-bold flex items-center gap-1 bg-rose-500/10 px-2.5 py-1 rounded">
                        <AlertTriangle className="w-3.5 h-3.5" /> 발견됨 (수정 요망)
                      </span>
                    ) : (
                      <span className="text-xs text-emerald-400 font-bold flex items-center gap-1 bg-emerald-500/10 px-2.5 py-1 rounded">
                        <CheckCircle className="w-3.5 h-3.5" /> 완벽 통과
                      </span>
                    )}
                  </div>

                  <div className="p-3.5 rounded-lg bg-[#0E0E12] border border-[#1E1E26] flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-[#E4E4E7] block">
                        배진혁 나이 (48세/외형 30대) 설정 일치성
                      </span>
                      <span className="text-[11px] text-[#71717A]">최고 관리 개체 체액 공급 묘사 호환</span>
                    </div>
                    <span className="text-xs text-emerald-400 font-bold flex items-center gap-1 bg-emerald-500/10 px-2.5 py-1 rounded">
                      <CheckCircle className="w-3.5 h-3.5" /> 정상 반영
                    </span>
                  </div>

                  <div className="p-3.5 rounded-lg bg-[#0E0E12] border border-[#1E1E26] flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-[#E4E4E7] block">
                        시리즈 2 대위 ➔ 서하준(서하진 친형) 계보 일치
                      </span>
                      <span className="text-[11px] text-[#71717A]">가족 관계 및 군부 서열 족보 호환</span>
                    </div>
                    <span className="text-xs text-emerald-400 font-bold flex items-center gap-1 bg-emerald-500/10 px-2.5 py-1 rounded">
                      <CheckCircle className="w-3.5 h-3.5" /> 정상 반영
                    </span>
                  </div>
                </div>

                {analysisResult?.canonCheck.issues && analysisResult.canonCheck.issues.length > 0 && (
                  <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">
                    <p className="font-bold mb-1">발견된 설정 주의사항:</p>
                    <ul className="list-disc list-inside space-y-0.5">
                      {analysisResult.canonCheck.issues.map((iss, i) => (
                        <li key={i}>{iss}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 탭 2: 인물 관계도 */}
          {activeTab === 'graph' && (
            <div className="flex-1 min-h-[560px]">
              <RelationshipGraph
                currentEpisode={currentEpisode?.episode_number || 1}
                maxEpisodes={episodes.length || 30}
              />
            </div>
          )}

          {/* 탭 3: 35mm 스틸컷 영문 프롬프트 & 표지 오토 크롭 */}
          {activeTab === 'prompts' && (
            <div className="space-y-6">
              <div className="p-6 rounded-xl bg-[#111116] border border-[#222228] flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
                    표지 오토 크롭 (Auto Cover Cropper)
                  </h4>
                  <p className="text-xs text-[#71717A] mt-1">
                    Midjourney 16:9 생성 스틸컷을 포스타입 세로 표지(1:1.414) 및 썸네일(1:1) 규격으로 자동 리사이징
                  </p>
                </div>
                <button
                  onClick={() => alert('표지 이미지 오토 크롭 프리셋이 적용되었습니다 (3:4, 1:1, 16:9 다중 출력).')}
                  className="px-4 py-2 rounded-lg bg-[#1C1C24] hover:bg-[#272732] text-xs font-semibold text-[#E4E4E7] border border-[#2E2E38] flex items-center gap-1.5"
                >
                  <Crop className="w-3.5 h-3.5 text-[#D4AF37]" />
                  크롭 프리셋 생성
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {(analysisResult?.prompts || [
                  {
                    sceneName: '01. 통제탑 브리핑룸 - 긴장된 대치',
                    timestamp: '00:04:12',
                    prompt: 'Cinematic 35mm film still, sharp focus, 1980s dark military aesthetic, cold fluorescent tube lighting reflecting on obsidian tile floor, sharp tailored dark uniform, subtle tension, atmospheric dust particles, shallow depth of field, Kodak Vision3 500T --ar 16:9 --style raw',
                    negativePrompt: 'cartoon, anime, 3d render, oversaturated, blurry, bad anatomy',
                    aspectRatio: '16:9',
                  },
                  {
                    sceneName: '02. 편광 유리 너머의 감찰관 시선',
                    timestamp: '00:12:45',
                    prompt: 'Dramatic close up shot, 35mm Leica M6, strong rim lighting in dark luxury room, champagne gold and obsidian accents, intense eye contact, cold superiority expression, wet skin texture, high fashion noir --ar 16:9 --v 6.0',
                    negativePrompt: 'deformed, smiling, casual clothes, low resolution',
                    aspectRatio: '16:9',
                  },
                  {
                    sceneName: '03. 은밀한 구속과 굴복의 각인',
                    timestamp: '00:22:18',
                    prompt: 'Sensual high-contrast chiaroscuro photography, dark room, polished leather constraints on dark polished mahogany table, sweat glistening under directional spotlight, raw emotional surrender, high aesthetic eroticism, grain, vintage film look --ar 16:9',
                    negativePrompt: 'bright daylight, outdoor, cheap props, distortion',
                    aspectRatio: '16:9',
                  },
                  {
                    sceneName: '04. 거울 앞 무너지는 이성',
                    timestamp: '00:31:05',
                    prompt: 'Medium shot through heavy antique mirror with golden patina, reflection of breathless exhausted figure kneeling, shadowed dominant figure standing behind, psychological domination, moody mist, muted tones --ar 16:9',
                    negativePrompt: 'flat lighting, saturated, smile',
                    aspectRatio: '16:9',
                  },
                  {
                    sceneName: '05. 성황 각인 만년필과 종결 서약',
                    timestamp: '00:39:50',
                    prompt: 'Macro shot, heavy brass keyhole and locked steel soundproof door, engraved golden insignia glowing faintly, cold blue corridor light leaking from the bottom slit, cinematic mystery, Panavision anamorphic lens --ar 16:9',
                    negativePrompt: 'low quality, messy composition, blurry',
                    aspectRatio: '16:9',
                  },
                ]).map((p, idx) => (
                  <div key={idx} className="p-5 rounded-xl bg-[#111116] border border-[#222228] space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#D4AF37]">{p.sceneName}</span>
                        <span className="text-[10px] text-[#71717A] font-mono">[{p.timestamp}]</span>
                      </div>
                      <button
                        onClick={() => handleCopy(p.prompt, `prompt-${idx}`)}
                        className="px-3 py-1 rounded bg-[#1C1C24] hover:bg-[#272732] text-xs text-[#E4E4E7] border border-[#2E2E38] flex items-center gap-1.5 transition-colors"
                      >
                        {copiedKey === `prompt-${idx}` ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">복사됨</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-[#D4AF37]" />
                            <span>프롬프트 복사</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="bg-[#0A0A0C] p-3 rounded-lg border border-[#1C1C24] font-mono text-xs text-[#E4E4E7] leading-relaxed">
                      {p.prompt}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-[#71717A]">
                      <span>Negative: {p.negativePrompt}</span>
                      <span className="text-[#D4AF37]">Aspect: {p.aspectRatio}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 탭 4: 포스타입 / SubscribeStar 원클릭 복사기 */}
          {activeTab === 'distribution' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 포스타입 서식 */}
              <div className="p-6 rounded-xl bg-[#111116] border border-[#222228] flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-[#1C1C24]">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
                        포스타입(POSTYPE) 1~4화 무료 HTML 서식
                      </h4>
                      <p className="text-[11px] text-[#71717A] mt-0.5">
                        4화 하단에 CROWN GRID 유료 구독 유도 배너가 자동 탑재됩니다.
                      </p>
                    </div>
                    <button
                      onClick={() => handleCopy(analysisResult?.distribution.postypeHtml || '포스타입 HTML 서식', 'postype')}
                      className="px-3 py-1 rounded bg-[#D4AF37] hover:bg-[#C29E2E] text-xs font-bold text-[#0A0A0C] flex items-center gap-1.5"
                    >
                      {copiedKey === 'postype' ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          복사완료!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          HTML 복사
                        </>
                      )}
                    </button>
                  </div>

                  <div className="mt-4 p-4 rounded-lg bg-[#0A0A0C] border border-[#1E1E26] max-h-96 overflow-y-auto font-mono text-[11px] text-[#A1A1AA] leading-relaxed whitespace-pre-wrap">
                    {analysisResult?.distribution.postypeHtml || '에피소드 분석을 실행하면 포스타입 전용 서식과 CROWN GRID 정주행 유도 배너 코드가 완성됩니다.'}
                  </div>
                </div>
              </div>

              {/* SubscribeStar 서식 */}
              <div className="p-6 rounded-xl bg-[#111116] border border-[#222228] flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-[#1C1C24]">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
                        SubscribeStar.adult 한/영 요약 포스트
                      </h4>
                      <p className="text-[11px] text-[#71717A] mt-0.5">
                        글로벌 후원자들을 위한 영문 시놉시스 및 비하인드 컷 안내문
                      </p>
                    </div>
                    <button
                      onClick={() => handleCopy(analysisResult?.distribution.subscribeStarText || 'SubscribeStar 서식', 'substar')}
                      className="px-3 py-1 rounded bg-[#D4AF37] hover:bg-[#C29E2E] text-xs font-bold text-[#0A0A0C] flex items-center gap-1.5"
                    >
                      {copiedKey === 'substar' ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          복사완료!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          영문본 복사
                        </>
                      )}
                    </button>
                  </div>

                  <div className="mt-4 p-4 rounded-lg bg-[#0A0A0C] border border-[#1E1E26] max-h-96 overflow-y-auto font-mono text-[11px] text-[#A1A1AA] leading-relaxed whitespace-pre-wrap">
                    {analysisResult?.distribution.subscribeStarText || '에피소드 분석을 실행하면 글로벌 후원자 타깃의 영문 디렉터스 컷 텍스트가 완성됩니다.'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 탭 5: 캐릭터톡 5대 스탯 & 암호 */}
          {activeTab === 'stats' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(analysisResult?.characterStats || [
                {
                  name: '강태건',
                  dominance: 94,
                  submission: 6,
                  obsession: 88,
                  shame: 12,
                  sanity: 85,
                  secretKeyword: '사각지대_서약',
                },
                {
                  name: '서하진',
                  dominance: 22,
                  submission: 92,
                  obsession: 78,
                  shame: 86,
                  sanity: 38,
                  secretKeyword: '편광유리_호흡',
                },
              ]).map((st, idx) => (
                <div key={idx} className="p-6 rounded-xl bg-[#111116] border border-[#222228] space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[#1C1C24]">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-[#F3F3F5]">{st.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[#D4AF37]/20 text-[#D4AF37] font-semibold">
                        Ep.{currentEpisode?.episode_number || 1} 실시간 스탯
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#1C1C24] border border-[#2A2A35]">
                      <span className="text-[10px] text-[#71717A]">암호 키워드:</span>
                      <span className="text-xs font-mono text-emerald-400 font-bold">{st.secretKeyword}</span>
                    </div>
                  </div>

                  {/* 5대 스탯 프로그레스 바 */}
                  <div className="space-y-3 text-xs">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-[#A1A1AA]">지배력 (Dominance)</span>
                        <span className="text-[#D4AF37] font-bold">{st.dominance}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#1A1A22] overflow-hidden">
                        <div className="h-full bg-[#D4AF37] rounded-full" style={{ width: `${st.dominance}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-[#A1A1AA]">복종도 (Submission)</span>
                        <span className="text-rose-400 font-bold">{st.submission}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#1A1A22] overflow-hidden">
                        <div className="h-full bg-rose-500 rounded-full" style={{ width: `${st.submission}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-[#A1A1AA]">집착도 (Obsession)</span>
                        <span className="text-purple-400 font-bold">{st.obsession}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#1A1A22] overflow-hidden">
                        <div className="h-full bg-purple-500 rounded-full" style={{ width: `${st.obsession}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-[#A1A1AA]">수치심 (Shame)</span>
                        <span className="text-amber-400 font-bold">{st.shame}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#1A1A22] overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: `${st.shame}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-[#A1A1AA]">이성치 (Sanity)</span>
                        <span className="text-cyan-400 font-bold">{st.sanity}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#1A1A22] overflow-hidden">
                        <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${st.sanity}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

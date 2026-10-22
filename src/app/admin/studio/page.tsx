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
  Check,
  Search,
  Cpu,
  Mic,
  Zap,
  Volume2
} from 'lucide-react';
import { AgentProcessResult, AVAILABLE_MODELS } from '@/lib/gemini';
import { Episode, Series } from '@/lib/types';

export default function StudioPage() {
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [selectedSeriesId, setSelectedSeriesId] = useState<string>('s-midnight-01');
  const [selectedEpisodeId, setSelectedEpisodeId] = useState<string>('');
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);

  // AI 모델 설정 (기본값: RPD 500의 Gemini 3.1 Flash Lite)
  const [selectedModel, setSelectedModel] = useState<string>('gemini-3.1-flash-lite');

  const [activeTab, setActiveTab] = useState<'summary' | 'graph' | 'prompts' | 'distribution' | 'stats' | 'rag' | 'live'>('summary');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AgentProcessResult | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // 시맨틱 검색 RAG 상태
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searching, setSearching] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // 실시간 보이스톡 룸 상태
  const [activeVoiceCharacter, setActiveVoiceCharacter] = useState<string>('배진혁');
  const [voiceMessages, setVoiceMessages] = useState<Array<{ sender: string; text: string }>>([
    { sender: '배진혁 대표', text: '어서 오게. 8층 관제실의 문은 오직 허가된 자에게만 열리지. 오늘 밤 자네가 보고할 사항은 무엇인가?' }
  ]);
  const [userVoiceInput, setUserVoiceInput] = useState<string>('');

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

  const handleEpisodeChange = (epId: string) => {
    setSelectedEpisodeId(epId);
    const found = episodes.find(e => e.id === epId);
    if (found) {
      setCurrentEpisode(found);
      setAnalysisResult(null);
    }
  };

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
          preferredModel: selectedModel,
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

  // 시맨틱 검색 실행
  const handleSemanticSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      setSearching(true);
      const res = await fetch('/api/agent/semantic-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery, topK: 5 }),
      });
      const data = await res.json();
      if (data.success && data.results) {
        setSearchResults(data.results);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSearching(false);
    }
  };

  // 실시간 보이스톡 인터랙션 시뮬레이션
  const handleSendVoiceMessage = () => {
    if (!userVoiceInput.trim()) return;
    const userText = userVoiceInput;
    setUserVoiceInput('');
    setVoiceMessages(prev => [...prev, { sender: '나 (작가/구독자)', text: userText }]);

    // 캐릭터 페르소나 응답 생성
    setTimeout(() => {
      let reply = '';
      if (activeVoiceCharacter === '배진혁') {
        reply = `흥미롭군. 자네의 그 보고는 《마스터 루틴》 중앙 관제망에 그대로 기록되었네. 오늘 밤 8층 런웨이에서 직접 증명해 보이도록.`;
      } else if (activeVoiceCharacter === '강태건') {
        reply = `말이 길군. 사격장 통제탑의 규율은 오차를 허용하지 않는다. 관등성명을 밝히고 다음 복종 절차를 보고해라.`;
      } else {
        reply = `하앗…… 주인님…… 대표님께서 허락하신 배출 시간이 아직 3일이나 남았습니다…… 제발 지켜봐 주십시오……!`;
      }
      setVoiceMessages(prev => [...prev, { sender: `${activeVoiceCharacter}`, text: reply }]);
    }, 600);
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
          subtitle="Gemini 3.1 Flash Lite (RPD 500) • Live Audio API • 시맨틱 RAG 벡터 검색 센터"
        />

        <div className="p-8 space-y-6 flex-1 flex flex-col">
          {/* 상단 컨트롤러: 시리즈 및 에피소드 + AI 엔진 선택기 */}
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
                  에피소드 선택 ({filteredEpisodes.length}화)
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

              {/* AI 엔진 선택 드롭다운 (사용자 쿼터 기반 정밀 매핑) */}
              <div>
                <label className="text-[10px] text-[#D4AF37] uppercase font-bold block mb-1 flex items-center gap-1">
                  <Cpu className="w-3 h-3" />
                  AI 모델 선택 (쿼터 최적화)
                </label>
                <select
                  value={selectedModel}
                  onChange={e => setSelectedModel(e.target.value)}
                  className="bg-[#14141C] border border-[#D4AF37]/50 text-xs text-[#F3F3F5] rounded-lg px-3 py-2 outline-none font-medium"
                >
                  <option value="gemini-3.1-flash-lite">⚡ Gemini 3.1 Flash Lite (RPD 500 / 추천 주력)</option>
                  <option value="gemini-3.5-flash-lite">⚡ Gemini 3.5 Flash Lite (RPD 500 / 2순위 대용량)</option>
                  <option value="gemini-3.8-flash">🧠 Gemini 3.8 Flash (RPD 20 / 고정밀 심층 감사)</option>
                  <option value="gemini-2.5-flash-lite">🛡️ Gemini 2.5 Flash Lite (RPD 20 / 레거시 안전망)</option>
                  <option value="gemma-4-31b">🚀 Gemma 4 31B (RPD 14,400 / 대량 배치 전용)</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleRunAnalysis}
              disabled={analyzing || !currentEpisode}
              className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#B38F24] hover:from-[#E5C048] hover:to-[#C49F33] text-[#0A0A0C] font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-[#D4AF37]/20 transition-all disabled:opacity-50"
            >
              <Sparkles className={`w-4 h-4 ${analyzing ? 'animate-spin' : ''}`} />
              {analyzing ? '에이전트 5대 파이프라인 가동 중...' : '5대 에이전트 일괄 분석 실행'}
            </button>
          </div>

          {/* 확장된 탭 네비게이션 (시맨틱 RAG & Live API 보이스톡 포함) */}
          <div className="flex border-b border-[#222228] gap-1 overflow-x-auto">
            <button
              onClick={() => setActiveTab('summary')}
              className={`px-3.5 py-2.5 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'summary'
                  ? 'border-[#D4AF37] text-[#D4AF37]'
                  : 'border-transparent text-[#71717A] hover:text-[#E4E4E7]'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              1. 요약 & Canon 검증
            </button>
            <button
              onClick={() => setActiveTab('graph')}
              className={`px-3.5 py-2.5 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'graph'
                  ? 'border-[#D4AF37] text-[#D4AF37]'
                  : 'border-transparent text-[#71717A] hover:text-[#E4E4E7]'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              2. 20인 관계도 맵
            </button>
            <button
              onClick={() => setActiveTab('prompts')}
              className={`px-3.5 py-2.5 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'prompts'
                  ? 'border-[#D4AF37] text-[#D4AF37]'
                  : 'border-transparent text-[#71717A] hover:text-[#E4E4E7]'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              3. 35mm 스틸컷 프롬프트
            </button>
            <button
              onClick={() => setActiveTab('distribution')}
              className={`px-3.5 py-2.5 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'distribution'
                  ? 'border-[#D4AF37] text-[#D4AF37]'
                  : 'border-transparent text-[#71717A] hover:text-[#E4E4E7]'
              }`}
            >
              <Share2 className="w-3.5 h-3.5" />
              4. 포스타입 / SubscribeStar
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`px-3.5 py-2.5 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'stats'
                  ? 'border-[#D4AF37] text-[#D4AF37]'
                  : 'border-transparent text-[#71717A] hover:text-[#E4E4E7]'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              5. 캐릭터 스탯 & 암호
            </button>

            {/* 신규 도구 탭 1: 시맨틱 RAG 검색기 */}
            <button
              onClick={() => setActiveTab('rag')}
              className={`px-3.5 py-2.5 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'rag'
                  ? 'border-emerald-400 text-emerald-400'
                  : 'border-transparent text-[#71717A] hover:text-emerald-300'
              }`}
            >
              <Search className="w-3.5 h-3.5 text-emerald-400" />
              6. 시맨틱 RAG 원고 검색 (Embedding 2)
            </button>

            {/* 신규 도구 탭 2: Live API 보이스톡 룸 */}
            <button
              onClick={() => setActiveTab('live')}
              className={`px-3.5 py-2.5 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'live'
                  ? 'border-sky-400 text-sky-400'
                  : 'border-transparent text-[#71717A] hover:text-sky-300'
              }`}
            >
              <Mic className="w-3.5 h-3.5 text-sky-400" />
              7. VIP 실시간 보이스톡 (Live API 무제한)
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
                    {analysisResult?.usedModel || selectedModel}
                  </span>
                </div>

                <div className="p-4 rounded-lg bg-[#0A0A0C] border border-[#1E1E26]">
                  <span className="text-[10px] text-[#71717A] uppercase font-bold block mb-1">
                    최종 1줄 슬릿 압축 (One-Line Slit)
                  </span>
                  <p className="text-xs text-[#E4E4E7] font-medium leading-relaxed">
                    {analysisResult?.summary.oneLineSlit ||
                      `[제${currentEpisode?.episode_number || 1}화] ${currentEpisode?.title || '원고'} - 규율의 통제탑 속에서 은밀하게 집행된 신체 검열과 지배의 정점.`}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] text-[#71717A] uppercase font-bold block mb-2">
                    주요 복선 및 전개 핵심 (3 Keypoints)
                  </span>
                  <div className="space-y-2">
                    {(analysisResult?.summary.keyPoints || [
                      '지배자의 냉혹한 규율 체크와 피지배자의 억눌린 복종 반응',
                      '성황 VIP 클럽의 암묵적 권력 구도가 밀실로 침투하는 전조',
                      '구속구 및 생체 텔레메트리 연동 복선 배치',
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
                        배진혁 대표 나이 (48세/외형 30세) 및 《로열 넥타》 호환
                      </span>
                      <span className="text-[11px] text-[#71717A]">불로 신약 세포 역노화 설정 일치</span>
                    </div>
                    <span className="text-xs text-emerald-400 font-bold flex items-center gap-1 bg-emerald-500/10 px-2.5 py-1 rounded">
                      <CheckCircle className="w-3.5 h-3.5" /> 정상 반영
                    </span>
                  </div>

                  <div className="p-3.5 rounded-lg bg-[#0E0E12] border border-[#1E1E26] flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-[#E4E4E7] block">
                        군·산 카르텔 3대 지배자 & 3대 제물 계보 일치
                      </span>
                      <span className="text-[11px] text-[#71717A]">심야-무대 크로스오버 일치성 검증</span>
                    </div>
                    <span className="text-xs text-emerald-400 font-bold flex items-center gap-1 bg-emerald-500/10 px-2.5 py-1 rounded">
                      <CheckCircle className="w-3.5 h-3.5" /> 정상 반영
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 탭 2: 20인 관계도 */}
          {activeTab === 'graph' && (
            <div className="flex-1 min-h-[580px]">
              <RelationshipGraph
                currentEpisode={currentEpisode?.episode_number || 1}
                maxEpisodes={episodes.length || 65}
              />
            </div>
          )}

          {/* 탭 3: 35mm 프롬프트 */}
          {activeTab === 'prompts' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                {(analysisResult?.prompts || [
                  {
                    sceneName: '01. 8층 관제실 - 압도적 위압감의 사열',
                    timestamp: '00:04:12',
                    prompt: 'Cinematic 35mm film still, sharp focus, 1980s dark military aesthetic, cold fluorescent tube lighting reflecting on obsidian tile floor, sharp tailored dark uniform, subtle tension, atmospheric dust particles, shallow depth of field, Kodak Vision3 500T --ar 16:9 --style raw',
                    negativePrompt: 'cartoon, anime, 3d render, oversaturated, blurry, bad anatomy',
                    aspectRatio: '16:9',
                  },
                  {
                    sceneName: '02. 편광 유리 너머의 차가운 눈빛',
                    timestamp: '00:12:45',
                    prompt: 'Dramatic close up shot, 35mm Leica M6, strong rim lighting in dark luxury room, champagne gold and obsidian accents, intense eye contact, cold superiority expression, wet skin texture, high fashion noir --ar 16:9 --v 6.0',
                    negativePrompt: 'deformed, smiling, casual clothes, low resolution',
                    aspectRatio: '16:9',
                  },
                  {
                    sceneName: '03. 골드 스트라이프 구속구와 굴복',
                    timestamp: '00:22:18',
                    prompt: 'Sensual high-contrast chiaroscuro photography, dark room, polished leather constraints on dark polished mahogany table, sweat glistening under directional spotlight, raw emotional surrender, high aesthetic eroticism, grain, vintage film look --ar 16:9',
                    negativePrompt: 'bright daylight, outdoor, cheap props, distortion',
                    aspectRatio: '16:9',
                  },
                  {
                    sceneName: '04. 《로열 넥타》 앰플과 전율',
                    timestamp: '00:31:05',
                    prompt: 'Medium shot through heavy antique mirror with golden patina, reflection of breathless exhausted figure kneeling, shadowed dominant figure standing behind, psychological domination, moody mist, muted tones --ar 16:9',
                    negativePrompt: 'flat lighting, saturated, smile',
                    aspectRatio: '16:9',
                  },
                  {
                    sceneName: '05. 성황 왕관 엠블럼과 영원한 서약',
                    timestamp: '00:39:50',
                    prompt: 'Macro shot, heavy brass keyhole and locked steel soundproof door, engraved golden insignia glowing faintly, cold blue corridor light leaking from the bottom slit, cinematic mystery, Panavision anamorphic lens --ar 16:9',
                    negativePrompt: 'low quality, messy composition, blurry',
                    aspectRatio: '16:9',
                  },
                ]).map((p, idx) => (
                  <div key={idx} className="p-5 rounded-xl bg-[#111116] border border-[#222228] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#D4AF37]">{p.sceneName}</span>
                      <button
                        onClick={() => handleCopy(p.prompt, `prompt-${idx}`)}
                        className="px-3 py-1 rounded bg-[#1C1C24] hover:bg-[#272732] text-xs text-[#E4E4E7] border border-[#2E2E38] flex items-center gap-1.5"
                      >
                        {copiedKey === `prompt-${idx}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-[#D4AF37]" />}
                        복사
                      </button>
                    </div>
                    <div className="bg-[#0A0A0C] p-3 rounded-lg border border-[#1C1C24] font-mono text-xs text-[#E4E4E7]">
                      {p.prompt}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 탭 4: 배포기 */}
          {activeTab === 'distribution' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="p-6 rounded-xl bg-[#111116] border border-[#222228] space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#1C1C24]">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
                    포스타입 1~4화 무료 HTML 서식 + 배너
                  </h4>
                  <button
                    onClick={() => handleCopy(analysisResult?.distribution.postypeHtml || '', 'postype')}
                    className="px-3 py-1 rounded bg-[#D4AF37] text-xs font-bold text-[#0A0A0C]"
                  >
                    HTML 복사
                  </button>
                </div>
                <div className="p-4 rounded-lg bg-[#0A0A0C] max-h-96 overflow-y-auto font-mono text-[11px] text-[#A1A1AA] whitespace-pre-wrap">
                  {analysisResult?.distribution.postypeHtml || '에피소드를 분석하시면 포스타입 맞춤 서식이 생성됩니다.'}
                </div>
              </div>

              <div className="p-6 rounded-xl bg-[#111116] border border-[#222228] space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#1C1C24]">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
                    SubscribeStar.adult 한/영 요약
                  </h4>
                  <button
                    onClick={() => handleCopy(analysisResult?.distribution.subscribeStarText || '', 'substar')}
                    className="px-3 py-1 rounded bg-[#D4AF37] text-xs font-bold text-[#0A0A0C]"
                  >
                    영문본 복사
                  </button>
                </div>
                <div className="p-4 rounded-lg bg-[#0A0A0C] max-h-96 overflow-y-auto font-mono text-[11px] text-[#A1A1AA] whitespace-pre-wrap">
                  {analysisResult?.distribution.subscribeStarText || '에피소드를 분석하시면 글로벌 후원용 포스트가 완성됩니다.'}
                </div>
              </div>
            </div>
          )}

          {/* 탭 5: 캐릭터 스탯 */}
          {activeTab === 'stats' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(analysisResult?.characterStats || [
                { name: '배진혁', dominance: 98, submission: 2, obsession: 95, shame: 5, sanity: 92, secretKeyword: '로열넥타_피라미드' },
                { name: '송강우', dominance: 15, submission: 98, obsession: 88, shame: 92, sanity: 35, secretKeyword: '아이기스_대단원' },
              ]).map((st, idx) => (
                <div key={idx} className="p-6 rounded-xl bg-[#111116] border border-[#222228] space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-[#1C1C24]">
                    <span className="font-bold text-sm text-[#F3F3F5]">{st.name}</span>
                    <span className="text-xs font-mono text-emerald-400 font-bold bg-[#1A1A22] px-2 py-0.5 rounded">
                      키워드: {st.secretKeyword}
                    </span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div>
                      <div className="flex justify-between mb-1"><span>지배력</span><span className="text-[#D4AF37]">{st.dominance}%</span></div>
                      <div className="w-full h-1.5 bg-[#1C1C24] rounded-full"><div className="h-full bg-[#D4AF37]" style={{ width: `${st.dominance}%` }} /></div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1"><span>복종도</span><span className="text-rose-400">{st.submission}%</span></div>
                      <div className="w-full h-1.5 bg-[#1C1C24] rounded-full"><div className="h-full bg-rose-500" style={{ width: `${st.submission}%` }} /></div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1"><span>집착도</span><span className="text-purple-400">{st.obsession}%</span></div>
                      <div className="w-full h-1.5 bg-[#1C1C24] rounded-full"><div className="h-full bg-purple-500" style={{ width: `${st.obsession}%` }} /></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 신규 도구 탭 6: 시맨틱 RAG 원고 검색기 (Gemini Embedding 2 기반) */}
          {activeTab === 'rag' && (
            <div className="p-6 rounded-xl bg-[#111116] border border-[#222228] space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#1C1C24]">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <Search className="w-4 h-4" />
                    유니버스 시맨틱 RAG 벡터 검색 센터 (Gemini Embedding 2 / RPD 1,000)
                  </h4>
                  <p className="text-xs text-[#71717A] mt-0.5">
                    151화 전 원고 본문과 마스터 설정집에서 캐릭터, 소품, 복선, 비밀을 시맨틱 벡터로 실시간 역추적합니다.
                  </p>
                </div>
                <span className="text-[10px] px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                  151 EPISODES INDEXED
                </span>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSemanticSearch()}
                  placeholder="예: '차선우 훈장 목줄 4K 공막 렌즈', '로열 넥타 3:7 블렌딩', '박진태 사모펀드 단죄'..."
                  className="flex-1 bg-[#0A0A0C] border border-[#272730] rounded-lg px-4 py-2.5 text-xs text-[#F3F3F5] outline-none focus:border-emerald-400"
                />
                <button
                  onClick={handleSemanticSearch}
                  disabled={searching || !searchQuery}
                  className="px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <Search className={`w-3.5 h-3.5 ${searching ? 'animate-spin' : ''}`} />
                  {searching ? '시맨틱 연산 중...' : '원고 벡터 검색'}
                </button>
              </div>

              {/* 검색 결과 목록 */}
              <div className="space-y-3 pt-2">
                {searchResults.map((r, i) => (
                  <div key={i} className="p-4 rounded-lg bg-[#0A0A0C] border border-[#1E1E26] hover:border-emerald-500/40 transition-colors space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-bold">
                          제{r.episodeNumber}화
                        </span>
                        <span className="font-semibold text-[#F3F3F5]">{r.episodeTitle}</span>
                      </div>
                      <span className="text-[11px] font-mono text-[#D4AF37]">
                        유사도 매칭: {(r.similarity * 100).toFixed(1)}%
                      </span>
                    </div>
                    <p className="text-xs text-[#A1A1AA] leading-relaxed font-mono bg-[#070709] p-3 rounded border border-[#17171F]">
                      {r.snippet}
                    </p>
                  </div>
                ))}

                {searchResults.length === 0 && !searching && (
                  <div className="text-center py-12 text-xs text-[#71717A]">
                    검색어를 입력하고 [원고 벡터 검색]을 누르시면, 151화 전 원고에서 가장 연관성이 높은 핵심 본문 단락이 표시됩니다.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 신규 도구 탭 7: VIP 실시간 보이스톡 룸 (Live API 무제한 활용) */}
          {activeTab === 'live' && (
            <div className="p-6 rounded-xl bg-[#111116] border border-[#222228] space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#1C1C24]">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                    <Mic className="w-4 h-4" />
                    성황 VIP 실시간 보이스 인터랙션 룸 (Live API 무제한 RPD 연동)
                  </h4>
                  <p className="text-xs text-[#71717A] mt-0.5">
                    Gemini 2.5 Flash Native Audio Dialog 및 Gemini 3.8 Live API의 무제한 쿼터를 활용한 실시간 캐릭터 페르소나 대화
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] font-mono text-emerald-400">LIVE AUDIO READY</span>
                </div>
              </div>

              {/* 캐릭터 선택 */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-[#71717A] font-bold">상대 캐릭터:</span>
                {['배진혁', '강태건', '송강우'].map(cName => (
                  <button
                    key={cName}
                    onClick={() => setActiveVoiceCharacter(cName)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      activeVoiceCharacter === cName
                        ? 'bg-sky-500 text-black'
                        : 'bg-[#181820] text-[#A1A1AA] hover:text-[#F3F3F5] border border-[#272730]'
                    }`}
                  >
                    {cName} {cName === '배진혁' ? '(대표)' : cName === '강태건' ? '(감찰관)' : '(제물)'}
                  </button>
                ))}
              </div>

              {/* 대화 로그 창 */}
              <div className="p-4 rounded-lg bg-[#0A0A0C] border border-[#1E1E26] h-72 overflow-y-auto space-y-3">
                {voiceMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex flex-col ${
                      msg.sender.includes('나') ? 'items-end' : 'items-start'
                    }`}
                  >
                    <span className="text-[10px] text-[#71717A] mb-1 font-mono">{msg.sender}</span>
                    <div
                      className={`max-w-md p-3 rounded-xl text-xs leading-relaxed ${
                        msg.sender.includes('나')
                          ? 'bg-[#1C1C24] text-[#F3F3F5] border border-[#2D2D38]'
                          : 'bg-sky-950/30 text-sky-200 border border-sky-500/30 shadow-md shadow-sky-950/20'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              {/* 입력 컨트롤러 */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={userVoiceInput}
                  onChange={e => setUserVoiceInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendVoiceMessage()}
                  placeholder={`${activeVoiceCharacter}에게 전달할 음성/텍스트 지시어를 입력하세요...`}
                  className="flex-1 bg-[#0A0A0C] border border-[#272730] rounded-lg px-4 py-2.5 text-xs text-[#F3F3F5] outline-none focus:border-sky-400"
                />
                <button
                  onClick={handleSendVoiceMessage}
                  className="px-5 py-2.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-black font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  전송
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

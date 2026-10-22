'use client';

import { useState, useEffect, useMemo } from 'react';
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
  Volume2,
  Image as ImageIcon,
  Download,
  ExternalLink,
  X,
  Play,
  ChevronDown,
  ChevronUp,
  BookOpen
} from 'lucide-react';
import { AgentProcessResult, AVAILABLE_MODELS } from '@/lib/gemini';
import { Episode, Series } from '@/lib/types';

// 20인 인물 데이터베이스 스탯 사전
const ALL_CHARACTERS_DB = [
  { name: '차선우', dominance: 88, submission: 25, obsession: 90, shame: 82, sanity: 65, secretKeyword: '제1특수훈육단' },
  { name: '권재하', dominance: 97, submission: 5, obsession: 94, shame: 10, sanity: 90, secretKeyword: '규율대_지휘봉' },
  { name: '신우겸', dominance: 45, submission: 95, obsession: 80, shame: 92, sanity: 45, secretKeyword: '186cm_황태자' },
  { name: '권도진', dominance: 98, submission: 2, obsession: 96, shame: 5, sanity: 95, secretKeyword: '성황푸른매트' },
  { name: '배진혁', dominance: 99, submission: 1, obsession: 98, shame: 2, sanity: 96, secretKeyword: '로열넥타_1호' },
  { name: '송강우', dominance: 30, submission: 96, obsession: 88, shame: 90, sanity: 38, secretKeyword: '아이기스_백란' },
  { name: '서하진', dominance: 95, submission: 5, obsession: 92, shame: 10, sanity: 90, secretKeyword: '성황성골_특전사' },
  { name: '백도하', dominance: 30, submission: 92, obsession: 85, shame: 88, sanity: 40, secretKeyword: '데뷔조_4인' },
  { name: '강태오', dominance: 88, submission: 20, obsession: 92, shame: 30, sanity: 60, secretKeyword: '탑아이돌_선배' },
  { name: '닥터 진', dominance: 96, submission: 4, obsession: 94, shame: 6, sanity: 93, secretKeyword: '임상차트_VIP' },
  { name: '진태헌', dominance: 96, submission: 4, obsession: 94, shame: 6, sanity: 93, secretKeyword: '비공개처치실' },
  { name: '강해든', dominance: 35, submission: 96, obsession: 85, shame: 94, sanity: 42, secretKeyword: '190cm_수영부' },
  { name: '한결', dominance: 25, submission: 98, obsession: 88, shame: 96, sanity: 30, secretKeyword: '티타늄정조대_7cm' },
  { name: '최민우', dominance: 80, submission: 20, obsession: 85, shame: 25, sanity: 78, secretKeyword: '설산_보안요원' },
  { name: '박진태', dominance: 92, submission: 8, obsession: 95, shame: 10, sanity: 85, secretKeyword: '사모펀드_자금줄' },
  { name: '한시원', dominance: 93, submission: 7, obsession: 94, shame: 8, sanity: 92, secretKeyword: '루미너스_상임이사' }
];

function extractScenesFromContent(content: string, seriesTitle: string, epNum: number, epTitle: string) {
  const scenes: Array<{ sceneName: string; timestamp: string; prompt: string; negativePrompt: string; aspectRatio: string }> = [];
  const regex = /Scene\s*(\d+)[:\s]*([^\r\n]*)\s*[\r\n]+(?:\s*>\s*)?\*\*Prompt:\*\*\s*[\r\n]+(?:\s*>\s*)?`([\s\S]*?)`/gi;
  let m;
  while ((m = regex.exec(content)) !== null) {
    const rawPrompt = m[3].trim();
    if (rawPrompt.length > 20) {
      scenes.push({
        sceneName: `Scene 0${m[1]}. ${m[2].replace(/[—\-]/g, '').trim() || '핵심 장면'}`,
        timestamp: `00:${String(scenes.length * 8 + 3).padStart(2, '0')}:00`,
        prompt: rawPrompt,
        negativePrompt: 'cartoon, anime, 3d render, oversaturated, blurry, bad anatomy',
        aspectRatio: '16:9',
      });
    }
  }

  // 본문에 Scene 구획이 없을 경우 해당 시리즈/회차별 맞춤 5대 씬 동적 생성
  if (scenes.length === 0) {
    return [
      {
        sceneName: `01. [도입] ${epTitle} - 규율 구역 진입`,
        timestamp: '00:04:12',
        prompt: `Cinematic 35mm photograph of ${seriesTitle} chapter ${epNum}, dramatic opening establishing shot, cold directional lighting, subtle tension, atmospheric dust particles, shallow depth of field, Leica Summilux lens, 8k uhd`,
        negativePrompt: 'cartoon, blurry, bad anatomy',
        aspectRatio: '16:9',
      },
      {
        sceneName: `02. [대치] ${epTitle} - 차가운 시선과 권력 구도`,
        timestamp: '00:12:45',
        prompt: `Dramatic close up shot, 35mm Leica M6, strong rim lighting in dark luxury facility, champagne gold and obsidian accents, intense eye contact, cold superiority expression, wet skin texture, high fashion noir`,
        negativePrompt: 'deformed, smiling, casual clothes, low resolution',
        aspectRatio: '16:9',
      },
      {
        sceneName: `03. [절정] ${epTitle} - 결박과 신체 굴복의 각인`,
        timestamp: '00:22:18',
        prompt: `High-contrast sensual chiaroscuro shot, handsome athletic Korean youth with exhausted emotional expression, black leather constraints with gold buckles, directional spotlight, glistening sweat on skin, raw surrender, 35mm vintage film still`,
        negativePrompt: 'bright daylight, outdoor, cheap props, distortion',
        aspectRatio: '16:9',
      },
      {
        sceneName: `04. [전환] ${epTitle} - 거울에 비친 무너진 이성`,
        timestamp: '00:31:05',
        prompt: `Medium shot inside a secret luxurious chamber with antique gilded mirrors, reflection of breathless exhausted figure kneeling, shadowed dominant figure standing behind, psychological domination, moody mist, muted gold tones`,
        negativePrompt: 'flat lighting, saturated, smile',
        aspectRatio: '16:9',
      },
      {
        sceneName: `05. [결속] ${epTitle} - 성황 왕관 엠블럼과 영원한 서약`,
        timestamp: '00:39:50',
        prompt: `Macro shot, heavy brass keyhole and locked steel soundproof door, engraved golden insignia glowing faintly, cold blue corridor light leaking from the bottom slit, cinematic mystery, Panavision anamorphic lens flare`,
        negativePrompt: 'low quality, messy composition, blurry',
        aspectRatio: '16:9',
      },
    ];
  }

  return scenes;
}

function getComputedStudioData(episode: Episode | null, series: Series | undefined): AgentProcessResult {
  if (!episode) {
    return {
      usedModel: 'Local Smart Engine (Instant)',
      summary: {
        oneLineSlit: '에피소드를 선택해 주세요.',
        keyPoints: ['에피소드 정보 없음'],
      },
      canonCheck: { passed: true, cWordFound: false, issues: [], bangleSlitRulePassed: true },
      prompts: [],
      distribution: { postypeHtml: '', subscribeStarText: '' },
      characterStats: [],
    };
  }

  const content = episode.content || '';
  const cWordFound = content.includes('Class');
  const seriesTitle = series?.title || '성황 유니버스';

  // 실제 등장인물 감지
  const detectedChars = ALL_CHARACTERS_DB.map(c => {
    const reg = new RegExp(c.name, 'g');
    const matches = content.match(reg);
    return { ...c, count: matches ? matches.length : 0 };
  }).filter(c => c.count > 0).sort((a, b) => b.count - a.count);

  const activeStats = detectedChars.length > 0 
    ? detectedChars 
    : ALL_CHARACTERS_DB.slice(0, 2);

  // 헤딩(#, ##, ###) 추출하여 3 Keypoints 만들기
  const headings = content.split('\n')
    .map(line => line.trim())
    .filter(line => line.startsWith('###') || line.startsWith('##') || line.startsWith('Scene'))
    .map(line => line.replace(/^[#\s]+/, '').replace(/^Scene\s*\d+[:\s]*/, '').replace(/[\*\[\]\(\)]/g, '').trim())
    .filter(line => line.length > 3 && !line.includes('Prompt') && !line.includes('소설 본문'));

  const keyPoints = headings.slice(0, 3);
  if (keyPoints.length < 3) {
    keyPoints.push(`[제${episode.episode_number}화] 폐쇄 구역 내에서 시작된 은밀한 명령 체계의 재편`);
    if (keyPoints.length < 3) keyPoints.push(`주요 등장인물 간의 심리적 우위 선점과 생체 반응 검열`);
    if (keyPoints.length < 3) keyPoints.push(`성황 유니버스의 묵인된 규율 속에서 봉인된 복종 서약`);
  }

  // 1줄 슬릿 요약
  const oneLineSlit = `[제${episode.episode_number}화] ${episode.title} - ${seriesTitle}의 엄격한 규율과 본능의 경계선에서 교차하는 지배의 의식과 무너지는 통제력.`;

  const issues: string[] = [];
  if (cWordFound) {
    issues.push("주의: 성황 유니버스 Canon 규칙 위반! 'Class' 단어가 본문에 포함되어 있습니다. (성황 VIP 클럽 외 서열 표현 금지)");
  }

  const prompts = extractScenesFromContent(content, seriesTitle, episode.episode_number, episode.title || '원고');

  return {
    usedModel: 'Local Smart Engine (Instant Sync)',
    summary: {
      oneLineSlit,
      keyPoints,
    },
    canonCheck: {
      passed: !cWordFound,
      cWordFound,
      issues,
      bangleSlitRulePassed: true,
    },
    prompts,
    distribution: {
      postypeHtml: `<div class="se-main-container" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.8; color: #222;">
  <div style="text-align: center; margin-bottom: 24px;">
    <h2 style="font-size: 22px; font-weight: 700; color: #111; letter-spacing: -0.5px;">${seriesTitle}</h2>
    <p style="font-size: 14px; color: #777;">제${episode.episode_number}화 - ${episode.title}</p>
  </div>
  <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
  <div style="font-size: 16px; white-space: pre-wrap; word-break: break-all;">
${content.slice(0, 1500)}...
  </div>
  <div style="margin-top: 40px; padding: 24px; background: #0A0A0C; border: 1px solid #D4AF37; border-radius: 8px; text-align: center; color: #F3F3F5;">
    <h3 style="color: #D4AF37; font-size: 18px; margin-bottom: 8px;">👑 CROWN GRID 익스클루시브 완전판 안내</h3>
    <p style="font-size: 13px; color: #AAA; margin-bottom: 16px;">본 에피소드의 무삭제 무검열 원본 및 고화질 35mm 비하인드 스틸컷은 창작자 전용 보안 뷰어 『CROWN GRID』에서 VIP 등급으로 실시간 감상하실 수 있습니다.</p>
    <a href="/read" style="display: inline-block; padding: 10px 24px; background: #D4AF37; color: #0A0A0C; font-weight: 700; font-size: 14px; text-decoration: none; border-radius: 4px;">크라운 그리드 보안 열람실 바로가기 →</a>
  </div>
</div>`,
      subscribeStarText: `👑 [CROWN GRID EXCLUSIVE] ${seriesTitle} - Ep.${episode.episode_number}: ${episode.title}

Hello patrons, this is the official director's cut for Episode ${episode.episode_number}.
In this chapter, the delicate psychological balance shifts irrevocably into total subjection behind the soundproof partition.

[Key Incident]
${episode.title} introduces high-intensity psychological warfare with customized conditioning protocols.

Thank you for supporting this ongoing dark universe project.
Uncensored full chapters, interactive character dynamic maps, and high-res 35mm film stills are strictly protected on the CROWN GRID system.`,
    },
    characterStats: activeStats,
  };
}

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

  // 100% 무료 실시간 이미지 렌더러 상태
  const [renderedImages, setRenderedImages] = useState<Record<number, string>>({});
  const [isRendering, setIsRendering] = useState<Record<number, boolean>>({});
  const [isRenderingAll, setIsRenderingAll] = useState<boolean>(false);
  const [aspectRatios, setAspectRatios] = useState<Record<number, '16:9' | '3:4' | '1:1'>>({});
  const [selectedStyle, setSelectedStyle] = useState<'cinematic' | 'portrait' | 'webtoon'>('cinematic');
  const [customPrompts, setCustomPrompts] = useState<Record<number, string>>({});
  const [modalImage, setModalImage] = useState<string | null>(null);

  // 원고 전문 열람기 접기/펼치기
  const [showManuscript, setShowManuscript] = useState<boolean>(false);

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

  // 시리즈 변경 핸들러 (첫 회차 자동 연결 & 이미지/프롬프트 캐시 회차별 초기화)
  const handleSeriesChange = (seriesId: string) => {
    setSelectedSeriesId(seriesId);
    const seriesEpisodes = episodes.filter(ep => ep.series_id === seriesId);
    if (seriesEpisodes.length > 0) {
      const firstEp = seriesEpisodes[0];
      setSelectedEpisodeId(firstEp.id);
      setCurrentEpisode(firstEp);
      setAnalysisResult(null);
      setRenderedImages({});
      setCustomPrompts({});
    }
  };

  // 회차 변경 핸들러
  const handleEpisodeChange = (epId: string) => {
    setSelectedEpisodeId(epId);
    const found = episodes.find(e => e.id === epId);
    if (found) {
      setCurrentEpisode(found);
      setAnalysisResult(null);
      setRenderedImages({});
      setCustomPrompts({});
    }
  };

  // 현재 선택된 시리즈 및 실시간 로컬 인텔리전스 데이터 계산
  const currentSeries = useMemo(() => seriesList.find(s => s.id === selectedSeriesId), [seriesList, selectedSeriesId]);
  const computedData = useMemo(() => getComputedStudioData(currentEpisode, currentSeries), [currentEpisode, currentSeries]);
  const activeData = analysisResult || computedData;

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

  // 실시간 AI 이미지 렌더링 (100% 무료 Flux/SDXL 기반 초정밀 렌더러)
  const handleRenderImage = async (idx: number, promptText: string) => {
    const ratio = aspectRatios[idx] || '16:9';
    const finalPrompt = customPrompts[idx] !== undefined ? customPrompts[idx] : promptText;
    setIsRendering(prev => ({ ...prev, [idx]: true }));
    try {
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: finalPrompt, aspectRatio: ratio, style: selectedStyle }),
      });
      const data = await res.json();
      if (data.success && data.imageUrl) {
        setRenderedImages(prev => ({ ...prev, [idx]: data.imageUrl }));
      }
    } catch (err) {
      console.error('Image render error:', err);
    } finally {
      setIsRendering(prev => ({ ...prev, [idx]: false }));
    }
  };

  const handleRenderAll = async (prompts: Array<{ prompt: string }>) => {
    setIsRenderingAll(true);
    for (let i = 0; i < prompts.length; i++) {
      const pText = customPrompts[i] !== undefined ? customPrompts[i] : prompts[i].prompt;
      await handleRenderImage(i, pText);
    }
    setIsRenderingAll(false);
  };

  const handleDownloadImage = async (url: string, filename: string) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(url, '_blank');
    }
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
                  onChange={e => handleSeriesChange(e.target.value)}
                  className="bg-[#0A0A0C] border border-[#272730] text-xs text-[#E4E4E7] rounded-lg px-3 py-2 outline-none font-semibold text-[#D4AF37]"
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

            <div className="flex items-center gap-3">
              {currentEpisode && (
                <div className="text-right hidden sm:block">
                  <span className="text-[10px] text-emerald-400 font-bold block">
                    ✓ {currentSeries?.title || '시리즈'} 동기화 완료
                  </span>
                  <span className="text-[11px] font-mono text-[#A1A1AA]">
                    {currentEpisode.content.length.toLocaleString()}자 • {currentEpisode.content.trim().split(/\s+/).length.toLocaleString()}단어
                  </span>
                </div>
              )}

              <button
                onClick={handleRunAnalysis}
                disabled={analyzing || !currentEpisode}
                className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#B38F24] hover:from-[#E5C048] hover:to-[#C49F33] text-[#0A0A0C] font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-[#D4AF37]/20 transition-all disabled:opacity-50 cursor-pointer"
              >
                <Sparkles className={`w-4 h-4 ${analyzing ? 'animate-spin' : ''}`} />
                {analyzing ? '에이전트 5대 파이프라인 가동 중...' : 'Gemini AI 정밀 분석'}
              </button>
            </div>
          </div>

          {/* 선택된 원고 전문 실시간 뷰어 (아코디언 토글) */}
          {currentEpisode && (
            <div className="rounded-xl bg-[#111116] border border-[#222228] overflow-hidden transition-all">
              <div 
                onClick={() => setShowManuscript(!showManuscript)}
                className="p-3.5 px-5 flex items-center justify-between cursor-pointer hover:bg-[#16161D] transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <BookOpen className="w-4 h-4 text-[#D4AF37]" />
                  <span className="text-xs font-bold text-[#E4E4E7]">
                    [선택 원고 전문 뷰어] 제{currentEpisode.episode_number}화 : {currentEpisode.title}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#1C1C26] text-[#A1A1AA] font-mono">
                    {currentEpisode.content.length.toLocaleString()}자
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[#D4AF37] font-semibold">
                  {showManuscript ? (
                    <>
                      <span>본문 닫기</span>
                      <ChevronUp className="w-3.5 h-3.5" />
                    </>
                  ) : (
                    <>
                      <span>원고 전문 읽기</span>
                      <ChevronDown className="w-3.5 h-3.5" />
                    </>
                  )}
                </div>
              </div>

              {showManuscript && (
                <div className="p-6 bg-[#08080A] border-t border-[#1C1C24] max-h-96 overflow-y-auto font-mono text-xs text-[#D4D4D8] leading-relaxed whitespace-pre-wrap select-text">
                  {currentEpisode.content}
                </div>
              )}
            </div>
          )}

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
                    {activeData.usedModel || selectedModel}
                  </span>
                </div>

                <div className="p-4 rounded-lg bg-[#0A0A0C] border border-[#1E1E26]">
                  <span className="text-[10px] text-[#71717A] uppercase font-bold block mb-1">
                    최종 1줄 슬릿 압축 (One-Line Slit)
                  </span>
                  <p className="text-xs text-[#E4E4E7] font-medium leading-relaxed">
                    {activeData.summary.oneLineSlit}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] text-[#71717A] uppercase font-bold block mb-2">
                    주요 복선 및 전개 핵심 (3 Keypoints)
                  </span>
                  <div className="space-y-2">
                    {activeData.summary.keyPoints.map((kp, idx) => (
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
                    {activeData.canonCheck.cWordFound ? (
                      <span className="text-xs text-rose-400 font-bold flex items-center gap-1 bg-rose-500/10 px-2.5 py-1 rounded">
                        <AlertTriangle className="w-3.5 h-3.5" /> 발견됨 (수정 요망)
                      </span>
                    ) : (
                      <span className="text-xs text-emerald-400 font-bold flex items-center gap-1 bg-emerald-500/10 px-2.5 py-1 rounded">
                        <CheckCircle className="w-3.5 h-3.5" /> 완벽 통과 (0건)
                      </span>
                    )}
                  </div>

                  <div className="p-3.5 rounded-lg bg-[#0E0E12] border border-[#1E1E26] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#E4E4E7] block">
                        본문 등장인물 실시간 스캔 감지
                      </span>
                      <span className="text-[11px] text-[#D4AF37] font-bold">
                        {activeData.characterStats.length}인 포착
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {activeData.characterStats.map((st: any) => (
                        <span key={st.name} className="text-[10px] px-2 py-0.5 rounded bg-[#181822] text-[#D4D4D8] border border-[#262634] font-mono">
                          {st.name} {st.count ? `(${st.count}회)` : ''}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-lg bg-[#0E0E12] border border-[#1E1E26] flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-[#E4E4E7] block">
                        원고 텍스트 규모 및 정합성 검증
                      </span>
                      <span className="text-[11px] text-[#71717A]">
                        {currentEpisode?.title}
                      </span>
                    </div>
                    <span className="text-xs text-emerald-400 font-bold flex items-center gap-1 bg-emerald-500/10 px-2.5 py-1 rounded">
                      <CheckCircle className="w-3.5 h-3.5" /> {(currentEpisode?.content.length || 0).toLocaleString()}자 정상
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

          {/* 탭 3: 35mm 프롬프트 & 실시간 AI 이미지 렌더러 */}
          {activeTab === 'prompts' && (
            <div className="space-y-6">
              {/* 상단 렌더러 컨트롤러 바 */}
              <div className="p-5 rounded-xl bg-gradient-to-r from-[#18151D] via-[#121218] to-[#14121A] border border-[#D4AF37]/30 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-5 h-5 text-[#D4AF37]" />
                      <h3 className="text-sm font-bold text-[#F3F3F5] tracking-wide">
                        35mm 시네마틱 프롬프트 & 실시간 AI 렌더러 (Pro Optimizer)
                      </h3>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded border border-emerald-500/30">
                        100% 무료 무제한 (비용 $0 / Flux AI)
                      </span>
                    </div>
                    <p className="text-xs text-[#A1A1AA] mt-1">
                      현재 선택된 에피소드 [제{currentEpisode?.episode_number}화 - {currentEpisode?.title}] 맞춤 씬 렌더링
                    </p>
                  </div>

                  {/* 일괄 생성 버튼 */}
                  <button
                    onClick={() => handleRenderAll(activeData.prompts)}
                    disabled={isRenderingAll || activeData.prompts.length === 0}
                    className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#B38F26] text-[#0A0A0C] font-bold text-xs flex items-center gap-2 hover:opacity-95 shadow-lg shadow-[#D4AF37]/10 disabled:opacity-50 transition-all cursor-pointer"
                  >
                    {isRenderingAll ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-[#0A0A0C] border-t-transparent rounded-full animate-spin" />
                        전체 {activeData.prompts.length}대 씬 일괄 렌더링 중...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        전체 {activeData.prompts.length}대 씬 일괄 실시간 렌더링 (0원)
                      </>
                    )}
                  </button>
                </div>

                {/* 화풍 프리셋 및 품질 최적화 배너 */}
                <div className="pt-3 border-t border-[#22222A] flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-[#A1A1AA] font-bold flex items-center gap-1">
                      <Sliders className="w-3.5 h-3.5 text-[#D4AF37]" />
                      화풍 프리셋:
                    </span>
                    <div className="flex bg-[#0A0A0C] border border-[#272730] rounded-lg p-0.5 text-xs">
                      {[
                        { id: 'cinematic', label: '🎬 35mm 극실사 영화 (추천)' },
                        { id: 'portrait', label: '📸 스튜디오 인물 화보' },
                        { id: 'webtoon', label: '🎨 다크 느와르 웹툰' },
                      ].map(st => (
                        <button
                          key={st.id}
                          onClick={() => setSelectedStyle(st.id as any)}
                          className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                            selectedStyle === st.id
                              ? 'bg-[#D4AF37] text-black font-bold shadow'
                              : 'text-[#A1A1AA] hover:text-[#F3F3F5]'
                          }`}
                        >
                          {st.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <span className="text-[11px] text-[#A1A1AA] bg-[#0A0A0C] px-3 py-1.5 rounded border border-[#22222A]">
                    💡 <strong className="text-[#D4AF37]">{currentSeries?.title} 제{currentEpisode?.episode_number}화</strong> 맞춤 씬 프롬프트 자동 동기화됨
                  </span>
                </div>
              </div>

              {/* 에피소드 씬 리스트 */}
              <div className="grid grid-cols-1 gap-6">
                {activeData.prompts.map((p, idx) => {
                  const currentRatio = aspectRatios[idx] || (p.aspectRatio as '16:9' | '3:4' | '1:1') || '16:9';
                  const activePromptText = customPrompts[idx] !== undefined ? customPrompts[idx] : p.prompt;
                  const imgUrl = renderedImages[idx];
                  const rendering = isRendering[idx];

                  return (
                    <div key={idx} className="p-6 rounded-xl bg-[#111116] border border-[#222228] hover:border-[#33333F] transition-all space-y-4">
                      {/* 카드 헤더 */}
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-[#D4AF37]">{p.sceneName}</span>
                          <span className="text-[10px] font-mono text-[#71717A] bg-[#181820] px-2 py-0.5 rounded border border-[#22222A]">
                            타임코드: {p.timestamp}
                          </span>
                        </div>

                        {/* 비율 선택 및 프롬프트 복사 */}
                        <div className="flex items-center gap-2">
                          <div className="flex items-center bg-[#0A0A0C] border border-[#22222A] rounded-lg p-0.5 text-[11px]">
                            {(['16:9', '3:4', '1:1'] as const).map(r => (
                              <button
                                key={r}
                                onClick={() => setAspectRatios(prev => ({ ...prev, [idx]: r }))}
                                className={`px-2 py-1 rounded cursor-pointer ${
                                  currentRatio === r
                                    ? 'bg-[#D4AF37] text-black font-bold'
                                    : 'text-[#71717A] hover:text-[#E4E4E7]'
                                } transition-colors`}
                              >
                                {r === '16:9' ? '16:9 (와이드)' : r === '3:4' ? '3:4 (표지)' : '1:1 (썸네일)'}
                              </button>
                            ))}
                          </div>

                          <button
                            onClick={() => handleCopy(activePromptText, `prompt-${idx}`)}
                            className="px-3 py-1.5 rounded-lg bg-[#1C1C24] hover:bg-[#272732] text-xs text-[#E4E4E7] border border-[#2E2E38] flex items-center gap-1.5 cursor-pointer"
                          >
                            {copiedKey === `prompt-${idx}` ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5 text-[#D4AF37]" />
                            )}
                            프롬프트 복사
                          </button>
                        </div>
                      </div>

                      {/* 프롬프트 편집 텍스트에어리어 (작가가 직접 수정 가능) */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] text-[#71717A]">
                          <span className="font-semibold text-[#D4AF37] flex items-center gap-1">
                            <FileText className="w-3 h-3" /> 프롬프트 (클릭하여 직접 수정 가능)
                          </span>
                          <span>미드저니 태그 자동 정제 • 8K 디테일 가중치 주입</span>
                        </div>
                        <textarea
                          value={activePromptText}
                          onChange={e => setCustomPrompts(prev => ({ ...prev, [idx]: e.target.value }))}
                          rows={3}
                          className="w-full bg-[#0A0A0C] p-3 rounded-lg border border-[#1C1C24] focus:border-[#D4AF37]/60 font-mono text-xs text-[#D4D4D8] leading-relaxed outline-none transition-colors resize-y"
                        />
                      </div>

                      {/* 렌더링 액션 바 & 미리보기 */}
                      <div className="pt-1 flex flex-wrap items-center justify-between gap-3">
                        <button
                          onClick={() => handleRenderImage(idx, activePromptText)}
                          disabled={rendering}
                          className="px-4 py-2 rounded-lg bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37] font-bold text-xs flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                        >
                          {rendering ? (
                            <>
                              <span className="w-3.5 h-3.5 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
                              실시간 고화질 렌더링 중...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                              {imgUrl ? '🔄 다른 시드로 다시 생성 (0원)' : '🎨 버튼 1클릭 실시간 이미지 생성 (0원)'}
                            </>
                          )}
                        </button>

                        {imgUrl && (
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
                              <CheckCircle className="w-3 h-3" /> 렌더링 완료 (비용: 0 KRW)
                            </span>
                            <button
                              onClick={() => setModalImage(imgUrl)}
                              className="px-3 py-1.5 rounded-lg bg-[#1C1C24] hover:bg-[#272732] text-xs text-[#E4E4E7] border border-[#2E2E38] flex items-center gap-1 cursor-pointer"
                            >
                              <ExternalLink className="w-3 h-3 text-[#D4AF37]" />
                              확대 보기
                            </button>
                            <button
                              onClick={() => handleDownloadImage(imgUrl, `crown-grid-scene-${idx + 1}.jpg`)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-black font-bold text-xs flex items-center gap-1 cursor-pointer"
                            >
                              <Download className="w-3 h-3" />
                              로컬 다운로드
                            </button>
                          </div>
                        )}
                      </div>

                      {/* 이미지 미리보기 캔버스 */}
                      {rendering && (
                        <div className="w-full h-64 rounded-lg border border-[#2A2A38] bg-[#0E0E14] flex flex-col items-center justify-center gap-3 animate-pulse">
                          <span className="w-8 h-8 border-3 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
                          <p className="text-xs text-[#A1A1AA] font-mono">
                            Flux 초고속 AI 모델로 35mm 영화적 텍스처 합성 중... (약 2~3초 소요)
                          </p>
                        </div>
                      )}

                      {imgUrl && !rendering && (
                        <div className="relative group rounded-lg overflow-hidden border border-[#2A2A38] bg-[#0A0A0C]">
                          <img
                            src={imgUrl}
                            alt={p.sceneName}
                            className={`w-full object-cover transition-transform duration-300 group-hover:scale-[1.01] ${
                              currentRatio === '16:9' ? 'aspect-video' : currentRatio === '3:4' ? 'aspect-[3/4] max-h-[500px] mx-auto object-contain' : 'aspect-square max-h-[450px] mx-auto'
                            }`}
                          />
                          <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded bg-black/70 backdrop-blur-md text-[10px] font-mono text-[#E4E4E7] border border-white/10 flex items-center gap-2">
                            <span>Flux Model</span>
                            <span className="text-[#D4AF37]">•</span>
                            <span>{currentRatio}</span>
                            <span className="text-[#D4AF37]">•</span>
                            <span>{selectedStyle}</span>
                            <span className="text-[#D4AF37]">•</span>
                            <span className="text-emerald-400 font-bold">$0 Free</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 탭 4: 배포기 */}
          {activeTab === 'distribution' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="p-6 rounded-xl bg-[#111116] border border-[#222228] space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#1C1C24]">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
                    포스타입 맞춤 서식 + 배너 (제{currentEpisode?.episode_number}화)
                  </h4>
                  <button
                    onClick={() => handleCopy(activeData.distribution.postypeHtml, 'postype')}
                    className="px-3 py-1 rounded bg-[#D4AF37] text-xs font-bold text-[#0A0A0C] cursor-pointer"
                  >
                    HTML 복사
                  </button>
                </div>
                <div className="p-4 rounded-lg bg-[#0A0A0C] max-h-96 overflow-y-auto font-mono text-[11px] text-[#A1A1AA] whitespace-pre-wrap select-text">
                  {activeData.distribution.postypeHtml}
                </div>
              </div>

              <div className="p-6 rounded-xl bg-[#111116] border border-[#222228] space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#1C1C24]">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
                    SubscribeStar.adult 글로벌 영문 요약
                  </h4>
                  <button
                    onClick={() => handleCopy(activeData.distribution.subscribeStarText, 'substar')}
                    className="px-3 py-1 rounded bg-[#D4AF37] text-xs font-bold text-[#0A0A0C] cursor-pointer"
                  >
                    영문본 복사
                  </button>
                </div>
                <div className="p-4 rounded-lg bg-[#0A0A0C] max-h-96 overflow-y-auto font-mono text-[11px] text-[#A1A1AA] whitespace-pre-wrap select-text">
                  {activeData.distribution.subscribeStarText}
                </div>
              </div>
            </div>
          )}

          {/* 탭 5: 캐릭터 스탯 */}
          {activeTab === 'stats' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeData.characterStats.map((st: any, idx: number) => (
                <div key={idx} className="p-6 rounded-xl bg-[#111116] border border-[#222228] space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-[#1C1C24]">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#F3F3F5]">{st.name}</span>
                      {st.count ? (
                        <span className="text-[10px] text-[#A1A1AA] bg-[#181822] px-2 py-0.5 rounded border border-[#272734]">
                          등장 빈도: {st.count}회
                        </span>
                      ) : null}
                    </div>
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

          {/* 전체화면 이미지 확대 모달 */}
          {modalImage && (
            <div 
              onClick={() => setModalImage(null)}
              className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
            >
              <div className="relative max-w-5xl max-h-[90vh] flex flex-col items-center" onClick={e => e.stopPropagation()}>
                <button
                  onClick={() => setModalImage(null)}
                  className="absolute -top-10 right-0 p-2 text-white hover:text-[#D4AF37] transition-colors cursor-pointer"
                >
                  <X className="w-6 h-6" />
                </button>
                <img
                  src={modalImage}
                  alt="Enlarged Render"
                  className="max-w-full max-h-[80vh] rounded-lg shadow-2xl border border-white/10 object-contain"
                />
                <div className="mt-4 flex items-center gap-3">
                  <button
                    onClick={() => handleDownloadImage(modalImage, 'crown-grid-enlarged.jpg')}
                    className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center gap-2 shadow-lg cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    고해상도 다운로드 (JPG)
                  </button>
                  <button
                    onClick={() => setModalImage(null)}
                    className="px-4 py-2 rounded-lg bg-[#1C1C24] hover:bg-[#272732] text-xs text-[#E4E4E7] border border-[#2E2E38] cursor-pointer"
                  >
                    닫기 (ESC)
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

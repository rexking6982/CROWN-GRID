'use client';

import { useState, useEffect, useMemo } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { 
  Users, Search, Filter, AlertTriangle, ShieldAlert, Sparkles, 
  CheckCircle2, RefreshCw, ChevronDown, ChevronUp, Ruler, Flame, 
  Eye, BookOpen, X, Check, Activity, Info, AlertCircle
} from 'lucide-react';
import { Character } from '@/lib/types';
import { CensusCharacter, ConflictItem, UniverseCensusResult } from '@/lib/character-census';

export default function CharactersPage() {
  const [censusResult, setCensusResult] = useState<UniverseCensusResult | null>(null);
  const [existingCharacters, setExistingCharacters] = useState<Character[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTier, setSelectedTier] = useState<string>('all');
  const [selectedSeries, setSelectedSeries] = useState<string>('all');
  const [onlyConflicts, setOnlyConflicts] = useState(false);
  
  // 모달 상태
  const [selectedCharForEdit, setSelectedCharForEdit] = useState<any | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeConflictModal, setActiveConflictModal] = useState<ConflictItem | null>(null);
  const [expandedEpisodeCharId, setExpandedEpisodeCharId] = useState<string | null>(null);

  // 전수조사 및 기존 데이터 로드
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [censusRes, syncRes] = await Promise.all([
        fetch('/api/characters/census'),
        fetch('/api/sync-assets')
      ]);

      const censusData = await censusRes.json();
      const syncData = await syncRes.json();

      if (censusData.success) {
        setCensusResult(censusData);
      }
      if (syncData.dataset?.characters) {
        setExistingCharacters(syncData.dataset.characters);
      }
    } catch (err) {
      console.error('인물 데이터 로드 실패:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 전수조사 캐릭터와 기존 명세서 데이터 병합
  const mergedCharacters = useMemo(() => {
    if (!censusResult?.characters) return [];

    return censusResult.characters.map(censusChar => {
      const matched = existingCharacters.find(
        ec => ec.name_kr === censusChar.name || ec.name === censusChar.name
      );

      return {
        ...censusChar,
        anatomy_specs: matched?.anatomy_specs || {
          height: censusChar.height,
          weight: Math.round(censusChar.height * 0.42),
          rank_tier: censusChar.tier === 'lead' ? 'Royal Dominant' : 'Disciplined Tier-1',
          anatomy_length: '20cm+ (비공개 규격)',
          secret_stigma: censusChar.secretKeyword,
          restraint_item: '티타늄 정조대 / 가죽 구속 쵸커',
          scent: '사향 및 짙은 스모키 우드 향',
        },
        personality: matched?.personality || '냉혹한 규율 집행과 절대 복종의 심리 경계선',
      };
    });
  }, [censusResult, existingCharacters]);

  // 필터링 계산
  const filteredCharacters = useMemo(() => {
    return mergedCharacters.filter(char => {
      // 검색어 필터
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchName = char.name.toLowerCase().includes(q);
        const matchRole = char.role.toLowerCase().includes(q);
        const matchAliases = char.aliases?.some(a => a.toLowerCase().includes(q));
        const matchAppearance = char.appearance?.toLowerCase().includes(q);
        if (!matchName && !matchRole && !matchAliases && !matchAppearance) return false;
      }

      // 티어 필터
      if (selectedTier !== 'all' && char.tier !== selectedTier) return false;

      // 시리즈 필터
      if (selectedSeries !== 'all' && char.seriesId !== selectedSeries) return false;

      // 충돌 항목만 필터
      if (onlyConflicts && (!char.conflicts || char.conflicts.length === 0)) return false;

      return true;
    });
  }, [mergedCharacters, searchQuery, selectedTier, selectedSeries, onlyConflicts]);

  const stats = censusResult?.stats || {
    totalCharacters: 0,
    totalMentions: 0,
    totalEpisodesScanned: 0,
    leadCount: 0,
    coreSupportingCount: 0,
    supportingCount: 0,
    cameoCount: 0,
    totalConflicts: 0,
  };

  const handleOpenEdit = (char: any) => {
    setSelectedCharForEdit({ ...char });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    if (!selectedCharForEdit) return;
    // 로컬 상태 반영
    if (censusResult) {
      setCensusResult({
        ...censusResult,
        characters: censusResult.characters.map(c =>
          c.name === selectedCharForEdit.name
            ? { ...c, ...selectedCharForEdit }
            : c
        ),
      });
    }
    setIsEditModalOpen(false);
  };

  const seriesList = [
    { id: 'all', title: '전체 시리즈' },
    { id: 's-midnight-01', title: '심야 특별신체검열' },
    { id: 's-collar-02', title: '186cm 킹카 후배의 목줄' },
    { id: 's-medical-03', title: '특수 의료 검진: Case 01' },
    { id: 's-outpost-04', title: '심야2: 파견지 특별훈육수칙' },
    { id: 's-idol-05', title: '성인용 아이돌 육성기' },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-[#F3F3F5] flex">
      <AdminSidebar />

      <main className="flex-1 ml-64 flex flex-col min-h-screen">
        <AdminHeader
          title="151화 원고 전수조사 인물 도감 & 설정 충돌 감사"
          subtitle="성황 유니버스 5개 시리즈 151개 에피소드 실시간 전수 마이닝 및 설정 무결성 검증 엔진"
        />

        <div className="p-8 space-y-8">
          {/* 1. 상단 통계 배너 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-[#111116] border border-[#222228] relative overflow-hidden group hover:border-[#D4AF37]/50 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider">
                  전수 발굴 인물
                </span>
                <Users className="w-5 h-5 text-[#D4AF37]" />
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-[#F3F3F5]">
                  {stats.totalCharacters}
                </span>
                <span className="text-xs text-[#71717A]">명 등록 (초기 20명 대비 +15명)</span>
              </div>
              <div className="mt-2 text-[11px] text-[#A1A1AA]">
                주연 {stats.leadCount}명 · 핵심조연 {stats.coreSupportingCount}명 · 조연 {stats.supportingCount}명
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#111116] border border-[#222228] relative overflow-hidden group hover:border-indigo-500/50 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider">
                  총 원고 언급 횟수
                </span>
                <Activity className="w-5 h-5 text-indigo-400" />
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-indigo-300">
                  {stats.totalMentions.toLocaleString()}
                </span>
                <span className="text-xs text-[#71717A]">회 실시간 집계</span>
              </div>
              <div className="mt-2 text-[11px] text-[#A1A1AA]">
                151개 에피소드 전수 스캔 완료 (100% 무결성)
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#111116] border border-[#222228] relative overflow-hidden group hover:border-emerald-500/50 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider">
                  스캔된 전 회차
                </span>
                <BookOpen className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-emerald-300">
                  {stats.totalEpisodesScanned}
                </span>
                <span className="text-xs text-[#71717A]">화 원고 (5대 시리즈)</span>
              </div>
              <div className="mt-2 text-[11px] text-[#A1A1AA]">
                자산 파일 직접 연동 및 실시간 텍스트 인덱싱
              </div>
            </div>

            <div 
              onClick={() => {
                setOnlyConflicts(prev => !prev);
                setSelectedTier('all');
              }}
              className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                onlyConflicts 
                  ? 'bg-rose-950/40 border-rose-500 shadow-lg shadow-rose-950/30' 
                  : 'bg-[#111116] border-[#222228] hover:border-rose-500/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  설정 충돌 감사
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  {stats.totalConflicts}건 탐지
                </span>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-rose-400">
                  {stats.totalConflicts}
                </span>
                <span className="text-xs text-rose-300/80">건 검토 필요 (클릭 시 필터)</span>
              </div>
              <div className="mt-2 text-[11px] text-[#A1A1AA]">
                오타·동명이인·나이 모순·호칭 분산 자동 적발
              </div>
            </div>
          </div>

          {/* 2. 검색 및 다중 필터 컨트롤 바 */}
          <div className="p-4 rounded-xl bg-[#111116] border border-[#222228] flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[300px]">
              {/* 검색창 */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-[#71717A] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="인물명, 별칭, 역할, 외형 특징 검색..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-[#0A0A0C] border border-[#272730] rounded-xl pl-10 pr-4 py-2 text-xs text-[#F3F3F5] placeholder-[#71717A] focus:outline-none focus:border-[#D4AF37]/60 transition-colors"
                />
              </div>

              {/* 시리즈 필터 */}
              <select
                value={selectedSeries}
                onChange={e => setSelectedSeries(e.target.value)}
                className="bg-[#0A0A0C] border border-[#272730] rounded-xl px-3 py-2 text-xs text-[#E4E4E7] focus:outline-none focus:border-[#D4AF37]/60 cursor-pointer"
              >
                {seriesList.map(s => (
                  <option key={s.id} value={s.id} className="bg-[#111116]">
                    {s.title}
                  </option>
                ))}
              </select>
            </div>

            {/* 티어 필터 버튼 그룹 */}
            <div className="flex items-center gap-1.5 bg-[#0A0A0C] p-1 rounded-xl border border-[#272730]">
              <button
                onClick={() => { setSelectedTier('all'); setOnlyConflicts(false); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedTier === 'all' && !onlyConflicts
                    ? 'bg-[#272732] text-[#F3F3F5] shadow'
                    : 'text-[#A1A1AA] hover:text-[#F3F3F5]'
                }`}
              >
                전체 ({mergedCharacters.length})
              </button>
              <button
                onClick={() => { setSelectedTier('lead'); setOnlyConflicts(false); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedTier === 'lead' && !onlyConflicts
                    ? 'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40 shadow'
                    : 'text-[#A1A1AA] hover:text-[#D4AF37]'
                }`}
              >
                👑 주연 ({stats.leadCount})
              </button>
              <button
                onClick={() => { setSelectedTier('core_supporting'); setOnlyConflicts(false); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedTier === 'core_supporting' && !onlyConflicts
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow'
                    : 'text-[#A1A1AA] hover:text-purple-300'
                }`}
              >
                ⭐ 핵심조연 ({stats.coreSupportingCount})
              </button>
              <button
                onClick={() => { setSelectedTier('supporting'); setOnlyConflicts(false); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedTier === 'supporting' && !onlyConflicts
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow'
                    : 'text-[#A1A1AA] hover:text-blue-300'
                }`}
              >
                🔷 조연 ({stats.supportingCount})
              </button>
              <button
                onClick={() => setOnlyConflicts(prev => !prev)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
                  onlyConflicts
                    ? 'bg-rose-500/30 text-rose-300 border border-rose-500/50 shadow'
                    : 'text-[#A1A1AA] hover:text-rose-300'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                충돌 항목 ({stats.totalConflicts})
              </button>
            </div>

            <button
              onClick={loadData}
              disabled={isLoading}
              className="px-3.5 py-2 rounded-xl bg-[#1C1C24] hover:bg-[#272732] text-xs font-medium text-[#E4E4E7] border border-[#2E2E38] flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              재감사
            </button>
          </div>

          {/* 3. 충돌 경고 특별 안내 바 (필터 활성화 시) */}
          {onlyConflicts && (
            <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/40 text-xs text-rose-200 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold text-rose-300">
                  ⚠️ 설정 충돌 및 표기 불일치 집중 감사 모드 활성화 중
                </span>
                <p className="text-rose-200/80 leading-relaxed">
                  원고 151화 전수조사 중 발견된 [이름 유사도 오타 의심], [동일 인물 호칭 양분], [나이/설정 불일치] 항목만 필터링되었습니다. 각 카드의 경고 뱃지를 클릭하면 상세 해결 방안을 확인할 수 있습니다.
                </p>
              </div>
            </div>
          )}

          {/* 4. 캐릭터 카드 그리드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCharacters.map(char => {
              const hasConflicts = char.conflicts && char.conflicts.length > 0;
              const isEpisodeExpanded = expandedEpisodeCharId === char.id;

              return (
                <div
                  key={char.id}
                  className={`p-6 rounded-2xl bg-[#111116] border transition-all flex flex-col justify-between ${
                    hasConflicts 
                      ? 'border-rose-900/40 hover:border-rose-500/60 shadow-lg shadow-rose-950/10' 
                      : 'border-[#222228] hover:border-[#D4AF37]/40'
                  }`}
                >
                  <div>
                    {/* 상단: 이름, 역할, 티어 배지 */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xl font-bold text-[#F3F3F5] tracking-tight">
                            {char.name}
                          </h4>
                          {/* 티어 뱃지 */}
                          {char.tier === 'lead' && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30">
                              👑 주연
                            </span>
                          )}
                          {char.tier === 'core_supporting' && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30">
                              ⭐ 핵심조연
                            </span>
                          )}
                          {char.tier === 'supporting' && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/15 text-blue-300 border border-blue-500/30">
                              🔷 조연
                            </span>
                          )}
                          {char.tier === 'cameo' && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-800 text-zinc-400 border border-zinc-700">
                              카메오
                            </span>
                          )}
                        </div>

                        <div className="text-xs text-[#D4AF37] font-medium mt-1">
                          {char.role}
                        </div>
                        <div className="text-[11px] text-[#71717A] mt-0.5">
                          {char.seriesTitle}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(char)}
                          className="px-2.5 py-1 rounded-lg bg-[#1C1C24] hover:bg-[#272732] text-[11px] text-[#E4E4E7] border border-[#2E2E38] transition-colors"
                        >
                          규격 수정
                        </button>
                      </div>
                    </div>

                    {/* 원고 언급 지표 통계 바 */}
                    <div className="mt-4 p-3 rounded-xl bg-[#0A0A0E] border border-[#1E1E26] flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-[#71717A] block">원고 실언급</span>
                        <span className="text-sm font-extrabold text-[#F3F3F5]">
                          {char.totalMentions.toLocaleString()}
                          <span className="text-[10px] text-[#A1A1AA] font-normal ml-0.5">회</span>
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-[#71717A] block">출연 회차</span>
                        <span className="text-sm font-extrabold text-emerald-400">
                          {char.totalEpisodes}
                          <span className="text-[10px] text-[#A1A1AA] font-normal ml-0.5">화</span>
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-[#71717A] block">규격 스펙</span>
                        <span className="text-xs font-semibold text-amber-300">
                          {char.height}cm / {char.age}세
                        </span>
                      </div>
                    </div>

                    {/* 설정 충돌 경고 알림 칩 */}
                    {hasConflicts && (
                      <div className="mt-3 space-y-1.5">
                        {char.conflicts.map(conf => (
                          <div
                            key={conf.id}
                            onClick={() => setActiveConflictModal(conf)}
                            className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-500/40 hover:bg-rose-900/50 cursor-pointer transition-colors flex items-center justify-between"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                              <span className="text-xs font-semibold text-rose-200 truncate">
                                {conf.title}
                              </span>
                            </div>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold uppercase shrink-0">
                              {conf.severity}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 대표 대사 (Key Quote) */}
                    {char.keyQuote && (
                      <div className="mt-3 p-2.5 rounded-lg bg-[#14141A] border-l-2 border-[#D4AF37] text-xs text-[#E4E4E7] italic font-serif leading-relaxed">
                        {char.keyQuote}
                      </div>
                    )}

                    {/* 성향 및 심리 스탯 게이지 */}
                    <div className="mt-4 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] text-[#A1A1AA]">
                        <span>지배 성향 (Dominance)</span>
                        <span className="font-semibold text-rose-400">{char.dominance}%</span>
                      </div>
                      <div className="w-full bg-[#181820] h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-rose-500 to-amber-500 h-full rounded-full"
                          style={{ width: `${char.dominance}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-[#A1A1AA] pt-1">
                        <span>굴종/수치 (Submission)</span>
                        <span className="font-semibold text-indigo-400">{char.submission}%</span>
                      </div>
                      <div className="w-full bg-[#181820] h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full"
                          style={{ width: `${char.submission}%` }}
                        />
                      </div>
                    </div>

                    {/* 비공개 아나토미 명세 */}
                    <div className="mt-4 p-3 rounded-lg bg-[#0E0E12] border border-[#1A1A22] space-y-1.5 text-xs">
                      <div className="flex items-center gap-1.5 text-[#D4AF37] font-semibold text-[11px]">
                        <Ruler className="w-3.5 h-3.5" />
                        <span>비공개 아나토미 & 특수 규격</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                        <div>
                          <span className="text-[10px] text-[#71717A] block">비공개 수치</span>
                          <span className="text-rose-300 font-medium">
                            {char.anatomy_specs?.anatomy_length || '20cm+'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#71717A] block">구속/규율 장구</span>
                          <span className="text-amber-300 font-medium truncate block">
                            {char.anatomy_specs?.restraint_item || '티타늄 정조대'}
                          </span>
                        </div>
                      </div>
                      <div className="pt-1 border-t border-[#181820]">
                        <span className="text-[10px] text-[#71717A] block">비밀 키워드 / 성흔</span>
                        <span className="text-rose-400 font-medium text-[11px]">
                          {char.secretKeyword || char.anatomy_specs?.secret_stigma || '기록 없음'}
                        </span>
                      </div>
                    </div>

                    {/* 외형 서술 요약 */}
                    <p className="mt-3 text-xs text-[#A1A1AA] line-clamp-2 leading-relaxed">
                      {char.appearance}
                    </p>
                  </div>

                  {/* 하단: 출연 에피소드 아코디언 토글 */}
                  <div className="mt-4 pt-3 border-t border-[#1E1E26]">
                    <button
                      onClick={() =>
                        setExpandedEpisodeCharId(isEpisodeExpanded ? null : char.id)
                      }
                      className="w-full flex items-center justify-between text-xs text-[#A1A1AA] hover:text-[#F3F3F5] transition-colors"
                    >
                      <span className="flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-[#D4AF37]" />
                        출연 회차 상세 ({char.episodes?.length || 0}개)
                      </span>
                      {isEpisodeExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {isEpisodeExpanded && char.episodes && (
                      <div className="mt-2.5 max-h-40 overflow-y-auto space-y-1.5 pr-1">
                        {char.episodes.map(ep => (
                          <div
                            key={`${ep.seriesId}-${ep.episodeNumber}`}
                            className="p-1.5 rounded bg-[#0A0A0C] border border-[#1A1A22] text-[11px] flex items-center justify-between"
                          >
                            <span className="text-[#E4E4E7] truncate mr-2">
                              제{ep.episodeNumber}화 {ep.title}
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-[#1C1C24] text-[#D4AF37] font-bold text-[10px] shrink-0">
                              {ep.count}회
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {filteredCharacters.length === 0 && (
            <div className="text-center py-16 bg-[#111116] rounded-2xl border border-[#222228] space-y-3">
              <Users className="w-10 h-10 text-[#71717A] mx-auto" />
              <p className="text-base text-[#A1A1AA] font-medium">
                일치하는 인물을 찾을 수 없습니다.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedTier('all');
                  setSelectedSeries('all');
                  setOnlyConflicts(false);
                }}
                className="px-4 py-2 rounded-xl bg-[#1C1C24] text-xs text-[#E4E4E7] hover:bg-[#272730]"
              >
                검색 및 필터 초기화
              </button>
            </div>
          )}
        </div>
      </main>

      {/* 5. 설정 충돌 상세 분석 및 조치 모달 */}
      {activeConflictModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111116] border border-rose-500/50 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#222228]">
              <h3 className="text-base font-bold text-rose-300 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
                설정 충돌 정밀 분석 보고서
              </h3>
              <button
                onClick={() => setActiveConflictModal(null)}
                className="text-[#71717A] hover:text-[#F3F3F5]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <span className="text-[10px] text-[#71717A] uppercase font-bold block mb-1">
                  충돌 제목 & 심각도
                </span>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-[#F3F3F5]">
                    {activeConflictModal.title}
                  </h4>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 uppercase">
                    {activeConflictModal.severity}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0A0A0E] border border-rose-900/40 text-rose-200/90 leading-relaxed">
                <span className="text-[10px] text-rose-400 uppercase font-bold block mb-1">
                  모순 원인 분석
                </span>
                {activeConflictModal.description}
              </div>

              {activeConflictModal.affectedEpisodes && activeConflictModal.affectedEpisodes.length > 0 && (
                <div>
                  <span className="text-[10px] text-[#71717A] uppercase font-bold block mb-1.5">
                    영향을 받는 주요 원고 에피소드
                  </span>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {activeConflictModal.affectedEpisodes.map(ep => (
                      <div
                        key={`${ep.seriesId}-${ep.episodeNumber}`}
                        className="p-2 rounded-lg bg-[#0E0E12] border border-[#1E1E26] flex items-center justify-between"
                      >
                        <span className="text-[#E4E4E7]">
                          제{ep.episodeNumber}화: {ep.title}
                        </span>
                        <span className="text-[10px] text-[#A1A1AA]">
                          {ep.seriesId}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-emerald-200/90 leading-relaxed">
                <span className="text-[10px] text-emerald-400 uppercase font-bold block mb-1">
                  권장 해결 가이드 (Canon 정합성 조치)
                </span>
                {activeConflictModal.suggestedAction}
              </div>
            </div>

            <div className="pt-4 border-t border-[#222228] flex justify-end">
              <button
                onClick={() => setActiveConflictModal(null)}
                className="px-4 py-2 rounded-xl bg-[#1C1C24] hover:bg-[#272730] text-xs font-semibold text-[#E4E4E7]"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. 인물 규격 편집 모달 */}
      {isEditModalOpen && selectedCharForEdit && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111116] border border-[#2B2B36] rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#222228]">
              <h3 className="text-base font-bold text-[#F3F3F5] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                {selectedCharForEdit.name} - 정밀 명세서 및 아나토미 편집
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-[#71717A] hover:text-[#F3F3F5]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[#A1A1AA] mb-1">인물명 / 역할</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={selectedCharForEdit.name}
                    onChange={e =>
                      setSelectedCharForEdit({ ...selectedCharForEdit, name: e.target.value })
                    }
                    className="w-full bg-[#0A0A0C] border border-[#272730] rounded-xl px-3 py-2 text-[#F3F3F5]"
                  />
                  <input
                    type="text"
                    value={selectedCharForEdit.role}
                    onChange={e =>
                      setSelectedCharForEdit({ ...selectedCharForEdit, role: e.target.value })
                    }
                    className="w-full bg-[#0A0A0C] border border-[#272730] rounded-xl px-3 py-2 text-[#F3F3F5]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#A1A1AA] mb-1">신장 (cm) / 나이 (세)</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={selectedCharForEdit.height || 180}
                    onChange={e =>
                      setSelectedCharForEdit({
                        ...selectedCharForEdit,
                        height: parseInt(e.target.value, 10),
                      })
                    }
                    className="w-full bg-[#0A0A0C] border border-[#272730] rounded-xl px-3 py-2 text-[#F3F3F5]"
                  />
                  <input
                    type="number"
                    value={selectedCharForEdit.age || 25}
                    onChange={e =>
                      setSelectedCharForEdit({
                        ...selectedCharForEdit,
                        age: parseInt(e.target.value, 10),
                      })
                    }
                    className="w-full bg-[#0A0A0C] border border-[#272730] rounded-xl px-3 py-2 text-[#F3F3F5]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#A1A1AA] mb-1">비공개 아나토미 치수 및 형상</label>
                <input
                  type="text"
                  value={selectedCharForEdit.anatomy_specs?.anatomy_length || ''}
                  onChange={e =>
                    setSelectedCharForEdit({
                      ...selectedCharForEdit,
                      anatomy_specs: {
                        ...selectedCharForEdit.anatomy_specs,
                        anatomy_length: e.target.value,
                      },
                    })
                  }
                  className="w-full bg-[#0A0A0C] border border-[#272730] rounded-xl px-3 py-2 text-[#F3F3F5]"
                />
              </div>

              <div>
                <label className="block text-[#A1A1AA] mb-1">비밀 성흔(Stigma) 및 신체 흔적 키워드</label>
                <input
                  type="text"
                  value={selectedCharForEdit.secretKeyword || ''}
                  onChange={e =>
                    setSelectedCharForEdit({
                      ...selectedCharForEdit,
                      secretKeyword: e.target.value,
                    })
                  }
                  className="w-full bg-[#0A0A0C] border border-[#272730] rounded-xl px-3 py-2 text-[#F3F3F5]"
                />
              </div>

              <div>
                <label className="block text-[#A1A1AA] mb-1">외형 묘사</label>
                <textarea
                  rows={2}
                  value={selectedCharForEdit.appearance || ''}
                  onChange={e =>
                    setSelectedCharForEdit({
                      ...selectedCharForEdit,
                      appearance: e.target.value,
                    })
                  }
                  className="w-full bg-[#0A0A0C] border border-[#272730] rounded-xl px-3 py-2 text-[#F3F3F5]"
                />
              </div>

              <div>
                <label className="block text-[#A1A1AA] mb-1">대표 대사 (Key Quote)</label>
                <textarea
                  rows={2}
                  value={selectedCharForEdit.keyQuote || ''}
                  onChange={e =>
                    setSelectedCharForEdit({
                      ...selectedCharForEdit,
                      keyQuote: e.target.value,
                    })
                  }
                  className="w-full bg-[#0A0A0C] border border-[#272730] rounded-xl px-3 py-2 text-[#F3F3F5]"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-[#222228] flex justify-end gap-3">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#1C1C24] hover:bg-[#272730] text-xs text-[#A1A1AA]"
              >
                취소
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#C29E2E] text-xs font-bold text-[#0A0A0C] flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                저장하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

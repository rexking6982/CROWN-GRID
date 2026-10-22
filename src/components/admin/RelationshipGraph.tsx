'use client';

import React, { useState, useMemo } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  Node,
  Edge,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Sliders, Filter, Sparkles, Shield, Crown } from 'lucide-react';

interface RelationshipGraphProps {
  currentEpisode?: number;
  onEpisodeChange?: (ep: number) => void;
  maxEpisodes?: number;
}

// 회차별 스토리 단계
const EPISODE_STAGES = [
  {
    minEp: 1,
    maxEp: 15,
    stageName: '1단계: 밀실 신체검열과 초기 굴복 (Ep.1~15)',
    tag: '초기 탐색 및 통제 착수',
    desc: '통제탑 밀실 검열, 만년필 규율 체크, 첫 번째 복종 서약',
  },
  {
    minEp: 16,
    maxEp: 35,
    stageName: '2단계: 사격장 통제탑 & 패닉룸 지배 (Ep.16~35)',
    tag: '군·경 사각지대 종속화',
    desc: '편광 유리 너머의 감시, 전술 안대 결박, 형 서하준의 의심',
  },
  {
    minEp: 36,
    maxEp: 55,
    stageName: '3단계: 《마스터 루틴》 엔터 제물 육성 (Ep.36~55)',
    tag: '아이기스 로열 락 & 14.50 Brix 농축',
    desc: '송강우의 피트니스 챔피언 굴복, 백란 향 발향, 배출소 흡착',
  },
  {
    minEp: 56,
    maxEp: 65,
    stageName: '4단계: 군·산 복합 카르텔 융합 & 《로열 넥타》 (Ep.56~65)',
    tag: '영원한 제국의 완성 (현재 회차)',
    desc: '권재하-배진혁 관제망 통합, 스폰서 단죄, 3대 제물 체액 블렌딩 100억 신약 완성',
  },
];

export default function RelationshipGraph({
  currentEpisode = 63,
  onEpisodeChange,
  maxEpisodes = 65,
}: RelationshipGraphProps) {
  const [sliderEpisode, setSliderEpisode] = useState<number>(currentEpisode);
  const [activeFilter, setActiveFilter] = useState<'all' | 'military' | 'entertainment' | 'medical' | 'noir_campus'>('all');

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setSliderEpisode(val);
    if (onEpisodeChange) onEpisodeChange(val);
  };

  const activeStage = useMemo(() => {
    return (
      EPISODE_STAGES.find(s => sliderEpisode >= s.minEp && sliderEpisode <= s.maxEp) ||
      EPISODE_STAGES[EPISODE_STAGES.length - 1]
    );
  }, [sliderEpisode]);

  // 전체 인물 노드 마스터 (20인 정밀 배치)
  const allNodes: Node[] = useMemo(() => [
    // 👑 최상위 배후 정점
    {
      id: 'c-shadow-king',
      position: { x: 500, y: 30 },
      data: {
        category: 'shadow',
        label: (
          <div className="p-3 text-left">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-black text-amber-300">👑 미지의 절대자 (그림자 총수)</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">
                30.0cm
              </span>
            </div>
            <p className="text-[10px] text-zinc-400">성황 카르텔 최상위 배후 정점</p>
            <p className="text-[9px] text-[#D4AF37] mt-0.5 font-semibold">Absolute Top-Dom</p>
          </div>
        ),
      },
      style: {
        background: '#121218',
        color: '#F4F4F5',
        border: '2px solid #D4AF37',
        borderRadius: '12px',
        width: 250,
        boxShadow: '0 0 25px rgba(212, 175, 55, 0.3)',
      },
    },

    // 🏛️ 카르텔 군주: 배진혁
    {
      id: 'c-bae-jinhyeok',
      position: { x: 500, y: 190 },
      data: {
        category: 'entertainment',
        label: (
          <div className="p-3 text-left">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-[#D4AF37]">배진혁 대표 (48세/외형30세)</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#D4AF37]/20 text-[#D4AF37] font-mono">
                19.5cm
              </span>
            </div>
            <p className="text-[10px] text-zinc-400">성황엔터 대표 / 불로의 제왕</p>
            <p className="text-[9px] text-amber-400 mt-0.5">《로열 넥타》 1호 시음 완료</p>
          </div>
        ),
      },
      style: {
        background: '#14141C',
        color: '#F4F4F5',
        border: '2px solid #D4AF37',
        borderRadius: '12px',
        width: 240,
        boxShadow: '0 0 20px rgba(212, 175, 55, 0.25)',
      },
    },

    // 🎖️ 군부 규율대: 강태건
    {
      id: 'c-gang-taegun',
      position: { x: 160, y: 220 },
      data: {
        category: 'military',
        label: (
          <div className="p-3 text-left">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-sky-400">강태건 소령 (32세)</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 font-mono">
                21.0cm
              </span>
            </div>
            <p className="text-[10px] text-zinc-400">총괄 감찰관 / 189cm 86kg</p>
            <p className="text-[9px] text-sky-300 mt-0.5">절대 규율주의자 / Sovereign</p>
          </div>
        ),
      },
      style: {
        background: '#10141E',
        color: '#F4F4F5',
        border: '1.5px solid #38BDF8',
        borderRadius: '10px',
        width: 220,
      },
    },

    // 🎖️ 군부 규율대: 권재하
    {
      id: 'c-kwon-jaeha',
      position: { x: 160, y: 390 },
      data: {
        category: 'military',
        label: (
          <div className="p-3 text-left">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-emerald-400">권재하 소령(진) (26세)</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                22.0cm
              </span>
            </div>
            <p className="text-[10px] text-zinc-400">제1특수훈육단 차기 대장 / 188cm</p>
            <p className="text-[9px] text-emerald-300 mt-0.5">Top-Dom / 마스터 루틴 동기화</p>
          </div>
        ),
      },
      style: {
        background: '#0E1714',
        color: '#F4F4F5',
        border: '1.5px solid #10B981',
        borderRadius: '10px',
        width: 220,
      },
    },

    // 🎖️ 군부 섭: 서하진
    {
      id: 'c-seo-hajin',
      position: { x: 160, y: 560 },
      data: {
        category: 'military',
        label: (
          <div className="p-3 text-left">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-rose-400">서하진 (24세)</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono">
                17.0cm 만곡
              </span>
            </div>
            <p className="text-[10px] text-zinc-400">전속 조련병 ➔ 비서실장 / 182cm</p>
            <p className="text-[9px] text-rose-300 mt-0.5">Switch / 아드레날린 30% 원료</p>
          </div>
        ),
      },
      style: {
        background: '#181014',
        color: '#F4F4F5',
        border: '1.5px solid #F43F5E',
        borderRadius: '10px',
        width: 220,
      },
    },

    // 🎖️ 군부 섭: 차선우
    {
      id: 'c-cha-seonwoo',
      position: { x: -80, y: 390 },
      data: {
        category: 'military',
        label: (
          <div className="p-3 text-left">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-teal-300">차선우 대위 (29세)</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 font-mono">
                15.5cm
              </span>
            </div>
            <p className="text-[10px] text-zinc-400">파견대 지휘관 / 179cm 69kg</p>
            <p className="text-[9px] text-teal-400 mt-0.5">텅스텐 목줄 / 4K POV 스트리밍</p>
          </div>
        ),
      },
      style: {
        background: '#0D1717',
        color: '#F4F4F5',
        border: '1.5px solid #14B8A6',
        borderRadius: '10px',
        width: 210,
      },
    },

    // 🎖️ 군부: 서하준 대위
    {
      id: 'c-seo-hajun',
      position: { x: -80, y: 560 },
      data: {
        category: 'military',
        label: (
          <div className="p-3 text-left">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-cyan-400">서하준 대위 (27세)</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono">
                19.0cm
              </span>
            </div>
            <p className="text-[10px] text-zinc-400">육군 대위 (친형) / 186cm</p>
            <p className="text-[9px] text-cyan-300 mt-0.5">동생의 덫에 얽힌 장교</p>
          </div>
        ),
      },
      style: {
        background: '#0F161B',
        color: '#F4F4F5',
        border: '1.5px solid #06B6D4',
        borderRadius: '10px',
        width: 210,
      },
    },

    // 🎭 엔터 로열 제물: 송강우
    {
      id: 'c-song-kangwoo',
      position: { x: 500, y: 400 },
      data: {
        category: 'entertainment',
        label: (
          <div className="p-3 text-left">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-rose-400">송강우 (로열 07번 / 22세)</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono">
                16.8cm
              </span>
            </div>
            <p className="text-[10px] text-zinc-400">에이펙스 센터 / 183cm 78kg</p>
            <p className="text-[9px] text-amber-300 mt-0.5">아이기스 로열 락 & 14.50 Brix</p>
          </div>
        ),
      },
      style: {
        background: '#1A1116',
        color: '#F4F4F5',
        border: '1.5px solid #F43F5E',
        borderRadius: '12px',
        width: 240,
        boxShadow: '0 0 15px rgba(244, 63, 94, 0.2)',
      },
    },

    // 🎭 엔터 수호견: 도건우 0호기
    {
      id: 'c-do-gunwoo',
      position: { x: 780, y: 220 },
      data: {
        category: 'entertainment',
        label: (
          <div className="p-3 text-left">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-stone-300">도건우 (0호기 / 31세)</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-stone-600/30 text-stone-300 font-mono">
                23.5cm
              </span>
            </div>
            <p className="text-[10px] text-zinc-400">전 격투기 챔피언 / 191cm 98kg</p>
            <p className="text-[9px] text-zinc-400 mt-0.5">50mm 쇠사슬 전속 수호견</p>
          </div>
        ),
      },
      style: {
        background: '#151518',
        color: '#F4F4F5',
        border: '1.5px solid #78716C',
        borderRadius: '10px',
        width: 220,
      },
    },

    // 🎭 엔터 총괄제작: 한시원
    {
      id: 'c-han-siwon',
      position: { x: 780, y: 390 },
      data: {
        category: 'entertainment',
        label: (
          <div className="p-3 text-left">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-violet-400">한시원 총괄이사 (34세)</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300 font-mono">
                19.0cm
              </span>
            </div>
            <p className="text-[10px] text-zinc-400">캐스팅 본부장 / 187cm 82kg</p>
            <p className="text-[9px] text-violet-300 mt-0.5">결벽증 엘리트 돔 / 패들링</p>
          </div>
        ),
      },
      style: {
        background: '#16121C',
        color: '#F4F4F5',
        border: '1.5px solid #8B5CF6',
        borderRadius: '10px',
        width: 220,
      },
    },

    // 🏥 메디컬: 닥터 진
    {
      id: 'c-dr-jin',
      position: { x: 500, y: 600 },
      data: {
        category: 'medical',
        label: (
          <div className="p-3 text-left">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-indigo-400">닥터 진 (진도하 / 35세)</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">
                18.5cm
              </span>
            </div>
            <p className="text-[10px] text-zinc-400">VIP 스포츠의학 센터장 / 180cm</p>
            <p className="text-[9px] text-indigo-300 mt-0.5">Power-Bottom Dom / 내벽 착정</p>
          </div>
        ),
      },
      style: {
        background: '#12141F',
        color: '#F4F4F5',
        border: '1.5px solid #6366F1',
        borderRadius: '10px',
        width: 230,
      },
    },

    // 🏥 메디컬 섭: 한결
    {
      id: 'c-han-kyul',
      position: { x: 780, y: 600 },
      data: {
        category: 'medical',
        label: (
          <div className="p-3 text-left">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-pink-400">한결 (21세)</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-pink-500/20 text-pink-300 font-mono">
                26.0cm 봉인
              </span>
            </div>
            <p className="text-[10px] text-zinc-400">다이빙 에이스 ➔ 데뷔조 비주얼</p>
            <p className="text-[9px] text-pink-300 mt-0.5">7cm 티타늄 정조대 압축 봉인 섭</p>
          </div>
        ),
      },
      style: {
        background: '#191116',
        color: '#F4F4F5',
        border: '1.5px solid #EC4899',
        borderRadius: '10px',
        width: 220,
      },
    },

    // 🏥 명기 코치: 강해든
    {
      id: 'c-gang-haedeun',
      position: { x: 1040, y: 390 },
      data: {
        category: 'medical',
        label: (
          <div className="p-3 text-left">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-amber-400">강해든 (28세)</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
                25.5cm 대물
              </span>
            </div>
            <p className="text-[10px] text-zinc-400">DIA 특임 ➔ 명기 생성소 마스터</p>
            <p className="text-[9px] text-amber-400 mt-0.5">진공 흡착 내벽 & 사정 제어</p>
          </div>
        ),
      },
      style: {
        background: '#19150E',
        color: '#F4F4F5',
        border: '1.5px solid #F59E0B',
        borderRadius: '10px',
        width: 220,
      },
    },

    // ⚒️ 장인: 조형가 한재익
    {
      id: 'c-sculptor',
      position: { x: 500, y: -90 },
      data: {
        category: 'entertainment',
        label: (
          <div className="p-3 text-left">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-slate-300">조형가 (한재익 / 38세)</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-700/40 text-slate-300 font-mono">
                22.5cm
              </span>
            </div>
            <p className="text-[10px] text-zinc-400">특수 구속구 금형 엔지니어</p>
            <p className="text-[9px] text-slate-400 mt-0.5">아이기스 로열 락 & 목줄 장인</p>
          </div>
        ),
      },
      style: {
        background: '#131418',
        color: '#F4F4F5',
        border: '1.5px solid #94A3B8',
        borderRadius: '10px',
        width: 220,
      },
    },

    // 💼 오피스: 윤태오 & 서유건
    {
      id: 'c-yoon-taeo',
      position: { x: 1040, y: 220 },
      data: {
        category: 'noir_campus',
        label: (
          <div className="p-3 text-left">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-orange-400">윤태오 경호팀장 (26세)</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-300 font-mono">
                24.5cm/둘레17.2
              </span>
            </div>
            <p className="text-[10px] text-zinc-400">성황그룹 본사 / 둘레 1위 포식자</p>
            <p className="text-[9px] text-orange-300 mt-0.5">패닉룸 밤의 절대 지배자</p>
          </div>
        ),
      },
      style: {
        background: '#1A140F',
        color: '#F4F4F5',
        border: '1.5px solid #F97316',
        borderRadius: '10px',
        width: 230,
      },
    },
    {
      id: 'c-seo-yugeon',
      position: { x: 1040, y: 70 },
      data: {
        category: 'noir_campus',
        label: (
          <div className="p-3 text-left">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-rose-300">서유건 상무이사 (24세)</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono">
                13.8cm 백자
              </span>
            </div>
            <p className="text-[10px] text-zinc-400">성황성골 후계자 / 177cm 63kg</p>
            <p className="text-[9px] text-rose-300 mt-0.5">취약한 귀족 섭 / 태오에게 귀속</p>
          </div>
        ),
      },
      style: {
        background: '#181014',
        color: '#F4F4F5',
        border: '1.5px solid #FDA4AF',
        borderRadius: '10px',
        width: 220,
      },
    },

    // 🥋 캠퍼스: 권도진 & 신우겸
    {
      id: 'c-kwon-dojin',
      position: { x: 1040, y: 560 },
      data: {
        category: 'noir_campus',
        label: (
          <div className="p-3 text-left">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-lime-400">권도진 (22세)</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-lime-500/20 text-lime-300 font-mono">
                18.5cm
              </span>
            </div>
            <p className="text-[10px] text-zinc-400">성황체대 유도 에이스 / 187cm</p>
            <p className="text-[9px] text-lime-300 mt-0.5">그라운드 그래플러 포식자</p>
          </div>
        ),
      },
      style: {
        background: '#13180E',
        color: '#F4F4F5',
        border: '1.5px solid #84CC16',
        borderRadius: '10px',
        width: 210,
      },
    },
    {
      id: 'c-shin-woogyeom',
      position: { x: 1040, y: 710 },
      data: {
        category: 'noir_campus',
        label: (
          <div className="p-3 text-left">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-blue-300">신우겸 (20세)</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono">
                17.5cm
              </span>
            </div>
            <p className="text-[10px] text-zinc-400">성황체대 농구 킹카 후배 / 186cm</p>
            <p className="text-[9px] text-blue-300 mt-0.5">도진의 관절기에 굴복당한 섭</p>
          </div>
        ),
      },
      style: {
        background: '#0E141C',
        color: '#F4F4F5',
        border: '1.5px solid #60A5FA',
        borderRadius: '10px',
        width: 210,
      },
    },
  ], []);

  // 전체 관계 엣지 마스터
  const allEdges: Edge[] = useMemo(() => [
    {
      id: 'e-shadow-bae',
      source: 'c-shadow-king',
      target: 'c-bae-jinhyeok',
      label: '절대 배후 지령 하달',
      labelStyle: { fill: '#D4AF37', fontWeight: 700, fontSize: 10 },
      labelBgStyle: { fill: '#0A0A0C', fillOpacity: 0.9 },
      style: { stroke: '#D4AF37', strokeWidth: 2.5, strokeDasharray: '6,6' },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#D4AF37' },
    },
    {
      id: 'e-bae-song',
      source: 'c-bae-jinhyeok',
      target: 'c-song-kangwoo',
      animated: true,
      label: sliderEpisode > 50 ? '아이기스 로열 락 & 14.50 Brix 독점 착정' : '피트니스 조련 및 정조대 체결',
      labelStyle: { fill: '#F43F5E', fontWeight: 600, fontSize: 10 },
      labelBgStyle: { fill: '#0A0A0C', fillOpacity: 0.9 },
      style: { stroke: '#F43F5E', strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#F43F5E' },
    },
    {
      id: 'e-bae-do',
      source: 'c-bae-jinhyeok',
      target: 'c-do-gunwoo',
      label: '50mm 쇠사슬 전속 사냥개 귀속',
      labelStyle: { fill: '#A8A29E', fontWeight: 500, fontSize: 10 },
      labelBgStyle: { fill: '#0A0A0C', fillOpacity: 0.9 },
      style: { stroke: '#78716C', strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#78716C' },
    },
    {
      id: 'e-kwon-bae',
      source: 'c-kwon-jaeha',
      target: 'c-bae-jinhyeok',
      label: sliderEpisode >= 56 ? '군·산 카르텔 동맹 (마스터 루틴 동기화)' : '보안 협약 체결 진행',
      labelStyle: { fill: '#10B981', fontWeight: 600, fontSize: 10 },
      labelBgStyle: { fill: '#0A0A0C', fillOpacity: 0.9 },
      style: { stroke: '#10B981', strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#10B981' },
    },
    {
      id: 'e-kwon-cha',
      source: 'c-kwon-jaeha',
      target: 'c-cha-seonwoo',
      animated: true,
      label: '텅스텐 목줄 ➔ 종신 복종 섭 (4K POV)',
      labelStyle: { fill: '#14B8A6', fontWeight: 600, fontSize: 10 },
      labelBgStyle: { fill: '#0A0A0C', fillOpacity: 0.9 },
      style: { stroke: '#14B8A6', strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#14B8A6' },
    },
    {
      id: 'e-gang-seo',
      source: 'c-gang-taegun',
      target: 'c-seo-hajin',
      animated: true,
      label: sliderEpisode > 15 ? '신체검열 ➔ 절대 복종 조련병 귀속' : '밀실 신체검열 착수',
      labelStyle: { fill: '#38BDF8', fontWeight: 600, fontSize: 10 },
      labelBgStyle: { fill: '#0A0A0C', fillOpacity: 0.9 },
      style: { stroke: '#38BDF8', strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#38BDF8' },
    },
    {
      id: 'e-hajin-song',
      source: 'c-seo-hajin',
      target: 'c-song-kangwoo',
      label: sliderEpisode >= 60 ? '《로열 넥타》 3:7 체액 융합 & 서열 사열' : '잠재적 크로스오버',
      labelStyle: { fill: '#EAB308', fontWeight: 600, fontSize: 10 },
      labelBgStyle: { fill: '#0A0A0C', fillOpacity: 0.9 },
      style: { stroke: '#EAB308', strokeWidth: 1.5, strokeDasharray: '4,4' },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#EAB308' },
    },
    {
      id: 'e-drjin-hankyul',
      source: 'c-dr-jin',
      target: 'c-han-kyul',
      label: '7cm 티타늄 정조대 봉인 처방',
      labelStyle: { fill: '#EC4899', fontWeight: 500, fontSize: 10 },
      labelBgStyle: { fill: '#0A0A0C', fillOpacity: 0.9 },
      style: { stroke: '#EC4899', strokeWidth: 1.5 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#EC4899' },
    },
    {
      id: 'e-taeo-yugeon',
      source: 'c-yoon-taeo',
      target: 'c-seo-yugeon',
      animated: true,
      label: '경호팀장 ➔ 패닉룸 밤의 절대 포식',
      labelStyle: { fill: '#F97316', fontWeight: 600, fontSize: 10 },
      labelBgStyle: { fill: '#0A0A0C', fillOpacity: 0.9 },
      style: { stroke: '#F97316', strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#F97316' },
    },
    {
      id: 'e-dojin-woogyeom',
      source: 'c-kwon-dojin',
      target: 'c-shin-woogyeom',
      animated: true,
      label: '그라운드 마운트 ➔ 킹카 후배 굴복',
      labelStyle: { fill: '#84CC16', fontWeight: 600, fontSize: 10 },
      labelBgStyle: { fill: '#0A0A0C', fillOpacity: 0.9 },
      style: { stroke: '#84CC16', strokeWidth: 1.5 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#84CC16' },
    },
    {
      id: 'e-sculptor-bae',
      source: 'c-sculptor',
      target: 'c-bae-jinhyeok',
      label: '특수 구속구 정밀 가공 납품',
      labelStyle: { fill: '#94A3B8', fontWeight: 500, fontSize: 9 },
      labelBgStyle: { fill: '#0A0A0C', fillOpacity: 0.9 },
      style: { stroke: '#94A3B8', strokeDasharray: '4,4' },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#94A3B8' },
    },
  ], [sliderEpisode]);

  // 필터 적용 노드 & 엣지
  const filteredNodes = useMemo(() => {
    if (activeFilter === 'all') return allNodes;
    if (activeFilter === 'military') {
      return allNodes.filter(n => n.data.category === 'military' || n.id === 'c-bae-jinhyeok');
    }
    if (activeFilter === 'entertainment') {
      return allNodes.filter(n => n.data.category === 'entertainment' || n.id === 'c-seo-hajin' || n.id === 'c-shadow-king');
    }
    if (activeFilter === 'medical') {
      return allNodes.filter(n => n.data.category === 'medical' || n.id === 'c-bae-jinhyeok');
    }
    if (activeFilter === 'noir_campus') {
      return allNodes.filter(n => n.data.category === 'noir_campus');
    }
    return allNodes;
  }, [allNodes, activeFilter]);

  const filteredNodeIds = useMemo(() => new Set(filteredNodes.map(n => n.id)), [filteredNodes]);

  const filteredEdges = useMemo(() => {
    return allEdges.filter(e => filteredNodeIds.has(e.source) && filteredNodeIds.has(e.target));
  }, [allEdges, filteredNodeIds]);

  return (
    <div className="w-full h-full flex flex-col bg-[#0A0A0C] border border-[#222228] rounded-xl overflow-hidden shadow-2xl">
      {/* 상단 컨트롤러: 회차 슬라이더 & 소속 카테고리 필터 */}
      <div className="px-6 py-4 bg-[#111116] border-b border-[#222228] flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#D4AF37]" />
              <h4 className="text-xs font-bold text-[#F3F3F5] uppercase tracking-wider">
                성황 유니버스 전 인물 입체 관계도 (20인 완전판)
              </h4>
            </div>
            <p className="text-[11px] text-[#A1A1AA] mt-0.5">
              관측 회차: <span className="text-[#D4AF37] font-bold">제 {sliderEpisode} 화</span> — {activeStage.stageName}
            </p>
          </div>

          <div className="flex items-center gap-4 w-full sm:w-80">
            <span className="text-[11px] text-[#71717A] font-semibold">Ep.1</span>
            <input
              type="range"
              min="1"
              max={maxEpisodes}
              value={sliderEpisode}
              onChange={handleSliderChange}
              className="w-full h-1.5 bg-[#27272F] rounded-lg appearance-none cursor-pointer accent-[#D4AF37]"
            />
            <span className="text-[11px] text-[#D4AF37] font-semibold">Ep.{maxEpisodes}</span>
          </div>
        </div>

        {/* 소속 카테고리 필터 탭 */}
        <div className="flex items-center gap-2 pt-1 border-t border-[#1C1C24] overflow-x-auto">
          <Filter className="w-3.5 h-3.5 text-[#71717A]" />
          <span className="text-[10px] text-[#71717A] uppercase font-bold mr-1">분류:</span>
          {[
            { id: 'all', label: '전체 보기 (20인 네트워크)' },
            { id: 'military', label: '군부 규율대 (심야)' },
            { id: 'entertainment', label: '엔터 & 카르텔 (무대)' },
            { id: 'medical', label: '메디컬 & 명기 코치' },
            { id: 'noir_campus', label: '오피스 & 캠퍼스 (낙인/서열)' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id as any)}
              className={`px-3 py-1 rounded text-[11px] font-semibold transition-all whitespace-nowrap ${
                activeFilter === f.id
                  ? 'bg-[#D4AF37] text-[#0A0A0C] shadow-sm'
                  : 'bg-[#181820] text-[#A1A1AA] hover:text-[#F3F3F5] border border-[#272730]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* React Flow 캔버스 */}
      <div className="flex-1 w-full min-h-[580px] relative bg-[#09090C]">
        <ReactFlow
          nodes={filteredNodes}
          edges={filteredEdges}
          fitView
          className="bg-[#09090C]"
        >
          <Background color="#1C1C24" gap={24} size={1} />
          <Controls className="bg-[#14141A] border border-[#272730] text-[#D4AF37] fill-[#D4AF37] rounded-lg overflow-hidden" />
        </ReactFlow>

        {/* 하단 범례 */}
        <div className="absolute bottom-4 left-4 bg-[#111116]/95 backdrop-blur-md border border-[#272730] p-3 rounded-lg text-xs space-y-1.5 shadow-xl">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37]" />
            <span className="text-[#E4E4E7]">카르텔 지배자 (Sovereign / Top-Dom)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span className="text-[#E4E4E7]">봉인된 제물 (Chastity Sub / Bottom-Sub)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span className="text-[#E4E4E7]">군·산 군사 지휘관 / 특무 장교</span>
          </div>
        </div>
      </div>
    </div>
  );
}

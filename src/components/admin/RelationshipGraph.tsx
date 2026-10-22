'use client';

import React, { useState, useMemo } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  Node,
  Edge,
  Connection,
  addEdge,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Sliders, Eye, Sparkles } from 'lucide-react';

interface RelationshipGraphProps {
  currentEpisode?: number;
  onEpisodeChange?: (ep: number) => void;
  maxEpisodes?: number;
}

// 회차별 관계 동적 변화 데이터
const EPISODE_STAGES = [
  {
    minEp: 1,
    maxEp: 5,
    stageName: '1단계: 첫 번째 굴복과 통제 착수',
    tag: '초기 탐색 및 통제',
    relGtoH: '신체검열 상관 ➔ 피검열자 (첫 번째 굴복)',
    relBtoG: 'VIP 클럽 배후 지령 하달',
    relHtoH: '형제간의 은밀한 안부 (위험 미감지)',
  },
  {
    minEp: 6,
    maxEp: 15,
    stageName: '2단계: 사격장 통제탑 밀실 의식',
    tag: '사각지대 종속화',
    relGtoH: '절대적 훈육자 ➔ 전용 조련병 (수치심 극대화)',
    relBtoG: '비밀 감찰 기록 납품 확인',
    relHtoH: '형 서하준의 의심 시작',
  },
  {
    minEp: 16,
    maxEp: 30,
    stageName: '3단계: 공식 사열과 영원한 서약',
    tag: '완전한 소유권 각인',
    relGtoH: '영구 복종 서약 ➔ 각인 완료 (탈출 불가)',
    relBtoG: '성황 최고위층의 독점 개체 인정',
    relHtoH: '형제 둘 다 성황의 덫에 포획됨',
  },
];

export default function RelationshipGraph({
  currentEpisode = 1,
  onEpisodeChange,
  maxEpisodes = 30,
}: RelationshipGraphProps) {
  const [sliderEpisode, setSliderEpisode] = useState<number>(currentEpisode);

  // 슬라이더 변경 핸들러
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setSliderEpisode(val);
    if (onEpisodeChange) onEpisodeChange(val);
  };

  // 현재 회차에 해당하는 스테이지 추출
  const activeStage = useMemo(() => {
    return (
      EPISODE_STAGES.find(s => sliderEpisode >= s.minEp && sliderEpisode <= s.maxEp) ||
      EPISODE_STAGES[EPISODE_STAGES.length - 1]
    );
  }, [sliderEpisode]);

  // 회차에 따라 동적으로 구성되는 노드 목록
  const nodes: Node[] = useMemo(() => [
    {
      id: 'c-gang-taegun',
      type: 'default',
      position: { x: 380, y: 180 },
      data: {
        label: (
          <div className="p-3 text-left">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-[#D4AF37]">강태건 (32세)</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40">
                Sovereign
              </span>
            </div>
            <p className="text-[11px] text-[#A1A1AA]">총괄 감찰관 / 189cm 86kg</p>
            <p className="text-[10px] text-zinc-400 mt-1">지배 성향: 절대 규율 및 심리 조련</p>
          </div>
        ),
      },
      style: {
        background: '#14141A',
        color: '#F4F4F5',
        border: '1.5px solid #D4AF37',
        borderRadius: '10px',
        width: 220,
        boxShadow: '0 0 20px rgba(212, 175, 55, 0.2)',
      },
    },
    {
      id: 'c-seo-hajin',
      type: 'default',
      position: { x: 380, y: 440 },
      data: {
        label: (
          <div className="p-3 text-left">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-rose-400">서하진 (24세)</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">
                Subject
              </span>
            </div>
            <p className="text-[11px] text-[#A1A1AA]">특무 조련병 / 182cm 74kg</p>
            <p className="text-[10px] text-zinc-400 mt-1">
              {sliderEpisode > 15 ? '상태: 완전 각인 및 종속화' : '상태: 굴복과 저항의 경계'}
            </p>
          </div>
        ),
      },
      style: {
        background: '#14141A',
        color: '#F4F4F5',
        border: '1.5px solid #F43F5E',
        borderRadius: '10px',
        width: 220,
        boxShadow: '0 0 20px rgba(244, 63, 94, 0.15)',
      },
    },
    {
      id: 'c-bae-jinhyeok',
      type: 'default',
      position: { x: 100, y: 80 },
      data: {
        label: (
          <div className="p-3 text-left">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-amber-300">배진혁 (48세)</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                VIP Patron
              </span>
            </div>
            <p className="text-[11px] text-[#A1A1AA]">성황 VIP 상임이사 / 184cm</p>
            <p className="text-[10px] text-zinc-400 mt-1">외형 30대 중반 유지 (체액 공급)</p>
          </div>
        ),
      },
      style: {
        background: '#121217',
        color: '#F4F4F5',
        border: '1.5px solid #EAB308',
        borderRadius: '10px',
        width: 210,
      },
    },
    {
      id: 'c-seo-hajun',
      type: 'default',
      position: { x: 680, y: 320 },
      data: {
        label: (
          <div className="p-3 text-left">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-cyan-400">서하준 (27세)</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                Captain
              </span>
            </div>
            <p className="text-[11px] text-[#A1A1AA]">육군 대위 (친형) / 186cm</p>
            <p className="text-[10px] text-zinc-400 mt-1">
              {sliderEpisode > 10 ? '동생의 은폐를 추적 중' : '동생의 안위를 염려함'}
            </p>
          </div>
        ),
      },
      style: {
        background: '#121217',
        color: '#F4F4F5',
        border: '1.5px solid #06B6D4',
        borderRadius: '10px',
        width: 210,
      },
    },
  ], [sliderEpisode]);

  // 회차별 동적 엣지(관계선)
  const edges: Edge[] = useMemo(() => [
    {
      id: 'e-g-h',
      source: 'c-gang-taegun',
      target: 'c-seo-hajin',
      animated: true,
      label: activeStage.relGtoH,
      labelStyle: { fill: '#F43F5E', fontWeight: 600, fontSize: 11 },
      labelBgStyle: { fill: '#0A0A0C', fillOpacity: 0.85 },
      style: { stroke: '#F43F5E', strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#F43F5E' },
    },
    {
      id: 'e-b-g',
      source: 'c-bae-jinhyeok',
      target: 'c-gang-taegun',
      label: activeStage.relBtoG,
      labelStyle: { fill: '#D4AF37', fontWeight: 500, fontSize: 10 },
      labelBgStyle: { fill: '#0A0A0C', fillOpacity: 0.8 },
      style: { stroke: '#D4AF37', strokeDasharray: '4,4' },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#D4AF37' },
    },
    {
      id: 'e-h-h',
      source: 'c-seo-hajun',
      target: 'c-seo-hajin',
      label: activeStage.relHtoH,
      labelStyle: { fill: '#06B6D4', fontWeight: 500, fontSize: 10 },
      labelBgStyle: { fill: '#0A0A0C', fillOpacity: 0.8 },
      style: { stroke: '#06B6D4', strokeWidth: 1.5 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#06B6D4' },
    },
  ], [activeStage]);

  return (
    <div className="w-full h-full flex flex-col bg-[#0A0A0C] border border-[#222228] rounded-xl overflow-hidden shadow-2xl">
      {/* 회차 슬라이더 컨트롤러 */}
      <div className="px-6 py-4 bg-[#111116] border-b border-[#222228] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#D4AF37]" />
            <h4 className="text-xs font-bold text-[#F3F3F5] uppercase tracking-wider">
              회차별 인물 관계 동적 시뮬레이터 (스포일러 락)
            </h4>
          </div>
          <p className="text-[11px] text-[#A1A1AA] mt-0.5">
            현재 관측 회차: <span className="text-[#D4AF37] font-bold">제 {sliderEpisode} 화</span> — {activeStage.stageName}
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

      {/* React Flow 캔버스 */}
      <div className="flex-1 w-full min-h-[520px] relative bg-[#09090C]">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          fitView
          className="bg-[#09090C]"
        >
          <Background color="#1C1C24" gap={24} size={1} />
          <Controls className="bg-[#14141A] border border-[#272730] text-[#D4AF37] fill-[#D4AF37] rounded-lg overflow-hidden" />
        </ReactFlow>

        {/* 하단 플로팅 범례 */}
        <div className="absolute bottom-4 left-4 bg-[#111116]/90 backdrop-blur-md border border-[#272730] px-4 py-2.5 rounded-lg text-xs space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37]" />
            <span className="text-[#E4E4E7]">지배자 (Sovereign)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span className="text-[#E4E4E7]">피지배자 / 조련병 (Subject)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            <span className="text-[#E4E4E7]">외부 추적자 / 장교 (Captain)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

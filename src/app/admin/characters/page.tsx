'use client';

import { useState, useEffect } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { Users, Plus, Shield, Ruler, Flame, Sparkles, X, Check } from 'lucide-react';
import { Character } from '@/lib/types';

export default function CharactersPage() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetch('/api/sync-assets')
      .then(res => res.json())
      .then(data => {
        if (data.dataset?.characters) {
          setCharacters(data.dataset.characters);
        }
      })
      .catch(console.error);
  }, []);

  const handleOpenEdit = (ch: Character) => {
    setSelectedCharacter({ ...ch });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!selectedCharacter) return;
    setCharacters(prev =>
      prev.map(c => (c.id === selectedCharacter.id ? selectedCharacter : c))
    );
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-[#F3F3F5] flex">
      <AdminSidebar />

      <main className="flex-1 ml-64 flex flex-col min-h-screen">
        <AdminHeader
          title="인물 정밀 명세서 및 비공개 아나토미"
          subtitle="성황 유니버스 등장인물 규격, 성흔, 비공개 신체 수치 및 서열 아카이브"
        />

        <div className="p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#F3F3F5]">
                Canon 인물 아카이브 ({characters.length}명)
              </h3>
              <p className="text-xs text-[#71717A] mt-0.5">
                외형 스펙, 아나토미 정밀 수치, 성흔 및 구속구 설정
              </p>
            </div>
          </div>

          {/* 인물 카드 그리드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {characters.map(ch => (
              <div
                key={ch.id}
                className="p-6 rounded-xl bg-[#111116] border border-[#222228] hover:border-[#D4AF37]/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-lg font-bold text-[#F3F3F5]">{ch.name}</h4>
                        <span className="text-[11px] px-2 py-0.5 rounded bg-[#D4AF37]/15 text-[#D4AF37] font-semibold border border-[#D4AF37]/30">
                          {ch.role}
                        </span>
                      </div>
                      <p className="text-xs text-[#A1A1AA] mt-1">{ch.appearance}</p>
                    </div>

                    <button
                      onClick={() => handleOpenEdit(ch)}
                      className="px-3 py-1 rounded bg-[#1C1C24] hover:bg-[#272732] text-xs text-[#E4E4E7] border border-[#2E2E38] transition-colors"
                    >
                      상세 규격 수정
                    </button>
                  </div>

                  <hr className="my-4 border-[#1C1C24]" />

                  {/* 아나토미 및 비공개 스펙 박스 */}
                  <div className="bg-[#0A0A0E] p-4 rounded-lg border border-[#1E1E26] space-y-2.5">
                    <div className="flex items-center gap-1.5 text-xs text-[#D4AF37] font-bold">
                      <Ruler className="w-3.5 h-3.5" />
                      <span>비공개 아나토미 & 특수 규격</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-[#71717A] block">신장 / 체중</span>
                        <span className="text-[#E4E4E7] font-medium">
                          {ch.anatomy_specs?.height}cm / {ch.anatomy_specs?.weight}kg
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#71717A] block">VIP 서열</span>
                        <span className="text-[#E4E4E7] font-medium truncate block">
                          {ch.anatomy_specs?.rank_tier || '미정'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#71717A] block">비공개 치수 / 형상</span>
                        <span className="text-rose-300 font-semibold block truncate">
                          {ch.anatomy_specs?.anatomy_length || '비공개'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#71717A] block">전용 구속 / 규율 아이템</span>
                        <span className="text-amber-300 font-medium block truncate">
                          {ch.anatomy_specs?.restraint_item || '없음'}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#181820]">
                      <span className="text-[10px] text-[#71717A] block">비밀 성흔(Stigma) 및 신체 흔적</span>
                      <p className="text-xs text-rose-400 font-medium mt-0.5">
                        {ch.anatomy_specs?.secret_stigma || '기록 없음'}
                      </p>
                    </div>

                    {ch.anatomy_specs?.scent && (
                      <div className="pt-1">
                        <span className="text-[10px] text-[#71717A] block">고유 체취 / 향</span>
                        <p className="text-xs text-[#A1A1AA]">{ch.anatomy_specs.scent}</p>
                      </div>
                    )}
                  </div>

                  <div className="mt-4">
                    <span className="text-[10px] text-[#71717A] uppercase font-bold block mb-1">
                      심리 / 행동 패턴
                    </span>
                    <p className="text-xs text-[#A1A1AA] leading-relaxed">
                      {ch.personality}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* 인물 명세서 수정 모달 */}
      {isModalOpen && selectedCharacter && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111116] border border-[#2B2B36] rounded-xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#222228]">
              <h3 className="text-base font-bold text-[#F3F3F5] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                {selectedCharacter.name} - 정밀 명세서 편집
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
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
                    value={selectedCharacter.name}
                    onChange={e => setSelectedCharacter({ ...selectedCharacter, name: e.target.value })}
                    className="w-full bg-[#0A0A0C] border border-[#272730] rounded-lg px-3 py-2 text-[#F3F3F5]"
                  />
                  <input
                    type="text"
                    value={selectedCharacter.role}
                    onChange={e => setSelectedCharacter({ ...selectedCharacter, role: e.target.value })}
                    className="w-full bg-[#0A0A0C] border border-[#272730] rounded-lg px-3 py-2 text-[#F3F3F5]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#A1A1AA] mb-1">신장 (cm) / 체중 (kg)</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={selectedCharacter.anatomy_specs?.height || 180}
                    onChange={e =>
                      setSelectedCharacter({
                        ...selectedCharacter,
                        anatomy_specs: {
                          ...selectedCharacter.anatomy_specs,
                          height: parseInt(e.target.value, 10),
                        },
                      })
                    }
                    className="w-full bg-[#0A0A0C] border border-[#272730] rounded-lg px-3 py-2 text-[#F3F3F5]"
                  />
                  <input
                    type="number"
                    value={selectedCharacter.anatomy_specs?.weight || 75}
                    onChange={e =>
                      setSelectedCharacter({
                        ...selectedCharacter,
                        anatomy_specs: {
                          ...selectedCharacter.anatomy_specs,
                          weight: parseInt(e.target.value, 10),
                        },
                      })
                    }
                    className="w-full bg-[#0A0A0C] border border-[#272730] rounded-lg px-3 py-2 text-[#F3F3F5]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#A1A1AA] mb-1">VIP 서열 티어 (클럽 내부 전용)</label>
                <input
                  type="text"
                  value={selectedCharacter.anatomy_specs?.rank_tier || ''}
                  onChange={e =>
                    setSelectedCharacter({
                      ...selectedCharacter,
                      anatomy_specs: {
                        ...selectedCharacter.anatomy_specs,
                        rank_tier: e.target.value,
                      },
                    })
                  }
                  className="w-full bg-[#0A0A0C] border border-[#272730] rounded-lg px-3 py-2 text-[#F3F3F5]"
                />
              </div>

              <div>
                <label className="block text-[#A1A1AA] mb-1">비공개 아나토미 치수 및 형상</label>
                <input
                  type="text"
                  value={selectedCharacter.anatomy_specs?.anatomy_length || ''}
                  onChange={e =>
                    setSelectedCharacter({
                      ...selectedCharacter,
                      anatomy_specs: {
                        ...selectedCharacter.anatomy_specs,
                        anatomy_length: e.target.value,
                      },
                    })
                  }
                  className="w-full bg-[#0A0A0C] border border-[#272730] rounded-lg px-3 py-2 text-[#F3F3F5]"
                />
              </div>

              <div>
                <label className="block text-[#A1A1AA] mb-1">비밀 성흔(Stigma) 및 신체 흔적</label>
                <input
                  type="text"
                  value={selectedCharacter.anatomy_specs?.secret_stigma || ''}
                  onChange={e =>
                    setSelectedCharacter({
                      ...selectedCharacter,
                      anatomy_specs: {
                        ...selectedCharacter.anatomy_specs,
                        secret_stigma: e.target.value,
                      },
                    })
                  }
                  className="w-full bg-[#0A0A0C] border border-[#272730] rounded-lg px-3 py-2 text-[#F3F3F5]"
                />
              </div>

              <div>
                <label className="block text-[#A1A1AA] mb-1">외형 묘사</label>
                <textarea
                  rows={2}
                  value={selectedCharacter.appearance}
                  onChange={e => setSelectedCharacter({ ...selectedCharacter, appearance: e.target.value })}
                  className="w-full bg-[#0A0A0C] border border-[#272730] rounded-lg px-3 py-2 text-[#F3F3F5]"
                />
              </div>

              <div>
                <label className="block text-[#A1A1AA] mb-1">심리 / 성격 묘사</label>
                <textarea
                  rows={3}
                  value={selectedCharacter.personality}
                  onChange={e => setSelectedCharacter({ ...selectedCharacter, personality: e.target.value })}
                  className="w-full bg-[#0A0A0C] border border-[#272730] rounded-lg px-3 py-2 text-[#F3F3F5]"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-[#222228] flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-[#1C1C24] hover:bg-[#272730] text-xs text-[#A1A1AA]"
              >
                취소
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 rounded-lg bg-[#D4AF37] hover:bg-[#C29E2E] text-xs font-bold text-[#0A0A0C] flex items-center gap-1.5"
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

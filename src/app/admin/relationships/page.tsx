'use client';

import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import RelationshipGraph from '@/components/admin/RelationshipGraph';

export default function RelationshipsPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0C] text-[#F3F3F5] flex">
      <AdminSidebar />

      <main className="flex-1 ml-64 flex flex-col min-h-screen">
        <AdminHeader
          title="성황 유니버스 인물 입체 관계도 맵"
          subtitle="@xyflow/react 기반 회차별 동적 관계 시뮬레이터 (스포일러 방지 락 탑재)"
        />

        <div className="p-8 flex-1 flex flex-col">
          <div className="flex-1 min-h-[680px]">
            <RelationshipGraph maxEpisodes={60} />
          </div>
        </div>
      </main>
    </div>
  );
}

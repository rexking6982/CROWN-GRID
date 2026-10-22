import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CROWN GRID | 크라운 그리드 - 유니버스 관리 & 보안 열람 스튜디오',
  description: '성황 유니버스 다중 유니버스 관리(CMS), AI 창작자 스튜디오 및 포렌식 보안 열람 플랫폼',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className="dark">
      <body className="bg-[#0A0A0C] text-[#F3F3F5] antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}

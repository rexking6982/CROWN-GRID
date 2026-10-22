import { NextResponse } from 'next/server';
import { analyzeEpisodeContent } from '@/lib/gemini';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { seriesTitle, episodeNum, episodeTitle, content, preferredModel } = body;

    if (!content) {
      return NextResponse.json(
        { success: false, error: '본문 내용(content)이 제공되지 않았습니다.' },
        { status: 400 }
      );
    }

    const analysisResult = await analyzeEpisodeContent(
      seriesTitle || '성황 유니버스',
      episodeNum || 1,
      episodeTitle || '무제',
      content,
      preferredModel
    );

    return NextResponse.json({
      success: true,
      analysis: analysisResult,
    });
  } catch (err: any) {
    console.error('Process episode error:', err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

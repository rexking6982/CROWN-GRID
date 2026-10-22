import { NextResponse } from 'next/server';
import { getUniverseDataset } from '@/lib/sync-assets';
import { getEmbedding, cosineSimilarity } from '@/lib/gemini';

export async function POST(req: Request) {
  try {
    const { query, topK = 5 } = await req.json();

    if (!query) {
      return NextResponse.json(
        { success: false, error: '검색 쿼리가 없습니다.' },
        { status: 400 }
      );
    }

    const dataset = await getUniverseDataset();
    if (!dataset || !dataset.episodes) {
      return NextResponse.json(
        { success: false, error: '동기화된 유니버스 데이터가 없습니다.' },
        { status: 500 }
      );
    }

    const queryVec = await getEmbedding(query);

    // 각 에피소드 및 설정집에서 관련 단락 매칭
    const scoredResults: Array<{
      episodeNumber: number;
      episodeTitle: string;
      seriesId: string;
      similarity: number;
      snippet: string;
    }> = [];

    // 151개 에피소드 대상 검색
    for (const ep of dataset.episodes) {
      const content = ep.content || '';
      // 키워드 직접 포함 가중치
      const keywordBoost = content.includes(query) ? 0.35 : 0;

      // 앞부분 및 키워드 주변 스니펫 추출
      let snippet = content.slice(0, 300);
      const queryIdx = content.indexOf(query);
      if (queryIdx !== -1) {
        const start = Math.max(0, queryIdx - 100);
        snippet = '...' + content.slice(start, start + 300) + '...';
      }

      // 임베딩 유사도 계산
      const epVec = await getEmbedding(ep.title + ' ' + content.slice(0, 500));
      const sim = cosineSimilarity(queryVec, epVec) + keywordBoost;

      scoredResults.push({
        episodeNumber: ep.episode_number,
        episodeTitle: ep.title,
        seriesId: ep.series_id,
        similarity: Math.min(0.99, sim),
        snippet,
      });
    }

    // 유사도 내림차순 정렬 및 Top K 추출
    scoredResults.sort((a, b) => b.similarity - a.similarity);
    const topResults = scoredResults.slice(0, topK);

    return NextResponse.json({
      success: true,
      query,
      results: topResults,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { runUniverseCharacterCensus } from '@/lib/character-census';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const censusData = runUniverseCharacterCensus();
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      ...censusData,
    });
  } catch (error: any) {
    console.error('Character census failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || '인물 전수조사 중 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { decodeZeroWidthToString } from '@/lib/steganography';

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json(
        { success: false, error: '분석할 텍스트가 제공되지 않았습니다.' },
        { status: 400 }
      );
    }

    const decodedPayload = decodeZeroWidthToString(text);

    if (!decodedPayload) {
      return NextResponse.json({
        success: false,
        found: false,
        message: '텍스트에서 제로 너비 포렌식 워터마크를 발견하지 못했습니다. (비인증 복제본이거나 일반 텍스트)',
      });
    }

    // 페이로드 구조: "USER:xxxx|IP:xxxx|TIME:xxxx"
    const parts = decodedPayload.split('|');
    const meta: Record<string, string> = {};
    for (const p of parts) {
      const [k, v] = p.split(':');
      if (k && v) meta[k.trim()] = v.trim();
    }

    return NextResponse.json({
      success: true,
      found: true,
      rawPayload: decodedPayload,
      meta,
      detectedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { buildImageUrl, ImageGenerationOptions } from '@/lib/image-generator';

export async function POST(req: Request) {
  try {
    const body: ImageGenerationOptions = await req.json();

    if (!body.prompt) {
      return NextResponse.json(
        { success: false, error: '프롬프트(prompt)가 비어 있습니다.' },
        { status: 400 }
      );
    }

    const imageUrl = buildImageUrl(body);

    return NextResponse.json({
      success: true,
      imageUrl,
      aspectRatio: body.aspectRatio || '16:9',
      cost: '0 KRW (100% 무료 무제한)',
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

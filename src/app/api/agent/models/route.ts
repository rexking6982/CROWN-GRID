import { NextResponse } from 'next/server';
import { AVAILABLE_MODELS } from '@/lib/gemini';

export async function GET() {
  return NextResponse.json({
    success: true,
    models: Object.values(AVAILABLE_MODELS),
  });
}

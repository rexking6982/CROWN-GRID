import { NextResponse } from 'next/server';
import { syncAssetsFromLocal, getUniverseDataset } from '@/lib/sync-assets';

export async function POST() {
  try {
    const result = await syncAssetsFromLocal();
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const dataset = await getUniverseDataset();
    return NextResponse.json({ success: true, dataset });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

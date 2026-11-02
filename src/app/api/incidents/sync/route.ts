import { NextResponse } from 'next/server';
import { googleSheetsProvider } from '@/lib/data/googleSheetsProvider';

export async function POST() {
  try {
    const result = await googleSheetsProvider.syncData();
    return NextResponse.json({
      success: result.success,
      recordCount: result.recordCount,
      timestamp: result.timestamp,
      message: result.success
        ? `Successfully synchronized ${result.recordCount} records from Google Sheets master.`
        : 'Synchronized with local operational fallback dataset.',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Sync failed';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

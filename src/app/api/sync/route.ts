import { NextResponse } from 'next/server';
import { loadState, saveState } from '@/lib/storage/fs-storage';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const state = await loadState();
        return NextResponse.json(state || {});
    } catch (error) {
        console.error('Failed to load state:', error);
        return NextResponse.json({ error: 'Failed to load state' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        await saveState(body);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to save state:', error);
        return NextResponse.json({ error: 'Failed to save state' }, { status: 500 });
    }
}

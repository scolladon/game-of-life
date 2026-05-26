/**
 * Route API persistance — pont entre l UI (client) et le repository Node.
 *
 * - `POST /api/state`  : sauvegarde un snapshot (saveState).
 * - `GET  /api/state`  : renvoie le dernier snapshot (loadLatestState) ou 204.
 *
 * Runtime forcé en `nodejs` parce que `better-sqlite3` est un binding natif —
 * incompatible avec l Edge runtime de Next.
 */

import { NextResponse } from 'next/server';
import type { Grid } from '@/core/grid';
import { loadLatestState, saveState } from '@/lib/persistence/repository';

export const runtime = 'nodejs';

interface SaveStateBody {
  readonly patternName: string;
  readonly generation: number;
  readonly ruleName: string;
  readonly grid: Grid;
}

function isValidBody(value: unknown): value is SaveStateBody {
  if (value === null || typeof value !== 'object') return false;
  const candidate = value as Partial<SaveStateBody>;
  return (
    typeof candidate.patternName === 'string' &&
    typeof candidate.generation === 'number' &&
    typeof candidate.ruleName === 'string' &&
    Array.isArray(candidate.grid)
  );
}

export async function POST(request: Request): Promise<Response> {
  const body = (await request.json()) as unknown;
  if (!isValidBody(body)) {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }
  const saved = await saveState(body);
  return NextResponse.json({ id: saved.id, createdAt: saved.createdAt }, { status: 201 });
}

export async function GET(): Promise<Response> {
  const latest = await loadLatestState();
  if (!latest) {
    return new NextResponse(null, { status: 204 });
  }
  return NextResponse.json(latest, { status: 200 });
}

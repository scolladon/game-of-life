/**
 * Route API patterns (§4.2 — Cloud Patterns).
 *
 * - `POST /api/patterns`           : crée un pattern.
 * - `GET  /api/patterns?limit=50`  : liste les N derniers (tri created_at DESC).
 *
 * Runtime forcé en `nodejs` parce que `better-sqlite3` est un binding natif —
 * incompatible avec l'Edge runtime de Next.
 */

import { NextResponse } from 'next/server';
import type { Grid } from '@/core/grid';
import { createPattern, listPatterns } from '@/lib/persistence/patterns-repository';

export const runtime = 'nodejs';

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;

interface CreatePatternBody {
  readonly name: string;
  readonly grid: Grid;
  readonly ruleName: string;
  readonly authorToken: string;
  readonly authorDisplayName: string;
}

function isValidBody(value: unknown): value is CreatePatternBody {
  if (value === null || typeof value !== 'object') return false;
  const candidate = value as Partial<CreatePatternBody>;
  return (
    typeof candidate.name === 'string' &&
    candidate.name.trim().length > 0 &&
    Array.isArray(candidate.grid) &&
    typeof candidate.ruleName === 'string' &&
    typeof candidate.authorToken === 'string' &&
    candidate.authorToken.trim().length > 0 &&
    typeof candidate.authorDisplayName === 'string'
  );
}

function parseLimit(raw: string | null): number {
  if (raw === null) return DEFAULT_LIMIT;
  const parsed = Number.parseInt(raw, 10);
  if (Number.isNaN(parsed) || parsed <= 0) return DEFAULT_LIMIT;
  return Math.min(parsed, MAX_LIMIT);
}

export async function POST(request: Request): Promise<Response> {
  const body = (await request.json()) as unknown;
  if (!isValidBody(body)) {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }
  const saved = await createPattern(body);
  return NextResponse.json({ id: saved.id, createdAt: saved.createdAt }, { status: 201 });
}

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const limit = parseLimit(url.searchParams.get('limit'));
  const list = await listPatterns(limit);
  return NextResponse.json({ patterns: list }, { status: 200 });
}

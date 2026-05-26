/**
 * Wrapper isomorphe autour du Web Worker `step.worker.ts` (§4.2 — Speed Demon).
 *
 * - Côté browser supporté : instancie le worker (lazy, à la première
 *   invocation), marshall les messages, retourne une `Promise<Grid>`.
 * - Côté SSR / Node / tests : fallback synchrone via `step()` direct.
 *
 * Préserve une API stable pour le hook `use-simulator` : `computeNextGrid`
 * est toujours une Promise, le caller peut `await` sans se soucier du
 * substrat.
 */

import type { Grid } from '@/core/grid';
import type { Rule } from '@/core/rules';
import { step } from '@/core/step';
import type { StepWorkerRequest, StepWorkerResponse } from '@/workers/step.worker';

export function isWorkerSupported(): boolean {
  return typeof Worker !== 'undefined' && typeof window !== 'undefined';
}

interface PendingResolver {
  readonly resolve: (grid: Grid) => void;
  readonly reject: (error: unknown) => void;
}

let cachedWorker: Worker | null = null;
let nextRequestId = 1;
const pending = new Map<number, PendingResolver>();

function getOrCreateWorker(): Worker {
  if (cachedWorker) return cachedWorker;
  const worker = new Worker(new URL('@/workers/step.worker', import.meta.url), {
    type: 'module',
  });
  worker.onmessage = (event: MessageEvent<StepWorkerResponse>) => {
    const { requestId, grid } = event.data;
    const resolver = pending.get(requestId);
    if (!resolver) return;
    pending.delete(requestId);
    resolver.resolve(grid);
  };
  worker.onerror = (event: ErrorEvent) => {
    // Tout reject en attente échoue avec l'erreur worker. La valeur du
    // requestId n'est pas portée par l'événement → on flush la map.
    const error = new Error(event.message || 'Web Worker error');
    for (const [id, resolver] of pending) {
      pending.delete(id);
      resolver.reject(error);
    }
  };
  cachedWorker = worker;
  return worker;
}

export function computeNextGrid(grid: Grid, rule: Rule): Promise<Grid> {
  if (!isWorkerSupported()) {
    return Promise.resolve(step(grid, rule));
  }
  const worker = getOrCreateWorker();
  const requestId = nextRequestId++;
  const request: StepWorkerRequest = { requestId, grid, ruleName: rule.name };
  return new Promise<Grid>((resolve, reject) => {
    pending.set(requestId, { resolve, reject });
    worker.postMessage(request);
  });
}

/**
 * Réinitialise le worker (utile en tests pour repartir d'un état propre).
 */
export function resetWorker(): void {
  if (cachedWorker) {
    cachedWorker.terminate();
    cachedWorker = null;
  }
  pending.clear();
  nextRequestId = 1;
}

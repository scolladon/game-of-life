import { describe, expect, it, vi } from 'vitest';
import type { Grid } from '@/core/grid';
import { ALIVE_COLOR, CELL_SIZE, DEAD_COLOR, drawGrid } from './Board.draw';

interface ContextStub {
  fillStyle: string;
  strokeStyle: string;
  lineWidth: number;
  fillRect: ReturnType<typeof vi.fn>;
  beginPath: ReturnType<typeof vi.fn>;
  moveTo: ReturnType<typeof vi.fn>;
  lineTo: ReturnType<typeof vi.fn>;
  stroke: ReturnType<typeof vi.fn>;
}

function createCanvasStub(): { canvas: HTMLCanvasElement; context: ContextStub } {
  const context: ContextStub = {
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 0,
    fillRect: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
  };
  const canvas = {
    width: 0,
    height: 0,
    getContext: vi.fn(() => context),
  } as unknown as HTMLCanvasElement;
  return { canvas, context };
}

const O = true;
const _ = false;
const BLINKER: Grid = [
  [_, _, _],
  [O, O, O],
  [_, _, _],
];

describe('drawGrid', () => {
  it('given a grid when drawn then sizes the canvas from columns and rows', () => {
    const { canvas } = createCanvasStub();

    drawGrid(canvas, BLINKER);

    expect(canvas.width).toBe(3 * CELL_SIZE);
    expect(canvas.height).toBe(3 * CELL_SIZE);
  });

  it('given a grid when drawn then paints background then alive cells', () => {
    const { canvas, context } = createCanvasStub();

    drawGrid(canvas, BLINKER);

    const backgroundCall = context.fillRect.mock.calls[0];
    expect(backgroundCall).toEqual([0, 0, 3 * CELL_SIZE, 3 * CELL_SIZE]);
    const aliveCalls = context.fillRect.mock.calls.slice(1);
    expect(aliveCalls).toHaveLength(3);
    expect(aliveCalls[0]).toEqual([0, CELL_SIZE, CELL_SIZE, CELL_SIZE]);
  });

  it('given a grid when drawn then uses the alive and dead colors', () => {
    const { canvas, context } = createCanvasStub();

    drawGrid(canvas, BLINKER);

    expect(context.fillStyle).toBe(ALIVE_COLOR);
    expect([DEAD_COLOR, ALIVE_COLOR]).toContain(DEAD_COLOR);
  });

  it('given a canvas without a 2D context when drawn then exits silently', () => {
    const canvas = {
      width: 0,
      height: 0,
      getContext: vi.fn(() => null),
    } as unknown as HTMLCanvasElement;

    expect(() => drawGrid(canvas, BLINKER)).not.toThrow();
  });
});

import type { Grid } from '@/core/grid';
import { getActivePalette, themeTokens } from '@/lib/theme/tokens';

export const CELL_SIZE = 24;

// §4.2 — Glow Up : les couleurs viennent de `themeTokens` (palette nommée).
// Les exports `ALIVE_COLOR` / `DEAD_COLOR` / `GRID_LINE_COLOR` restent
// disponibles pour compatibilité — ils pointent désormais sur la palette
// claire (état initial du DOM côté SSR).
export const ALIVE_COLOR = themeTokens.light.cellAlive;
export const DEAD_COLOR = themeTokens.light.cellDead;
export const GRID_LINE_COLOR = '#e4e4e7';

function paintBackground(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  deadColor: string,
): void {
  context.fillStyle = deadColor;
  context.fillRect(0, 0, width, height);
}

function paintAliveCells(context: CanvasRenderingContext2D, grid: Grid, aliveColor: string): void {
  context.fillStyle = aliveColor;
  for (let y = 0; y < grid.length; y += 1) {
    const row = grid[y];
    if (!row) continue;
    for (let x = 0; x < row.length; x += 1) {
      if (row[x]) {
        context.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      }
    }
  }
}

function paintGridLines(context: CanvasRenderingContext2D, cols: number, rows: number): void {
  context.strokeStyle = GRID_LINE_COLOR;
  context.lineWidth = 1;
  for (let x = 0; x <= cols; x += 1) {
    context.beginPath();
    context.moveTo(x * CELL_SIZE + 0.5, 0);
    context.lineTo(x * CELL_SIZE + 0.5, rows * CELL_SIZE);
    context.stroke();
  }
  for (let y = 0; y <= rows; y += 1) {
    context.beginPath();
    context.moveTo(0, y * CELL_SIZE + 0.5);
    context.lineTo(cols * CELL_SIZE, y * CELL_SIZE + 0.5);
    context.stroke();
  }
}

export function drawGrid(canvas: HTMLCanvasElement, grid: Grid): void {
  const context = canvas.getContext('2d');
  if (!context) return;
  const palette = getActivePalette();
  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;
  canvas.width = cols * CELL_SIZE;
  canvas.height = rows * CELL_SIZE;
  paintBackground(context, canvas.width, canvas.height, palette.cellDead);
  paintAliveCells(context, grid, palette.cellAlive);
  paintGridLines(context, cols, rows);
}

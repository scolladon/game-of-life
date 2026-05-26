'use client';

interface SimulatorControlsProps {
  readonly isRunning: boolean;
  readonly speedMs: number;
  readonly onPlay: () => void;
  readonly onPause: () => void;
  readonly onStep: () => void;
  readonly onReset: () => void;
  readonly onSpeedChange: (speedMs: number) => void;
  readonly onSave: () => void | Promise<void>;
}

const BUTTON_CLASS =
  'rounded border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-900 hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800';

export function SimulatorControls({
  isRunning,
  speedMs,
  onPlay,
  onPause,
  onStep,
  onReset,
  onSpeedChange,
  onSave,
}: SimulatorControlsProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <button type="button" className={BUTTON_CLASS} onClick={onPlay} disabled={isRunning}>
        Play
      </button>
      <button type="button" className={BUTTON_CLASS} onClick={onPause} disabled={!isRunning}>
        Pause
      </button>
      <button type="button" className={BUTTON_CLASS} onClick={onStep} disabled={isRunning}>
        Step
      </button>
      <button type="button" className={BUTTON_CLASS} onClick={onReset}>
        Reset
      </button>
      <button type="button" className={BUTTON_CLASS} onClick={() => void onSave()}>
        Save state
      </button>
      <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
        <span>Speed</span>
        <input
          type="range"
          min={50}
          max={1000}
          step={50}
          value={speedMs}
          onChange={(event) => onSpeedChange(Number(event.target.value))}
          className="h-1.5 w-32 cursor-pointer appearance-none rounded bg-zinc-300 dark:bg-zinc-700"
        />
        <span className="font-mono text-xs tabular-nums">{speedMs}ms</span>
      </label>
    </div>
  );
}

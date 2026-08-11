export type AudioResumeScheduler = Readonly<{
  schedule: (callback: () => void, delayMs: number) => unknown;
  cancel: (timer: unknown) => void;
}>;

const browserScheduler: AudioResumeScheduler = {
  schedule: (callback, delayMs) => window.setTimeout(callback, delayMs),
  cancel: (timer) => window.clearTimeout(timer as number),
};

export type ResumableAudioContext = Pick<AudioContext, 'resume' | 'state'>;

function isRunning(context: ResumableAudioContext): boolean {
  return context.state === 'running';
}

/** Resume an existing context without letting a stalled browser promise block the intro. */
export async function resumeAudioContext(
  context: ResumableAudioContext,
  timeoutMs: number,
  scheduler: AudioResumeScheduler = browserScheduler,
): Promise<boolean> {
  if (isRunning(context)) return true;

  let resumeTimer: unknown;
  const resumed = await Promise.race([
    context.resume().then(() => isRunning(context)).catch(() => false),
    new Promise<false>((resolve) => {
      resumeTimer = scheduler.schedule(() => resolve(false), timeoutMs);
    }),
  ]);
  if (resumeTimer !== undefined) scheduler.cancel(resumeTimer);
  return resumed && isRunning(context);
}

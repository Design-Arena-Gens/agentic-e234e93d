export type DetectionParams = {
  staWindow: number; // samples
  ltaWindow: number; // samples
  triggerRatio: number; // STA/LTA threshold
  detrend?: boolean;
};

export type DetectionEvent = { startIndex: number; endIndex: number | null; startTime: number; endTime: number | null; maxRatio: number };

export function staltaDetect(activity: number[], times: number[], params: DetectionParams): { ratios: number[]; events: DetectionEvent[] } {
  const { staWindow, ltaWindow, triggerRatio } = params;
  const n = activity.length;
  const ratios: number[] = new Array(n).fill(0);
  const staBuf: number[] = [];
  const ltaBuf: number[] = [];
  let events: DetectionEvent[] = [];
  let current: DetectionEvent | null = null;

  for (let i = 0; i < n; i++) {
    const x = Math.max(activity[i], 0);
    staBuf.push(x);
    if (staBuf.length > staWindow) staBuf.shift();
    ltaBuf.push(x);
    if (ltaBuf.length > ltaWindow) ltaBuf.shift();

    const sta = staBuf.reduce((a, b) => a + b, 0) / Math.max(staBuf.length, 1);
    const lta = ltaBuf.reduce((a, b) => a + b, 0) / Math.max(ltaBuf.length, 1e-9);
    const ratio = lta > 1e-9 ? sta / lta : 0;
    ratios[i] = ratio;

    if (!current && ratio >= triggerRatio && i >= ltaWindow) {
      current = { startIndex: i, endIndex: null, startTime: times[i], endTime: null, maxRatio: ratio };
    }
    if (current) {
      current.maxRatio = Math.max(current.maxRatio, ratio);
      // simple end condition: ratio falls back below 1
      if (ratio < 1 && i > current.startIndex + staWindow) {
        current.endIndex = i;
        current.endTime = times[i];
        events.push(current);
        current = null;
      }
    }
  }
  if (current) events.push(current);
  return { ratios, events };
}

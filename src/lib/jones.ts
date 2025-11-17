import { Complex, complex, add, sub, mul, conj, abs, det2x2, arg } from "@/lib/complex";

export type JonesMatrix = [Complex, Complex, Complex, Complex]; // [a,b,c,d] row-major
export type JonesSample = { t: number; J: JonesMatrix };

export type MetricSample = {
  t: number;
  detMag: number;
  detPhase: number;
  frobNorm: number;
  cond: number;
  activity: number;
};

const EPS = 1e-12;

export function parseJonesCsv(text: string): JonesSample[] {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const samples: JonesSample[] = [];
  // Expected header: t,a_re,a_im,b_re,b_im,c_re,c_im,d_re,d_im
  const start = lines[0].toLowerCase().includes("a_re") ? 1 : 0;
  for (let i = start; i < lines.length; i++) {
    const parts = lines[i].split(/[,\t]/).map((p) => p.trim());
    if (parts.length < 9) continue;
    const t = Number(parts[0]);
    const a = complex(Number(parts[1]), Number(parts[2]));
    const b = complex(Number(parts[3]), Number(parts[4]));
    const c = complex(Number(parts[5]), Number(parts[6]));
    const d = complex(Number(parts[7]), Number(parts[8]));
    if ([t, a.re, a.im, b.re, b.im, c.re, c.im, d.re, d.im].some((v) => Number.isNaN(v))) continue;
    samples.push({ t, J: [a, b, c, d] });
  }
  return samples;
}

function hermitianProduct(J: JonesMatrix): [Complex, Complex, Complex, Complex] {
  const [a, b, c, d] = J;
  // H = J^H J
  const aH = conj(a), bH = conj(b), cH = conj(c), dH = conj(d);
  const h11 = add(mul(aH, a), mul(cH, c));
  const h12 = add(mul(aH, b), mul(cH, d));
  const h21 = add(mul(bH, a), mul(dH, c));
  const h22 = add(mul(bH, b), mul(dH, d));
  return [h11, h12, h21, h22];
}

function eigenvaluesHermitian2x2(H: [Complex, Complex, Complex, Complex]): [number, number] {
  const [h11, h12, , h22] = H;
  const a = h11.re; // Hermitian => real diagonal
  const d = h22.re;
  const bAbs = abs(h12);
  const trace = a + d;
  const diff = a - d;
  const root = Math.sqrt(diff * diff + 4 * bAbs * bAbs);
  const l1 = 0.5 * (trace + root);
  const l2 = 0.5 * (trace - root);
  return [Math.max(l1, l2), Math.min(l1, l2)];
}

function frobeniusNorm(J: JonesMatrix): number {
  const [a, b, c, d] = J;
  return Math.hypot(abs(a), abs(b), abs(c), abs(d));
}

function conditionNumber(J: JonesMatrix): number {
  const H = hermitianProduct(J);
  const [lmax, lmin] = eigenvaluesHermitian2x2(H);
  const smax = Math.sqrt(Math.max(lmax, EPS));
  const smin = Math.sqrt(Math.max(lmin, EPS));
  return smax / smin;
}

function determinantPhase(J: JonesMatrix): number {
  const [a, b, c, d] = J;
  const det = det2x2(a, b, c, d);
  return arg(det);
}

function determinantMagnitude(J: JonesMatrix): number {
  const [a, b, c, d] = J;
  const det = det2x2(a, b, c, d);
  return Math.max(abs(det), EPS);
}

export function computeMetrics(series: JonesSample[]): MetricSample[] {
  const out: MetricSample[] = [];
  let prev: MetricSample | undefined;
  for (const s of series) {
    const detMag = determinantMagnitude(s.J);
    const detPhase = determinantPhase(s.J);
    const frob = frobeniusNorm(s.J);
    const cond = conditionNumber(s.J);
    let d = 0;
    if (prev) {
      const dDet = Math.abs(Math.log(detMag) - Math.log(prev.detMag));
      // unwrap phase difference
      let dPhi = detPhase - prev.detPhase;
      while (dPhi > Math.PI) dPhi -= 2 * Math.PI;
      while (dPhi < -Math.PI) dPhi += 2 * Math.PI;
      const dFrob = Math.abs(frob - prev.frobNorm) / Math.max(prev.frobNorm, EPS);
      const dCond = Math.abs(Math.log(cond) - Math.log(prev.cond));
      d = dDet + 0.5 * Math.abs(dPhi) + 0.5 * dFrob + 0.2 * dCond;
    }
    const m: MetricSample = { t: s.t, detMag, detPhase, frobNorm: frob, cond, activity: d };
    out.push(m);
    prev = m;
  }
  return out;
}

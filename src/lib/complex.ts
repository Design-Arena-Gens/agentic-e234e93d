export type Complex = { re: number; im: number };

export function complex(re: number, im: number = 0): Complex {
  return { re, im };
}

export function add(a: Complex, b: Complex): Complex {
  return { re: a.re + b.re, im: a.im + b.im };
}

export function sub(a: Complex, b: Complex): Complex {
  return { re: a.re - b.re, im: a.im - b.im };
}

export function mul(a: Complex, b: Complex): Complex {
  return { re: a.re * b.re - a.im * b.im, im: a.re * b.im + a.im * b.re };
}

export function div(a: Complex, b: Complex): Complex {
  const denom = b.re * b.re + b.im * b.im || 1e-18;
  return {
    re: (a.re * b.re + a.im * b.im) / denom,
    im: (a.im * b.re - a.re * b.im) / denom,
  };
}

export function conj(a: Complex): Complex {
  return { re: a.re, im: -a.im };
}

export function abs(a: Complex): number {
  return Math.hypot(a.re, a.im);
}

export function arg(a: Complex): number {
  return Math.atan2(a.im, a.re);
}

export function det2x2(a: Complex, b: Complex, c: Complex, d: Complex): Complex {
  return sub(mul(a, d), mul(b, c));
}

export function toString(a: Complex): string {
  return `${a.re}${a.im >= 0 ? '+' : ''}${a.im}j`;
}

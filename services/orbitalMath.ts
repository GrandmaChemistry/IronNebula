
/**
 * 高级原子轨道数学模型 - 极亮教学版
 */

const factorial = (n: number): number => {
  if (n <= 1) return 1;
  let res = 1;
  for (let i = 2; i <= n; i++) res *= i;
  return res;
};

const assocLegendre = (l: number, m: number, x: number): number => {
  const am = Math.abs(m);
  if (am > l) return 0;
  let pmm = 1.0;
  if (am > 0) {
    const somx2 = Math.sqrt((1.0 - x) * (1.0 + x));
    let fact = 1.0;
    for (let i = 1; i <= am; i++) {
      pmm *= -fact * somx2;
      fact += 2.0;
    }
  }
  if (l === am) return pmm;
  let pmmp1 = x * (2.0 * am + 1.0) * pmm;
  if (l === am + 1) return pmmp1;
  let pll = 0;
  for (let ll = am + 2; ll <= l; ll++) {
    pll = (x * (2.0 * ll - 1.0) * pmmp1 - (ll + am - 1.0) * pmm) / (ll - am);
    pmm = pmmp1;
    pmmp1 = pll;
  }
  return pmmp1;
};

const sphericalHarmonic = (l: number, m: number, theta: number, phi: number): number => {
  const am = Math.abs(m);
  const norm = Math.sqrt(((2 * l + 1) * factorial(l - am)) / (4 * Math.PI * factorial(l + am)));
  const legendre = assocLegendre(l, am, Math.cos(theta));
  if (m === 0) return norm * legendre;
  if (m > 0) return Math.sqrt(2) * norm * legendre * Math.cos(m * phi);
  return Math.sqrt(2) * norm * legendre * Math.sin(am * phi);
};

const radialPart = (n: number, l: number, r: number): number => {
  const scale = 0.65; 
  const rho = (2 * scale * r) / n;
  
  if (n === 1) return Math.exp(-rho / 2);
  if (n === 2) {
    if (l === 0) return (2 - rho) * Math.exp(-rho / 2);
    if (l === 1) return rho * Math.exp(-rho / 2);
  }
  if (n === 3) {
    if (l === 0) return (6 - 6 * rho + rho * rho) * Math.exp(-rho / 2);
    if (l === 1) return (4 - rho) * rho * Math.exp(-rho / 2);
    if (l === 2) return rho * rho * Math.exp(-rho / 2);
  }
  if (n === 4) {
    if (l === 0) return (24 - 36 * rho + 12 * rho * rho - Math.pow(rho, 3)) * Math.exp(-rho / 2);
  }
  return Math.exp(-rho / 2);
};

export const getProbabilityDensity = (n: number, l: number, m: number, r: number, theta: number, phi: number): number => {
  const R = radialPart(n, l, r);
  const Y = sphericalHarmonic(l, m, theta, phi);
  const psi = R * Y;
  
  // 针对亮度的核心优化：
  // 增加一个非线性的亮度补偿，使得电子云的核心部分在放大时由于粒子叠加产生更强的发光感。
  const nBoost = Math.pow(n, 2.5); 
  const intensityFactor = 4.0; 
  
  return Math.pow(Math.abs(psi), 2) * nBoost * intensityFactor;
};

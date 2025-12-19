
export enum OrbitalType {
  S = 's',
  P = 'p',
  D = 'd'
}

export interface OrbitalInfo {
  id: string;
  n: number;
  l: number;
  m: number;
  label: string;
  shell: string;
  color: string;
  description: string;
}

export interface SimulationConfig {
  pointCount: number;
  opacity: number;
  showContours: boolean;
  scale: number;
  autoRotate: boolean;
}

export const IRON_ORBITALS: OrbitalInfo[] = [
  // K层
  { id: '1s', n: 1, l: 0, m: 0, label: '1s', shell: 'K', color: '#FF3D3D', description: '核心s轨道' },
  
  // L层
  { id: '2s', n: 2, l: 0, m: 0, label: '2s', shell: 'L', color: '#FFD700', description: '2s轨道' },
  { id: '2px', n: 2, l: 1, m: 1, label: '2px', shell: 'L', color: '#FF8C00', description: '2p x方向' },
  { id: '2py', n: 2, l: 1, m: -1, label: '2py', shell: 'L', color: '#FFA500', description: '2p y方向' },
  { id: '2pz', n: 2, l: 1, m: 0, label: '2pz', shell: 'L', color: '#FF4500', description: '2p z方向' },
  
  // M层
  { id: '3s', n: 3, l: 0, m: 0, label: '3s', shell: 'M', color: '#00FFCC', description: '3s轨道' },
  { id: '3px', n: 3, l: 1, m: 1, label: '3px', shell: 'M', color: '#00BFFF', description: '3p x方向' },
  { id: '3py', n: 3, l: 1, m: -1, label: '3py', shell: 'M', color: '#1E90FF', description: '3p y方向' },
  { id: '3pz', n: 3, l: 1, m: 0, label: '3pz', shell: 'M', color: '#4169E1', description: '3p z方向' },
  
  // 3d轨道 - 每一条都分配独特颜色
  { id: '3dxy', n: 3, l: 2, m: -2, label: '3dxy', shell: 'M', color: '#CC00FF', description: '3d xy平面' },
  { id: '3dyz', n: 3, l: 2, m: -1, label: '3dyz', shell: 'M', color: '#FF00FF', description: '3d yz平面' },
  { id: '3dxz', n: 3, l: 2, m: 1, label: '3dxz', shell: 'M', color: '#8A2BE2', description: '3d xz平面' },
  { id: '3dx2-y2', n: 3, l: 2, m: 2, label: '3dx²-y²', shell: 'M', color: '#FF1493', description: '3d 轴向' },
  { id: '3dz2', n: 3, l: 2, m: 0, label: '3dz²', shell: 'M', color: '#FF69B4', description: '3d 环形' },
  
  // N层
  { id: '4s', n: 4, l: 0, m: 0, label: '4s', shell: 'N', color: '#00FF7F', description: '外层s轨道' }
];

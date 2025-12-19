
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { OrbitalInfo, SimulationConfig } from '../types';
import { getProbabilityDensity } from '../services/orbitalMath';

interface Props {
  selectedOrbitals: OrbitalInfo[];
  config: SimulationConfig;
}

const OrbitalVisualizer: React.FC<Props> = ({ selectedOrbitals, config }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const pointsRef = useRef<Map<string, THREE.Points>>(new Map());
  
  const configRef = useRef(config);
  useEffect(() => {
    configRef.current = config;
    if (controlsRef.current) {
      controlsRef.current.autoRotate = config.autoRotate;
    }
  }, [config]);

  const createPointTexture = () => {
    const size = 128;
    const canvas = document.createElement('canvas');
    canvas.width = size; canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    const center = size / 2;
    const gradient = ctx.createRadialGradient(center, center, 0, center, center, size / 2);
    // 调亮核心部分，减少外围渐变，使点在放大时依然感觉是一个发光实体
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
    gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.9)');
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.3)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    return new THREE.CanvasTexture(canvas);
  };

  const pointTexture = useRef(createPointTexture());

  useEffect(() => {
    if (!containerRef.current) return;
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const camera = new THREE.PerspectiveCamera(40, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 2000);
    camera.position.set(35, 25, 35);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.autoRotate = configRef.current.autoRotate;
    controls.autoRotateSpeed = 1.2;
    controlsRef.current = controls;

    const axesHelper = new THREE.AxesHelper(20);
    (axesHelper.material as THREE.Material).transparent = true;
    (axesHelper.material as THREE.Material).opacity = 0.2;
    scene.add(axesHelper);

    const createAxisLabel = (text: string, pos: THREE.Vector3, color: string) => {
      const canvas = document.createElement('canvas');
      canvas.width = 128; canvas.height = 128;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = color;
      ctx.font = 'bold 90px Arial';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(text, 64, 64);
      const texture = new THREE.CanvasTexture(canvas);
      const spriteMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.position.copy(pos);
      sprite.scale.set(3, 3, 1);
      return sprite;
    };
    scene.add(createAxisLabel('X', new THREE.Vector3(22, 0, 0), '#ff4444'));
    scene.add(createAxisLabel('Y', new THREE.Vector3(0, 22, 0), '#44ff44'));
    scene.add(createAxisLabel('Z', new THREE.Vector3(0, 0, 22), '#4444ff'));

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      if (controlsRef.current) {
        controlsRef.current.autoRotate = configRef.current.autoRotate;
        controlsRef.current.update();
      }
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      renderer.dispose();
      if (containerRef.current) containerRef.current.removeChild(renderer.domElement);
    };
  }, []);

  useEffect(() => {
    if (!sceneRef.current) return;
    const scene = sceneRef.current;
    const activeIds = new Set(selectedOrbitals.map(o => o.id));
    pointsRef.current.forEach((points, id) => {
      if (!activeIds.has(id)) {
        scene.remove(points);
        pointsRef.current.delete(id);
      }
    });
    selectedOrbitals.forEach(orbital => {
      if (!pointsRef.current.has(orbital.id)) {
        const points = generateOrbitalPoints(orbital, config);
        scene.add(points);
        pointsRef.current.set(orbital.id, points);
      } else {
        const points = pointsRef.current.get(orbital.id);
        if (points) {
          (points.material as THREE.PointsMaterial).opacity = config.opacity;
        }
      }
    });
  }, [selectedOrbitals, config.pointCount, config.opacity]);

  const generateOrbitalPoints = (orbital: OrbitalInfo, cfg: SimulationConfig): THREE.Points => {
    const { n, l, m } = orbital;
    const positions: number[] = [];
    const colors: number[] = [];
    let count = 0;
    const maxSamples = cfg.pointCount;
    
    // 关键优化：动态采样半径
    // 1s 只在半径 4 内采样，命中率会提升 10 倍以上，解决卡顿
    // 高能级轨道采样范围相应扩大。
    const samplingRadius = n === 1 ? 4 : (n * 10); 
    const color = new THREE.Color(orbital.color);

    // 性能优化：内部循环次数限制
    let iterations = 0;
    while (count < maxSamples && iterations < maxSamples * 50) {
      iterations++;
      const u = Math.random();
      const v = Math.random();
      const w = Math.random();
      const r = samplingRadius * Math.pow(u, 1/3); 
      const theta = Math.acos(2 * v - 1);         
      const phi = 2 * Math.PI * w;                
      const x = r * Math.sin(theta) * Math.cos(phi);
      const y = r * Math.sin(theta) * Math.sin(phi);
      const z = r * Math.cos(theta);

      let density = getProbabilityDensity(n, l, m, r, theta, phi);
      
      // 拒绝采样改进：引入能级强度自适应
      // 使得高密度区的点被接受的概率接近 100%，低密度区按比例接受
      const threshold = Math.random();
      if (threshold < density) {
        positions.push(x, y, z);
        // 放大时更亮：让颜色强度更扎实
        const intensity = 0.7 + (Math.min(density, 1.0) * 0.3);
        colors.push(color.r * intensity, color.g * intensity, color.b * intensity);
        count++;
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    const material = new THREE.PointsMaterial({
      size: 0.5, // 进一步增大点尺寸，放大看极亮
      map: pointTexture.current,
      vertexColors: true,
      transparent: true,
      opacity: cfg.opacity,
      blending: THREE.AdditiveBlending, 
      depthWrite: false,
      sizeAttenuation: true, 
      alphaTest: 0.001
    });
    return new THREE.Points(geometry, material);
  };

  return <div ref={containerRef} className="w-full h-full cursor-move" />;
};

export default OrbitalVisualizer;


import React, { useState } from 'react';
import { OrbitalInfo, IRON_ORBITALS, SimulationConfig } from './types';
import OrbitalVisualizer from './components/OrbitalVisualizer';

const App: React.FC = () => {
  const [selectedOrbitals, setSelectedOrbitals] = useState<OrbitalInfo[]>([IRON_ORBITALS[0]]);
  const [config, setConfig] = useState<SimulationConfig>({
    pointCount: 40000, 
    opacity: 1.0, // 默认最大亮度
    showContours: false,
    scale: 1,
    autoRotate: true
  });

  const toggleOrbital = (orbital: OrbitalInfo) => {
    setSelectedOrbitals(prev => {
      const exists = prev.find(o => o.id === orbital.id);
      if (exists) return prev.filter(o => o.id !== orbital.id);
      return [...prev, orbital];
    });
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-950 text-slate-100">
      <header className="glass-panel p-4 flex justify-between items-center z-20 border-b border-white/10 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-xl shadow-lg shadow-indigo-500/20">Fe</div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">铁原子电子云交互式教学平台</h1>
            <p className="text-xs text-slate-400 font-mono">Iron (Z=26) | Ultra-Bright Quantum Visualization</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setConfig({...config, autoRotate: !config.autoRotate})}
            className={`flex items-center space-x-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              config.autoRotate 
              ? 'bg-indigo-600 text-white shadow-[0_0_20px_rgba(79,70,229,0.6)]' 
              : 'bg-slate-800 text-slate-400 hover:text-white border border-white/10'
            }`}
          >
            <svg className={`w-3.5 h-3.5`} fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ animation: config.autoRotate ? 'spin 3s linear infinite' : 'none' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>{config.autoRotate ? '正在自动旋转' : '已停止旋转'}</span>
          </button>
          
          <button 
            onClick={() => setSelectedOrbitals([])}
            className="px-4 py-1.5 rounded-lg border border-white/10 text-xs font-medium hover:bg-white/10 transition bg-white/5"
          >
            清空视图
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        <aside className="w-80 glass-panel border-r border-white/10 flex flex-col z-10 shrink-0 shadow-2xl">
          <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
            <section className="mb-8">
              <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-4 flex items-center">
                <span className="w-2 h-2 bg-indigo-400 rounded-full mr-2 shadow-[0_0_10px_rgba(129,140,248,0.8)]"></span>
                轨道能级选择
              </h2>
              
              {['K', 'L', 'M', 'N'].map(shell => (
                <div key={shell} className="mb-6 last:mb-0">
                  <div className="flex items-center mb-3">
                    <span className="text-[10px] font-bold text-slate-500 bg-white/5 px-2 py-0.5 rounded border border-white/5 uppercase tracking-tighter">
                      {shell} 层 (n={shell === 'K' ? '1' : shell === 'L' ? '2' : shell === 'M' ? '3' : '4'})
                    </span>
                    <div className="flex-1 h-[1px] bg-gradient-to-r from-white/10 to-transparent ml-2"></div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    {IRON_ORBITALS.filter(o => o.shell === shell).map(orb => {
                      const isActive = selectedOrbitals.some(o => o.id === orb.id);
                      return (
                        <button
                          key={orb.id}
                          onClick={() => toggleOrbital(orb)}
                          className={`px-1 py-3 rounded-lg text-[11px] font-bold transition-all border-2 flex flex-col items-center justify-center relative overflow-hidden group ${
                            isActive
                              ? 'shadow-[0_0_20px_currentColor] z-10'
                              : 'bg-slate-900/60 border-transparent hover:border-white/10 text-slate-400'
                          }`}
                          style={{
                            backgroundColor: isActive ? `${orb.color}33` : '',
                            borderColor: isActive ? orb.color : '',
                            color: isActive ? orb.color : ''
                          }}
                        >
                          {orb.label}
                          <span className="text-[7px] opacity-70 font-mono mt-1 group-hover:opacity-100 transition-opacity">
                            {orb.l === 0 ? 's-球型' : orb.l === 1 ? 'p-哑铃' : 'd-梅花'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </section>

            <section className="pt-6 border-t border-white/5 pb-6">
              <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-5 flex items-center">
                <span className="w-2 h-2 bg-emerald-400 rounded-full mr-2 shadow-[0_0_10px_rgba(52,211,153,0.8)]"></span>
                渲染参数控制
              </h2>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-[10px] mb-3 font-mono text-slate-400 uppercase tracking-tight">
                    <span>电子采样密度 (Density)</span>
                    <span className="text-indigo-400">{config.pointCount.toLocaleString()}</span>
                  </div>
                  <input 
                    type="range" min="5000" max="80000" step="5000" 
                    value={config.pointCount}
                    onChange={(e) => setConfig({...config, pointCount: parseInt(e.target.value)})}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-[10px] mb-3 font-mono text-slate-400 uppercase tracking-tight">
                    <span>亮度增强 (Intensity)</span>
                    <span className="text-emerald-400">{(config.opacity * 100).toFixed(0)}%</span>
                  </div>
                  <input 
                    type="range" min="0.1" max="1.5" step="0.05" 
                    value={config.opacity}
                    onChange={(e) => setConfig({...config, opacity: parseFloat(e.target.value)})}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>
              </div>
            </section>
            
            <div className="bg-white/5 p-4 rounded-xl border border-white/5 text-[10px] text-slate-500 font-mono leading-relaxed mt-4 italic">
              提示：高层轨道（如 3d, 4s）体积巨大，建议将密度调至最高以获得最佳观测效果。
            </div>
          </div>
        </aside>

        <main className="flex-1 relative overflow-hidden bg-black">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#1a1f2e_0%,_#020617_100%)]"></div>
          <div className="relative w-full h-full">
            <OrbitalVisualizer selectedOrbitals={selectedOrbitals} config={config} />
          </div>
          
          <div className="absolute bottom-6 left-6 flex flex-wrap gap-2 pointer-events-none">
            {selectedOrbitals.length > 0 ? (
              selectedOrbitals.map(o => (
                <div key={o.id} className="flex items-center space-x-2 px-3 py-2 bg-black/70 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl">
                  <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_15px_currentColor]" style={{ backgroundColor: o.color, color: o.color }} />
                  <span className="text-xs font-black tracking-wider uppercase" style={{ color: o.color }}>{o.label}</span>
                </div>
              ))
            ) : (
              <div className="px-4 py-2 bg-indigo-500/10 backdrop-blur-md rounded-xl border border-indigo-500/20 text-indigo-300 text-[10px] font-bold uppercase tracking-widest">
                请点击左侧面板选择要观测的轨道...
              </div>
            )}
          </div>

          <div className="absolute top-4 right-4 flex space-x-2">
             <div className="text-[10px] font-bold text-slate-400 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/5 flex items-center space-x-3">
               <span className="flex items-center"><span className="w-2 h-[2px] bg-[#ff4444] mr-1"></span>X</span>
               <span className="flex items-center"><span className="w-2 h-[2px] bg-[#44ff44] mr-1"></span>Y</span>
               <span className="flex items-center"><span className="w-2 h-[2px] bg-[#4444ff] mr-1"></span>Z</span>
             </div>
          </div>
        </main>
      </div>

      <footer className="h-8 glass-panel border-t border-white/10 flex items-center px-6 justify-between text-[10px] text-slate-500 font-mono tracking-widest shrink-0">
        <div className="flex space-x-8">
          <span className="flex items-center"><span className="w-2 h-2 bg-indigo-500 rounded-full mr-2 animate-pulse"></span> 系统状态: 极高精度模式</span>
          <span>采样率: 动态自适应</span>
        </div>
        <div className="text-slate-400 font-bold uppercase tracking-tighter">铁原子 (Fe, Z=26) 电子云科学可视化教学系统</div>
      </footer>
    </div>
  );
};

export default App;

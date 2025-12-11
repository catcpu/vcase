import React, { useEffect, useState } from 'react';
import { SimulationState } from '../types';

interface Props {
  state: SimulationState;
}

const VeinVisualizer: React.FC<Props> = ({ state }) => {
  const [thrombusOpacity, setThrombusOpacity] = useState(0);

  // Manage opacity based on state
  useEffect(() => {
    if (state === SimulationState.NORMAL || state === SimulationState.VARICOSE) {
      setThrombusOpacity(0);
    } else if (state === SimulationState.THROMBUS_FORMED) {
      setThrombusOpacity(1);
    } else if (state === SimulationState.DETACHING) {
      setThrombusOpacity(1);
    } else if (state === SimulationState.POST_EMBOLISM) {
        // Fade out after it leaves the leg
        const timer = setTimeout(() => setThrombusOpacity(0), 500);
        return () => clearTimeout(timer);
    }
  }, [state]);

  const isVaricose = state !== SimulationState.NORMAL;
  
  // Left Leg (Healthy Reference) - Always straight
  const leftVeinPath = "M 160 580 L 160 100";

  // Right Leg (Simulation Target) - Changes based on state
  // Wavy path for varicose veins
  const rightVeinPath = isVaricose 
    ? "M 340 580 C 340 500, 380 450, 350 380 S 300 250, 340 150 L 340 100" 
    : "M 340 580 L 340 100";

  const veinWidth = isVaricose ? 28 : 18; // Dilated vein is wider
  const normalVeinWidth = 18;
  
  // Animation durations
  const bloodSpeedHealthy = "1.5s";
  const bloodSpeedDisease = isVaricose ? "4s" : "1.5s";

  // Valve configurations for Right Leg to ensure they stay inside the vein
  const rightValves = [
      { y: 450, xNormal: 340, xVaricose: 368, rotateVaricose: 15 }, // Bottom: Vein bulges right
      { y: 300, xNormal: 340, xVaricose: 315, rotateVaricose: -15 }, // Middle: Vein bulges left
      { y: 150, xNormal: 340, xVaricose: 340, rotateVaricose: 0 }   // Top: Vein straightens
  ];

  return (
    <div className="relative w-full h-[700px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-[0_0_40px_rgba(0,0,0,0.5)] group">
      
      {/* Tech Grid Background */}
      <div className="absolute inset-0 opacity-20" 
           style={{backgroundImage: 'linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)', backgroundSize: '40px 40px'}}>
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-transparent to-slate-950"></div>

      {/* Labels */}
      <div className="absolute top-6 left-10 text-cyan-500/50 text-xs font-mono border-l-2 border-cyan-500/30 pl-2">
        LEFT LEG<br/>HEALTHY REFERENCE
      </div>
      <div className="absolute top-6 right-10 text-red-500/50 text-xs font-mono border-r-2 border-red-500/30 pr-2 text-right">
        RIGHT LEG<br/>SIMULATION TARGET
      </div>

      <svg viewBox="0 0 500 700" className="w-full h-full absolute inset-0 pointer-events-none">
        <defs>
          <filter id="veinGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="clotGlow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <linearGradient id="legGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1e293b" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#334155" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#1e293b" stopOpacity="0.8" />
          </linearGradient>
          <radialGradient id="thrombusGradient">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#7f1d1d" />
          </radialGradient>
        </defs>

        {/* --- ANATOMY SILHOUETTES --- */}
        <g opacity="0.4">
          {/* Pelvis area hint */}
          <path d="M 100 50 Q 250 120 400 50" fill="none" stroke="#475569" strokeWidth="2" strokeDasharray="5,5"/>
          
          {/* Left Leg Outline */}
          <path 
            d="M 80 100 Q 60 300 90 600 L 210 600 Q 240 300 220 100" 
            fill="url(#legGradient)" stroke="#475569" strokeWidth="1" 
          />
          {/* Right Leg Outline */}
          <path 
            d="M 280 100 Q 260 300 290 600 L 410 600 Q 440 300 420 100" 
            fill="url(#legGradient)" stroke="#475569" strokeWidth="1" 
          />
        </g>

        {/* --- VASCULAR SYSTEM --- */}

        {/* Common Vein Joining at top (IVC hint) */}
        <path d="M 160 100 C 160 50, 340 50, 340 100" stroke="#1e3a8a" strokeWidth="20" fill="none" opacity="0.3" />

        {/* LEFT LEG (HEALTHY) */}
        <g id="left-leg-system">
            <path d={leftVeinPath} stroke="#1e3a8a" strokeWidth={normalVeinWidth + 6} fill="none" opacity="0.3" />
            <path d={leftVeinPath} stroke="#3b82f6" strokeWidth={normalVeinWidth} fill="none" opacity="0.6" filter="url(#veinGlow)" />
            
            {/* Healthy Valves Left */}
            {[450, 300, 150].map(y => (
                <g key={`l-valve-${y}`} transform={`translate(160, ${y})`}>
                    <path d="M -9 0 L 0 -8 L 9 0" stroke="#93c5fd" strokeWidth="2" fill="none" opacity="0.8">
                         <animate attributeName="d" values="M -9 0 L 0 -8 L 9 0; M -9 -2 L 0 -12 L 9 -2; M -9 0 L 0 -8 L 9 0" dur="1s" repeatCount="indefinite" />
                    </path>
                </g>
            ))}

            {/* Healthy Flow Particles Left */}
            {[0, 1, 2, 3].map((i) => (
            <circle key={`l-cell-${i}`} r="3" fill="#bfdbfe">
              <animateMotion 
                dur={bloodSpeedHealthy} 
                repeatCount="indefinite" 
                path={leftVeinPath}
                begin={`${i * -0.4}s`}
                keyPoints="1;0" keyTimes="0;1"
              />
            </circle>
            ))}
        </g>

        {/* RIGHT LEG (DISEASED SIMULATION) */}
        <g id="right-leg-system">
            {/* Vein Wall */}
            <path 
                d={rightVeinPath} 
                stroke={isVaricose ? "#451a1a" : "#1e3a8a"} 
                strokeWidth={veinWidth + 6} 
                fill="none" 
                opacity="0.3"
                className="transition-all duration-1000"
            />
            {/* Vein Inner */}
            <path 
                d={rightVeinPath} 
                stroke={isVaricose ? "#991b1b" : "#3b82f6"} 
                strokeWidth={veinWidth} 
                fill="none" 
                opacity={isVaricose ? 0.7 : 0.6}
                filter="url(#veinGlow)"
                className="transition-all duration-1000"
            />

            {/* Valves Right (Failed in Varicose) */}
            {rightValves.map((config) => {
                const x = isVaricose ? config.xVaricose : config.xNormal;
                const rotate = isVaricose ? config.rotateVaricose : 0;
                
                // In varicose state, valves don't close properly (stay open/flat)
                return (
                    <g key={`r-valve-${config.y}`} transform={`translate(${x}, ${config.y}) rotate(${rotate})`} className="transition-all duration-1000">
                        <path 
                            d={isVaricose ? "M -14 0 L -4 -2" : "M -9 0 L 0 -8"} 
                            stroke={isVaricose ? "#f87171" : "#93c5fd"} 
                            strokeWidth="2" strokeLinecap="round"
                            className="transition-all duration-1000"
                        />
                        <path 
                            d={isVaricose ? "M 14 0 L 4 -2" : "M 9 0 L 0 -8"} 
                            stroke={isVaricose ? "#f87171" : "#93c5fd"} 
                            strokeWidth="2" strokeLinecap="round"
                            className="transition-all duration-1000"
                        />
                    </g>
                )
            })}

            {/* Flow Particles Right */}
            {[0, 1, 2, 3, 4].map((i) => (
                <circle key={`r-cell-${i}`} r={isVaricose ? 2.5 : 3} fill={isVaricose ? "#fca5a5" : "#bfdbfe"}>
                <animateMotion 
                    dur={bloodSpeedDisease} 
                    repeatCount="indefinite" 
                    path={rightVeinPath}
                    begin={`${i * -0.5}s`}
                    keyPoints="1;0" keyTimes="0;1"
                />
                </circle>
            ))}

            {/* Turbulent/Backflow particles for Varicose */}
            {isVaricose && [5, 6, 7].map((i) => (
                <circle key={`chaos-${i}`} r="2" fill="#ef4444" opacity="0.6">
                <animateMotion 
                    dur="4s" 
                    repeatCount="indefinite" 
                    path={rightVeinPath}
                    begin={`${i * -1.2}s`}
                    // KeyPoints simulate hovering/falling back
                    keyPoints="0.4; 0.45; 0.4" 
                    keyTimes="0; 0.5; 1"
                />
                </circle>
            ))}
        </g>

        {/* THROMBUS (THE CLOT) */}
        {/* We use animateMotion to make the clot follow the exact curve of the vein path */}
        <g 
          style={{ opacity: thrombusOpacity, transition: 'opacity 0.5s ease-in-out' }}
        >
           {/* The Clot Group */}
           <g>
                {/* Glow effect */}
                <circle r="15" fill="url(#thrombusGradient)" opacity="0.3" filter="url(#clotGlow)">
                    <animate attributeName="r" values="12;16;12" dur="2s" repeatCount="indefinite"/>
                </circle>
                
                {/* Shape */}
                <path 
                    d="M -10 -6 C -15 0, -10 10, 0 12 C 10 10, 15 0, 10 -6 C 5 -12, -5 -12, -10 -6 Z" 
                    fill="url(#thrombusGradient)"
                    stroke="#450a0a"
                    strokeWidth="1"
                />

                {/* Label */}
                {state === SimulationState.THROMBUS_FORMED && (
                    <g transform="translate(20, -10)">
                        <line x1="0" y1="10" x2="30" y2="10" stroke="white" strokeWidth="1" strokeDasharray="2,2" />
                        <text x="35" y="14" fill="white" fontSize="12" fontFamily="monospace" fontWeight="bold">血栓</text>
                    </g>
                )}

                {/* MOVEMENT LOGIC */}
                {/* Using keyPoints: 0 is start (bottom), 1 is end (top) of the path. */}
                {/* 0.36 is approximately where the lower bulge/valve is on the curve. */}
                
                {state === SimulationState.THROMBUS_FORMED && (
                    <animateMotion
                        dur="1ms"
                        fill="freeze"
                        repeatCount="1"
                        path={rightVeinPath}
                        keyPoints="0.36;0.36"
                        keyTimes="0;1"
                        calcMode="linear"
                    />
                )}
                
                {state === SimulationState.DETACHING && (
                    <animateMotion
                        dur="6s"
                        fill="freeze"
                        repeatCount="1"
                        path={rightVeinPath}
                        keyPoints="0.36;1" 
                        keyTimes="0;1"
                        calcMode="linear"
                    />
                )}
                
                {state === SimulationState.POST_EMBOLISM && (
                     <animateMotion
                        dur="1ms"
                        fill="freeze"
                        repeatCount="1"
                        path={rightVeinPath}
                        keyPoints="1;1" 
                        keyTimes="0;1"
                        calcMode="linear"
                    />
                )}
           </g>
        </g>

      </svg>
      
      {/* Status Indicators Overlay */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-8">
          <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-full border border-blue-900/50 flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] text-blue-200">左腿: 血流正常</span>
          </div>
          <div className={`backdrop-blur px-4 py-2 rounded-full border flex items-center gap-2 transition-colors duration-500 ${
              isVaricose 
              ? 'bg-red-900/40 border-red-900/50' 
              : 'bg-slate-900/80 border-slate-800'
          }`}>
              <div className={`w-2 h-2 rounded-full ${isVaricose ? 'bg-red-500 animate-pulse' : 'bg-blue-500'}`}></div>
              <span className={`text-[10px] ${isVaricose ? 'text-red-200' : 'text-blue-200'}`}>
                  右腿: {isVaricose ? (state === SimulationState.POST_EMBOLISM ? "发生栓塞!" : "静脉高压/淤滞") : "正常"}
              </span>
          </div>
      </div>
    </div>
  );
};

export default VeinVisualizer;

import React, { useState, useEffect, useCallback } from 'react';
import VeinVisualizer from './components/VeinVisualizer';
import { SimulationState, MedicalExplanation } from './types';
import { fetchExplanation } from './services/geminiService';
import { 
  HeartPulse, 
  Activity, 
  AlertTriangle, 
  Info, 
  ChevronRight,
  Cpu
} from 'lucide-react';

const App: React.FC = () => {
  const [simulationState, setSimulationState] = useState<SimulationState>(SimulationState.NORMAL);
  const [explanation, setExplanation] = useState<MedicalExplanation | null>(null);
  const [loading, setLoading] = useState(false);

  const updateExplanation = useCallback(async (state: SimulationState) => {
    setLoading(true);
    const data = await fetchExplanation(state);
    setExplanation(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    updateExplanation(SimulationState.NORMAL);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStateChange = (newState: SimulationState) => {
    setSimulationState(newState);
    updateExplanation(newState);

    if (newState === SimulationState.DETACHING) {
      setTimeout(() => {
        setSimulationState(SimulationState.POST_EMBOLISM);
        updateExplanation(SimulationState.POST_EMBOLISM);
      }, 6500); // Wait 6.5s to allow the 6s animation to complete
    }
  };

  // Helper to determine active step styling
  const getStepStyle = (stepState: SimulationState) => {
    const isActive = simulationState === stepState;
    
    if (isActive) {
        switch(stepState) {
            case SimulationState.NORMAL: return "bg-blue-600/20 border-blue-500 text-blue-100 shadow-[0_0_15px_rgba(59,130,246,0.3)]";
            case SimulationState.VARICOSE: return "bg-purple-600/20 border-purple-500 text-purple-100 shadow-[0_0_15px_rgba(168,85,247,0.3)]";
            case SimulationState.THROMBUS_FORMED: return "bg-red-600/20 border-red-500 text-red-100 shadow-[0_0_15px_rgba(239,68,68,0.3)]";
            default: return "bg-slate-800 border-slate-700";
        }
    }
    return "bg-slate-900/50 border-slate-800 text-slate-500 hover:bg-slate-800 hover:border-slate-700 transition-all";
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#020617] to-black">
      
      {/* Navbar */}
      <nav className="border-b border-slate-800/60 bg-slate-950/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-500 to-cyan-600 p-2 rounded-lg shadow-lg shadow-blue-900/20">
              <HeartPulse className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white">
                Vascular<span className="text-blue-400">Sim</span> <span className="opacity-50 font-light text-sm ml-2">| 下肢静脉病理演示</span>
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
             <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800">
                <Cpu className="w-3 h-3 text-cyan-500" />
                <span className={loading ? "text-cyan-400 animate-pulse" : "text-slate-400"}>
                    {loading ? "AI 分析中..." : "系统就绪"}
                </span>
             </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 lg:p-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Left Column: Visualization */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col">
             {/* Vis Container */}
             <div className="relative">
                <VeinVisualizer state={simulationState} />
                
                {/* Overlay Legend */}
                <div className="absolute top-4 right-4 bg-black/40 backdrop-blur p-3 rounded-lg border border-white/10 text-[10px] space-y-2">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_5px_#3b82f6]"></span> 正常血流
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_5px_#ef4444]"></span> 淤滞/返流
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-sm bg-red-900 border border-red-500"></span> 血栓块
                    </div>
                </div>
             </div>
          </div>

          {/* Right Column: Interactive Control Panel */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-6">
            
            {/* Diagnosis Screen (Explanation) */}
            <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm shadow-2xl min-h-[200px] flex flex-col">
                {/* Decorative header line */}
                <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-cyan-400 to-transparent"></div>
                
                <div className="p-6 flex-1">
                    <div className="flex items-center gap-2 mb-4 text-cyan-400 text-xs font-mono uppercase tracking-widest">
                        <Info className="w-4 h-4" /> 临床分析
                    </div>
                    
                    {loading ? (
                        <div className="space-y-3 animate-pulse mt-4">
                            <div className="h-4 bg-slate-700/50 rounded w-3/4"></div>
                            <div className="h-3 bg-slate-800/50 rounded w-full"></div>
                            <div className="h-3 bg-slate-800/50 rounded w-full"></div>
                            <div className="h-3 bg-slate-800/50 rounded w-2/3"></div>
                        </div>
                    ) : explanation ? (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                             <h2 className={`text-xl font-bold mb-3 ${
                                explanation.warningLevel === 'critical' ? 'text-red-400' : 
                                explanation.warningLevel === 'warning' ? 'text-amber-400' : 'text-white'
                             }`}>
                                {explanation.title}
                             </h2>
                             <p className="text-slate-300 text-sm leading-relaxed border-l-2 border-slate-700 pl-4">
                                {explanation.content}
                             </p>
                        </div>
                    ) : (
                        <div className="text-slate-500 text-sm italic">等待模拟启动...</div>
                    )}
                </div>
                
                {/* Footer decoration */}
                <div className="bg-slate-950/50 p-2 px-6 border-t border-slate-800 flex justify-between items-center text-[10px] text-slate-500 font-mono">
                    <span>DATA SOURCE: GEMINI-3-FLASH</span>
                    <span>ID: 84-XJ-09</span>
                </div>
            </div>

            {/* Control Steps */}
            <div className="space-y-3">
                <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4 pl-1">
                    病程模拟控制器
                </h3>

                <button
                    onClick={() => handleStateChange(SimulationState.NORMAL)}
                    disabled={simulationState === SimulationState.DETACHING}
                    className={`w-full p-4 rounded-xl border flex items-center justify-between group ${getStepStyle(SimulationState.NORMAL)}`}
                >
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold group-hover:bg-blue-500 group-hover:text-white transition-colors">1</div>
                        <div className="text-left">
                            <div className="font-bold text-sm">健康生理状态</div>
                            <div className="text-xs opacity-60">瓣膜功能正常，血流顺畅</div>
                        </div>
                    </div>
                    <ChevronRight className="w-4 h-4 opacity-50" />
                </button>

                <button
                    onClick={() => handleStateChange(SimulationState.VARICOSE)}
                    disabled={simulationState === SimulationState.DETACHING}
                    className={`w-full p-4 rounded-xl border flex items-center justify-between group ${getStepStyle(SimulationState.VARICOSE)}`}
                >
                    <div className="flex items-center gap-4">
                         <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold group-hover:bg-purple-500 group-hover:text-white transition-colors">2</div>
                        <div className="text-left">
                            <div className="font-bold text-sm">诱发静脉曲张</div>
                            <div className="text-xs opacity-60">瓣膜失效，血液返流</div>
                        </div>
                    </div>
                    <ChevronRight className="w-4 h-4 opacity-50" />
                </button>

                <button
                    onClick={() => handleStateChange(SimulationState.THROMBUS_FORMED)}
                    disabled={simulationState === SimulationState.DETACHING}
                    className={`w-full p-4 rounded-xl border flex items-center justify-between group ${getStepStyle(SimulationState.THROMBUS_FORMED)}`}
                >
                     <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold group-hover:bg-red-500 group-hover:text-white transition-colors">3</div>
                        <div className="text-left">
                            <div className="font-bold text-sm">形成深静脉血栓</div>
                            <div className="text-xs opacity-60">血流淤滞导致凝血</div>
                        </div>
                    </div>
                    <ChevronRight className="w-4 h-4 opacity-50" />
                </button>

                <div className="pt-4">
                     <button 
                        onClick={() => handleStateChange(SimulationState.DETACHING)}
                        disabled={simulationState !== SimulationState.THROMBUS_FORMED}
                        className={`w-full py-4 rounded-xl font-bold tracking-wide flex items-center justify-center gap-3 transition-all ${
                            simulationState === SimulationState.THROMBUS_FORMED
                            ? 'bg-gradient-to-r from-red-600 to-red-500 hover:to-red-400 text-white shadow-lg shadow-red-900/40 scale-100 hover:scale-[1.02]'
                            : 'bg-slate-900 border border-slate-800 text-slate-600 cursor-not-allowed'
                        }`}
                    >
                        <AlertTriangle className={`w-5 h-5 ${simulationState === SimulationState.THROMBUS_FORMED ? 'animate-bounce' : ''}`} />
                        危急演示：血栓脱落
                    </button>
                </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;

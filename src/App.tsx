import { useState, useRef, useEffect } from 'react';
import { Settings, X, Plus, Trash2, Palette, PieChart } from 'lucide-react';

type Segment = {
  id: number;
  title: string;
  description: string;
  color: string;
  textColor: string;
  orientation?: 'horizontal' | 'vertical';
};

type AppConfig = {
  title: {
    text: string;
    color: string;
    outlineColor: string;
    hasOutline: boolean;
    font: string;
  };
  button: {
    textTop: string;
    textBottom: string;
    colorTop: string;
    colorBottom: string;
    position: string;
    type: 'text' | 'solid' | 'image';
    bgColor: string;
    bgImage: string;
    outlineColor: string;
    hasOutline: boolean;
    textAlign: 'left' | 'center' | 'right';
    font: string;
  };
  background: {
    type: 'solid' | 'gradient';
    color1: string;
    color2: string;
  };
  wheel: {
    colorMode: 'custom' | 'pattern';
    patternColors: string[];
    font: string;
  };
  winner: {
    textTop: string;
    colorTop: string;
    type: 'text' | 'solid' | 'image';
    bgColor: string;
    bgImage: string;
    font: string;
  };
};

const INITIAL_CONFIG: AppConfig = {
  title: {
    text: 'BREAK TIME!',
    color: '#ff6eb4',
    outlineColor: '#ffffff',
    hasOutline: true,
    font: 'font-pixel',
  },
  button: {
    textTop: 'PRESS',
    textBottom: 'BUTTON',
    colorTop: '#fca048',
    colorBottom: '#e26b3c',
    position: 'left',
    type: 'text',
    bgColor: '#ffffff',
    bgImage: '',
    outlineColor: '#000000',
    hasOutline: false,
    textAlign: 'left',
    font: 'font-pixel',
  },
  background: {
    type: 'solid',
    color1: '#000000',
    color2: '#222222',
    bgImage: '/bg.png',
  },
  wheel: {
    colorMode: 'custom',
    patternColors: ['#ff4db8', '#72b036'],
    font: 'font-pixel',
  },
  winner: {
    textTop: 'The Winner is',
    colorTop: '#593112',
    type: 'solid',
    bgColor: '#dca475',
    bgImage: '',
    font: 'font-pixel',
  }
};

const DEFAULT_COLORS = ['#ff4db8', '#72b036', '#d82423', '#7851d9', '#fca048', '#36b0a9', '#d8d523', '#9623d8', '#23d875', '#d85a23', '#3a82f6', '#ec4899'];

const INITIAL_SEGMENTS: Segment[] = [
  { id: 1, title: '❤️', description: 'EXTRA LIFE', color: '#ff4db8', textColor: 'white', orientation: 'horizontal' },
  { id: 2, title: '1UP', description: 'PLAYER', color: '#72b036', textColor: 'white', orientation: 'horizontal' },
  { id: 3, title: '⭐', description: '500 PTS', color: '#d82423', textColor: 'white', orientation: 'horizontal' },
  { id: 4, title: '🧞', description: 'WISH', color: '#e9ecef', textColor: 'black', orientation: 'horizontal' },
  { id: 5, title: '2UP', description: 'PLAYER 2', color: '#7851d9', textColor: 'white', orientation: 'horizontal' },
  { id: 6, title: '⭐', description: '1000 PTS', color: '#d82423', textColor: 'white', orientation: 'horizontal' },
];

export default function App() {
  const [segments, setSegments] = useState<Segment[]>(INITIAL_SEGMENTS);
  const [config, setConfig] = useState<AppConfig>(INITIAL_CONFIG);
  const [settingsTab, setSettingsTab] = useState<'wheel' | 'appearance'>('wheel');
  const [showSettings, setShowSettings] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [genieState, setGenieState] = useState<'idle' | 'spinning' | 'result'>('idle');
  const [result, setResult] = useState<Segment | null>(null);
  
  const wheelRef = useRef<HTMLDivElement>(null);
  const spinRef = useRef<number>();
  const [manualGenieFrame, setManualGenieFrame] = useState<number | undefined>(undefined);

  useEffect(() => {
    return () => {
      if (spinRef.current) cancelAnimationFrame(spinRef.current);
    }
  }, []);

  const updateSegment = (index: number, field: keyof Segment, value: string) => {
    const newSegments = [...segments];
    newSegments[index] = { ...newSegments[index], [field]: value };
    setSegments(newSegments);
  };

  const updateConfig = (section: keyof AppConfig, field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] as any),
        [field]: value
      }
    }));
  };

  const addSegment = () => {
    if (segments.length >= 12) return;
    const newId = Math.max(0, ...segments.map(s => s.id)) + 1;
    const lastColor = segments.length > 0 ? segments[segments.length - 1].color : '';
    let nextColor = '#555555';
    const defaultIndex = DEFAULT_COLORS.indexOf(lastColor);
    if (defaultIndex !== -1) {
      nextColor = DEFAULT_COLORS[(defaultIndex + 1) % DEFAULT_COLORS.length];
    } else {
      const available = DEFAULT_COLORS.filter(c => c !== lastColor);
      nextColor = available[Math.floor(Math.random() * available.length)];
    }
    setSegments([...segments, { id: newId, title: 'NEW', description: '', color: nextColor, textColor: 'white', orientation: 'horizontal' }]);
  };

  const removeSegment = (index: number) => {
    if (segments.length <= 2) return;
    const newSegments = [...segments];
    newSegments.splice(index, 1);
    setSegments(newSegments);
  };

  const getSegmentColor = (index: number) => {
    if (config.wheel.colorMode === 'pattern' && config.wheel.patternColors.length > 0) {
      return config.wheel.patternColors[index % config.wheel.patternColors.length];
    }
    return segments[index].color;
  };

  const getConicGradient = () => {
    const step = 360 / segments.length;
    return segments.map((seg, i) => `${getSegmentColor(i)} ${i * step}deg ${(i + 1) * step}deg`).join(', ');
  };

  const spin = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setGenieState('spinning');
    setResult(null);
    
    const segmentAngle = 360 / segments.length;
    const resultIndex = Math.floor(Math.random() * segments.length);
    const segmentCenter = resultIndex * segmentAngle + segmentAngle / 2;
    
    // We want the winning segment to land at 180 degrees (bottom)
    let extraRotation = 180 - segmentCenter;
    if (extraRotation < 0) extraRotation += 360;
    
    const currentRotations = Math.floor(rotation / 360);
    const targetRotation = (currentRotations + 5) * 360 + extraRotation;
    const startRotation = rotation;
    const duration = 3000;
    const startTime = performance.now();

    const animate = (time: number) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // easeOutQuart
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      const currentRot = startRotation + (targetRotation - startRotation) * easeProgress;
      
      if (wheelRef.current) {
        wheelRef.current.style.transform = `rotate(${currentRot}deg)`;
      }

      // Check distance to nearest divider (a divider is at 0 degrees when currentRot % segmentAngle == 0)
      const rotMod = currentRot % segmentAngle;
      let distanceToTop = rotMod;
      if (distanceToTop > segmentAngle / 2) {
        distanceToTop = segmentAngle - rotMod;
      }
      
      let frame = 0;
      if (distanceToTop < segmentAngle * 0.1) {
         frame = 2; // fully pointing
      } else if (distanceToTop < segmentAngle * 0.25) {
         frame = 1; // half pointing
      } else {
         frame = 0; // idle
      }

      setManualGenieFrame(frame);

      if (progress < 1) {
        spinRef.current = requestAnimationFrame(animate);
      } else {
        setRotation(targetRotation);
        setIsSpinning(false);
        setGenieState('result');
        setManualGenieFrame(undefined);
        setResult({ ...segments[resultIndex], color: getSegmentColor(resultIndex) });
        setTimeout(() => setGenieState('idle'), 3000);
      }
    };
    spinRef.current = requestAnimationFrame(animate);
  };

  const renderPressButton = () => {
    const isHorizontal = config.button.position === 'bottom';
    
    let containerStyle: React.CSSProperties = {
      backgroundColor: config.button.type === 'solid' ? config.button.bgColor : 'transparent',
    };
    if (config.button.type === 'image' && config.button.bgImage) {
      containerStyle.backgroundImage = `url(${config.button.bgImage})`;
      containerStyle.backgroundSize = '100% 100%';
      containerStyle.backgroundPosition = 'center';
      containerStyle.backgroundColor = 'transparent';
    }

    let textShadow = config.button.hasOutline ? `2px 0 0 ${config.button.outlineColor}, -2px 0 0 ${config.button.outlineColor}, 0 2px 0 ${config.button.outlineColor}, 0 -2px 0 ${config.button.outlineColor}, 2px 2px 0 ${config.button.outlineColor}, -2px -2px 0 ${config.button.outlineColor}, 2px -2px 0 ${config.button.outlineColor}, -2px 2px 0 ${config.button.outlineColor}, 4px 4px 0 rgba(0,0,0,0.5)` : '4px 4px 0 rgba(0,0,0,0.5)';

    const alignClass = config.button.textAlign === 'center' ? 'items-center text-center justify-center' : config.button.textAlign === 'right' ? 'items-end text-right justify-end' : 'items-start text-left justify-start';

    return (
      <button 
        onClick={spin}
        disabled={isSpinning}
        className={`hover:scale-110 active:scale-95 transition-transform disabled:opacity-50 cursor-pointer outline-none flex ${isHorizontal ? 'flex-row gap-6' : 'flex-col gap-3 md:gap-2'} ${alignClass} ${config.button.font} ${config.button.type !== 'text' ? 'px-6 py-4 rounded-xl shadow-[4px_4px_0_#000]' : 'bg-transparent border-none'} ${config.button.type === 'solid' ? 'border-4 border-black' : ''}`}
        style={containerStyle}
      >
        {config.button.textTop && (
          <div className="text-xl sm:text-2xl md:text-3xl" style={{ color: config.button.colorTop, textShadow }}>{config.button.textTop}</div>
        )}
        {config.button.textBottom && (
          <div className="text-xl sm:text-2xl md:text-3xl" style={{ color: config.button.colorBottom, textShadow }}>{config.button.textBottom}</div>
        )}
      </button>
    );
  };

  const renderWinnerBanner = () => {
    if (!result || genieState !== 'result') return null;

    if (config.winner.type === 'text') {
      return (
        <div className={`relative animate-bounce select-none text-center flex flex-col items-center min-w-[280px] max-w-[90vw] px-8 py-4 z-10 ${config.winner.font}`}>
          <div className="text-[10px] sm:text-xs mb-2 font-black tracking-widest opacity-80 uppercase" style={{ color: config.winner.colorTop, textShadow: '1px 1px 0 rgba(0,0,0,0.5)' }}>{config.winner.textTop}</div>
          <div className="text-2xl sm:text-4xl" style={{ color: result.color || '#ff4db8', textShadow: '2px 2px 0px #000, -2px -2px 0px #000, 2px -2px 0px #000, -2px 2px 0px #000, 4px 4px 0px rgba(0,0,0,0.3)' }}>
            {result.title}
          </div>
          {result.description && (
            <div className="text-xs sm:text-sm mt-3 text-white font-bold tracking-[0.2em] uppercase drop-shadow-md">{result.description}</div>
          )}
        </div>
      );
    }

    if (config.winner.type === 'image') {
      return (
        <div 
          className={`relative animate-bounce select-none text-center flex flex-col items-center min-w-[280px] max-w-[90vw] px-12 py-8 bg-center bg-[length:100%_100%] bg-no-repeat ${config.winner.font}`}
          style={{ backgroundImage: config.winner.bgImage ? `url(${config.winner.bgImage})` : 'none' }}
        >
          <div className="z-10">
            <div className="text-[10px] sm:text-xs mb-2 font-black tracking-widest opacity-80 uppercase" style={{ color: config.winner.colorTop }}>{config.winner.textTop}</div>
            <div className="text-2xl sm:text-4xl" style={{ color: result.color || '#ff4db8', textShadow: '2px 2px 0px #000, -2px -2px 0px #000, 2px -2px 0px #000, -2px 2px 0px #000, 4px 4px 0px rgba(0,0,0,0.3)' }}>
              {result.title}
            </div>
            {result.description && (
              <div className="text-xs sm:text-sm mt-3 font-bold tracking-[0.2em] uppercase" style={{ color: config.winner.colorTop }}>{result.description}</div>
            )}
          </div>
        </div>
      );
    }

    // Default: 'solid' (the scroll)
    return (
      <div className="relative animate-bounce select-none text-center flex flex-col items-center min-w-[280px] max-w-[90vw] px-8 py-4">
        {/* Background Scroll Core */}
        <div className="absolute inset-0 border-y-[4px] border-[#593112] -z-10 shadow-[0_8px_0_rgba(0,0,0,0.25)]" style={{ backgroundColor: config.winner.bgColor }}>
          <div className="absolute top-[2px] left-1 right-1 border-t-[2px] border-dashed border-[#c18c5e]"></div>
          <div className="absolute bottom-[2px] left-1 right-1 border-b-[2px] border-dashed border-[#c18c5e]"></div>
        </div>

        {/* Scroll Left Roll */}
        <div className="absolute top-[-6px] bottom-[-6px] left-[-20px] w-[24px] border-[4px] border-[#593112] rounded-l-xl -z-10 shadow-[-6px_8px_0_rgba(0,0,0,0.25)] overflow-hidden" style={{ backgroundColor: config.winner.bgColor, filter: 'brightness(0.85)' }}>
           <div className="absolute top-[10px] left-[4px] w-[12px] h-[16px] border-r-[4px] border-y-[4px] border-[#593112] rounded-r-full"></div>
           <div className="absolute bottom-[10px] left-[4px] w-[12px] h-[16px] border-r-[4px] border-y-[4px] border-[#593112] rounded-r-full"></div>
        </div>

        {/* Scroll Right Roll */}
        <div className="absolute top-[-6px] bottom-[-6px] right-[-20px] w-[24px] border-[4px] border-[#593112] rounded-r-xl -z-10 shadow-[6px_8px_0_rgba(0,0,0,0.25)] overflow-hidden" style={{ backgroundColor: config.winner.bgColor, filter: 'brightness(0.85)' }}>
           <div className="absolute top-[10px] right-[4px] w-[12px] h-[16px] border-l-[4px] border-y-[4px] border-[#593112] rounded-l-full"></div>
           <div className="absolute bottom-[10px] right-[4px] w-[12px] h-[16px] border-l-[4px] border-y-[4px] border-[#593112] rounded-l-full"></div>
        </div>

        {/* Text Content */}
        <div className={`z-10 ${config.winner.font}`}>
          <div className="text-[10px] sm:text-xs mb-2 font-black tracking-widest opacity-80 uppercase" style={{ color: config.winner.colorTop }}>{config.winner.textTop}</div>
          <div className="text-2xl sm:text-4xl" style={{ color: result.color || '#ff4db8', textShadow: '2px 2px 0px #000, -2px -2px 0px #000, 2px -2px 0px #000, -2px 2px 0px #000, 4px 4px 0px rgba(0,0,0,0.3)' }}>
            {result.title}
          </div>
          {result.description && (
            <div className="text-xs sm:text-sm mt-3 font-bold tracking-[0.2em] uppercase" style={{ color: config.winner.colorTop }}>{result.description}</div>
          )}
        </div>
      </div>
    );
  };

  const getBackgroundStyle = (): React.CSSProperties => {
    const style: React.CSSProperties = {};
    const baseGradient = config.background.type === 'gradient' ? `linear-gradient(135deg, ${config.background.color1}, ${config.background.color2})` : null;

    if (config.background.bgImage) {
      style.backgroundImage = baseGradient ? `url(${config.background.bgImage}), ${baseGradient}` : `url(${config.background.bgImage})`;
      style.backgroundSize = 'cover';
      style.backgroundPosition = 'center';
      style.backgroundRepeat = 'no-repeat';
      if (!baseGradient) {
        style.backgroundColor = config.background.color1;
      }
    } else if (baseGradient) {
      style.background = baseGradient;
    } else {
      style.backgroundColor = config.background.color1;
    }
    
    return style;
  };

  return (
    <div 
      className={`min-h-[100dvh] flex flex-col items-center justify-center p-2 sm:p-4 text-white overflow-hidden relative ${config.title.font}`}
      style={getBackgroundStyle()}
    >
      
      {/* Title */}
      <h1 
        className="text-2xl sm:text-4xl md:text-5xl mt-2 mb-6 sm:mb-10 text-center select-none"
        style={{ 
          color: config.title.color,
          textShadow: config.title.hasOutline ? `2px 0 0 ${config.title.outlineColor}, -2px 0 0 ${config.title.outlineColor}, 0 2px 0 ${config.title.outlineColor}, 0 -2px 0 ${config.title.outlineColor}, 2px 2px 0 ${config.title.outlineColor}, -2px -2px 0 ${config.title.outlineColor}, 2px -2px 0 ${config.title.outlineColor}, -2px 2px 0 ${config.title.outlineColor}, 6px 6px 0 #000` : '6px 6px 0 #000',
        }}
      >
        {config.title.text}
      </h1>

      {/* Main Play Area */}
      <div className={`relative flex items-center justify-center w-full max-w-6xl gap-6 sm:gap-8 ${config.button.position === 'bottom' ? 'flex-col' : 'flex-col md:flex-row'}`}>
        
        {/* Settings Button */}
        <button 
          onClick={() => setShowSettings(true)}
          className="fixed top-4 right-4 sm:top-6 sm:right-6 z-[60] bg-white text-black p-3 rounded-full hover:bg-gray-200 hover:scale-105 transition-all shadow-lg flex items-center justify-center border border-gray-200"
          title="Configure Wheel"
        >
          <Settings size={24} className="text-gray-800" />
        </button>

        {/* Left Space (Button or empty) */}
        {config.button.position !== 'bottom' && (
          <div className={`md:flex-1 flex justify-center md:justify-end w-full z-30 ${config.button.position !== 'left' ? 'hidden md:flex' : ''}`}>
            {config.button.position === 'left' && renderPressButton()}
          </div>
        )}

        {/* Wheel Container */}
        <div className="relative w-[80vw] max-w-[280px] sm:max-w-[350px] md:max-w-[450px] lg:max-w-[500px] aspect-square shrink-0">
           
          {/* The Spinning Wheel */}
          <div 
            ref={wheelRef}
            className="absolute inset-0 rounded-full overflow-hidden border-[8px] md:border-[12px] border-[#d49936] shadow-[0_0_0_4px_#000,inset_0_0_0_2px_#000]"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: 'none',
              background: `conic-gradient(${getConicGradient()})`
            }}
          >
            {/* Dividers */}
            {segments.map((_, i) => (
              <div 
                key={`div-${i}`}
                className="absolute top-0 bottom-1/2 left-1/2 w-[6px] md:w-[10px] origin-bottom bg-[#d49936] border-x-[1px] md:border-x-[2px] border-black"
                style={{ transform: `translateX(-50%) rotate(${i * (360 / segments.length)}deg)` }}
              />
            ))}
            
            {/* Content for each segment */}
            {segments.map((seg, i) => (
              <div
                key={`seg-${i}`}
                className={`absolute top-0 left-1/2 origin-bottom text-sm sm:text-lg md:text-xl drop-shadow-[2px_2px_0_rgba(0,0,0,1)] ${config.wheel.font}`}
                style={{
                  width: '120px',
                  height: '50%',
                  marginLeft: '-60px',
                  transform: `rotate(${i * (360 / segments.length) + (360 / segments.length) / 2}deg)`,
                  color: seg.textColor,
                }}
              >
                <div 
                  className={`absolute inset-0 flex ${seg.orientation === 'vertical' ? 'flex-row' : 'flex-col'} items-center justify-end pb-6 sm:pb-8 md:pb-12`}
                  style={{ transform: 'rotate(180deg)', transformOrigin: 'center' }}
                >
                  <div style={{ writingMode: seg.orientation === 'vertical' ? 'vertical-rl' : 'horizontal-tb', textOrientation: 'upright' }}>
                    <div className="text-center">{seg.title}</div>
                  </div>
                  {seg.description && (
                    <div 
                      className="text-[8px] sm:text-[10px] text-center px-1 opacity-90 leading-tight"
                      style={{
                        marginTop: seg.orientation === 'vertical' ? 0 : '0.5rem',
                        marginLeft: seg.orientation === 'vertical' ? '0.5rem' : 0,
                        writingMode: seg.orientation === 'vertical' ? 'vertical-rl' : 'horizontal-tb',
                        textOrientation: 'upright',
                      }}
                    >
                      <div>{seg.description}</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Inner Hole Cover */}
          <div className="absolute top-[25%] left-[25%] right-[25%] bottom-[25%] bg-black rounded-full border-[8px] md:border-[12px] border-[#d49936] shadow-[0_0_0_4px_#000,inset_0_0_0_4px_#000]"></div>

          {/* Genie Sprite Container */}
          <div className="absolute top-[-5%] left-[-5%] right-[-5%] bottom-[-5%] flex items-center justify-center z-20 pointer-events-none">
            <Sprite src="/genie1.png" frames={10} speed={1.2} fallbackText="Genie" className={`w-[85%] aspect-square ${genieState !== 'idle' ? 'hidden' : ''}`} />
            <Sprite src="/genie2.png" frames={3} speed={0.3} fallbackText="Genie" className={`w-[85%] aspect-square ${genieState !== 'spinning' ? 'hidden' : ''}`} manualFrame={manualGenieFrame} />
            <Sprite src="/genie3.png" frames={2} speed={0.5} fallbackText="Genie" className={`w-[85%] aspect-square scale-110 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] ${genieState !== 'result' ? 'hidden' : ''}`} />
          </div>
          
        </div>

        {/* Right Space (Button or empty) */}
        {config.button.position !== 'bottom' && (
          <div className={`md:flex-1 flex justify-center md:justify-start w-full z-30 ${config.button.position !== 'right' ? 'hidden md:flex' : ''}`}>
            {config.button.position === 'right' && renderPressButton()}
          </div>
        )}

      </div>
      
      {/* Bottom Button Space */}
      {config.button.position === 'bottom' && (
        <div className="flex justify-center w-full z-30 mt-4">
          {renderPressButton()}
        </div>
      )}

      {/* Result Display Banner */}
      <div className="mt-4 h-full flex items-center justify-center z-30 mb-2 px-4 w-full">
        {renderWinnerBanner()}
      </div>

      {/* Settings Modal - Modern UI */}
      {showSettings && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 font-sans">
          <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-4xl overflow-y-auto max-h-[90vh] shadow-2xl flex flex-col text-gray-900 border border-gray-200">
             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sticky top-0 bg-white z-20 pb-4 border-b border-gray-100 gap-4">
               <h2 className="text-2xl font-bold text-gray-800 tracking-tight shrink-0">Configure Settings</h2>
               
               <div className="flex bg-gray-100 p-1 rounded-xl w-full sm:w-auto">
                 <button 
                   onClick={() => setSettingsTab('wheel')}
                   className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${settingsTab === 'wheel' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                 >
                   <PieChart size={18} />
                   <span>Wheel</span>
                 </button>
                 <button 
                   onClick={() => setSettingsTab('appearance')}
                   className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${settingsTab === 'appearance' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                 >
                   <Palette size={18} />
                   <span>Appearance</span>
                 </button>
               </div>

               <button onClick={() => setShowSettings(false)} className="absolute right-0 top-0 sm:relative p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"><X size={24} /></button>
             </div>
             
             <div className="flex flex-col gap-4 overflow-y-auto pr-2 pb-4">
               {settingsTab === 'wheel' && (
                 <>
                   {/* Wheel Color Mode Selector */}
                   <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex flex-col gap-4 mb-2">
                     <h3 className="font-bold text-gray-800 text-lg border-b border-gray-200 pb-2">Wheel Colors</h3>
                     
                     <div className="flex flex-col gap-1.5">
                       <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Color Mode</label>
                       <select
                         value={config.wheel.colorMode}
                         onChange={(e) => updateConfig('wheel', 'colorMode', e.target.value)}
                         className="bg-white border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 block w-full p-2.5"
                       >
                         <option value="custom">Custom (per segment)</option>
                         <option value="pattern">Pattern (repeating sequence)</option>
                       </select>
                     </div>
                     <div className="flex flex-col gap-1.5">
                       <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Font Family</label>
                       <select 
                         value={config.wheel.font}
                         onChange={(e) => updateConfig('wheel', 'font', e.target.value)}
                         className="bg-white border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 block w-full p-2.5"
                       >
                         <option value="font-pixel">Pixel (Press Start 2P)</option>
                         <option value="font-sans">Sans (Inter)</option>
                         <option value="font-mono">Mono (JetBrains)</option>
<option value="font-aladin">Aladdin (Aladin)</option>
                       </select>
                     </div>
                     
                     {config.wheel.colorMode === 'pattern' && (
                       <div className="mt-2 flex flex-col gap-2">
                         <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pattern Sequence</label>
                         <div className="flex flex-wrap gap-3 items-center">
                           {config.wheel.patternColors.map((color, idx) => (
                              <div key={idx} className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200 shadow-sm shrink-0 cursor-pointer group">
                                <input 
                                  type="color" 
                                  value={color} 
                                  onChange={(e) => {
                                    const newColors = [...config.wheel.patternColors];
                                    newColors[idx] = e.target.value;
                                    updateConfig('wheel', 'patternColors', newColors);
                                  }} 
                                  className="absolute inset-[-10px] w-16 h-16 cursor-pointer" 
                                />
                                {config.wheel.patternColors.length > 1 && (
                                  <button 
                                    onClick={(e) => {
                                      e.preventDefault();
                                      const newColors = config.wheel.patternColors.filter((_, i) => i !== idx);
                                      updateConfig('wheel', 'patternColors', newColors);
                                    }}
                                    className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="Remove color"
                                  >
                                    <X size={14} />
                                  </button>
                                )}
                              </div>
                           ))}
                           {config.wheel.patternColors.length < 12 && (
                              <button
                                onClick={() => {
                                  const nextColor = DEFAULT_COLORS[config.wheel.patternColors.length % DEFAULT_COLORS.length];
                                  const newColors = [...config.wheel.patternColors, nextColor];
                                  updateConfig('wheel', 'patternColors', newColors);
                                }}
                                className="w-10 h-10 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:text-blue-500 hover:border-blue-500 transition-colors shadow-sm bg-white"
                                title="Add color to pattern"
                              >
                                <Plus size={18} />
                              </button>
                           )}
                         </div>
                       </div>
                     )}
                   </div>

                   {segments.map((seg, i) => (
                      <div key={seg.id} className="flex flex-col md:flex-row gap-4 items-start md:items-center bg-gray-50 p-5 rounded-2xl border border-gray-100 transition-shadow hover:shadow-md">
                         <div className="flex items-center gap-4 w-full md:w-auto">
                           <span className="w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-700 font-bold rounded-full shrink-0">{i+1}</span>
                           <div className="md:hidden flex-1 font-semibold text-gray-700">Segment {i+1}</div>
                         </div>
                         
                         <div className="grid grid-cols-1 md:grid-cols-12 gap-4 flex-1 w-full">
                            <div className="flex flex-col gap-1.5 md:col-span-3">
                              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Title/Icon</label>
                              <input 
                                value={seg.title}
                                onChange={(e) => updateSegment(i, 'title', e.target.value)}
                                className="bg-white border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 transition-shadow outline-none" 
                                placeholder="Title or Icon" 
                                maxLength={8}
                              />
                            </div>
                            <div className="flex flex-col gap-1.5 md:col-span-5">
                              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</label>
                              <input 
                                value={seg.description}
                                onChange={(e) => updateSegment(i, 'description', e.target.value)}
                                className="bg-white border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 transition-shadow outline-none" 
                                placeholder="Short description" 
                                maxLength={20}
                              />
                            </div>
                            <div className="flex flex-col gap-1.5 md:col-span-4">
                              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Orientation</label>
                              <select 
                                value={seg.orientation || 'horizontal'}
                                onChange={(e) => updateSegment(i, 'orientation', e.target.value as 'horizontal' | 'vertical')}
                                className="bg-white border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 transition-shadow outline-none"
                              >
                                <option value="horizontal">Horizontal</option>
                                <option value="vertical">Vertical</option>
                              </select>
                            </div>
                         </div>

                         <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto pt-4 md:pt-0 border-t border-gray-200 md:border-none mt-2 md:mt-0">
                           {config.wheel.colorMode === 'custom' && (
                             <div className="flex items-center gap-3">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider md:hidden">Color</label>
                                <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200 shadow-sm shrink-0 hover:scale-105 transition-transform cursor-pointer">
                                  <input 
                                    type="color" 
                                    value={seg.color}
                                    onChange={(e) => updateSegment(i, 'color', e.target.value)}
                                    className="absolute inset-[-10px] w-16 h-16 cursor-pointer p-0 m-0 border-0"
                                  />
                                </div>
                             </div>
                           )}
                           
                           <button 
                             onClick={() => removeSegment(i)}
                             disabled={segments.length <= 2}
                             className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400 ml-auto"
                             title="Remove Segment"
                           >
                             <Trash2 size={20} />
                           </button>
                         </div>
                      </div>
                   ))}
                   
                   {segments.length < 12 && (
                     <button 
                       onClick={addSegment}
                       className="w-full py-5 border-2 border-dashed border-gray-300 text-gray-500 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50 rounded-2xl transition-all flex justify-center items-center gap-2 font-semibold shadow-sm mt-2"
                     >
                       <Plus size={24} />
                       <span>Add New Segment</span>
                     </button>
                   )}
                 </>
               )}

               {settingsTab === 'appearance' && (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {/* Title Settings */}
                   <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex flex-col gap-4">
                     <h3 className="font-bold text-gray-800 text-lg border-b border-gray-200 pb-2">Title</h3>
                     
                     <div className="flex flex-col gap-1.5">
                       <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Text</label>
                       <input 
                         value={config.title.text}
                         onChange={(e) => updateConfig('title', 'text', e.target.value)}
                         className="bg-white border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 block w-full p-2.5" 
                       />
                     </div>
                     <div className="flex flex-col gap-1.5">
                       <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Font Family</label>
                       <select 
                         value={config.title.font}
                         onChange={(e) => updateConfig('title', 'font', e.target.value)}
                         className="bg-white border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 block w-full p-2.5"
                       >
                         <option value="font-pixel">Pixel (Press Start 2P)</option>
                         <option value="font-sans">Sans (Inter)</option>
                         <option value="font-mono">Mono (JetBrains)</option>
<option value="font-aladin">Aladdin (Aladin)</option>
                       </select>
                     </div>
                     <div className="flex items-center gap-4 mt-2">
                       <div className="flex flex-col gap-1.5">
                         <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Color</label>
                         <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200 cursor-pointer">
                           <input type="color" value={config.title.color} onChange={(e) => updateConfig('title', 'color', e.target.value)} className="absolute inset-[-10px] w-16 h-16 cursor-pointer" />
                         </div>
                       </div>
                       <div className="flex flex-col gap-1.5">
                         <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Outline</label>
                         <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200 cursor-pointer">
                           <input type="color" value={config.title.outlineColor} onChange={(e) => updateConfig('title', 'outlineColor', e.target.value)} className="absolute inset-[-10px] w-16 h-16 cursor-pointer" />
                         </div>
                       </div>
                       <div className="flex flex-col gap-1.5 ml-4">
                         <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Enable Outline</label>
                         <label className="relative inline-flex items-center cursor-pointer mt-1">
                           <input type="checkbox" checked={config.title.hasOutline} onChange={(e) => updateConfig('title', 'hasOutline', e.target.checked)} className="sr-only peer" />
                           <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                         </label>
                       </div>
                     </div>
                   </div>

                   {/* Background Settings */}
                   <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex flex-col gap-4">
                     <h3 className="font-bold text-gray-800 text-lg border-b border-gray-200 pb-2">Background</h3>
                     
                     <div className="flex flex-col gap-1.5">
                       <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Style</label>
                       <select 
                         value={config.background.type}
                         onChange={(e) => updateConfig('background', 'type', e.target.value)}
                         className="bg-white border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 block w-full p-2.5"
                       >
                         <option value="solid">Solid Color</option>
                         <option value="gradient">Gradient</option>
                       </select>
                     </div>
                     <div className="flex items-center gap-4 mt-2">
                       <div className="flex flex-col gap-1.5">
                         <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Color 1</label>
                         <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200 cursor-pointer">
                           <input type="color" value={config.background.color1} onChange={(e) => updateConfig('background', 'color1', e.target.value)} className="absolute inset-[-10px] w-16 h-16 cursor-pointer" />
                         </div>
                       </div>
                       {config.background.type === 'gradient' && (
                         <div className="flex flex-col gap-1.5">
                           <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Color 2</label>
                           <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200 cursor-pointer">
                             <input type="color" value={config.background.color2} onChange={(e) => updateConfig('background', 'color2', e.target.value)} className="absolute inset-[-10px] w-16 h-16 cursor-pointer" />
                           </div>
                         </div>
                       )}
                     </div>
                     <div className="flex flex-col gap-1.5 mt-2">
                       <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Background Image URL</label>
                       <input 
                         value={config.background.bgImage}
                         onChange={(e) => updateConfig('background', 'bgImage', e.target.value)}
                         className="bg-white border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 block w-full p-2.5"
                         placeholder="https://example.com/bg.png"
                       />
                     </div>
                   </div>

                   {/* Button Settings */}
                   <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex flex-col gap-4 md:col-span-2">
                     <h3 className="font-bold text-gray-800 text-lg border-b border-gray-200 pb-2">Spin Button</h3>
                     
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       <div className="flex flex-col gap-1.5">
                         <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Top Text</label>
                         <div className="flex gap-2">
                           <input value={config.button.textTop} onChange={(e) => updateConfig('button', 'textTop', e.target.value)} className="bg-white border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 block w-full p-2.5" />
                           <div className="relative w-10 h-10 rounded-lg overflow-hidden border-2 border-gray-200 shrink-0">
                             <input type="color" value={config.button.colorTop} onChange={(e) => updateConfig('button', 'colorTop', e.target.value)} className="absolute inset-[-10px] w-16 h-16 cursor-pointer" />
                           </div>
                         </div>
                       </div>
                       <div className="flex flex-col gap-1.5">
                         <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Bottom Text</label>
                         <div className="flex gap-2">
                           <input value={config.button.textBottom} onChange={(e) => updateConfig('button', 'textBottom', e.target.value)} className="bg-white border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 block w-full p-2.5" />
                           <div className="relative w-10 h-10 rounded-lg overflow-hidden border-2 border-gray-200 shrink-0">
                             <input type="color" value={config.button.colorBottom} onChange={(e) => updateConfig('button', 'colorBottom', e.target.value)} className="absolute inset-[-10px] w-16 h-16 cursor-pointer" />
                           </div>
                         </div>
                       </div>
                     </div>

                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                       <div className="flex flex-col gap-1.5">
                         <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Position</label>
                         <select 
                           value={config.button.position}
                           onChange={(e) => updateConfig('button', 'position', e.target.value)}
                           className="bg-white border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 block w-full p-2.5"
                         >
                           <option value="left">Left</option>
                           <option value="right">Right</option>
                           <option value="bottom">Bottom</option>
                         </select>
                       </div>
                       <div className="flex flex-col gap-1.5">
                         <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Font Family</label>
                         <select 
                           value={config.button.font}
                           onChange={(e) => updateConfig('button', 'font', e.target.value)}
                           className="bg-white border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 block w-full p-2.5"
                         >
                           <option value="font-pixel">Pixel (Press Start 2P)</option>
                           <option value="font-sans">Sans (Inter)</option>
                           <option value="font-mono">Mono (JetBrains)</option>
<option value="font-aladin">Aladdin (Aladin)</option>
                         </select>
                       </div>
                     </div>

                     <div className="flex flex-col gap-1.5 mt-2">
                       <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Button Style</label>
                       <div className="flex gap-2">
                         <select 
                           value={config.button.type}
                           onChange={(e) => updateConfig('button', 'type', e.target.value)}
                           className="bg-white border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 block w-full p-2.5 flex-1"
                         >
                             <option value="text">Text Only</option>
                             <option value="solid">Solid Button</option>
                             <option value="image">Image Button</option>
                           </select>
                           {config.button.type === 'solid' && (
                             <div className="relative w-10 h-10 rounded-lg overflow-hidden border-2 border-gray-200 shrink-0">
                               <input type="color" value={config.button.bgColor} onChange={(e) => updateConfig('button', 'bgColor', e.target.value)} className="absolute inset-[-10px] w-16 h-16 cursor-pointer" />
                             </div>
                           )}
                         </div>
                       </div>
                       
                       {config.button.type === 'image' && (
                         <div className="flex flex-col gap-1.5 mt-2">
                           <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Background Image URL</label>
                           <input 
                             value={config.button.bgImage}
                             onChange={(e) => updateConfig('button', 'bgImage', e.target.value)}
                             className="bg-white border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 block w-full p-2.5"
                             placeholder="https://example.com/image.png"
                           />
                         </div>
                       )}

                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                         <div className="flex flex-col gap-1.5">
                           <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Text Alignment</label>
                           <select 
                             value={config.button.textAlign}
                             onChange={(e) => updateConfig('button', 'textAlign', e.target.value)}
                             className="bg-white border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 block w-full p-2.5"
                           >
                             <option value="left">Left</option>
                             <option value="center">Center</option>
                             <option value="right">Right</option>
                           </select>
                         </div>
                         <div className="flex flex-col gap-1.5">
                           <div className="flex items-center justify-between mb-1">
                             <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Outline</label>
                             <label className="relative inline-flex items-center cursor-pointer">
                               <input type="checkbox" checked={config.button.hasOutline} onChange={(e) => updateConfig('button', 'hasOutline', e.target.checked)} className="sr-only peer" />
                               <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                             </label>
                           </div>
                           <div className="flex gap-2">
                             <div className="bg-gray-100 border border-gray-200 text-gray-500 text-sm rounded-lg block w-full p-2.5 flex items-center justify-center opacity-50 select-none">
                               Outline Color
                             </div>
                             <div className="relative w-10 h-10 rounded-lg overflow-hidden border-2 border-gray-200 shrink-0">
                               <input type="color" value={config.button.outlineColor} onChange={(e) => updateConfig('button', 'outlineColor', e.target.value)} disabled={!config.button.hasOutline} className={`absolute inset-[-10px] w-16 h-16 cursor-pointer ${!config.button.hasOutline ? 'opacity-50' : ''}`} />
                             </div>
                           </div>
                         </div>
                       </div>

                     </div>
                   
                   {/* Winner Banner Settings */}
                   <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex flex-col gap-4 md:col-span-2">
                     <h3 className="font-bold text-gray-800 text-lg border-b border-gray-200 pb-2">Winner Banner</h3>
                     
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       <div className="flex flex-col gap-1.5">
                         <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Top Text</label>
                         <div className="flex gap-2">
                           <input 
                             value={config.winner.textTop} 
                             onChange={(e) => updateConfig('winner', 'textTop', e.target.value)} 
                             className="bg-white border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 block w-full p-2.5" 
                           />
                           <div className="relative w-10 h-10 rounded-lg overflow-hidden border-2 border-gray-200 shrink-0 cursor-pointer">
                             <input type="color" value={config.winner.colorTop} onChange={(e) => updateConfig('winner', 'colorTop', e.target.value)} className="absolute inset-[-10px] w-16 h-16 cursor-pointer" />
                           </div>
                         </div>
                       </div>
                       <div className="flex flex-col gap-1.5">
                         <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Font Family</label>
                         <select 
                           value={config.winner.font}
                           onChange={(e) => updateConfig('winner', 'font', e.target.value)}
                           className="bg-white border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 block w-full p-2.5"
                         >
                           <option value="font-pixel">Pixel (Press Start 2P)</option>
                           <option value="font-sans">Sans (Inter)</option>
                           <option value="font-mono">Mono (JetBrains)</option>
                           <option value="font-aladin">Aladdin (Aladin)</option>
                         </select>
                       </div>
                     </div>

                     <div className="flex flex-col gap-1.5 mt-2">
                       <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Banner Style</label>
                       <div className="flex gap-2">
                         <select 
                           value={config.winner.type}
                           onChange={(e) => updateConfig('winner', 'type', e.target.value)}
                           className="bg-white border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 block w-full p-2.5 flex-1"
                         >
                             <option value="text">Text Only</option>
                             <option value="solid">Scroll Banner</option>
                             <option value="image">Image Banner</option>
                           </select>
                           {config.winner.type === 'solid' && (
                             <div className="relative w-10 h-10 rounded-lg overflow-hidden border-2 border-gray-200 shrink-0">
                               <input type="color" value={config.winner.bgColor} onChange={(e) => updateConfig('winner', 'bgColor', e.target.value)} className="absolute inset-[-10px] w-16 h-16 cursor-pointer" />
                             </div>
                           )}
                         </div>
                       </div>
                       
                       {config.winner.type === 'image' && (
                         <div className="flex flex-col gap-1.5 mt-2">
                           <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Background Image URL</label>
                           <input 
                             value={config.winner.bgImage}
                             onChange={(e) => updateConfig('winner', 'bgImage', e.target.value)}
                             className="bg-white border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 block w-full p-2.5"
                             placeholder="https://example.com/banner.png"
                           />
                         </div>
                       )}

                   </div>

                 </div>
               )}
             </div>
          </div>
        </div>
      )}

      <div className="absolute bottom-2 text-center text-[10px] text-white/30 font-sans z-50">
        Sprite images must be placed in the public folder.
      </div>
    </div>
  );
}

function Sprite({ src, frames, speed, className, fallbackText, manualFrame }: { src: string, frames: number, speed: number, className?: string, fallbackText: string, manualFrame?: number }) {
  const [error, setError] = useState(false);
  
  if (error) {
    return (
      <div className={`flex flex-col items-center justify-center bg-transparent text-white font-pixel rounded-full p-4 text-center ${className}`}>
        <span className="text-xs">{fallbackText}</span>
      </div>
    );
  }

  const isManual = manualFrame !== undefined;

  return (
    <div className={`overflow-hidden relative flex items-center justify-start ${className}`}>
      <img
        src={src}
        alt={fallbackText}
        onError={() => setError(true)}
        className="absolute top-0 left-0 h-full max-w-none"
        style={isManual ? {
          width: `${frames * 100}%`,
          transform: `translateX(-${(manualFrame! / frames) * 100}%)`,
        } : {
          width: `${frames * 100}%`,
          animation: `sprite${frames} ${speed}s steps(${frames}) infinite`
        }}
      />
    </div>
  )
}

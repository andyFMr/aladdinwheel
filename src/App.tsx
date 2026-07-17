import React, { useState, useRef, useEffect } from 'react';
import { Settings, X, Plus, Trash2, Palette, PieChart, Trophy, RotateCcw, CheckCircle2, ListOrdered, Save, Download, Upload, FolderOpen, Share2, Play, Info, Image as ImageIcon, Type } from 'lucide-react';
import { BitmapText } from './BitmapText';
import { FontManager } from './FontManager';

type Segment = {
  id: number;
  title: string;
  description: string;
  color: string;
  textColor: string;
};

type ChosenItem = Segment & {
  chosenAt: string;
  originalId: number;
};

type SavedPreset = {
  id: string;
  name: string;
  savedAt: string;
  config: AppConfig;
  segments: Segment[];
};

export type CustomImageAsset = {
  id: string; // unique ID
  source: string; // URL, Base64 or local path
  scale: number;
  offsetX: number;
  offsetY: number;
  pixelated: boolean;
};

export type CustomFontAsset = {
  id: string; // e.g. 'font-custom-1'
  name: string; // e.g. 'My Retro Font'
  type: 'file' | 'tileset';
  source: string; // base64 or path
  // for tileset only:
  charWidth?: number;
  charHeight?: number;
  charsPerRow?: number;
  asciiOffset?: number; // Usually 32 (Space)
};

export const AssetEditor = ({
  label,
  asset,
  onChange,
  onUpload
}: {
  label: string,
  asset?: CustomImageAsset,
  onChange: (key: keyof CustomImageAsset, val: any) => void,
  onUpload: (b64: string) => void
}) => {
  if (!asset) return null;
  return (
    <div className="flex flex-col gap-3 p-4 bg-white border border-gray-200 rounded-xl mt-2 shadow-sm">
      <div className="font-bold text-gray-700 text-sm border-b pb-1 mb-1">{label}</div>
      <div className="flex gap-2 items-center">
        <label className="text-xs font-semibold text-gray-600 w-16">Arquivo</label>
        <input
          type="file"
          accept="image/*"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const { fileToBase64, saveAssetToDB } = await import('./assets');
            try {
              const b64 = await fileToBase64(file);
              await saveAssetToDB(asset.id, b64);
              onUpload(b64);
            } catch (err) {
              console.error(err);
            }
          }}
          className="text-xs flex-1 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
        />
      </div>
      <div className="flex gap-4">
        <div className="flex-1 flex flex-col gap-1">
          <label className="text-[10px] font-semibold text-gray-500 uppercase">Escala ({asset.scale}%)</label>
          <input type="range" min="10" max="300" value={asset.scale} onChange={(e) => onChange('scale', Number(e.target.value))} className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
        </div>
        <div className="flex-1 flex flex-col gap-1">
          <label className="text-[10px] font-semibold text-gray-500 uppercase">Pixelated</label>
          <input type="checkbox" checked={asset.pixelated} onChange={(e) => onChange('pixelated', e.target.checked)} className="mt-1 w-4 h-4" />
        </div>
      </div>
      <div className="flex gap-4">
        <div className="flex-1 flex flex-col gap-1">
          <label className="text-[10px] font-semibold text-gray-500 uppercase">Pos. X ({asset.offsetX}px)</label>
          <input type="range" min="-200" max="200" value={asset.offsetX} onChange={(e) => onChange('offsetX', Number(e.target.value))} className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
        </div>
        <div className="flex-1 flex flex-col gap-1">
          <label className="text-[10px] font-semibold text-gray-500 uppercase">Pos. Y ({asset.offsetY}px)</label>
          <input type="range" min="-200" max="200" value={asset.offsetY} onChange={(e) => onChange('offsetY', Number(e.target.value))} className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
        </div>
      </div>
    </div>
  );
};

export type AppConfig = {
  title: {
    text: string;
    color: string;
    outlineColor: string;
    hasOutline: boolean;
    font: string;
    fontSize: number;
    type: 'text' | 'solid' | 'image';
    bgColor: string;
    titleImg?: CustomImageAsset;
  };
  button: {
    textTop: string;
    textBottom: string;
    colorTop: string;
    colorBottom: string;
    position: string;
    type: 'text' | 'solid' | 'image';
    bgColor: string;
    btnImg?: CustomImageAsset;
    outlineColor: string;
    hasOutline: boolean;
    textAlign: 'left' | 'center' | 'right';
    font: string;
    fontSize: number;
  };
  background: {
    type: 'solid' | 'gradient';
    useImage: boolean;
    color1: string;
    color2: string;
    bgImage?: string;
    bgAsset?: CustomImageAsset;
  };
  wheel: {
    colorMode: 'custom' | 'pattern';
    patternColors: string[];
    font: string;
    fontSize: number;
    textOrientation: 'horizontal' | 'vertical';
    spinDuration: number;
  };
  winner: {
    textTop: string;
    colorTop: string;
    type: 'text' | 'solid' | 'image';
    bgColor: string;
    bannerImg?: CustomImageAsset;
    font: string;
    fontSize: number;
  };
  genie: {
    idle: CustomImageAsset;
    spin: CustomImageAsset;
    result: CustomImageAsset;
  };
  customFonts: CustomFontAsset[];
};

const INITIAL_CONFIG: AppConfig = {
  title: {
    text: 'TITULO!',
    color: '#ff6eb4',
    outlineColor: '#f3c1f3ff',
    hasOutline: true,
    font: 'font-pixel',
    fontSize: 48,
    type: 'text',
    bgColor: '#aa6effff',
    titleImg: { id: 'titleImg', source: '', scale: 100, offsetX: 0, offsetY: 0, pixelated: true },
  },
  button: {
    textTop: 'GIRAR',
    textBottom: 'ROLETA',
    colorTop: '#fca048',
    colorBottom: '#e26b3c',
    position: 'left',
    type: 'image',
    bgColor: '#f3e9bbff',
    btnImg: { id: 'btnImg', source: './pergaminho.png', scale: 97, offsetX: 0, offsetY: 0, pixelated: true },
    outlineColor: '#000000',
    hasOutline: false,
    textAlign: 'center',
    font: 'font-pixel',
    fontSize: 32,
  },
  background: {
    type: 'gradient',
    useImage: true,
    color1: '#000000',
    color2: '#222222',
    bgImage: '',
    bgAsset: { id: 'bgAsset', source: './bg.png', scale: 100, offsetX: 0, offsetY: 0, pixelated: false },
  },
  wheel: {
    colorMode: 'pattern',
    patternColors: ['#ff4db8', '#72b036'],
    font: 'font-pixel',
    fontSize: 18,
    textOrientation: 'horizontal',
    spinDuration: 6,
  },
  winner: {
    textTop: 'Vencedor!',
    colorTop: '#593112',
    type: 'solid',
    bgColor: '#dca475',
    bannerImg: { id: 'bannerImg', source: './pergaminho.png', scale: 97, offsetX: 0, offsetY: 0, pixelated: true },
    font: 'font-pixel',
    fontSize: 12,
  },
  genie: {
    idle: { id: 'genieIdle', source: './genie1.gif', scale: 94, offsetX: 8, offsetY: 15, pixelated: true },
    spin: { id: 'genieSpin', source: './genie2.gif', scale: 94, offsetX: 8, offsetY: 15, pixelated: true },
    result: { id: 'genieResult', source: './genie3.gif', scale: 94, offsetX: 0, offsetY: 15, pixelated: true },
  },
  customFonts: []
};

const DEFAULT_COLORS = ['#ff4db8', '#72b036', '#d82423', '#7851d9', '#fca048', '#36b0a9', '#d8d523', '#9623d8', '#23d875', '#d85a23', '#3a82f6', '#ec4899'];

const INITIAL_SEGMENTS: Segment[] = [
  { id: 1, title: 'Usuario 1', description: 'Jogo 1 - Console 1', color: '#ff4db8', textColor: 'white' },
  { id: 2, title: 'Usuario 2', description: 'Jogo 2 - Console 2', color: '#72b036', textColor: 'white' },
  { id: 3, title: 'Usuario 3', description: 'Jogo 3 - Console 3', color: '#d82423', textColor: 'white' },
  { id: 4, title: 'Usuario 4', description: 'Jogo 4 - Console 4', color: '#e9ecef', textColor: 'white' },
  { id: 5, title: 'Usuario 5', description: 'Jogo 5 - Console 5', color: '#7851d9', textColor: 'white' },
  { id: 6, title: 'Usuario 6', description: 'Jogo 6 - Console 6', color: '#d82423', textColor: 'white' },
];

export default function App() {
  const [segments, setSegments] = useState<Segment[]>(() => {
    try {
      const saved = localStorage.getItem('aladdinwheel_autosave_segments');
      if (saved) {
        const parsed = JSON.parse(saved);
        const uniqueIds = new Set();
        return parsed.filter((seg: Segment) => {
          if (uniqueIds.has(seg.id)) return false;
          uniqueIds.add(seg.id);
          return true;
        });
      }
      return INITIAL_SEGMENTS;
    } catch {
      return INITIAL_SEGMENTS;
    }
  });
  const [config, setConfig] = useState<AppConfig>(() => {
    try {
      const saved = localStorage.getItem('aladdinwheel_autosave_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...INITIAL_CONFIG,
          ...parsed,
          button: { ...INITIAL_CONFIG.button, ...(parsed.button || {}), btnImg: parsed.button?.btnImg || INITIAL_CONFIG.button.btnImg },
          wheel: { ...INITIAL_CONFIG.wheel, ...(parsed.wheel || {}) },
          title: { ...INITIAL_CONFIG.title, ...(parsed.title || {}), titleImg: parsed.title?.titleImg || INITIAL_CONFIG.title.titleImg },
          background: {
            ...INITIAL_CONFIG.background,
            ...(parsed.background || {}),
            type: parsed.background?.type === 'image' ? 'solid' : (parsed.background?.type || 'solid'),
            useImage: parsed.background?.type === 'image' || parsed.background?.useImage || false,
            bgAsset: parsed.background?.bgAsset || INITIAL_CONFIG.background.bgAsset
          },
          winner: { ...INITIAL_CONFIG.winner, ...(parsed.winner || {}), bannerImg: parsed.winner?.bannerImg || INITIAL_CONFIG.winner.bannerImg },
          genie: { ...INITIAL_CONFIG.genie, ...(parsed.genie || {}) },
          customFonts: Array.isArray(parsed.customFonts) ? parsed.customFonts : (parsed.customFonts?.undefined || [])
        };
      }
      return INITIAL_CONFIG;
    } catch {
      return INITIAL_CONFIG;
    }
  });
  const [settingsTab, setSettingsTab] = useState<'wheel' | 'appearance' | 'saveload'>('wheel');
  const [savedPresets, setSavedPresets] = useState<SavedPreset[]>(() => {
    try {
      const saved = localStorage.getItem('aladdinwheel_saved_presets');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [presetNameInput, setPresetNameInput] = useState('');
  const [saveLoadMessage, setSaveLoadMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [chosenItems, setChosenItems] = useState<ChosenItem[]>([]);
  const [removedSegmentsBackup, setRemovedSegmentsBackup] = useState<Segment[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [genieState, setGenieState] = useState<'idle' | 'spinning' | 'result'>('idle');
  const [result, setResult] = useState<Segment | null>(null);

  const wheelRef = useRef<HTMLDivElement>(null);
  const genie2Ref = useRef<HTMLImageElement>(null);
  const lastPassedDividerRef = useRef<number>(-1);
  const spinRef = useRef<number>();
  const [genie3Key, setGenie3Key] = useState(Date.now());

  const [assetUrls, setAssetUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    async function loadAssets() {
      try {
        const { getAssetFromDB } = await import('./assets');
        const ids = ['genieIdle', 'genieSpin', 'genieResult', 'btnImg', 'bannerImg'];
        const loaded: Record<string, string> = {};
        for (const id of ids) {
          const b64 = await getAssetFromDB(id);
          if (b64) loaded[id] = b64;
        }
        setAssetUrls(loaded);
      } catch (err) {
        console.error('Failed to load assets from DB', err);
      }
    }
    loadAssets();
  }, []);

  const getImgSrc = (asset?: CustomImageAsset, appendCacheBust = '') => {
    if (!asset) return '';
    const base = assetUrls[asset.id] || asset.source;
    if (!base) return '';
    if (base.startsWith('data:')) return base; // Base64 can't have query params
    return base + appendCacheBust;
  };

  const getImgStyle = (asset?: CustomImageAsset, overrideObjectFit?: any): React.CSSProperties => {
    if (!asset) return {};
    return {
      width: '100%',
      height: '100%',
      objectFit: overrideObjectFit || 'contain',
      transform: `translate(${asset.offsetX}px, ${asset.offsetY}px) scale(${asset.scale / 100})`,
      imageRendering: asset.pixelated ? 'pixelated' : 'auto',
    };
  };

  useEffect(() => {
    const styleEl = document.getElementById('custom-fonts-style') || document.createElement('style');
    styleEl.id = 'custom-fonts-style';
    let css = '';
    (config.customFonts || []).forEach(f => {
      if (f.type === 'file' && assetUrls[f.id]) {
        css += `
          @font-face {
            font-family: '${f.id}';
            src: url('${assetUrls[f.id]}');
          }
        `;
      }
    });
    styleEl.innerHTML = css;
    if (!document.getElementById('custom-fonts-style')) {
      document.head.appendChild(styleEl);
    }
  }, [config.customFonts, assetUrls]);

  const SmartText = ({ text, fontId, className = '', style = {}, color }: { text: string, fontId: string, className?: string, style?: React.CSSProperties, color?: string }) => {
    const customFont = (config.customFonts || []).find(f => f.id === fontId);
    if (customFont && customFont.type === 'tileset') {
      return <BitmapText text={text} fontAsset={customFont} assetUrl={assetUrls[customFont.id]} color={color} className={className} style={style} />;
    }
    const finalStyle = (customFont && customFont.type === 'file') ? { ...style, fontFamily: customFont.id, color } : { ...style, color };
    const finalClass = (customFont && customFont.type === 'file') ? className : `${fontId} ${className}`;
    return <div className={finalClass} style={finalStyle}>{text}</div>;
  };

  useEffect(() => {
    return () => {
      if (spinRef.current) cancelAnimationFrame(spinRef.current);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('aladdinwheel_autosave_segments', JSON.stringify(segments));
      localStorage.setItem('aladdinwheel_autosave_config', JSON.stringify(config));
    } catch (e) {
      console.error('Falha ao salvar no localStorage:', e);
    }
  }, [segments, config]);

  const showFeedback = (text: string, type: 'success' | 'error' = 'success') => {
    setSaveLoadMessage({ text, type });
    setTimeout(() => setSaveLoadMessage(null), 4000);
  };

  const saveCurrentPreset = () => {
    if (!presetNameInput.trim()) {
      showFeedback('Por favor, digite um nome para a configuração.', 'error');
      return;
    }
    const newPreset: SavedPreset = {
      id: Date.now().toString(),
      name: presetNameInput.trim(),
      savedAt: new Date().toLocaleString('pt-BR'),
      config: JSON.parse(JSON.stringify(config)),
      segments: JSON.parse(JSON.stringify(segments)),
    };
    const updated = [newPreset, ...savedPresets];
    setSavedPresets(updated);
    try {
      localStorage.setItem('aladdinwheel_saved_presets', JSON.stringify(updated));
      setPresetNameInput('');
      showFeedback('Configuração salva com sucesso!');
    } catch (e) {
      showFeedback('Erro ao salvar no navegador.', 'error');
    }
  };

  const loadPreset = (preset: SavedPreset) => {
    const newConfig = JSON.parse(JSON.stringify(preset.config));
    if (!newConfig.customFonts) newConfig.customFonts = [];
    setConfig(newConfig);
    setSegments(JSON.parse(JSON.stringify(preset.segments)));
    showFeedback(`Configuração "${preset.name}" carregada!`);
  };

  const deletePreset = (id: string) => {
    const updated = savedPresets.filter(p => p.id !== id);
    setSavedPresets(updated);
    try {
      localStorage.setItem('aladdinwheel_saved_presets', JSON.stringify(updated));
      showFeedback('Configuração removida com sucesso!');
    } catch (e) {
      showFeedback('Erro ao remover configuração.', 'error');
    }
  };

  const exportToFile = () => {
    try {
      const data = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        config,
        segments,
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `roleta-config-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showFeedback('Arquivo .json exportado com sucesso!');
    } catch (e) {
      showFeedback('Erro ao exportar arquivo.', 'error');
    }
  };

  const importFromFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.config && data.segments && Array.isArray(data.segments)) {
          const newConfig = data.config;
          if (!newConfig.customFonts) newConfig.customFonts = [];
          setConfig(newConfig);
          setSegments(data.segments);
          showFeedback('Configuração do arquivo carregada com sucesso!');
        } else {
          showFeedback('Arquivo JSON inválido ou incompatível.', 'error');
        }
      } catch (err) {
        showFeedback('Erro ao ler o arquivo JSON.', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

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
    const newId = Date.now(); // Ensures globally unique keys
    const lastColor = segments.length > 0 ? segments[segments.length - 1].color : '';
    let nextColor = '#555555';
    const defaultIndex = DEFAULT_COLORS.indexOf(lastColor);
    if (defaultIndex !== -1) {
      nextColor = DEFAULT_COLORS[(defaultIndex + 1) % DEFAULT_COLORS.length];
    } else {
      const available = DEFAULT_COLORS.filter(c => c !== lastColor);
      nextColor = available[Math.floor(Math.random() * available.length)];
    }
    setSegments([...segments, { id: newId, title: 'NEW', description: '', color: nextColor, textColor: 'white' }]);
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

  const restoreAllRemovedSegments = () => {
    if (removedSegmentsBackup.length === 0 && chosenItems.length === 0) return;
    const currentIds = new Set(segments.map(s => s.id));

    // Deduplicate from both sources
    const merged = [...removedSegmentsBackup, ...chosenItems.map(item => ({
      id: item.originalId || item.id,
      title: item.title,
      description: item.description,
      color: item.color,
      textColor: item.textColor
    }))];

    const uniqueToRestore = [];
    for (const seg of merged) {
      if (!currentIds.has(seg.id)) {
        uniqueToRestore.push(seg);
        currentIds.add(seg.id); // Add to set so we don't restore it twice
      }
    }

    setSegments(prev => [...prev, ...uniqueToRestore]);
    setRemovedSegmentsBackup([]);
  };

  const spin = () => {
    if (isSpinning || segments.length === 0) return;
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
    const duration = config.wheel.spinDuration * 1000;
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

      // Restart gif when passing a divider (Math.floor changes)
      const currentSegment = Math.floor(currentRot / segmentAngle);
      if (currentSegment !== lastPassedDividerRef.current) {
        lastPassedDividerRef.current = currentSegment;
        if (genie2Ref.current) {
          const baseSrc = getImgSrc(config.genie.spin);
          if (!baseSrc.startsWith('data:')) {
            genie2Ref.current.src = `${baseSrc}?t=${Date.now()}`;
          }
        }
      }

      if (progress < 1) {
        spinRef.current = requestAnimationFrame(animate);
      } else {
        setRotation(targetRotation);
        setIsSpinning(false);
        setGenieState('result');
        setGenie3Key(Date.now());

        const wonSeg = { ...segments[resultIndex], color: getSegmentColor(resultIndex) };
        setResult(wonSeg);

        const newItem: ChosenItem = {
          ...wonSeg,
          chosenAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          originalId: wonSeg.id
        };
        setChosenItems(prev => [newItem, ...prev]);
      }
    };
    spinRef.current = requestAnimationFrame(animate);
  };

  const renderPressButton = () => {
    const isHorizontal = config.button.position === 'bottom';

    let containerStyle: React.CSSProperties = {
      backgroundColor: config.button.type === 'solid' ? config.button.bgColor : 'transparent',
    };

    let btnBgImg = null;
    if (config.button.type === 'image' && config.button.btnImg) {
      containerStyle.backgroundColor = 'transparent';
      const src = getImgSrc(config.button.btnImg);
      if (src) {
        btnBgImg = <img src={src} className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none" style={{ ...getImgStyle(config.button.btnImg, 'cover') }} alt="Button Background" />;
      }
    }

    let textShadow = config.button.hasOutline ? `2px 0 0 ${config.button.outlineColor}, -2px 0 0 ${config.button.outlineColor}, 0 2px 0 ${config.button.outlineColor}, 0 -2px 0 ${config.button.outlineColor}, 2px 2px 0 ${config.button.outlineColor}, -2px -2px 0 ${config.button.outlineColor}, 2px -2px 0 ${config.button.outlineColor}, -2px 2px 0 ${config.button.outlineColor}, 4px 4px 0 rgba(0,0,0,0.5)` : '4px 4px 0 rgba(0,0,0,0.5)';

    const alignClass = config.button.textAlign === 'center' ? 'items-center text-center justify-center' : config.button.textAlign === 'right' ? 'items-end text-right justify-end' : 'items-start text-left justify-start';

    return (
      <button
        onClick={spin}
        disabled={isSpinning || segments.length <= 1}
        className={`hover:scale-110 active:scale-95 transition-transform disabled:opacity-50 cursor-pointer outline-none relative overflow-hidden flex ${isHorizontal ? 'flex-row gap-6' : 'flex-col gap-3 md:gap-2'} ${alignClass} ${config.button.font} ${config.button.type === 'solid' ? 'px-6 py-4 rounded-xl shadow-[4px_4px_0_#000] border-4 border-black' : config.button.type === 'image' ? 'px-6 py-4 rounded-xl' : 'bg-transparent border-none'}`}
        style={containerStyle}
      >
        {btnBgImg}
        <div className={`relative z-10 flex ${isHorizontal ? 'flex-row gap-6' : 'flex-col gap-3 md:gap-2'} ${alignClass}`}>
          {config.button.textTop && (
            <SmartText text={config.button.textTop} fontId={config.button.font} className="font-bold" style={{ textShadow, fontSize: config.button.fontSize }} color={config.button.colorTop} />
          )}
          {config.button.textBottom && (
            <SmartText text={config.button.textBottom} fontId={config.button.font} className="font-bold" style={{ textShadow, fontSize: config.button.fontSize }} color={config.button.colorBottom} />
          )}
        </div>
      </button>
    );
  };

  const renderWinnerBadge = () => {
    if (!result) return null;
    const isRemoved = !segments.some(s => s.id === result.id);
    if (isRemoved) {
      return (
        <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-black/70 border border-[#d49936] rounded-full text-[10px] text-amber-300 font-sans tracking-normal shadow-md">
          <span>✨ Adicionado ao histórico & Removido da roleta</span>
        </div>
      );
    }
    return (
      <div className="flex gap-2 mt-3 justify-center">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setGenieState('idle');
          }}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-sans text-xs font-bold rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer"
        >
          <span>Manter</span>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            const idx = segments.findIndex(s => s.id === result.id);
            if (idx !== -1 && segments.length > 0) {
              setRemovedSegmentsBackup(prevBackup => [...prevBackup, segments[idx]]);
              setSegments(prev => prev.filter((_, i) => i !== idx));
            }
            setGenieState('idle');
          }}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white font-sans text-xs font-bold rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer"
        >
          <Trash2 size={14} />
          <span>Remover</span>
        </button>
      </div>
    );
  };

  const renderWinnerBanner = () => {
    if (!result || genieState !== 'result') return null;

    if (config.winner.type === 'text') {
      return (
        <div className={`relative animate-bounce select-none text-center flex flex-col items-center min-w-[280px] max-w-[90vw] px-8 py-4 z-10 ${config.winner.font}`}>
          <SmartText text={config.winner.textTop} fontId={config.winner.font} className="mb-2 font-black tracking-widest opacity-80 uppercase" style={{ textShadow: '1px 1px 0 rgba(0,0,0,0.5)', fontSize: Math.max(10, config.winner.fontSize / 3) }} color={config.winner.colorTop} />
          <SmartText text={result.title} fontId={config.winner.font} className="font-bold" style={{ fontSize: config.winner.fontSize, textShadow: '2px 2px 0px #000, -2px -2px 0px #000, 2px -2px 0px #000, -2px 2px 0px #000, 4px 4px 0px rgba(0,0,0,0.3)' }} color={result.color || '#ff4db8'} />
          {result.description && (
            <SmartText text={result.description} fontId={config.winner.font} className="mt-3 text-white font-bold tracking-[0.2em] uppercase drop-shadow-md" style={{ fontSize: Math.max(12, config.winner.fontSize / 2.5) }} />
          )}
          {renderWinnerBadge()}
        </div>
      );
    }

    if (config.winner.type === 'image' && config.winner.bannerImg) {
      const src = getImgSrc(config.winner.bannerImg);
      return (
        <div
          className={`relative animate-bounce select-none text-center flex flex-col items-center min-w-[280px] max-w-[90vw] px-12 py-8 overflow-hidden rounded-xl ${config.winner.font}`}
        >
          {src && <img src={src} className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none" style={{ ...getImgStyle(config.winner.bannerImg, 'cover') }} alt="Winner Banner" />}
          <div className="z-10 flex flex-col items-center relative">
            <SmartText text={config.winner.textTop} fontId={config.winner.font} className="mb-2 font-black tracking-widest opacity-80 uppercase" color={config.winner.colorTop} style={{ fontSize: Math.max(10, config.winner.fontSize / 3) }} />
            <SmartText text={result.title} fontId={config.winner.font} className="font-bold" style={{ fontSize: config.winner.fontSize, textShadow: '2px 2px 0px #000, -2px -2px 0px #000, 2px -2px 0px #000, -2px 2px 0px #000, 4px 4px 0px rgba(0,0,0,0.3)' }} color={result.color || '#ff4db8'} />
            {result.description && (
              <SmartText text={result.description} fontId={config.winner.font} className="mt-3 font-bold tracking-[0.2em] uppercase" color={config.winner.colorTop} style={{ fontSize: Math.max(12, config.winner.fontSize / 2.5) }} />
            )}
            {renderWinnerBadge()}
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
        </div>

        {/* Scroll Right Roll */}
        <div className="absolute top-[-6px] bottom-[-6px] right-[-20px] w-[24px] border-[4px] border-[#593112] rounded-r-xl -z-10 shadow-[6px_8px_0_rgba(0,0,0,0.25)] overflow-hidden" style={{ backgroundColor: config.winner.bgColor, filter: 'brightness(0.85)' }}>
        </div>

        {/* Text Content */}
        <div className={`z-10 flex flex-col items-center ${config.winner.font}`}>
          <SmartText text={config.winner.textTop} fontId={config.winner.font} className="mb-2 font-black tracking-widest opacity-80 uppercase" color={config.winner.colorTop} style={{ fontSize: Math.max(10, config.winner.fontSize / 3) }} />
          <SmartText text={result.title} fontId={config.winner.font} className="font-bold" style={{ fontSize: config.winner.fontSize, textShadow: '2px 2px 0px #000, -2px -2px 0px #000, 2px -2px 0px #000, -2px 2px 0px #000, 4px 4px 0px rgba(0,0,0,0.3)' }} color={result.color || '#ff4db8'} />
          {result.description && (
            <SmartText text={result.description} fontId={config.winner.font} className="mt-3 font-bold tracking-[0.2em] uppercase" color={config.winner.colorTop} style={{ fontSize: Math.max(12, config.winner.fontSize / 2.5) }} />
          )}
          {renderWinnerBadge()}
        </div>
      </div>
    );
  };

  const renderTitle = () => {
    let containerStyle: React.CSSProperties = {
      backgroundColor: config.title.type === 'solid' ? config.title.bgColor : 'transparent',
    };

    let titleBgImg = null;
    if (config.title.type === 'image' && config.title.titleImg) {
      containerStyle.backgroundColor = 'transparent';
      const src = getImgSrc(config.title.titleImg);
      if (src) {
        titleBgImg = <img src={src} className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none" style={{ ...getImgStyle(config.title.titleImg, 'cover') }} alt="Title Background" />;
      }
    }

    const textShadow = config.title.hasOutline ? `2px 0 0 ${config.title.outlineColor}, -2px 0 0 ${config.title.outlineColor}, 0 2px 0 ${config.title.outlineColor}, 0 -2px 0 ${config.title.outlineColor}, 2px 2px 0 ${config.title.outlineColor}, -2px -2px 0 ${config.title.outlineColor}, 2px -2px 0 ${config.title.outlineColor}, -2px 2px 0 ${config.title.outlineColor}, 6px 6px 0 #000` : '6px 6px 0 #000';

    return (
      <div
        className={`relative z-10 flex flex-col items-center justify-center mt-2 mb-6 sm:mb-10 text-center select-none font-bold ${config.title.font} ${config.title.type === 'solid' ? 'px-8 py-4 rounded-2xl shadow-[6px_6px_0_#000] border-4 border-black overflow-hidden' : config.title.type === 'image' ? 'px-16 py-12 md:px-24 md:py-16 min-w-[280px] min-h-[120px] rounded-2xl overflow-hidden' : 'p-4'}`}
        style={containerStyle}
      >
        {titleBgImg}
        <SmartText
          text={config.title.text}
          fontId={config.title.font}
          className="relative z-10 font-bold"
          style={{ textShadow, fontSize: config.title.fontSize }}
          color={config.title.color}
        />
      </div>
    );
  };

  const getBackgroundStyle = (): React.CSSProperties => {
    const style: React.CSSProperties = {};
    if (config.background.type === 'gradient') {
      style.background = `linear-gradient(135deg, ${config.background.color1}, ${config.background.color2})`;
    } else {
      style.backgroundColor = config.background.color1;
    }

    if (!config.background.useImage && config.background.bgImage) {
      style.backgroundImage = style.background ? `url(${config.background.bgImage}), ${style.background}` : `url(${config.background.bgImage})`;
      style.backgroundSize = 'cover';
      style.backgroundPosition = 'center';
    }
    return style;
  };

  return (
    <div
      className={`min-h-[100dvh] flex flex-col items-center justify-center p-2 sm:p-4 text-white overflow-hidden relative ${config.title.font}`}
      style={getBackgroundStyle()}
    >
      {/* Background Image Layer */}
      {config.background.useImage && config.background.bgAsset && getImgSrc(config.background.bgAsset) && (
        <img src={getImgSrc(config.background.bgAsset)} className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none" style={{ ...getImgStyle(config.background.bgAsset, 'cover') }} alt="Background" />
      )}

      {/* Title */}
      {renderTitle()}

      {/* Main Play Area */}
      <div className={`relative flex items-center justify-center w-full max-w-6xl gap-6 sm:gap-8 ${config.button.position === 'bottom' ? 'flex-col' : 'flex-col md:flex-row'}`}>

        {/* Top Action Buttons (History & Settings) */}
        <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-[60] flex items-center gap-3">
          <button
            onClick={() => setShowHistory(true)}
            className="bg-white text-black p-3 rounded-full hover:bg-gray-200 hover:scale-105 transition-all shadow-lg flex items-center justify-center border border-gray-200 relative cursor-pointer"
            title="Ver Itens Sorteados"
          >
            <Trophy size={24} className="text-amber-500" />
            {chosenItems.length > 0 && (
              <span className="absolute -top-1 -left-1 bg-red-500 text-white font-sans font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow">
                {chosenItems.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setShowSettings(true)}
            className="bg-white text-black p-3 rounded-full hover:bg-gray-200 hover:scale-105 transition-all shadow-lg flex items-center justify-center border border-gray-200 cursor-pointer"
            title="Configure Wheel"
          >
            <Settings size={24} className="text-gray-800" />
          </button>
        </div>

        {/* Left Space (Button or empty) */}
        {config.button.position !== 'bottom' && (
          <div className={`md:flex-1 flex justify-center md:justify-end w-full z-30 ${config.button.position !== 'left' ? 'hidden md:flex' : ''}`}>
            {config.button.position === 'left' && renderPressButton()}
          </div>
        )}

        {/* Wheel Container */}
        <div className="relative w-[80vw] max-w-[280px] sm:max-w-[350px] md:max-w-[450px] lg:max-w-[500px] aspect-square shrink-0">

          {segments.length <= 1 ? (
            <div className="absolute inset-0 rounded-full bg-black/90 border-[8px] md:border-[12px] border-[#d49936] flex flex-col items-center justify-center p-4 text-center z-30 font-sans shadow-2xl animate-in fade-in duration-300">
              <div className="text-4xl mb-2">🎉</div>
              <h3 className="text-xl md:text-2xl font-bold text-amber-400 mb-1">{segments.length === 1 ? 'Último Item!' : 'Todos Sorteados!'}</h3>

              {segments.length === 1 && (
                <div className="bg-white/10 px-4 py-2 rounded-xl mb-3 w-full max-w-[80%] border border-white/20">
                  <div className="font-bold text-lg md:text-xl drop-shadow-md" style={{ color: segments[0].color }}>{segments[0].title}</div>
                  {segments[0].description && <div className="text-[10px] md:text-xs mt-1 text-gray-200">{segments[0].description}</div>}
                </div>
              )}

              <p className="text-[10px] sm:text-xs text-gray-300 mb-4 max-w-[200px] leading-tight">
                {segments.length === 1 ? 'Você completou o sorteio de todos os itens.' : 'Você completou o sorteio de todos os itens.'}
              </p>

              <div className="flex flex-col gap-2 w-full max-w-[80%]">
                <button
                  onClick={restoreAllRemovedSegments}
                  className="w-full px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-black font-bold text-[10px] sm:text-xs rounded-lg shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                >
                  <RotateCcw size={14} />
                  <span>Restaurar Todos</span>
                </button>
              </div>
            </div>
          ) : (
            <>
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
                      className="absolute inset-0 flex flex-col"
                      style={{ transform: 'rotate(180deg)', transformOrigin: 'center' }}
                    >
                      <div className="h-[50%] shrink-0"></div>
                      <div className={`h-[50%] flex ${config.wheel.textOrientation === 'vertical' ? 'flex-row' : 'flex-col'} items-center justify-center px-1 pb-2 sm:pb-4 md:pb-6`}>
                        <div style={{ writingMode: config.wheel.textOrientation === 'vertical' ? 'vertical-rl' : 'horizontal-tb', textOrientation: 'upright', fontSize: config.wheel.fontSize }}>
                          <SmartText text={seg.title} fontId={config.wheel.font} className="text-center font-bold" />
                        </div>
                        {seg.description && (
                          <div
                            className="text-center px-1 opacity-90 leading-tight"
                            style={{
                              fontSize: Math.max(8, config.wheel.fontSize * 0.6),
                              marginTop: config.wheel.textOrientation === 'vertical' ? 0 : '0.25rem',
                              marginLeft: config.wheel.textOrientation === 'vertical' ? '0.25rem' : 0,
                              writingMode: config.wheel.textOrientation === 'vertical' ? 'vertical-rl' : 'horizontal-tb',
                              textOrientation: 'upright',
                            }}
                          >
                            <SmartText text={seg.description} fontId={config.wheel.font} className="font-bold" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Inner Hole Cover */}
              <div className="absolute top-[25%] left-[25%] right-[25%] bottom-[25%] bg-black rounded-full border-[8px] md:border-[12px] border-[#d49936] shadow-[0_0_0_4px_#000,inset_0_0_0_4px_#000]"></div>

              {/* Genie Sprite Container */}
              <div className="absolute top-[-5%] left-[-5%] right-[-5%] bottom-[-5%] flex items-center justify-center z-20 pointer-events-none">
                <img src={getImgSrc(config.genie.idle)} alt="Genie Idle" className={`absolute aspect-square object-contain ${genieState !== 'idle' ? 'hidden' : ''}`} style={getImgStyle(config.genie.idle)} />
                <img ref={genie2Ref} src={getImgSrc(config.genie.spin)} alt="Genie Spinning" className={`absolute aspect-square object-contain ${genieState !== 'spinning' ? 'hidden' : ''}`} style={getImgStyle(config.genie.spin)} />
                <img src={getImgSrc(config.genie.result, `?t=${genie3Key}`)} alt="Genie Result" className={`absolute aspect-square object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] ${genieState !== 'result' ? 'hidden' : ''}`} style={getImgStyle(config.genie.result)} />
              </div>
            </>
          )}

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

      {/* Result Display Banner - Floating Overlay in front */}
      <div className="absolute bottom-6 sm:bottom-10 left-0 right-0 flex items-center justify-center z-50 px-4 pointer-events-none">
        <div className="pointer-events-auto">
          {renderWinnerBanner()}
        </div>
      </div>

      {/* Settings Modal - Modern UI */}
      {showSettings && (
        <div className="fixed inset-0 z-[100] flex items-center justify-end p-4 sm:p-6 md:p-8 pointer-events-none font-sans">
          <div className="pointer-events-auto bg-white/95 backdrop-blur-md rounded-3xl p-5 md:p-6 w-full max-w-md lg:max-w-lg overflow-y-auto max-h-[90vh] shadow-2xl flex flex-col text-gray-900 border border-gray-200/50 animate-in slide-in-from-right duration-300">
            <div className="flex flex-col mb-4 sticky top-0 bg-white/95 backdrop-blur-md z-20 pb-4 border-b border-gray-100 gap-3">
              <div className="flex justify-between items-center w-full">
                <h2 className="text-xl font-bold text-gray-800 tracking-tight shrink-0">Configure Settings</h2>
                <button onClick={() => setShowSettings(false)} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"><X size={24} /></button>
              </div>

              <div className="flex bg-gray-100 p-1 rounded-xl w-full">
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
                <button
                  onClick={() => setSettingsTab('saveload')}
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${settingsTab === 'saveload' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <Save size={14} />
                  <span className="text-[11px] sm:text-xs">Save/Load</span>
                </button>
              </div>
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                          {(config.customFonts || []).map(f => <option key={f.id} value={f.id}>{f.name} {f.type === 'tileset' ? '(Tileset)' : '(Custom)'}</option>)}
                        </select>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Font Size ({config.wheel.fontSize}px)</label>
                        <input type="range" min="8" max="48" value={config.wheel.fontSize} onChange={(e) => updateConfig('wheel', 'fontSize', Number(e.target.value))} className="w-full h-2 mt-3 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Text Orientation</label>
                      <select
                        value={config.wheel.textOrientation}
                        onChange={(e) => updateConfig('wheel', 'textOrientation', e.target.value)}
                        className="bg-white border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 block w-full p-2.5"
                      >
                        <option value="horizontal">Horizontal</option>
                        <option value="vertical">Vertical</option>
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
                        <span className="w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-700 font-bold rounded-full shrink-0">{i + 1}</span>
                        <div className="md:hidden flex-1 font-semibold text-gray-700">Segment {i + 1}</div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 flex-1 w-full">
                        <div className="flex flex-col gap-1.5 md:col-span-4">
                          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Title/Icon</label>
                          <input
                            value={seg.title}
                            onChange={(e) => updateSegment(i, 'title', e.target.value)}
                            className="bg-white border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 transition-shadow outline-none"
                            placeholder="Title or Icon"
                            maxLength={8}
                          />
                        </div>
                        <div className="flex flex-col gap-1.5 md:col-span-8">
                          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</label>
                          <input
                            value={seg.description}
                            onChange={(e) => updateSegment(i, 'description', e.target.value)}
                            className="bg-white border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 transition-shadow outline-none"
                            placeholder="Short description"
                            maxLength={20}
                          />
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                          {(config.customFonts || []).map(f => <option key={f.id} value={f.id}>{f.name} {f.type === 'tileset' ? '(Tileset)' : '(Custom)'}</option>)}
                        </select>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Font Size ({config.title.fontSize}px)</label>
                        <input type="range" min="12" max="120" value={config.title.fontSize} onChange={(e) => updateConfig('title', 'fontSize', Number(e.target.value))} className="w-full h-2 mt-3 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                      </div>
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

                    <div className="flex flex-col gap-1.5 mt-2">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Title Style</label>
                      <div className="flex gap-2">
                        <select
                          value={config.title.type}
                          onChange={(e) => updateConfig('title', 'type', e.target.value)}
                          className="bg-white border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 block w-full p-2.5 flex-1"
                        >
                          <option value="text">Text Only</option>
                          <option value="solid">Solid Background</option>
                          <option value="image">Image Background</option>
                        </select>
                        {config.title.type === 'solid' && (
                          <div className="relative w-10 h-10 rounded-lg overflow-hidden border-2 border-gray-200 shrink-0">
                            <input type="color" value={config.title.bgColor} onChange={(e) => updateConfig('title', 'bgColor', e.target.value)} className="absolute inset-[-10px] w-16 h-16 cursor-pointer" />
                          </div>
                        )}
                      </div>
                    </div>
                    {config.title.type === 'image' && config.title.titleImg && (
                      <div className="mt-2 border-t border-gray-200 pt-3">
                        <AssetEditor label="Title Image" asset={config.title.titleImg} onChange={(k, v) => updateConfig('title', 'titleImg', { ...config.title.titleImg, [k]: v })} onUpload={(b64) => setAssetUrls(p => ({ ...p, titleImg: b64 }))} />
                      </div>
                    )}
                  </div>

                  {/* Background Settings */}
                  <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex flex-col gap-4">
                    <h3 className="font-bold text-gray-800 text-lg border-b border-gray-200 pb-2">Background</h3>

                    <div className="flex items-end gap-4">
                      <div className="flex flex-col gap-1.5 flex-1">
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
                      <div className="flex flex-col gap-1.5 mb-2">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Image Overlay</label>
                        <label className="relative inline-flex items-center justify-center cursor-pointer mt-1">
                          <input type="checkbox" checked={config.background.useImage} onChange={(e) => updateConfig('background', 'useImage', e.target.checked)} className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[calc(50%-22px+2px)] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
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
                    {config.background.useImage && config.background.bgAsset && (
                      <div className="mt-2 border-t border-gray-200 pt-3">
                        <AssetEditor label="Background Image" asset={config.background.bgAsset} onChange={(k, v) => updateConfig('background', 'bgAsset', { ...config.background.bgAsset, [k]: v })} onUpload={(b64) => setAssetUrls(p => ({ ...p, bgAsset: b64 }))} />
                      </div>
                    )}
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
                          {(config.customFonts || []).map(f => <option key={f.id} value={f.id}>{f.name} {f.type === 'tileset' ? '(Tileset)' : '(Custom)'}</option>)}
                        </select>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Font Size ({config.button.fontSize}px)</label>
                        <input type="range" min="8" max="72" value={config.button.fontSize} onChange={(e) => updateConfig('button', 'fontSize', Number(e.target.value))} className="w-full h-2 mt-3 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                      </div>

                      <div className="col-span-1 sm:col-span-2 flex flex-col gap-2 pt-3 border-t border-gray-200 mt-2">
                        <div className="flex justify-between items-center">
                          <div className="flex flex-col gap-0.5">
                            <label className="text-xs font-semibold text-gray-700">Duração do Giro (Desaceleração)</label>
                            <span className="text-[11px] text-gray-500">Tempo que a roleta leva até parar completamente</span>
                          </div>
                          <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">{config.wheel.spinDuration} Segundos</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          step="0.5"
                          value={config.wheel.spinDuration || 3}
                          onChange={(e) => updateConfig('wheel', 'spinDuration', Number(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
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

                    {config.button.type === 'image' && config.button.btnImg && (
                      <div className="mt-2 border-t border-gray-200 pt-3">
                        <AssetEditor label="Button Image" asset={config.button.btnImg} onChange={(k, v) => updateConfig('button', 'btnImg', { ...config.button.btnImg, [k]: v })} onUpload={(b64) => setAssetUrls(p => ({ ...p, btnImg: b64 }))} />
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

                  {/* Genie Character Settings */}
                  <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex flex-col gap-4 md:col-span-2">
                    <h3 className="font-bold text-gray-800 text-lg border-b border-gray-200 pb-2">Genie (GIFs)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <AssetEditor label="Idle (Parado)" asset={config.genie.idle} onChange={(k, v) => updateConfig('genie', 'idle', { ...config.genie.idle, [k]: v })} onUpload={(b64) => setAssetUrls(p => ({ ...p, genieIdle: b64 }))} />
                      <AssetEditor label="Spinning (Girando)" asset={config.genie.spin} onChange={(k, v) => updateConfig('genie', 'spin', { ...config.genie.spin, [k]: v })} onUpload={(b64) => setAssetUrls(p => ({ ...p, genieSpin: b64 }))} />
                      <AssetEditor label="Result (Resultado)" asset={config.genie.result} onChange={(k, v) => updateConfig('genie', 'result', { ...config.genie.result, [k]: v })} onUpload={(b64) => setAssetUrls(p => ({ ...p, genieResult: b64 }))} />
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
                          {(config.customFonts || []).map(f => <option key={f.id} value={f.id}>{f.name} {f.type === 'tileset' ? '(Tileset)' : '(Custom)'}</option>)}
                        </select>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Font Size ({config.winner.fontSize}px)</label>
                        <input type="range" min="12" max="120" value={config.winner.fontSize} onChange={(e) => updateConfig('winner', 'fontSize', Number(e.target.value))} className="w-full h-2 mt-3 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
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

                    {config.winner.type === 'image' && config.winner.bannerImg && (
                      <div className="mt-2 border-t border-gray-200 pt-3">
                        <AssetEditor label="Banner Image" asset={config.winner.bannerImg} onChange={(k, v) => updateConfig('winner', 'bannerImg', { ...config.winner.bannerImg, [k]: v })} onUpload={(b64) => setAssetUrls(p => ({ ...p, bannerImg: b64 }))} />
                      </div>
                    )}

                  </div>

                  <FontManager
                    fonts={config.customFonts || []}
                    onChange={(fonts) => setConfig(prev => ({ ...prev, customFonts: fonts }))}
                    onUpload={(id, b64) => setAssetUrls(p => ({ ...p, [id]: b64 }))}
                  />

                </div>
              )}

              {settingsTab === 'saveload' && (
                <div className="flex flex-col gap-6 animate-in fade-in duration-200">
                  {saveLoadMessage && (
                    <div className={`p-4 rounded-xl text-sm font-semibold flex items-center justify-between shadow-sm ${saveLoadMessage.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
                      <span>{saveLoadMessage.text}</span>
                      <button onClick={() => setSaveLoadMessage(null)} className="p-1 hover:opacity-75"><X size={16} /></button>
                    </div>
                  )}

                  {/* Auto-save notification */}
                  <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 flex items-center gap-3 text-blue-900 text-xs sm:text-sm">
                    <CheckCircle2 size={20} className="text-blue-600 shrink-0" />
                    <div>
                      <span className="font-bold">Salvamento Automático Ativo:</span> Todas as suas alterações e itens da roleta são salvos automaticamente em seu navegador. Se atualizar a página, nada será perdido!
                    </div>
                  </div>

                  {/* Save Preset to LocalStorage */}
                  <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex flex-col gap-4">
                    <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                      <div>
                        <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                          <Save size={20} className="text-blue-600" />
                          <span>Salvar Configuração no Navegador</span>
                        </h3>
                        <p className="text-xs text-gray-500">Crie predefinições (ex: "Sorteio de Brindes", "Roleta da Live") e troque de roleta com um clique.</p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <input
                        type="text"
                        value={presetNameInput}
                        onChange={(e) => setPresetNameInput(e.target.value)}
                        placeholder="Nome da configuração (ex: Roleta de Sábado)"
                        className="bg-white border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-blue-500 block w-full p-3 shadow-2xs outline-none"
                        onKeyDown={(e) => e.key === 'Enter' && saveCurrentPreset()}
                      />
                      <button
                        onClick={saveCurrentPreset}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer shrink-0"
                      >
                        <Save size={16} />
                        <span>Salvar Agora</span>
                      </button>
                    </div>
                  </div>

                  {/* Export / Import File */}
                  <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex flex-col gap-4">
                    <div className="border-b border-gray-200 pb-3">
                      <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                        <FolderOpen size={20} className="text-amber-600" />
                        <span>Exportar e Importar (.JSON)</span>
                      </h3>
                      <p className="text-xs text-gray-500">Faça backup em arquivo no seu computador ou envie sua configuração para outra pessoa.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <button
                        onClick={exportToFile}
                        className="flex flex-col items-center justify-center gap-2 p-5 bg-white border border-gray-200 hover:border-blue-500 hover:bg-blue-50/30 rounded-2xl text-gray-800 transition-all shadow-2xs group cursor-pointer"
                      >
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-xl group-hover:scale-110 transition-transform">
                          <Download size={22} />
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-sm">Baixar Arquivo .JSON</div>
                          <div className="text-[11px] text-gray-500">Salvar no seu computador</div>
                        </div>
                      </button>

                      <label className="flex flex-col items-center justify-center gap-2 p-5 bg-white border border-gray-200 hover:border-green-500 hover:bg-green-50/30 rounded-2xl text-gray-800 transition-all shadow-2xs group cursor-pointer">
                        <div className="p-3 bg-green-100 text-green-600 rounded-xl group-hover:scale-110 transition-transform">
                          <Upload size={22} />
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-sm">Carregar Arquivo .JSON</div>
                          <div className="text-[11px] text-gray-500">Importar do seu computador</div>
                        </div>
                        <input
                          type="file"
                          accept=".json"
                          onChange={importFromFile}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Saved Presets List */}
                  <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex flex-col gap-4">
                    <div className="border-b border-gray-200 pb-3 flex justify-between items-center">
                      <h3 className="font-bold text-gray-800 text-lg">Configurações Salvas ({savedPresets.length})</h3>
                      {savedPresets.length > 0 && (
                        <button
                          onClick={() => {
                            if (confirm('Tem certeza que deseja apagar todas as configurações salvas no navegador?')) {
                              setSavedPresets([]);
                              localStorage.removeItem('aladdinwheel_saved_presets');
                              showFeedback('Todas as configurações foram removidas.');
                            }
                          }}
                          className="text-xs text-red-600 hover:underline cursor-pointer font-semibold"
                        >
                          Limpar Todas
                        </button>
                      )}
                    </div>

                    {savedPresets.length === 0 ? (
                      <div className="text-center py-8 bg-white rounded-xl border border-dashed border-gray-200 text-gray-400">
                        <p className="text-xs font-semibold">Nenhuma configuração salva no navegador.</p>
                        <p className="text-[11px] mt-1 text-gray-400">Digite um nome acima e clique em "Salvar Agora".</p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-1">
                        {savedPresets.map(preset => (
                          <div
                            key={preset.id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white rounded-xl border border-gray-200 hover:border-gray-300 shadow-2xs transition-all gap-3"
                          >
                            <div className="flex flex-col">
                              <span className="font-bold text-gray-900 text-sm">{preset.name}</span>
                              <div className="flex items-center gap-3 text-[11px] text-gray-500 mt-1">
                                <span>Salvo em: {preset.savedAt}</span>
                                <span>•</span>
                                <span className="font-semibold text-blue-600">{preset.segments.length} itens</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => loadPreset(preset)}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg transition-all shadow-2xs cursor-pointer flex items-center gap-1.5"
                              >
                                <FolderOpen size={14} />
                                <span>Carregar</span>
                              </button>
                              <button
                                onClick={() => deletePreset(preset.id)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                title="Excluir"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Reset to Factory Default */}
                  <div className="bg-red-50/50 p-6 rounded-2xl border border-red-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-red-900 text-base flex items-center gap-1.5">
                        <RotateCcw size={18} className="text-red-600" />
                        <span>Restaurar Padrão de Fábrica</span>
                      </h4>
                      <p className="text-xs text-red-700 mt-0.5">Apaga as alterações do navegador e volta a roleta para a configuração inicial padrão do projeto.</p>
                    </div>
                    <button
                      onClick={() => {
                        if (confirm('Deseja realmente redefinir a roleta para a configuração padrão de fábrica? Isso vai substituir os itens e cores atuais.')) {
                          setConfig(JSON.parse(JSON.stringify(INITIAL_CONFIG)));
                          setSegments(JSON.parse(JSON.stringify(INITIAL_SEGMENTS)));
                          localStorage.removeItem('aladdinwheel_autosave_segments');
                          localStorage.removeItem('aladdinwheel_autosave_config');
                          showFeedback('Roleta restaurada para o padrão inicial de fábrica!');
                        }
                      }}
                      className="px-5 py-2.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-xs rounded-xl transition-all shadow-2xs cursor-pointer shrink-0 flex items-center gap-1.5"
                    >
                      <RotateCcw size={14} />
                      <span>Restaurar Padrão</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* History Modal - Sorteados */}
      {showHistory && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 font-sans">
          <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-2xl overflow-y-auto max-h-[85vh] shadow-2xl flex flex-col text-gray-900 border border-gray-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6 sticky top-0 bg-white z-20 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-100 text-amber-600 rounded-2xl">
                  <Trophy size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Itens Sorteados</h2>
                  <p className="text-xs text-gray-500 font-medium">Histórico de itens escolhidos na roleta</p>
                </div>
              </div>
              <button onClick={() => setShowHistory(false)} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
                <X size={24} />
              </button>
            </div>

            {/* Actions / Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4 bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-600">
                <span>Total sorteado:</span>
                <span className="px-2 py-0.5 bg-amber-500 text-white rounded-full font-bold">{chosenItems.length}</span>
              </div>
              <div className="flex items-center gap-2">
                {removedSegmentsBackup.length > 0 && (
                  <button
                    onClick={restoreAllRemovedSegments}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all cursor-pointer"
                  >
                    <RotateCcw size={14} />
                    <span>Restaurar ({removedSegmentsBackup.length}) à Roleta</span>
                  </button>
                )}
                {chosenItems.length > 0 && (
                  <button
                    onClick={() => {
                      if (confirm('Tem certeza que deseja limpar todo o histórico de sorteados?')) {
                        setChosenItems([]);
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-red-600 hover:bg-red-50 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                  >
                    <Trash2 size={14} />
                    <span>Limpar Histórico</span>
                  </button>
                )}
              </div>
            </div>

            {/* List of Chosen Items */}
            <div className="flex flex-col gap-3 overflow-y-auto pr-1">
              {chosenItems.length === 0 ? (
                <div className="text-center py-12 px-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-3">
                    <ListOrdered size={24} />
                  </div>
                  <h4 className="text-sm font-bold text-gray-700 mb-1">Nenhum item sorteado ainda</h4>
                  <p className="text-xs text-gray-500">Gire a roleta para ver os itens escolhidos aparecerem aqui!</p>
                </div>
              ) : (
                chosenItems.map((item, index) => {
                  const isStillInWheel = segments.some(s => s.id === item.id);
                  return (
                    <div
                      key={`${item.id}-${index}`}
                      className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100/80 rounded-2xl border border-gray-100 transition-all gap-4"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold shadow-sm shrink-0"
                          style={{ backgroundColor: item.color || '#ff4db8', color: item.textColor || '#fff' }}
                        >
                          {item.title.substring(0, 2)}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-gray-800 text-base truncate flex items-center gap-2">
                            <span>{item.title}</span>
                            <span className="text-[10px] font-normal px-2 py-0.5 bg-gray-200 text-gray-600 rounded-full">
                              Sorteio #{chosenItems.length - index}
                            </span>
                          </div>
                          {item.description && (
                            <div className="text-xs font-medium text-gray-500 truncate mt-0.5">{item.description}</div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs font-medium text-gray-400 hidden sm:inline-block">
                          {item.chosenAt}
                        </span>
                        {!isStillInWheel ? (
                          <button
                            onClick={() => {
                              setSegments(prev => [...prev, {
                                id: item.id,
                                title: item.title,
                                description: item.description,
                                color: item.color,
                                textColor: item.textColor,
                                orientation: item.orientation
                              }]);
                              setRemovedSegmentsBackup(prev => prev.filter(s => s.id !== item.id));
                            }}
                            className="px-3 py-1.5 bg-white border border-gray-200 hover:border-blue-500 hover:text-blue-600 text-gray-700 text-xs font-semibold rounded-xl transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                            title="Recolocar este item na roleta"
                          >
                            <Plus size={14} />
                            <span>Recolocar na Roleta</span>
                          </button>
                        ) : (
                          <span className="px-2.5 py-1 bg-green-100 text-green-700 text-[11px] font-semibold rounded-xl flex items-center gap-1">
                            <CheckCircle2 size={12} />
                            <span>Na Roleta</span>
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

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

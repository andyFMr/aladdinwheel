import React from 'react';
import { Trash2, Plus } from 'lucide-react';
import { CustomFontAsset } from './App';
import { saveAssetToDB, fileToBase64 } from './assets';

export const FontManager = ({
  fonts,
  onChange,
  onUpload
}: {
  fonts: CustomFontAsset[],
  onChange: (fonts: CustomFontAsset[]) => void,
  onUpload: (id: string, b64: string) => void
}) => {
  const addFont = () => {
    const newFont: CustomFontAsset = {
      id: `font-custom-${Date.now()}`,
      name: 'Nova Fonte',
      type: 'file',
      source: '',
      charWidth: 16,
      charHeight: 16,
      charsPerRow: 16,
      asciiOffset: 32
    };
    onChange([...fonts, newFont]);
  };

  const updateFont = (index: number, key: keyof CustomFontAsset, value: any) => {
    const updated = [...fonts];
    updated[index] = { ...updated[index], [key]: value };
    onChange(updated);
  };

  const removeFont = (index: number) => {
    const updated = [...fonts];
    updated.splice(index, 1);
    onChange(updated);
  };

  const handleFileUpload = async (index: number, id: string, file: File) => {
    try {
      const b64 = await fileToBase64(file);
      await saveAssetToDB(id, b64);
      onUpload(id, b64);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex flex-col gap-4 md:col-span-2 mt-4">
      <h3 className="font-bold text-gray-800 text-lg border-b border-gray-200 pb-2">Fontes Customizadas</h3>
      
      {fonts.length === 0 && (
        <p className="text-sm text-gray-500">Nenhuma fonte customizada adicionada. Adicione fontes TTF, OTF ou em formato Tileset (PNG).</p>
      )}

      {fonts.map((font, idx) => (
        <div key={font.id} className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-3 relative shadow-sm">
          <div className="flex justify-between items-center">
            <input 
              value={font.name} 
              onChange={(e) => updateFont(idx, 'name', e.target.value)} 
              className="font-bold text-gray-800 bg-transparent border-b border-dashed border-gray-300 focus:border-blue-500 outline-none w-1/2" 
              placeholder="Nome da fonte..."
            />
            <button onClick={() => removeFont(idx)} className="text-gray-400 hover:text-red-500 transition-colors p-1"><Trash2 size={18}/></button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tipo de Fonte</label>
              <select 
                value={font.type} 
                onChange={(e) => updateFont(idx, 'type', e.target.value)} 
                className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg p-2"
              >
                <option value="file">Arquivo (.ttf, .otf, .woff)</option>
                <option value="tileset">Tileset de Imagem (.png)</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Carregar Arquivo</label>
              <input 
                type="file" 
                accept={font.type === 'tileset' ? 'image/*' : '.ttf,.otf,.woff,.woff2'}
                onChange={(e) => {
                  if (e.target.files?.[0]) handleFileUpload(idx, font.id, e.target.files[0]);
                }} 
                className="text-xs file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer pt-1"
              />
            </div>
          </div>

          {font.type === 'tileset' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-gray-500 uppercase">Largura Char (px)</label>
                <input type="number" value={font.charWidth} onChange={(e) => updateFont(idx, 'charWidth', Number(e.target.value))} className="bg-white border border-gray-200 text-sm rounded-md p-1.5" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-gray-500 uppercase">Altura Char (px)</label>
                <input type="number" value={font.charHeight} onChange={(e) => updateFont(idx, 'charHeight', Number(e.target.value))} className="bg-white border border-gray-200 text-sm rounded-md p-1.5" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-gray-500 uppercase">Chars por Linha</label>
                <input type="number" value={font.charsPerRow} onChange={(e) => updateFont(idx, 'charsPerRow', Number(e.target.value))} className="bg-white border border-gray-200 text-sm rounded-md p-1.5" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-gray-500 uppercase">ASCII Offset (Início)</label>
                <input type="number" value={font.asciiOffset} onChange={(e) => updateFont(idx, 'asciiOffset', Number(e.target.value))} className="bg-white border border-gray-200 text-sm rounded-md p-1.5" title="Geralmente 32 para começar do caractere Espaço" />
              </div>
            </div>
          )}

        </div>
      ))}

      <button 
        onClick={addFont} 
        className="w-full py-3 border-2 border-dashed border-gray-300 text-gray-500 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50 rounded-xl transition-all flex justify-center items-center gap-2 font-semibold shadow-sm mt-2"
      >
        <Plus size={20} />
        <span>Adicionar Fonte Customizada</span>
      </button>
    </div>
  );
};

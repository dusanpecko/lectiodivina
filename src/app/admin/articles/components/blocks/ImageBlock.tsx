"use client";

import { useRef } from "react";
import { Image, Trash2, GripVertical, Upload, X, Move } from "lucide-react";

interface ImageBlockData {
  images?: string[];
  description?: string;
  layout?: 'grid' | 'slider' | 'masonry';
  columns?: number;
  aspectRatio?: 'auto' | 'square' | 'wide' | 'tall';
}

interface Block {
  id: string;
  type: string;
  position: number;
  data: ImageBlockData;
}

interface ImageBlockProps {
  block: Block;
  updateBlock: (id: string, data: ImageBlockData) => void;
  deleteBlock: (id: string) => void;
}

const ImageBlock: React.FC<ImageBlockProps> = ({ block, updateBlock, deleteBlock }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newImageUrls = files.map(file => URL.createObjectURL(file));
    
    updateBlock(block.id, {
      ...block.data,
      images: [...(block.data.images || []), ...newImageUrls]
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    const newImages = (block.data.images || []).filter((_, i) => i !== index);
    updateBlock(block.id, { ...block.data, images: newImages });
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    const images = [...(block.data.images || [])];
    const [movedImage] = images.splice(fromIndex, 1);
    images.splice(toIndex, 0, movedImage);
    updateBlock(block.id, { ...block.data, images });
  };

  const getGridColumns = () => {
    const columns = block.data.columns || 3;
    switch (columns) {
      case 1: return 'grid-cols-1';
      case 2: return 'grid-cols-2';
      case 3: return 'grid-cols-3';
      case 4: return 'grid-cols-4';
      default: return 'grid-cols-3';
    }
  };

  const getAspectRatioClass = () => {
    switch (block.data.aspectRatio) {
      case 'square': return 'aspect-square';
      case 'wide': return 'aspect-video';
      case 'tall': return 'aspect-[3/4]';
      default: return '';
    }
  };

  return (
    <div className="border rounded-lg p-6 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
          <Image className="w-5 h-5 text-green-600" />
          <span className="font-semibold text-gray-800">Obrázok blok</span>
          {block.data.images && block.data.images.length > 0 && (
            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
              {block.data.images.length} obrázkov
            </span>
          )}
        </div>
        <button
          onClick={() => deleteBlock(block.id)}
          className="text-red-600 hover:bg-red-50 p-1 rounded transition-colors"
          title="Vymazať blok"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4">
        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">
            Popis galérie (voliteľné)
          </label>
          <input
            type="text"
            value={block.data.description || ''}
            onChange={(e) => updateBlock(block.id, { ...block.data, description: e.target.value })}
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="Popis galérie obrázkov..."
          />
        </div>

        {/* Upload Area */}
        <div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors flex flex-col items-center gap-2"
          >
            <Upload className="w-8 h-8 text-gray-400" />
            <span className="text-gray-600">Kliknite pre pridanie obrázkov</span>
            <span className="text-sm text-gray-500">Môžete vybrať viacero súborov naraz</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>

        {/* Layout Settings */}
        {block.data.images && block.data.images.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Rozloženie
              </label>
              <select
                value={block.data.layout || 'grid'}
                onChange={(e) => updateBlock(block.id, { 
                  ...block.data, 
                  layout: e.target.value as ImageBlockData['layout']
                })}
                className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500"
              >
                <option value="grid">Mriežka</option>
                <option value="slider">Posúvač</option>
                <option value="masonry">Mozaika</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Stĺpce
              </label>
              <select
                value={block.data.columns || 3}
                onChange={(e) => updateBlock(block.id, { 
                  ...block.data, 
                  columns: parseInt(e.target.value)
                })}
                className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500"
              >
                <option value={1}>1 stĺpec</option>
                <option value={2}>2 stĺpce</option>
                <option value={3}>3 stĺpce</option>
                <option value={4}>4 stĺpce</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Pomer strán
              </label>
              <select
                value={block.data.aspectRatio || 'auto'}
                onChange={(e) => updateBlock(block.id, { 
                  ...block.data, 
                  aspectRatio: e.target.value as ImageBlockData['aspectRatio']
                })}
                className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500"
              >
                <option value="auto">Automaticky</option>
                <option value="square">Štvorec (1:1)</option>
                <option value="wide">Široký (16:9)</option>
                <option value="tall">Vysoký (3:4)</option>
              </select>
            </div>
          </div>
        )}

        {/* Image Gallery */}
        {block.data.images && block.data.images.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-700">
                Obrázky ({block.data.images.length})
              </h4>
              <div className="text-xs text-gray-500">
                Ťahajte pre zmenu poradia
              </div>
            </div>

            {/* Grid Layout Preview */}
            <div className={`grid gap-3 ${getGridColumns()}`}>
              {block.data.images.map((img, index) => (
                <div
                  key={index}
                  className="relative group cursor-move"
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('text/plain', index.toString());
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
                    if (fromIndex !== index) {
                      moveImage(fromIndex, index);
                    }
                  }}
                >
                  <div className={`relative overflow-hidden rounded-lg border-2 border-transparent group-hover:border-green-300 transition-colors ${getAspectRatioClass()}`}>
                    <img 
                      src={img} 
                      alt={`Obrázok ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                        <button
                          onClick={() => removeImage(index)}
                          className="bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center transition-colors"
                          title="Vymazať obrázok"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <div className="bg-white bg-opacity-90 text-gray-700 rounded-full w-8 h-8 flex items-center justify-center cursor-move">
                          <Move className="w-4 h-4" />
                        </div>
                      </div>
                    </div>

                    {/* Image Index */}
                    <div className="absolute top-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                      {index + 1}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add More Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full p-3 border border-dashed border-green-300 rounded-lg text-green-600 hover:bg-green-50 transition-colors flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Pridať ďalšie obrázky
            </button>
          </div>
        )}

        {/* Empty State */}
        {(!block.data.images || block.data.images.length === 0) && (
          <div className="text-center py-8 text-gray-500">
            <Image className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">Zatiaľ žiadne obrázky</p>
            <p className="text-xs mt-1">Pridajte obrázky kliknutím na tlačítko vyššie</p>
          </div>
        )}

        {/* Info Panel */}
        {block.data.images && block.data.images.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="font-medium">Tipy pre obrázky:</span>
            </div>
            <ul className="text-xs space-y-1 ml-4">
              <li>• Odporúčaná veľkosť: minimálne 800x600 px</li>
              <li>• Podporované formáty: JPG, PNG, WebP</li>
              <li>• Ťahajte obrázky pre zmenu poradia</li>
              <li>• Použite popis pre lepšie SEO</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageBlock;
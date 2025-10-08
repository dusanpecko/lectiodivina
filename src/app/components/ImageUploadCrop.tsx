"use client";

import { useState, useCallback, useRef } from "react";
import Cropper from "react-easy-crop";

type Point = { x: number; y: number };
type Area = { x: number; y: number; width: number; height: number };

interface ImageUploadCropProps {
  onImageUploaded: (url: string) => void;
  currentImageUrl?: string;
  supabase: any;
  bucketName?: string;
  folder?: string;
}

export default function ImageUploadCrop({
  onImageUploaded,
  currentImageUrl,
  supabase,
  bucketName = "news",
  folder = "images",
}: ImageUploadCropProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setImageSrc(reader.result as string);
        setIsOpen(true);
      });
      reader.readAsDataURL(file);
    }
  };

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener("load", () => resolve(image));
      image.addEventListener("error", (error) => reject(error));
      image.setAttribute("crossOrigin", "anonymous");
      image.src = url;
    });

  const getCroppedImg = async (
    imageSrc: string,
    pixelCrop: Area
  ): Promise<Blob> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("No 2d context");
    }

    // Nastavenie veľkosti canvasu na 16:9
    const aspectRatio = 16 / 9;
    canvas.width = 1920; // Full HD šírka
    canvas.height = 1080; // Full HD výška

    // Vykreslenie orezaného obrázka
    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      canvas.width,
      canvas.height
    );

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("Canvas is empty"));
          return;
        }
        resolve(blob);
      }, "image/jpeg", 0.85);
    });
  };

  const handleUpload = async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    try {
      setUploading(true);

      // Orezať obrázok
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);

      // Nahrať do Supabase
      const fileExt = "jpg";
      const fileName = `${folder}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(fileName, croppedBlob, {
          upsert: true,
          contentType: "image/jpeg",
        });

      if (uploadError) throw uploadError;

      // Získať public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from(bucketName).getPublicUrl(fileName);

      onImageUploaded(publicUrl);
      setIsOpen(false);
      setImageSrc(null);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Chyba pri nahrávaní obrázka: " + (error as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setImageSrc(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <>
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <span className="mr-2">📤</span>
            Nahrať obrázok
          </button>
          
          {currentImageUrl && (
            <button
              type="button"
              onClick={() => onImageUploaded("")}
              className="inline-flex items-center px-4 py-2 bg-red-100 text-red-700 font-semibold rounded-lg hover:bg-red-200 transition-colors duration-200"
            >
              <span className="mr-2">🗑️</span>
              Odstrániť
            </button>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {currentImageUrl && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-semibold text-gray-700 mb-3">
              Aktuálny obrázok:
            </p>
            <img
              src={currentImageUrl}
              alt="Current"
              className="w-full max-h-64 object-cover rounded-lg border-2 border-gray-200 shadow-sm"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        )}
      </div>

      {/* Crop Modal */}
      {isOpen && imageSrc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl mx-4 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
              <h2 className="text-2xl font-bold flex items-center">
                <span className="mr-3">✂️</span>
                Orezať obrázok (16:9)
              </h2>
              <p className="text-blue-100 mt-1">
                Posuňte a zväčšujte obrázok pre výber požadovanej oblasti
              </p>
            </div>

            {/* Crop Area */}
            <div className="relative h-96 bg-gray-900">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={16 / 9}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>

            {/* Controls */}
            <div className="p-6 bg-gray-50">
              <div className="mb-6">
                <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                  <span className="mr-2">🔍</span>
                  Priblíženie
                </label>
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${
                      ((zoom - 1) / 2) * 100
                    }%, #e5e7eb ${((zoom - 1) / 2) * 100}%, #e5e7eb 100%)`,
                  }}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1x</span>
                  <span>{zoom.toFixed(1)}x</span>
                  <span>3x</span>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={uploading}
                  className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors duration-200 disabled:opacity-50"
                >
                  <span className="mr-2">✕</span>
                  Zrušiť
                </button>
                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={uploading}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  {uploading ? (
                    <>
                      <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Nahrávam...
                    </>
                  ) : (
                    <>
                      <span className="mr-2">💾</span>
                      Uložiť obrázok
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

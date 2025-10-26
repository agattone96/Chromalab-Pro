import React, { useState, useCallback, useEffect, useRef } from 'react';
import type { HairAnalysis, ColorPlan, ClientPhoto } from '../types';
import { generateColorPlan, analyzeClientPhoto } from '../services/geminiService';
import { BRANDS } from '../constants';
import Spinner from './common/Spinner';
import Card from './common/Card';
import Tooltip from './common/Tooltip';
import { SparklesIcon } from './icons/SparklesIcon';
import { UploadIcon } from './icons/UploadIcon';

interface PlanTabProps {
  hairAnalysis: HairAnalysis | null;
  setColorPlan: (plan: ColorPlan | null) => void;
  colorPlan: ColorPlan | null;
  setError: (error: string | null) => void;
  isAutoPlanned: boolean;
  setIsAutoPlanned: (isAutoPlanned: boolean) => void;
  setClientPhoto: (photo: ClientPhoto | null) => void;
  setHairAnalysis: (analysis: HairAnalysis | null) => void;
  withGlobalLoading: <T,>(promise: () => Promise<T>) => Promise<T>;
}

// Helper to convert file to base64 using a Promise
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result.split(',')[1]);
      } else {
        reject(new Error('Failed to read file as base64 string.'));
      }
    };
    reader.onerror = (error) => reject(error);
  });
};

const PlanTab: React.FC<PlanTabProps> = ({ 
  hairAnalysis, 
  setColorPlan, 
  colorPlan, 
  setError, 
  isAutoPlanned, 
  setIsAutoPlanned,
  setClientPhoto,
  setHairAnalysis,
  withGlobalLoading,
}) => {
  const [targetType, setTargetType] = useState<'catalog' | 'hex'>('catalog');
  const [brand, setBrand] = useState<string>(Object.keys(BRANDS)[0]);
  const [shade, setShade] = useState<string>(BRANDS[Object.keys(BRANDS)[0] as keyof typeof BRANDS][0]);
  const [hexColor, setHexColor] = useState<string>('#B66FB3');
  const [isLoading, setIsLoading] = useState(false);
  const [isReanalyzing, setIsReanalyzing] = useState(false);
  const [showAutoPlanNotice, setShowAutoPlanNotice] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setShowAutoPlanNotice(isAutoPlanned);
  }, [isAutoPlanned]);

  const handleBrandChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newBrand = e.target.value;
    setBrand(newBrand);
    setShade(BRANDS[newBrand as keyof typeof BRANDS][0]);
  };

  const handleGeneratePlan = useCallback(async () => {
    if (!hairAnalysis) {
      setError('Please complete the hair analysis on the first tab before generating a plan.');
      return;
    }
    await withGlobalLoading(async () => {
      setIsLoading(true);
      setError(null);
      setColorPlan(null);
      setShowAutoPlanNotice(false);
      setIsAutoPlanned(false);
      
      const target = targetType === 'catalog' ? `${brand} ${shade}` : hexColor;

      try {
        const plan = await generateColorPlan(hairAnalysis, target);
        setColorPlan(plan);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred while generating the plan.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    });
  }, [hairAnalysis, targetType, brand, shade, hexColor, setColorPlan, setError, setIsAutoPlanned, withGlobalLoading]);
  
  const handleReanalyzeFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    await withGlobalLoading(async () => {
      setIsReanalyzing(true);
      setError(null);

      try {
        const base64 = await fileToBase64(file);
        const photo: ClientPhoto = {
          file,
          base64,
          url: URL.createObjectURL(file),
        };
        setClientPhoto(photo);

        const newAnalysis = await analyzeClientPhoto(photo.base64, photo.file.type);
        setHairAnalysis(newAnalysis);

        const target = targetType === 'catalog' ? `${brand} ${shade}` : hexColor;
        const newPlan = await generateColorPlan(newAnalysis, target);
        setColorPlan(newPlan);

        setShowAutoPlanNotice(false);
        setIsAutoPlanned(false);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred during re-analysis.');
        console.error(err);
      } finally {
        setIsReanalyzing(false);
        if (event.target) {
            event.target.value = "";
        }
      }
    });
  };

  return (
    <div id="plan-tab-content" className="space-y-8">
      {showAutoPlanNotice && colorPlan && (
         <div className="bg-green-900/50 border border-green-600/50 text-green-200 px-4 py-3 rounded-lg relative" role="alert">
            <strong className="font-bold">Auto-Plan Complete! </strong>
            <span className="block sm:inline">An initial formula has been generated based on the photo analysis. You can refine the target color below and regenerate if needed.</span>
             <Tooltip text="Dismiss notice">
               <span className="absolute top-0 bottom-0 right-0 px-4 py-3 cursor-pointer" onClick={() => setShowAutoPlanNotice(false)}>
                  <svg className="fill-current h-6 w-6 text-green-400" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
               </span>
             </Tooltip>
        </div>
      )}
      <Card>
        <h2 className="text-xl font-semibold text-gray-100 mb-4">1. Define Target Color</h2>
        {!hairAnalysis && <p className="text-yellow-400 text-sm">Upload a photo on the 'Intake & Analyze' tab to start.</p>}
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <button onClick={() => setTargetType('catalog')} className={`w-full sm:w-auto px-4 py-2 rounded-md transition-colors ${targetType === 'catalog' ? 'bg-[--color-accent-violet] text-white' : 'bg-black/20 hover:bg-black/40'}`}>Catalog</button>
          <button onClick={() => setTargetType('hex')} className={`w-full sm:w-auto px-4 py-2 rounded-md transition-colors ${targetType === 'hex' ? 'bg-[--color-accent-violet] text-white' : 'bg-black/20 hover:bg-black/40'}`}>HEX/RGB</button>
        </div>
        {targetType === 'catalog' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="brand" className="block text-sm font-medium text-gray-300">Brand</label>
              <select id="brand" value={brand} onChange={handleBrandChange} className="mt-1 block w-full bg-black/20 border-[--color-border] rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[--color-accent-pink] focus:border-[--color-accent-pink] sm:text-sm">
                {Object.keys(BRANDS).map(b => <option key={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="shade" className="block text-sm font-medium text-gray-300">Shade</label>
              <select id="shade" value={shade} onChange={(e) => setShade(e.target.value)} className="mt-1 block w-full bg-black/20 border-[--color-border] rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[--color-accent-pink] focus:border-[--color-accent-pink] sm:text-sm">
                {BRANDS[brand as keyof typeof BRANDS].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
        ) : (
          <div>
            <label htmlFor="hex" className="block text-sm font-medium text-gray-300">HEX Color Code</label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-[--color-border] bg-black/20 text-gray-400 sm:text-sm">
                #
              </span>
              <input type="text" id="hex" value={hexColor.replace('#', '')} onChange={(e) => setHexColor(`#${e.target.value}`)} className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md bg-black/20 border-[--color-border] focus:ring-[--color-accent-pink] focus:border-[--color-accent-pink] sm:text-sm" />
              <Tooltip text="Open color picker">
                <input type="color" value={hexColor} onChange={(e) => setHexColor(e.target.value)} className="p-0 ml-2 w-10 h-10 border-none rounded-md cursor-pointer bg-black/20" />
              </Tooltip>
            </div>
          </div>
        )}
        <div className="mt-6 border-t border-[--color-border] pt-4">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleReanalyzeFileChange}
                accept="image/*"
                className="hidden"
            />
            <Tooltip text="Upload a new photo to get an updated analysis and formula.">
              <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading || isReanalyzing || !hairAnalysis}
                  className="w-full text-center bg-black/20 hover:bg-[--color-border] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300 flex items-center justify-center"
              >
                  {isReanalyzing ? <><Spinner /> <span className="ml-2">Re-analyzing...</span></> : <><UploadIcon className="w-5 h-5 mr-2" /> Re-analyze Photo & Update Plan</>}
              </button>
            </Tooltip>
        </div>
      </Card>
      
      <div className="text-center">
        <Tooltip text="Generate a new formula based on the current hair analysis and target color.">
          <button
            onClick={handleGeneratePlan}
            disabled={isLoading || isReanalyzing || !hairAnalysis}
            className="bg-gradient-to-r from-[--color-accent-violet] to-[--color-accent-pink] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-lg transition-opacity duration-300 flex items-center justify-center mx-auto"
          >
            {isLoading ? <Spinner /> : <><SparklesIcon className="w-5 h-5 mr-2" /> Regenerate Plan (Thinking Mode)</>}
          </button>
        </Tooltip>
         {(isLoading || isReanalyzing) && <p className="mt-4 text-[--color-text-secondary] text-sm">Gemini is thinking... This complex task may take up to a minute.</p>}
      </div>

      {colorPlan && (
        <Card>
          <h2 className="text-xl font-semibold text-gray-100 mb-4">Color Plan Card</h2>
          <div className="space-y-6 text-sm">
            <div className="p-4 bg-black/20 rounded-lg">
              <h3 className="font-semibold text-[--color-accent-violet] mb-2">Path</h3>
              <p>{colorPlan.path}</p>
            </div>
            {colorPlan.preLighten && (
              <div className="p-4 bg-black/20 rounded-lg">
                <h3 className="font-semibold text-[--color-accent-violet] mb-2">Pre-Lighten</h3>
                <p><strong>Product:</strong> {colorPlan.preLighten.product}</p>
                <p><strong>Ratio:</strong> {colorPlan.preLighten.ratio}</p>
                <p><strong>Zone:</strong> {colorPlan.preLighten.zone}</p>
                <p><strong>Time:</strong> {colorPlan.preLighten.time}</p>
                <p><strong>Endpoint:</strong> {colorPlan.preLighten.visualEndpoint}</p>
              </div>
            )}
            {colorPlan.tone && (
              <div className="p-4 bg-black/20 rounded-lg">
                <h3 className="font-semibold text-[--color-accent-violet] mb-2">Tone</h3>
                <p><strong>Shades:</strong> {colorPlan.tone.shades}</p>
                <p><strong>Ratio:</strong> {colorPlan.tone.ratio}</p>
                <p><strong>Developer:</strong> {colorPlan.tone.developer}</p>
                <p><strong>Time:</strong> {colorPlan.tone.time}</p>
              </div>
            )}
             {colorPlan.fashionOverlay && (
              <div className="p-4 bg-black/20 rounded-lg">
                <h3 className="font-semibold text-[--color-accent-violet] mb-2">Fashion Overlay</h3>
                <p><strong>Shades:</strong> {colorPlan.fashionOverlay.shades}</p>
                <p><strong>Saturation:</strong> {colorPlan.fashionOverlay.saturation}</p>
                <p><strong>Time:</strong> {colorPlan.fashionOverlay.time}</p>
              </div>
            )}
            <div className="p-4 bg-black/20 rounded-lg">
              <h3 className="font-semibold text-[--color-accent-violet] mb-2">Step-by-Step Service Guide</h3>
              <ol className="list-decimal list-inside space-y-2">
                {colorPlan.steps.map((step, i) => <li key={i}>{step}</li>)}
              </ol>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default PlanTab;
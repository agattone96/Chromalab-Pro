import React, { useState, useCallback, useRef, useEffect } from 'react';
import { analyzeClientPhoto, generateColorPlan } from '../services/geminiService';
import type { ClientPhoto, HairAnalysis, Tab, ColorPlan } from '../types';
import Spinner from './common/Spinner';
import Card from './common/Card';
import Tooltip from './common/Tooltip';
import { UploadIcon } from './icons/UploadIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { CheckIcon } from './icons/CheckIcon';
import { CircleIcon } from './icons/CircleIcon';
import { WarningIcon } from './icons/WarningIcon';


type AutoPlanStatus = 'idle' | 'processing' | 'analyzing' | 'planning' | 'done' | 'error';


interface IntakeTabProps {
  setClientPhoto: (photo: ClientPhoto | null) => void;
  clientPhoto: ClientPhoto | null;
  setHairAnalysis: (analysis: HairAnalysis | null) => void;
  hairAnalysis: HairAnalysis | null;
  setColorPlan: (plan: ColorPlan | null) => void;
  setError: (error: string | null) => void;
  setActiveTab: (tab: Tab) => void;
  setIsAutoPlanned: (isAutoPlanned: boolean) => void;
  withGlobalLoading: <T,>(promise: () => Promise<T>) => Promise<T>;
}

const IntakeTab: React.FC<IntakeTabProps> = ({
  setClientPhoto,
  clientPhoto,
  setHairAnalysis,
  setColorPlan,
  setError,
  setActiveTab,
  setIsAutoPlanned,
  withGlobalLoading,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [autoPlanStatus, setAutoPlanStatus] = useState<AutoPlanStatus>('idle');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClear = () => {
    setClientPhoto(null);
    setHairAnalysis(null);
    setColorPlan(null);
    setError(null);
    setIsLoading(false);
    setAutoPlanStatus('idle');
    setIsModalOpen(false);
    if(fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  const handleAutoPlan = useCallback(async (photo: ClientPhoto) => {
    await withGlobalLoading(async () => {
      setIsLoading(true);
      setError(null);
      setHairAnalysis(null);
      setColorPlan(null);
      setAutoPlanStatus('processing');

      try {
        // Artificial delay to show the "Processing" state, improving UX.
        await new Promise(resolve => setTimeout(resolve, 500));

        // Step 1: Analyze Photo
        setAutoPlanStatus('analyzing');
        const analysis = await analyzeClientPhoto(photo.base64, photo.file.type);
        setHairAnalysis(analysis);

        // Step 2: Generate Plan
        setAutoPlanStatus('planning');
        const target = "A beautiful, healthy, and professional hair color that enhances the client's features and corrects any issues found in the analysis.";
        const plan = await generateColorPlan(analysis, target);
        setColorPlan(plan);

        // Step 3: Done
        setAutoPlanStatus('done');
        setIsAutoPlanned(true);
        setActiveTab('Formula Builder');

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred during the auto-plan process.';
        setError(errorMessage);
        setAutoPlanStatus('error');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    });
  }, [setHairAnalysis, setColorPlan, setError, setActiveTab, setIsAutoPlanned, withGlobalLoading]);

  const processFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
          const photo: ClientPhoto = {
              file,
              base64: reader.result.split(',')[1],
              url: URL.createObjectURL(file),
          };
          setClientPhoto(photo);
          handleAutoPlan(photo);
      } else {
        setError('Could not read file. Please try another image.');
      }
    };
    reader.onerror = () => {
      setError('An error occurred while reading the file.');
    };
    reader.readAsDataURL(file);
  }, [handleAutoPlan, setClientPhoto, setError]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
          const file = files[0];
          if (file.type.startsWith('image/')) {
              processFile(file);
          } else {
              setError("Please drop an image file.");
          }
      }
  }, [processFile, setError]);

  const autoPlanSteps = [
    { id: 'processing', text: 'Processing Photo...' },
    { id: 'analyzing', text: 'Analyzing Hair Canvas...' },
    { id: 'planning', text: 'Generating Color Plan...' },
  ];
  
  const statusToStepIndex = {
      processing: 0,
      analyzing: 1,
      planning: 2,
      done: 3,
  };

  const statusToTitle: Record<AutoPlanStatus, string> = {
    idle: 'Awaiting Photo',
    processing: 'Processing Photo...',
    analyzing: 'Analyzing Hair Canvas...',
    planning: 'Generating Color Plan...',
    done: 'Analysis Complete!',
    error: 'Processing Failed',
  };

  const progressMap: Record<AutoPlanStatus, number> = {
    idle: 0,
    processing: 25,
    analyzing: 50,
    planning: 75,
    done: 100,
    error: 0,
  };
  const progress = progressMap[autoPlanStatus];

  // Modal component for zoomed image view
  const PhotoModal = ({ src, onClose }: { src: string; onClose: () => void }) => {
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    return (
      <div 
        className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="zoom-modal-title"
      >
        <div className="relative max-w-4xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
          <h2 id="zoom-modal-title" className="sr-only">Zoomed Image Preview</h2>
          <img src={src} alt="Client photo zoomed" className="w-auto h-auto max-w-full max-h-[90vh] rounded-lg" />
          <Tooltip text="Close (Esc)">
            <button 
              onClick={onClose} 
              className="absolute -top-4 -right-4 bg-[--color-surface] text-[--color-text-primary] rounded-full h-10 w-10 flex items-center justify-center text-2xl font-bold hover:bg-[--color-border] transition-colors shadow-lg"
              aria-label="Close zoomed image"
            >
              &times;
            </button>
          </Tooltip>
        </div>
      </div>
    );
  };


  return (
    <div id="intake-tab-content">
        {!clientPhoto ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Card className={`flex flex-col items-center justify-center text-center p-12 border-2 border-dashed transition-colors ${isDragging ? 'border-[--color-accent-pink] bg-[--color-accent-pink]/10' : 'border-[--color-border]'}`}>
              <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
              />
              <SparklesIcon className="w-16 h-16 mx-auto mb-4 text-[--color-accent-violet]" />
              <h2 className="text-2xl font-bold mb-2">Start a New Formula Session</h2>
              <p className="text-[--color-text-secondary] mb-6 max-w-md">
                {isDragging ? "Drop image to start analysis!" : "Upload a client photo or drag & drop to automatically analyze hair and generate a starter formula."}
              </p>
              <Tooltip text="Analyzes photo and creates a starting formula in one step.">
                  <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-gradient-to-r from-[--color-accent-violet] to-[--color-accent-pink] hover:opacity-90 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 flex items-center justify-center mx-auto group"
                  >
                  <UploadIcon className="w-5 h-5 mr-2 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-12" /> Start a New Formula Session
                  </button>
              </Tooltip>
            </Card>
          </div>
        ) : (
          <>
            <Card>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                {/* Left Column: Image */}
                <div className="w-full" onClick={() => setIsModalOpen(true)}>
                  <Tooltip text="Click to enlarge photo">
                    <div className="w-full h-auto max-h-[60vh] rounded-lg overflow-hidden border-2 border-[--color-border] relative cursor-pointer group">
                      <img src={clientPhoto.url} alt="Client" className="w-full h-full object-contain" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                        <span className="text-white font-bold text-lg">Click to Enlarge</span>
                      </div>
                    </div>
                  </Tooltip>
                </div>

                {/* Right Column: Status */}
                <div className="flex flex-col justify-center w-full">
                   <div className="flex justify-between items-baseline mb-1">
                      <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[--color-accent-violet] to-[--color-accent-pink]">
                          {statusToTitle[autoPlanStatus]}
                      </h2>
                      {(isLoading || autoPlanStatus === 'done') && autoPlanStatus !== 'error' && (
                          <span className="font-data text-lg text-[--color-text-secondary]">{`${progress}%`}</span>
                      )}
                  </div>

                  {(isLoading || autoPlanStatus === 'done') && autoPlanStatus !== 'error' && (
                    <div className="w-full bg-black/20 rounded-full h-2.5 my-4">
                      <div
                        className="bg-gradient-to-r from-[--color-accent-violet] to-[--color-accent-pink] h-2.5 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  )}

                  {(isLoading || autoPlanStatus === 'done') && (
                      <div className="space-y-4">
                          {/* Photo uploaded step - hardcoded */}
                          <div className="flex items-center space-x-3 text-lg">
                              <div className="w-6 h-6 flex items-center justify-center">
                                  <CheckIcon className="w-5 h-5 text-green-500" />
                              </div>
                              <span className="text-[--color-text-secondary]">Photo Uploaded</span>
                          </div>
                          
                          {autoPlanSteps.map((step, index) => {
                              const currentStepIndex = statusToStepIndex[autoPlanStatus as keyof typeof statusToStepIndex] ?? -1;
                              const isActive = autoPlanStatus !== 'done' && index === currentStepIndex;
                              const isCompleted = index < currentStepIndex || autoPlanStatus === 'done';
                              
                              let icon;
                              let textClass = 'text-[--color-text-secondary]';

                              if (isActive) {
                                  icon = <Spinner />;
                                  textClass = 'text-[--color-text-primary] font-medium';
                              } else if (isCompleted) {
                                  icon = <CheckIcon className="w-5 h-5 text-green-500" />;
                              } else {
                                  icon = <CircleIcon className="w-5 h-5 text-gray-600" />;
                              }

                              return (
                                  <div key={step.id} className="flex items-center space-x-3 text-lg transition-colors duration-300">
                                      <div className="w-6 h-6 flex items-center justify-center">
                                          {icon}
                                      </div>
                                      <span className={textClass}>{step.text}</span>
                                  </div>
                              );
                          })}
                      </div>
                  )}

                  {autoPlanStatus === 'done' && (
                      <p className="mt-4 text-green-400 font-medium animate-pulse text-center md:text-left">
                          Complete! Redirecting...
                      </p>
                  )}
                  
                  {autoPlanStatus === 'error' && (
                      <div className="mt-4 flex items-center text-red-400 bg-red-900/50 p-3 rounded-lg">
                          <WarningIcon className="w-6 h-6 mr-3 flex-shrink-0" />
                          <div>
                              <p className="font-semibold">Processing Failed</p>
                              <p className="text-sm">Please check the error notification and try again.</p>
                          </div>
                      </div>
                  )}

                  <div className="mt-8 text-center md:text-left">
                    <Tooltip text="Clear the current photo and analysis.">
                       <button
                          onClick={handleClear}
                          className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                        >
                          Start Over
                        </button>
                    </Tooltip>
                  </div>
                </div>
              </div>
            </Card>

            {isModalOpen && (
              <PhotoModal src={clientPhoto.url} onClose={() => setIsModalOpen(false)} />
            )}
          </>
        )}
    </div>
  );
};

export default IntakeTab;
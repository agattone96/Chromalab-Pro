import React, { useState, useCallback } from 'react';
import type { ClientPhoto } from '../types';
import { generateInspirationImage, editClientPhoto } from '../services/geminiService';
import Spinner from './common/Spinner';
import Card from './common/Card';
import Tooltip from './common/Tooltip';
import { SparklesIcon } from './icons/SparklesIcon';

interface ImageStudioTabProps {
  clientPhoto: ClientPhoto | null;
  setError: (error: string | null) => void;
  withGlobalLoading: <T,>(promise: () => Promise<T>) => Promise<T>;
}

const ImageStudioTab: React.FC<ImageStudioTabProps> = ({ clientPhoto, setError, withGlobalLoading }) => {
  // Generation state
  const [genPrompt, setGenPrompt] = useState('A woman with vibrant, galaxy-inspired hair in shades of purple, blue, and magenta.');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Editing state
  const [editPrompt, setEditPrompt] = useState('Add a retro, vintage film filter to the photo.');
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleGenerate = useCallback(async () => {
    if (!genPrompt) {
      setError('Please enter a prompt for image generation.');
      return;
    }
    await withGlobalLoading(async () => {
      setIsGenerating(true);
      setGeneratedImage(null);
      setError(null);
      try {
        const imageB64 = await generateInspirationImage(genPrompt, aspectRatio);
        setGeneratedImage(`data:image/jpeg;base64,${imageB64}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred during image generation.');
        console.error(err);
      } finally {
        setIsGenerating(false);
      }
    });
  }, [genPrompt, aspectRatio, setError, withGlobalLoading]);

  const handleEdit = useCallback(async () => {
    if (!clientPhoto) {
      setError('Please upload a client photo on the first tab to edit.');
      return;
    }
    if (!editPrompt) {
      setError('Please enter a prompt for image editing.');
      return;
    }
    await withGlobalLoading(async () => {
      setIsEditing(true);
      setEditedImage(null);
      setError(null);
      try {
        const imageB64 = await editClientPhoto(clientPhoto.base64, clientPhoto.file.type, editPrompt);
        setEditedImage(`data:image/png;base64,${imageB64}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred during image editing.');
        console.error(err);
      } finally {
        setIsEditing(false);
      }
    });
  }, [clientPhoto, editPrompt, setError, withGlobalLoading]);

  return (
    <div>
       {!clientPhoto && (
        <div className="bg-blue-900/30 border border-blue-700/50 text-blue-200 px-4 py-3 rounded-lg text-center mb-8" role="status">
          <p><strong>No client photo detected.</strong> Continue with inspiration generation below, or upload a client image for a personalized preview.</p>
        </div>
      )}
      <div id="studio-tab-content" className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image Generation Section */}
        <Card>
          <h2 className="text-xl font-semibold text-gray-100 mb-4">Generate Inspiration Image</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="genPrompt" className="block text-sm font-medium text-gray-300">Prompt</label>
              <textarea id="genPrompt" rows={3} value={genPrompt} onChange={(e) => setGenPrompt(e.target.value)} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm p-2 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"></textarea>
            </div>
            <div>
              <label htmlFor="aspectRatio" className="block text-sm font-medium text-gray-300">Aspect Ratio</label>
              <select id="aspectRatio" value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm">
                {['1:1', '3:4', '4:3', '9:16', '16:9'].map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <Tooltip text="Uses Imagen to generate a new image from your text prompt.">
              <button onClick={handleGenerate} disabled={isGenerating} className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center">
                {isGenerating ? <Spinner /> : <><SparklesIcon className="w-5 h-5 mr-2"/>Generate Image</>}
              </button>
            </Tooltip>
            {isGenerating && <div className="text-center text-sm text-gray-400">Generating with Imagen...</div>}
            {generatedImage && (
              <div className="mt-4">
                <img src={generatedImage} alt="Generated inspiration" className="rounded-lg w-full" />
              </div>
            )}
          </div>
        </Card>

        {/* Image Editing Section */}
        <Card>
          <h2 className="text-xl font-semibold text-gray-100 mb-4">Edit Client Photo</h2>
          {!clientPhoto && <p className="text-[--color-text-secondary] text-sm">Upload a client photo to enable editing and simulation.</p>}
          <div className="space-y-4">
            <div>
              <label htmlFor="editPrompt" className="block text-sm font-medium text-gray-300">Edit Instruction</label>
              <textarea id="editPrompt" rows={3} value={editPrompt} onChange={(e) => setEditPrompt(e.target.value)} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm p-2 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm" placeholder="e.g., Change hair to platinum blonde"></textarea>
            </div>
            <Tooltip text="Uses Gemini to apply your text instructions to the client photo.">
              <button onClick={handleEdit} disabled={isEditing || !clientPhoto} className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center">
                {isEditing ? <Spinner /> : <><SparklesIcon className="w-5 h-5 mr-2"/>Edit with Gemini</>}
              </button>
            </Tooltip>
            {isEditing && <div className="text-center text-sm text-gray-400">Applying edits...</div>}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-sm font-medium text-center mb-2 text-gray-400">Before</p>
                {clientPhoto ? <img src={clientPhoto.url} alt="Original client" className="rounded-lg w-full" /> : <div className="aspect-square bg-gray-700 rounded-lg flex items-center justify-center text-gray-500">No Photo</div>}
              </div>
              <div>
                <p className="text-sm font-medium text-center mb-2 text-gray-400">After</p>
                {editedImage ? <img src={editedImage} alt="Edited client" className="rounded-lg w-full" /> : <div className="aspect-square bg-gray-700 rounded-lg flex items-center justify-center text-gray-500">Edit Result</div>}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ImageStudioTab;
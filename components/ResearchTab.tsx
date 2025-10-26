import React, { useState, useCallback } from 'react';
import { searchWithGrounding } from '../services/geminiService';
import Spinner from './common/Spinner';
import Card from './common/Card';
import Tooltip from './common/Tooltip';

interface GroundingChunk {
  web: {
    uri: string;
    title: string;
  };
}

interface ResearchTabProps {
  setError: (error: string | null) => void;
  withGlobalLoading: <T,>(promise: () => Promise<T>) => Promise<T>;
}

const ResearchTab: React.FC<ResearchTabProps> = ({ setError, withGlobalLoading }) => {
  const [query, setQuery] = useState('Latest balayage trends for summer');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ text: string; sources: GroundingChunk[] } | null>(null);

  const handleSearch = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query) {
      setError('Please enter a search query.');
      return;
    }
    await withGlobalLoading(async () => {
      setIsLoading(true);
      setResult(null);
      setError(null);
      try {
        const searchResult = await searchWithGrounding(query);
        setResult(searchResult);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred during search.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    });
  }, [query, setError, withGlobalLoading]);

  return (
    <div id="research-tab-content">
      <Card>
        <h2 className="text-xl font-semibold text-gray-100 mb-4">Research Trends & Products</h2>
        <p className="text-sm text-gray-400 mb-4">Get up-to-date information using Gemini with Google Search grounding.</p>
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g., Best bond builders for bleached hair"
            className="flex-1 bg-gray-700 border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
          />
          <Tooltip text="Search the web for up-to-date information." className="w-full sm:w-auto">
            <button type="submit" disabled={isLoading} className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center">
              {isLoading ? <Spinner /> : 'Search'}
            </button>
          </Tooltip>
        </form>

        {result && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-100 mb-2">Search Result</h3>
            <div className="prose prose-invert prose-p:text-gray-300 prose-li:text-gray-300 bg-gray-700/50 p-4 rounded-lg whitespace-pre-wrap">
              {result.text}
            </div>

            {result.sources && result.sources.length > 0 && (
              <div className="mt-6">
                <h4 className="font-semibold text-gray-300 mb-2">Sources:</h4>
                <ul className="space-y-2">
                  {result.sources.map((source, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-cyan-400 mr-2">🔗</span>
                      <a
                        href={source.web.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-400 hover:text-cyan-300 hover:underline text-sm"
                      >
                        {source.web.title || source.web.uri}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default ResearchTab;

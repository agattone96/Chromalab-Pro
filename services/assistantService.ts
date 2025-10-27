import type { ColorPlan, HairAnalysis, ChatMessage } from '../types';

// Since the backend is not yet built, we'll define placeholder types 
// for the expected API responses.

export interface FormulaAnalysis {
  advice: string;
  why: string;
  source?: string;
  confidence: number;
}

export interface ChatResponse {
  advice: string;
  why?: string;
  source?: string;
}

export interface EducationTopic {
  title: string;
  content: string;
  source: string;
}

// Base URL for the assistant API. This would be in an env file in a real app.
const API_BASE_URL = '/api/assistant';

/**
 * A helper function to handle fetch requests and errors.
 * @param url - The URL to fetch.
 * @param options - The options for the fetch request.
 * @returns The JSON response.
 * @throws An error if the fetch request fails.
 */
async function apiFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
      throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error(`API Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    // In a real app, you might want to use a more sophisticated logger
    // and handle different error types.
    throw error;
  }
}

/**
 * Sends a formula and hair analysis to the backend for evaluation.
 * @param formulaData - The color plan and hair analysis data.
 * @returns A promise that resolves to a formula analysis.
 */
export const analyzeFormula = (formulaData: { colorPlan: ColorPlan; hairAnalysis: HairAnalysis }): Promise<FormulaAnalysis> => {
  return apiFetch<FormulaAnalysis>(`${API_BASE_URL}/analyze-formula`, {
    method: 'POST',
    body: JSON.stringify(formulaData),
  });
};

/**
 * Sends a user's message to the chat endpoint.
 * @param chatData - The conversation history.
 * @returns A promise that resolves to the assistant's response.
 */
export const askAssistant = (chatData: { messages: ChatMessage[] }): Promise<ChatResponse> => {
  return apiFetch<ChatResponse>(`${API_BASE_URL}/chat`, {
    method: 'POST',
    body: JSON.stringify(chatData),
  });
};

/**
 * Fetches an educational topic from the backend.
 * @param topic - The topic to retrieve.
 * @returns A promise that resolves to the educational content.
 */
export const getEducationTopic = (topic: string): Promise<EducationTopic> => {
  return apiFetch<EducationTopic>(`${API_BASE_URL}/education/${encodeURIComponent(topic)}`, {
    method: 'GET',
  });
};

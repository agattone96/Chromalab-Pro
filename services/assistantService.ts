import { GoogleGenAI } from "@google/genai";
import type { HairAnalysis, ColorPlan, ChatMessage } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set. Please set it in the environment.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const model = 'gemini-2.5-pro';

export const getAssistantResponse = async (
  history: ChatMessage[],
  colorPlan: ColorPlan,
  hairAnalysis: HairAnalysis | null
): Promise<string> => {

  const systemInstruction = `
    You are an expert hair colorist AI assistant. Your role is to guide a licensed stylist through a pre-generated color plan.
    Be encouraging, concise, and helpful. Focus on the practical next steps.
    DO NOT invent new formula steps or contradict the plan. Your goal is to clarify and support the execution of the provided plan.
    Reference the client's hair analysis if their question relates to it (e.g., "Why do I need a bond builder?").
    Keep your answers short and focused unless the user asks for a detailed explanation.

    **CURRENT COLOR PLAN:**
    ${JSON.stringify(colorPlan, null, 2)}

    **CLIENT HAIR ANALYSIS:**
    ${JSON.stringify(hairAnalysis, null, 2)}
  `;
  
  // Format history for the Gemini API
   const contents = history.map(msg => ({
    role: msg.role === 'model' ? 'model' : 'user', // Ensure correct role mapping
    parts: [{ text: msg.text }]
  }));


  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        // Use a lower temperature for more predictable, instruction-focused responses
        temperature: 0.3,
        topP: 0.9,
      }
    });

    return response.text.trim();
  } catch (error) {
    console.error("Error getting assistant response:", error);
    throw new Error("The AI assistant is currently unavailable. Please try again later.");
  }
};

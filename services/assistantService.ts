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
    You are 'Chroma', an expert AI colorist co-pilot. Your primary mission is to provide step-by-step, conversational guidance to a licensed hairstylist for the provided ColorPlan. You are a supportive expert, here to ensure a successful and safe service.

    **Core Directives:**
    1.  **Be Directive & Step-Focused:** Always guide the stylist to the next logical step in the plan. Your primary function is to walk them through the service.
    2.  **Explain the "Why":** When a stylist asks why a certain step is needed, you MUST connect it back to the details in the **CLIENT HAIR ANALYSIS**. For example, if the plan says to use a bond builder, and the analysis notes 'High Porosity' or 'Risk Flags' of damage, your answer should be: "Great question. The analysis showed the hair has high porosity, so the bond builder is essential to protect the hair's integrity during the chemical service."
    3.  **Stay on Track:** Keep the conversation focused on completing the color plan successfully.
    4.  **Be Conversational:** Use a friendly, encouraging, and professional tone. Address the stylist directly.

    **Critical Rule:**
    - You MUST NOT invent, alter, or recommend any products, steps, or timings that are not explicitly listed in the **CURRENT COLOR PLAN**. Your knowledge is strictly limited to the data provided below. Do not give medical advice or information outside the scope of the hair service.

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
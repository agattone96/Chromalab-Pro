import { GoogleGenAI, Type, Modality } from "@google/genai";
import type { HairAnalysis, ColorPlan } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set. Please set it in the environment.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Image Analysis ---
export const analyzeClientPhoto = async (base64Image: string, mimeType: string): Promise<HairAnalysis> => {
  const model = 'gemini-2.5-flash';
  const prompt = `
    You are a professional hair colorist expert. Analyze this client's hair from the photo. 
    Provide a detailed diagnosis. Respond ONLY with a JSON object in the following format, with no markdown formatting.
    For porosity, use one of "Low", "Medium", or "High".
    For stylistNotes, provide a concise, actionable summary for the stylist.
    
    Example response format:
    {
      "naturalLevel": "Level 6 (Dark Blonde)",
      "currentCosmeticLevel": "Level 7 with warm, brassy tones on mids and ends",
      "dominantUndertone": "Orange-Gold",
      "grayPercentage": "Around 10% concentrated at the temples",
      "porosity": "High",
      "bandingZones": "1-inch natural root, 2-inch band of previous color, over-processed ends",
      "riskFlags": "Potential over-processing on ends, signs of previous metallic dye (uneven tones)",
      "stylistNotes": "High risk of breakage on ends - recommend bond builder. Strong yellow undertone requires a violet or pearl toner path. Uneven lift suggests sectional lightening is necessary."
    }
  `;
  const imagePart = {
    inlineData: {
      data: base64Image,
      mimeType: mimeType,
    },
  };
  const textPart = { text: prompt };

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json",
      }
    });
    
    const jsonString = response.text.trim();
    // Sometimes the model might return a non-JSON string, even with the prompt.
    // We'll add a check to handle this gracefully.
    if (!jsonString.startsWith('{') || !jsonString.endsWith('}')) {
        console.error("Received non-JSON response from Gemini:", jsonString);
        throw new Error("Analysis failed: The AI model returned an unexpected format. Please try re-analyzing.");
    }
    return JSON.parse(jsonString) as HairAnalysis;
  } catch (error) {
    console.error("Error analyzing client photo:", error);
    if (error instanceof Error && error.message.includes('The AI model returned an unexpected format')) {
        throw error;
    }
    throw new Error("Failed to analyze image with Gemini. The model may have returned an invalid format.");
  }
};


// --- Color Plan Generation ---
export const generateColorPlan = async (analysis: HairAnalysis, target: string): Promise<ColorPlan> => {
  const model = 'gemini-2.5-pro';
  const prompt = `
    You are a master hairstylist and color formulator. Given the following client hair analysis and target color, create a detailed, professional, brand-agnostic color plan.
    Assume access to a full range of professional products. The output must be a single, valid JSON object with NO markdown formatting or surrounding text.

    Client Hair Analysis:
    ${JSON.stringify(analysis, null, 2)}

    Target Color:
    ${target}

    Generate a step-by-step plan. Be precise. For ratios, use parts (e.g., 1:1.5). For developer, specify volume (e.g., 20 vol). For timing, give a range (e.g., 25-35 min). The "steps" must be an array of strings.
    If a section like 'preLighten' is not needed, set its value to null.
    
    JSON Output Structure:
    {
      "path": "Detailed description of the overall strategy (e.g., 'Corrective color: neutralize brassiness, lift roots, and apply a cool-toned fashion overlay').",
      "preLighten": { "product": "Lightener + Developer", "ratio": "1:2", "zone": "Roots/Mids/Ends", "time": "20-40 min", "visualEndpoint": "Pale yellow, like inside of a banana peel" } | null,
      "tone": { "shades": "Toner shades", "ratio": "1:1", "developer": "10 vol", "time": "5-15 min" } | null,
      "fashionOverlay": { "shades": "Direct dye shades", "saturation": "Full", "time": "20-30 min" } | null,
      "steps": [
        "Step 1: Prep hair with a clarifying treatment.",
        "Step 2: Apply pre-lightener to Zone A.",
        "..."
      ]
    }
  `;

  try {
     const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          thinkingConfig: { thinkingBudget: 32768 },
        },
     });
     
     const jsonString = response.text.trim();
     return JSON.parse(jsonString) as ColorPlan;

  } catch (error) {
    console.error("Error generating color plan:", error);
    throw new Error("Failed to generate color plan with Gemini. The model may be unable to complete the request.");
  }
};


// --- Image Generation ---
export const generateInspirationImage = async (prompt: string, aspectRatio: string): Promise<string> => {
    const model = 'imagen-4.0-generate-001';
    try {
        const response = await ai.models.generateImages({
            model: model,
            prompt: prompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: aspectRatio as "1:1" | "3:4" | "4:3" | "9:16" | "16:9",
            },
        });
        if (response.generatedImages && response.generatedImages.length > 0) {
            return response.generatedImages[0].image.imageBytes;
        }
        throw new Error('No image was generated.');
    } catch(error) {
        console.error("Error generating image:", error);
        throw new Error("Failed to generate image with Imagen.");
    }
};

// --- Image Editing ---
export const editClientPhoto = async (base64Image: string, mimeType: string, prompt: string): Promise<string> => {
    const model = 'gemini-2.5-flash-image';
    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: {
                parts: [
                    { inlineData: { data: base64Image, mimeType: mimeType } },
                    { text: prompt },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });
        
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return part.inlineData.data;
            }
        }
        throw new Error('No edited image was returned.');
    } catch(error) {
        console.error("Error editing image:", error);
        throw new Error("Failed to edit image with Gemini.");
    }
};

// --- Search Grounding ---
export const searchWithGrounding = async (query: string): Promise<{ text: string; sources: any[] }> => {
    const model = 'gemini-2.5-flash';
    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: query,
            config: {
                tools: [{ googleSearch: {} }],
            },
        });
        
        const text = response.text;
        const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        return { text, sources };
    } catch(error) {
        console.error("Error with search grounding:", error);
        throw new Error("Failed to perform search with Gemini.");
    }
};
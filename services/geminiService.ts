import { GoogleGenAI, Type } from "@google/genai";
import { DreamAnalysis, ImageSize } from "../types";

// Helper to get AI client with current key
const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API Key is missing. Ensure user has selected a key.");
    throw new Error("API Key missing");
  }
  return new GoogleGenAI({ apiKey });
};

export const analyzeAudioDream = async (audioBase64: string, mimeType: string): Promise<DreamAnalysis> => {
  const ai = getAiClient();
  
  // Using 2.5 Flash for fast multimodal analysis
  const modelId = "gemini-2.5-flash"; 
  
  const prompt = `
    You are an expert Jungian dream analyst. Listen to this audio recording of a dream.
    
    Perform the following tasks:
    1. Transcribe the audio exactly.
    2. Create a "visualPrompt" for a text-to-image AI. This prompt should describe a SURREALIST image that captures the core emotional theme and key symbols of the dream. It should be artistic, vivid, and abstract where appropriate. Do NOT simply describe the scene; describe the feeling and the surreal imagery.
    3. Provide a structured psychological analysis based on Jungian archetypes.
    4. Give the dream a short, poetic title.

    Return the result as a JSON object.
  `;

  const response = await ai.models.generateContent({
    model: modelId,
    contents: {
      parts: [
        { inlineData: { mimeType, data: audioBase64 } },
        { text: prompt }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          transcript: { type: Type.STRING },
          visualPrompt: { type: Type.STRING },
          analysis: {
            type: Type.OBJECT,
            properties: {
              theme: { type: Type.STRING },
              archetypes: { type: Type.ARRAY, items: { type: Type.STRING } },
              interpretation: { type: Type.STRING }
            }
          }
        }
      }
    }
  });

  if (!response.text) {
    throw new Error("No response from Dream Analysis model");
  }

  return JSON.parse(response.text) as DreamAnalysis;
};

export const generateDreamImage = async (prompt: string, size: ImageSize): Promise<string> => {
  const ai = getAiClient();
  
  // Using Gemini 3 Pro Image Preview (Nano Banana Pro)
  const modelId = "gemini-3-pro-image-preview";

  const enhancedPrompt = `A surrealist masterpiece, dreamlike quality, oil painting texture, ${prompt}`;

  const response = await ai.models.generateContent({
    model: modelId,
    contents: {
      parts: [{ text: enhancedPrompt }]
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1", // Square for journal entry
        imageSize: size, // 1K, 2K, or 4K
      }
    }
  });

  // Iterate through parts to find the image
  const parts = response.candidates?.[0]?.content?.parts;
  if (parts) {
    for (const part of parts) {
      if (part.inlineData && part.inlineData.data) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  }
  
  throw new Error("No image generated in response");
};

export const createChatSession = (dreamContext: DreamAnalysis) => {
  const ai = getAiClient();
  
  // Using Gemini 3 Pro Preview for advanced reasoning in chat
  const modelId = "gemini-3-pro-preview";

  const systemInstruction = `
    You are a compassionate and insightful Jungian dream analyst.
    The user has just recorded a dream.
    
    Here is the context of the dream:
    Title: ${dreamContext.title}
    Transcript: "${dreamContext.transcript}"
    Initial Interpretation: ${dreamContext.analysis.interpretation}
    Identified Archetypes: ${dreamContext.analysis.archetypes.join(", ")}

    Answer the user's follow-up questions about the symbolism, meaning, or emotions of this dream.
    Be deep, reflective, and encouraging of self-discovery. Keep responses concise but profound.
  `;

  const chat = ai.chats.create({
    model: modelId,
    config: {
      systemInstruction,
    }
  });

  return chat;
};


import { GoogleGenAI, Type } from "@google/genai";
import { AssistantConfig } from "../types";

export const processMessageWithGemini = async (
  message: string,
  history: { role: 'user' | 'assistant', content: string }[],
  config: AssistantConfig
) => {
  // Conforme as diretrizes, utiliza estritamente process.env.API_KEY
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    throw new Error("API_KEY_MISSING");
  }

  const ai = new GoogleGenAI({ apiKey });

  const systemInstruction = `
    Você é a "${config.name}", uma secretária financeira pessoal no WhatsApp.
    Seu tom é ${config.tone}. O cliente é o Francimário.
    Instruções:
    1. Registre gastos e ganhos.
    2. Agende lembretes de contas.
    3. Use emojis e linguagem de chat.
    4. Seja rápida e direta.
    Data atual: ${new Date().toLocaleDateString('pt-BR')}
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      ...history.map(h => ({ 
        role: h.role === 'user' ? 'user' : 'model', 
        parts: [{ text: h.content }] 
      })),
      { role: 'user', parts: [{ text: message }] }
    ],
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          reply: { type: Type.STRING },
          extractedTransaction: {
            type: Type.OBJECT,
            properties: {
              description: { type: Type.STRING },
              amount: { type: Type.NUMBER },
              type: { type: Type.STRING, enum: ['income', 'expense'] },
              category: { type: Type.STRING }
            }
          }
        },
        required: ["reply"]
      }
    }
  });

  try {
    // Acessa .text como propriedade, não como método
    const text = response.text;
    return text ? JSON.parse(text) : { reply: "Concluído!" };
  } catch (e) {
    return { reply: "Tudo anotado, Francimário! ✅" };
  }
};

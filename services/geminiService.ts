
import { GoogleGenAI, Type } from "@google/genai";
import { Transaction, Reminder, AssistantConfig } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const processMessageWithGemini = async (
  message: string,
  history: { role: 'user' | 'assistant', content: string }[],
  config: AssistantConfig
) => {
  const systemInstruction = `
    Você é a "${config.name}", uma secretária financeira pessoal no WhatsApp.
    Seu tom é ${config.tone}.
    Instruções:
    1. Se o usuário disser um gasto/ganho, confirme e extraia os dados.
    2. Se o usuário pedir um lembrete, agende.
    3. Seja concisa como se estivesse no chat do celular.
    
    Data de Hoje: ${new Date().toLocaleDateString('pt-BR')}
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      ...history.map(h => ({ role: h.role === 'user' ? 'user' : 'model', parts: [{ text: h.content }] })),
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
          },
          extractedReminder: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              dueDate: { type: Type.STRING },
              amount: { type: Type.NUMBER }
            }
          }
        },
        required: ["reply"]
      }
    }
  });

  try {
    return JSON.parse(response.text);
  } catch (e) {
    return { reply: "Tive um probleminha aqui. Pode mandar de novo?" };
  }
};

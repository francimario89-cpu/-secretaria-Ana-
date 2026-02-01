
import { GoogleGenAI, Type } from "@google/genai";
import { AssistantConfig } from "../types";

export const processMessageWithGemini = async (
  message: string,
  history: { role: 'user' | 'assistant', content: string }[],
  config: AssistantConfig
) => {
  // Tenta pegar do ambiente do Render injetado ou do process.env padrão
  const apiKey = (window as any).RENDER_ENV?.API_KEY || process.env.API_KEY;

  if (!apiKey || apiKey === "undefined" || apiKey.length < 10) {
    throw new Error("API_KEY_MISSING");
  }

  const ai = new GoogleGenAI({ apiKey });

  const systemInstruction = `
    Você é a "${config.name}", uma secretária financeira pessoal de alto nível no WhatsApp.
    Seu tom é ${config.tone}.
    Seu cliente é o Francimário.
    Instruções:
    1. Se ele falar de um gasto (ex: "gastei 20 no pão"), responda confirmando o registro de forma amigável.
    2. Se ele falar de um compromisso ou conta (ex: "lembra de pagar a luz amanhã"), confirme o agendamento.
    3. Use emojis e linguagem de chat (WhatsApp).
    4. Seja breve e eficiente.
    
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
    const text = response.text;
    return JSON.parse(text);
  } catch (e) {
    return { reply: response.text || "Entendido! Já anotei aqui." };
  }
};

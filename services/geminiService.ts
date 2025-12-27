
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateTeamNames = async (count: number, theme: string = "Professional"): Promise<string[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate ${count} creative team names for a corporate event. Theme: ${theme}. Return as a JSON array of strings.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });
    // Access the .text property directly and trim it as per guidelines
    const text = response.text?.trim();
    if (!text) {
      throw new Error("Empty response from Gemini API");
    }
    const names = JSON.parse(text);
    return names;
  } catch (error) {
    console.error("Gemini Error:", error);
    return Array.from({ length: count }, (_, i) => `Team ${i + 1}`);
  }
};

export const generateWinnerAnnouncement = async (name: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Create a short, exciting one-sentence announcement for ${name} winning a prize. Keep it fun and professional.`,
    });
    // response.text is a getter that returns the generated string
    return response.text?.trim() || `Congratulations, ${name}! You are the winner!`;
  } catch (error) {
    return `Congratulations, ${name}!`;
  }
};

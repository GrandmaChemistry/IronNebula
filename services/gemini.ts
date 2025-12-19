
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getOrbitalExplanation = async (orbitalId: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `请作为一名资深物理化学教授，解释铁原子（Fe）的 ${orbitalId} 轨道。包括其量子数意义、空间形状、在铁原子电子排布中的地位（例如能量等级、洪特规则的应用等），以及电子云的物理本质。请用通俗易懂但科学严谨的中文回答。`,
      config: {
        thinkingConfig: { thinkingBudget: 2000 }
      }
    });
    return response.text;
  } catch (error) {
    console.error("AI Assistant Error:", error);
    return "暂时无法连接到AI助手，请稍后再试。";
  }
};

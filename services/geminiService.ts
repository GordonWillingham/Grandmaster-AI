
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { AnalysisResponse, MoveAssessmentResponse, MoveQuality } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const analyzePosition = async (fen: string, history: string[]): Promise<AnalysisResponse | null> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Analyze this chess position (FEN: ${fen}). The recent move history is: ${history.join(', ')}. Provide a deep grandmaster-level evaluation.`,
      config: {
        thinkingConfig: { thinkingBudget: 15000 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            evaluation: { type: Type.STRING },
            bestMoves: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  move: { type: Type.STRING },
                  explanation: { type: Type.STRING }
                },
                required: ["move", "explanation"]
              }
            },
            strategicAdvice: { type: Type.STRING }
          },
          required: ["evaluation", "bestMoves", "strategicAdvice"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text.trim());
    }
    return null;
  } catch (error) {
    console.error("Error in Gemini Analysis:", error);
    return null;
  }
};

export const assessMove = async (fenBefore: string, fenAfter: string, move: string, history: string[]): Promise<MoveAssessmentResponse | null> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Assess the quality of the move "${move}". 
      FEN before: ${fenBefore}
      FEN after: ${fenAfter}
      History: ${history.join(', ')}
      Determine if it's a Blunder, Miss, Mistake, Inaccuracy, Excellent, or Best move.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            quality: { 
              type: Type.STRING, 
              description: "Must be one of: Brilliant, Great, Best, Excellent, Inaccuracy, Mistake, Blunder, Miss" 
            },
            explanation: { type: Type.STRING },
            evaluation: { type: Type.STRING }
          },
          required: ["quality", "explanation", "evaluation"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text.trim());
    }
    return null;
  } catch (error) {
    return null;
  }
};

export const getComputerMove = async (fen: string, elo: number, history: string[]): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Act as a chess engine playing at ${elo} ELO. 
      Current FEN: ${fen}
      History: ${history.join(', ')}
      Return the best move in simple notation (e.g., 'e2e4' or 'Nf3').
      If ELO is low (< 800), make occasional human-like mistakes or ignore hanging pieces.
      If ELO is high (> 2000), play extremely accurately.`,
      config: {
        thinkingConfig: { thinkingBudget: elo > 1500 ? 10000 : 0 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            move: { type: Type.STRING, description: "The move in standard algebraic notation or coordinate notation." },
            thought: { type: Type.STRING, description: "Brief reason for the move reflecting the ELO level." }
          },
          required: ["move", "thought"]
        }
      }
    });

    if (response.text) {
      const data = JSON.parse(response.text.trim());
      return data.move;
    }
    return "";
  } catch (error) {
    return "";
  }
};

export const chatWithGrandmaster = async (message: string, fen: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `User question: "${message}". Current Chess Position FEN: "${fen}". You are a world-class chess grandmaster coach. Provide a concise, instructive answer.`,
      config: {
        systemInstruction: "You are Grandmaster Gemini, a friendly but firm chess coach. You focus on both classic principles and modern engine-based strategies. Use chess notation for moves."
      }
    });
    return response.text || "I apologize, I'm unable to analyze that right now.";
  } catch (error) {
    console.error("Error in Gemini Chat:", error);
    return "The engine is currently experiencing some lag. Please try again.";
  }
};

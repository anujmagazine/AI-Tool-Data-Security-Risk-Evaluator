
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { AnalysisRequest, AnalysisResult } from "../types";

export const analyzeTool = async (request: AnalysisRequest): Promise<AnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Act as a Corporate Data Safety Officer. Analyze the FREE version of the AI tool: "${request.toolName}"
    ${request.website ? `Official Website: ${request.website}` : ''}
    ${request.useCase ? `Context/Use Case: ${request.useCase}` : ''}

    STRICT ANALYSIS REQUIREMENTS:
    1. TOP TRADE-OFFS: Identify the top 5-6 most critical risks in prioritized order. These are the immediate "deal-breakers".
    2. FULL RISK PROFILE (Exhaustive): Create a comprehensive list of ALL potential data security and privacy risks. 
       - Aim for 10 or more specific entries if any are present in the documentation/history.
       - A single category (like 'Model Training' or 'Data Retention') can have multiple specific risks.
       - Do not skip minor risks; we need a complete picture.
    3. LANGUAGE: Use extremely easy, non-technical language. Descriptions in the table must be under 20 words.
    4. VERDICT: Restricted (Red), Conditional (Amber), or Approved (Green). If user data is used for model training in the free version, it MUST be marked Restricted.

    Return a JSON response:
    {
      "toolName": "Name",
      "overallRiskScore": 0-100,
      "summary": "1-sentence decision summary for a manager.",
      "topRisks": [
        { "point": "Simple risk description", "sourceUrl": "Direct link if available", "priority": 1 }
      ],
      "riskTable": [
        { "category": "Category Name", "description": "Max 20 word easy description", "severity": "High/Medium/Low" }
      ],
      "recommendation": "Restricted, Conditional, or Approved"
    }
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
      },
    });

    const resultText = response.text || "{}";
    const parsed = JSON.parse(resultText);

    // Extract all grounding sources for the final section
    const sources: any[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.web) {
          sources.push({
            title: chunk.web.title || 'Official Security Source',
            uri: chunk.web.uri
          });
        }
      });
    }

    return { ...parsed, sources };
  } catch (error) {
    console.error("Analysis failed:", error);
    throw new Error("Security audit failed. Please check the tool name and try again.");
  }
};

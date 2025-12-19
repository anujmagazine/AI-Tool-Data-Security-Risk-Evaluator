
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { AnalysisRequest, AnalysisResult } from "../types";

export const analyzeTool = async (request: AnalysisRequest): Promise<AnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Act as a Corporate Data Safety Officer. Analyze the FREE version of the AI tool: "${request.toolName}"
    ${request.website ? `Website: ${request.website}` : ''}
    ${request.useCase ? `Context: ${request.useCase}` : ''}

    STRICT ANALYSIS REQUIREMENTS:
    1. TOP TRADE-OFFS: Identify the top 5-6 most critical risks in prioritized order.
    2. RISK TABLE: Create a categorized list of ALL data security risks. Categories should include things like "Model Training", "Third-Party Sharing", "Data Retention", "Privacy Control", etc.
    3. LANGUAGE: Use extremely easy, non-technical language. Descriptions in the table must be under 20 words.
    4. VERDICT: Restricted (Red), Conditional (Amber), or Approved (Green). If data is used for training, it must be Restricted.

    Return a JSON response:
    {
      "toolName": "Name",
      "overallRiskScore": 0-100,
      "summary": "1-sentence decision summary.",
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

    // Extract all grounding sources
    const sources: any[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.web) {
          sources.push({
            title: chunk.web.title || 'Official Document',
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

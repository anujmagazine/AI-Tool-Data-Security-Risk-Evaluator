
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { AnalysisRequest, AnalysisResult } from "../types";

export const analyzeTool = async (request: AnalysisRequest): Promise<AnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Act as a World-Class Cybersecurity and Data Privacy Auditor.
    Analyze the AI tool: "${request.toolName}" 
    ${request.website ? `Website: ${request.website}` : ''}
    ${request.useCase ? `Context/Use Case: ${request.useCase}` : ''}

    Specifically research:
    1. Privacy Policy: Does it use user data for model training by default? Can users opt-out?
    2. Data Residency: Where is data stored?
    3. Security Track Record: Any known data breaches or cybersecurity incidents?
    4. Compliance: Does it mention SOC2, ISO 27001, GDPR, or HIPAA?
    5. Social/Media Buzz: Recent controversies regarding data handling.

    Return a JSON response following this structure:
    {
      "toolName": "Name of the tool",
      "overallRiskScore": number (0-100, where 100 is most dangerous),
      "summary": "High-level summary for executives",
      "dataCompromisePoints": ["point 1", "point 2"],
      "trainingPolicy": "Details about if and how they use data for training",
      "breachHistory": "Historical context of security incidents",
      "complianceStatus": "SOC2, GDPR, etc.",
      "categories": [
        { "name": "Data Privacy", "status": "Critical/Warning/Secure", "description": "reasoning" },
        { "name": "Security Policy", "status": "Critical/Warning/Secure", "description": "reasoning" },
        { "name": "Model Training", "status": "Critical/Warning/Secure", "description": "reasoning" }
      ],
      "recommendation": "Approved/Conditional/Restricted"
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

    // Extract grounding sources
    const sources: any[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.web) {
          sources.push({
            title: chunk.web.title || 'Source',
            uri: chunk.web.uri
          });
        }
      });
    }

    return {
      ...parsed,
      sources: sources
    };
  } catch (error) {
    console.error("Analysis failed:", error);
    throw new Error("Failed to analyze tool. Please try again later.");
  }
};

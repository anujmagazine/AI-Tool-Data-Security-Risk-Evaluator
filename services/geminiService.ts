
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { AnalysisRequest, AnalysisResult } from "../types";

export const analyzeTool = async (request: AnalysisRequest): Promise<AnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Act as a Corporate Data Safety Officer. Analyze the FREE version of: "${request.toolName}"
    ${request.website ? `Website: ${request.website}` : ''}
    ${request.useCase ? `Use Case: ${request.useCase}` : ''}

    STRICT VERDICT RULES:
    1. If they use user data for training by default (and it's not a trivial opt-out), it is "Restricted".
    2. If there are human review clauses for transcripts, it is "Restricted".
    3. If there is no SSO/Enterprise control, it is at best "Conditional".
    4. "Approved" is only for tools with ZERO data retention or training by default.

    DATA TRADE-OFFS:
    Identify all risks. Select the TOP 5 MOST CRITICAL and provide them in "topRisks". 
    Any others go into "additionalRisks".
    For EACH risk, use simple language (no jargon) and include a "sourceUrl" (from privacy policies or news) if possible.

    Return JSON:
    {
      "toolName": "Name",
      "overallRiskScore": 0-100,
      "summary": "Plain language decision.",
      "topRisks": [
        { "point": "Simple explanation of what is at risk", "sourceUrl": "URL", "priority": 1 }
      ],
      "additionalRisks": [
        { "point": "...", "sourceUrl": "...", "priority": 6 }
      ],
      "trainingPolicy": "How data is used.",
      "breachHistory": "Past incidents.",
      "complianceStatus": "Security grade.",
      "categories": [{ "name": "Privacy", "status": "Critical/Warning/Secure", "description": "..." }],
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

    // Hard safety check to prevent "Green" for "Restricted" profiles
    if ((parsed.overallRiskScore > 50 || parsed.topRisks.length > 0) && parsed.recommendation === 'Approved') {
       parsed.recommendation = 'Restricted';
       parsed.summary = "Risk detected: High privacy concerns make this unsuitable for corporate secrets.";
    }

    const sources: any[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.web) {
          sources.push({ title: chunk.web.title || 'Source', uri: chunk.web.uri });
        }
      });
    }

    return { ...parsed, sources };
  } catch (error) {
    console.error("Analysis failed:", error);
    throw new Error("Security audit failed. Please try again later.");
  }
};

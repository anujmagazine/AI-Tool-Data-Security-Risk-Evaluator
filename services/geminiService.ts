
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { AnalysisRequest, AnalysisResult } from "../types";

export const analyzeTool = async (request: AnalysisRequest): Promise<AnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Act as a strict Corporate Data Protection Officer (CISO). 
    Analyze the FREE version of the AI tool: "${request.toolName}"
    ${request.website ? `Website: ${request.website}` : ''}
    ${request.useCase ? `Context: ${request.useCase}` : ''}

    CRITICAL SAFETY RULE: 
    - If the tool uses user data for training by default, it MUST be "Restricted" (Stop).
    - If the tool is useful but lacks encryption or has human-review clauses, it MUST be "Conditional" (Caution).
    - ONLY mark as "Approved" (Go) if the free tier has explicit "Zero-Data-Retainment" policies (very rare).

    NEVER mark a tool as "Approved" if you then warn people not to put secrets in it. If they can't put secrets in it, it is NOT "Approved for work".

    Return a JSON response:
    {
      "toolName": "Name",
      "overallRiskScore": 0-100,
      "summary": "Clear guidance: 'Unsafe for work' or 'Public data only'.",
      "dataCompromisePoints": [
        "Specifically mention data-for-training or human review."
      ],
      "trainingPolicy": "Simple explanation of data ownership.",
      "breachHistory": "Past security issues.",
      "complianceStatus": "Corporate security grade.",
      "categories": [
        { "name": "Privacy", "status": "Critical/Warning/Secure", "description": "Why this status?" }
      ],
      "recommendation": "Restricted (Stop), Conditional (Caution), or Approved (Go)"
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

    // Safety override: if the risk score is high but recommendation is Approved, downgrade it.
    if (parsed.overallRiskScore > 60 && parsed.recommendation === 'Approved') {
      parsed.recommendation = 'Restricted';
    }

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

    return { ...parsed, sources };
  } catch (error) {
    console.error("Analysis failed:", error);
    throw new Error("Security audit server failed. Please try again.");
  }
};

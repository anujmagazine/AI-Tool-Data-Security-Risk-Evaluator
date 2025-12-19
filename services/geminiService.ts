
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { AnalysisRequest, AnalysisResult } from "../types";

export const analyzeTool = async (request: AnalysisRequest): Promise<AnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Act as a corporate data safety officer. 
    Analyze the FREE version of the AI tool: "${request.toolName}"
    ${request.website ? `Website: ${request.website}` : ''}
    ${request.useCase ? `Context: ${request.useCase}` : ''}

    Your goal is to help a manager decide if their team should use this free tool.
    Avoid jargon. Use "Plain English".

    Specifically look for the "Price of Free":
    1. Does the tool "own" the inputs or use them to train their public model?
    2. Does it lack basic company security (like private login/SSO)?
    3. Are there known leaks of user data?

    Return a JSON response:
    {
      "toolName": "Name",
      "overallRiskScore": 0-100,
      "summary": "A 1-sentence decision like 'Do not use this for company secrets.'",
      "dataCompromisePoints": [
        "Example: They can read your private messages to train their AI.",
        "Example: Your uploaded files are stored on public servers."
      ],
      "trainingPolicy": "Simple explanation of how they use your data for their own benefit.",
      "breachHistory": "Short mention of any past security scares.",
      "complianceStatus": "Simple: 'Meets basic standards' or 'Fails company security'",
      "categories": [
        { "name": "Data Privacy", "status": "Critical/Warning/Secure", "description": "What happens to your secrets?" },
        { "name": "Legal Safety", "status": "Critical/Warning/Secure", "description": "Who owns what you create?" }
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

    const sources: any[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.web) {
          sources.push({
            title: chunk.web.title || 'Official Source',
            uri: chunk.web.uri
          });
        }
      });
    }

    return { ...parsed, sources };
  } catch (error) {
    console.error("Analysis failed:", error);
    throw new Error("Couldn't reach the security server. Please check the name and try again.");
  }
};

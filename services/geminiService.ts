
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { AnalysisRequest, AnalysisResult } from "../types";

export const analyzeTool = async (request: AnalysisRequest): Promise<AnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Act as a World-Class Cybersecurity and Data Privacy Auditor specializing in SaaS risk.
    Analyze the FREE VERSION of the AI tool: "${request.toolName}" 
    ${request.website ? `Website: ${request.website}` : ''}
    ${request.useCase ? `Context/Use Case: ${request.useCase}` : ''}

    CRITICAL INSTRUCTION: Analyze ONLY the FREE/COMMUNITY tier. Ignore features or privacy guarantees that only apply to paid "Enterprise" or "Pro" plans.
    
    Specifically research for the FREE VERSION:
    1. Data Usage for Training: Does the free tier policy state that user inputs are used to train their models? Is "Opt-Out" available for free users?
    2. Privacy Policy: Does the free version have lower data protection standards than the enterprise version?
    3. Security Features: Does the free tier lack key enterprise features like SSO, SCIM, or data encryption at rest (standard in paid versions)?
    4. Historical Data Breaches: Any leaks specifically involving public/free user data.
    5. Compliance: Are compliance certifications (SOC2, HIPAA) restricted only to their paid tiers?

    Return a JSON response following this structure:
    {
      "toolName": "Name of the tool (Free Version)",
      "overallRiskScore": number (0-100, where 100 is most dangerous),
      "summary": "Focus specifically on why the FREE version is or isn't a risk for the organization.",
      "dataCompromisePoints": ["point 1 specifically about free-tier data storage/usage", "point 2..."],
      "trainingPolicy": "Details about how FREE user data is used for model improvement.",
      "breachHistory": "Incidents affecting the public/free user base.",
      "complianceStatus": "List what is actually applicable to the FREE tier.",
      "categories": [
        { "name": "Free-Tier Privacy", "status": "Critical/Warning/Secure", "description": "reasoning" },
        { "name": "Standard Security", "status": "Critical/Warning/Secure", "description": "reasoning" },
        { "name": "Data Ownership", "status": "Critical/Warning/Secure", "description": "reasoning" }
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


import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { AnalysisRequest, AnalysisResult, GroundingSource } from "../types";

export const analyzeTool = async (request: AnalysisRequest): Promise<AnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Act as a Corporate Data Safety Officer with a sense of humor. Analyze the FREE version of the AI tool: "${request.toolName}"
    ${request.website ? `Official Website: ${request.website}` : ''}
    ${request.useCase ? `Context/Use Case: ${request.useCase}` : ''}

    STRICT ANALYSIS REQUIREMENTS:
    1. TOOL DESCRIPTION: Provide a very brief (1-sentence) description.
    2. TOP TRADE-OFFS: Identify 5-6 critical risks.
    3. FULL RISK PROFILE: Comprehensive list (10+ entries).
    4. USER IMPACT: For EVERY entry in the risk table, provide a "scenario"—a relatable, real-world example of what could happen to a regular employee using it (e.g., "Imagine if a competitor finds your internal project timeline via a search engine").
    5. CREATIVE WARNING: Write a punchy, creative, slightly satirical "Truth Bomb" (max 20 words).
    6. SOURCES: Direct URLs to official Privacy Policy, Terms of Service, etc.
    7. FRESHNESS: Identify "Last Updated" dates.

    Return a JSON response:
    {
      "toolName": "Name",
      "toolDescription": "1-sentence explanation",
      "overallRiskScore": 0-100,
      "summary": "1-sentence decision summary",
      "creativeWarning": "Punchy reality check",
      "topRisks": [
        { "point": "Simple risk description", "sourceUrl": "Direct link", "priority": 1 }
      ],
      "riskTable": [
        { 
          "category": "Category Name", 
          "description": "Professional security description", 
          "scenario": "A relatable 'Imagine if...' scenario", 
          "severity": "High/Medium/Low" 
        }
      ],
      "recommendation": "Restricted, Conditional, or Approved",
      "sources": [
        { "title": "Privacy Policy", "uri": "https://...", "lastUpdated": "Date" }
      ]
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

    const groundingSources: GroundingSource[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.web && chunk.web.uri) {
          groundingSources.push({
            title: chunk.web.title || 'Security Reference',
            uri: chunk.web.uri,
            lastUpdated: 'Recent'
          });
        }
      });
    }

    const allSourcesMap = new Map<string, GroundingSource>();
    (parsed.sources || []).forEach((s: GroundingSource) => {
      if (s.uri) allSourcesMap.set(s.uri, s);
    });
    groundingSources.forEach((s: GroundingSource) => {
      if (!allSourcesMap.has(s.uri)) allSourcesMap.set(s.uri, s);
    });

    return { ...parsed, sources: Array.from(allSourcesMap.values()) };
  } catch (error) {
    console.error("Analysis failed:", error);
    throw new Error("Security audit failed. Please try again.");
  }
};

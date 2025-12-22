
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { AnalysisRequest, AnalysisResult, GroundingSource } from "../types";

export const analyzeTool = async (request: AnalysisRequest): Promise<AnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Act as a Corporate Data Safety Officer. Analyze the FREE version of the AI tool: "${request.toolName}"
    ${request.website ? `Official Website: ${request.website}` : ''}
    ${request.useCase ? `Context/Use Case: ${request.useCase}` : ''}

    STRICT ANALYSIS REQUIREMENTS:
    1. TOOL DESCRIPTION: Provide a very brief (1-sentence) description.
    2. TOP TRADE-OFFS: Identify 5-6 critical risks.
    3. FULL RISK PROFILE: Comprehensive list (10+ entries).
    4. SOURCES: You MUST find and provide the direct URLs to the tool's official Privacy Policy, Terms of Service, and any security/data handling documentation you find via search.

    Return a JSON response:
    {
      "toolName": "Name",
      "toolDescription": "1-sentence explanation",
      "overallRiskScore": 0-100,
      "summary": "1-sentence decision summary",
      "topRisks": [
        { "point": "Simple risk description", "sourceUrl": "Direct link to evidence", "priority": 1 }
      ],
      "riskTable": [
        { "category": "Category", "description": "Max 20 word description", "severity": "High/Medium/Low" }
      ],
      "recommendation": "Restricted, Conditional, or Approved",
      "sources": [
        { "title": "e.g. Privacy Policy", "uri": "https://..." },
        { "title": "e.g. Terms of Service", "uri": "https://..." }
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

    // Also extract grounding sources from the Search Tool metadata for redundancy
    const groundingSources: GroundingSource[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.web && chunk.web.uri) {
          groundingSources.push({
            title: chunk.web.title || 'Security Reference',
            uri: chunk.web.uri
          });
        }
      });
    }

    // Merge sources from JSON and grounding metadata, deduplicate by URI
    const allSourcesMap = new Map<string, GroundingSource>();
    
    // Add sources from JSON first
    (parsed.sources || []).forEach((s: GroundingSource) => {
      if (s.uri) allSourcesMap.set(s.uri, s);
    });

    // Add grounding sources (might be more current)
    groundingSources.forEach((s: GroundingSource) => {
      if (!allSourcesMap.has(s.uri)) {
        allSourcesMap.set(s.uri, s);
      }
    });

    return { ...parsed, sources: Array.from(allSourcesMap.values()) };
  } catch (error) {
    console.error("Analysis failed:", error);
    throw new Error("Security audit failed. Please try again.");
  }
};

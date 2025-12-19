
export interface AnalysisRequest {
  toolName: string;
  website?: string;
  useCase?: string;
}

export interface RiskCategory {
  name: string;
  status: 'Critical' | 'Warning' | 'Secure';
  description: string;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface AnalysisResult {
  toolName: string;
  overallRiskScore: number; // 0 (Low Risk) to 100 (High Risk)
  summary: string;
  dataCompromisePoints: string[];
  trainingPolicy: string;
  breachHistory: string;
  complianceStatus: string; // e.g., SOC2, GDPR
  categories: RiskCategory[];
  recommendation: 'Approved' | 'Conditional' | 'Restricted';
  sources: GroundingSource[];
}

export enum AppState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  RESULT = 'RESULT',
  ERROR = 'ERROR'
}

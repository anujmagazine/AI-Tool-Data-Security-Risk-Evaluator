
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

export interface RiskPoint {
  point: string;
  sourceUrl?: string;
  priority: number;
}

export interface AnalysisResult {
  toolName: string;
  overallRiskScore: number; // 0 (Low Risk) to 100 (High Risk)
  summary: string;
  topRisks: RiskPoint[];
  additionalRisks: RiskPoint[];
  trainingPolicy: string;
  breachHistory: string;
  complianceStatus: string;
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

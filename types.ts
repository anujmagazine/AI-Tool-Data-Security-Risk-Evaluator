
export interface AnalysisRequest {
  toolName: string;
  website?: string;
  useCase?: string;
}

export interface RiskTableRow {
  category: string;
  description: string;
  scenario: string;
  severity: 'High' | 'Medium' | 'Low';
}

export interface GroundingSource {
  title: string;
  uri: string;
  lastUpdated?: string;
}

export interface AnalysisResult {
  toolName: string;
  toolDescription: string;
  overallRiskScore: number;
  summary: string;
  creativeWarning: string;
  riskTable: RiskTableRow[];
  recommendation: 'Approved' | 'Conditional' | 'Restricted';
  sources: GroundingSource[];
}

export enum AppState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  RESULT = 'RESULT',
  ERROR = 'ERROR'
}

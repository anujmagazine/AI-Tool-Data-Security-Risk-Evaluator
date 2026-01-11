
export interface AnalysisRequest {
  toolName: string;
  website?: string;
  useCase?: string;
}

export interface RiskPoint {
  point: string;
  sourceUrl?: string;
  priority: number;
}

export interface RiskTableRow {
  category: string;
  description: string;
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
  topRisks: RiskPoint[];
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

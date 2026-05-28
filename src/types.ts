export interface CandidateProfile {
  workExperience: string;
  yearsExperience: number;
  education: string;
  productExperience: string;
  previousDomains: string[];
  familiarTech: string[];
  strengths: string[];
  targetRole: string;
}

export interface SalaryInfo {
  label: string;
  minK?: number;
  maxK?: number;
  monthMultiplier?: number;
  monthlyMidK?: number;
  status: 'parsed' | 'negotiable' | 'missing';
}

export interface KeywordStat {
  keyword: string;
  count: number;
  category: string;
}

export interface AbilityRequirement {
  name: string;
  description: string;
  count: number;
  evidence: string[];
}

export interface AbilityAnalysisItem {
  name: string;
  status: '优势能力' | '可迁移能力' | '重点补齐';
  priority: '高' | '中' | '低';
  score: number;
  reason: string;
  actions: string[];
  evidence: string[];
}

export interface InterviewFocusItem {
  title: string;
  category: '必备问题' | '案例包装' | '短板补救' | '临时补课';
  priority: '高' | '中' | '低';
  detail: string;
  talkingPoints: string[];
}

export interface ProjectRecommendation {
  title: string;
  level?: string;
  reason: string;
  deliverables: string[];
  matchedAbilities: string[];
}

export interface JobPosting {
  id: number;
  title: string;
  rawText: string;
  salary: SalaryInfo;
  keywords: KeywordStat[];
  abilities: string[];
  parseStatus: 'success' | 'partial';
}

export interface AnalysisResult {
  jobCount: number;
  averageSalaryK?: number;
  parsedSalaryCount: number;
  topKeywords: KeywordStat[];
  abilityRequirements: AbilityRequirement[];
  abilityAnalysis: AbilityAnalysisItem[];
  interviewFocus: InterviewFocusItem[];
  profileBasedProjectRecommendations: ProjectRecommendation[];
  generalProjectRecommendations: ProjectRecommendation[];
  marketInsights: string[];
  jobSearchAdvice: string[];
  jobs: JobPosting[];
}

export interface CandidateProfile {
  yearsExperience: number;
  aiExperience: string;
  previousDomains: string[];
  representativeProject: string;
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

export interface ProjectRecommendation {
  title: string;
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
  profileBasedProjectRecommendations: ProjectRecommendation[];
  generalProjectRecommendations: ProjectRecommendation[];
  marketInsights: string[];
  jobSearchAdvice: string[];
  jobs: JobPosting[];
}

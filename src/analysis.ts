import type {
  AbilityRequirement,
  AnalysisResult,
  CandidateProfile,
  JobPosting,
  KeywordStat,
  ProjectRecommendation,
  SalaryInfo,
} from './types';

export const defaultProfile: CandidateProfile = {
  workExperience: '1-3年',
  yearsExperience: 2,
  aiExperience: '有相关经验',
  previousDomains: ['工具类产品', '出行类产品'],
  familiarTech: ['AI 大模型（LLM）', 'RAG / 知识库'],
  strengths: ['原型设计', '数据分析'],
  targetRole: 'AI 产品经理',
  representativeProject: '车来了 App',
};

type KeywordRule = {
  keyword: string;
  aliases: string[];
  category: string;
  ability: string;
};

const keywordRules: KeywordRule[] = [
  { keyword: 'RAG', aliases: ['rag', '检索增强', '知识库', '向量库', '召回', '检索'], category: 'AI 应用', ability: 'RAG / 知识库' },
  { keyword: 'Prompt', aliases: ['prompt', '提示词', '提示工程', '提示词工程'], category: 'AI 应用', ability: 'Prompt 工程' },
  { keyword: 'Agent', aliases: ['agent', '智能体', '多智能体', '工具调用', 'function calling'], category: 'AI 应用', ability: 'Agent 产品设计' },
  { keyword: 'LLM', aliases: ['llm', '大模型', '语言模型', 'gpt', '模型能力'], category: 'AI 应用', ability: 'AI 应用设计' },
  { keyword: '问答', aliases: ['问答', 'qa', '客服', '对话', 'chatbot', '机器人'], category: '场景', ability: 'AI 应用设计' },
  { keyword: '模型评测', aliases: ['评测', '测评', '效果评估', 'benchmark', '准确率', '幻觉', '满意度'], category: '质量', ability: '模型评测' },
  { keyword: '数据分析', aliases: ['数据分析', '数据指标', '埋点', '漏斗', '转化率', '留存', '看板'], category: '产品方法', ability: '数据分析' },
  { keyword: 'A/B 测试', aliases: ['a/b', 'ab test', 'ab测试', '实验'], category: '产品方法', ability: '数据分析' },
  { keyword: '需求分析', aliases: ['需求分析', '需求调研', '用户调研', '竞品分析', 'PRD', '原型'], category: '产品方法', ability: '产品方法论' },
  { keyword: '项目推进', aliases: ['项目推进', '跨部门', '协同', '落地', '排期', '研发', '算法', '运营'], category: '协作', ability: '项目推进' },
  { keyword: '商业化', aliases: ['商业化', '变现', '付费', '收入', '客户成功', '售前'], category: '业务', ability: '商业化理解' },
  { keyword: '增长', aliases: ['增长', '拉新', '促活', '转化', '用户增长'], category: '业务', ability: '增长产品' },
  { keyword: 'B 端', aliases: ['b端', 'b 端', '企业', 'saas', '客户', '后台'], category: '业务', ability: 'B 端产品' },
  { keyword: 'C 端', aliases: ['c端', 'c 端', '用户体验', '用户端', 'app'], category: '业务', ability: 'C 端产品' },
  { keyword: '多模态', aliases: ['多模态', '图片理解', '语音', '视频', 'ocr'], category: 'AI 应用', ability: 'AI 应用设计' },
  { keyword: '工作流', aliases: ['工作流', 'workflow', '自动化', '流程编排'], category: 'AI 应用', ability: 'Agent 产品设计' },
];

const abilityDescriptions: Record<string, string> = {
  'RAG / 知识库': '能把业务内容组织成可检索知识，并设计召回、答案生成、溯源和更新链路。',
  'Prompt 工程': '能把用户意图、业务规则和模型输出约束转化为稳定的提示词与调优方案。',
  'Agent 产品设计': '能设计任务拆解、工具调用、工作流编排和异常兜底，让 AI 完成更长链路任务。',
  'AI 应用设计': '能围绕大模型能力设计真实用户场景，并把体验、成本、延迟和质量纳入产品方案。',
  '模型评测': '能定义效果指标、构建测试集，并持续评估准确率、幻觉、覆盖率和用户满意度。',
  '数据分析': '能通过指标体系、埋点、看板和实验判断产品效果，并指导迭代。',
  '产品方法论': '能完成需求调研、竞品分析、PRD、原型和优先级判断。',
  '项目推进': '能协调研发、算法、运营和业务团队，把 AI 产品从方案推进到上线。',
  '商业化理解': '能理解客户价值、付费场景、售前转化和收入指标。',
  '增长产品': '能围绕获客、激活、转化和留存设计增长策略。',
  'B 端产品': '能处理企业客户、权限、流程、后台和交付场景。',
  'C 端产品': '能理解移动端体验、用户路径和规模化使用场景。',
};

export function analyzeJobDescriptions(input: string, profile = defaultProfile): AnalysisResult {
  const segments = splitJobDescriptions(input);
  const jobs = segments.map((segment, index) => parseJobPosting(segment, index + 1));
  const topKeywords = aggregateKeywords(jobs);
  const abilityRequirements = aggregateAbilities(jobs);
  const salaryValues = jobs
    .map((job) => job.salary.monthlyMidK)
    .filter((value): value is number => typeof value === 'number');

  const averageSalaryK = salaryValues.length
    ? roundToOneDecimal(salaryValues.reduce((sum, value) => sum + value, 0) / salaryValues.length)
    : undefined;

  const profileBasedProjectRecommendations = recommendProfileBasedProjects(abilityRequirements, topKeywords, profile);
  const generalProjectRecommendations = recommendGeneralProjects(abilityRequirements, topKeywords);

  return {
    jobCount: jobs.length,
    averageSalaryK,
    parsedSalaryCount: salaryValues.length,
    topKeywords,
    abilityRequirements,
    profileBasedProjectRecommendations,
    generalProjectRecommendations,
    marketInsights: buildMarketInsights(jobs, abilityRequirements, topKeywords, averageSalaryK),
    jobSearchAdvice: buildJobSearchAdvice(abilityRequirements, profileBasedProjectRecommendations, profile),
    jobs,
  };
}

function splitJobDescriptions(input: string): string[] {
  const normalized = input.replace(/\r/g, '').trim();
  if (!normalized) return [];

  const blocks = normalized
    .split(/\n{2,}|(?=\n(?:岗位名称|职位名称|职位：|岗位：|【[^】]+】))/g)
    .map((block) => block.trim())
    .filter((block) => block.length > 24);

  if (blocks.length <= 1) return [normalized];

  const merged: string[] = [];
  let buffer = '';
  blocks.forEach((block) => {
    const looksLikeJob = /(岗位职责|职位描述|工作职责|岗位要求|任职要求|薪资|[0-9]{1,3}\s*[-~—到]\s*[0-9]{1,3}\s*k)/i.test(block);
    if (looksLikeJob && buffer) {
      merged.push(buffer.trim());
      buffer = block;
    } else {
      buffer = buffer ? `${buffer}\n\n${block}` : block;
    }
  });
  if (buffer) merged.push(buffer.trim());

  return merged.length ? merged : [normalized];
}

function parseJobPosting(rawText: string, id: number): JobPosting {
  const keywords = extractKeywords(rawText);
  const salary = parseSalary(rawText);
  const abilities = Array.from(new Set(keywords.map((keyword) => keywordRules.find((rule) => rule.keyword === keyword.keyword)?.ability).filter(Boolean))) as string[];

  return {
    id,
    title: extractTitle(rawText, id),
    rawText,
    salary,
    keywords,
    abilities,
    parseStatus: keywords.length || salary.status !== 'missing' ? 'success' : 'partial',
  };
}

function extractTitle(text: string, id: number): string {
  const titleMatch = text.match(/(?:岗位名称|职位名称|岗位|职位)[:：\s]*([^\n]{2,40})/);
  if (titleMatch?.[1]) return cleanTitle(titleMatch[1]);

  const firstLine = text
    .split('\n')
    .map((line) => line.trim())
    .find((line) => line.length >= 2 && line.length <= 40 && !/(职责|要求|薪资|任职)/.test(line));

  return firstLine ? cleanTitle(firstLine) : `岗位 ${id}`;
}

function cleanTitle(title: string): string {
  return title.replace(/[|｜].*$/, '').replace(/\s+/g, ' ').trim();
}

function parseSalary(text: string): SalaryInfo {
  if (/面议|薪资不限|薪酬面谈/.test(text)) {
    return { label: '面议', status: 'negotiable' };
  }

  const rangeMatch = text.match(/(\d{1,3}(?:\.\d+)?)\s*[-~—到]\s*(\d{1,3}(?:\.\d+)?)\s*[kK千]/);
  if (rangeMatch) {
    const minK = Number(rangeMatch[1]);
    const maxK = Number(rangeMatch[2]);
    const monthMatch = text.match(/[·xX*]\s*(1[0-9]|2[0-4])\s*薪/);
    const monthMultiplier = monthMatch ? Number(monthMatch[1]) : undefined;
    return {
      label: `${minK}-${maxK}K${monthMultiplier ? `·${monthMultiplier}薪` : ''}`,
      minK,
      maxK,
      monthMultiplier,
      monthlyMidK: (minK + maxK) / 2,
      status: 'parsed',
    };
  }

  const singleMatch = text.match(/(\d{1,3}(?:\.\d+)?)\s*[kK千]/);
  if (singleMatch) {
    const value = Number(singleMatch[1]);
    return {
      label: `${value}K`,
      minK: value,
      maxK: value,
      monthlyMidK: value,
      status: 'parsed',
    };
  }

  return { label: '未识别', status: 'missing' };
}

function extractKeywords(text: string): KeywordStat[] {
  const lowerText = text.toLowerCase();
  return keywordRules
    .map((rule) => {
      const count = rule.aliases.reduce((sum, alias) => sum + countOccurrences(lowerText, alias.toLowerCase()), 0);
      return { keyword: rule.keyword, count, category: rule.category };
    })
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count || a.keyword.localeCompare(b.keyword, 'zh-CN'));
}

function countOccurrences(text: string, alias: string): number {
  const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return text.match(new RegExp(escaped, 'gi'))?.length ?? 0;
}

function aggregateKeywords(jobs: JobPosting[]): KeywordStat[] {
  const map = new Map<string, KeywordStat>();
  jobs.flatMap((job) => job.keywords).forEach((keyword) => {
    const existing = map.get(keyword.keyword);
    if (existing) existing.count += keyword.count;
    else map.set(keyword.keyword, { ...keyword });
  });
  return Array.from(map.values()).sort((a, b) => b.count - a.count).slice(0, 10);
}

function aggregateAbilities(jobs: JobPosting[]): AbilityRequirement[] {
  const map = new Map<string, { count: number; evidence: Set<string> }>();
  jobs.forEach((job) => {
    job.keywords.forEach((keyword) => {
      const ability = keywordRules.find((rule) => rule.keyword === keyword.keyword)?.ability;
      if (!ability) return;
      const current = map.get(ability) ?? { count: 0, evidence: new Set<string>() };
      current.count += keyword.count;
      current.evidence.add(keyword.keyword);
      map.set(ability, current);
    });
  });

  return Array.from(map.entries())
    .map(([name, value]) => ({
      name,
      description: abilityDescriptions[name] ?? '岗位中反复出现的综合能力要求。',
      count: value.count,
      evidence: Array.from(value.evidence),
    }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'zh-CN'));
}

function recommendProfileBasedProjects(
  abilities: AbilityRequirement[],
  keywords: KeywordStat[],
  profile: CandidateProfile,
): ProjectRecommendation[] {
  const abilityNames = abilities.map((ability) => ability.name);
  const keywordNames = keywords.map((keyword) => keyword.keyword);
  const has = (...names: string[]) => names.some((name) => abilityNames.includes(name) || keywordNames.includes(name));
  const domainText = profile.previousDomains.join(' / ') || '过往产品';
  const projectName = profile.representativeProject || `${domainText}项目`;
  const strengthText = profile.strengths.slice(0, 2).join('、') || '产品设计、数据分析';
  const techText = profile.familiarTech.slice(0, 2).join('、') || 'AI 产品基础能力';

  const recommendations: ProjectRecommendation[] = [];

  if (has('RAG / 知识库', '问答', 'RAG')) {
    recommendations.push({
      title: `基于${domainText}经验的 AI 知识库问答助手`,
      reason: `JD 强调 ${pickEvidence(keywords, ['RAG', '问答', 'LLM'])}，可把 ${projectName} 的业务内容抽象成知识库问答场景，并结合你熟悉的 ${techText} 展示转型能力。`,
      deliverables: ['知识库结构与更新流程', '问答链路原型', '召回与答案质量评测表'],
      matchedAbilities: ['RAG / 知识库', 'AI 应用设计', '模型评测'],
    });
  }

  if (has('Prompt 工程', 'Agent 产品设计')) {
    recommendations.push({
      title: `${domainText}场景 AI Agent`,
      reason: `岗位提到 ${pickEvidence(keywords, ['Prompt', 'Agent', '工作流'])}，适合基于你的 ${domainText} 背景设计一个能拆解用户目标、调用业务信息并完成任务闭环的智能体项目。`,
      deliverables: ['任务拆解流程图', 'Prompt 版本记录', '工具调用与异常兜底说明'],
      matchedAbilities: ['Prompt 工程', 'Agent 产品设计', '项目推进'],
    });
  }

  if (has('数据分析', '模型评测', 'A/B 测试')) {
    recommendations.push({
      title: 'AI 产品数据看板与评测体系',
      reason: `JD 中数据和效果相关要求较突出，你选择的优势包含 ${strengthText}，适合强化指标、实验和模型质量判断能力。`,
      deliverables: ['核心指标树', '埋点与实验方案', '模型效果评测集和复盘模板'],
      matchedAbilities: ['数据分析', '模型评测', '产品方法论'],
    });
  }

  if (has('商业化理解', 'B 端产品')) {
    recommendations.push({
      title: '企业知识库 AI 助手商业化方案',
      reason: `岗位关注 ${pickEvidence(keywords, ['商业化', 'B 端'])}，该项目能展示客户价值、权限流程、交付边界和售前转化思路。`,
      deliverables: ['目标客户与付费场景', '后台权限原型', '定价与试点转化方案'],
      matchedAbilities: ['B 端产品', '商业化理解', 'RAG / 知识库'],
    });
  }

  if (recommendations.length < 3) {
    recommendations.push({
      title: 'AI 产品经理转型作品集复盘',
      reason: `结合 ${profile.workExperience} 产品经验，把 ${projectName} 的需求分析、用户路径和数据指标改写成 ${profile.targetRole} 视角案例。`,
      deliverables: ['AI 化机会点清单', 'PRD 与原型', '上线前后指标对比假设'],
      matchedAbilities: ['产品方法论', 'AI 应用设计', '数据分析'],
    });
  }

  return recommendations.slice(0, 4);
}

function recommendGeneralProjects(
  abilities: AbilityRequirement[],
  keywords: KeywordStat[],
): ProjectRecommendation[] {
  const abilityNames = abilities.map((ability) => ability.name);
  const keywordNames = keywords.map((keyword) => keyword.keyword);
  const has = (...names: string[]) => names.some((name) => abilityNames.includes(name) || keywordNames.includes(name));
  const recommendations: ProjectRecommendation[] = [];

  if (has('RAG / 知识库', '问答', 'RAG')) {
    recommendations.push({
      title: '零代码知识库问答 Demo',
      reason: `岗位强调 ${pickEvidence(keywords, ['RAG', '问答', 'LLM'])}，小白可以先用飞书文档、Notion 或公开资料搭一个可演示的知识库问答流程。`,
      deliverables: ['资料库目录', '问答流程截图', '10 条测试问题与答案评分'],
      matchedAbilities: ['RAG / 知识库', 'AI 应用设计', '模型评测'],
    });
  }

  if (has('Prompt 工程', 'Agent 产品设计', '工作流')) {
    recommendations.push({
      title: 'Prompt 任务助手小实验',
      reason: `JD 出现 ${pickEvidence(keywords, ['Prompt', 'Agent', '工作流'])}，可以从提示词模板和流程编排入手，不需要先写代码。`,
      deliverables: ['3 版 Prompt 对比', '输入输出样例', '失败案例和改进记录'],
      matchedAbilities: ['Prompt 工程', 'Agent 产品设计'],
    });
  }

  if (has('数据分析', '模型评测', 'A/B 测试')) {
    recommendations.push({
      title: 'AI 功能效果评测表',
      reason: '岗位关注数据、实验或评测时，最容易上手的作品是用表格定义指标、样本、评分标准和复盘结论。',
      deliverables: ['指标定义表', '人工评测样本', '结论复盘页'],
      matchedAbilities: ['数据分析', '模型评测'],
    });
  }

  if (has('商业化理解', '增长产品', 'B 端产品')) {
    recommendations.push({
      title: 'AI 产品商业化一页纸',
      reason: `JD 提到 ${pickEvidence(keywords, ['商业化', '增长', 'B 端'])}，适合用轻量方案展示目标用户、付费理由、转化路径和试点计划。`,
      deliverables: ['目标用户画像', '价值主张画布', '试点转化路径'],
      matchedAbilities: ['商业化理解', '增长产品', 'B 端产品'],
    });
  }

  if (recommendations.length < 3) {
    recommendations.push({
      title: 'AI 产品需求分析练习',
      reason: '当 JD 能力信号不够集中时，先做一个小白友好的需求分析作品，证明你能把岗位要求拆成用户场景和产品方案。',
      deliverables: ['用户场景拆解', 'PRD 大纲', '低保真原型'],
      matchedAbilities: ['产品方法论', 'AI 应用设计'],
    });
  }

  return recommendations.slice(0, 4);
}

function buildMarketInsights(
  jobs: JobPosting[],
  abilities: AbilityRequirement[],
  keywords: KeywordStat[],
  averageSalaryK?: number,
): string[] {
  if (!jobs.length) return [];
  const topAbility = abilities[0];
  const topKeywordText = keywords.slice(0, 3).map((item) => item.keyword).join('、') || 'AI 产品基础能力';
  const aiKeywordCount = keywords.filter((item) => item.category === 'AI 应用').reduce((sum, item) => sum + item.count, 0);
  const productKeywordCount = keywords.filter((item) => item.category === '产品方法').reduce((sum, item) => sum + item.count, 0);

  return [
    `本批次 ${jobs.length} 个岗位最常出现的是 ${topKeywordText}，说明招聘方更看重能把 AI 能力落到具体产品链路的人。`,
    topAbility
      ? `${topAbility.name} 是最高频能力域，共出现 ${topAbility.count} 次，面试中大概率会追问相关项目细节。`
      : '岗位文本中 AI 专项能力表达较少，建议补充更完整的 JD 后再判断市场趋势。',
    aiKeywordCount >= productKeywordCount
      ? 'AI 专项词高于传统产品方法词，作品集需要展示模型能力理解、效果评估和异常兜底。'
      : '传统产品方法词仍然占比较高，需求分析、指标意识和跨团队推进仍是基础门槛。',
    averageSalaryK
      ? `可解析岗位的平均月薪中位数约为 ${averageSalaryK}K，薪资判断已排除面议或未识别岗位。`
      : '本批次薪资多为面议或未识别，建议补充带薪资区间的 JD 后再做薪资判断。',
  ];
}

function buildJobSearchAdvice(
  abilities: AbilityRequirement[],
  projects: ProjectRecommendation[],
  profile: CandidateProfile,
): string[] {
  const topAbilities = abilities.slice(0, 3).map((ability) => ability.name);
  const projectTitle = projects[0]?.title ?? 'AI 产品作品集项目';
  const domainText = profile.previousDomains.join(' / ') || '过往产品';
  const strengthText = profile.strengths.slice(0, 2).join('、') || '产品设计、数据分析';
  const techText = profile.familiarTech.slice(0, 2).join('、') || 'AI 产品基础能力';
  const projectName = profile.representativeProject || `${domainText}项目`;

  return [
    `简历开头建议写成“${profile.workExperience} ${domainText}经验，目标 ${profile.targetRole}，具备 ${strengthText} 基础，正在强化 ${topAbilities.join('、') || techText}”。`,
    `优先完成「${projectTitle}」，用 PRD、原型、指标和评测材料证明你能做 AI 产品，而不是只会描述概念。`,
    `面试准备围绕 ${topAbilities.join('、') || '需求分析、数据分析、AI 应用设计'} 展开，每个能力至少准备一个“场景-方案-指标-复盘”的回答。`,
    `把 ${projectName} 的经历迁移到 AI 语境：强调用户路径、异常处理、数据指标和 ${techText}，再补充 AI 化改造方案。`,
  ];
}

function pickEvidence(keywords: KeywordStat[], preferred: string[]): string {
  const matches = preferred.filter((item) => keywords.some((keyword) => keyword.keyword === item));
  return matches.length ? matches.join('、') : keywords.slice(0, 2).map((item) => item.keyword).join('、') || 'AI 产品能力';
}

function roundToOneDecimal(value: number): number {
  return Math.round(value * 10) / 10;
}

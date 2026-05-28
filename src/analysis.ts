import type {
  AbilityRequirement,
  AbilityAnalysisItem,
  AnalysisResult,
  CandidateProfile,
  InterviewFocusItem,
  JobPosting,
  KeywordStat,
  ProjectRecommendation,
  SalaryInfo,
} from './types';

export const defaultProfile: CandidateProfile = {
  workExperience: '1-3年',
  yearsExperience: 2,
  education: '本科',
  productExperience: '有',
  previousDomains: ['工具类', '出行 / 交通'],
  familiarTech: ['AI 大模型（LLM）', 'RAG / 知识库'],
  strengths: ['原型设计', '数据分析'],
  targetRole: 'AI 产品经理',
};

type KeywordRule = {
  keyword: string;
  aliases: string[];
  category: string;
  ability: string;
};

type ProjectCandidate = {
  title: string;
  format: 'buildable' | 'document';
  abilitySignals: string[];
  keywordSignals: string[];
  domainSignals?: string[];
  techSignals?: string[];
  strengthSignals?: string[];
  complexity: 1 | 2 | 3;
  profileReason: (context: ProjectReasonContext) => string;
  generalReason: (context: ProjectReasonContext) => string;
  deliverablesByComplexity: Record<1 | 2 | 3, string[]>;
  matchedAbilities: string[];
};

type ProjectReasonContext = {
  domainText: string;
  evidenceText: string;
  strengthText: string;
  techText: string;
  complexityText: string;
};

type ProfileProjectTier = {
  key: 'starter' | 'foundation' | 'business' | 'advanced';
  label: string;
  complexity: 1 | 2 | 3;
};

type ProfileProjectDirection =
  | 'knowledge'
  | 'agent'
  | 'evaluation'
  | 'commercialization'
  | 'assistant'
  | 'serviceQuality'
  | 'content'
  | 'screening'
  | 'tutoring'
  | 'operations'
  | 'portfolio';

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

const abilityImportance: Record<string, number> = {
  'RAG / 知识库': 0.96,
  'Prompt 工程': 0.94,
  'Agent 产品设计': 0.98,
  'AI 应用设计': 0.92,
  模型评测: 0.9,
  数据分析: 0.72,
  产品方法论: 0.68,
  项目推进: 0.66,
  商业化理解: 0.58,
  增长产品: 0.56,
  'B 端产品': 0.6,
  'C 端产品': 0.5,
};

const abilityProfileSignals: Record<string, {
  tech?: string[];
  strengths?: string[];
  domains?: string[];
  productExperienceBoost?: number;
}> = {
  'RAG / 知识库': {
    tech: ['RAG / 知识库', '搜索 / 召回', '自然语言处理', 'AI 大模型（LLM）'],
    strengths: ['需求分析', '产品设计'],
    domains: ['工具类', 'SaaS', '企业服务', '教育', '政企 / 行业解决方案'],
  },
  'Prompt 工程': {
    tech: ['Prompt 工程', 'Prompt 调优', 'AI 大模型（LLM）', '低代码 / 无代码'],
    strengths: ['产品设计', '需求分析', 'PRD 撰写'],
    domains: ['工具类', '内容 / 社区', '教育', '企业服务'],
  },
  'Agent 产品设计': {
    tech: ['Agent / 智能体', '工作流编排', 'API / OpenAPI', 'AI 大模型（LLM）'],
    strengths: ['产品设计', '项目管理', '跨部门沟通', '需求分析'],
    domains: ['工具类', 'SaaS', '企业服务', '数据平台', '开放平台'],
  },
  'AI 应用设计': {
    tech: ['AI 大模型（LLM）', '多模态', '低代码 / 无代码', '自然语言处理'],
    strengths: ['产品设计', '原型设计', '用户调研', 'C 端体验', 'B 端交付'],
    domains: ['工具类', '出行 / 交通', '生活服务', '内容 / 社区', '企业服务'],
  },
  模型评测: {
    tech: ['模型评测', '数据分析 / BI', 'A/B 测试', '埋点 / 指标体系', 'SQL'],
    strengths: ['数据分析', '指标体系'],
    domains: ['数据平台', '工具类', 'SaaS', '企业服务'],
  },
  数据分析: {
    tech: ['数据分析 / BI', 'A/B 测试', '埋点 / 指标体系', 'SQL'],
    strengths: ['数据分析', '指标体系', '增长 / 运营'],
    productExperienceBoost: 0.12,
  },
  产品方法论: {
    strengths: ['需求分析', '用户调研', '竞品分析', '产品设计', '原型设计', 'PRD 撰写'],
    productExperienceBoost: 0.3,
  },
  项目推进: {
    strengths: ['项目管理', '跨部门沟通', 'B 端交付'],
    productExperienceBoost: 0.24,
  },
  商业化理解: {
    strengths: ['商业化 / 盈利设计', '增长 / 运营', '竞品分析'],
    domains: ['SaaS', '企业服务', '电商', '金融', '广告 / 增长'],
    productExperienceBoost: 0.12,
  },
  增长产品: {
    tech: ['数据分析 / BI', 'A/B 测试'],
    strengths: ['增长 / 运营', '数据分析', '指标体系'],
    domains: ['广告 / 增长', '电商', '内容 / 社区', '生活服务'],
    productExperienceBoost: 0.1,
  },
  'B 端产品': {
    strengths: ['B 端交付', '项目管理', '跨部门沟通'],
    domains: ['SaaS', '企业服务', '金融', '数据平台', '政企 / 行业解决方案'],
    productExperienceBoost: 0.16,
  },
  'C 端产品': {
    strengths: ['C 端体验', '用户调研', '原型设计'],
    domains: ['出行 / 交通', '生活服务', '内容 / 社区', '电商', '游戏 / 娱乐'],
    productExperienceBoost: 0.16,
  },
};

function buildProfileProjectCandidates(
  abilities: AbilityRequirement[],
  keywords: KeywordStat[],
  profile: CandidateProfile,
): ProjectCandidate[] {
  const candidates: ProjectCandidate[] = [];
  const sceneText = getProfileSceneText(profile);
  const dominantFocus = getDominantAiFocus(abilities, keywords);
  const tier = getProfileProjectTier(profile);
  const tierTitle = (direction: ProfileProjectDirection) => buildProfileProjectTitle(direction, sceneText, dominantFocus, tier);

  candidates.push(
  {
    title: tierTitle('knowledge'),
    format: 'buildable',
    abilitySignals: ['RAG / 知识库', 'AI 应用设计', '模型评测'],
    keywordSignals: ['RAG', '问答', 'LLM', '模型评测'],
    domainSignals: ['工具类', '教育', 'SaaS', '企业服务', '出行 / 交通', '政企 / 行业解决方案'],
    techSignals: ['RAG / 知识库', 'AI 大模型（LLM）', '搜索 / 召回', '自然语言处理', '低代码 / 无代码', '模型评测'],
    strengthSignals: ['需求分析', '产品设计', '原型设计'],
    complexity: 2,
    matchedAbilities: ['RAG / 知识库', 'AI 应用设计', '模型评测'],
    profileReason: ({ domainText, evidenceText, techText, complexityText }) =>
      `JD 强调 ${evidenceText}，可把你的 ${domainText} 产品场景抽象成知识库问答链路；结合你熟悉的 ${techText}，推荐做成${complexityText}作品。`,
    generalReason: ({ evidenceText, complexityText }) =>
      `JD 强调 ${evidenceText}，该项目能直接展示问答链路、知识库组织和答案质量判断，适合作为${complexityText} AI 产品作品。`,
    deliverablesByComplexity: {
      1: ['可运行问答页面', '本地知识库数据', '问题输入与答案展示'],
      2: ['知识库上传 / 编辑入口', '问答链路 Demo', '答案引用来源与评分功能'],
      3: ['多知识库切换', '召回结果可视化', '答案溯源、评分与反馈闭环'],
    },
  },
  {
    title: tierTitle('agent'),
    format: 'buildable',
    abilitySignals: ['Agent 产品设计', 'Prompt 工程', '项目推进'],
    keywordSignals: ['Agent', 'Prompt', '工作流', 'LLM'],
    domainSignals: ['工具类', '企业服务', 'SaaS', '开放平台', '数据平台'],
    techSignals: ['Agent / 智能体', 'Prompt 工程', 'Prompt 调优', '工作流编排', 'API / OpenAPI', 'AI 大模型（LLM）'],
    strengthSignals: ['需求分析', '产品设计', '项目管理', '跨部门沟通'],
    complexity: 3,
    matchedAbilities: ['Agent 产品设计', 'Prompt 工程', '项目推进'],
    profileReason: ({ domainText, evidenceText, techText, complexityText }) =>
      `岗位出现 ${evidenceText}，适合结合你的 ${domainText} 背景设计任务拆解、工具调用和异常兜底；你熟悉的 ${techText} 可支撑一个${complexityText}方案。`,
    generalReason: ({ evidenceText, complexityText }) =>
      `岗位要求里有 ${evidenceText}，该项目能体现从 Prompt 到工作流的完整产品思考，但建议控制为${complexityText}范围，避免一开始做得过重。`,
    deliverablesByComplexity: {
      1: ['任务输入页面', '步骤拆解结果展示', 'Prompt 模板切换'],
      2: ['多步骤任务执行 Demo', '工具调用结果面板', '失败重试与兜底提示'],
      3: ['工作流编排画布', '工具调用日志', '人工接管与异常恢复机制'],
    },
  },
  {
    title: tierTitle('evaluation'),
    format: 'buildable',
    abilitySignals: ['数据分析', '模型评测', '产品方法论'],
    keywordSignals: ['数据分析', '模型评测', 'A/B 测试'],
    domainSignals: ['数据平台', '广告 / 增长', '电商', '内容 / 社区', '金融'],
    techSignals: ['模型评测', '数据分析 / BI', 'A/B 测试', '埋点 / 指标体系', 'SQL'],
    strengthSignals: ['数据分析', '指标体系', '增长 / 运营', 'PRD 撰写'],
    complexity: 2,
    matchedAbilities: ['数据分析', '模型评测', '产品方法论'],
    profileReason: ({ evidenceText, strengthText, complexityText }) =>
      `JD 中 ${evidenceText} 信号明显，而你的优势包含 ${strengthText}，适合用${complexityText}看板和评测体系证明你能判断 AI 功能效果。`,
    generalReason: ({ evidenceText, complexityText }) =>
      `岗位关注 ${evidenceText}，该项目实现门槛低、解释力强，适合用${complexityText}方式展示指标、样本、评分标准和复盘结论。`,
    deliverablesByComplexity: {
      1: ['评测任务录入页', '样本评分表单', '结果统计图表'],
      2: ['模型回答评测看板', '指标筛选与样本明细', '评分规则配置'],
      3: ['多模型对比看板', '批量评测流程', '准确率、幻觉率、满意度趋势分析'],
    },
  },
  {
    title: tierTitle('commercialization'),
    format: 'buildable',
    abilitySignals: ['商业化理解', '增长产品', 'AI 应用设计'],
    keywordSignals: ['商业化', '增长', 'LLM'],
    domainSignals: ['企业服务', 'SaaS', '金融', '电商', '广告 / 增长'],
    techSignals: ['AI 大模型（LLM）', '数据分析 / BI', '低代码 / 无代码'],
    strengthSignals: ['商业化 / 盈利设计', '增长 / 运营', 'B 端交付', '竞品分析'],
    complexity: 2,
    matchedAbilities: ['商业化理解', '增长产品', 'AI 应用设计'],
    profileReason: ({ domainText, evidenceText, complexityText }) =>
      `岗位关注 ${evidenceText}，可结合你的 ${domainText} 经历做一个可交互的试点转化模拟器，推荐做成${complexityText}作品。`,
    generalReason: ({ evidenceText, complexityText }) =>
      `JD 提到 ${evidenceText}，该项目适合用${complexityText}方式展示 AI 产品的用户价值、转化路径和商业判断。`,
    deliverablesByComplexity: {
      1: ['客户价值选择器', '转化路径页面', '试点收益结果'],
      2: ['客户分层配置', '价格与转化模拟', '试点 ROI 看板'],
      3: ['售前漏斗模拟', '客户成功续费看板', '多方案收益对比'],
    },
  },
  {
    title: tierTitle('assistant'),
    format: 'buildable',
    abilitySignals: ['AI 应用设计', 'C 端产品', '数据分析'],
    keywordSignals: ['LLM', '问答', 'C 端', '数据分析'],
    domainSignals: ['出行 / 交通', '生活服务', '工具类', '本地生活'],
    techSignals: ['AI 大模型（LLM）', '多模态', '数据分析 / BI', '低代码 / 无代码'],
    strengthSignals: ['C 端体验', '原型设计', '用户调研', '数据分析'],
    complexity: 2,
    matchedAbilities: ['AI 应用设计', 'C 端产品', '数据分析'],
    profileReason: ({ evidenceText, complexityText }) =>
      `可把过往产品中的用户路径改造成 AI 出行助手；岗位中的 ${evidenceText} 能通过路线解释、异常提醒和问答交互体现，推荐做成${complexityText} Demo。`,
    generalReason: ({ evidenceText, complexityText }) =>
      `JD 出现 ${evidenceText}，适合用${complexityText}方式做一个面向 C 端场景的 AI 助手。`,
    deliverablesByComplexity: {
      1: ['出行问题输入页', 'AI 建议结果卡片', '异常提醒样例'],
      2: ['路线问答 Demo', '公交异常解释', '用户反馈入口'],
      3: ['多场景出行助手', '实时状态模拟', '个性化建议与反馈看板'],
    },
  },
  {
    title: tierTitle('serviceQuality'),
    format: 'buildable',
    abilitySignals: ['AI 应用设计', '模型评测', 'B 端产品'],
    keywordSignals: ['问答', '模型评测', 'B 端', 'LLM'],
    domainSignals: ['企业服务', 'SaaS', '生活服务', '电商', '金融'],
    techSignals: ['AI 大模型（LLM）', '自然语言处理', '模型评测', '数据分析 / BI'],
    strengthSignals: ['B 端交付', '数据分析', '项目管理'],
    complexity: 3,
    matchedAbilities: ['AI 应用设计', '模型评测', 'B 端产品'],
    profileReason: ({ domainText, evidenceText, complexityText }) =>
      `结合 ${domainText} 业务经验，可以做客服会话质检和答案评分工具；岗位中的 ${evidenceText} 可转化为质检规则和评测结果，适合${complexityText}作品。`,
    generalReason: ({ evidenceText, complexityText }) =>
      `岗位强调 ${evidenceText}，该项目适合展示 B 端 AI 应用和质量评估，复杂度为${complexityText}。`,
    deliverablesByComplexity: {
      1: ['会话样本列表', 'AI 质检结果', '问题标签筛选'],
      2: ['质检规则配置', '批量评分看板', '高风险会话明细'],
      3: ['多规则质检工作台', '人工复核流程', '质检趋势与改进建议'],
    },
  },
  {
    title: tierTitle('content'),
    format: 'buildable',
    abilitySignals: ['AI 应用设计', '多模态', '模型评测'],
    keywordSignals: ['多模态', 'LLM', '模型评测'],
    domainSignals: ['内容 / 社区', '游戏 / 娱乐', '教育', '医疗健康'],
    techSignals: ['多模态', '自然语言处理', '计算机视觉', 'AI 大模型（LLM）', '模型评测'],
    strengthSignals: ['用户调研', '产品设计', 'C 端体验'],
    complexity: 2,
    matchedAbilities: ['AI 应用设计', '模型评测'],
    profileReason: ({ domainText, evidenceText, complexityText }) =>
      `如果你的过往经历偏 ${domainText}，可用 ${evidenceText} 做内容识别、标签推荐和审核结果解释，推荐做成${complexityText} Demo。`,
    generalReason: ({ evidenceText, complexityText }) =>
      `JD 提到 ${evidenceText}，该项目适合展示 AI 识别、分类和结果解释，推荐${complexityText}实现。`,
    deliverablesByComplexity: {
      1: ['内容输入页', '标签推荐结果', '审核状态展示'],
      2: ['批量内容列表', '标签置信度', '人工修正入口'],
      3: ['多模态审核台', '风险规则配置', '审核质量评测看板'],
    },
  },
  {
    title: tierTitle('screening'),
    format: 'buildable',
    abilitySignals: ['RAG / 知识库', 'AI 应用设计', '模型评测'],
    keywordSignals: ['RAG', 'LLM', '模型评测', '问答'],
    domainSignals: ['企业服务', 'SaaS', '教育', '其他'],
    techSignals: ['RAG / 知识库', 'AI 大模型（LLM）', '自然语言处理', '模型评测'],
    strengthSignals: ['需求分析', '数据分析', 'B 端交付'],
    complexity: 2,
    matchedAbilities: ['RAG / 知识库', 'AI 应用设计', '模型评测'],
    profileReason: ({ evidenceText, complexityText }) =>
      `岗位中的 ${evidenceText} 可落到简历解析、岗位匹配和筛选解释，适合用${complexityText}方式展示 AI 产品判断。`,
    generalReason: ({ evidenceText, complexityText }) =>
      `JD 强调 ${evidenceText}，可做招聘筛选助手来展示 AI 信息抽取和匹配解释，推荐${complexityText}实现。`,
    deliverablesByComplexity: {
      1: ['简历文本输入', '岗位要求输入', '匹配结果卡片'],
      2: ['简历解析字段', '岗位匹配评分', '筛选理由解释'],
      3: ['批量候选人列表', '多岗位匹配', '筛选规则与偏差复核'],
    },
  },
  {
    title: tierTitle('tutoring'),
    format: 'buildable',
    abilitySignals: ['RAG / 知识库', 'Prompt 工程', 'AI 应用设计'],
    keywordSignals: ['RAG', 'Prompt', '问答', 'LLM'],
    domainSignals: ['教育', '内容 / 社区', '工具类'],
    techSignals: ['RAG / 知识库', 'Prompt 工程', 'Prompt 调优', 'AI 大模型（LLM）'],
    strengthSignals: ['用户调研', '产品设计', '需求分析'],
    complexity: 2,
    matchedAbilities: ['RAG / 知识库', 'Prompt 工程', 'AI 应用设计'],
    profileReason: ({ domainText, evidenceText, complexityText }) =>
      `如果画像里的过往产品接近 ${domainText}，可把 ${evidenceText} 转成课程资料问答、追问引导和答案评估，适合${complexityText}作品。`,
    generalReason: ({ evidenceText, complexityText }) =>
      `JD 出现 ${evidenceText}，教学答疑是适合展示知识库问答和 Prompt 约束的${complexityText}项目。`,
    deliverablesByComplexity: {
      1: ['课程资料问答页', '追问建议', '答案来源展示'],
      2: ['知识点目录', '分步骤讲解', '答案满意度反馈'],
      3: ['学习路径推荐', '错题知识库', '答疑质量评测面板'],
    },
  },
  {
    title: tierTitle('operations'),
    format: 'buildable',
    abilitySignals: ['Prompt 工程', '增长产品', 'AI 应用设计'],
    keywordSignals: ['Prompt', '增长', 'LLM'],
    domainSignals: ['电商', '内容 / 社区', '广告 / 增长', '生活服务'],
    techSignals: ['Prompt 工程', 'AI 大模型（LLM）', '数据分析 / BI'],
    strengthSignals: ['增长 / 运营', '商业化 / 盈利设计', '竞品分析', '产品设计'],
    complexity: 1,
    matchedAbilities: ['Prompt 工程', '增长产品', 'AI 应用设计'],
    profileReason: ({ evidenceText, complexityText }) =>
      `当 JD 关注 ${evidenceText}，可做运营活动生成器来展示 Prompt 约束、目标人群和转化目标，适合${complexityText}作品。`,
    generalReason: ({ evidenceText, complexityText }) =>
      `岗位提到 ${evidenceText}，这个项目能快速展示 AI 生成和增长思路，推荐${complexityText}实现。`,
    deliverablesByComplexity: {
      1: ['活动目标输入', '文案生成结果', '人群标签选择'],
      2: ['多版本文案生成', '渠道与预算配置', '转化指标预估'],
      3: ['活动策略工作台', 'A/B 文案对比', '投放复盘看板'],
    },
  },
  {
    title: tierTitle('portfolio'),
    format: 'document',
    abilitySignals: ['产品方法论', 'AI 应用设计', '数据分析'],
    keywordSignals: ['需求分析', 'LLM', '数据分析'],
    domainSignals: ['工具类', '内容 / 社区', '生活服务', '出行 / 交通', '教育', '其他'],
    techSignals: ['低代码 / 无代码', 'AI 大模型（LLM）'],
    strengthSignals: ['PRD 撰写', '原型设计', '需求分析'],
    complexity: 1,
    matchedAbilities: ['产品方法论', 'AI 应用设计'],
    profileReason: ({ domainText, strengthText, complexityText }) =>
      `当用户暂时没有产品经验时，可围绕 ${domainText} 方向和 ${strengthText} 整理成可展示的转型作品集，适合${complexityText}起步。`,
    generalReason: ({ complexityText }) =>
      `岗位 AI 信号不集中时，可先用${complexityText}方式完成作品集站点，证明基础产品表达。`,
    deliverablesByComplexity: {
      1: ['作品集首页', '项目案例页', '能力标签展示'],
      2: ['案例筛选', '项目复盘页', '求职定位说明'],
      3: ['多项目作品集', '能力矩阵', '面试问答素材库'],
    },
  },
  );

  return candidates.map((candidate) => adaptProfileCandidateToTier(candidate, tier, profile));
}

function buildGeneralProjectCandidates(
  abilities: AbilityRequirement[],
  keywords: KeywordStat[],
): ProjectCandidate[] {
  const candidates: ProjectCandidate[] = [];
  const dominantFocus = getDominantAiFocus(abilities, keywords);

  candidates.push(
  {
    title: `${dominantFocus}企业知识库问答 Demo`,
    format: 'buildable',
    abilitySignals: ['RAG / 知识库', 'AI 应用设计', '模型评测'],
    keywordSignals: ['RAG', '问答', 'LLM', '模型评测'],
    complexity: 2,
    matchedAbilities: ['RAG / 知识库', 'AI 应用设计', '模型评测'],
    profileReason: ({ evidenceText, complexityText }) =>
      `JD 强调 ${evidenceText}，适合做企业资料问答 Demo，复杂度为${complexityText}。`,
    generalReason: ({ evidenceText, complexityText }) =>
      `JD 强调 ${evidenceText}，该项目可直接展示知识库检索、问答和答案质量判断，适合作为${complexityText}通用作品。`,
    deliverablesByComplexity: {
      1: ['资料问答页面', '示例知识库', '答案展示区'],
      2: ['文档上传入口', '引用来源展示', '答案评分功能'],
      3: ['多知识库管理', '召回结果解释', '反馈驱动优化看板'],
    },
  },
  {
    title: 'Prompt 调试工作台',
    format: 'buildable',
    abilitySignals: ['Prompt 工程', 'AI 应用设计', '模型评测'],
    keywordSignals: ['Prompt', 'LLM', '模型评测'],
    complexity: 1,
    matchedAbilities: ['Prompt 工程', 'AI 应用设计', '模型评测'],
    profileReason: ({ evidenceText, complexityText }) =>
      `岗位出现 ${evidenceText}，Prompt 调试工作台适合${complexityText}实现。`,
    generalReason: ({ evidenceText, complexityText }) =>
      `岗位出现 ${evidenceText}，该项目能展示提示词版本、输出对比和评分规则，适合${complexityText}作品。`,
    deliverablesByComplexity: {
      1: ['Prompt 输入区', '输出结果对比', '版本保存'],
      2: ['多 Prompt 对比', '变量模板配置', '人工评分面板'],
      3: ['批量测试集', '评分维度配置', 'Prompt 迭代趋势'],
    },
  },
  {
    title: 'Agent 工作流执行器',
    format: 'buildable',
    abilitySignals: ['Agent 产品设计', 'Prompt 工程', '项目推进'],
    keywordSignals: ['Agent', '工作流', 'Prompt', 'LLM'],
    complexity: 3,
    matchedAbilities: ['Agent 产品设计', 'Prompt 工程', '项目推进'],
    profileReason: ({ evidenceText, complexityText }) =>
      `JD 有 ${evidenceText}，可做 Agent 工作流执行器，复杂度为${complexityText}。`,
    generalReason: ({ evidenceText, complexityText }) =>
      `JD 有 ${evidenceText}，该项目能展示任务拆解、步骤执行和异常兜底，适合${complexityText}作品。`,
    deliverablesByComplexity: {
      1: ['任务输入', '步骤拆解展示', '执行状态'],
      2: ['多步骤执行链路', '工具结果面板', '失败重试'],
      3: ['流程节点编排', '工具权限配置', '人工接管机制'],
    },
  },
  {
    title: `${dominantFocus}回答质量评测平台`,
    format: 'buildable',
    abilitySignals: ['模型评测', '数据分析', 'AI 应用设计'],
    keywordSignals: ['模型评测', '数据分析', 'A/B 测试', 'LLM'],
    complexity: 2,
    matchedAbilities: ['模型评测', '数据分析', 'AI 应用设计'],
    profileReason: ({ evidenceText, complexityText }) =>
      `JD 关注 ${evidenceText}，可做回答质量评测平台，适合${complexityText}实现。`,
    generalReason: ({ evidenceText, complexityText }) =>
      `岗位关注 ${evidenceText}，该项目能展示样本、评分标准和结果分析，适合作为${complexityText}作品。`,
    deliverablesByComplexity: {
      1: ['样本录入', '人工评分表单', '评分统计'],
      2: ['评测任务管理', '多维评分', '结果看板'],
      3: ['多模型对比', '批量评测', '质量趋势和问题归因'],
    },
  },
  {
    title: 'AI 客服对话模拟器',
    format: 'buildable',
    abilitySignals: ['AI 应用设计', 'Prompt 工程', '模型评测'],
    keywordSignals: ['问答', 'Prompt', 'LLM', '模型评测'],
    complexity: 2,
    matchedAbilities: ['AI 应用设计', 'Prompt 工程', '模型评测'],
    profileReason: ({ evidenceText, complexityText }) =>
      `岗位强调 ${evidenceText}，客服对话模拟器适合做${complexityText}作品。`,
    generalReason: ({ evidenceText, complexityText }) =>
      `岗位强调 ${evidenceText}，该项目能展示对话体验、兜底回复和满意度反馈，适合${complexityText}实现。`,
    deliverablesByComplexity: {
      1: ['用户问题输入', '客服回复展示', '满意度按钮'],
      2: ['多轮对话', '问题分类', '兜底策略配置'],
      3: ['会话质检', '知识命中分析', '满意度趋势看板'],
    },
  },
  {
    title: 'AI 文档总结与结构化工具',
    format: 'buildable',
    abilitySignals: ['AI 应用设计', 'Prompt 工程', '数据分析'],
    keywordSignals: ['LLM', 'Prompt', '数据分析'],
    complexity: 1,
    matchedAbilities: ['AI 应用设计', 'Prompt 工程'],
    profileReason: ({ evidenceText, complexityText }) =>
      `岗位提到 ${evidenceText}，文档总结工具适合${complexityText}起步。`,
    generalReason: ({ evidenceText, complexityText }) =>
      `JD 提到 ${evidenceText}，该项目能展示信息抽取、摘要和结构化输出，适合${complexityText}实现。`,
    deliverablesByComplexity: {
      1: ['文本粘贴区', '摘要结果', '结构化字段'],
      2: ['多模板摘要', '字段编辑', '结果导出'],
      3: ['批量文档处理', '模板管理', '结构化结果统计'],
    },
  },
  {
    title: 'AI 销售线索评分工具',
    format: 'buildable',
    abilitySignals: ['商业化理解', 'B 端产品', 'AI 应用设计'],
    keywordSignals: ['商业化', 'B 端', 'LLM', '数据分析'],
    complexity: 2,
    matchedAbilities: ['商业化理解', 'B 端产品', 'AI 应用设计'],
    profileReason: ({ evidenceText, complexityText }) =>
      `岗位有 ${evidenceText}，销售线索评分工具适合${complexityText}展示。`,
    generalReason: ({ evidenceText, complexityText }) =>
      `岗位有 ${evidenceText}，该项目能展示客户分层、线索评分和转化建议，适合${complexityText}作品。`,
    deliverablesByComplexity: {
      1: ['线索录入', '评分结果', '转化建议'],
      2: ['评分规则配置', '线索列表', '优先级看板'],
      3: ['客户分层模型', '转化漏斗', '销售动作推荐'],
    },
  },
  {
    title: 'AI 增长实验看板',
    format: 'buildable',
    abilitySignals: ['增长产品', '数据分析', 'AI 应用设计'],
    keywordSignals: ['增长', 'A/B 测试', '数据分析', 'LLM'],
    complexity: 2,
    matchedAbilities: ['增长产品', '数据分析', 'AI 应用设计'],
    profileReason: ({ evidenceText, complexityText }) =>
      `岗位关注 ${evidenceText}，增长实验看板适合${complexityText}实现。`,
    generalReason: ({ evidenceText, complexityText }) =>
      `岗位关注 ${evidenceText}，该项目能展示实验设计、指标追踪和 AI 优化建议，适合${complexityText}作品。`,
    deliverablesByComplexity: {
      1: ['实验列表', '核心指标卡片', '结论输入'],
      2: ['A/B 实验配置', '转化漏斗', 'AI 复盘建议'],
      3: ['多实验对比', '人群分层', '增长策略推荐'],
    },
  },
  {
    title: 'AI 多模态内容理解 Demo',
    format: 'buildable',
    abilitySignals: ['AI 应用设计', '模型评测'],
    keywordSignals: ['多模态', 'LLM', '模型评测'],
    complexity: 3,
    matchedAbilities: ['AI 应用设计', '模型评测'],
    profileReason: ({ evidenceText, complexityText }) =>
      `JD 提到 ${evidenceText}，多模态理解 Demo 适合${complexityText}展示。`,
    generalReason: ({ evidenceText, complexityText }) =>
      `JD 提到 ${evidenceText}，该项目能展示图片/文本理解、标签和结果评估，适合${complexityText}作品。`,
    deliverablesByComplexity: {
      1: ['图片上传', '识别结果', '标签展示'],
      2: ['图文输入', '结构化理解', '人工修正'],
      3: ['批量多模态样本', '识别质量评测', '风险标签看板'],
    },
  },
  {
    title: 'AI 产品需求分析与原型练习',
    format: 'document',
    abilitySignals: ['商业化理解', '增长产品', 'B 端产品'],
    keywordSignals: ['商业化', '增长', 'B 端'],
    domainSignals: ['企业服务', 'SaaS', '金融', '电商', '广告 / 增长'],
    techSignals: ['AI 大模型（LLM）', '数据分析 / BI', '低代码 / 无代码'],
    strengthSignals: ['商业化 / 盈利设计', '增长 / 运营', 'B 端交付', '竞品分析'],
    complexity: 1,
    matchedAbilities: ['商业化理解', '增长产品', 'B 端产品'],
    profileReason: ({ domainText, evidenceText, complexityText }) =>
      `岗位关注 ${evidenceText}，可结合你的 ${domainText} 经历说明目标客户、付费理由和试点路径，推荐先做${complexityText}商业化方案。`,
    generalReason: ({ evidenceText, complexityText }) =>
      `JD 提到 ${evidenceText}，该项目不依赖代码，更适合用${complexityText}方式展示用户价值、转化路径和商业判断。`,
    deliverablesByComplexity: {
      1: ['目标用户画像', '价值主张画布', '试点转化路径'],
      2: ['目标客户与付费场景', '后台权限原型', '定价与试点转化方案'],
      3: ['客户分层策略', '定价与交付模型', '售前、试点、续费全链路方案'],
    },
  },
  {
    title: 'AI 产品需求分析与原型练习',
    format: 'document',
    abilitySignals: ['产品方法论', 'AI 应用设计', 'C 端产品'],
    keywordSignals: ['需求分析', 'LLM', 'C 端', '多模态'],
    domainSignals: ['工具类', '内容 / 社区', '生活服务', '出行 / 交通', '教育', '医疗健康'],
    techSignals: ['AI 大模型（LLM）', '多模态', '低代码 / 无代码'],
    strengthSignals: ['需求分析', '用户调研', '产品设计', '原型设计', 'PRD 撰写', 'C 端体验'],
    complexity: 1,
    matchedAbilities: ['产品方法论', 'AI 应用设计'],
    profileReason: ({ domainText, strengthText, complexityText }) =>
      `结合你的 ${domainText} 经历和 ${strengthText} 优势，可整理 AI 产品方案，推荐先做${complexityText}原型作品。`,
    generalReason: ({ evidenceText, complexityText }) =>
      `当 JD 更强调 ${evidenceText} 等基础产品能力时，该项目最容易起步，适合用${complexityText}方式证明你能拆场景、写方案、做原型。`,
    deliverablesByComplexity: {
      1: ['用户场景拆解', 'PRD 大纲', '低保真原型'],
      2: ['用户旅程图', 'AI 功能 PRD', '关键页面原型和指标假设'],
      3: ['端到端产品方案', '多角色流程和异常状态', '上线指标、实验和迭代计划'],
    },
  },
  );

  return candidates;
}

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

  const abilityAnalysis = buildAbilityAnalysis(abilityRequirements, topKeywords, profile);
  const interviewFocus = buildInterviewFocus(abilityAnalysis, abilityRequirements, topKeywords, profile);
  const profileBasedProjectRecommendations = recommendProfileBasedProjects(abilityRequirements, topKeywords, profile);
  const generalProjectRecommendations = recommendGeneralProjects(abilityRequirements, topKeywords, profile);

  return {
    jobCount: jobs.length,
    averageSalaryK,
    parsedSalaryCount: salaryValues.length,
    topKeywords,
    abilityRequirements,
    abilityAnalysis,
    interviewFocus,
    profileBasedProjectRecommendations,
    generalProjectRecommendations,
    marketInsights: buildMarketInsights(jobs, abilityRequirements, topKeywords, averageSalaryK),
    jobSearchAdvice: buildJobSearchAdvice(
      abilityRequirements,
      profileBasedProjectRecommendations,
      generalProjectRecommendations,
      profile,
    ),
    jobs,
  };
}

function splitJobDescriptions(input: string): string[] {
  const normalized = input.replace(/\r/g, '').trim();
  if (!normalized) return [];

  const explicitTitleCount = normalized.match(/(?:^|\n)\s*(?:岗位名称|职位名称|岗位|职位)[:：]/g)?.length ?? 0;
  if (explicitTitleCount > 1) {
    return normalized
      .split(/\n(?=\s*(?:岗位名称|职位名称|岗位|职位)[:：])/g)
      .map((block) => block.trim())
      .filter((block) => block.length > 24);
  }

  const blocks = normalized
    .split(/\n{2,}/g)
    .map((block) => block.trim())
    .filter((block) => block.length > 24);

  if (blocks.length <= 1) return [normalized];

  const completeJobBlocks = blocks.filter(isLikelyCompleteJobBlock);
  return completeJobBlocks.length >= 2 ? completeJobBlocks : [normalized];
}

function isLikelyCompleteJobBlock(block: string): boolean {
  const hasTitle = /(?:^|\n)\s*(?:岗位名称|职位名称|岗位|职位)[:：]/.test(block);
  const hasSalary = /(?:薪资|薪酬|待遇)[:：\s]*|[0-9]{1,3}\s*[-~—到]\s*[0-9]{1,3}\s*[kK千]|面议/.test(block);
  const hasDescription = /(岗位职责|职位描述|工作职责|岗位要求|任职要求|工作内容|职位要求)/.test(block);

  return hasTitle || (hasSalary && hasDescription);
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

function buildAbilityAnalysis(
  abilities: AbilityRequirement[],
  keywords: KeywordStat[],
  profile: CandidateProfile,
): AbilityAnalysisItem[] {
  if (!abilities.length) return [];

  const maxCount = Math.max(...abilities.map((ability) => ability.count), 1);

  return abilities
    .map((ability) => {
      const profileFit = getAbilityProfileFit(ability.name, profile);
      const jdStrength = ability.count / maxCount;
      const importance = abilityImportance[ability.name] ?? 0.52;
      const gapLevel = 1 - profileFit.score;
      const score = jdStrength * 0.45 + importance * 0.3 + gapLevel * 0.25;
      const status = getAbilityStatus(profileFit.score, ability.name, profile);
      const priority = getPriority(score);

      return {
        name: ability.name,
        status,
        priority,
        score,
        reason: buildAbilityAnalysisReason(ability, status, profileFit.matchedSignals, profile),
        actions: buildAbilityActions(ability.name, status, profile),
        evidence: ability.evidence,
      };
    })
    .sort((a, b) => {
      const statusRank = statusWeight(b.status) - statusWeight(a.status);
      if (statusRank) return statusRank;
      return b.score - a.score;
    })
    .slice(0, 6);
}

function getAbilityProfileFit(abilityName: string, profile: CandidateProfile): { score: number; matchedSignals: string[] } {
  const signals = abilityProfileSignals[abilityName] ?? {};
  const matchedSignals: string[] = [];
  let score = 0;

  const techMatches = matchSignals(signals.tech ?? [], profile.familiarTech);
  const strengthMatches = matchSignals(signals.strengths ?? [], profile.strengths);
  const domainMatches = matchSignals(signals.domains ?? [], profile.previousDomains);

  if (techMatches.length) {
    score += Math.min(techMatches.length * 0.22, 0.44);
    matchedSignals.push(...techMatches);
  }
  if (strengthMatches.length) {
    score += Math.min(strengthMatches.length * 0.18, 0.36);
    matchedSignals.push(...strengthMatches);
  }
  if (domainMatches.length) {
    score += Math.min(domainMatches.length * 0.12, 0.24);
    matchedSignals.push(...domainMatches);
  }
  if (profile.productExperience === '有') {
    score += signals.productExperienceBoost ?? 0.08;
    if (signals.productExperienceBoost) matchedSignals.push('产品经验');
  }

  score += getExperienceMaturityBoost(profile.workExperience, abilityName);
  return { score: Math.min(score, 1), matchedSignals: Array.from(new Set(matchedSignals)).slice(0, 4) };
}

function matchSignals(signals: string[], selected: string[]): string[] {
  return signals.filter((signal) => selected.includes(signal));
}

function getExperienceMaturityBoost(workExperience: string, abilityName: string): number {
  if (workExperience === '3-5年') return isAiAbility(abilityName) ? 0.06 : 0.14;
  if (workExperience === '1-3年') return isAiAbility(abilityName) ? 0.03 : 0.08;
  if (workExperience === '1年以内') return 0.03;
  return 0;
}

function getAbilityStatus(score: number, abilityName: string, profile: CandidateProfile): AbilityAnalysisItem['status'] {
  if (score >= 0.62) return '优势能力';
  if (!isAiAbility(abilityName) && profile.productExperience === '有' && score >= 0.34) return '可迁移能力';
  if (score >= 0.38) return '可迁移能力';
  return '重点补齐';
}

function getPriority(score: number): AbilityAnalysisItem['priority'] {
  if (score >= 0.72) return '高';
  if (score >= 0.48) return '中';
  return '低';
}

function statusWeight(status: AbilityAnalysisItem['status']): number {
  if (status === '重点补齐') return 3;
  if (status === '可迁移能力') return 2;
  return 1;
}

function buildAbilityAnalysisReason(
  ability: AbilityRequirement,
  status: AbilityAnalysisItem['status'],
  matchedSignals: string[],
  profile: CandidateProfile,
): string {
  const evidenceText = ability.evidence.join('、') || ability.name;
  const signalText = matchedSignals.length ? matchedSignals.join('、') : '当前画像中直接对应的信息较少';
  if (status === '优势能力') {
    return `JD 中 ${evidenceText} 出现 ${ability.count} 次，你的画像里已有 ${signalText}，可以在简历和面试中作为主要匹配点展开。`;
  }
  if (status === '可迁移能力') {
    return `JD 中 ${evidenceText} 出现 ${ability.count} 次，虽然画像未完全覆盖该能力，但可以从 ${signalText} 迁移到 ${ability.name} 场景。`;
  }
  const profileText = `${profile.workExperience}、${profile.productExperience === '有' ? '有产品经验' : '暂无产品经验'}`;
  return `JD 中 ${evidenceText} 出现 ${ability.count} 次，但画像里的直接证据较弱；结合你当前 ${profileText}，建议优先补齐可展示案例。`;
}

function buildAbilityActions(
  abilityName: string,
  status: AbilityAnalysisItem['status'],
  profile: CandidateProfile,
): string[] {
  const baseActions: Record<string, string[]> = {
    'RAG / 知识库': ['补一遍文档切分、Embedding、召回、重排、生成、溯源链路', '准备一个知识库问答案例，说明如何判断答案质量'],
    'Prompt 工程': ['整理 3 类 Prompt 模板：角色、约束、示例和输出格式', '准备一次 Prompt 失效排查过程'],
    'Agent 产品设计': ['梳理任务拆解、工具调用、失败兜底和人工接管流程', '准备 Agent 与普通 Chatbot 的区别回答'],
    'AI 应用设计': ['选择一个真实业务场景，说明用户问题、AI 能力边界和体验闭环', '补充成本、延迟、准确率和异常状态判断'],
    模型评测: ['准备测试集、准确率、幻觉率、满意度等评测口径', '说明如何用指标推动模型和产品迭代'],
    数据分析: ['把过往指标经验迁移到 AI 功能效果评估', '准备一个上线后看板和复盘案例'],
    产品方法论: ['用一个 JD 场景写出需求拆解、PRD 大纲和原型重点', '强调优先级判断和边界处理'],
    项目推进: ['准备跨部门协作案例，突出研发、算法、运营之间的推进方式', '说明如何控制排期、风险和上线验收'],
  };
  const fallback = ['准备一个“场景-方案-指标-复盘”的回答', '把画像里的相关经历改写成 AI 产品语境'];
  const actions = baseActions[abilityName] ?? fallback;
  if (status === '优势能力') return actions.map((item) => item.replace('补一遍', '强化表达'));
  if (profile.productExperience === '无') return [...actions.slice(0, 1), '先用轻量 Demo 或练习项目补充证明材料'];
  return actions;
}

function buildInterviewFocus(
  abilityAnalysis: AbilityAnalysisItem[],
  abilities: AbilityRequirement[],
  keywords: KeywordStat[],
  profile: CandidateProfile,
): InterviewFocusItem[] {
  if (!abilityAnalysis.length) return [];

  const topGaps = abilityAnalysis.filter((item) => item.status === '重点补齐').slice(0, 2);
  const topAbilities = abilityAnalysis.slice(0, 3);
  const topKeywords = keywords.slice(0, 3).map((item) => item.keyword).join('、') || 'AI 产品能力';
  const domainText = profile.previousDomains.slice(0, 2).join(' / ') || '过往产品';
  const strengthText = profile.strengths.slice(0, 2).join('、') || '产品基础能力';

  const questionAbility = topAbilities[0]?.name ?? abilities[0]?.name ?? 'AI 应用设计';
  const items: InterviewFocusItem[] = [
    {
      title: `${questionAbility} 必备问题`,
      category: '必备问题',
      priority: topAbilities[0]?.priority ?? '高',
      detail: buildInterviewQuestionDetail(questionAbility, topKeywords),
      talkingPoints: getQuestionTalkingPoints(questionAbility),
    },
    {
      title: `${domainText} 经验迁移讲法`,
      category: '案例包装',
      priority: '高',
      detail: `把 ${domainText} 经历包装成 AI 产品案例时，重点连接 JD 高频方向 ${topKeywords}，不要只讲传统功能设计。`,
      talkingPoints: [
        `先讲原业务里的用户路径和核心痛点`,
        `再讲如果 AI 化，会如何设计输入、输出、兜底和反馈`,
        `最后用 ${strengthText} 证明你能推进落地`,
      ],
    },
  ];

  topGaps.forEach((gap) => {
    items.push({
      title: `${gap.name} 短板补救`,
      category: '短板补救',
      priority: gap.priority,
      detail: `这项能力在 JD 中较关键，但画像证据不足。面试时建议主动承认正在补齐，并用具体 Demo、学习路径或评测样本证明进展。`,
      talkingPoints: gap.actions,
    });
  });

  const lessonAbility = topGaps[0]?.name ?? topAbilities.find((item) => isAiAbility(item.name))?.name ?? questionAbility;
  items.push({
    title: `${lessonAbility} 临时补课清单`,
    category: '临时补课',
    priority: '中',
    detail: `面试前优先补 ${lessonAbility}，因为它和本批 JD 的 ${topKeywords} 联系最紧。`,
    talkingPoints: getLessonTalkingPoints(lessonAbility),
  });

  return items.slice(0, 5);
}

function buildInterviewQuestionDetail(abilityName: string, topKeywords: string): string {
  if (abilityName === 'RAG / 知识库') return `围绕 ${topKeywords} 准备：如何设计知识库问答链路，如何处理召回不准、答案无来源和内容更新。`;
  if (abilityName === 'Prompt 工程') return `围绕 ${topKeywords} 准备：Prompt 输出不稳定时如何定位问题，如何设计模板、变量和评测样本。`;
  if (abilityName === 'Agent 产品设计') return `围绕 ${topKeywords} 准备：Agent 和普通 Chatbot 的区别，任务拆解、工具调用、异常兜底怎么设计。`;
  if (abilityName === '模型评测') return `围绕 ${topKeywords} 准备：如何定义测试集、准确率、幻觉率、满意度，并把评测结果转成迭代动作。`;
  return `围绕 ${topKeywords} 准备一个“场景-方案-指标-复盘”的完整回答，重点说明你如何把 AI 能力变成可用产品。`;
}

function getQuestionTalkingPoints(abilityName: string): string[] {
  const map: Record<string, string[]> = {
    'RAG / 知识库': ['文档切分与知识更新', '召回、重排、生成和溯源', '准确率、无答案率和用户反馈'],
    'Prompt 工程': ['角色设定、上下文和输出约束', 'Few-shot 示例和边界条件', '用样本集评估稳定性'],
    'Agent 产品设计': ['任务拆解和工具选择', '执行过程可见和失败重试', '人工接管和权限边界'],
    模型评测: ['测试集构建', '人工评分标准', '准确率、幻觉率、满意度趋势'],
  };
  return map[abilityName] ?? ['用户场景', '产品链路', '指标和复盘'];
}

function getLessonTalkingPoints(abilityName: string): string[] {
  const map: Record<string, string[]> = {
    'RAG / 知识库': ['看懂：切分、Embedding、向量库、召回、重排、溯源', '动手：做一个 20 条资料的问答 Demo', '复盘：记录 5 个答错样本和优化动作'],
    'Prompt 工程': ['整理 5 个常用 Prompt 模板', '对同一任务做 3 版输出对比', '记录失败案例和约束优化方式'],
    'Agent 产品设计': ['画出任务拆解流程图', '列出工具调用、失败重试、人工接管规则', '做一个轻量工作流 Demo'],
    模型评测: ['准备 20 条测试样本', '定义准确率、幻觉率、满意度评分', '做一个人工评测表和结论页'],
  };
  return map[abilityName] ?? ['补基础概念', '做轻量 Demo', '准备面试表达稿'];
}

function recommendProfileBasedProjects(
  abilities: AbilityRequirement[],
  keywords: KeywordStat[],
  profile: CandidateProfile,
): ProjectRecommendation[] {
  const domainText = profile.previousDomains.join(' / ') || '过往产品';
  const strengthText = profile.strengths.slice(0, 2).join('、') || '产品设计、数据分析';
  const techText = profile.familiarTech.slice(0, 2).join('、') || 'AI 产品基础能力';
  const jdSignals = filterJdSignalsForProfile(abilities, keywords, profile);
  const generatedCandidates = buildProfileProjectCandidates(jdSignals.abilities, jdSignals.keywords, profile);
  const candidates = filterProjectCandidatesForProfile(generatedCandidates, profile);
  const tier = getProfileProjectTier(profile);
  const scoredCandidates = candidates.map((candidate) => ({
    candidate,
    jdScore: scoreJdMatch(candidate, jdSignals.abilities, jdSignals.keywords),
  }));
  const maxJdScore = Math.max(...scoredCandidates.map((item) => item.jdScore), 0);

  return scoredCandidates
    .map(({ candidate, jdScore }) => {
      const jdPriorityScore = maxJdScore ? jdScore / maxJdScore : 0;
      const domainScore = ratioMatched(candidate.domainSignals ?? [], profile.previousDomains);
      const techScore = ratioMatched(candidate.techSignals ?? [], profile.familiarTech);
      const strengthScore = ratioMatched(candidate.strengthSignals ?? [], profile.strengths);
      const feasibilityScore = candidate.format === 'buildable' ? 1 : profile.productExperience === '有' ? 0 : 0.6;
      const totalScore = jdPriorityScore * 0.55 + domainScore * 0.2 + techScore * 0.12 + strengthScore * 0.08 + feasibilityScore * 0.05;
      const evidenceText = pickEvidence(jdSignals.keywords, candidate.keywordSignals);
      const reason = candidate.profileReason({
        domainText,
        evidenceText,
        strengthText,
        techText,
        complexityText: getProfileProjectTier(profile).label,
      });

      return {
        totalScore,
        jdScore,
        recommendation: {
          title: candidate.title,
          level: tier.label,
          reason: appendProfileRecommendationReason(reason, jdScore, domainScore, techScore),
          deliverables: candidate.deliverablesByComplexity[candidate.complexity],
          matchedAbilities: pickMatchedAbilities(candidate, jdSignals.abilities),
        },
      };
    })
    .sort((a, b) => b.totalScore - a.totalScore || b.jdScore - a.jdScore)
    .map((item) => item.recommendation)
    .slice(0, 3);
}

function recommendGeneralProjects(
  abilities: AbilityRequirement[],
  keywords: KeywordStat[],
  profile: CandidateProfile,
): ProjectRecommendation[] {
  const preferredComplexity = getPreferredComplexity(profile);
  const jdSignals = filterJdSignalsForProfile(abilities, keywords, profile);
  const generatedCandidates = buildGeneralProjectCandidates(jdSignals.abilities, jdSignals.keywords);
  const candidates = filterProjectCandidatesForProfile(generatedCandidates, profile);
  const scoredCandidates = candidates.map((candidate) => ({
    candidate,
    jdScore: scoreJdMatch(candidate, jdSignals.abilities, jdSignals.keywords),
  }));
  const maxJdScore = Math.max(...scoredCandidates.map((item) => item.jdScore), 0);

  return scoredCandidates
    .map(({ candidate, jdScore }) => {
      const jdPriorityScore = maxJdScore ? jdScore / maxJdScore : 0;
      const difficultyScore = scoreDifficultyFit(candidate.complexity, preferredComplexity);
      const totalScore = jdPriorityScore * 0.8 + difficultyScore * 0.2;
      const complexity = clampComplexity(Math.round((candidate.complexity + preferredComplexity) / 2));
      const evidenceText = pickEvidence(jdSignals.keywords, candidate.keywordSignals);
      const reason = candidate.generalReason({
        domainText: '岗位场景',
        evidenceText,
        strengthText: '产品基础能力',
        techText: 'AI 产品基础能力',
        complexityText: getComplexityText(complexity),
      });

      return {
        totalScore,
        jdScore,
        recommendation: {
          title: candidate.title,
          level: getComplexityText(complexity),
          reason: appendGeneralScoreReason(reason, jdScore, difficultyScore),
          deliverables: candidate.deliverablesByComplexity[complexity],
          matchedAbilities: pickMatchedAbilities(candidate, jdSignals.abilities),
        },
      };
    })
    .sort((a, b) => b.totalScore - a.totalScore || b.jdScore - a.jdScore)
    .map((item) => item.recommendation)
    .slice(0, 3);
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

function scoreJdMatch(candidate: ProjectCandidate, abilities: AbilityRequirement[], keywords: KeywordStat[]): number {
  const maxAbilityCount = Math.max(...abilities.map((ability) => ability.count), 1);
  const abilityScore = candidate.abilitySignals.reduce((sum, signal) => {
    const ability = abilities.find((item) => item.name === signal);
    return sum + (ability ? ability.count / maxAbilityCount : 0);
  }, 0);

  const maxKeywordCount = Math.max(...keywords.map((keyword) => keyword.count), 1);
  const keywordScore = candidate.keywordSignals.reduce((sum, signal) => {
    const keyword = keywords.find((item) => item.keyword === signal);
    return sum + (keyword ? keyword.count / maxKeywordCount : 0);
  }, 0);

  return normalizeScore(abilityScore * 0.65 + keywordScore * 0.35, 3);
}

function filterJdSignalsForProfile(
  abilities: AbilityRequirement[],
  keywords: KeywordStat[],
  profile: CandidateProfile,
): { abilities: AbilityRequirement[]; keywords: KeywordStat[] } {
  if (profile.productExperience !== '有') {
    return { abilities, keywords };
  }

  return {
    abilities: abilities.filter((ability) => isAiAbility(ability.name)),
    keywords: keywords.filter((keyword) => keyword.category === 'AI 应用' || keyword.category === '场景' || keyword.category === '质量'),
  };
}

function filterProjectCandidatesForProfile(candidates: ProjectCandidate[], profile: CandidateProfile): ProjectCandidate[] {
  if (profile.productExperience === '有') {
    return candidates.filter((candidate) => candidate.format === 'buildable');
  }

  return candidates;
}

function getProfileSceneText(profile: CandidateProfile): string {
  const preferredScenes: Record<string, string> = {
    '出行 / 交通': '出行',
    '工具类': '效率工具',
    '内容 / 社区': '内容社区',
    电商: '电商',
    金融: '金融服务',
    生活服务: '生活服务',
    教育: '教学',
    SaaS: '企业服务',
    企业服务: '企业服务',
    本地生活: '本地生活',
    医疗健康: '健康服务',
    '游戏 / 娱乐': '内容娱乐',
    '广告 / 增长': '增长运营',
    数据平台: '数据平台',
    开放平台: '开放平台',
    '硬件 / IoT': '智能硬件',
    '政企 / 行业解决方案': '政企服务',
    其他: '业务',
  };

  const scene = profile.previousDomains.find((domain) => preferredScenes[domain]);
  return scene ? preferredScenes[scene] : '业务';
}

function getProfileProjectTier(profile: CandidateProfile): ProfileProjectTier {
  if (profile.workExperience === '实习生' || profile.workExperience === '应届生') {
    return { key: 'starter', label: '入门 Demo', complexity: 1 };
  }

  if (profile.workExperience === '1年以内') {
    return { key: 'foundation', label: '基础项目', complexity: 1 };
  }

  if (profile.workExperience === '3-5年') {
    return { key: 'advanced', label: '进阶项目', complexity: 3 };
  }

  return { key: 'business', label: '业务型项目', complexity: 2 };
}

function buildProfileProjectTitle(
  direction: ProfileProjectDirection,
  sceneText: string,
  dominantFocus: string,
  tier: ProfileProjectTier,
): string {
  const titles: Record<ProfileProjectDirection, Record<ProfileProjectTier['key'], string>> = {
    knowledge: {
      starter: `${sceneText}问题问答 Demo`,
      foundation: `${sceneText}知识库助手`,
      business: `${sceneText}问答与反馈平台`,
      advanced: `${sceneText}知识运营与答案质量平台`,
    },
    agent: {
      starter: `${sceneText}任务助手 Demo`,
      foundation: `${sceneText} AI 任务助手`,
      business: `${sceneText} AI Agent 工作流`,
      advanced: `${sceneText}智能任务编排与运营平台`,
    },
    evaluation: {
      starter: `${dominantFocus}回答评分 Demo`,
      foundation: `${dominantFocus}效果评测工具`,
      business: `${dominantFocus}质量评测看板`,
      advanced: `${dominantFocus}质量治理与评测平台`,
    },
    commercialization: {
      starter: `${sceneText} AI 价值展示 Demo`,
      foundation: `${sceneText} AI 试点模拟器`,
      business: `${sceneText} AI 转化与试点看板`,
      advanced: `${sceneText} AI 商业化运营平台`,
    },
    assistant: {
      starter: `${sceneText} AI 助手 Demo`,
      foundation: `${sceneText} AI 服务助手`,
      business: `${sceneText} AI 服务与反馈平台`,
      advanced: `${sceneText} AI 服务运营平台`,
    },
    serviceQuality: {
      starter: `${sceneText}客服回复评分 Demo`,
      foundation: `${sceneText} AI 客服质检工具`,
      business: `${sceneText} AI 客服质检工作台`,
      advanced: `${sceneText} AI 服务质量治理平台`,
    },
    content: {
      starter: `${sceneText}内容标签 Demo`,
      foundation: `${sceneText} AI 标签助手`,
      business: `${sceneText} AI 内容审核工作台`,
      advanced: `${sceneText} AI 内容治理平台`,
    },
    screening: {
      starter: `${dominantFocus}信息筛选 Demo`,
      foundation: `${dominantFocus}简历筛选助手`,
      business: `${dominantFocus}招聘匹配工作台`,
      advanced: `${dominantFocus}人才匹配评测平台`,
    },
    tutoring: {
      starter: `${sceneText}答疑 Demo`,
      foundation: `${sceneText} AI 答疑助手`,
      business: `${sceneText}答疑与学习反馈平台`,
      advanced: `${sceneText}知识服务运营平台`,
    },
    operations: {
      starter: `${sceneText}内容生成 Demo`,
      foundation: `${sceneText} AI 运营助手`,
      business: `${sceneText} AI 活动生成与复盘工具`,
      advanced: `${sceneText} AI 运营策略平台`,
    },
    portfolio: {
      starter: 'AI 产品转型展示 Demo',
      foundation: 'AI 产品转型案例站点',
      business: 'AI 产品作品集与能力看板',
      advanced: 'AI 产品案例管理平台',
    },
  };

  return titles[direction][tier.key];
}

function adaptProfileCandidateToTier(
  candidate: ProjectCandidate,
  tier: ProfileProjectTier,
  profile: CandidateProfile,
): ProjectCandidate {
  const baseDeliverables = candidate.deliverablesByComplexity[tier.complexity];
  const enhancedDeliverables = applyProfileEnhancements(baseDeliverables, profile, tier);

  return {
    ...candidate,
    complexity: tier.complexity,
    deliverablesByComplexity: {
      1: enhancedDeliverables,
      2: enhancedDeliverables,
      3: enhancedDeliverables,
    },
  };
}

function applyProfileEnhancements(
  baseDeliverables: string[],
  profile: CandidateProfile,
  tier: ProfileProjectTier,
): string[] {
  const deliverables = [...baseDeliverables];
  const enhancement =
    profile.familiarTech.includes('RAG / 知识库') ? '答案引用来源与知识命中展示'
      : profile.familiarTech.includes('Agent / 智能体') || profile.familiarTech.includes('工作流编排') ? '任务步骤与工具调用状态'
        : profile.familiarTech.includes('多模态') ? '图文输入与识别结果展示'
          : profile.strengths.includes('模型评测') ? '答案评分与问题样本复核'
            : profile.strengths.includes('数据分析') || profile.strengths.includes('指标体系') ? '反馈数据与效果指标视图'
              : undefined;

  if (enhancement && tier.key !== 'starter') {
    deliverables[deliverables.length - 1] = enhancement;
  }

  return deliverables;
}

function getDominantAiFocus(abilities: AbilityRequirement[], keywords: KeywordStat[]): string {
  const topAbility = abilities.find((ability) => isAiAbility(ability.name))?.name;
  if (topAbility === 'RAG / 知识库') return '知识库';
  if (topAbility === 'Prompt 工程') return 'Prompt ';
  if (topAbility === 'Agent 产品设计') return 'Agent ';
  if (topAbility === '模型评测') return '模型';

  const topKeyword = keywords.find((keyword) => ['RAG', 'Prompt', 'Agent', '多模态', 'LLM'].includes(keyword.keyword))?.keyword;
  if (topKeyword === 'RAG') return '知识库';
  if (topKeyword === 'LLM') return '大模型';
  return topKeyword ? `${topKeyword} ` : 'AI ';
}

function isAiAbility(abilityName: string): boolean {
  return ['RAG / 知识库', 'Prompt 工程', 'Agent 产品设计', 'AI 应用设计', '模型评测'].includes(abilityName);
}

function scoreDifficultyFit(projectComplexity: 1 | 2 | 3, preferredComplexity: 1 | 2 | 3): number {
  const gap = Math.abs(projectComplexity - preferredComplexity);
  if (gap === 0) return 1;
  if (gap === 1) return 0.68;
  return 0.32;
}

function getPreferredComplexity(profile: CandidateProfile): 1 | 2 | 3 {
  if (profile.workExperience === '实习生' || profile.workExperience === '应届生' || profile.workExperience === '1年以内') return 1;
  if (profile.workExperience === '3-5年') return 3;
  return 2;
}

function ratioMatched(signals: string[], selected: string[]): number {
  if (!signals.length || !selected.length) return 0;
  const matched = signals.filter((signal) => selected.includes(signal)).length;
  return Math.min(matched / Math.min(signals.length, 3), 1);
}

function normalizeScore(value: number, maxValue: number): number {
  return Math.min(value / maxValue, 1);
}

function clampComplexity(value: number): 1 | 2 | 3 {
  if (value <= 1) return 1;
  if (value >= 3) return 3;
  return 2;
}

function getComplexityText(complexity: 1 | 2 | 3): string {
  if (complexity === 1) return '轻量级';
  if (complexity === 2) return '中等复杂度';
  return '进阶型';
}

function pickMatchedAbilities(candidate: ProjectCandidate, abilities: AbilityRequirement[]): string[] {
  const abilityNames = abilities.map((ability) => ability.name);
  const matched = candidate.matchedAbilities.filter((ability) => abilityNames.includes(ability));
  return matched.length ? matched : candidate.matchedAbilities.slice(0, 3);
}

function appendProfileRecommendationReason(reason: string, jdScore: number, domainScore: number, techScore: number): string {
  return `${reason} 当前层级内排序主要参考 JD 匹配度 ${toPercent(jdScore)}、产品场景匹配 ${toPercent(domainScore)} 和技术增强匹配 ${toPercent(techScore)}。`;
}

function appendGeneralScoreReason(reason: string, jdScore: number, difficultyScore: number): string {
  return `${reason} 排序主要依据 JD 匹配度 ${toPercent(jdScore)} 和小白实现难易度 ${toPercent(difficultyScore)}。`;
}

function toPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

function buildJobSearchAdvice(
  abilities: AbilityRequirement[],
  _profileProjects: ProjectRecommendation[],
  _generalProjects: ProjectRecommendation[],
  profile: CandidateProfile,
): string[] {
  const topAbilities = abilities.slice(0, 3).map((ability) => ability.name);
  const domainText = profile.previousDomains.join(' / ') || '过往产品';
  const strengthText = profile.strengths.slice(0, 2).join('、') || '产品设计、数据分析';
  const techText = profile.familiarTech.slice(0, 2).join('、') || 'AI 产品基础能力';

  return [
    `简历开头建议写成“${profile.workExperience} ${domainText}经验，目标 ${profile.targetRole}，具备 ${strengthText} 基础，正在强化 ${topAbilities.join('、') || techText}”。`,
    `作品集准备建议围绕 ${topAbilities.join('、') || 'AI 应用设计'} 选 1 个可运行 Demo，重点展示问题定义、核心流程、质量判断和可复盘指标。`,
    `面试准备围绕 ${topAbilities.join('、') || '需求分析、数据分析、AI 应用设计'} 展开，每个能力至少准备一个“场景-方案-指标-复盘”的回答。`,
    `把 ${domainText} 的过往产品经历迁移到 AI 语境：强调用户路径、异常处理、数据指标和 ${techText}，再补充 AI 化改造方案。`,
  ];
}

function pickEvidence(keywords: KeywordStat[], preferred: string[]): string {
  const matches = preferred.filter((item) => keywords.some((keyword) => keyword.keyword === item));
  return matches.length ? matches.join('、') : keywords.slice(0, 2).map((item) => item.keyword).join('、') || 'AI 产品能力';
}

function roundToOneDecimal(value: number): number {
  return Math.round(value * 10) / 10;
}

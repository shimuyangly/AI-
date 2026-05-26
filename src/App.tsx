import { useMemo, useState } from 'react';
import {
  BarChart3,
  Bot,
  BriefcaseBusiness,
  CheckCircle2,
  ClipboardList,
  FileText,
  Gauge,
  Lightbulb,
  LineChart,
  PenLine,
  Search,
  Sparkles,
  Target,
  UserRound,
} from 'lucide-react';
import { analyzeJobDescriptions, defaultProfile } from './analysis';
import type { AbilityRequirement, AnalysisResult, KeywordStat, ProjectRecommendation } from './types';

const sampleInput = `岗位名称：AI 数据产品经理
薪资：20-30K
工作职责：
负责 AI 产品数据看板、埋点方案、A/B 测试和模型效果评估，分析用户转化和留存。
任职要求：
具备需求分析、竞品分析、跨部门协同能力，对增长、商业化和模型评测有理解。

岗位名称：AI 产品经理
薪资：25-40K·14薪
岗位职责：
1. 负责大模型问答产品设计，建设企业知识库 RAG 检索增强链路。
2. 设计 Prompt 策略、答案溯源、模型评测指标和用户反馈闭环。
3. 与算法、研发、运营协作，推动 AI 功能从原型到上线。
岗位要求：
熟悉 LLM、Prompt 工程、知识库问答和数据分析，有 PRD、原型和项目推进经验。`;

const tabs = ['关键词', '能力要求', '项目推荐', '市场洞察', '求职建议'];

function App() {
  const [input, setInput] = useState('');
  const [submittedText, setSubmittedText] = useState('');
  const [error, setError] = useState('');

  const result = useMemo<AnalysisResult | null>(() => {
    if (!submittedText.trim()) return null;
    return analyzeJobDescriptions(submittedText);
  }, [submittedText]);

  const handleAnalyze = () => {
    if (!input.trim()) {
      setError('请先粘贴至少一条 AI 产品经理岗位详情。');
      setSubmittedText('');
      return;
    }
    setError('');
    setSubmittedText(input);
  };

  const handleUseSample = () => {
    setInput(sampleInput);
    setError('');
    setSubmittedText(sampleInput);
  };

  const averageSalary = result?.averageSalaryK ? `${result.averageSalaryK}K` : '待识别';
  const topMatch = result?.abilityRequirements[0]?.count
    ? Math.min(96, 58 + result.abilityRequirements[0].count * 5)
    : 72;

  return (
    <main className="app-shell">
      <HeaderSection />
      <InputPanel
        error={error}
        input={input}
        onAnalyze={handleAnalyze}
        onInputChange={setInput}
        onUseSample={handleUseSample}
        compact={Boolean(result)}
      />

      {result ? (
        <>
          <section className="metric-grid" aria-label="数据概览">
            <MetricCard icon={<BriefcaseBusiness size={22} />} label="岗位数量" value={`${result.jobCount}`} note="已分析" />
            <MetricCard icon={<LineChart size={22} />} label="平均薪资" value={averageSalary} note={`${result.parsedSalaryCount} 个岗位可解析`} />
            <MetricCard
              icon={<Gauge size={22} />}
              label="用户画像匹配度"
              value={`${topMatch}%`}
              note="较高匹配，适合转型 AI PM"
              showRing
            />
          </section>

          <nav className="analysis-tabs" aria-label="分析模块导航">
            {tabs.map((tab, index) => (
              <span className={index === 0 ? 'active' : ''} key={tab}>
                {tab}
              </span>
            ))}
          </nav>

          <section className="dashboard-grid">
            <KeywordCard keywords={result.topKeywords} />
            <AbilityCard abilities={result.abilityRequirements} />
            <ProjectCard title="基于原产品项目推荐" subtitle="与岗位能力精准相关" projects={result.profileBasedProjectRecommendations} />
            <ProjectCard title="综合项目推荐" subtitle="小白友好，进阶挑战" projects={result.generalProjectRecommendations} />
            <ListCard icon={<Lightbulb size={18} />} title="市场洞察" items={result.marketInsights} />
            <ListCard icon={<Target size={18} />} title="求职建议" items={result.jobSearchAdvice} />
          </section>
        </>
      ) : (
        <EmptyState />
      )}

      <footer className="app-footer">
        <span>内容由 AI 生成，仅供参考</span>
        <span>有反馈？告诉我们</span>
      </footer>
    </main>
  );
}

function HeaderSection() {
  return (
    <section className="hero-panel">
      <div className="brand-block">
        <div className="brand-row">
          <span className="brand-mark">
            <Bot size={22} />
          </span>
          <h1>AI求职助手</h1>
          <span className="brand-subtitle">AI 产品经理转型分析</span>
        </div>
        <p className="hero-copy">
          粘贴真实岗位 JD，快速看清市场在招聘什么能力，并得到适合 2 年传统产品经理转型 AI PM 的项目建议。
        </p>
      </div>
      <ProfileCard />
    </section>
  );
}

function ProfileCard() {
  return (
    <aside className="profile-card" aria-label="默认用户画像">
      <div className="profile-card__title">
        <UserRound size={17} />
        默认用户画像
      </div>
      <dl>
        <div>
          <dt>经验</dt>
          <dd>{defaultProfile.yearsExperience} 年传统 PM</dd>
        </div>
        <div>
          <dt>背景</dt>
          <dd>{defaultProfile.previousDomains.join(' / ')}</dd>
        </div>
        <div>
          <dt>代表项目</dt>
          <dd>{defaultProfile.representativeProject}</dd>
        </div>
      </dl>
      <button className="link-button" type="button">
        编辑画像
        <span aria-hidden>›</span>
      </button>
    </aside>
  );
}

function InputPanel({
  compact,
  error,
  input,
  onAnalyze,
  onInputChange,
  onUseSample,
}: {
  compact: boolean;
  error: string;
  input: string;
  onAnalyze: () => void;
  onInputChange: (value: string) => void;
  onUseSample: () => void;
}) {
  return (
    <section className={`input-card ${compact ? 'input-card--compact' : ''}`}>
      <div className="section-heading">
        <div>
          <p className="eyebrow">
            <FileText size={14} />
            岗位详情输入区
          </p>
          <h2>粘贴 BOSS 直聘等平台的岗位正文</h2>
        </div>
        <button className="ghost-button" type="button" onClick={onUseSample}>
          <ClipboardList size={15} />
          使用示例
        </button>
      </div>
      <textarea
        value={input}
        onChange={(event) => onInputChange(event.target.value)}
        placeholder="请粘贴岗位名称、薪资、岗位职责、岗位要求等正文内容。&#10;支持一次粘贴多个岗位。"
        aria-label="岗位详情正文"
      />
      <div className="input-actions">
        <p className={error ? 'error-text' : 'hint-text'}>{error || 'MVP 仅分析岗位正文，不读取招聘链接。'}</p>
        <button className="primary-button" type="button" onClick={onAnalyze}>
          <Search size={16} />
          {compact ? '重新分析' : '开始分析'}
        </button>
      </div>
    </section>
  );
}

function MetricCard({
  icon,
  label,
  note,
  showRing,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  note: string;
  showRing?: boolean;
  value: string;
}) {
  return (
    <article className="metric-card">
      <div className="metric-icon">{icon}</div>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
        <span>{note}</span>
      </div>
      {showRing ? <span className="metric-ring" aria-hidden /> : null}
    </article>
  );
}

function KeywordCard({ keywords }: { keywords: KeywordStat[] }) {
  const max = Math.max(...keywords.map((item) => item.count), 1);

  return (
    <article className="card equal-height-card">
      <CardTitle icon={<BarChart3 size={18} />} title="Top 关键词" />
      {keywords.length ? (
        <div className="keyword-list scrollable-card-body">
          {keywords.map((item) => (
            <div className="keyword-row" key={item.keyword}>
              <div className="keyword-meta">
                <span>{item.keyword}</span>
                <em>{item.count} 次</em>
              </div>
              <div className="bar-track">
                <div className="bar-fill" style={{ width: `${Math.max((item.count / max) * 100, 8)}%` }} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyCardText text="暂未识别到 AI 产品关键词，请补充更完整的岗位职责或要求。" />
      )}
    </article>
  );
}

function AbilityCard({ abilities }: { abilities: AbilityRequirement[] }) {
  return (
    <article className="card equal-height-card">
      <CardTitle icon={<CheckCircle2 size={18} />} title="候选人核心能力要求" />
      {abilities.length ? (
        <div className="ability-list scrollable-card-body">
          {abilities.slice(0, 6).map((ability) => (
            <div className="ability-item" key={ability.name}>
              <div className="ability-head">
                <h3>{ability.name}</h3>
                <span>匹配度高</span>
              </div>
              <div className="star-row" aria-label="能力重要度">
                <span>★★★★</span>
                <em>★</em>
              </div>
              <p>{ability.description}</p>
            </div>
          ))}
        </div>
      ) : (
        <EmptyCardText text="当前文本更像普通产品岗位，建议补充 AI 相关职责后再分析。" />
      )}
    </article>
  );
}

function ProjectCard({
  projects,
  subtitle,
  title,
}: {
  projects: ProjectRecommendation[];
  subtitle: string;
  title: string;
}) {
  return (
    <article className="card equal-height-card">
      <CardTitle icon={<Sparkles size={18} />} title={title} />
      <div className="project-tabs">
        <span className="active">{subtitle}</span>
        <span>{title.includes('综合') ? '进阶挑战' : '跨领域推荐'}</span>
      </div>
      <div className="project-list scrollable-card-body">
        {projects.map((project) => (
          <section className="project-item" key={project.title}>
            <h3>{project.title}</h3>
            <div className="tag-row">
              {project.matchedAbilities.slice(0, 3).map((ability) => (
                <span key={ability}>{ability}</span>
              ))}
            </div>
            <p>{project.reason}</p>
            <ul>
              {project.deliverables.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </article>
  );
}

function ListCard({ icon, title, items }: { icon: React.ReactNode; title: string; items: string[] }) {
  return (
    <article className="card list-card">
      <CardTitle icon={icon} title={title} />
      <ul className="check-list">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </article>
  );
}

function EmptyState() {
  const steps = [
    { icon: <FileText size={18} />, label: '1. 粘贴 JD' },
    { icon: <Bot size={18} />, label: '2. AI 分析' },
    { icon: <BarChart3 size={18} />, label: '3. 生成报告' },
    { icon: <PenLine size={18} />, label: '4. 查看建议' },
  ];

  return (
    <section className="empty-state">
      <div className="empty-illustration" aria-hidden>
        <FileText size={58} />
        <span />
      </div>
      <h2>等待岗位内容</h2>
      <p>粘贴 JD 后，系统会生成关键词、能力要求、市场洞察、项目推荐和求职建议。</p>
      <div className="empty-steps" aria-label="分析流程">
        {steps.map((step, index) => (
          <div className="empty-step" key={step.label}>
            <span>{step.icon}</span>
            <p>{step.label}</p>
            {index < steps.length - 1 ? <i aria-hidden /> : null}
          </div>
        ))}
      </div>
    </section>
  );
}

function CardTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="card-title">
      {icon}
      <h2>{title}</h2>
    </div>
  );
}

function EmptyCardText({ text }: { text: string }) {
  return <p className="empty-card-text">{text}</p>;
}

export default App;

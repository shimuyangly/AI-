import { useMemo, useState } from 'react';
import {
  BarChart3,
  BriefcaseBusiness,
  CheckCircle2,
  ClipboardList,
  Lightbulb,
  LineChart,
  Search,
  Sparkles,
  Target,
  UserRound,
} from 'lucide-react';
import { analyzeJobDescriptions, defaultProfile } from './analysis';
import type { AbilityRequirement, AnalysisResult, KeywordStat, ProjectRecommendation } from './types';

const sampleInput = `岗位名称：AI 产品经理
薪资：25-40K·14薪
岗位职责：
1. 负责大模型问答产品设计，建设企业知识库 RAG 检索增强链路。
2. 设计 Prompt 策略、答案溯源、模型评测指标和用户反馈闭环。
3. 与算法、研发、运营协作，推动 AI 功能从原型到上线。
岗位要求：
熟悉 LLM、Prompt 工程、知识库问答和数据分析，有 PRD、原型和项目推进经验。

职位名称：AI 数据产品经理
薪资：20-30K
工作职责：
负责 AI 产品数据看板、埋点方案、A/B 测试和模型效果评估，分析用户转化和留存。
任职要求：
具备需求分析、竞品分析、跨部门协同能力，对增长、商业化和模型评测有理解。`;

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

  return (
    <main className="app-shell">
      <section className="hero-panel">
        <div>
          <p className="eyebrow">AI 产品经理转型分析</p>
          <h1>AI求职助手</h1>
          <p className="hero-copy">
            粘贴真实岗位 JD，快速看清市场在招聘什么能力，并得到适合 2 年传统产品经理转型 AI PM 的项目建议。
          </p>
        </div>
        <div className="profile-card" aria-label="默认用户画像">
          <div className="profile-card__title">
            <UserRound size={18} />
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
        </div>
      </section>

      <section className="input-card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">岗位详情输入区</p>
            <h2>粘贴 BOSS 直聘等平台的岗位正文</h2>
          </div>
          <button className="ghost-button" type="button" onClick={handleUseSample}>
            <ClipboardList size={16} />
            使用示例
          </button>
        </div>
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="请粘贴岗位名称、薪资、岗位职责、岗位要求等正文内容。支持一次粘贴多个岗位。"
          aria-label="岗位详情正文"
        />
        <div className="input-actions">
          <p className={error ? 'error-text' : 'hint-text'}>{error || 'MVP 仅分析岗位正文，不读取招聘链接。'}</p>
          <button className="primary-button" type="button" onClick={handleAnalyze}>
            <Search size={17} />
            开始分析
          </button>
        </div>
      </section>

      {result ? (
        <>
          <section className="metric-grid" aria-label="数据概览">
            <MetricCard icon={<BriefcaseBusiness size={20} />} label="岗位数量" value={`${result.jobCount}`} note="已拆分解析" />
            <MetricCard icon={<LineChart size={20} />} label="平均薪资" value={averageSalary} note={`${result.parsedSalaryCount} 个岗位可解析`} />
            <MetricCard icon={<UserRound size={20} />} label="用户画像" value="2 年 PM" note="工具 / 出行背景" />
          </section>

          <section className="dashboard-grid">
            <KeywordCard keywords={result.topKeywords} />
            <AbilityCard abilities={result.abilityRequirements} />
            <ProjectCard title="基于原产品项目推荐" projects={result.profileBasedProjectRecommendations} />
            <ProjectCard title="综合项目推荐" projects={result.generalProjectRecommendations} />
            <ListCard
              className="insight-card"
              icon={<Lightbulb size={20} />}
              title="市场洞察"
              items={result.marketInsights}
            />
            <ListCard
              className="advice-card"
              icon={<Target size={20} />}
              title="求职建议"
              items={result.jobSearchAdvice}
            />
          </section>
        </>
      ) : (
        <section className="empty-state">
          <ClipboardList size={34} />
          <h2>等待岗位内容</h2>
          <p>粘贴 JD 后，系统会生成关键词、能力要求、市场洞察、项目推荐和求职建议。</p>
        </section>
      )}
    </main>
  );
}

function MetricCard({ icon, label, value, note }: { icon: React.ReactNode; label: string; value: string; note: string }) {
  return (
    <article className="metric-card">
      <div className="metric-icon">{icon}</div>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
        <span>{note}</span>
      </div>
    </article>
  );
}

function KeywordCard({ keywords }: { keywords: KeywordStat[] }) {
  const max = Math.max(...keywords.map((item) => item.count), 1);

  return (
    <article className="card equal-height-card">
      <CardTitle icon={<BarChart3 size={20} />} title="Top 关键词" />
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
      <CardTitle icon={<CheckCircle2 size={20} />} title="候选人能力要求" />
      {abilities.length ? (
        <div className="ability-list scrollable-card-body">
          {abilities.slice(0, 6).map((ability) => (
            <div className="ability-item" key={ability.name}>
              <div className="ability-head">
                <h3>{ability.name}</h3>
                <span>{ability.count} 次</span>
              </div>
              <p>{ability.description}</p>
              <div className="tag-row">
                {ability.evidence.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyCardText text="当前文本更像普通产品岗位，建议补充 AI 相关职责后再分析。" />
      )}
    </article>
  );
}

function ProjectCard({ title, projects }: { title: string; projects: ProjectRecommendation[] }) {
  return (
    <article className="card equal-height-card">
      <CardTitle icon={<Sparkles size={20} />} title={title} />
      <div className="project-list scrollable-card-body">
        {projects.map((project) => (
          <section className="project-item" key={project.title}>
            <h3>{project.title}</h3>
            <p>{project.reason}</p>
            <div className="tag-row">
              {project.matchedAbilities.map((ability) => (
                <span key={ability}>{ability}</span>
              ))}
            </div>
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

function ListCard({
  className,
  icon,
  title,
  items,
}: {
  className?: string;
  icon: React.ReactNode;
  title: string;
  items: string[];
}) {
  return (
    <article className={`card ${className ?? ''}`}>
      <CardTitle icon={icon} title={title} />
      <ol className="number-list">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ol>
    </article>
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

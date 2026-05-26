import { useEffect, useMemo, useRef, useState } from 'react';
import {
  BarChart3,
  Bot,
  BriefcaseBusiness,
  CheckCircle2,
  ClipboardList,
  Cpu,
  FileText,
  Gauge,
  Lightbulb,
  LineChart,
  PenLine,
  Search,
  Sparkles,
  Target,
  UserRound,
  X,
} from 'lucide-react';
import { analyzeJobDescriptions, defaultProfile } from './analysis';
import type { AbilityRequirement, AnalysisResult, CandidateProfile, KeywordStat, ProjectRecommendation } from './types';

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

const tabs = [
  { label: 'Top关键词', targetId: 'top-keywords' },
  { label: '能力要求', targetId: 'core-abilities' },
  { label: '项目推荐', targetId: 'profile-projects' },
  { label: '市场洞察', targetId: 'market-insights' },
  { label: '求职建议', targetId: 'job-advice' },
];

const tabTargetIds = tabs.map((tab) => tab.targetId);

const profileOptions = {
  workExperience: ['应届/实习', '1年以内', '1-3年', '3-5年', '5年以上'],
  aiExperience: ['无经验', '有相关经验'],
  previousDomains: ['工具类产品', '内容 / 社区', '电商 / 交易', '生活服务', '企业服务 / SaaS', '教育 / 其他'],
  familiarTech: ['AI 大模型（LLM）', 'RAG / 知识库', 'Agent / 智能体', '数据分析 / BI', '推荐算法', '计算机视觉', '自然语言处理'],
  strengths: ['需求分析', '产品设计', '原型设计', '项目管理', '数据分析', '增长 / 运营', '商业化 / 盈利设计'],
  targetRole: ['AI 产品经理', '产品经理（AI 方向）', '产品经理', '其他'],
};

function yearsFromWorkExperience(workExperience: string): number {
  if (workExperience === '应届/实习') return 0;
  if (workExperience === '1年以内') return 1;
  if (workExperience === '1-3年') return 2;
  if (workExperience === '3-5年') return 4;
  return 5;
}

function App() {
  const [input, setInput] = useState('');
  const [submittedText, setSubmittedText] = useState('');
  const [error, setError] = useState('');
  const [profile, setProfile] = useState<CandidateProfile>(defaultProfile);
  const [draftProfile, setDraftProfile] = useState<CandidateProfile>(defaultProfile);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [activeTabId, setActiveTabId] = useState(tabs[0].targetId);
  const tabClickLockUntil = useRef(0);

  const result = useMemo<AnalysisResult | null>(() => {
    if (!submittedText.trim()) return null;
    return analyzeJobDescriptions(submittedText, profile);
  }, [profile, submittedText]);

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

  const scrollToSection = (targetId: string) => {
    tabClickLockUntil.current = Date.now() + 1100;
    setActiveTabId(targetId);
    document.getElementById(targetId)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  useEffect(() => {
    if (!result) {
      setActiveTabId(tabs[0].targetId);
      return;
    }

    const getActiveId = () => {
      const pageBottom = window.scrollY + window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      if (pageBottom >= documentHeight - 8) return 'job-advice';

      const sectionPositions = [...tabTargetIds, 'general-projects']
        .map((id) => {
          const element = document.getElementById(id);
          if (!element) return null;
          return {
            id,
            top: element.getBoundingClientRect().top,
          };
        })
        .filter((item): item is { id: string; top: number } => Boolean(item));

      const anchorLine = 110;
      const current = sectionPositions.reduce((closest, section) => {
        if (!closest) return section;
        return Math.abs(section.top - anchorLine) < Math.abs(closest.top - anchorLine) ? section : closest;
      }, sectionPositions[0]);
      return current?.id === 'general-projects' ? 'profile-projects' : current?.id;
    };

    const handleScroll = () => {
      if (Date.now() < tabClickLockUntil.current) return;
      const nextActiveId = getActiveId();
      if (nextActiveId) setActiveTabId(nextActiveId);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [result]);

  const openProfileModal = () => {
    setDraftProfile(profile);
    setIsProfileModalOpen(true);
  };

  const closeProfileModal = () => {
    setDraftProfile(profile);
    setIsProfileModalOpen(false);
  };

  const saveProfile = () => {
    setProfile({
      ...draftProfile,
      yearsExperience: yearsFromWorkExperience(draftProfile.workExperience),
      representativeProject: draftProfile.previousDomains.includes('出行类产品') || draftProfile.previousDomains.includes('工具类产品')
        ? '车来了 App'
        : `${draftProfile.previousDomains[0] ?? '过往'}项目`,
    });
    setIsProfileModalOpen(false);
  };

  const averageSalary = result?.averageSalaryK ? `${result.averageSalaryK}K` : '待识别';
  const topMatch = result?.abilityRequirements[0]?.count
    ? Math.min(96, 58 + result.abilityRequirements[0].count * 5)
    : 72;

  return (
    <main className="app-shell">
      <HeaderSection onEditProfile={openProfileModal} profile={profile} />
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
              <button
                className={activeTabId === tab.targetId ? 'active' : ''}
                key={tab.targetId}
                type="button"
                onClick={() => scrollToSection(tab.targetId)}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          <section className="dashboard-grid">
            <KeywordCard id="top-keywords" keywords={result.topKeywords} />
            <AbilityCard id="core-abilities" abilities={result.abilityRequirements} />
            <ProjectCard id="profile-projects" title="基于画像项目推荐" subtitle="与岗位能力精准相关" projects={result.profileBasedProjectRecommendations} />
            <ProjectCard id="general-projects" title="综合项目推荐" subtitle="小白友好，进阶挑战" projects={result.generalProjectRecommendations} />
            <ListCard id="market-insights" icon={<Lightbulb size={18} />} title="市场洞察" items={result.marketInsights} />
            <ListCard id="job-advice" icon={<Target size={18} />} title="求职建议" items={result.jobSearchAdvice} />
          </section>
        </>
      ) : (
        <EmptyState />
      )}

      <footer className="app-footer">
        <span>内容由 AI 生成，仅供参考</span>
        <span>有反馈？告诉我们</span>
      </footer>
      {isProfileModalOpen ? (
        <ProfileModal
          draftProfile={draftProfile}
          onClose={closeProfileModal}
          onSave={saveProfile}
          onUpdate={setDraftProfile}
        />
      ) : null}
    </main>
  );
}

function HeaderSection({ onEditProfile, profile }: { onEditProfile: () => void; profile: CandidateProfile }) {
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
      <ProfileCard onEditProfile={onEditProfile} profile={profile} />
    </section>
  );
}

function ProfileCard({ onEditProfile, profile }: { onEditProfile: () => void; profile: CandidateProfile }) {
  return (
    <aside className="profile-card" aria-label="当前用户画像">
      <div className="profile-card__title">
        <UserRound size={17} />
        当前用户画像
      </div>
      <dl>
        <div>
          <dt>经验</dt>
          <dd>{profile.workExperience} 产品经验</dd>
        </div>
        <div>
          <dt>AI 产品</dt>
          <dd>{profile.aiExperience}</dd>
        </div>
        <div>
          <dt>背景</dt>
          <dd>{profile.previousDomains.join(' / ') || '未选择'}</dd>
        </div>
        <div>
          <dt>期望职位</dt>
          <dd>{profile.targetRole}</dd>
        </div>
      </dl>
      <button className="link-button" type="button" onClick={onEditProfile}>
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

function ProfileModal({
  draftProfile,
  onClose,
  onSave,
  onUpdate,
}: {
  draftProfile: CandidateProfile;
  onClose: () => void;
  onSave: () => void;
  onUpdate: (profile: CandidateProfile) => void;
}) {
  const setSingle = (key: 'workExperience' | 'aiExperience' | 'targetRole', value: string) => {
    onUpdate({
      ...draftProfile,
      [key]: value,
      yearsExperience: key === 'workExperience' ? yearsFromWorkExperience(value) : draftProfile.yearsExperience,
    });
  };

  const toggleMulti = (key: 'previousDomains' | 'familiarTech' | 'strengths', value: string) => {
    const current = draftProfile[key];
    const next = current.includes(value) ? current.filter((item) => item !== value) : [...current, value];
    onUpdate({ ...draftProfile, [key]: next });
  };

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="profile-modal" role="dialog" aria-modal="true" aria-labelledby="profile-modal-title">
        <button className="modal-close" type="button" aria-label="关闭用户画像弹窗" onClick={onClose}>
          <X size={22} />
        </button>
        <header className="modal-header">
          <h2 id="profile-modal-title">选择你的用户画像</h2>
          <p>完善信息后，我们将提供更贴合你的分析结果</p>
        </header>

        <div className="profile-form-grid">
          <ProfileOptionGroup icon={<BriefcaseBusiness size={15} />} title="工作年限">
            <SegmentGrid>
              {profileOptions.workExperience.map((option) => (
                <OptionButton
                  active={draftProfile.workExperience === option}
                  key={option}
                  label={option}
                  onClick={() => setSingle('workExperience', option)}
                />
              ))}
            </SegmentGrid>
          </ProfileOptionGroup>

          <ProfileOptionGroup icon={<Bot size={15} />} title="是否有 AI 产品经验">
            <SegmentGrid columns={2}>
              {profileOptions.aiExperience.map((option) => (
                <OptionButton
                  active={draftProfile.aiExperience === option}
                  key={option}
                  label={option}
                  onClick={() => setSingle('aiExperience', option)}
                />
              ))}
            </SegmentGrid>
          </ProfileOptionGroup>

          <ProfileOptionGroup icon={<Sparkles size={15} />} title="过往产品类型（可多选）">
            <CheckGrid>
              {profileOptions.previousDomains.map((option) => (
                <CheckOption
                  checked={draftProfile.previousDomains.includes(option)}
                  key={option}
                  label={option}
                  onClick={() => toggleMulti('previousDomains', option)}
                />
              ))}
            </CheckGrid>
          </ProfileOptionGroup>

          <ProfileOptionGroup icon={<Cpu size={15} />} title="熟悉的技术 / 领域（可多选）">
            <CheckGrid>
              {profileOptions.familiarTech.map((option) => (
                <CheckOption
                  checked={draftProfile.familiarTech.includes(option)}
                  key={option}
                  label={option}
                  onClick={() => toggleMulti('familiarTech', option)}
                />
              ))}
            </CheckGrid>
          </ProfileOptionGroup>

          <ProfileOptionGroup icon={<Gauge size={15} />} title="擅长的产品模块（可多选）">
            <CheckGrid>
              {profileOptions.strengths.map((option) => (
                <CheckOption
                  checked={draftProfile.strengths.includes(option)}
                  key={option}
                  label={option}
                  onClick={() => toggleMulti('strengths', option)}
                />
              ))}
            </CheckGrid>
          </ProfileOptionGroup>

          <ProfileOptionGroup icon={<Target size={15} />} title="期望职位">
            <div className="role-list">
              {profileOptions.targetRole.map((option) => (
                <OptionButton
                  active={draftProfile.targetRole === option}
                  key={option}
                  label={option}
                  onClick={() => setSingle('targetRole', option)}
                />
              ))}
            </div>
          </ProfileOptionGroup>
        </div>

        <footer className="modal-actions">
          <button className="secondary-button" type="button" onClick={onClose}>
            取消
          </button>
          <button className="primary-button" type="button" onClick={onSave}>
            保存并应用
          </button>
        </footer>
      </section>
    </div>
  );
}

function ProfileOptionGroup({ children, icon, title }: { children: React.ReactNode; icon: React.ReactNode; title: string }) {
  return (
    <section className="profile-option-group">
      <h3>
        {icon}
        {title}
      </h3>
      {children}
    </section>
  );
}

function SegmentGrid({ children, columns }: { children: React.ReactNode; columns?: number }) {
  return (
    <div className="segment-grid" style={columns ? { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` } : undefined}>
      {children}
    </div>
  );
}

function CheckGrid({ children }: { children: React.ReactNode }) {
  return <div className="check-grid">{children}</div>;
}

function OptionButton({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button className={`option-button ${active ? 'active' : ''}`} type="button" onClick={onClick}>
      {label}
    </button>
  );
}

function CheckOption({ checked, label, onClick }: { checked: boolean; label: string; onClick: () => void }) {
  return (
    <button className={`check-option ${checked ? 'checked' : ''}`} type="button" onClick={onClick}>
      <span aria-hidden>{checked ? '✓' : ''}</span>
      {label}
    </button>
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

function KeywordCard({ id, keywords }: { id: string; keywords: KeywordStat[] }) {
  const max = Math.max(...keywords.map((item) => item.count), 1);

  return (
    <article className="card equal-height-card" id={id}>
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

function AbilityCard({ abilities, id }: { abilities: AbilityRequirement[]; id: string }) {
  return (
    <article className="card equal-height-card" id={id}>
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
  id,
  projects,
  subtitle,
  title,
}: {
  id: string;
  projects: ProjectRecommendation[];
  subtitle: string;
  title: string;
}) {
  return (
    <article className="card equal-height-card" id={id}>
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

function ListCard({ icon, id, title, items }: { icon: React.ReactNode; id: string; title: string; items: string[] }) {
  return (
    <article className="card list-card" id={id}>
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

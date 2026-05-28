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
import type {
  AbilityAnalysisItem,
  AbilityRequirement,
  AnalysisResult,
  CandidateProfile,
  InterviewFocusItem,
  KeywordStat,
} from './types';

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
  { label: '能力分析', targetId: 'ability-analysis' },
  { label: '面试重点', targetId: 'interview-focus' },
  { label: '岗位洞察', targetId: 'market-insights' },
  { label: '求职建议', targetId: 'job-advice' },
];

const tabTargetIds = tabs.map((tab) => tab.targetId);
const maxJobCount = 50;

const profileOptions = {
  workExperience: ['1年以内', '1-3年', '3-5年', '应届生', '实习生'],
  education: ['大专', '本科', '硕士'],
  productExperience: ['有', '无'],
  previousDomains: [
    '工具类',
    '内容 / 社区',
    '电商',
    '金融',
    '生活服务',
    '教育',
    'SaaS',
    '企业服务',
    '出行 / 交通',
    '本地生活',
    '医疗健康',
    '游戏 / 娱乐',
    '广告 / 增长',
    '数据平台',
    '开放平台',
    '硬件 / IoT',
    '政企 / 行业解决方案',
    '其他',
  ],
  familiarTech: [
    'AI 大模型（LLM）',
    'Prompt 工程',
    'RAG / 知识库',
    'Agent / 智能体',
    '工作流编排',
    '多模态',
    '数据分析 / BI',
    'A/B 测试',
    '推荐算法',
    '搜索 / 召回',
    '自然语言处理',
    '计算机视觉',
    '语音识别 / TTS',
    '埋点 / 指标体系',
    'API / OpenAPI',
    'SQL',
    '低代码 / 无代码',
  ],
  strengths: [
    '需求分析',
    '用户调研',
    '竞品分析',
    '产品设计',
    '原型设计',
    'PRD 撰写',
    '项目管理',
    '跨部门沟通',
    '数据分析',
    '指标体系',
    '增长 / 运营',
    '商业化 / 盈利设计',
    'B 端交付',
    'C 端体验',
    '模型评测',
    'Prompt 调优',
    '知识库设计',
    '面试表达',
  ],
};

function yearsFromWorkExperience(workExperience: string): number {
  if (workExperience === '应届生' || workExperience === '实习生') return 0;
  if (workExperience === '1年以内') return 1;
  if (workExperience === '1-3年') return 2;
  if (workExperience === '3-5年') return 4;
  return 2;
}

function estimateJobCount(text: string): number {
  const normalized = text.replace(/\r/g, '').trim();
  if (!normalized) return 0;

  const explicitTitleCount = normalized.match(/(?:^|\n)\s*(?:岗位名称|职位名称|岗位|职位)[:：]/g)?.length ?? 0;
  if (explicitTitleCount > 1) return explicitTitleCount;

  const separatedBlocks = normalized
    .split(/\n\s*\n/g)
    .map((block) => block.trim())
    .filter((block) => /(岗位职责|职位描述|工作职责|岗位要求|任职要求|薪资|[0-9]{1,3}\s*[-~—到]\s*[0-9]{1,3}\s*[kK千])/.test(block));

  return Math.max(1, separatedBlocks.length);
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
      window.alert('请先粘贴岗位详情！');
      setSubmittedText('');
      return;
    }
    const jobCount = estimateJobCount(input);
    if (jobCount > maxJobCount) {
      window.alert('一次最多支持粘贴50个岗位信息，请删减后再分析。');
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

      const sectionPositions = tabTargetIds
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
      return current?.id;
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
      targetRole: 'AI 产品经理',
      yearsExperience: yearsFromWorkExperience(draftProfile.workExperience),
    });
    setIsProfileModalOpen(false);
  };

  const averageSalary = result?.averageSalaryK ? `${result.averageSalaryK}K` : '待识别';

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
            <MetricCard icon={<BriefcaseBusiness size={22} />} label="岗位数量" value={`${result.jobCount}`} />
            <MetricCard icon={<LineChart size={22} />} label="平均薪资" value={averageSalary} />
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
            <AbilityAnalysisCard id="ability-analysis" items={result.abilityAnalysis} />
            <InterviewFocusCard id="interview-focus" items={result.interviewFocus} />
            <ListCard id="market-insights" icon={<Lightbulb size={18} />} title="岗位洞察" items={result.marketInsights} />
            <ListCard id="job-advice" icon={<Target size={18} />} title="求职建议" items={result.jobSearchAdvice} />
          </section>
        </>
      ) : (
        <EmptyState />
      )}

      <footer className="app-footer">
        <span>内容由 AI 生成，仅供参考</span>
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
          <div className="brand-text">
            <h1>AI求职助手</h1>
            <span className="brand-subtitle">AI 产品经理转型分析</span>
          </div>
        </div>
      </div>
      <ProfileCard onEditProfile={onEditProfile} profile={profile} />
    </section>
  );
}

function ProfileCard({ onEditProfile, profile }: { onEditProfile: () => void; profile: CandidateProfile }) {
  const profileItems = [
    { icon: <UserRound size={18} />, label: '工作年限', value: profile.workExperience },
    { icon: <Gauge size={18} />, label: '学历背景', value: profile.education },
    { icon: <Bot size={18} />, label: '产品经验', value: profile.productExperience },
    { icon: <BriefcaseBusiness size={18} />, label: '过往产品类型', value: profile.previousDomains.join(' / ') || '未选择' },
  ];

  return (
    <aside className="profile-card" aria-label="当前用户画像">
      <div className="profile-summary">
        {profileItems.map((item) => (
          <div className="profile-summary__item" key={item.label}>
            <span className="profile-summary__icon">{item.icon}</span>
            <div>
              <strong>{item.value}</strong>
              <span>{item.label}</span>
            </div>
          </div>
        ))}
      </div>
      <button className="profile-edit-button" type="button" onClick={onEditProfile}>
        <PenLine size={16} />
        编辑画像
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
        placeholder={`1. 请粘贴岗位名称、薪资、岗位介绍等内容。可见使用示例
2. 一次最多支持粘贴50个岗位信息
3. 岗位与岗位之间需保留 1 行空白间距，用于区隔不同职位信息`}
        aria-label="岗位详情正文"
      />
      <div className="input-actions">
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
  const setSingle = (key: 'workExperience' | 'education' | 'productExperience', value: string) => {
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

          <ProfileOptionGroup icon={<Gauge size={15} />} title="学历背景">
            <SegmentGrid columns={3}>
              {profileOptions.education.map((option) => (
                <OptionButton
                  active={draftProfile.education === option}
                  key={option}
                  label={option}
                  onClick={() => setSingle('education', option)}
                />
              ))}
            </SegmentGrid>
          </ProfileOptionGroup>

          <ProfileOptionGroup icon={<Bot size={15} />} title="有无产品经验">
            <SegmentGrid columns={2}>
              {profileOptions.productExperience.map((option) => (
                <OptionButton
                  active={draftProfile.productExperience === option}
                  key={option}
                  label={option}
                  onClick={() => setSingle('productExperience', option)}
                />
              ))}
            </SegmentGrid>
          </ProfileOptionGroup>

          <ProfileOptionGroup icon={<Sparkles size={15} />} title="过往产品类型（多选）">
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

          <ProfileOptionGroup icon={<Cpu size={15} />} title="熟悉的技术（多选）">
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

          <ProfileOptionGroup icon={<Target size={15} />} title="擅长的技能（多选）">
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
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <article className="metric-card">
      <div className="metric-icon">{icon}</div>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
      </div>
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
  const maxAbilityCount = Math.max(...abilities.map((ability) => ability.count), 1);

  return (
    <article className="card equal-height-card" id={id}>
      <CardTitle icon={<CheckCircle2 size={18} />} title="候选人核心能力要求" />
      {abilities.length ? (
        <div className="ability-list scrollable-card-body">
          {abilities.slice(0, 6).map((ability, index) => {
            const frequencyScore = Math.max(2, Math.ceil((ability.count / maxAbilityCount) * 5));
            const rankCap = index < 2 ? 5 : index < 4 ? 4 : 3;
            const score = Math.min(frequencyScore, rankCap);
            return (
              <div className="ability-item" key={ability.name}>
                <div className="ability-head">
                  <h3>{ability.name}</h3>
                  <StarRating score={score} />
                </div>
                <p>{ability.description}</p>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyCardText text="当前文本更像普通产品岗位，建议补充 AI 相关职责后再分析。" />
      )}
    </article>
  );
}

function AbilityAnalysisCard({ id, items }: { id: string; items: AbilityAnalysisItem[] }) {
  return (
    <article className="card insight-card" id={id}>
      <CardTitle icon={<Gauge size={18} />} title="能力分析" />
      {items.length ? (
        <div className="analysis-list scrollable-card-body">
          {items.map((item) => (
            <section className="analysis-item" key={item.name}>
              <div className="analysis-item-head">
                <h3>{item.name}</h3>
                <span className={`status-pill status-${item.status}`}>{item.status}</span>
              </div>
              <p>{item.reason}</p>
              <div className="mini-meta">
                <span>优先级：{item.priority}</span>
                <span>依据：{item.evidence.join('、') || '岗位要求'}</span>
              </div>
              <ul>
                {item.actions.slice(0, 2).map((action) => (
                  <li key={action}>{action}</li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      ) : (
        <EmptyCardText text="暂未形成能力差距判断，请补充更完整的岗位要求。" />
      )}
    </article>
  );
}

function InterviewFocusCard({ id, items }: { id: string; items: InterviewFocusItem[] }) {
  return (
    <article className="card insight-card" id={id}>
      <CardTitle icon={<ClipboardList size={18} />} title="面试重点" />
      {items.length ? (
        <div className="analysis-list scrollable-card-body">
          {items.map((item) => (
            <section className="analysis-item" key={`${item.category}-${item.title}`}>
              <div className="analysis-item-head">
                <h3>{item.title}</h3>
                <span className="status-pill status-interview">{item.category}</span>
              </div>
              <p>{item.detail}</p>
              <div className="mini-meta">
                <span>优先级：{item.priority}</span>
              </div>
              <ul>
                {item.talkingPoints.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      ) : (
        <EmptyCardText text="暂未形成面试准备重点，请先完成岗位分析。" />
      )}
    </article>
  );
}

function StarRating({ score }: { score: number }) {
  return (
    <div className="star-row" aria-label={`能力要求强度 ${score} 星`}>
      <span>{'★'.repeat(score)}</span>
      <em>{'★'.repeat(5 - score)}</em>
    </div>
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
      <p>粘贴 JD 后，系统会生成关键词、能力要求、岗位洞察和求职建议。</p>
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

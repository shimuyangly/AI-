(function () {
  const STORAGE_KEY = 'ai_job_assistant_saved_jobs';
  const PANEL_ID = 'ai-job-assistant-boss-panel';

  if (document.getElementById(PANEL_ID)) return;

  const selectors = {
    title: [
      '.job-title',
      '.name h1',
      '.job-banner .name',
      '.job-primary .info-primary .name',
      '[class*="job-title"]',
    ],
    salary: [
      '.salary',
      '.job-salary',
      '.name .salary',
      '.job-banner .salary',
      '[class*="salary"]',
    ],
    detail: [
      '.job-sec-text',
      '.job-detail',
      '.job-detail-section',
      '.detail-content',
      '.job-box',
      '[class*="job-sec"]',
      '[class*="job-detail"]',
    ],
  };

  function textFromSelector(selectorList) {
    for (const selector of selectorList) {
      const element = document.querySelector(selector);
      const text = normalizeText(element?.innerText || '');
      if (text && text.length > 1) return text;
    }
    return '';
  }

  function normalizeText(text) {
    return text
      .replace(/\r/g, '')
      .replace(/\u00a0/g, ' ')
      .split('\n')
      .map((line) => line.replace(/\s+/g, ' ').trim())
      .filter(Boolean)
      .join('\n')
      .trim();
  }

  function cleanNoise(text) {
    const noisePatterns = [
      /^立即沟通$/,
      /^继续沟通$/,
      /^感兴趣$/,
      /^举报$/,
      /^分享$/,
      /^收藏$/,
      /^查看地图$/,
      /^登录后查看/,
      /^BOSS直聘/,
      /^公司信息$/,
      /^工商信息$/,
      /^职位发布者/,
    ];

    return text
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line && !noisePatterns.some((pattern) => pattern.test(line)))
      .join('\n')
      .trim();
  }

  function guessSalary(text) {
    return text.match(/\d{1,3}(?:\.\d+)?\s*[-~—到]\s*\d{1,3}(?:\.\d+)?\s*[kK千](?:[·xX*]\s*\d{1,2}\s*薪)?|面议/)?.[0] || '';
  }

  function guessTitle(text) {
    const lines = text.split('\n').map((line) => line.trim()).filter(Boolean);
    return (
      lines.find((line) => /产品经理|AI|大模型|Agent|LLM|智能体|数据产品|产品/.test(line) && line.length <= 36) ||
      lines.find((line) => line.length >= 2 && line.length <= 24) ||
      ''
    );
  }

  function collectJob() {
    const bodyText = cleanNoise(normalizeText(document.body.innerText || ''));
    const title = textFromSelector(selectors.title) || guessTitle(bodyText) || '未识别岗位';
    const salary = textFromSelector(selectors.salary) || guessSalary(bodyText) || '未识别';
    const detail = cleanNoise(textFromSelector(selectors.detail) || bodyText);

    return [
      `岗位名称：${title}`,
      `薪资：${salary}`,
      '岗位介绍：',
      detail,
    ].join('\n').trim();
  }

  function getSavedJobs() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch {
      return [];
    }
  }

  function setSavedJobs(jobs) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs.slice(0, 50)));
    updateCount();
  }

  async function copyText(text) {
    await navigator.clipboard.writeText(text);
  }

  function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'ai-ja-toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    window.setTimeout(() => toast.remove(), 1800);
  }

  function updateCount() {
    const count = document.querySelector('#ai-ja-count');
    if (count) count.textContent = `${getSavedJobs().length}/50`;
  }

  async function copyCurrentJob() {
    const text = collectJob();
    await copyText(text);
    showToast('已复制当前岗位');
  }

  async function saveCurrentJob() {
    const text = collectJob();
    const jobs = getSavedJobs();
    if (jobs.length >= 50) {
      showToast('暂存已满，最多 50 个岗位');
      return;
    }
    jobs.push(text);
    setSavedJobs(jobs);
    showToast(`已加入暂存：${jobs.length}/50`);
  }

  async function exportSavedJobs() {
    const jobs = getSavedJobs();
    if (!jobs.length) {
      showToast('暂存区为空');
      return;
    }
    await copyText(jobs.join('\n\n'));
    showToast(`已复制 ${jobs.length} 个岗位`);
  }

  function clearSavedJobs() {
    setSavedJobs([]);
    showToast('已清空暂存');
  }

  function createButton(label, handler, variant) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `ai-ja-btn ${variant || ''}`;
    button.textContent = label;
    button.addEventListener('click', async () => {
      try {
        await handler();
      } catch (error) {
        console.error(error);
        showToast('操作失败，请刷新页面后重试');
      }
    });
    return button;
  }

  function mountPanel() {
    const panel = document.createElement('div');
    panel.id = PANEL_ID;
    panel.innerHTML = `
      <div class="ai-ja-head">
        <strong>AI求职助手</strong>
        <span id="ai-ja-count">0/50</span>
      </div>
      <p>复制当前可见岗位，不抓接口</p>
    `;
    panel.appendChild(createButton('复制当前岗位', copyCurrentJob, 'primary'));
    panel.appendChild(createButton('加入暂存', saveCurrentJob));
    panel.appendChild(createButton('导出暂存', exportSavedJobs));
    panel.appendChild(createButton('清空暂存', clearSavedJobs, 'danger'));
    document.body.appendChild(panel);
    updateCount();
  }

  mountPanel();
})();

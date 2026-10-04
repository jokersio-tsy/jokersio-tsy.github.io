(function () {
  // English lives in the original markup and remains the default without JavaScript.
  // Only an explicit URL choice enables Chinese; browser locale is not consulted.
  const chinese = {
    "home.documentTitle": "田时雨 | 个人主页",
    "home.description": "田时雨，南京大学人工智能学院 LAMDA 研究所博士生，研究大语言模型的稳健推理、自主学习与复杂任务求解。",
    "nav.label": "主导航",
    "nav.about": "关于我",
    "nav.news": "最新动态",
    "nav.publications": "研究论文",
    "nav.service": "学术服务",
    "nav.home": "首页",
    "nav.conference": "会议论文",
    "nav.journal": "期刊论文",
    "nav.preprints": "预印本",
    "profile.caption": "LAMDA 研究所博士生",
    "profile.portrait": "田时雨的照片",
    "profile.lamdaLogo": "LAMDA 研究所标志",
    "profile.njuLogo": "南京大学校徽",
    "profile.scholarCount": "Google Scholar 引用次数",
    "about.title": "🤵🏻 关于我",
    "about.text": '我是<a href="https://www.nju.edu.cn/" target="_blank" rel="noreferrer">南京大学</a><a href="https://ai.nju.edu.cn/" target="_blank" rel="noreferrer">人工智能学院</a>计算机科学博士生，<a href="https://www.lamda.nju.edu.cn/" target="_blank" rel="noreferrer">LAMDA 研究所</a>成员，导师为 <a href="http://www.lamda.nju.edu.cn/liyf/" target="_blank" rel="noreferrer">李宇峰</a> 教授。此前，我曾与重庆大学的 <a href="https://lfeng1995.github.io/index.html" target="_blank" rel="noreferrer">冯磊</a> 教授密切合作。我的研究关注如何让大语言模型（LLMs）具备稳健的推理能力，更好地解决复杂任务，尤其是数学、法律与空间推理等实际领域的问题。近期，我主要探索智能体强化学习（Agentic RL）、同策略蒸馏（on-policy distillation）与自我进化等方法，以提升大语言模型的自主学习、持续改进与可靠推理能力。',
    "education.title": "🎓 教育经历",
    "education.phdPeriod": "2024 — 至今",
    "education.phdDegree": "计算机科学博士（在读）",
    "education.phdSchool": "南京大学人工智能学院",
    "education.bachelorDegree": "计算机科学学士",
    "education.bachelorSchool": "重庆大学计算机学院",
    "experience.title": "💼 实习经历",
    "experience.period": "2026.06 — 至今",
    "experience.jd": '京东零售 <a href="https://campus.jd.com/#/talentProject" target="_blank" rel="noreferrer">TGT（顶尖青年技术天才计划）</a> 实习生',
    "news.title": "🎉 最新动态",
    "news.citations": '[2026/09] <span class="news-icon" aria-hidden="true">✦</span>我的论文在 Google Scholar 上的总引用次数达到 <b>100 次</b>。',
    "news.lookstep": '[2026/08] <span class="news-icon" aria-hidden="true">✦</span><b>LookStep</b> 被 <b>EMNLP 2026</b> 录用。',
    "news.nesySpatial": '[2026/08] 我们发布了 <a href="https://arxiv.org/abs/2608.07955" target="_blank" rel="noreferrer"><b>NeSy-Spatial</b></a>，一个面向空间推理的自进化神经符号框架。',
    "news.nesyRoute": '[2026/06] <span class="news-icon" aria-hidden="true">✦</span><b>NeSy-Route</b> 被 <b>ECCV 2026</b> 录用。',
    "news.jd": '[2026/06] 我加入<b>京东零售</b>的 <b>TGT（顶尖青年技术天才计划）</b>，开始了我的第一段人才计划实习。',
    "news.tta": '[2026/05] <span class="news-icon" aria-hidden="true">✦</span><b>On the Learnability of Test-Time Adaptation</b> 被 <b>ICML 2026</b> 录用。',
    "news.tabularmath": '[2026/04] <span class="news-icon" aria-hidden="true">✦</span><b>TabularMath</b> 被 <b>ACL 2026</b> 录用。',
    "news.last": '[2026/04] 我们发布了 <a href="https://arxiv.org/abs/2604.09712" target="_blank" rel="noreferrer">LAST</a> 论文，提出了一个借助工具增强空间推理的框架。',
    "news.vcsearch": '[2025/08] <span class="news-icon" aria-hidden="true">✦</span><b>VCSearch</b> 被 <b>EMNLP 2025（Oral）</b> 录用。',
    "news.pmc": '[2025/06] 我们发布了 VCSearch 的 <a href="https://huggingface.co/datasets/kevin715/PMC" target="_blank" rel="noreferrer">PMC</a> 基准。',
    "news.tabularBenchmark": '[2025/05] 我们发布了 <a href="https://huggingface.co/datasets/kevin715/TabularGSM" target="_blank" rel="noreferrer">TabularMath</a>，一个侧重推理能力的表格问答基准。',
    "news.fcs": '[2024/12] 一篇论文被 <b>Frontiers of Computer Science</b> 录用。',
    "news.crosel": '[2024/02] <span class="news-icon" aria-hidden="true">✦</span><b>CroSel</b> 被 <b>CVPR 2024（Oral）</b> 录用。',
    "publications.title": "📝 研究论文",
    "publications.view": "论文展示方式",
    "publications.selected": "代表论文",
    "publications.all": "全部论文（按时间）",
    "publications.conference": "会议论文",
    "publications.journal": "期刊论文",
    "publications.preprint": "预印本与研讨会论文",
    "service.title": "🤝 学术服务",
    "service.journal": "期刊审稿人",
    "service.conference": "会议审稿人",
    "service.teaching": "课程助教",
    "service.matrix": "2026 年春季：矩阵计算，授课教师：李宇峰 教授。",
    "service.ml": "2026 年春季：高级机器学习，授课教师：李宇峰 教授。",
    "citations.title": "📈 引用统计",
    "citations.chartTitle": "Google Scholar 每周总引用次数",
    "citations.label": "引用次数",
    "citations.updated": "更新于",
    "citations.total": "次总引用",
    "citations.historyStarts": "每周记录始于",
    "footer.updated": "页面更新于 ",
    "footer.period": "。",
    "publicationsPage.documentTitle": "田时雨 | 完整论文列表",
    "publicationsPage.description": "田时雨的完整论文列表。",
    "publicationsPage.eyebrow": "研究论文",
    "publicationsPage.title": "📝 完整论文列表",
    "publicationsPage.intro": "按类别列出全部论文。* 表示共同第一作者。",
    "publicationsPage.conference": "🎤 会议论文",
    "publicationsPage.journal": "📚 期刊论文",
    "publicationsPage.preprint": "🧪 预印本与研讨会论文"
  };
  const labels = {
    "Paper": "论文",
    "ArXiv": "论文",
    "Code": "代码",
    "Project Page": "项目主页",
    "Page": "项目主页",
    "Dataset": "数据集",
    "Benchmark": "评测基准",
    "Poster": "海报",
    "Preprint": "预印本",
    "Oral": "口头报告"
  };
  const original = new WeakMap();
  const attributes = ["aria-label", "alt", "title", "content"];
  let language = "en";

  function languageFromURL() {
    const value = new URL(window.location.href).searchParams.get("lang");
    return value === "zh" || value === "zh-CN" ? "zh" : "en";
  }

  function t(key, fallback) {
    return language === "zh" && Object.prototype.hasOwnProperty.call(chinese, key)
      ? chinese[key]
      : fallback;
  }

  function applyLanguage(nextLanguage) {
    language = nextLanguage === "zh" ? "zh" : "en";
    document.documentElement.lang = language === "zh" ? "zh-CN" : "en";

    document.querySelectorAll("[data-i18n]").forEach((element) => {
      if (!original.has(element)) original.set(element, { html: element.innerHTML });
      element.innerHTML = t(element.dataset.i18n, original.get(element).html);
    });
    attributes.forEach((attribute) => {
      document.querySelectorAll(`[data-i18n-${attribute}]`).forEach((element) => {
        if (!original.has(element)) original.set(element, {});
        const saved = original.get(element);
        if (!(attribute in saved)) saved[attribute] = element.getAttribute(attribute) || "";
        element.setAttribute(attribute, t(element.getAttribute(`data-i18n-${attribute}`), saved[attribute]));
      });
    });
    document.querySelectorAll("[data-language]").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.language === language));
    });
    document.querySelectorAll("[data-language-link]").forEach((link) => {
      const url = new URL(link.href, document.baseURI);
      if (language === "zh") url.searchParams.set("lang", "zh");
      else url.searchParams.delete("lang");
      link.href = url.href;
    });
    window.dispatchEvent(new CustomEvent("site:languagechange", { detail: { language } }));
  }

  window.SiteI18n = {
    getLanguage: () => language,
    t,
    label: (text) => language === "zh" && Object.prototype.hasOwnProperty.call(labels, text) ? labels[text] : text
  };

  document.querySelectorAll("[data-language]").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.dataset.language === language) return;
      const url = new URL(window.location.href);
      if (button.dataset.language === "zh") url.searchParams.set("lang", "zh");
      else url.searchParams.delete("lang");
      // Switching keeps the current section and supports the browser's Back button.
      window.history.pushState(null, "", url);
      applyLanguage(button.dataset.language);
    });
  });
  window.addEventListener("popstate", () => applyLanguage(languageFromURL()));
  applyLanguage(languageFromURL());
  document.querySelectorAll(".language-switch").forEach((element) => { element.hidden = false; });
})();

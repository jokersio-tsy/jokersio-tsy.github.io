window.SITE_CONFIG = {
  repository: "jokersio-tsy/jokersio-tsy.github.io",
  scholarUserId: "2UwjVasAAAAJ",
  scholarStatsBranch: "google-scholar-stats",
  citationFallback: {
    citedby: 59,
    citation_history: [
      { week: "2026-06-01", citedby: 59, updated: "2026-06-05T07:03:39.749535+00:00" }
    ],
    updated: "2026-06-05T07:03:39.749535+00:00"
  }
};

window.SITE_PUBLICATIONS = [
  {
    slug: "lookstep",
    category: "conference",
    selected: false,
    venueTag: "EMNLP 2026",
    title: "LookStep: Efficient Vision-Language Navigation with Linguistic Foresight and Event Driven Memory",
    authors: "Kun-Yang Yu, Yingzhe Li, Hongyu Xu, <u>Shi-Yu Tian</u>, Zhi Zhou, Yang Chen, Ming Yang, Sheng Wang, Qing Yu, Lan-Zhe Guo, Yu-Feng Li.",
    venueShort: "In: Conference on Empirical Methods in Natural Language Processing.",
    venueFull: "In: Conference on Empirical Methods in Natural Language Processing (EMNLP 2026).",
    badges: [
      { label: "EMNLP 2026" },
      { label: "CAAI-A", type: "rank-highlight" }
    ],
    ratings: [
      { label: "CAAI-A", type: "caai" }
    ],
    fullLinks: [
      { label: "ArXiv", href: "https://arxiv.org/abs/2609.02350" }
    ]
  },
  {
    slug: "nesy-route",
    category: "conference",
    selected: false,
    venueTag: "ECCV 2026",
    title: "NeSy-Route: A Neuro-Symbolic Benchmark for Constrained Route Planning in Remote Sensing",
    authors: "Ming Yang, Zhi Zhou, <u>Shi-Yu Tian</u>, Kun-Yang Yu, Lan-Zhe Guo, Yu-Feng Li.",
    venueShort: "In: European Conference on Computer Vision.",
    venueFull: "In: European Conference on Computer Vision (ECCV 2026).",
    badges: [
      { label: "ECCV 2026" },
      { label: "CAAI-A", type: "rank-highlight" }
    ],
    ratings: [
      { label: "CAAI-A", type: "caai" }
    ],
    fullLinks: [
      { label: "ArXiv", href: "https://arxiv.org/abs/2603.16307" }
    ]
  },
  {
    slug: "learnability-tta",
    category: "conference",
    selected: false,
    venueTag: "ICML 2026",
    title: "On the Learnability of Test-Time Adaptation: A Recovery Complexity Perspective",
    authors: "Zhi Zhou, Ming Yang, <u>Shi-Yu Tian</u>, Kun-Yang Yu, Lan-Zhe Guo, Yu-Feng Li.",
    venueShort: "In: Proceedings of the 43rd International Conference on Machine Learning.",
    venueFull: "In: Proceedings of the 43rd International Conference on Machine Learning, 2026 (ICML 26).",
    badges: [
      { label: "ICML 2026" },
      { label: "CCF-A", type: "rank-highlight" }
    ],
    ratings: [
      { label: "CCF-A", type: "ccf" }
    ],
    fullLinks: [
      { label: "ArXiv", href: "https://arxiv.org/abs/2605.28057" },
      { label: "BibTeX", href: "./assets/bib/zhou2026learnability.bib" }
    ]
  },
  {
    slug: "nesy-spatial",
    category: "preprint",
    selected: true,
    venueTag: "Preprint",
    title: "Self-Evolving Neuro-Symbolic Skills for Tool-Augmented Spatial Reasoning",
    authors: "<u>Shi-Yu Tian</u>*, Zhuo-Xia Wang*, Xuan-Yi Zhu, Zhi Zhou, Xinwei Yang, Kun-Yang Yu, Ming Yang, Yang Chen, Yu-Feng Li.",
    venueShort: "Preprint.",
    venueFull: "Preprint.",
    summary: "A self-evolving neuro-symbolic framework that retrieves, executes, refines, fuses, and prunes reusable tool-use and geometry skills for spatial reasoning.",
    summaryZh: "一个自进化的神经符号框架，通过检索、执行、改进、融合与剪枝可复用的工具使用和几何技能，支持空间推理。",
    badges: [
      { label: "Preprint" }
    ],
    ratings: [],
    thumb: {
      type: "image",
      src: "./projects/nesy-spatial/image/frame.png",
      alt: "Overview of the NeSy-Spatial framework",
      altZh: "NeSy-Spatial 框架概览",
      badge: "Preprint",
      contain: true
    },
    selectedLinks: [
      { label: "ArXiv", href: "https://arxiv.org/abs/2608.07955", primary: true }
    ],
    fullLinks: [
      { label: "ArXiv", href: "https://arxiv.org/abs/2608.07955" }
    ]
  },
  {
    slug: "last",
    category: "preprint",
    selected: true,
    venueTag: "Preprint",
    title: "LAST: Leveraging Tools as Hints to Enhance Spatial Reasoning for Multimodal Large Language Models",
    authors: "<u>Shi-Yu Tian</u>, Zhi Zhou, Kun-Yang Yu, Ming Yang, Yang Chen, Ziqiao Shang, Lan-Zhe Guo, Yu-Feng Li.",
    venueShort: "Preprint.",
    venueFull: "Preprint.",
    summary: "A tool-augmented framework with LAST-Box and progressive training that turns vision tools into short-horizon hints for multimodal spatial reasoning.",
    summaryZh: "结合 LAST-Box 与渐进式训练的工具增强框架，将视觉工具的结果转化为局部推理提示，辅助多模态空间推理。",
    badges: [
      { label: "Preprint" }
    ],
    ratings: [],
    thumb: {
      type: "image",
      src: "./projects/last/image/figure4-examples.png",
      alt: "Representative spatial reasoning examples from Figure 4 of the LAST paper",
      altZh: "LAST 论文图 4 中的代表性空间推理示例",
      badge: "Preprint",
      contain: true
    },
    selectedLinks: [
      { label: "ArXiv", href: "https://arxiv.org/abs/2604.09712", primary: true }
    ],
    fullLinks: [
      { label: "ArXiv", href: "https://arxiv.org/abs/2604.09712" }
    ]
  },
  {
    slug: "tabularmath",
    category: "conference",
    selected: true,
    venueTag: "ACL 2026",
    title: "TabularMath: Understanding Math Reasoning over Tables with Large Language Models",
    authors: "<u>Shi-Yu Tian</u>*, Zhi Zhou*, Wei Dong*, Kun-Yang Yu, Ming Yang, Zi-Jian Cheng, Lan-Zhe Guo, Yu-Feng Li.",
    venueShort: "In: Findings of the Association for Computational Linguistics: ACL 2026.",
    venueFull: "In: Findings of the Association for Computational Linguistics (ACL 2026 Findings).",
    summary: "A neuro-symbolic pipeline and benchmark for studying mathematical reasoning over large, imperfect, and multimodal tables.",
    summaryZh: "面向大规模、不完备及多模态表格的神经符号推理流程与评测基准，用于研究表格上的数学推理。",
    badges: [
      { label: "ACL 2026 (Findings)" },
      { label: "CCF-A", type: "rank-highlight" }
    ],
    ratings: [
      { label: "CCF-A", type: "ccf" }
    ],
    thumb: {
      type: "image",
      src: "./projects/tabularmath/Figure/intro.png",
      alt: "TabularMath benchmark examples",
      altZh: "TabularMath 评测基准示例",
      badge: "ACL 2026",
      contain: true
    },
    selectedLinks: [
      { label: "Project Page", href: "./projects/tabularmath/index.html", primary: true },
      { label: "ArXiv", href: "https://arxiv.org/abs/2505.19563" },
      { label: "Benchmark", href: "https://huggingface.co/datasets/kevin715/TabularGSM" },
      { label: "Code", href: "https://github.com/jokersio-tsy/AutoT2T" }
    ],
    fullLinks: [
      { label: "Page", href: "./projects/tabularmath/index.html" },
      { label: "ArXiv", href: "https://arxiv.org/abs/2505.19563" },
      { label: "Benchmark", href: "https://huggingface.co/datasets/kevin715/TabularGSM" },
      { label: "Code", href: "https://github.com/jokersio-tsy/AutoT2T" }
    ]
  },
  {
    slug: "vcsearch",
    category: "conference",
    selected: true,
    venueTag: "EMNLP 2025",
    title: "VCSearch: Bridging the Gap Between Well-Defined and Ill-Defined Problems in Mathematical Reasoning",
    authors: "<u>Shi-Yu Tian</u>*, Zhi Zhou*, Kun-Yang Yu, Ming Yang, Lin-Han Jia, Lan-Zhe Guo, Yu-Feng Li.",
    venueShort: "In: Conference on Empirical Methods in Natural Language Processing.",
    venueFull: "In: Conference on Empirical Methods in Natural Language Processing (EMNLP 2025 Oral).",
    summary: "A training-free neuro-symbolic framework and benchmark for identifying unsolvable mathematical reasoning problems with missing or contradictory conditions.",
    summaryZh: "无需训练的神经符号框架与评测基准，用于识别因条件缺失或矛盾而无法求解的数学推理问题。",
    badges: [
      { label: "EMNLP 2025" },
      { label: "Oral", type: "oral" },
      { label: "CAAI-A", type: "rank-highlight" }
    ],
    ratings: [
      { label: "CAAI-A", type: "caai" }
    ],
    thumb: {
      type: "image",
      src: "./projects/vcsearch/picture/intro.png",
      alt: "VCSearch problem illustration",
      altZh: "VCSearch 问题示意图",
      badge: "EMNLP 2025",
      contain: true
    },
    selectedLinks: [
      { label: "Project Page", href: "./projects/vcsearch/index.html", primary: true },
      { label: "Paper", href: "https://arxiv.org/abs/2406.05055v2" },
      { label: "Dataset", href: "https://huggingface.co/datasets/kevin715/PMC" },
      { label: "Code", href: "https://github.com/jokersio-tsy/VCSearch" }
    ],
    fullLinks: [
      { label: "Page", href: "./projects/vcsearch/index.html" },
      { label: "Poster", href: "./src/papers/VCSearch_poster.pdf" },
      { label: "Paper", href: "https://arxiv.org/abs/2406.05055v2" },
      { label: "Dataset", href: "https://huggingface.co/datasets/kevin715/PMC" },
      { label: "Code", href: "https://github.com/jokersio-tsy/VCSearch" }
    ]
  },
  {
    slug: "crosel",
    category: "conference",
    selected: true,
    venueTag: "CVPR 2024",
    title: "CroSel: Cross Selection of Confident Pseudo Labels for Partial-Label Learning",
    authors: "<u>Shi-Yu Tian</u>, Hong-Xin Wei, Yi-Qun Wang, Lei Feng.",
    venueShort: "In: IEEE/CVF Conference on Computer Vision and Pattern Recognition.",
    venueFull: "In: IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR 2024 Oral).",
    summary: "A high-precision pseudo-label selection framework that uses cross supervision and consistency regularization to improve partial-label learning.",
    summaryZh: "高精度伪标签筛选框架，通过交叉监督与一致性正则化提升偏标记学习性能。",
    badges: [
      { label: "CVPR 2024" },
      { label: "Oral", type: "oral" },
      { label: "CCF-A", type: "rank-highlight" }
    ],
    ratings: [
      { label: "CCF-A", type: "ccf" }
    ],
    thumb: {
      type: "image",
      src: "./projects/crosel/img/frame1.png",
      alt: "CroSel framework overview",
      altZh: "CroSel 框架概览",
      badge: "CVPR 2024",
      contain: true
    },
    selectedLinks: [
      { label: "Project Page", href: "./projects/crosel/index.html", primary: true },
      { label: "Paper", href: "./src/papers/CroSel_paper.pdf" },
      { label: "Code", href: "https://github.com/jokersio-tsy/CroSel" }
    ],
    fullLinks: [
      { label: "Page", href: "./projects/crosel/index.html" },
      { label: "Paper", href: "./src/papers/CroSel_paper.pdf" },
      { label: "Poster", href: "./src/papers/Crosel_poster.pdf" },
      { label: "Code", href: "https://github.com/jokersio-tsy/CroSel" }
    ]
  },
  {
    slug: "ddi-eval",
    category: "journal",
    selected: false,
    title: "Rethinking Evaluation for Multi-Label Drug-Drug Interaction Prediction",
    authors: "<u>Shi-Yu Tian</u>, Zhi Zhou, Xin Su, Yu-Feng Li.",
    venueFull: "In: Frontiers of Computer Science (FCS).",
    ratings: [
      { label: "CCF-B", type: "ccf" }
    ],
    fullLinks: [
      { label: "Paper", href: "https://journal.hep.com.cn/fcs/EN/10.1007/s11704-024-41055-9" }
    ]
  },
  {
    slug: "lawgpt",
    category: "preprint",
    selected: false,
    title: "LawGPT: Knowledge-Guided Data Generation and Its Application to Legal LLM",
    authors: "Zhi Zhou, Kun-Yang Yu, <u>Shi-Yu Tian</u>, Xiao-Wen Yang, Jiang-Xin Shi, Peng-Xiao Song, Yi-Xuan Jin, Lan-Zhe Guo, Yu-Feng Li.",
    venueFull: "In: Open Science for Foundation Models Workshop, ICLR 2025.",
    ratings: [],
    fullLinks: [
      { label: "ArXiv", href: "https://arxiv.org/pdf/2502.06572" }
    ]
  }
];

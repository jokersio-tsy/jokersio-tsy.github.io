window.SITE_CONFIG = {
  repository: "jokersio-tsy/jokersio-tsy.github.io",
  scholarUserId: "2UwjVasAAAAJ",
  scholarStatsBranch: "google-scholar-stats"
};

window.SITE_PUBLICATIONS = [
  {
    slug: "vcsearch",
    category: "conference",
    selected: true,
    venueTag: "EMNLP 2025",
    title: "VCSearch: Bridging the Gap Between Well-Defined and Ill-Defined Problems in Mathematical Reasoning",
    authors: "<u>Shi-Yu Tian</u>*, Zhi Zhou*, Kun-Yang Yu, Ming Yang, Lin-Han Jia, Lan-Zhe Guo, Yu-Feng Li.",
    venueShort: "In: Conference on Empirical Methods in Natural Language Processing.",
    venueFull: "In: Conference on Empirical Methods in Natural Language Processing (EMNLP 2025, Oral).",
    summary: "A training-free neuro-symbolic framework and benchmark for identifying unsolvable mathematical reasoning problems with missing or contradictory conditions.",
    badges: [
      { label: "EMNLP 2025" },
      { label: "Oral", type: "oral" },
      { label: "CAAI-A", type: "rank-highlight" }
    ],
    ratings: [
      { label: "CAAI-A", type: "caai" },
      { label: "CCF-B", type: "ccf" }
    ],
    thumb: {
      type: "image",
      src: "./src/vcsearch_web/static/images/frame.png",
      alt: "VCSearch method figure",
      badge: "EMNLP 2025",
      contain: true
    },
    selectedLinks: [
      { label: "Project Page", href: "#", primary: true, title: "Project page to be added" },
      { label: "Paper", href: "https://arxiv.org/abs/2406.05055v2" },
      { label: "Dataset", href: "https://huggingface.co/datasets/kevin715/PMC" },
      { label: "Code", href: "https://github.com/jokersio-tsy/VCSearch" }
    ],
    fullLinks: [
      { label: "Page", href: "./src/vcsearch_web/index.html" },
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
    venueFull: "In: IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR 2024, Oral).",
    summary: "A high-precision pseudo-label selection framework that uses cross supervision and consistency regularization to improve partial-label learning.",
    badges: [
      { label: "CVPR 2024" },
      { label: "Oral", type: "oral" },
      { label: "CCF-A", type: "rank-highlight" }
    ],
    ratings: [
      { label: "CCF-A", type: "ccf" }
    ],
    thumb: {
      type: "synthetic",
      badge: "CVPR 2024",
      title: "CroSel",
      subtitle: "Cross selection of confident pseudo labels for partial-label learning.",
      notes: ["PLL", "Pseudo Labels", "Dual Network"]
    },
    selectedLinks: [
      { label: "Project Page", href: "#", primary: true, title: "Project page to be added" },
      { label: "Paper", href: "./src/papers/CroSel_paper.pdf" },
      { label: "Code", href: "https://github.com/jokersio-tsy/CroSel" }
    ],
    fullLinks: [
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
  },
  {
    slug: "tabularmath",
    category: "preprint",
    selected: false,
    title: "TabularMath: Understanding the Limitations of LLMs in Tabular Math Reasoning",
    authors: "<u>Shi-Yu Tian</u>*, Zhi Zhou*, Wei Dong, Ming Yang, Kun-Yang Yu, Zi-Jian Cheng, Lan-Zhe Guo, Yu-Feng Li.",
    venueFull: "Preprint, 2025.",
    ratings: [],
    fullLinks: [
      { label: "ArXiv", href: "https://arxiv.org/abs/2505.19563" },
      { label: "Benchmark", href: "https://huggingface.co/datasets/kevin715/TabularGSM" }
    ]
  }
];

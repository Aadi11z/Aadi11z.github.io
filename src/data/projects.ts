export const projectCategories = [
  'AI Engineering',
  'AI Safety / Research',
  'Data Science',
  'Forecasting',
  'Quant Research',
  'Software Engineering',
  'Computer Vision',
] as const;

export type ProjectCategory = (typeof projectCategories)[number];

export type ProjectDetail = {
  problem: string;
  architecture?: string;
  technicalDecisions?: string[];
  pipeline?: string[];
  evaluation?: string;
  results?: string;
  limitations?: string;
  lessons?: string;
  futureWork?: string;
};

export type Project = {
  slug: string;
  title: string;
  subtitle?: string;
  category: ProjectCategory;
  categories: ProjectCategory[];
  summary: string;
  longDescription: string;
  technologies: string[];
  metrics: string[];
  dates?: string;
  role?: string;
  featured: boolean;
  liveUrl?: string;
  repositoryUrl?: string;
  reportUrl?: string;
  visualType: 'grounddesk' | 'mlp' | 'nrg' | 'qnt' | 'deeplense' | 'unlearning' | 'adversarial';
  detail?: ProjectDetail;
  explorer?: 'unlearning';
};

export const projects: Project[] = [
  {
    slug: 'grounddesk',
    title: 'GroundDesk',
    subtitle: 'Evidence-Grounded Support Analytics Copilot',
    category: 'AI Engineering',
    categories: ['AI Engineering', 'Data Science', 'Software Engineering'],
    summary: 'A support analytics product for cited answers, answer traces, and safe escalation when evidence is insufficient.',
    longDescription: 'GroundDesk ingests Markdown, text files, PDFs, and public URLs; performs hybrid retrieval; generates cited answers; stores answer traces in PostgreSQL; and safely escalates unsupported or ambiguous questions.',
    technologies: ['Python', 'FastAPI', 'Gemini API', 'Qdrant', 'Supabase PostgreSQL'],
    metrics: ['100% top-citation accuracy', '93.8% answer-term coverage', '100% escalation accuracy'],
    featured: true,
    liveUrl: 'https://ground-desk.onrender.com/',
    visualType: 'grounddesk',
    detail: {
      problem: 'Support analytics becomes difficult to trust when answers cannot show where they came from or when a system guesses beyond its source material.',
      architecture: 'Documents and public URLs flow through ingestion and hybrid retrieval into a FastAPI application. Qdrant supports retrieval, while Supabase PostgreSQL stores answer traces for inspection.',
      technicalDecisions: [
        'Combine retrieval signals before generation instead of relying on a single search path.',
        'Require citations and preserve answer traces so responses can be inspected after generation.',
        'Escalate unsupported and ambiguous questions rather than fabricate an answer.',
      ],
      pipeline: ['Ingest Markdown, text, PDF, or public URL content', 'Retrieve evidence through the hybrid retrieval layer', 'Generate an answer with citations', 'Persist the answer trace in PostgreSQL', 'Escalate when the evidence is insufficient'],
      evaluation: 'The benchmark measures citation correctness, expected answer-term coverage, and escalation behavior across answerable, unsupported, and ambiguous cases.',
      results: 'Reported results show 100% correct top citation on answerable cases, 93.8% expected answer-term coverage, and 100% escalation accuracy on unsupported and ambiguous queries.',
      limitations: 'The supplied project material does not specify broader deployment scale or additional evaluation sets, so this case study stays focused on evidence quality and traceability.',
      lessons: 'Reliable generated answers depend on retrieval quality, explicit abstention behavior, and traces that make failures inspectable.',
    },
  },
  {
    slug: 'mlp-trainer-agentic-tutor',
    title: 'MLP Trainer + Agentic LLM Tutor',
    category: 'Software Engineering',
    categories: ['Software Engineering', 'AI Engineering'],
    summary: 'A live neural-network visualizer paired with an observable, streaming tutor for learning by inspection.',
    longDescription: 'The platform implements a 2-4-1 neural network with forward propagation, backpropagation, MSE loss, SGD, deterministic initialization, and live inspection of weights, activations, loss curves, and predictions. It also includes an agentic AI tutor with tool calling, bounded multi-turn memory, server-sent event streaming, MCP integration, and observability.',
    technologies: ['Rust', 'Axum', 'Tokio', 'React', 'TypeScript', 'FastAPI', 'Groq API', 'MCP', 'Langfuse', 'OpenTelemetry', 'Docker'],
    metrics: ['2-4-1 network visualizer', 'Live weights and loss inspection'],
    featured: true,
    visualType: 'mlp',
    detail: {
      problem: 'Neural-network fundamentals are easier to understand when the math, intermediate values, and training behavior can be inspected together instead of hidden behind a framework abstraction.',
      architecture: 'An Axum and Tokio control plane exposes Rust training and inference logic to a React and TypeScript interface. A separate FastAPI tutor layer adds Groq tool calling, bounded memory, SSE streaming, MCP integration, and observability.',
      technicalDecisions: ['Implement the network fundamentals in Rust', 'Use deterministic initialization for repeatable inspection', 'Stream tutor responses with server-sent events', 'Keep bounded memory and tool activity observable'],
      pipeline: ['Initialize the 2-4-1 model from a deterministic seed', 'Run forward propagation and calculate MSE loss', 'Apply backpropagation and SGD updates', 'Expose weights, activations, predictions, and loss curves', 'Let the tutor inspect tools and stream an explanation'],
      evaluation: 'The learning surface supports direct inspection of model state and repeatable initialization. The supplied material does not provide a separate latency or deployment benchmark.',
      results: 'The trainer supports XOR, half-moons, and spiral datasets while exposing live weights, activations, loss curves, and predictions.',
      limitations: 'No public repository or performance benchmark was supplied, so this case study does not claim deployment scale.',
      lessons: 'Separating deterministic model state, service boundaries, and observability makes a teaching system easier to inspect and explain.',
    },
  },
  {
    slug: 'nrg',
    title: 'NRG',
    subtitle: 'Spanish Power Price Forecasting and Reporting Platform',
    category: 'Forecasting',
    categories: ['Forecasting', 'Data Science', 'Software Engineering'],
    summary: 'A research platform for validated energy-market data, time-series forecasts, backtests, and reporting.',
    longDescription: 'NRG loads Spanish energy-market data into PostgreSQL, validates it with SQL data-quality checks, exports analytical Parquet marts, trains time-series models, and exposes forecasts and backtests through an API and dashboard.',
    technologies: ['Python', 'SQL', 'PostgreSQL', 'scikit-learn', 'MLflow', 'FastAPI', 'React', 'TypeScript'],
    metrics: ['Ridge test MAE: 2.23 EUR/MWh', 'Walk-forward MAE: 2.24 EUR/MWh', 'Temporal baseline MAE: 2.86 EUR/MWh'],
    featured: true,
    visualType: 'nrg',
    detail: {
      problem: 'Energy forecasting requires temporal evaluation and a data path that keeps market inputs, analytical marts, models, and reports connected.',
      architecture: 'PostgreSQL stores market data, SQL checks validate it, Parquet captures analytical marts, scikit-learn trains the models, and MLflow tracks runs. FastAPI and a React/TypeScript dashboard expose the resulting forecasts and backtests.',
      technicalDecisions: ['Validate source data with SQL before model training', 'Preserve temporal order during validation', 'Export reproducible Parquet marts', 'Track model runs and expose analysis through an API'],
      pipeline: ['Load raw Spanish market CSV data into PostgreSQL', 'Run SQL data-quality checks', 'Export analytical Parquet marts', 'Train and track time-series models', 'Run temporal and walk-forward evaluation', 'Serve forecasts and backtests through FastAPI'],
      evaluation: 'Evaluation includes temporal baselines, held-out testing, and walk-forward testing so the reported errors respect the ordering of market data.',
      results: 'Ridge reached 2.23 EUR/MWh test MAE and 2.24 EUR/MWh walk-forward MAE, compared with a 2.86 EUR/MWh temporal baseline.',
      limitations: 'The supplied material does not include a public repository or demo, so those links are intentionally omitted.',
      lessons: 'Forecasting quality depends as much on data checks and temporal validation as on the model itself.',
    },
  },
  {
    slug: 'qnt',
    title: 'QNT',
    subtitle: 'Regime-Aware Quantitative Research Platform',
    category: 'Quant Research',
    categories: ['Quant Research', 'Data Science'],
    summary: 'A reproducible research environment for point-in-time features, walk-forward signals, and cost-aware strategy evaluation.',
    longDescription: 'QNT retrieves market prices and optional macroeconomic data, creates point-in-time features, generates momentum and walk-forward Ridge signals, and evaluates long-only strategies with transaction costs.',
    technologies: ['Python', 'Pandas', 'scikit-learn', 'SQLite', 'Parquet', 'Streamlit'],
    metrics: ['Point-in-time features', 'Walk-forward signals', 'Transaction-cost evaluation'],
    featured: true,
    visualType: 'qnt',
  },
  {
    slug: 'deeplense',
    title: 'DeepLense',
    subtitle: 'Gravitational Lensing Image Classification',
    category: 'Computer Vision',
    categories: ['Computer Vision', 'Data Science'],
    summary: 'Scientific machine learning with equivariant and conventional convolutional networks for lensing images.',
    longDescription: 'DeepLense was developed for the ML4Sci Google Summer of Code test, using equivariant and conventional convolutional networks to classify gravitational-lensing images and detect dark-matter substructure.',
    technologies: ['PyTorch', 'scikit-learn', 'ESCNN', 'CNNs', 'ROC-AUC'],
    metrics: ['0.9862 mean validation AUC', '0.9912 binary ROC-AUC', '191 of 195 test lenses identified'],
    featured: true,
    visualType: 'deeplense',
  },
  {
    slug: 'machine-unlearning-vision-language-models',
    title: 'Machine Unlearning in Vision-Language Models',
    category: 'AI Safety / Research',
    categories: ['AI Safety / Research', 'Computer Vision'],
    summary: 'An ongoing study of selective forgetting in frozen CLIP models using parameter-efficient adapters and evaluation trade-offs.',
    longDescription: 'Built a machine-unlearning pipeline for frozen CLIP vision-language models using CIFAR-10 and CIFAR-100 retain/forget splits and adapter-only checkpoints. The work compares parameter-efficient unlearning against several baselines and measures retain, forget, sibling-class, membership-inference, and semantic-subspace behavior.',
    technologies: ['CLIP', 'LoRA', 'H-TGSD', 'CIFAR-10', 'CIFAR-100', 'SLURM'],
    metrics: ['0.6% forget-train accuracy', '11.0% rose-test accuracy', '91.75% sibling-flower accuracy', '86.32% retain accuracy'],
    dates: 'February 2026 – Present',
    role: 'Ongoing research',
    featured: false,
    visualType: 'unlearning',
    explorer: 'unlearning',
    detail: {
      problem: 'The project studies whether a frozen CLIP vision-language model can selectively forget a target concept while preserving retained and semantically related classes.',
      architecture: 'CIFAR-10 and CIFAR-100 retain/forget splits feed frozen CLIP ViT-B/16 models with vision LoRA adapters. Adapter-only checkpoints support parameter-efficient H-TGSD unlearning on SLURM.',
      technicalDecisions: ['Freeze the base CLIP model and update adapter parameters only', 'Evaluate superclass and selective-rose forgetting separately', 'Track sibling-flower accuracy alongside target forgetting', 'Compare against GA+KL, retain-only, rebind, and no-sibling baselines'],
      pipeline: ['Create retain and forget splits', 'Attach vision LoRA adapters to frozen CLIP ViT-B/16', 'Run H-TGSD or comparison baselines', 'Save adapter-only checkpoints', 'Measure retain, forget, sibling, privacy, and semantic-subspace behavior'],
      evaluation: 'Evaluation includes retain accuracy, target forget accuracy, sibling-class accuracy, membership-inference attacks, semantic-subspace metrics, and trade-off plots.',
      results: 'Preliminary selective-rose results report 0.6% forget-train accuracy, 11.0% rose-test accuracy, 91.75% sibling-flower accuracy, and 86.32% retain accuracy.',
      limitations: 'This is ongoing research. Only one measured selective-rose result set is included in the supplied material, and no numeric membership-inference result was supplied.',
      lessons: 'Forgetting should be evaluated as a trade-off among target removal, retained utility, and sibling-class preservation rather than as a single accuracy number.',
      futureWork: 'The ongoing evaluation includes additional baselines, membership-inference analysis, semantic-subspace metrics, and trade-off plots.',
    },
  },
  {
    slug: 'finetuning-defence-adversarial-datasets',
    title: 'Finetuning Defence Strategies for Adversarial Datasets',
    category: 'AI Safety / Research',
    categories: ['AI Safety / Research', 'Data Science'],
    summary: 'A robustness study of bounded intermediate activations across adversarial NLP model variants.',
    longDescription: 'Studied adversarial NLP threats across character, word, sentence, and multi-level perturbations and benchmarked bounded intermediate activation functions across DistilBERT, InfoBERT, and RanMASK variants.',
    technologies: ['DistilBERT', 'InfoBERT', 'RanMASK', 'ANLI', 'BReLU', 'RGeLU', 't-Sigmoid'],
    metrics: ['InfoBERT ANLI: 32.2% → 48.1%', 'DistilBERT-ANLI baseline: 46.9%'],
    dates: 'February 2025 – June 2025',
    role: 'Completed research project',
    featured: false,
    visualType: 'adversarial',
  },
];

export const featuredProjects = projects.filter((project) => project.featured);
export const detailProjects = projects.filter((project) => project.detail);
export const projectBySlug = (slug: string) => projects.find((project) => project.slug === slug);

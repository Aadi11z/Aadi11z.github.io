export type ProjectSection = {
  title: string;
  body: string;
  items?: string[];
};

export type Project = {
  slug: string;
  title: string;
  subtitle?: string;
  category: string;
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
  visualType: 'grounddesk' | 'mlp' | 'nrg' | 'qnt' | 'deeplense' | 'unlearning';
  sections?: ProjectSection[];
};

export const projects: Project[] = [
  {
    slug: 'grounddesk',
    title: 'GroundDesk',
    subtitle: 'Evidence-Grounded Support Analytics Copilot',
    category: 'AI systems',
    summary: 'A B2B support analytics product for cited answers, answer traces, and safe escalation when evidence is insufficient.',
    longDescription: 'GroundDesk ingests Markdown, text files, PDFs, and public URLs; performs hybrid retrieval; generates cited answers; stores answer traces in PostgreSQL; and safely escalates unsupported or ambiguous questions.',
    technologies: ['Python', 'FastAPI', 'Gemini API', 'Qdrant', 'Supabase PostgreSQL'],
    metrics: ['100% top-citation accuracy', '93.8% answer-term coverage', '100% escalation accuracy'],
    featured: true,
    liveUrl: 'https://ground-desk.onrender.com/',
    visualType: 'grounddesk',
    sections: [
      { title: 'Context', body: 'Support analytics becomes harder to trust when answers cannot show where they came from or when the system guesses beyond its source material.' },
      { title: 'Approach', body: 'The product combines hybrid retrieval, cited generation, an evaluation pipeline, and explicit escalation paths for unsupported and ambiguous queries.' },
      { title: 'Architecture', body: 'Documents and public URLs flow through ingestion and retrieval into a FastAPI application. Qdrant supports retrieval, while Supabase PostgreSQL stores answer traces for inspection.' },
      { title: 'Evaluation', body: 'The benchmark measures citation correctness, expected answer-term coverage, and escalation behavior across answerable, unsupported, and ambiguous cases.' },
      { title: 'Results', body: 'The reported benchmark results show 100% correct top citation on answerable cases, 93.8% expected answer-term coverage, and 100% escalation accuracy on unsupported and ambiguous queries.' },
      { title: 'Limitations and next steps', body: 'The available project material does not specify broader deployment scale or additional evaluation sets, so this case study keeps the scope focused on evidence quality and traceability.' },
    ],
  },
  {
    slug: 'mlp-trainer-agentic-tutor',
    title: 'MLP Trainer + Agentic LLM Tutor',
    category: 'Software engineering',
    summary: 'A live neural-network visualizer paired with an observable, streaming tutor for learning by inspection.',
    longDescription: 'The platform implements a 2-4-1 neural network with forward propagation, backpropagation, MSE loss, SGD, deterministic initialization, and live inspection of weights, activations, loss curves, and predictions. It also includes an agentic AI tutor with tool calling, bounded multi-turn memory, server-sent event streaming, MCP integration, and observability.',
    technologies: ['Rust', 'Axum', 'Tokio', 'React', 'TypeScript', 'FastAPI', 'Groq API', 'MCP', 'Langfuse', 'OpenTelemetry', 'Docker'],
    metrics: ['2-4-1 network visualizer', 'Live weights and loss inspection'],
    featured: true,
    visualType: 'mlp',
    sections: [
      { title: 'Context', body: 'Neural-network fundamentals are easier to understand when the math, intermediate values, and training behavior can be inspected together.' },
      { title: 'Approach', body: 'The trainer implements forward propagation, backpropagation, MSE loss, SGD, deterministic initialization, and live views of the model state. A separate tutor adds tool calling, bounded memory, streaming, and MCP integration.' },
      { title: 'Architecture', body: 'Rust services built with Axum and Tokio sit alongside React and TypeScript interfaces, FastAPI services, Docker packaging, and an observability layer using Langfuse and OpenTelemetry.' },
      { title: 'Evaluation', body: 'The product is organized around deterministic initialization and direct inspection of weights, activations, loss curves, and predictions rather than an opaque training experience.' },
      { title: 'Limitations and next steps', body: 'No public repository or performance benchmark was supplied, so this case study describes the implemented learning and systems surface without claiming deployment scale.' },
    ],
  },
  {
    slug: 'nrg',
    title: 'NRG',
    subtitle: 'Spanish Power Price Forecasting and Reporting Platform',
    category: 'Data platforms',
    summary: 'A research platform for validated energy-market data, time-series forecasts, backtests, and reporting.',
    longDescription: 'NRG loads Spanish energy-market data into PostgreSQL, validates it with SQL data-quality checks, exports analytical Parquet marts, trains time-series models, and exposes forecasts and backtests through an API and dashboard.',
    technologies: ['Python', 'SQL', 'PostgreSQL', 'scikit-learn', 'MLflow', 'FastAPI', 'React', 'TypeScript'],
    metrics: ['Ridge test MAE: 2.23 EUR/MWh', 'Walk-forward MAE: 2.24 EUR/MWh', 'Temporal baseline MAE: 2.86 EUR/MWh'],
    featured: true,
    visualType: 'nrg',
    sections: [
      { title: 'Context', body: 'Energy forecasting requires careful temporal validation and a data path that keeps market inputs, analytical marts, models, and reports connected.' },
      { title: 'Approach', body: 'The platform loads market data into PostgreSQL, validates it with SQL checks, exports Parquet marts, trains time-series models, and serves forecasts and backtests through an API and dashboard.' },
      { title: 'Architecture', body: 'The data and model workflow uses PostgreSQL, SQL validation, Parquet artifacts, scikit-learn models, and MLflow tracking. FastAPI and a React/TypeScript dashboard expose the resulting analysis.' },
      { title: 'Evaluation', body: 'Evaluation includes temporal validation and walk-forward testing so the reported forecast errors reflect the ordering of market data.' },
      { title: 'Results', body: 'The reported Ridge test MAE is 2.23 EUR/MWh, the walk-forward MAE is 2.24 EUR/MWh, and the temporal baseline MAE is 2.86 EUR/MWh.' },
      { title: 'Limitations and next steps', body: 'The supplied project material does not provide a public demo or repository, so those links are intentionally omitted.' },
    ],
  },
  {
    slug: 'qnt',
    title: 'QNT',
    subtitle: 'Regime-Aware Quantitative Research Platform',
    category: 'Quantitative',
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
    category: 'Machine learning',
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
    category: 'Research',
    summary: 'An ongoing study of selective forgetting in frozen CLIP models using parameter-efficient adapters and evaluation trade-offs.',
    longDescription: 'Built a machine-unlearning pipeline for frozen CLIP vision-language models using CIFAR-10 and CIFAR-100 retain/forget splits and adapter-only checkpoints. The work compares parameter-efficient unlearning against several baselines and measures retain, forget, sibling-class, membership-inference, and semantic-subspace behavior.',
    technologies: ['CLIP', 'LoRA', 'H-TGSD', 'CIFAR-10', 'CIFAR-100', 'SLURM'],
    metrics: ['0.6% forget-train accuracy', '11.0% rose-test accuracy', '91.75% sibling-flower accuracy', '86.32% retain accuracy'],
    dates: 'February 2026 – Present',
    role: 'Ongoing research',
    featured: false,
    visualType: 'unlearning',
    sections: [
      { title: 'Context', body: 'The project studies selective forgetting in frozen CLIP vision-language models while preserving useful behavior on retained and related classes.' },
      { title: 'Approach', body: 'The pipeline uses CIFAR-10 and CIFAR-100 retain/forget splits with adapter-only checkpoints. It implements CLIP ViT-B/16 vision LoRA and H-TGSD for flower-superclass forgetting and selective rose forgetting.' },
      { title: 'Evaluation', body: 'Comparisons include GA+KL, retain-only training, counterfactual or entropy rebind baselines, and no-sibling ablations. Evaluation includes retain accuracy, target forget accuracy, sibling-class accuracy, membership-inference attacks, semantic-subspace metrics, and trade-off plots.' },
      { title: 'Preliminary results', body: 'The preliminary selective-rose results report 0.6% forget-train accuracy, 11.0% rose-test accuracy, 91.75% sibling-flower accuracy, and 86.32% retain accuracy.' },
      { title: 'Limitations and next steps', body: 'This is ongoing research. It is presented as a research project, not as a published paper or accepted conference work.' },
    ],
  },
];

export const featuredProjects = projects.filter((project) => project.featured);
export const detailProjects = projects.filter((project) => project.sections);
export const projectBySlug = (slug: string) => projects.find((project) => project.slug === slug);

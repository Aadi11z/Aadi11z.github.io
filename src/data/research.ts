import { projectBySlug } from './projects';

export type ResearchEntryData = {
  title: string;
  dates: string;
  status: string;
  technology: readonly string[];
  abstract: string;
  methods: string;
  evaluation: string;
  result: string;
  detailSlug?: string;
};

export const research: ResearchEntryData[] = [
  {
    title: 'Machine Unlearning in Vision-Language Models',
    dates: 'February 2026 – Present',
    status: 'Ongoing research',
    technology: ['CLIP', 'LoRA', 'H-TGSD', 'CIFAR-10', 'CIFAR-100', 'SLURM'],
    abstract: 'Built a machine-unlearning pipeline for frozen CLIP vision-language models using CIFAR-10 and CIFAR-100 retain/forget splits and adapter-only checkpoints.',
    methods: 'Implemented parameter-efficient unlearning using CLIP ViT-B/16 vision LoRA and H-TGSD for flower-superclass forgetting and selective rose forgetting.',
    evaluation: 'Compared GA+KL, retain-only training, counterfactual or entropy rebind baselines, and no-sibling ablations across retain, forget, sibling-class, membership-inference, semantic-subspace, and trade-off metrics.',
    result: 'Preliminary selective-rose results: 0.6% forget-train accuracy, 11.0% rose-test accuracy, 91.75% sibling-flower accuracy, and 86.32% retain accuracy.',
    detailSlug: 'machine-unlearning-vision-language-models',
  },
  {
    title: 'Finetuning Defence Strategies for Adversarial Datasets',
    dates: 'February 2025 – June 2025',
    status: 'Completed research project',
    technology: ['DistilBERT', 'InfoBERT', 'RanMASK', 'ANLI', 'BReLU', 'RGeLU', 't-Sigmoid'],
    abstract: 'Studied adversarial NLP threats across character, word, sentence, and multi-level perturbations.',
    methods: 'Benchmarked bounded intermediate activation functions across DistilBERT, InfoBERT, and RanMASK variants.',
    evaluation: 'The study evaluated performance on adversarial NLP variants and compared activation-function strategies against a DistilBERT-ANLI baseline.',
    result: 'RGeLU improved InfoBERT ANLI accuracy from 32.2% to 48.1%, exceeding the 46.9% DistilBERT-ANLI baseline.',
  },
] as const;

export const unlearningProject = projectBySlug('machine-unlearning-vision-language-models');

import { projectBySlug } from './projects';

export type ResearchEntryData = {
  title: string;
  dates: string;
  status: string;
  technology: readonly string[];
  question: string;
  motivation: string;
  methods: string;
  evaluation: string;
  result: string;
  limitations: string;
  openQuestion: string;
  detailSlug?: string;
};

export const research: ResearchEntryData[] = [
  {
    title: 'Machine Unlearning in Vision-Language Models',
    dates: 'February 2026 – Present',
    status: 'Ongoing research',
    technology: ['CLIP', 'LoRA', 'H-TGSD', 'CIFAR-10', 'CIFAR-100', 'SLURM'],
    question: 'Can a frozen vision-language model selectively forget a target concept while preserving retained and sibling-class behavior?',
    motivation: 'Selective forgetting is only useful when removing a target does not collapse the model’s broader utility or closely related semantic classes.',
    methods: 'Implemented CLIP ViT-B/16 vision LoRA and H-TGSD with CIFAR-10 and CIFAR-100 retain/forget splits and adapter-only checkpoints.',
    evaluation: 'Compared GA+KL, retain-only training, counterfactual or entropy rebind baselines, and no-sibling ablations across retain, forget, sibling-class, membership-inference, semantic-subspace, and trade-off metrics.',
    result: 'Preliminary selective-rose results: 0.6% forget-train accuracy, 11.0% rose-test accuracy, 91.75% sibling-flower accuracy, and 86.32% retain accuracy.',
    limitations: 'The work is ongoing, and the supplied material contains one preliminary selective-rose result set rather than a complete numeric comparison table.',
    openQuestion: 'How should target forgetting, retained utility, sibling preservation, and privacy leakage be balanced across methods?',
    detailSlug: 'machine-unlearning-vision-language-models',
  },
  {
    title: 'Finetuning Defence Strategies for Adversarial Datasets',
    dates: 'February 2025 – June 2025',
    status: 'Completed research project',
    technology: ['DistilBERT', 'InfoBERT', 'RanMASK', 'ANLI', 'BReLU', 'RGeLU', 't-Sigmoid'],
    question: 'Can bounded intermediate activation functions improve robustness across adversarial NLP model variants?',
    motivation: 'Adversarial perturbations can operate at character, word, sentence, and multi-level scales, requiring evaluation beyond a single attack type.',
    methods: 'Benchmarked bounded intermediate activation functions across DistilBERT, InfoBERT, and RanMASK variants on ANLI.',
    evaluation: 'Compared activation-function strategies against InfoBERT and a DistilBERT-ANLI baseline under adversarial examples.',
    result: 'RGeLU improved InfoBERT ANLI accuracy from 32.2% to 48.1%, exceeding the 46.9% DistilBERT-ANLI baseline.',
    limitations: 'The supplied material describes a completed research project, not a publication or accepted conference paper.',
    openQuestion: 'How consistently do bounded activations generalize across model architectures and perturbation levels?',
  },
] as const;

export const unlearningProject = projectBySlug('machine-unlearning-vision-language-models');

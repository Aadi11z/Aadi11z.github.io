export type UnlearningMethodId = 'h-tgsd' | 'ga-kl' | 'retain-only' | 'rebind';
export type UnlearningSplitId = 'selective-rose' | 'flower-superclass';
export type EvaluationPerspective = 'accuracy' | 'privacy' | 'tradeoff';

export type UnlearningObservation = {
  method: UnlearningMethodId;
  split: UnlearningSplitId;
  strength: 'reported-checkpoint';
  provenance: 'measured';
  retainAccuracy: number;
  forgetTrainAccuracy: number;
  forgetTestAccuracy: number;
  siblingAccuracy: number;
  membershipInference: null;
  source: string;
};

export const unlearningMethods = [
  { id: 'h-tgsd', label: 'H-TGSD', note: 'Measured selective-rose checkpoint available.' },
  { id: 'ga-kl', label: 'GA+KL', note: 'Comparison baseline; numeric result not supplied.' },
  { id: 'retain-only', label: 'Retain-only', note: 'Comparison baseline; numeric result not supplied.' },
  { id: 'rebind', label: 'Counterfactual / entropy rebind', note: 'Comparison baseline; numeric result not supplied.' },
] satisfies Array<{ id: UnlearningMethodId; label: string; note: string }>;

export const unlearningSplits = [
  { id: 'selective-rose', label: 'Selective rose' },
  { id: 'flower-superclass', label: 'Flower superclass' },
] satisfies Array<{ id: UnlearningSplitId; label: string }>;

export const unlearningObservations: UnlearningObservation[] = [
  {
    method: 'h-tgsd',
    split: 'selective-rose',
    strength: 'reported-checkpoint',
    provenance: 'measured',
    retainAccuracy: 86.32,
    forgetTrainAccuracy: 0.6,
    forgetTestAccuracy: 11.0,
    siblingAccuracy: 91.75,
    membershipInference: null,
    source: 'Preliminary selective-rose result supplied in the résumé.',
  },
];

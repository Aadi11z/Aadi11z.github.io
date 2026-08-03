type Method = { id: string; label: string; note: string };
type Observation = {
  method: string;
  split: string;
  strength: string;
  retainAccuracy: number;
  forgetTrainAccuracy: number;
  forgetTestAccuracy: number;
  siblingAccuracy: number;
  membershipInference: number | null;
  source: string;
};

document.querySelectorAll<HTMLElement>('[data-unlearning-explorer]').forEach((root) => {
  const dataElement = root.querySelector<HTMLScriptElement>('[data-explorer-data]');
  if (!dataElement?.textContent) return;
  const data = JSON.parse(dataElement.textContent) as { methods: Method[]; observations: Observation[] };
  const method = root.querySelector<HTMLSelectElement>('[data-explorer-method]');
  const strength = root.querySelector<HTMLSelectElement>('[data-explorer-strength]');
  const split = root.querySelector<HTMLSelectElement>('[data-explorer-split]');
  const perspective = root.querySelector<HTMLSelectElement>('[data-explorer-perspective]');
  const summary = root.querySelector<HTMLElement>('[data-explorer-summary]');
  const source = root.querySelector<HTMLElement>('[data-explorer-source]');
  const point = root.querySelector<SVGGElement>('[data-chart-point]');

  const setMetric = (name: string, value: string) => {
    const element = root.querySelector<HTMLElement>(`[data-metric="${name}"]`);
    if (element) element.textContent = value;
  };

  const render = () => {
    const selectedMethod = method?.value ?? 'h-tgsd';
    const selectedSplit = split?.value ?? 'selective-rose';
    const selectedStrength = strength?.value ?? 'reported-checkpoint';
    const selectedPerspective = perspective?.value ?? 'accuracy';
    root.dataset.perspective = selectedPerspective;
    const observation = data.observations.find((item) => item.method === selectedMethod && item.split === selectedSplit && item.strength === selectedStrength);
    const methodLabel = data.methods.find((item) => item.id === selectedMethod)?.label ?? selectedMethod;

    root.querySelectorAll('[data-method-row]').forEach((row) => row.toggleAttribute('data-selected', row.getAttribute('data-method-row') === selectedMethod));

    if (!observation) {
      setMetric('retain', 'Not supplied');
      setMetric('forget', 'Not supplied');
      setMetric('sibling', 'Not supplied');
      setMetric('privacy', 'Not supplied');
      point?.setAttribute('hidden', '');
      if (summary) summary.textContent = `A numeric ${methodLabel} result for this split was not supplied. The method is part of the comparison plan, but the portfolio does not estimate missing measurements.`;
      if (source) source.textContent = 'No measured observation is available for the selected combination.';
      return;
    }

    setMetric('retain', `${observation.retainAccuracy}%`);
    setMetric('forget', `${observation.forgetTestAccuracy}%`);
    setMetric('sibling', `${observation.siblingAccuracy}%`);
    setMetric('privacy', observation.membershipInference === null ? 'Not reported' : `${observation.membershipInference}%`);
    const x = 45 + observation.forgetTestAccuracy * 3.4;
    const y = 220 - observation.retainAccuracy * 1.9;
    point?.removeAttribute('hidden');
    point?.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
    if (summary) summary.textContent = `The measured ${methodLabel} selective-rose checkpoint retains ${observation.retainAccuracy}% accuracy, reports ${observation.forgetTestAccuracy}% rose-test accuracy and ${observation.forgetTrainAccuracy}% forget-train accuracy, and preserves ${observation.siblingAccuracy}% sibling-flower accuracy. A numeric membership-inference result was not supplied.`;
    if (source) source.textContent = observation.source;
  };

  [method, strength, split, perspective].forEach((control) => control?.addEventListener('change', render));
  render();
});

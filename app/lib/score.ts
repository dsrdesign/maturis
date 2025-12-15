type DomainKey = 'EDM'|'APO'|'BAI'|'DSS'|'MEA';

const defaultWeights: Record<string, Record<DomainKey, number>> = {
  bank: { EDM: 0.15, APO: 0.20, BAI: 0.20, DSS: 0.25, MEA: 0.20 },
  health: { EDM: 0.15, APO: 0.20, BAI: 0.20, DSS: 0.30, MEA: 0.15 },
  industry: { EDM: 0.15, APO: 0.20, BAI: 0.25, DSS: 0.25, MEA: 0.15 },
  default: { EDM: 0.15, APO: 0.20, BAI: 0.20, DSS: 0.25, MEA: 0.20 },
};

export function getWeightsForSector(sector?: string) {
  return (sector && defaultWeights[sector]) ? defaultWeights[sector] : defaultWeights.default;
}

export function computeDomainAverage(domainValues: number[]) {
  if (!domainValues || domainValues.length === 0) return 0;
  const s = domainValues.reduce((a,b) => a + b, 0);
  return s / domainValues.length;
}

export function computeGlobalScore(domainScores: Record<DomainKey, number>, sector?: string) {
  const weights = getWeightsForSector(sector) as Record<DomainKey, number>;
  const domains: DomainKey[] = ['EDM','APO','BAI','DSS','MEA'];
  let sg = 0;
  for (const d of domains) {
    const val = domainScores[d] ?? 0;
    sg += val * (weights[d] ?? 0);
  }
  // clamp between 0 and 5
  return Math.max(0, Math.min(5, Number((sg).toFixed(2))));
}

export function cobitLevelFromScore(sg: number) {
  if (sg < 1) return 0;
  if (sg < 2) return 1;
  if (sg < 3) return 2;
  if (sg < 4) return 3;
  if (sg < 5) return 4;
  return 5;
}

export function recommendationsForDomain(domain: DomainKey, value: number) {
  // returns an array of recommendation strings based on domain and its score
  const lvl = Math.floor(value);
  const map: Record<number, string[]> = {
    0: [
      'Mettre en place les bases : politiques, rôles, sauvegardes et comité de pilotage.',
    ],
    1: [
      'Formaliser les processus clés et définir des responsables.',
    ],
    2: [
      'Documenter et standardiser les processus, créer un registre des risques.',
    ],
    3: [
      'Mesurer via KPI et améliorer la gouvernance et le suivi des actions.',
    ],
    4: [
      'Optimiser avec indicateurs avancés et intégration continue.',
    ],
    5: [
      'Maintenir l’amélioration continue et benchmark externe.',
    ],
  };
  return map[lvl] ?? map[0];
}

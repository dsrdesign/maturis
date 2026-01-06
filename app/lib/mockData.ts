export const organizations = [
  {
    id: "org-1",
    name: "Acme Corp",
    description: "Entreprise spécialisée en services numériques",
    country: "Cameroun",
    city: "Douala",
    employees: 250,
    revenue: 15000000,
    creationDate: "2015-03-15",
    legalForm: "SAS",
    sector: 'bank',
    score: 78,
    lastAudit: "2025-10-12",
    domainScores: { EDM: 3.2, APO: 2.8, BAI: 3.5, DSS: 2.7, MEA: 3.0 },
    audits: [
      { id: 'a1', date: '2025-10-12', score: 78, title: 'Audit Infrastructures IT' },
      { id: 'a0', date: '2024-06-05', score: 71, title: 'Audit Sécurité & Gouvernance' },
    ],
  },
  {
    id: "org-2",
    name: "Bionet",
    description: "Start-up biotech",
    country: "Sénégal",
    city: "Dakar",
    employees: 45,
    revenue: 2500000,
    creationDate: "2020-06-10",
    legalForm: "SAS",
    sector: 'health',
    score: 62,
    lastAudit: "2025-08-02",
    domainScores: { EDM: 2.6, APO: 3.2, BAI: 2.9, DSS: 2.1, MEA: 2.8 },
    audits: [
      { id: 'b1', date: '2025-08-02', score: 62, title: 'Audit Processus' },
      { id: 'b0', date: '2024-11-20', score: 58, title: 'Audit Initial' },
    ],
  },
  {
    id: "org-3",
    name: "Municipalité X",
    description: "Collectivité locale",
    country: "Côte d'Ivoire",
    city: "Abidjan",
    employees: 180,
    revenue: 8000000,
    creationDate: "2010-01-01",
    legalForm: "Collectivité territoriale",
    sector: 'industry',
    score: 54,
    lastAudit: "2025-07-19",
    domainScores: { EDM: 2.4, APO: 2.7, BAI: 2.5, DSS: 2.9, MEA: 2.2 },
    audits: [
      { id: 'm1', date: '2025-07-19', score: 54, title: 'Audit Gouvernance' },
    ],
  },
];

export const qcmQuestions = [
  {
    id: "q1",
    question: "L'organisation dispose-t-elle d'une stratégie formelle pour la gouvernance IT?",
    options: [
      { id: "a", label: "Oui, documentée et revue régulièrement" },
      { id: "b", label: "Partiellement, éléments informels" },
      { id: "c", label: "Non" },
    ],
  },
  {
    id: "q2",
    question: "Des indicateurs clés (KPI) sont-ils suivis pour la sécurité de l'information?",
    options: [
      { id: "a", label: "Oui, tableau de bord en place" },
      { id: "b", label: "Certains indicateurs" },
      { id: "c", label: "Non" },
    ],
  },
  {
    id: "q3",
    question: "Les rôles et responsabilités IT sont-ils définis et communiqués?",
    options: [
      { id: "a", label: "Oui, avec descriptions de postes" },
      { id: "b", label: "Partiellement" },
      { id: "c", label: "Non" },
    ],
  },
];

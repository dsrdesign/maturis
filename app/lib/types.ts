export type Organization = {
  id: string;
  name: string;
  description: string;
  country: string;
  city: string;
  employees: number;
  revenue: number;
  creationDate: string;
  legalForm: string;
  sector: string;
  score: number;
  lastAudit: string;
  domainScores: {
    EDM: number;
    APO: number;
    BAI: number;
    DSS: number;
    MEA: number;
  };
  audits: Array<{
    id: string;
    date: string;
    score: number;
    title: string;
  }>;
};

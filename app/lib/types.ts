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
  domainWeights?: {
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
    domainScores?: {
      EDM: number;
      APO: number;
      BAI: number;
      DSS: number;
      MEA: number;
    };
    responses?: Array<{
      domain: string;
      questionText: string;
      selectedAnswer: string;
      answerValue: number;
      scaleMax: number;
    }>;
  }>;
};

export type System = {
  id: string;
  name: string;
  description?: string;
  organizationIds: string[];
  userIds: string[];
};

export type UserRole = 'admin' | 'decideur' | 'evaluation';

export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  systemId: string;
  organizationIds: string[];
};

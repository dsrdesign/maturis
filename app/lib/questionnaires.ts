export type Option = { label: string; value: number };
export type Question = {
  id: string;
  code?: string;
  text: string;
  options: Option[];
  scaleMax: number; // raw maximum value (e.g. 4 or 5)
};

export type DomainSet = {
  code: string;
  name: string;
  questions: Question[];
};

export const questionnaires: Record<string, { sectorName: string; domains: Record<string, DomainSet> }> = {
  health: {
    sectorName: 'Santé & Hôpitaux',
    domains: {
      EDM: {
        code: 'EDM',
        name: 'Gouvernance',
        questions: [
          {
            id: 'EDM01',
            text: "Votre hôpital dispose-t-il d’un cadre officiel pour piloter les systèmes d’information hospitaliers ?",
            options: [
              { label: 'Non', value: 0 },
              { label: 'Partiel', value: 2 },
              { label: 'Oui', value: 4 },
            ],
            scaleMax: 4,
          },
          {
            id: 'EDM02',
            text: "Vos projets numériques (DME, téléconsultation, imagerie connectée) sont-ils suivis pour vérifier qu’ils apportent les bénéfices attendus ?",
            options: [
              { label: 'Jamais', value: 0 },
              { label: 'Rarement', value: 1 },
              { label: 'Parfois', value: 2 },
              { label: 'Souvent', value: 3 },
              { label: 'Toujours', value: 4 },
            ],
            scaleMax: 4,
          },
          {
            id: 'EDM03',
            text: "Existe-t-il un comité ou une instance qui supervise les risques numériques (cyber, confidentialité) ?",
            options: [
              { label: 'Non', value: 0 },
              { label: 'Oui', value: 4 },
            ],
            scaleMax: 4,
          },
          {
            id: 'EDM04',
            text: "Les ressources IT (personnel, budget, équipements médicaux numériques) sont-elles suivies pour efficacité ?",
            options: [
              { label: 'Non', value: 0 },
              { label: 'Partiel', value: 2 },
              { label: 'Oui', value: 4 },
            ],
            scaleMax: 4,
          },
          {
            id: 'EDM05',
            text: "Les résultats et incidents IT sont-ils communiqués à la direction médicale/administrative ?",
            options: [
              { label: 'Non', value: 0 },
              { label: 'Rarement', value: 1 },
              { label: 'Régulièrement', value: 3 },
              { label: 'Systématique', value: 5 },
            ],
            scaleMax: 5,
          },
        ],
      },

      APO: {
        code: 'APO',
        name: 'Alignement, Planification et Organisation',
        questions: [
          { id: 'APO01', text: 'Existe-t-il des politiques formelles pour encadrer l’usage des SI hospitaliers ?', options: [{ label: 'Non', value: 0 }, { label: 'Oui', value: 4 }], scaleMax: 4 },
          { id: 'APO02', text: 'Votre hôpital dispose-t-il d’une stratégie numérique ?', options: [{ label: 'Non', value: 0 }, { label: 'En cours', value: 2 }, { label: 'Oui', value: 4 }], scaleMax: 4 },
          { id: 'APO03', text: 'Disposez-vous d’une cartographie claire des systèmes médicaux et administratifs ?', options: [{ label: 'Non', value: 0 }, { label: 'Oui', value: 4 }], scaleMax: 4 },
          { id: 'APO04', text: "Évaluez-vous régulièrement l’adoption de nouvelles technologies médicales ?", options: [{ label: 'Jamais', value: 0 }, { label: 'Rarement', value: 1 }, { label: 'Parfois', value: 2 }, { label: 'Souvent', value: 3 }, { label: 'Toujours', value: 4 }], scaleMax: 4 },
          { id: 'APO05', text: 'Disposez-vous d’un tableau de suivi des projets numériques hospitaliers ?', options: [{ label: 'Non', value: 0 }, { label: 'Oui', value: 4 }], scaleMax: 4 },
          { id: 'APO06', text: 'Les coûts numériques sont-ils suivis précisément ?', options: [{ label: 'Non', value: 0 }, { label: 'Partiellement', value: 2 }, { label: 'Oui', value: 4 }], scaleMax: 4 },
          { id: 'APO07', text: 'Existe-t-il un plan de formation numérique pour le personnel ?', options: [{ label: 'Non', value: 0 }, { label: 'Oui', value: 4 }], scaleMax: 4 },
          { id: 'APO08', text: 'Les services médicaux et l’IT collaborent-ils régulièrement ?', options: [{ label: 'Jamais', value: 0 }, { label: 'Rarement', value: 1 }, { label: 'Parfois', value: 2 }, { label: 'Souvent', value: 3 }, { label: 'Toujours', value: 4 }], scaleMax: 4 },
          { id: 'APO09', text: 'Avez-vous des SLA internes pour la disponibilité des applications critiques ?', options: [{ label: 'Non', value: 0 }, { label: 'Oui', value: 4 }], scaleMax: 4 },
          { id: 'APO10', text: 'Vos contrats avec les éditeurs médicaux incluent-ils des clauses de sécurité/continuité ?', options: [{ label: 'Non', value: 0 }, { label: 'Oui', value: 4 }], scaleMax: 4 },
          { id: 'APO11', text: 'Les solutions numériques hospitalières font-elles l’objet de tests qualité ?', options: [{ label: 'Non', value: 0 }, { label: 'Oui', value: 4 }], scaleMax: 4 },
          { id: 'APO12', text: 'Disposez-vous d’une cartographie des risques IT liés aux soins ?', options: [{ label: 'Aucune', value: 0 }, { label: 'Partielle', value: 1 }, { label: 'Générale', value: 2 }, { label: 'Documentée', value: 3 }, { label: 'Suivie', value: 4 }, { label: 'Conforme régulateur', value: 5 }], scaleMax: 5 },
          { id: 'APO13', text: 'Appliquez-vous des normes (ISO 27001, HDS, RGPD Santé) ?', options: [{ label: 'Non', value: 0 }, { label: 'Partiel', value: 2 }, { label: 'Oui', value: 4 }], scaleMax: 4 },
        ],
      },

      BAI: {
        code: 'BAI',
        name: 'Construire, Acquérir et Mettre en œuvre',
        questions: [
          { id: 'BAI01', text: 'Les projets numériques suivent-ils une méthodologie formelle ?', options: [{ label: 'Non', value: 0 }, { label: 'Partiel', value: 2 }, { label: 'Oui', value: 4 }], scaleMax: 4 },
          { id: 'BAI02', text: 'Les besoins médicaux et administratifs sont-ils documentés ?', options: [{ label: 'Non', value: 0 }, { label: 'Oui', value: 4 }], scaleMax: 4 },
          { id: 'BAI03', text: 'Réalisez-vous des tests utilisateurs avant mise en production ?', options: [{ label: 'Non', value: 0 }, { label: 'Oui', value: 4 }], scaleMax: 4 },
          { id: 'BAI04', text: 'Suivez-vous la disponibilité des applications critiques ?', options: [{ label: 'Non', value: 0 }, { label: 'Oui', value: 4 }], scaleMax: 4 },
          { id: 'BAI05', text: 'Disposez-vous d’un PCA/PRS garantissant la continuité des soins numériques ?', options: [{ label: 'Aucun', value: 0 }, { label: 'Réflexion', value: 1 }, { label: 'En cours', value: 2 }, { label: 'Documenté', value: 3 }, { label: 'Testé', value: 4 }, { label: 'Conforme normes santé', value: 5 }], scaleMax: 5 },
          { id: 'BAI06', text: 'Les changements IT suivent-ils un processus validé ?', options: [{ label: 'Non', value: 0 }, { label: 'Oui', value: 4 }], scaleMax: 4 },
          { id: 'BAI07', text: 'Les nouveaux outils sont-ils accompagnés d’une formation ?', options: [{ label: 'Non', value: 0 }, { label: 'Oui', value: 4 }], scaleMax: 4 },
          { id: 'BAI08', text: 'Disposez-vous d’une base documentaire IT ?', options: [{ label: 'Non', value: 0 }, { label: 'Oui', value: 4 }], scaleMax: 4 },
          { id: 'BAI09', text: 'Les équipements et logiciels médicaux sont-ils inventoriés ?', options: [{ label: 'Non', value: 0 }, { label: 'Oui', value: 4 }], scaleMax: 4 },
          { id: 'BAI10', text: 'Utilisez-vous un outil de gestion de configuration ?', options: [{ label: 'Non', value: 0 }, { label: 'Oui', value: 4 }], scaleMax: 4 },
          { id: 'BAI11', text: 'Les projets intègrent-ils la cybersécurité dès la conception ?', options: [{ label: 'Non', value: 0 }, { label: 'Oui', value: 4 }], scaleMax: 4 },
        ],
      },

      DSS: {
        code: 'DSS',
        name: 'Délivrer, Servir et Soutenir',
        questions: [
          { id: 'DSS01', text: 'Les opérations IT suivent-elles un planning régulier ?', options: [{ label: 'Non', value: 0 }, { label: 'Oui', value: 4 }], scaleMax: 4 },
          { id: 'DSS02', text: 'Disposez-vous d’une procédure documentée pour gérer les incidents ?', options: [{ label: 'Non', value: 0 }, { label: 'Informelle', value: 1 }, { label: 'Doc. peu appliquée', value: 2 }, { label: 'Doc. appliquée', value: 4 }], scaleMax: 4 },
          { id: 'DSS03', text: 'Les causes des incidents récurrents sont-elles analysées et corrigées ?', options: [{ label: 'Non', value: 0 }, { label: 'Oui', value: 4 }], scaleMax: 4 },
          { id: 'DSS04', text: 'Avez-vous testé votre plan de reprise pour assurer la continuité des soins numériques ?', options: [{ label: 'Non', value: 0 }, { label: 'En cours', value: 2 }, { label: 'Oui', value: 4 }], scaleMax: 4 },
          { id: 'DSS05', text: 'Les accès aux systèmes sensibles sont-ils protégés par MFA ?', options: [{ label: 'Non', value: 0 }, { label: 'Oui', value: 4 }], scaleMax: 4 },
          { id: 'DSS06', text: 'Suivez-vous des indicateurs opérationnels (taux disponibilité DME, délais résolution) ?', options: [{ label: 'Non', value: 0 }, { label: 'Oui', value: 4 }], scaleMax: 4 },
        ],
      },

      MEA: {
        code: 'MEA',
        name: 'Surveiller, Évaluer et Apprécier',
        questions: [
          { id: 'MEA01', text: 'Les performances des SI sont-elles évaluées via des tableaux de bord ?', options: [{ label: 'Non', value: 0 }, { label: 'Oui', value: 4 }], scaleMax: 4 },
          { id: 'MEA02', text: "Des audits internes IT sont-ils menés régulièrement ?", options: [{ label: 'Jamais', value: 0 }, { label: 'Rare', value: 1 }, { label: 'Ponctuel', value: 2 }, { label: 'Régulier', value: 3 }, { label: 'Documenté & suivi', value: 4 }, { label: 'Audité selon normes HDS', value: 5 }], scaleMax: 5 },
          { id: 'MEA03', text: 'Comment vérifiez-vous la conformité aux obligations légales (RGPD Santé, HDS) ?', options: [{ label: 'Aucune', value: 0 }, { label: 'Informelle', value: 1 }, { label: 'Ponctuelle', value: 2 }, { label: 'Régulière', value: 3 }, { label: 'Documentée', value: 4 }, { label: 'Audits externes & certification', value: 5 }], scaleMax: 5 },
          { id: 'MEA04', text: 'Faites-vous appel à des prestataires externes pour valider vos pratiques IT ?', options: [{ label: 'Jamais', value: 0 }, { label: 'Rarement', value: 1 }, { label: 'Occasionnellement', value: 2 }, { label: 'Régulièrement', value: 4 }, { label: 'Systématiquement', value: 5 }], scaleMax: 5 },
        ],
      },
    },
  },

  industry: {
    sectorName: 'Industrie & Fabrication',
    domains: {
      EDM: {
        code: 'EDM',
        name: 'Gouvernance et pilotage',
        questions: [
          { id: 'EDM01', text: "L’entreprise dispose-t-elle d’un cadre de gouvernance IT/OT ?", options: [{ label: 'Non', value: 0 }, { label: 'Oui', value: 4 }], scaleMax: 4 },
          { id: 'EDM02', text: 'Les projets d’automatisation sont-ils suivis pour vérifier les bénéfices ?', options: [{ label: 'Jamais', value: 0 }, { label: 'Rarement', value: 1 }, { label: 'Parfois', value: 2 }, { label: 'Souvent', value: 3 }, { label: 'Toujours', value: 4 }], scaleMax: 4 },
          { id: 'EDM03', text: 'Un comité suit-il les risques numériques et industriels ?', options: [{ label: 'Non', value: 0 }, { label: 'Oui', value: 4 }], scaleMax: 4 },
          { id: 'EDM04', text: 'Les ressources (IT/OT) sont-elles suivies pour une utilisation optimale ?', options: [{ label: 'Non', value: 0 }, { label: 'Partiel', value: 2 }, { label: 'Oui', value: 4 }], scaleMax: 4 },
          { id: 'EDM05', text: 'Les incidents numériques sont-ils communiqués à la direction ?', options: [{ label: 'Non', value: 0 }, { label: 'Rarement', value: 1 }, { label: 'Régulièrement', value: 3 }, { label: 'Systématique', value: 5 }], scaleMax: 5 },
        ],
      },

      APO: {
        code: 'APO',
        name: 'Alignement, stratégie, organisation',
        questions: [
          { id: 'APO01', text: 'Avez-vous des politiques formelles encadrant l’usage des SI industriels ?', options: [{ label: 'Non', value: 0 }, { label: 'Oui', value: 4 }], scaleMax: 4 },
          { id: 'APO02', text: 'Existe-t-il une stratégie de transformation numérique industrielle ?', options: [{ label: 'Non', value: 0 }, { label: 'En cours', value: 2 }, { label: 'Oui', value: 4 }], scaleMax: 4 },
          { id: 'APO03', text: 'Disposez-vous d’une cartographie claire des systèmes industriels ?', options: [{ label: 'Non', value: 0 }, { label: 'Oui', value: 4 }], scaleMax: 4 },
          { id: 'APO04', text: 'Évaluez-vous régulièrement de nouvelles technologies ?', options: [{ label: 'Jamais', value: 0 }, { label: 'Rarement', value: 1 }, { label: 'Parfois', value: 2 }, { label: 'Souvent', value: 3 }, { label: 'Toujours', value: 4 }], scaleMax: 4 },
          { id: 'APO05', text: 'Un portefeuille projets IT/OT est-il suivi ?', options: [{ label: 'Non', value: 0 }, { label: 'Oui', value: 4 }], scaleMax: 4 },
          { id: 'APO06', text: 'Les coûts liés au numérique sont-ils suivis ?', options: [{ label: 'Non', value: 0 }, { label: 'Partiel', value: 2 }, { label: 'Oui', value: 4 }], scaleMax: 4 },
          { id: 'APO07', text: 'Un plan de formation numérique/industriel existe-t-il ?', options: [{ label: 'Non', value: 0 }, { label: 'Oui', value: 4 }], scaleMax: 4 },
          { id: 'APO08', text: 'Les métiers de production et l’IT collaborent-ils ?', options: [{ label: 'Jamais', value: 0 }, { label: 'Rarement', value: 1 }, { label: 'Parfois', value: 2 }, { label: 'Souvent', value: 3 }, { label: 'Toujours', value: 4 }], scaleMax: 4 },
          { id: 'APO09', text: 'Avez-vous des SLA internes pour les systèmes critiques ?', options: [{ label: 'Non', value: 0 }, { label: 'Oui', value: 4 }], scaleMax: 4 },
          { id: 'APO10', text: 'Vos contrats fournisseurs incluent-ils des clauses de cybersécurité ?', options: [{ label: 'Non', value: 0 }, { label: 'Oui', value: 4 }], scaleMax: 4 },
          { id: 'APO11', text: 'Les projets numériques industriels font-ils l’objet de contrôles qualité ?', options: [{ label: 'Non', value: 0 }, { label: 'Oui', value: 4 }], scaleMax: 4 },
          { id: 'APO12', text: 'Disposez-vous d’une cartographie des risques numériques et industriels ?', options: [{ label: 'Aucune', value: 0 }, { label: 'Partielle', value: 1 }, { label: 'Générale', value: 2 }, { label: 'Documentée', value: 3 }, { label: 'Suivie', value: 4 }, { label: 'Conforme régulateur', value: 5 }], scaleMax: 5 },
          { id: 'APO13', text: 'Appliquez-vous des normes (ISO 27001, IEC 62443) ?', options: [{ label: 'Non', value: 0 }, { label: 'Partiel', value: 2 }, { label: 'Oui', value: 4 }], scaleMax: 4 },
        ],
      },

      BAI: {
        code: 'BAI',
        name: 'Construire, Acquérir, Mettre en œuvre',
        questions: [
          { id: 'BAI01', text: 'Les projets numériques suivent-ils une méthodologie formelle ?', options: [{ label: 'Non', value: 0 }, { label: 'Partiel', value: 2 }, { label: 'Oui', value: 4 }], scaleMax: 4 },
          { id: 'BAI02', text: 'Les besoins des usines sont-ils documentés ?', options: [{ label: 'Non', value: 0 }, { label: 'Oui', value: 4 }], scaleMax: 4 },
          { id: 'BAI03', text: 'Testez-vous les solutions avec les opérateurs ?', options: [{ label: 'Non', value: 0 }, { label: 'Oui', value: 4 }], scaleMax: 4 },
          { id: 'BAI04', text: 'La disponibilité des systèmes critiques est-elle suivie ?', options: [{ label: 'Non', value: 0 }, { label: 'Oui', value: 4 }], scaleMax: 4 },
          { id: 'BAI05', text: 'Disposez-vous d’un PCA/PRS pour la continuité de la production ?', options: [{ label: 'Aucun', value: 0 }, { label: 'Réflexion', value: 1 }, { label: 'En cours', value: 2 }, { label: 'Documenté', value: 3 }, { label: 'Testé', value: 4 }, { label: 'Conforme norme & testé', value: 5 }], scaleMax: 5 },
          { id: 'BAI06', text: 'Les changements IT/OT suivent-ils un processus formel ?', options: [{ label: 'Non', value: 0 }, { label: 'Oui', value: 4 }], scaleMax: 4 },
          { id: 'BAI07', text: 'Les nouveaux outils sont accompagnés de formation ?', options: [{ label: 'Non', value: 0 }, { label: 'Oui', value: 4 }], scaleMax: 4 },
          { id: 'BAI08', text: 'Disposez-vous d’une base documentaire IT/OT ?', options: [{ label: 'Non', value: 0 }, { label: 'Oui', value: 4 }], scaleMax: 4 },
          { id: 'BAI09', text: 'Les équipements sont-ils inventoriés ?', options: [{ label: 'Non', value: 0 }, { label: 'Oui', value: 4 }], scaleMax: 4 },
          { id: 'BAI10', text: 'Utilisez-vous des outils de gestion de configuration ?', options: [{ label: 'Non', value: 0 }, { label: 'Oui', value: 4 }], scaleMax: 4 },
          { id: 'BAI11', text: 'La cybersécurité est-elle intégrée dès la conception ?', options: [{ label: 'Non', value: 0 }, { label: 'Oui', value: 4 }], scaleMax: 4 },
        ],
      },

      MEA: {
        code: 'MEA',
        name: 'Surveiller, Évaluer, Apprécier',
        questions: [
          { id: 'MEA01', text: 'Les performances numériques sont-elles mesurées ?', options: [{ label: 'Non', value: 0 }, { label: 'Oui', value: 4 }], scaleMax: 4 },
          { id: 'MEA02', text: 'Réalisez-vous des audits IT/OT internes ?', options: [{ label: 'Jamais', value: 0 }, { label: 'Rare', value: 1 }, { label: 'Ponctuel', value: 2 }, { label: 'Régulier', value: 3 }, { label: 'Documenté & suivi', value: 4 }, { label: 'Audité', value: 5 }], scaleMax: 5 },
          { id: 'MEA03', text: 'Vérifiez-vous la conformité réglementaire ?', options: [{ label: 'Aucune', value: 0 }, { label: 'Informelle', value: 1 }, { label: 'Ponctuelle', value: 2 }, { label: 'Régulière', value: 3 }, { label: 'Documentée', value: 4 }, { label: 'Audits externes', value: 5 }], scaleMax: 5 },
          { id: 'MEA04', text: 'Faites-vous appel à des auditeurs externes ?', options: [{ label: 'Jamais', value: 0 }, { label: 'Rarement', value: 1 }, { label: 'Occasionnel', value: 2 }, { label: 'Régulièrement', value: 4 }, { label: 'Systématiquement', value: 5 }], scaleMax: 5 },
        ],
      },

      DSS: {
        code: 'DSS',
        name: 'Délivrer, Servir et Soutenir',
        questions: [
          { id: 'DSS01', text: 'Les opérations IT/OT suivent-elles un planning régulier ?', options: [{ label: 'Non', value: 0 }, { label: 'Oui', value: 4 }], scaleMax: 4 },
          { id: 'DSS02', text: 'Disposez-vous d’une procédure de gestion incidents ?', options: [{ label: 'Non', value: 0 }, { label: 'Informelle', value: 1 }, { label: 'Documentée mais peu appliquée', value: 2 }, { label: 'Documentée et appliquée', value: 4 }], scaleMax: 4 },
          { id: 'DSS03', text: 'Les causes racines des arrêts sont-elles analysées et corrigées ?', options: [{ label: 'Non', value: 0 }, { label: 'Oui', value: 4 }], scaleMax: 4 },
          { id: 'DSS04', text: 'Testez-vous la reprise après sinistre numérique ?', options: [{ label: 'Non', value: 0 }, { label: 'En cours', value: 2 }, { label: 'Oui', value: 4 }], scaleMax: 4 },
          { id: 'DSS05', text: 'Les accès aux systèmes industriels sont-ils protégés ?', options: [{ label: 'Non', value: 0 }, { label: 'Oui', value: 4 }], scaleMax: 4 },
          { id: 'DSS06', text: 'Suivez-vous des KPI opérationnels ?', options: [{ label: 'Non', value: 0 }, { label: 'Oui', value: 4 }], scaleMax: 4 },
        ],
      },
    },
  },

  finance: {
    sectorName: 'Banque & Services Financiers',
    domains: {
      EDM: {
        code: 'EDM',
        name: 'Gouvernance',
        questions: [
          { id: 'EDM01', text: 'Votre banque dispose-t-elle d’un cadre officiel pour piloter les SI ?', options: [{ label: 'Non', value: 0 }, { label: 'Partiel', value: 2 }, { label: 'Oui', value: 4 }], scaleMax: 4 },
          { id: 'EDM02', text: 'Votre banque suit-elle si les projets numériques apportent les résultats attendus ?', options: [{ label: 'Jamais', value: 0 }, { label: 'Rarement', value: 1 }, { label: 'Parfois', value: 2 }, { label: 'Souvent', value: 3 }, { label: 'Toujours', value: 4 }], scaleMax: 4 },
          { id: 'EDM03', text: 'Disposez-vous d’un comité dédié aux risques IT/cyber ?', options: [{ label: 'Non', value: 0 }, { label: 'Oui', value: 4 }], scaleMax: 4 },
          { id: 'EDM04', text: 'Les ressources IT sont-elles suivies pour efficacité ?', options: [{ label: 'Non', value: 0 }, { label: 'Partiel', value: 2 }, { label: 'Oui', value: 4 }], scaleMax: 4 },
          { id: 'EDM05', text: 'Les résultats IT sont-ils partagés avec le Conseil ?', options: [{ label: 'Non', value: 0 }, { label: 'Rarement', value: 1 }, { label: 'Régulièrement', value: 3 }, { label: 'Systématique', value: 5 }], scaleMax: 5 },
        ],
      },

      APO: {
        code: 'APO',
        name: 'Aligner, Planifier et Organiser',
        questions: [
          { id: 'APO01', text: 'Avez-vous des politiques formelles pour encadrer l’IT ?', options: [{ label: 'Non', value: 0 }, { label: 'Oui', value: 4 }], scaleMax: 4 },
          { id: 'APO02', text: 'Votre banque dispose-t-elle d’une stratégie numérique ?', options: [{ label: 'Non', value: 0 }, { label: 'En cours', value: 2 }, { label: 'Oui', value: 4 }], scaleMax: 4 },
          { id: 'APO03', text: 'Existe-t-il une cartographie claire des systèmes bancaires ?', options: [{ label: 'Non', value: 0 }, { label: 'Oui', value: 4 }], scaleMax: 4 },
          { id: 'APO04', text: 'La banque évalue-t-elle régulièrement de nouvelles technologies ?', options: [{ label: 'Jamais', value: 0 }, { label: 'Rarement', value: 1 }, { label: 'Parfois', value: 2 }, { label: 'Souvent', value: 3 }, { label: 'Toujours', value: 4 }], scaleMax: 4 },
          { id: 'APO05', text: 'Disposez-vous d’un tableau de suivi des projets IT ?', options: [{ label: 'Non', value: 0 }, { label: 'Oui', value: 4 }], scaleMax: 4 },
          { id: 'APO06', text: 'Les coûts IT sont-ils suivis avec précision ?', options: [{ label: 'Non', value: 0 }, { label: 'Partiellement', value: 2 }, { label: 'Oui', value: 4 }], scaleMax: 4 },
          { id: 'APO07', text: 'Existe-t-il un plan de formation en compétences numériques ?', options: [{ label: 'Non', value: 0 }, { label: 'Oui', value: 4 }], scaleMax: 4 },
          { id: 'APO08', text: 'Les métiers et l’IT collaborent-ils régulièrement ?', options: [{ label: 'Jamais', value: 0 }, { label: 'Rarement', value: 1 }, { label: 'Parfois', value: 2 }, { label: 'Souvent', value: 3 }, { label: 'Toujours', value: 4 }], scaleMax: 4 },
          { id: 'APO09', text: 'Des SLA existent-ils entre IT et métiers ?', options: [{ label: 'Non', value: 0 }, { label: 'Oui', value: 4 }], scaleMax: 4 },
          { id: 'APO10', text: 'Vos contrats fournisseurs incluent-ils des clauses de sécurité/continuité ?', options: [{ label: 'Non', value: 0 }, { label: 'Oui', value: 4 }], scaleMax: 4 },
          { id: 'APO11', text: 'Les projets numériques font-ils l’objet d’un contrôle qualité ?', options: [{ label: 'Non', value: 0 }, { label: 'Oui', value: 4 }], scaleMax: 4 },
          { id: 'APO12', text: 'Disposez-vous d’une cartographie officielle des risques IT ?', options: [{ label: 'Aucune', value: 0 }, { label: 'Partielle', value: 1 }, { label: 'Générale', value: 2 }, { label: 'Documentée', value: 3 }, { label: 'Suivie', value: 4 }, { label: 'Conforme régulateur', value: 5 }], scaleMax: 5 },
          { id: 'APO13', text: 'Appliquez-vous des normes (ISO 27001, PCI DSS) ?', options: [{ label: 'Non', value: 0 }, { label: 'Partiel', value: 2 }, { label: 'Oui', value: 4 }], scaleMax: 4 },
        ],
      },

      BAI: {
        code: 'BAI',
        name: 'Construire, Acquérir et Mettre en œuvre',
        questions: [
          { id: 'BAI01', text: 'Les projets numériques sont-ils pilotés avec une méthodologie formelle ?', options: [{ label: 'Non', value: 0 }, { label: 'Partiel', value: 2 }, { label: 'Oui', value: 4 }], scaleMax: 4 },
          { id: 'BAI02', text: 'Les besoins métiers sont-ils documentés ?', options: [{ label: 'Non', value: 0 }, { label: 'Oui', value: 4 }], scaleMax: 4 },
          { id: 'BAI03', text: 'Avez-vous des tests utilisateurs avant mise en production ?', options: [{ label: 'Non', value: 0 }, { label: 'Oui', value: 4 }], scaleMax: 4 },
          { id: 'BAI04', text: 'Suivez-vous la disponibilité des systèmes critiques ?', options: [{ label: 'Non', value: 0 }, { label: 'Oui', value: 4 }], scaleMax: 4 },
          { id: 'BAI05', text: 'Disposez-vous d’un PCA/PRS ?', options: [{ label: 'Aucun', value: 0 }, { label: 'Réflexion', value: 1 }, { label: 'En cours', value: 2 }, { label: 'Documenté', value: 3 }, { label: 'Testé', value: 4 }, { label: 'Conforme norme & testé', value: 5 }], scaleMax: 5 },
          { id: 'BAI06', text: 'Les changements IT suivent-ils un processus documenté ?', options: [{ label: 'Non', value: 0 }, { label: 'Oui', value: 4 }], scaleMax: 4 },
          { id: 'BAI07', text: 'Les nouvelles solutions sont-elles accompagnées d’une formation ?', options: [{ label: 'Non', value: 0 }, { label: 'Oui', value: 4 }], scaleMax: 4 },
          { id: 'BAI08', text: 'Existe-t-il une base documentaire IT ?', options: [{ label: 'Non', value: 0 }, { label: 'Oui', value: 4 }], scaleMax: 4 },
          { id: 'BAI09', text: 'Les logiciels/équipements sont-ils inventoriés ?', options: [{ label: 'Non', value: 0 }, { label: 'Oui', value: 4 }], scaleMax: 4 },
          { id: 'BAI10', text: 'Utilisez-vous des outils de gestion de configuration ?', options: [{ label: 'Non', value: 0 }, { label: 'Oui', value: 4 }], scaleMax: 4 },
          { id: 'BAI11', text: 'Les projets intègrent-ils la sécurité dès la conception ?', options: [{ label: 'Non', value: 0 }, { label: 'Oui', value: 4 }], scaleMax: 4 },
        ],
      },

      DSS: {
        code: 'DSS',
        name: 'Délivrer, Servir et Soutenir',
        questions: [
          { id: 'DSS01', text: 'Les opérations IT suivent-elles un planning régulier ?', options: [{ label: 'Non', value: 0 }, { label: 'Oui', value: 4 }], scaleMax: 4 },
          { id: 'DSS02', text: 'Disposez-vous d’une procédure documentée de gestion des incidents IT ?', options: [{ label: 'Non', value: 0 }, { label: 'Informelle', value: 1 }, { label: 'Documentée mais peu appliquée', value: 2 }, { label: 'Documentée et appliquée', value: 4 }], scaleMax: 4 },
          { id: 'DSS03', text: 'Les causes racines des incidents sont-elles identifiées et corrigées ?', options: [{ label: 'Non', value: 0 }, { label: 'Oui', value: 4 }], scaleMax: 4 },
          { id: 'DSS04', text: 'Avez-vous déjà testé votre plan de reprise informatique ?', options: [{ label: 'Non', value: 0 }, { label: 'En cours', value: 2 }, { label: 'Oui', value: 4 }], scaleMax: 4 },
          { id: 'DSS05', text: 'Les accès aux systèmes sensibles sont-ils protégés par MFA ?', options: [{ label: 'Non', value: 0 }, { label: 'Oui', value: 4 }], scaleMax: 4 },
          { id: 'DSS06', text: 'Suivez-vous des KPI opérationnels ?', options: [{ label: 'Non', value: 0 }, { label: 'Oui', value: 4 }], scaleMax: 4 },
        ],
      },

      MEA: {
        code: 'MEA',
        name: 'Surveiller, Évaluer et Apprécier',
        questions: [
          { id: 'MEA01', text: 'Les performances des systèmes numériques sont-elles évaluées via des tableaux de bord réguliers ?', options: [{ label: 'Non', value: 0 }, { label: 'Oui', value: 4 }], scaleMax: 4 },
          { id: 'MEA02', text: 'Un audit interne IT est-il mené régulièrement ?', options: [{ label: 'Jamais', value: 0 }, { label: 'Rare', value: 1 }, { label: 'Ponctuel', value: 2 }, { label: 'Régulier', value: 3 }, { label: 'Documenté & suivi', value: 4 }, { label: 'Audité', value: 5 }], scaleMax: 5 },
          { id: 'MEA03', text: 'Vérifiez-vous la conformité réglementaire ?', options: [{ label: 'Aucune', value: 0 }, { label: 'Vérification informelle', value: 1 }, { label: 'Vérification ponctuelle', value: 2 }, { label: 'Vérification régulière', value: 3 }, { label: 'Documentée et suivie', value: 4 }, { label: 'Audits externes', value: 5 }], scaleMax: 5 },
          { id: 'MEA04', text: 'Faites-vous appel à des prestataires externes ?', options: [{ label: 'Jamais', value: 0 }, { label: 'Rarement', value: 1 }, { label: 'Occasionnellement', value: 2 }, { label: 'Régulièrement', value: 4 }, { label: 'Systématiquement', value: 5 }], scaleMax: 5 },
        ],
      },
    },
  },
};

// Helper: normalize a raw answer to 0..5 scale
export function normalizeToFive(value: number, scaleMax: number) {
  if (scaleMax <= 0) return 0;
  // if scaleMax already 5, return value
  if (scaleMax === 5) return value;
  return Math.round((value / scaleMax) * 5 * 100) / 100; // two decimals
}

export default questionnaires;

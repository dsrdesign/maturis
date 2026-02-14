/**
 * Service d'IA pour les suggestions dynamiques de questions
 * Améliore les questions et recommandations basées sur:
 * - Le secteur d'activité de l'organisation
 * - Les résultats d'analyses précédentes
 * - Le contexte métier spécifique
 */

import { Organization } from './types';
import { Question } from './questionnaires';

// Types pour les suggestions IA
export type AISuggestion = {
  questionId: string;
  enhancedText: string;
  contextHint: string;
  priority: 'high' | 'medium' | 'low';
  relevanceScore: number;
};

export type DomainInsight = {
  domainCode: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  focusAreas: string[];
};

export type AIContext = {
  organization: Organization;
  previousScores?: {
    EDM: number;
    APO: number;
    BAI: number;
    DSS: number;
    MEA: number;
  };
  auditHistory?: Array<{ date: string; score: number }>;
};

// Contexte sectoriel pour personnaliser les questions
const sectorContexts: Record<string, {
  terminology: Record<string, string>;
  focusAreas: string[];
  regulations: string[];
  keyRisks: string[];
}> = {
  health: {
    terminology: {
      'système': 'système d\'information hospitalier (SIH)',
      'données': 'données de santé',
      'utilisateur': 'personnel soignant',
      'client': 'patient',
      'production': 'continuité des soins',
    },
    focusAreas: ['Confidentialité des données patients', 'Disponibilité des systèmes critiques', 'Interopérabilité des DME'],
    regulations: ['RGPD Santé', 'HDS (Hébergement Données de Santé)', 'ISO 27001'],
    keyRisks: ['Fuite de données médicales', 'Interruption des soins', 'Ransomware sur infrastructure hospitalière'],
  },
  finance: {
    terminology: {
      'système': 'système bancaire',
      'données': 'données financières',
      'utilisateur': 'collaborateur',
      'client': 'client bancaire',
      'production': 'opérations bancaires',
    },
    focusAreas: ['Conformité réglementaire', 'Protection des transactions', 'Continuité des services bancaires'],
    regulations: ['PCI DSS', 'DORA', 'Bâle III/IV', 'LCB-FT'],
    keyRisks: ['Fraude financière', 'Blanchiment d\'argent', 'Cyberattaques sur les transactions'],
  },
  industry: {
    terminology: {
      'système': 'système industriel (IT/OT)',
      'données': 'données de production',
      'utilisateur': 'opérateur',
      'client': 'client industriel',
      'production': 'chaîne de production',
    },
    focusAreas: ['Sécurité des systèmes OT', 'Continuité de production', 'Maintenance prédictive'],
    regulations: ['IEC 62443', 'ISO 27001', 'Directive NIS2'],
    keyRisks: ['Arrêt de production', 'Sabotage industriel', 'Vulnérabilités SCADA'],
  },
};

// Utilitaire: mélange aléatoire d'un tableau (Fisher-Yates)
function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Utilitaire: sélectionne N éléments aléatoires d'un tableau
function pickRandom<T>(arr: T[], count: number): T[] {
  return shuffleArray(arr).slice(0, count);
}

// Analyse des scores précédents pour identifier les domaines à améliorer
function analyzeScores(scores: AIContext['previousScores']): DomainInsight[] {
  if (!scores) return [];
  
  const insights: DomainInsight[] = [];
  const domainNames: Record<string, string> = {
    EDM: 'Gouvernance',
    APO: 'Alignement et Planification',
    BAI: 'Construction et Mise en œuvre',
    DSS: 'Opérations et Support',
    MEA: 'Surveillance et Évaluation',
  };

  for (const [code, score] of Object.entries(scores)) {
    const insight: DomainInsight = {
      domainCode: code,
      strengths: [],
      weaknesses: [],
      recommendations: [],
      focusAreas: [],
    };

    if (score >= 4) {
      insight.strengths.push(`Excellence en ${domainNames[code]}`);
      insight.recommendations.push('Maintenir les bonnes pratiques et documenter pour partage');
    } else if (score >= 3) {
      insight.strengths.push(`Bonne maîtrise en ${domainNames[code]}`);
      insight.recommendations.push('Consolider et formaliser les processus existants');
    } else if (score >= 2) {
      insight.weaknesses.push(`${domainNames[code]} nécessite des améliorations`);
      insight.focusAreas.push(code);
      insight.recommendations.push(`Prioriser les actions correctives en ${domainNames[code]}`);
    } else {
      insight.weaknesses.push(`${domainNames[code]} est critique`);
      insight.focusAreas.push(code);
      insight.recommendations.push(`Action urgente requise en ${domainNames[code]}`);
    }

    insights.push(insight);
  }

  return insights;
}

// Génère des suggestions contextuelles pour les questions
export function generateQuestionSuggestions(
  questions: Question[],
  context: AIContext
): AISuggestion[] {
  const suggestions: AISuggestion[] = [];
  const sectorKey = context.organization.sector === 'bank' ? 'finance' : context.organization.sector;
  const sectorContext = sectorContexts[sectorKey];
  const previousInsights = analyzeScores(context.previousScores);

  for (const question of questions) {
    let enhancedText = question.text;
    let contextHint = '';
    let priority: 'high' | 'medium' | 'low' = 'medium';
    let relevanceScore = 0.7;

    // Personnaliser le texte selon le secteur
    if (sectorContext) {
      for (const [term, replacement] of Object.entries(sectorContext.terminology)) {
        enhancedText = enhancedText.replace(new RegExp(term, 'gi'), replacement);
      }
    }

    // Ajouter un indice contextuel basé sur le secteur
    if (sectorContext) {
      const relevantRegulations = sectorContext.regulations.filter(() => 
        question.text.toLowerCase().includes('conformité') || 
        question.text.toLowerCase().includes('norme') ||
        question.text.toLowerCase().includes('réglementaire')
      );
      if (relevantRegulations.length > 0) {
        const relevantRegulation = pickRandom(relevantRegulations, 1)[0];
        contextHint = `💡 Pensez à ${relevantRegulation} pour votre secteur`;
        relevanceScore = 0.9;
      }

      const relevantRisks = sectorContext.keyRisks.filter(() => 
        question.text.toLowerCase().includes('risque') || 
        question.text.toLowerCase().includes('sécurité')
      );
      if (relevantRisks.length > 0) {
        const relevantRisk = pickRandom(relevantRisks, 1)[0];
        contextHint = contextHint || `⚠️ Risque clé dans votre secteur: ${relevantRisk}`;
        relevanceScore = 0.9;
      }
    }

    // Ajuster la priorité en fonction des résultats précédents
    const questionDomain = question.id.slice(0, 3);
    const domainInsight = previousInsights.find(i => i.domainCode === questionDomain);
    
    if (domainInsight && domainInsight.focusAreas.includes(questionDomain)) {
      priority = 'high';
      relevanceScore = 0.95;
      contextHint = contextHint || `🎯 Domaine prioritaire suite à votre dernière analyse`;
    }

    // Ajouter des indices pour les questions sur les meilleures pratiques
    if (question.text.includes('stratégie') || question.text.includes('gouvernance')) {
      contextHint = contextHint || `📊 Question stratégique pour votre organisation de ${context.organization.employees} employés`;
    }

    suggestions.push({
      questionId: question.id,
      enhancedText,
      contextHint,
      priority,
      relevanceScore,
    });
  }

  return suggestions;
}

// Génère des recommandations personnalisées basées sur le contexte
export function generateDomainRecommendations(
  domainCode: string,
  context: AIContext
): string[] {
  const recommendations: string[] = [];
  const sectorKey = context.organization.sector === 'bank' ? 'finance' : context.organization.sector;
  const sectorContext = sectorContexts[sectorKey];
  const previousScore = context.previousScores?.[domainCode as keyof typeof context.previousScores];

  // Recommandations basées sur le score précédent (variées)
  if (previousScore !== undefined) {
    if (previousScore < 2) {
      const criticalTips = [
        `⚠️ Score précédent critique (${previousScore}/5). Concentrez-vous sur les fondamentaux.`,
        `🔴 Niveau ${previousScore}/5 détecté. Priorisez la mise en place de processus de base.`,
        `⚠️ Attention: score ${previousScore}/5. Un plan d'action rapide est nécessaire.`,
      ];
      recommendations.push(pickRandom(criticalTips, 1)[0]);
    } else if (previousScore < 3) {
      const improveTips = [
        `📈 Score précédent: ${previousScore}/5. Opportunité d'amélioration significative.`,
        `🔧 Niveau ${previousScore}/5. Formalisez les pratiques existantes pour progresser.`,
        `📊 Score ${previousScore}/5. Structurez vos processus pour passer au niveau supérieur.`,
      ];
      recommendations.push(pickRandom(improveTips, 1)[0]);
    } else if (previousScore >= 4) {
      const excellentTips = [
        `✅ Excellent score précédent (${previousScore}/5). Visez l'excellence continue.`,
        `🏆 Score ${previousScore}/5. Maintenez ce niveau et partagez les bonnes pratiques.`,
        `⭐ Performance ${previousScore}/5. Capitalisez sur cette maturité pour innover.`,
      ];
      recommendations.push(pickRandom(excellentTips, 1)[0]);
    }
  }

  // Recommandations sectorielles (sélection aléatoire parmi focus + risques)
  if (sectorContext) {
    const allSectorItems = [
      ...sectorContext.focusAreas.map(f => `🎯 Point d'attention: ${f}`),
      ...sectorContext.keyRisks.map(r => `⚠️ Risque sectoriel: ${r}`),
      ...sectorContext.regulations.map(r => `📋 Conformité: vérifiez votre alignement avec ${r}`),
    ];
    const selected = pickRandom(allSectorItems, 1 + Math.floor(Math.random() * 2));
    recommendations.push(...selected);
  }

  // Recommandations basées sur la taille de l'organisation (variées)
  if (context.organization.employees > 500) {
    const largeTips = [
      `🏢 Grande organisation: importance accrue de la gouvernance formelle`,
      `🏢 Avec ${context.organization.employees} employés, misez sur l'automatisation des processus IT`,
      `🏢 Structure importante: pensez à la délégation et aux comités de pilotage`,
    ];
    recommendations.push(pickRandom(largeTips, 1)[0]);
  } else if (context.organization.employees < 50) {
    const smallTips = [
      `🚀 PME: privilégiez les solutions pragmatiques et évolutives`,
      `🚀 Petite structure: optez pour des outils simples et polyvalents`,
      `🚀 Avec ${context.organization.employees} employés, concentrez-vous sur l'essentiel`,
    ];
    recommendations.push(pickRandom(smallTips, 1)[0]);
  }

  return shuffleArray(recommendations);
}

// Calcule un score de maturité prédictif
export function predictMaturityScore(
  currentAnswers: Record<string, number>,
  context: AIContext
): {
  predictedScore: number;
  confidence: number;
  trend: 'improving' | 'stable' | 'declining';
  insights: string[];
} {
  const answeredQuestions = Object.keys(currentAnswers).length;
  const averageAnswer = Object.values(currentAnswers).reduce((a, b) => a + b, 0) / answeredQuestions || 0;
  
  // Normaliser sur 5
  const normalizedAverage = (averageAnswer / 4) * 5;
  
  // Comparer avec les scores précédents
  let trend: 'improving' | 'stable' | 'declining' = 'stable';
  const insights: string[] = [];
  
  if (context.auditHistory && context.auditHistory.length > 0) {
    const lastScore = context.auditHistory[0].score / 20; // Convertir pourcentage en /5
    if (normalizedAverage > lastScore + 0.3) {
      trend = 'improving';
      insights.push('📈 Tendance positive par rapport à la dernière analyse');
    } else if (normalizedAverage < lastScore - 0.3) {
      trend = 'declining';
      insights.push('📉 Attention: tendance à la baisse détectée');
    }
  }

  // Calculer la confiance basée sur le nombre de réponses
  const confidence = Math.min(answeredQuestions * 2, 100);

  return {
    predictedScore: Math.round(normalizedAverage * 100) / 100,
    confidence,
    trend,
    insights,
  };
}

// Génère des questions de suivi intelligentes
export function generateFollowUpQuestions(
  answeredQuestions: Record<string, number>,
  context: AIContext
): string[] {
  const followUps: string[] = [];
  const sectorKey = context.organization.sector === 'bank' ? 'finance' : context.organization.sector;
  const sectorContext = sectorContexts[sectorKey];

  // Pool de questions de suivi par domaine (variées)
  const followUpPool: Record<string, string[]> = {
    EDM: [
      'Avez-vous identifié un sponsor exécutif pour la gouvernance IT?',
      'La direction générale participe-t-elle aux revues IT stratégiques?',
      'Un tableau de bord de gouvernance IT est-il présenté au comité de direction?',
      'Les décisions IT majeures sont-elles tracées et documentées?',
      'Comment les parties prenantes sont-elles informées des résultats IT?',
    ],
    APO: [
      'Un plan d\'action pour l\'alignement stratégique est-il envisagé?',
      'Disposez-vous d\'une roadmap technologique à moyen terme?',
      'Les besoins métier sont-ils régulièrement collectés et priorisés?',
      'Comment évaluez-vous le retour sur investissement des projets IT?',
      'La gestion des compétences IT est-elle anticipée (GPEC)?',
    ],
    BAI: [
      'Des ressources sont-elles allouées pour améliorer les processus de mise en œuvre?',
      'Utilisez-vous une méthodologie projet reconnue (Agile, PRINCE2, etc.)?',
      'Les retours d\'expérience projet sont-ils capitalisés?',
      'Comment gérez-vous les dépendances entre projets IT?',
      'Les critères d\'acceptation sont-ils définis avant le démarrage des projets?',
    ],
    DSS: [
      'Une revue des procédures opérationnelles est-elle planifiée?',
      'Vos temps de résolution d\'incidents respectent-ils les SLA définis?',
      'Disposez-vous d\'un processus d\'escalade formalisé?',
      'La satisfaction des utilisateurs IT est-elle mesurée régulièrement?',
      'Les procédures de sauvegarde et restauration sont-elles testées?',
    ],
    MEA: [
      'Des indicateurs de performance sont-ils en cours de définition?',
      'Réalisez-vous des auto-évaluations de maturité IT périodiques?',
      'Les recommandations d\'audits précédents ont-elles été suivies?',
      'Comment assurez-vous la veille réglementaire IT?',
      'Existe-t-il un processus de revue de conformité interne?',
    ],
  };

  // Analyser les réponses négatives pour suggérer des actions
  for (const [questionId, answer] of Object.entries(answeredQuestions)) {
    if (answer <= 1) {
      const domain = questionId.slice(0, 3);
      const pool = followUpPool[domain];
      if (pool) {
        // Sélectionner une question aléatoire du pool pour ce domaine
        const selected = pickRandom(pool, 1)[0];
        followUps.push(selected);
      }
    }
  }

  // Ajouter des questions sectorielles (aléatoire parmi les focus areas)
  if (sectorContext && sectorContext.focusAreas.length > 0) {
    const randomFocus = pickRandom(sectorContext.focusAreas, 1)[0];
    followUps.push(`Comment adressez-vous ${randomFocus} dans votre organisation?`);
  }

  return [...new Set(shuffleArray(followUps))].slice(0, 3); // Retourner max 3 questions uniques
}

const aiService = {
  generateQuestionSuggestions,
  generateDomainRecommendations,
  predictMaturityScore,
  generateFollowUpQuestions,
};

export default aiService;

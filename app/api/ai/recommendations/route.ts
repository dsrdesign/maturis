import { NextRequest, NextResponse } from 'next/server';

type RecommendationsRequest = {
  organizationContext: {
    name: string;
    sector: string;
    employees: number;
    country: string;
    city: string;
  };
  domainScores: {
    EDM: number;
    APO: number;
    BAI: number;
    DSS: number;
    MEA: number;
  };
  globalScore: number;
};

const domainNames: Record<string, string> = {
  EDM: 'Évaluer, Diriger et Surveiller',
  APO: 'Aligner, Planifier et Organiser',
  BAI: 'Bâtir, Acquérir et Implémenter',
  DSS: 'Délivrer, Servir et Supporter',
  MEA: 'Surveiller, Évaluer et Apprécier',
};

const sectorContext: Record<string, string> = {
  health: `Secteur de la santé. Prendre en compte: RGPD Santé, HDS, continuité des soins, DME, télémédecine.`,
  finance: `Secteur bancaire. Prendre en compte: PCI DSS, DORA, Bâle III/IV, LCB-FT, cyber-résilience.`,
  industry: `Secteur industriel. Prendre en compte: IT/OT, SCADA, IEC 62443, industrie 4.0, continuité de production.`,
};

async function generateRecommendationsWithAI(request: RecommendationsRequest): Promise<{
  recommendations: Array<{
    domain: string;
    domainName: string;
    score: number;
    priority: 'critical' | 'high' | 'medium' | 'low';
    actions: Array<{
      title: string;
      description: string;
      impact: string;
      effort: 'low' | 'medium' | 'high';
      timeline: string;
    }>;
    quickWins: string[];
  }>;
  summary: string;
  maturityAnalysis: string;
}> {
  const { organizationContext, domainScores, globalScore } = request;
  
  const sectorKey = organizationContext.sector === 'bank' ? 'finance' : organizationContext.sector;
  const sectorInfo = sectorContext[sectorKey] || '';

  // Identifier les domaines faibles
  const sortedDomains = Object.entries(domainScores)
    .map(([code, score]) => ({ code, score, name: domainNames[code] }))
    .sort((a, b) => a.score - b.score);

  const weakDomains = sortedDomains.filter(d => d.score < 3);
  const strongDomains = sortedDomains.filter(d => d.score >= 4);

  // Angles de variation pour diversifier les recommandations
  const recommendationAngles = [
    'gouvernance et pilotage stratégique',
    'processus opérationnels et automatisation',
    'compétences humaines et conduite du changement',
    'outils technologiques et modernisation',
    'gestion des risques et résilience',
    'conformité réglementaire et audit',
    'communication et transparence',
    'performance et optimisation des coûts',
    'innovation et transformation digitale',
    'partenariats et écosystème externe',
  ];

  // Sélectionner aléatoirement des angles pour cette génération
  const shuffledAngles = recommendationAngles.sort(() => Math.random() - 0.5);
  const selectedAngles = shuffledAngles.slice(0, 3);
  const variationSeed = `REC-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

  const systemPrompt = `Tu es un expert en gouvernance IT, COBIT 2019 et transformation digitale.
Tu dois générer des recommandations personnalisées et actionnables pour améliorer la maturité IT d'une organisation.

${sectorInfo}

IMPORTANT:
- Sois spécifique et adapté au contexte de l'organisation
- Propose des actions concrètes avec des délais réalistes
- Identifie des quick wins (gains rapides)
- Priorise selon l'impact et l'effort
- DIVERSITÉ OBLIGATOIRE: Chaque génération doit produire des recommandations UNIQUES et DIFFÉRENTES.
  Varie les approches, les méthodologies suggérées et les exemples concrets.
  Pour cette génération, oriente-toi sur: ${selectedAngles.join(', ')}.
  Propose des actions que l'on ne retrouve pas dans les guides standards.
  Référence de variation: ${variationSeed}

Réponds UNIQUEMENT avec un JSON valide au format suivant:
{
  "recommendations": [
    {
      "domain": "CODE_DOMAINE",
      "domainName": "Nom complet du domaine",
      "score": 2.5,
      "priority": "critical|high|medium|low",
      "actions": [
        {
          "title": "Titre de l'action",
          "description": "Description détaillée",
          "impact": "Impact attendu",
          "effort": "low|medium|high",
          "timeline": "Délai estimé (ex: 1-2 mois)"
        }
      ],
      "quickWins": ["Action rapide 1", "Action rapide 2"]
    }
  ],
  "summary": "Résumé exécutif de la situation et des priorités",
  "maturityAnalysis": "Analyse du niveau de maturité global et positionnement"
}`;

  const userPrompt = `Génère des recommandations ORIGINALES et VARIÉES pour:
- Organisation: ${organizationContext.name}
- Secteur: ${organizationContext.sector}
- Taille: ${organizationContext.employees} employés
- Localisation: ${organizationContext.city}, ${organizationContext.country}
- Score global: ${globalScore}%

Scores par domaine COBIT:
${sortedDomains.map(d => `- ${d.code} (${d.name}): ${d.score}/5`).join('\n')}

Domaines prioritaires (score < 3): ${weakDomains.map(d => d.code).join(', ') || 'Aucun'}
Points forts (score >= 4): ${strongDomains.map(d => d.code).join(', ') || 'Aucun'}

Génère des recommandations détaillées pour les 3 domaines les plus faibles.
Angles à privilégier: ${selectedAngles.join(', ')}.
Propose des actions concrètes et spécifiques, évite les conseils génériques.`;

  const groqApiKey = process.env.GROQ_API_KEY;
  
  if (groqApiKey) {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${groqApiKey}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.9,
          max_tokens: 3000,
          top_p: 0.95,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices[0]?.message?.content;
        
        if (content) {
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
          }
        }
      }
    } catch (error) {
      console.error('Groq API error:', error);
    }
  }

  // Fallback sans API
  return generateFallbackRecommendations(request, sortedDomains);
}

function generateFallbackRecommendations(
  request: RecommendationsRequest,
  sortedDomains: Array<{ code: string; score: number; name: string }>
): {
  recommendations: Array<{
    domain: string;
    domainName: string;
    score: number;
    priority: 'critical' | 'high' | 'medium' | 'low';
    actions: Array<{
      title: string;
      description: string;
      impact: string;
      effort: 'low' | 'medium' | 'high';
      timeline: string;
    }>;
    quickWins: string[];
  }>;
  summary: string;
  maturityAnalysis: string;
} {
  const { globalScore } = request;

  const fallbackActions: Record<string, Array<{
    title: string;
    description: string;
    impact: string;
    effort: 'low' | 'medium' | 'high';
    timeline: string;
  }>> = {
    EDM: [
      { title: 'Établir un comité de gouvernance IT', description: 'Créer une instance de pilotage avec représentation métier et IT', impact: 'Amélioration de l\'alignement stratégique', effort: 'medium', timeline: '2-3 mois' },
      { title: 'Définir une charte de gouvernance IT', description: 'Formaliser les rôles, responsabilités et processus de décision', impact: 'Clarification des responsabilités', effort: 'low', timeline: '1 mois' },
    ],
    APO: [
      { title: 'Élaborer un schéma directeur IT', description: 'Définir la vision IT à 3-5 ans alignée sur la stratégie métier', impact: 'Vision claire et partagée', effort: 'high', timeline: '3-6 mois' },
      { title: 'Cartographier les processus IT', description: 'Documenter les processus clés et identifier les optimisations', impact: 'Meilleure efficacité opérationnelle', effort: 'medium', timeline: '2-4 mois' },
    ],
    BAI: [
      { title: 'Mettre en place une méthodologie projet', description: 'Adopter une approche structurée (Agile, Prince2, etc.)', impact: 'Meilleur taux de succès des projets', effort: 'medium', timeline: '2-3 mois' },
      { title: 'Créer un processus de gestion des changements', description: 'Formaliser la validation et le déploiement des changements', impact: 'Réduction des incidents', effort: 'low', timeline: '1-2 mois' },
    ],
    DSS: [
      { title: 'Implémenter un outil ITSM', description: 'Déployer un outil de gestion des services IT (tickets, incidents)', impact: 'Meilleur suivi et traçabilité', effort: 'medium', timeline: '2-4 mois' },
      { title: 'Définir des SLA internes', description: 'Établir des niveaux de service avec les métiers', impact: 'Satisfaction utilisateurs améliorée', effort: 'low', timeline: '1-2 mois' },
    ],
    MEA: [
      { title: 'Mettre en place des KPIs IT', description: 'Définir et suivre des indicateurs de performance clés', impact: 'Pilotage basé sur les données', effort: 'low', timeline: '1-2 mois' },
      { title: 'Planifier des audits réguliers', description: 'Programmer des revues périodiques des processus IT', impact: 'Amélioration continue', effort: 'medium', timeline: '3-6 mois' },
    ],
  };

  const quickWinsMap: Record<string, string[]> = {
    EDM: ['Organiser une réunion mensuelle IT-Direction', 'Créer un tableau de bord de suivi des projets', 'Définir les rôles et responsabilités IT clés', 'Mettre en place un reporting mensuel IT'],
    APO: ['Documenter les 5 processus IT les plus critiques', 'Faire un inventaire des applications', 'Lancer une veille technologique trimestrielle', 'Créer un catalogue de services IT'],
    BAI: ['Mettre en place des revues de code', 'Créer des templates de documentation projet', 'Formaliser un processus de recette', 'Automatiser un déploiement clé'],
    DSS: ['Créer une FAQ pour les demandes fréquentes', 'Mettre en place un canal de communication IT', 'Définir les SLA critiques', 'Tester les sauvegardes existantes'],
    MEA: ['Créer un rapport mensuel d\'activité IT', 'Documenter les incidents majeurs', 'Planifier un audit flash', 'Définir 3 KPIs prioritaires'],
  };

  // Mélanger les quick wins pour varier
  for (const key of Object.keys(quickWinsMap)) {
    const arr = quickWinsMap[key];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    quickWinsMap[key] = arr.slice(0, 2);
  }

  const recommendations = sortedDomains.slice(0, 3).map(domain => ({
    domain: domain.code,
    domainName: domain.name,
    score: domain.score,
    priority: (domain.score < 2 ? 'critical' : domain.score < 3 ? 'high' : 'medium') as 'critical' | 'high' | 'medium' | 'low',
    actions: fallbackActions[domain.code] || [],
    quickWins: quickWinsMap[domain.code] || [],
  }));

  const maturityLevel = globalScore < 40 ? 'Initial' : globalScore < 60 ? 'Géré' : globalScore < 80 ? 'Défini' : 'Optimisé';

  return {
    recommendations,
    summary: `Avec un score global de ${globalScore}%, votre organisation se situe au niveau "${maturityLevel}". Les domaines prioritaires à améliorer sont ${sortedDomains.slice(0, 2).map(d => d.code).join(' et ')}.`,
    maturityAnalysis: `Niveau de maturité COBIT: ${maturityLevel}. ${globalScore < 50 ? 'Des efforts significatifs sont nécessaires pour atteindre un niveau de maturité acceptable.' : globalScore < 70 ? 'La base est solide mais des améliorations sont possibles.' : 'Bonne maturité globale, focus sur l\'optimisation continue.'}`,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body: RecommendationsRequest = await req.json();

    if (!body.organizationContext || !body.domainScores) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await generateRecommendationsWithAI(body);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    );
  }
}

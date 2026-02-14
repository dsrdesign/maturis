import { NextRequest, NextResponse } from 'next/server';

// Types pour les requêtes
type GenerateQuestionsRequest = {
  organizationContext: {
    name: string;
    sector: string;
    employees: number;
    country: string;
    city: string;
  };
  domainCode: string;
  domainName: string;
  previousScores?: {
    EDM: number;
    APO: number;
    BAI: number;
    DSS: number;
    MEA: number;
  };
  existingAnswers?: Record<string, number>;
  questionCount?: number;
};

// Prompts système pour chaque domaine COBIT
const domainPrompts: Record<string, string> = {
  EDM: `Tu es un expert en gouvernance IT et COBIT. Génère des questions d'évaluation pour le domaine EDM (Évaluer, Diriger et Surveiller) qui concernent:
- La définition du cadre de gouvernance IT
- L'optimisation de la valeur des investissements IT
- La gestion des risques IT
- L'optimisation des ressources IT
- La transparence envers les parties prenantes`,

  APO: `Tu es un expert en gouvernance IT et COBIT. Génère des questions d'évaluation pour le domaine APO (Aligner, Planifier et Organiser) qui concernent:
- La gestion du cadre de gestion IT
- La stratégie IT
- L'architecture d'entreprise
- L'innovation et les nouvelles technologies
- Le budget et les coûts IT
- Les ressources humaines IT
- Les relations avec les parties prenantes
- Les accords de service
- Les fournisseurs
- La qualité
- Les risques
- La sécurité de l'information`,

  BAI: `Tu es un expert en gouvernance IT et COBIT. Génère des questions d'évaluation pour le domaine BAI (Bâtir, Acquérir et Implémenter) qui concernent:
- La gestion des programmes et projets
- La définition des exigences
- L'identification et construction de solutions
- La gestion de la disponibilité et de la capacité
- La gestion du changement organisationnel
- La gestion des changements IT
- L'acceptation et la transition des changements
- La gestion des connaissances
- La gestion des actifs
- La gestion de la configuration
- La gestion des projets`,

  DSS: `Tu es un expert en gouvernance IT et COBIT. Génère des questions d'évaluation pour le domaine DSS (Délivrer, Servir et Supporter) qui concernent:
- La gestion des opérations
- La gestion des demandes de service et incidents
- La gestion des problèmes
- La gestion de la continuité
- La gestion des services de sécurité
- La gestion des contrôles des processus métier`,

  MEA: `Tu es un expert en gouvernance IT et COBIT. Génère des questions d'évaluation pour le domaine MEA (Surveiller, Évaluer et Apprécier) qui concernent:
- La surveillance et l'évaluation de la performance et de la conformité
- La surveillance du système de contrôle interne
- La surveillance de la conformité aux exigences externes
- L'assurance indépendante`,
};

// Contexte sectoriel pour personnaliser les questions
const sectorContext: Record<string, string> = {
  health: `Contexte: Secteur de la santé et hôpitaux. Les questions doivent prendre en compte:
- La confidentialité des données patients (RGPD Santé)
- L'hébergement des données de santé (HDS)
- Les systèmes d'information hospitaliers (SIH)
- Les dossiers médicaux électroniques (DME)
- La télémédecine et téléconsultation
- La continuité des soins
- L'interopérabilité des systèmes médicaux`,

  finance: `Contexte: Secteur bancaire et services financiers. Les questions doivent prendre en compte:
- La conformité réglementaire (PCI DSS, DORA, Bâle III/IV)
- La lutte contre le blanchiment (LCB-FT)
- La protection des transactions financières
- La cyber-résilience
- Les services bancaires en ligne et mobiles
- La gestion des risques opérationnels`,

  industry: `Contexte: Secteur industriel et fabrication. Les questions doivent prendre en compte:
- La convergence IT/OT
- Les systèmes SCADA et automates
- La sécurité industrielle (IEC 62443)
- La continuité de production
- L'industrie 4.0 et IoT industriel
- La maintenance prédictive`,
};

// Fonction pour générer des questions via l'IA
async function generateQuestionsWithAI(request: GenerateQuestionsRequest): Promise<{
  questions: Array<{
    id: string;
    text: string;
    context: string;
    options: Array<{ label: string; value: number }>;
    scaleMax: number;
  }>;
  reasoning: string;
}> {
  const { organizationContext, domainCode, domainName, previousScores, questionCount = 10 } = request;
  
  const sectorKey = organizationContext.sector === 'bank' ? 'finance' : organizationContext.sector;
  const sectorInfo = sectorContext[sectorKey] || '';
  const domainPrompt = domainPrompts[domainCode] || domainPrompts.EDM;

  // Construire le contexte des scores précédents
  let scoreContext = '';
  if (previousScores) {
    const weakDomains = Object.entries(previousScores)
      .filter(([, score]) => score < 3)
      .map(([domain]) => domain);
    
    if (weakDomains.length > 0) {
      scoreContext = `\n\nDomaines nécessitant une attention particulière (scores < 3/5): ${weakDomains.join(', ')}`;
    }
    
    const currentDomainScore = previousScores[domainCode as keyof typeof previousScores];
    if (currentDomainScore !== undefined) {
      scoreContext += `\nScore précédent pour ${domainCode}: ${currentDomainScore}/5`;
    }
  }

  // Angles de variation pour garantir la diversité des questions générées
  const questionAngles = [
    'processus et procédures formels',
    'outils et technologies utilisés',
    'compétences et formation des équipes',
    'mesure de performance et KPIs',
    'communication et reporting',
    'gestion des risques et conformité',
    'amélioration continue et innovation',
    'documentation et capitalisation',
    'collaboration inter-équipes',
    'satisfaction des parties prenantes',
    'automatisation et efficacité',
    'planification et anticipation',
  ];

  // Sélectionner aléatoirement 3-4 angles pour cette génération
  const shuffledAngles = questionAngles.sort(() => Math.random() - 0.5);
  const selectedAngles = shuffledAngles.slice(0, 3 + Math.floor(Math.random() * 2));
  const variationSeed = `SEED-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

  // Construire le prompt complet
  const systemPrompt = `${domainPrompt}

${sectorInfo}

Tu dois générer ${questionCount} questions pertinentes et spécifiques pour évaluer la maturité IT de cette organisation.
${scoreContext}

IMPORTANT: 
- Les questions doivent être adaptées au contexte de l'organisation
- Utilise un langage professionnel mais accessible
- Chaque question doit avoir 3-5 options de réponse
- Les options doivent représenter différents niveaux de maturité (de 0 à 4 ou 5)
- DIVERSITÉ OBLIGATOIRE: Chaque génération doit produire des questions DIFFÉRENTES. 
  Varie les formulations, les angles d'analyse et les sous-thèmes abordés.
  Pour cette génération, concentre-toi particulièrement sur: ${selectedAngles.join(', ')}.
  Évite les questions trop génériques ou déjà courantes.
  Utilise des scénarios concrets et des cas pratiques quand c'est possible.
  Référence de variation: ${variationSeed}

Réponds UNIQUEMENT avec un JSON valide au format suivant:
{
  "questions": [
    {
      "id": "AI_${domainCode}_1",
      "text": "La question ici",
      "context": "Explication courte de pourquoi cette question est importante",
      "options": [
        {"label": "Non / Inexistant", "value": 0},
        {"label": "Partiel / En cours", "value": 2},
        {"label": "Oui / Complet", "value": 4}
      ],
      "scaleMax": 4
    }
  ],
  "reasoning": "Explication de pourquoi ces questions sont pertinentes pour cette organisation"
}`;

  const userPrompt = `Génère ${questionCount} questions d'évaluation ORIGINALES et VARIÉES pour:
- Organisation: ${organizationContext.name}
- Secteur: ${organizationContext.sector}
- Taille: ${organizationContext.employees} employés
- Localisation: ${organizationContext.city}, ${organizationContext.country}
- Domaine COBIT à évaluer: ${domainCode} - ${domainName}
- Angles à privilégier pour cette évaluation: ${selectedAngles.join(', ')}
- Ne répète PAS les questions classiques habituelles. Propose des questions nouvelles et spécifiques.`;

  // Vérifier les clés API disponibles (Groq gratuit en priorité, puis OpenAI)
  const groqApiKey = process.env.GROQ_API_KEY;
  const openaiApiKey = process.env.OPENAI_API_KEY;
  
  console.log('🔑 API Keys check:', { 
    hasGroq: !!groqApiKey, 
    hasOpenAI: !!openaiApiKey,
    groqKeyPrefix: groqApiKey?.substring(0, 10) + '...'
  });
  
  // Essayer Groq d'abord (gratuit), puis OpenAI
  if (groqApiKey) {
    console.log('🚀 Calling Groq API...');
    try {
      const result = await callGroqAPI(groqApiKey, systemPrompt, userPrompt);
      if (result) {
        console.log('✅ Groq API success!');
        return result;
      }
    } catch (error) {
      console.error('❌ Groq API error:', error);
    }
  }
  
  if (openaiApiKey) {
    console.log('🚀 Calling OpenAI API...');
    try {
      const result = await callOpenAIAPI(openaiApiKey, systemPrompt, userPrompt);
      if (result) {
        console.log('✅ OpenAI API success!');
        return result;
      }
    } catch (error) {
      console.error('❌ OpenAI API error:', error);
    }
  }
  
  console.log('❌ No AI API available or all calls failed');
  throw new Error('Aucune API IA disponible. Veuillez configurer GROQ_API_KEY ou OPENAI_API_KEY.');
}

// Appel à l'API Groq (GRATUIT)
async function callGroqAPI(apiKey: string, systemPrompt: string, userPrompt: string) {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile', // Modèle Groq gratuit - Janvier 2026
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.9,
      max_tokens: 4000,
      top_p: 0.95,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('Groq API response:', response.status, errorBody);
    throw new Error(`Groq API error: ${response.status} - ${errorBody}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;

  if (!content) return null;

  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;

  return JSON.parse(jsonMatch[0]);
}

// Appel à l'API OpenAI
async function callOpenAIAPI(apiKey: string, systemPrompt: string, userPrompt: string) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.9,
      max_tokens: 4000,
      top_p: 0.95,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;

  if (!content) return null;

  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;

  return JSON.parse(jsonMatch[0]);
}

export async function POST(req: NextRequest) {
  try {
    const body: GenerateQuestionsRequest = await req.json();

    // Valider les données requises
    if (!body.organizationContext || !body.domainCode) {
      return NextResponse.json(
        { error: 'Missing required fields: organizationContext and domainCode' },
        { status: 400 }
      );
    }

    const result = await generateQuestionsWithAI(body);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in generate-questions API:', error);
    return NextResponse.json(
      { error: 'Failed to generate questions' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';

// Types pour les requêtes
type GenerateQuestionsRequest = {
  organizationContext: {
    name: string;
    sector: string;
    employees: number;
    country: string;
    city: string;
    creationDate: string;
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

  const userPrompt = `Génère ${questionCount} questions d'évaluation pour:
- Organisation: ${organizationContext.name}
- Secteur: ${organizationContext.sector}
- Taille: ${organizationContext.employees} employés
- Date de création: ${organizationContext.creationDate}
- Localisation: ${organizationContext.city}, ${organizationContext.country}
- Domaine COBIT à évaluer: ${domainCode} - ${domainName}`;

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
  
  console.log('⚠️ Using fallback questions (no API available or all failed)');
  // Mode de fallback sans API - générer des questions prédéfinies contextuelles
  return generateFallbackQuestions(request);
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
      temperature: 0.7,
      max_tokens: 2000,
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
      temperature: 0.7,
      max_tokens: 2000,
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

// Fonction de fallback pour générer des questions sans API
function generateFallbackQuestions(request: GenerateQuestionsRequest): {
  questions: Array<{
    id: string;
    text: string;
    context: string;
    options: Array<{ label: string; value: number }>;
    scaleMax: number;
  }>;
  reasoning: string;
} {
  const { organizationContext, domainCode, previousScores } = request;
  const sectorKey = organizationContext.sector === 'bank' ? 'finance' : organizationContext.sector;

  // Questions personnalisées par domaine et secteur
  const sectorQuestions: Record<string, Record<string, Array<{
    text: string;
    context: string;
    options: Array<{ label: string; value: number }>;
  }>>> = {
    health: {
      EDM: [
        {
          text: "Comment la direction médicale est-elle impliquée dans les décisions IT stratégiques concernant les systèmes de santé?",
          context: "L'implication de la direction médicale est cruciale pour l'alignement IT-métier en santé",
          options: [
            { label: "Pas d'implication", value: 0 },
            { label: "Information ponctuelle", value: 1 },
            { label: "Consultation régulière", value: 2 },
            { label: "Participation aux comités", value: 3 },
            { label: "Co-pilotage stratégique", value: 4 },
          ],
        },
        {
          text: "Existe-t-il un processus d'évaluation de l'impact des projets IT sur la qualité des soins?",
          context: "L'évaluation de l'impact sur les soins est essentielle dans le secteur hospitalier",
          options: [
            { label: "Non", value: 0 },
            { label: "Évaluation informelle", value: 2 },
            { label: "Processus formalisé", value: 4 },
          ],
        },
        {
          text: "Comment gérez-vous la conformité aux exigences HDS (Hébergement Données de Santé)?",
          context: "La certification HDS est obligatoire pour l'hébergement des données de santé",
          options: [
            { label: "Non conforme", value: 0 },
            { label: "En cours de mise en conformité", value: 2 },
            { label: "Certifié HDS", value: 4 },
          ],
        },
      ],
      APO: [
        {
          text: "Votre stratégie IT intègre-t-elle les objectifs du projet d'établissement hospitalier?",
          context: "L'alignement avec le projet d'établissement garantit la cohérence des investissements IT",
          options: [
            { label: "Non", value: 0 },
            { label: "Partiellement", value: 2 },
            { label: "Totalement intégré", value: 4 },
          ],
        },
        {
          text: "Comment planifiez-vous l'interopérabilité entre vos différents systèmes médicaux (DME, imagerie, laboratoire)?",
          context: "L'interopérabilité est critique pour la continuité des soins",
          options: [
            { label: "Pas de plan", value: 0 },
            { label: "Plan en cours d'élaboration", value: 1 },
            { label: "Plan défini mais non implémenté", value: 2 },
            { label: "Implémentation en cours", value: 3 },
            { label: "Interopérabilité opérationnelle", value: 4 },
          ],
        },
      ],
      BAI: [
        {
          text: "Les utilisateurs médicaux sont-ils impliqués dans la validation des nouvelles solutions IT de santé?",
          context: "L'implication des soignants garantit l'adoption des outils",
          options: [
            { label: "Jamais", value: 0 },
            { label: "Rarement", value: 1 },
            { label: "Parfois", value: 2 },
            { label: "Systématiquement", value: 4 },
          ],
        },
      ],
      DSS: [
        {
          text: "Disposez-vous d'un plan de continuité spécifique pour les systèmes critiques de soins (urgences, réanimation)?",
          context: "La disponibilité des systèmes critiques impacte directement la sécurité des patients",
          options: [
            { label: "Aucun plan", value: 0 },
            { label: "Plan basique", value: 2 },
            { label: "Plan détaillé et testé", value: 4 },
          ],
        },
      ],
      MEA: [
        {
          text: "Réalisez-vous des audits de conformité RGPD spécifiques aux données de santé?",
          context: "Les données de santé nécessitent des contrôles de conformité renforcés",
          options: [
            { label: "Non", value: 0 },
            { label: "Audits ponctuels", value: 2 },
            { label: "Audits réguliers et documentés", value: 4 },
          ],
        },
      ],
    },
    finance: {
      EDM: [
        {
          text: "Comment le comité des risques supervise-t-il les risques IT et cyber?",
          context: "La supervision des risques IT par le comité des risques est une exigence réglementaire bancaire",
          options: [
            { label: "Pas de supervision", value: 0 },
            { label: "Revue annuelle", value: 1 },
            { label: "Revue trimestrielle", value: 2 },
            { label: "Revue mensuelle", value: 3 },
            { label: "Tableau de bord en temps réel", value: 4 },
          ],
        },
        {
          text: "Existe-t-il une politique de cyber-résilience approuvée par le conseil d'administration?",
          context: "DORA exige une implication du CA dans la cyber-résilience",
          options: [
            { label: "Non", value: 0 },
            { label: "En cours d'élaboration", value: 2 },
            { label: "Approuvée et appliquée", value: 4 },
          ],
        },
      ],
      APO: [
        {
          text: "Comment gérez-vous la conformité PCI DSS pour les données de cartes bancaires?",
          context: "PCI DSS est obligatoire pour toute organisation traitant des données de carte",
          options: [
            { label: "Non conforme", value: 0 },
            { label: "En cours de certification", value: 2 },
            { label: "Certifié PCI DSS", value: 4 },
          ],
        },
        {
          text: "Avez-vous une stratégie de gestion des tiers IT conforme aux exigences d'externalisation bancaire?",
          context: "La réglementation bancaire impose des contrôles stricts sur l'externalisation IT",
          options: [
            { label: "Pas de stratégie", value: 0 },
            { label: "Stratégie partielle", value: 2 },
            { label: "Stratégie complète et conforme", value: 4 },
          ],
        },
      ],
      BAI: [
        {
          text: "Vos processus de développement intègrent-ils des contrôles anti-fraude dès la conception?",
          context: "La prévention de la fraude doit être intégrée dès le développement (security by design)",
          options: [
            { label: "Non", value: 0 },
            { label: "Partiellement", value: 2 },
            { label: "Oui, systématiquement", value: 4 },
          ],
        },
      ],
      DSS: [
        {
          text: "Disposez-vous d'un SOC (Security Operations Center) pour la surveillance des menaces?",
          context: "Un SOC est essentiel pour détecter et répondre aux cybermenaces dans le secteur bancaire",
          options: [
            { label: "Non", value: 0 },
            { label: "SOC externalisé basique", value: 2 },
            { label: "SOC 24/7 (interne ou MDR)", value: 4 },
          ],
        },
      ],
      MEA: [
        {
          text: "Comment préparez-vous les contrôles du régulateur bancaire sur l'IT?",
          context: "Les régulateurs bancaires effectuent des contrôles réguliers sur les SI",
          options: [
            { label: "Pas de préparation", value: 0 },
            { label: "Préparation ad hoc", value: 2 },
            { label: "Programme de conformité permanent", value: 4 },
          ],
        },
      ],
    },
    industry: {
      EDM: [
        {
          text: "Comment la direction industrielle est-elle impliquée dans la gouvernance IT/OT?",
          context: "La convergence IT/OT nécessite une gouvernance unifiée",
          options: [
            { label: "Silos IT et OT séparés", value: 0 },
            { label: "Coordination ponctuelle", value: 2 },
            { label: "Gouvernance IT/OT intégrée", value: 4 },
          ],
        },
      ],
      APO: [
        {
          text: "Disposez-vous d'une cartographie intégrée des systèmes IT et OT (SCADA, automates)?",
          context: "La visibilité sur l'ensemble des assets IT/OT est critique pour la sécurité industrielle",
          options: [
            { label: "Non", value: 0 },
            { label: "IT uniquement", value: 1 },
            { label: "OT uniquement", value: 2 },
            { label: "IT et OT partiellement", value: 3 },
            { label: "Cartographie complète IT/OT", value: 4 },
          ],
        },
      ],
      BAI: [
        {
          text: "Les mises à jour des systèmes industriels (firmware, SCADA) suivent-elles un processus de validation?",
          context: "Les mises à jour OT peuvent impacter la production et doivent être validées",
          options: [
            { label: "Pas de processus", value: 0 },
            { label: "Processus informel", value: 2 },
            { label: "Processus formel avec tests", value: 4 },
          ],
        },
      ],
      DSS: [
        {
          text: "Avez-vous segmenté vos réseaux IT et OT conformément à IEC 62443?",
          context: "La segmentation réseau est une mesure fondamentale de sécurité industrielle",
          options: [
            { label: "Pas de segmentation", value: 0 },
            { label: "Segmentation basique", value: 2 },
            { label: "Segmentation conforme IEC 62443", value: 4 },
          ],
        },
      ],
      MEA: [
        {
          text: "Réalisez-vous des tests d'intrusion sur vos systèmes industriels?",
          context: "Les pentests OT doivent être adaptés pour ne pas perturber la production",
          options: [
            { label: "Jamais", value: 0 },
            { label: "IT uniquement", value: 1 },
            { label: "IT et OT avec précautions", value: 4 },
          ],
        },
      ],
    },
  };

  // Sélectionner les questions appropriées
  const domainQuestions = sectorQuestions[sectorKey]?.[domainCode] || sectorQuestions.finance[domainCode] || [];

  // Prendre en compte les scores précédents pour personnaliser
  let reasoning = `Questions générées pour ${organizationContext.name} (secteur: ${organizationContext.sector}, ${organizationContext.employees} employés, créée le ${organizationContext.creationDate}).`;

  if (previousScores) {
    const currentScore = previousScores[domainCode as keyof typeof previousScores];
    if (currentScore !== undefined && currentScore < 3) {
      reasoning += ` Le score précédent de ${currentScore}/5 en ${domainCode} indique un besoin d'amélioration dans ce domaine.`;
    }
  }

  // S'assurer qu'on a au moins le nombre de questions demandées
  const requestedCount = request.questionCount || 10;
  const timestamp = Date.now();
  const questions = domainQuestions.slice(0, requestedCount).map((q, index) => ({
    id: `AI_${domainCode}_${timestamp}_${index}`,
    text: q.text,
    context: q.context,
    options: q.options,
    scaleMax: Math.max(...q.options.map(o => o.value)),
  }));
  
  // Si on n'a pas assez de questions, on duplique les existantes avec un ID différent
  while (questions.length < requestedCount && domainQuestions.length > 0) {
    const index = questions.length % domainQuestions.length;
    const q = domainQuestions[index];
    questions.push({
      id: `AI_${domainCode}_${timestamp}_${questions.length}`,
      text: q.text,
      context: q.context,
      options: q.options,
      scaleMax: Math.max(...q.options.map(o => o.value)),
    });
  }

  return { questions, reasoning };
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

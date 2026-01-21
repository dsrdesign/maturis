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
      max_tokens: 4000,
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
      max_tokens: 4000,
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

  // Questions génériques par domaine (utilisées pour tous les secteurs + complément)
  const genericQuestions: Record<string, Array<{
    text: string;
    context: string;
    options: Array<{ label: string; value: number }>;
  }>> = {
    EDM: [
      { text: "Existe-t-il un comité de gouvernance IT formalisé dans votre organisation?", context: "Un comité de gouvernance IT structure la prise de décision stratégique", options: [{ label: "Non", value: 0 }, { label: "Informel", value: 1 }, { label: "En cours de création", value: 2 }, { label: "Existe mais peu actif", value: 3 }, { label: "Actif et efficace", value: 4 }] },
      { text: "Comment les investissements IT sont-ils priorisés et validés?", context: "La priorisation des investissements garantit l'alignement avec les objectifs métier", options: [{ label: "Pas de processus", value: 0 }, { label: "Au cas par cas", value: 1 }, { label: "Critères définis", value: 2 }, { label: "Processus formalisé", value: 3 }, { label: "Optimisé avec ROI mesuré", value: 4 }] },
      { text: "Les risques IT sont-ils régulièrement évalués et communiqués à la direction?", context: "L'évaluation des risques IT est fondamentale pour la gouvernance", options: [{ label: "Jamais", value: 0 }, { label: "En cas d'incident", value: 1 }, { label: "Annuellement", value: 2 }, { label: "Trimestriellement", value: 3 }, { label: "En continu avec reporting", value: 4 }] },
      { text: "Existe-t-il une charte ou politique IT approuvée par la direction générale?", context: "Une charte IT formalise les principes directeurs", options: [{ label: "Non", value: 0 }, { label: "En cours de rédaction", value: 2 }, { label: "Oui, approuvée et diffusée", value: 4 }] },
      { text: "Comment mesurez-vous la valeur créée par les projets IT?", context: "La mesure de la valeur IT justifie les investissements", options: [{ label: "Pas de mesure", value: 0 }, { label: "Estimation informelle", value: 1 }, { label: "KPIs basiques", value: 2 }, { label: "KPIs détaillés", value: 3 }, { label: "Tableau de bord complet", value: 4 }] },
      { text: "La direction est-elle informée des incidents IT majeurs dans des délais définis?", context: "L'escalade des incidents critiques est essentielle", options: [{ label: "Non", value: 0 }, { label: "Informellement", value: 1 }, { label: "Processus défini mais non respecté", value: 2 }, { label: "Processus respecté", value: 3 }, { label: "Automatisé avec SLA", value: 4 }] },
      { text: "Les ressources IT (budget, équipes) sont-elles revues périodiquement?", context: "L'optimisation des ressources IT maximise l'efficacité", options: [{ label: "Jamais", value: 0 }, { label: "Annuellement", value: 2 }, { label: "Trimestriellement", value: 3 }, { label: "En continu", value: 4 }] },
      { text: "Existe-t-il des indicateurs de performance IT suivis par la direction?", context: "Les KPIs IT permettent le pilotage stratégique", options: [{ label: "Non", value: 0 }, { label: "Quelques indicateurs", value: 2 }, { label: "Dashboard complet", value: 4 }] },
      { text: "Les parties prenantes métier sont-elles impliquées dans les décisions IT stratégiques?", context: "L'implication métier garantit l'alignement", options: [{ label: "Jamais", value: 0 }, { label: "Rarement", value: 1 }, { label: "Parfois", value: 2 }, { label: "Souvent", value: 3 }, { label: "Systématiquement", value: 4 }] },
      { text: "Comment évaluez-vous la satisfaction des utilisateurs vis-à-vis des services IT?", context: "La satisfaction utilisateur mesure l'efficacité IT", options: [{ label: "Pas d'évaluation", value: 0 }, { label: "Feedback informel", value: 1 }, { label: "Enquêtes ponctuelles", value: 2 }, { label: "Enquêtes régulières", value: 3 }, { label: "Mesure continue avec actions", value: 4 }] },
    ],
    APO: [
      { text: "Disposez-vous d'un schéma directeur IT aligné sur la stratégie de l'organisation?", context: "Le schéma directeur oriente les investissements IT", options: [{ label: "Non", value: 0 }, { label: "En cours", value: 2 }, { label: "Oui, mis à jour régulièrement", value: 4 }] },
      { text: "Existe-t-il une cartographie des applications et systèmes de l'organisation?", context: "La cartographie SI permet de gérer le patrimoine applicatif", options: [{ label: "Non", value: 0 }, { label: "Partielle", value: 1 }, { label: "Complète mais non maintenue", value: 2 }, { label: "Complète et maintenue", value: 4 }] },
      { text: "Comment gérez-vous l'innovation technologique et la veille?", context: "L'innovation maintient la compétitivité", options: [{ label: "Pas de veille", value: 0 }, { label: "Veille informelle", value: 1 }, { label: "Veille structurée", value: 2 }, { label: "Programme d'innovation", value: 3 }, { label: "Lab innovation actif", value: 4 }] },
      { text: "Le budget IT est-il planifié et suivi de manière formelle?", context: "La gestion budgétaire IT assure la maîtrise des coûts", options: [{ label: "Non", value: 0 }, { label: "Estimation grossière", value: 1 }, { label: "Budget annuel", value: 2 }, { label: "Budget détaillé avec suivi", value: 3 }, { label: "Gestion financière optimisée", value: 4 }] },
      { text: "Comment gérez-vous les compétences et la formation de l'équipe IT?", context: "Les compétences IT doivent évoluer avec les technologies", options: [{ label: "Pas de plan", value: 0 }, { label: "Formations ponctuelles", value: 1 }, { label: "Plan de formation annuel", value: 2 }, { label: "Gestion des compétences", value: 3 }, { label: "Programme de développement continu", value: 4 }] },
      { text: "Existe-t-il des accords de niveau de service (SLA) avec les directions métier?", context: "Les SLA formalisent les engagements IT", options: [{ label: "Non", value: 0 }, { label: "Informels", value: 1 }, { label: "Quelques SLA", value: 2 }, { label: "SLA pour services critiques", value: 3 }, { label: "SLA complets et mesurés", value: 4 }] },
      { text: "Comment gérez-vous vos fournisseurs et prestataires IT?", context: "La gestion des fournisseurs impacte la qualité des services", options: [{ label: "Pas de gestion", value: 0 }, { label: "Suivi contractuel basique", value: 1 }, { label: "Évaluations périodiques", value: 2 }, { label: "Gestion structurée", value: 3 }, { label: "Partenariats stratégiques", value: 4 }] },
      { text: "La qualité des livrables IT est-elle contrôlée?", context: "Le contrôle qualité garantit la fiabilité", options: [{ label: "Non", value: 0 }, { label: "Tests basiques", value: 1 }, { label: "Plan de tests", value: 2 }, { label: "Processus qualité", value: 3 }, { label: "Assurance qualité complète", value: 4 }] },
      { text: "Disposez-vous d'une politique de sécurité de l'information documentée?", context: "La PSSI est le socle de la sécurité", options: [{ label: "Non", value: 0 }, { label: "En cours", value: 2 }, { label: "Oui, appliquée", value: 4 }] },
      { text: "Comment gérez-vous les risques liés aux projets IT?", context: "La gestion des risques projet limite les échecs", options: [{ label: "Pas de gestion", value: 0 }, { label: "Identification informelle", value: 1 }, { label: "Registre des risques", value: 2 }, { label: "Gestion active", value: 3 }, { label: "Processus mature", value: 4 }] },
    ],
    BAI: [
      { text: "Existe-t-il une méthodologie de gestion de projet IT formalisée?", context: "Une méthodologie structurée améliore la réussite des projets", options: [{ label: "Non", value: 0 }, { label: "Pratiques informelles", value: 1 }, { label: "Méthodologie définie", value: 2 }, { label: "Méthodologie appliquée", value: 3 }, { label: "Méthodologie optimisée", value: 4 }] },
      { text: "Comment recueillez-vous et formalisez-vous les besoins métier?", context: "L'expression des besoins conditionne la réussite", options: [{ label: "Pas de processus", value: 0 }, { label: "Échanges informels", value: 1 }, { label: "Cahier des charges", value: 2 }, { label: "Processus structuré", value: 3 }, { label: "Gestion des exigences", value: 4 }] },
      { text: "Les solutions IT sont-elles testées avant mise en production?", context: "Les tests réduisent les risques de régression", options: [{ label: "Jamais", value: 0 }, { label: "Tests basiques", value: 1 }, { label: "Tests fonctionnels", value: 2 }, { label: "Tests complets", value: 3 }, { label: "Tests automatisés", value: 4 }] },
      { text: "Comment gérez-vous le passage en production des nouvelles applications?", context: "Un processus de mise en production fiabilise les déploiements", options: [{ label: "Ad hoc", value: 0 }, { label: "Processus basique", value: 1 }, { label: "Processus défini", value: 2 }, { label: "Processus avec validation", value: 3 }, { label: "Processus automatisé (CI/CD)", value: 4 }] },
      { text: "Les utilisateurs sont-ils formés lors du déploiement de nouvelles solutions?", context: "La formation utilisateur favorise l'adoption", options: [{ label: "Jamais", value: 0 }, { label: "Documentation seule", value: 1 }, { label: "Formation ponctuelle", value: 2 }, { label: "Programme de formation", value: 3 }, { label: "Accompagnement complet", value: 4 }] },
      { text: "Comment documentez-vous vos systèmes et applications?", context: "La documentation facilite la maintenance", options: [{ label: "Pas de documentation", value: 0 }, { label: "Documentation partielle", value: 1 }, { label: "Documentation technique", value: 2 }, { label: "Documentation complète", value: 3 }, { label: "Documentation à jour et accessible", value: 4 }] },
      { text: "Existe-t-il un processus de gestion des changements IT?", context: "La gestion des changements limite les incidents", options: [{ label: "Non", value: 0 }, { label: "Informel", value: 1 }, { label: "Processus défini", value: 2 }, { label: "CAB en place", value: 3 }, { label: "Processus mature ITIL", value: 4 }] },
      { text: "Comment gérez-vous le patrimoine applicatif et son obsolescence?", context: "La gestion de l'obsolescence évite la dette technique", options: [{ label: "Pas de gestion", value: 0 }, { label: "Réactif", value: 1 }, { label: "Inventaire", value: 2 }, { label: "Plan de modernisation", value: 3 }, { label: "Gestion proactive", value: 4 }] },
      { text: "Les configurations IT sont-elles documentées et versionnées?", context: "La gestion de configuration assure la traçabilité", options: [{ label: "Non", value: 0 }, { label: "Partiellement", value: 2 }, { label: "CMDB en place", value: 4 }] },
      { text: "Comment capitalisez-vous les connaissances IT de l'organisation?", context: "La gestion des connaissances préserve le savoir-faire", options: [{ label: "Pas de capitalisation", value: 0 }, { label: "Documents épars", value: 1 }, { label: "Wiki/Base documentaire", value: 2 }, { label: "Base de connaissances structurée", value: 3 }, { label: "Knowledge management actif", value: 4 }] },
    ],
    DSS: [
      { text: "Comment surveillez-vous la disponibilité de vos systèmes critiques?", context: "La supervision garantit la disponibilité", options: [{ label: "Pas de supervision", value: 0 }, { label: "Contrôles manuels", value: 1 }, { label: "Outils basiques", value: 2 }, { label: "Monitoring avancé", value: 3 }, { label: "NOC/Supervision 24/7", value: 4 }] },
      { text: "Existe-t-il un processus de gestion des incidents IT?", context: "La gestion des incidents minimise l'impact", options: [{ label: "Non", value: 0 }, { label: "Ad hoc", value: 1 }, { label: "Processus défini", value: 2 }, { label: "Outil de ticketing", value: 3 }, { label: "Processus ITIL mature", value: 4 }] },
      { text: "Comment gérez-vous les demandes de service des utilisateurs?", context: "La gestion des demandes améliore la satisfaction", options: [{ label: "Informel", value: 0 }, { label: "Email/Téléphone", value: 1 }, { label: "Portail de demandes", value: 2 }, { label: "Catalogue de services", value: 3 }, { label: "Self-service automatisé", value: 4 }] },
      { text: "Disposez-vous d'un plan de continuité d'activité IT (PCA)?", context: "Le PCA assure la résilience", options: [{ label: "Non", value: 0 }, { label: "En cours", value: 1 }, { label: "Documenté", value: 2 }, { label: "Testé annuellement", value: 3 }, { label: "Testé et optimisé", value: 4 }] },
      { text: "Comment gérez-vous les sauvegardes de données?", context: "Les sauvegardes protègent contre la perte de données", options: [{ label: "Pas de sauvegarde", value: 0 }, { label: "Sauvegardes manuelles", value: 1 }, { label: "Sauvegardes automatisées", value: 2 }, { label: "Sauvegardes testées", value: 3 }, { label: "Stratégie 3-2-1 respectée", value: 4 }] },
      { text: "Comment protégez-vous vos systèmes contre les cybermenaces?", context: "La cybersécurité est critique", options: [{ label: "Protection minimale", value: 0 }, { label: "Antivirus/Firewall", value: 1 }, { label: "Solutions de sécurité", value: 2 }, { label: "Sécurité multicouche", value: 3 }, { label: "SOC/Sécurité avancée", value: 4 }] },
      { text: "Les accès aux systèmes sont-ils gérés de manière formelle?", context: "La gestion des accès protège les données", options: [{ label: "Pas de gestion", value: 0 }, { label: "Gestion informelle", value: 1 }, { label: "Processus défini", value: 2 }, { label: "Revue des accès", value: 3 }, { label: "IAM complet", value: 4 }] },
      { text: "Comment gérez-vous les problèmes récurrents IT?", context: "La gestion des problèmes élimine les causes racines", options: [{ label: "Pas de gestion", value: 0 }, { label: "Réactif", value: 1 }, { label: "Analyse ponctuelle", value: 2 }, { label: "Processus de problem management", value: 3 }, { label: "Amélioration continue", value: 4 }] },
      { text: "Disposez-vous d'un plan de reprise d'activité IT (PRA)?", context: "Le PRA permet de redémarrer après un sinistre", options: [{ label: "Non", value: 0 }, { label: "Informel", value: 1 }, { label: "Documenté", value: 2 }, { label: "Testé", value: 3 }, { label: "RTO/RPO respectés", value: 4 }] },
      { text: "Comment gérez-vous les mises à jour et correctifs de sécurité?", context: "Le patch management protège contre les vulnérabilités", options: [{ label: "Pas de gestion", value: 0 }, { label: "Ad hoc", value: 1 }, { label: "Processus défini", value: 2 }, { label: "Automatisé", value: 3 }, { label: "Gestion proactive", value: 4 }] },
    ],
    MEA: [
      { text: "Réalisez-vous des audits IT réguliers (internes ou externes)?", context: "Les audits évaluent la conformité et l'efficacité", options: [{ label: "Jamais", value: 0 }, { label: "En cas de besoin", value: 1 }, { label: "Annuellement", value: 2 }, { label: "Régulièrement", value: 3 }, { label: "Programme d'audit continu", value: 4 }] },
      { text: "Comment mesurez-vous la performance des services IT?", context: "La mesure de performance guide l'amélioration", options: [{ label: "Pas de mesure", value: 0 }, { label: "Indicateurs basiques", value: 1 }, { label: "KPIs définis", value: 2 }, { label: "Tableaux de bord", value: 3 }, { label: "Reporting automatisé", value: 4 }] },
      { text: "Les contrôles internes IT sont-ils documentés et évalués?", context: "Les contrôles internes réduisent les risques", options: [{ label: "Non", value: 0 }, { label: "Partiellement", value: 1 }, { label: "Documentés", value: 2 }, { label: "Évalués périodiquement", value: 3 }, { label: "Optimisés en continu", value: 4 }] },
      { text: "Comment assurez-vous la conformité réglementaire IT (RGPD, etc.)?", context: "La conformité réglementaire est obligatoire", options: [{ label: "Pas de gestion", value: 0 }, { label: "Réactif", value: 1 }, { label: "Veille réglementaire", value: 2 }, { label: "Programme de conformité", value: 3 }, { label: "Conformité proactive", value: 4 }] },
      { text: "Existe-t-il un processus de suivi des recommandations d'audit?", context: "Le suivi des recommandations assure l'amélioration", options: [{ label: "Non", value: 0 }, { label: "Informel", value: 1 }, { label: "Suivi documenté", value: 2 }, { label: "Plan d'action", value: 3 }, { label: "Suivi et clôture formels", value: 4 }] },
      { text: "Réalisez-vous des tests de vulnérabilité ou d'intrusion?", context: "Les tests de sécurité identifient les failles", options: [{ label: "Jamais", value: 0 }, { label: "En cas d'incident", value: 1 }, { label: "Annuellement", value: 2 }, { label: "Régulièrement", value: 3 }, { label: "En continu (bug bounty)", value: 4 }] },
      { text: "Comment évaluez-vous la maturité de vos processus IT?", context: "L'évaluation de maturité guide la progression", options: [{ label: "Pas d'évaluation", value: 0 }, { label: "Auto-évaluation ponctuelle", value: 1 }, { label: "Évaluation structurée", value: 2 }, { label: "Benchmark", value: 3 }, { label: "Amélioration continue", value: 4 }] },
      { text: "Les incidents de sécurité sont-ils analysés et documentés?", context: "L'analyse des incidents prévient les récidives", options: [{ label: "Non", value: 0 }, { label: "Partiellement", value: 1 }, { label: "Documentés", value: 2 }, { label: "Analysés (RCA)", value: 3 }, { label: "Base de connaissances", value: 4 }] },
      { text: "Disposez-vous d'un DPO ou responsable conformité IT?", context: "Un responsable dédié facilite la conformité", options: [{ label: "Non", value: 0 }, { label: "Rôle partagé", value: 2 }, { label: "DPO désigné", value: 4 }] },
      { text: "Comment communiquez-vous sur la performance IT à la direction?", context: "Le reporting direction assure la transparence", options: [{ label: "Pas de communication", value: 0 }, { label: "En cas de problème", value: 1 }, { label: "Reporting périodique", value: 2 }, { label: "Comité de pilotage", value: 3 }, { label: "Dashboard temps réel", value: 4 }] },
    ],
  };

  // Questions spécifiques par secteur (complément)
  const sectorSpecificQuestions: Record<string, Record<string, Array<{
    text: string;
    context: string;
    options: Array<{ label: string; value: number }>;
  }>>> = {
    health: {
      EDM: [
        { text: "Comment la direction médicale est-elle impliquée dans les décisions IT stratégiques?", context: "L'implication médicale est cruciale en santé", options: [{ label: "Pas d'implication", value: 0 }, { label: "Information ponctuelle", value: 1 }, { label: "Consultation régulière", value: 2 }, { label: "Participation aux comités", value: 3 }, { label: "Co-pilotage", value: 4 }] },
        { text: "Comment gérez-vous la conformité HDS (Hébergement Données de Santé)?", context: "La certification HDS est obligatoire", options: [{ label: "Non conforme", value: 0 }, { label: "En cours", value: 2 }, { label: "Certifié", value: 4 }] },
      ],
      APO: [
        { text: "Comment planifiez-vous l'interopérabilité entre vos systèmes médicaux?", context: "L'interopérabilité est critique pour les soins", options: [{ label: "Pas de plan", value: 0 }, { label: "En cours", value: 2 }, { label: "Opérationnelle", value: 4 }] },
      ],
      DSS: [
        { text: "Disposez-vous d'un PCA pour les systèmes critiques de soins?", context: "La disponibilité impacte la sécurité des patients", options: [{ label: "Non", value: 0 }, { label: "Basique", value: 2 }, { label: "Complet et testé", value: 4 }] },
      ],
    },
    finance: {
      EDM: [
        { text: "Comment le comité des risques supervise-t-il les risques IT et cyber?", context: "La supervision des risques IT est une exigence bancaire", options: [{ label: "Pas de supervision", value: 0 }, { label: "Revue annuelle", value: 1 }, { label: "Trimestrielle", value: 2 }, { label: "Mensuelle", value: 3 }, { label: "Temps réel", value: 4 }] },
        { text: "Existe-t-il une politique de cyber-résilience approuvée par le CA?", context: "DORA exige l'implication du CA", options: [{ label: "Non", value: 0 }, { label: "En cours", value: 2 }, { label: "Approuvée", value: 4 }] },
      ],
      APO: [
        { text: "Comment gérez-vous la conformité PCI DSS?", context: "PCI DSS est obligatoire pour les cartes bancaires", options: [{ label: "Non conforme", value: 0 }, { label: "En cours", value: 2 }, { label: "Certifié", value: 4 }] },
      ],
      DSS: [
        { text: "Disposez-vous d'un SOC pour la surveillance des menaces?", context: "Un SOC est essentiel dans le secteur bancaire", options: [{ label: "Non", value: 0 }, { label: "Externalisé basique", value: 2 }, { label: "SOC 24/7", value: 4 }] },
      ],
    },
    industry: {
      EDM: [
        { text: "Comment la direction industrielle est-elle impliquée dans la gouvernance IT/OT?", context: "La convergence IT/OT nécessite une gouvernance unifiée", options: [{ label: "Silos séparés", value: 0 }, { label: "Coordination ponctuelle", value: 2 }, { label: "Gouvernance intégrée", value: 4 }] },
      ],
      APO: [
        { text: "Disposez-vous d'une cartographie intégrée IT et OT?", context: "La visibilité IT/OT est critique", options: [{ label: "Non", value: 0 }, { label: "Partielle", value: 2 }, { label: "Complète", value: 4 }] },
      ],
      DSS: [
        { text: "Avez-vous segmenté vos réseaux IT et OT (IEC 62443)?", context: "La segmentation est fondamentale en sécurité industrielle", options: [{ label: "Non", value: 0 }, { label: "Basique", value: 2 }, { label: "Conforme IEC 62443", value: 4 }] },
      ],
    },
  };

  // Fusionner les questions génériques et sectorielles
  const genericDomainQuestions = genericQuestions[domainCode] || [];
  const sectorDomainQuestions = sectorSpecificQuestions[sectorKey]?.[domainCode] || [];
  
  // Combiner et dédupliquer (secteur en priorité, puis générique)
  const allQuestions = [...sectorDomainQuestions, ...genericDomainQuestions];

  // Prendre en compte les scores précédents pour personnaliser
  let reasoning = `Questions générées pour ${organizationContext.name} (secteur: ${organizationContext.sector}, ${organizationContext.employees} employés).`;

  if (previousScores) {
    const currentScore = previousScores[domainCode as keyof typeof previousScores];
    if (currentScore !== undefined && currentScore < 3) {
      reasoning += ` Le score précédent de ${currentScore}/5 en ${domainCode} indique un besoin d'amélioration dans ce domaine.`;
    }
  }

  const questions = allQuestions.slice(0, request.questionCount || 10).map((q, index) => ({
    id: `AI_${domainCode}_${Date.now()}_${index}`,
    text: q.text,
    context: q.context,
    options: q.options,
    scaleMax: Math.max(...q.options.map(o => o.value)),
  }));

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

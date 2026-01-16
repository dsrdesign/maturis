"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { normalizeToFive } from "../../../lib/questionnaires";
import { computeGlobalScore } from "../../../lib/score";
import { useOrganizations } from "../../../lib/store";
import { generateQuestionSuggestions, generateFollowUpQuestions } from "../../../lib/aiService";
import AIInsightPanel from "../../../../components/AIInsightPanel";

// Types pour les questions générées par IA
type AIQuestion = {
  id: string;
  text: string;
  context?: string;
  options: Array<{ label: string; value: number }>;
  scaleMax: number;
};

type AIDomain = {
  code: string;
  name: string;
  questions: AIQuestion[];
  isLoading: boolean;
  isLoaded: boolean;
};

const DOMAIN_INFO = [
  { code: 'EDM', name: 'Évaluer, Diriger et Surveiller' },
  { code: 'APO', name: 'Aligner, Planifier et Organiser' },
  { code: 'BAI', name: 'Bâtir, Acquérir et Implémenter' },
  { code: 'DSS', name: 'Délivrer, Servir et Supporter' },
  { code: 'MEA', name: 'Surveiller, Évaluer et Apprécier' },
];

export default function QcmPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { getOrganizationById, updateOrganization } = useOrganizations();
  const org = getOrganizationById(id);

  const [currentDomainIndex, setCurrentDomainIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [activeQuestionId, setActiveQuestionId] = useState<string>("");
  const [showAIPanel, setShowAIPanel] = useState(true);
  
  // État pour les domaines générés par IA
  const [aiDomains, setAiDomains] = useState<AIDomain[]>(
    DOMAIN_INFO.map(d => ({
      ...d,
      questions: [],
      isLoading: false,
      isLoaded: false,
    }))
  );
  const [globalLoading, setGlobalLoading] = useState(true);

  // Fonction pour charger les questions d'un domaine via l'IA
  const loadDomainQuestions = useCallback(async (domainIndex: number) => {
    if (!org) return;
    
    const domain = DOMAIN_INFO[domainIndex];
    
    // Marquer comme en chargement
    setAiDomains(prev => prev.map((d, i) => 
      i === domainIndex ? { ...d, isLoading: true } : d
    ));

    try {
      const response = await fetch('/api/ai/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationContext: {
            name: org.name,
            sector: org.sector,
            employees: org.employees,
            country: org.country,
            city: org.city,
            creationDate: org.creationDate,
          },
          domainCode: domain.code,
          domainName: domain.name,
          previousScores: org.domainScores,
          questionCount: 10, // 10 questions par domaine
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAiDomains(prev => prev.map((d, i) => 
          i === domainIndex ? {
            ...d,
            questions: data.questions || [],
            isLoading: false,
            isLoaded: true,
          } : d
        ));
      } else {
        throw new Error('API error');
      }
    } catch (error) {
      console.error(`Error loading ${domain.code} questions:`, error);
      setAiDomains(prev => prev.map((d, i) => 
        i === domainIndex ? { ...d, isLoading: false, isLoaded: true } : d
      ));
    }
  }, [org]);

  // Charger toutes les questions au démarrage
  useEffect(() => {
    if (!org) return;
    
    const loadAllDomains = async () => {
      setGlobalLoading(true);
      
      // Charger tous les domaines en parallèle
      await Promise.all(
        DOMAIN_INFO.map((_, index) => loadDomainQuestions(index))
      );
      
      setGlobalLoading(false);
    };

    loadAllDomains();
  }, [org, loadDomainQuestions]);

  if (!org) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Organisation non trouvée</p>
      </div>
    );
  }

  const currentDomain = aiDomains[currentDomainIndex];

  // Générer les suggestions IA pour toutes les questions chargées
  const allQuestions = aiDomains.flatMap(d => d.questions);
  const aiContext = {
    organization: org,
    previousScores: org.domainScores,
    auditHistory: org.audits?.map(a => ({ date: a.date, score: a.score })),
  };
  const aiSuggestions = generateQuestionSuggestions(allQuestions, aiContext);
  const followUpQuestions = generateFollowUpQuestions(answers, aiContext);

  // Calculer la progression
  const totalQuestions = allQuestions.length;
  const answeredCount = Object.keys(answers).length;
  const progressPercent = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  // Vérifier si le domaine actuel est complet
  const currentDomainQuestions = currentDomain?.questions || [];
  const currentDomainAnswered = currentDomainQuestions.filter(q => answers[q.id] !== undefined).length;
  const isDomainComplete = currentDomainQuestions.length > 0 && currentDomainAnswered === currentDomainQuestions.length;

  function selectAnswer(qid: string, value: number) {
    setAnswers((s) => ({ ...s, [qid]: value }));
    setActiveQuestionId(qid);
  }

  function focusQuestion(qid: string) {
    setActiveQuestionId(qid);
  }

  function nextDomain() {
    if (currentDomainIndex < aiDomains.length - 1) {
      setCurrentDomainIndex(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function prevDomain() {
    if (currentDomainIndex > 0) {
      setCurrentDomainIndex(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function goToDomain(index: number) {
    setCurrentDomainIndex(index);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Fonction pour régénérer les questions d'un domaine
  async function regenerateDomainQuestions() {
    await loadDomainQuestions(currentDomainIndex);
  }

  function submit() {
    // Vérifier que l'organisation existe
    if (!org) return;
    
    // Vérifier que toutes les questions sont répondues
    if (Object.keys(answers).length < totalQuestions) {
      alert('Veuillez répondre à toutes les questions avant de soumettre.');
      return;
    }

    // Calculer les scores par domaine
    const domainScores: { EDM: number; APO: number; BAI: number; DSS: number; MEA: number } = {
      EDM: 0,
      APO: 0,
      BAI: 0,
      DSS: 0,
      MEA: 0
    };
    
    for (const domain of aiDomains) {
      const vals: number[] = [];
      for (const q of domain.questions) {
        const raw = answers[q.id];
        const v = typeof raw === 'number' ? raw : 0;
        vals.push(normalizeToFive(v, q.scaleMax));
      }
      const avg = vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
      domainScores[domain.code as keyof typeof domainScores] = Math.round(avg * 100) / 100;
    }

    // Calculer le score global avec les poids personnalisés de l'organisation
    const global = computeGlobalScore(domainScores, org.sector, org.domainWeights) || 0;
    const percent = Math.round((global / 5) * 100);

    // Créer un nouvel audit avec un ID basé sur le contenu
    const dateNow = new Date();
    const date = dateNow.toISOString().slice(0, 10);
    const auditId = `qcm-${date}-${Object.keys(answers).length}`;
    const newAudit = {
      id: auditId,
      date,
      score: percent,
      title: 'Analyse COBIT IA'
    };

    // Mettre à jour l'organisation dans le store
    updateOrganization(id, {
      domainScores,
      score: percent,
      lastAudit: date,
      audits: [newAudit, ...(org.audits || [])]
    });

    setSubmitted(true);
    setTimeout(() => router.push(`/organizations/${id}`), 2000);
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="bg-white shadow-2xl p-12 rounded-2xl text-center max-w-md animate-in">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-3 text-gray-800">Analyse terminée !</h2>
          <p className="text-gray-600 mb-2">Vos réponses ont été enregistrées avec succès.</p>
          <p className="text-sm text-gray-500">Redirection vers le dashboard...</p>
        </div>
      </div>
    );
  }

  // Écran de chargement global pendant la génération des questions
  if (globalLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="bg-white shadow-2xl p-12 rounded-2xl text-center max-w-lg">
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-3 text-gray-800">Préparation de l&apos;analyse</h2>
          <p className="text-gray-600 mb-4">
            L&apos;IA génère des questions personnalisées pour <strong>{org.name}</strong>...
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-indigo-600">
            <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <div className="mt-6 space-y-2">
            {aiDomains.map((domain) => (
              <div key={domain.code} className="flex items-center justify-between px-4 py-2 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-700">{domain.code} - {domain.name}</span>
                {domain.isLoaded ? (
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : domain.isLoading ? (
                  <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
      <div className="app-container px-4 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Analyse COBIT</h1>
              <p className="text-gray-600 mt-1">{org.name}</p>
            </div>
            <div className="flex items-center gap-3">
              {/* Toggle AI Panel */}
              <button
                onClick={() => setShowAIPanel(!showAIPanel)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  showAIPanel 
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg' 
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Assistant IA
              </button>
              <button
                onClick={() => router.push(`/organizations/${id}`)}
                className="px-4 py-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Progression globale</span>
              <span className="text-sm font-bold text-[#3B6BFF]">{progressPercent}%</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#3B6BFF] to-[#6B8AFF] transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-gray-500">
                {answeredCount} / {totalQuestions} questions répondues
              </span>
              {org.lastAudit && (
                <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
                  Dernière analyse: {org.lastAudit}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Domain Navigation */}
        <div className="mb-6 bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {aiDomains.map((domain, index) => {
              const domainQuestionsCount = domain.questions.length;
              const domainAnsweredCount = domain.questions.filter(q => answers[q.id] !== undefined).length;
              const isComplete = domainAnsweredCount === domainQuestionsCount && domainQuestionsCount > 0;
              const isCurrent = index === currentDomainIndex;
              const hasPriorityQuestions = aiSuggestions.some(s => 
                s.questionId.startsWith(domain.code) && s.priority === 'high'
              );

              return (
                <button
                  key={domain.code}
                  onClick={() => goToDomain(index)}
                  className={`flex-shrink-0 px-4 py-3 rounded-lg transition-all relative ${
                    isCurrent
                      ? 'bg-gradient-to-r from-[#3B6BFF] to-[#6B8AFF] text-white shadow-lg scale-105'
                      : isComplete
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {hasPriorityQuestions && !isCurrent && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  )}
                  <div className="flex items-center gap-2">
                    {isComplete && !isCurrent && (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                    <div>
                      <div className="font-semibold text-sm">{domain.code}</div>
                      <div className="text-xs opacity-90">{domainAnsweredCount}/{domainQuestionsCount}</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content with AI Panel */}
        <div className={`grid gap-6 ${showAIPanel ? 'lg:grid-cols-3' : 'grid-cols-1'}`}>
          {/* Questions Panel */}
          <div className={showAIPanel ? 'lg:col-span-2' : ''}>
            {/* Current Domain Questions */}
            {currentDomain && (
              <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#3B6BFF] to-[#6B8AFF] rounded-xl flex items-center justify-center text-white font-bold">
                        {currentDomain.code}
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-800">{currentDomain.name}</h2>
                        <p className="text-sm text-gray-500">
                          {currentDomainAnswered} / {currentDomainQuestions.length} questions répondues
                        </p>
                      </div>
                    </div>
                    {/* Bouton régénérer */}
                    <button
                      onClick={regenerateDomainQuestions}
                      disabled={currentDomain.isLoading}
                      className="flex items-center gap-2 px-3 py-2 text-sm bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors disabled:opacity-50"
                    >
                      <svg className={`w-4 h-4 ${currentDomain.isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      {currentDomain.isLoading ? 'Régénération...' : 'Nouvelles questions'}
                    </button>
                  </div>
                  {/* Badge IA */}
                  <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg text-sm">
                    <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <span className="text-indigo-700">Questions personnalisées par IA pour le secteur {org.sector}</span>
                  </div>
                </div>

                <div className="space-y-6">
                  {currentDomain.questions.map((q, qIndex) => {
                    const isAnswered = answers[q.id] !== undefined;
                    const suggestion = aiSuggestions.find(s => s.questionId === q.id);
                    const isPriority = suggestion?.priority === 'high';
                    const isActive = activeQuestionId === q.id;

                    return (
                      <div
                        key={q.id}
                        onClick={() => focusQuestion(q.id)}
                        className={`border-2 rounded-xl p-6 transition-all cursor-pointer ${
                          isActive
                            ? 'border-indigo-400 bg-indigo-50/30 ring-2 ring-indigo-200'
                            : isAnswered
                            ? 'border-green-200 bg-green-50/30'
                            : isPriority
                            ? 'border-amber-200 bg-amber-50/20'
                            : 'border-gray-200 bg-white hover:border-blue-200'
                        }`}
                      >
                        <div className="flex items-start gap-3 mb-4">
                          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            isAnswered ? 'bg-green-500 text-white' : isPriority ? 'bg-amber-500 text-white' : 'bg-gray-200 text-gray-600'
                          }`}>
                            {isPriority && !isAnswered ? '!' : qIndex + 1}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-800 leading-relaxed">{q.text}</p>
                            {/* Afficher le contexte de la question générée par IA */}
                            {q.context && (
                              <div className="mt-2 flex items-start gap-2 text-sm text-purple-600 bg-purple-50 px-3 py-1.5 rounded-lg">
                                <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                                <span>{q.context}</span>
                              </div>
                            )}
                            {/* Afficher l'indice contextuel IA */}
                            {showAIPanel && suggestion?.contextHint && (
                              <div className="mt-2 flex items-center gap-2 text-sm text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg">
                                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>{suggestion.contextHint}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="grid gap-3 ml-11">
                          {q.options.map((opt) => {
                            const isSelected = answers[q.id] === opt.value;

                            return (
                              <label
                                key={opt.label}
                                className={`flex items-center gap-3 p-4 rounded-lg cursor-pointer transition-all ${
                                  isSelected
                                    ? 'bg-gradient-to-r from-[#3B6BFF] to-[#6B8AFF] text-white shadow-md scale-[1.02]'
                                    : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name={q.id}
                                  value={String(opt.value)}
                                  checked={isSelected}
                                  onChange={() => selectAnswer(q.id, opt.value)}
                                  className="w-5 h-5 accent-blue-600"
                                />
                                <span className={`font-medium ${isSelected ? 'text-white' : 'text-gray-700'}`}>
                                  {opt.label}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between bg-white rounded-xl p-6 shadow-sm">
              <button
                onClick={prevDomain}
                disabled={currentDomainIndex === 0}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                  currentDomainIndex === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:shadow-md'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Précédent
              </button>

              <div className="text-sm text-gray-600">
                Domaine {currentDomainIndex + 1} sur {aiDomains.length}
              </div>

              {currentDomainIndex < aiDomains.length - 1 ? (
                <button
                  onClick={nextDomain}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                    isDomainComplete
                      ? 'bg-gradient-to-r from-[#3B6BFF] to-[#6B8AFF] text-white hover:shadow-lg'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                  disabled={!isDomainComplete}
                >
                  Suivant
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ) : (
                <button
                  onClick={submit}
                  disabled={answeredCount < totalQuestions}
                  className={`flex items-center gap-2 px-8 py-3 rounded-lg font-bold transition-all ${
                    answeredCount === totalQuestions
                      ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:shadow-xl scale-105'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Terminer l&apos;analyse
                </button>
              )}
            </div>
          </div>

          {/* AI Insight Panel */}
          {showAIPanel && (
            <div className="lg:col-span-1 space-y-4">
              {/* Résumé des questions générées */}
              <div className="bg-white rounded-xl p-4 shadow-sm border border-indigo-100">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Questions générées par IA
                </h4>
                <p className="text-sm text-gray-600 mb-3">
                  {totalQuestions} questions personnalisées pour votre organisation dans le secteur {org.sector}.
                </p>
                <div className="space-y-2">
                  {aiDomains.map((domain, idx) => (
                    <div 
                      key={domain.code}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                        idx === currentDomainIndex 
                          ? 'bg-indigo-100 text-indigo-700' 
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                      }`}
                      onClick={() => goToDomain(idx)}
                    >
                      <span className="text-sm font-medium">{domain.code}</span>
                      <span className="text-xs">{domain.questions.length} questions</span>
                    </div>
                  ))}
                </div>
              </div>

              <AIInsightPanel
                suggestions={aiSuggestions}
                currentQuestionId={activeQuestionId || currentDomain?.questions[0]?.id || ''}
                domainCode={currentDomain?.code || 'EDM'}
                organization={org}
                previousScores={org.domainScores}
                currentAnswers={answers}
                auditHistory={org.audits?.map(a => ({ date: a.date, score: a.score }))}
              />

              {/* Questions de suivi IA */}
              {followUpQuestions.length > 0 && Object.keys(answers).length > 5 && (
                <div className="bg-white rounded-xl p-4 shadow-sm border border-amber-100">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Questions suggérées
                  </h4>
                  <ul className="space-y-2">
                    {followUpQuestions.map((q, idx) => (
                      <li key={idx} className="text-sm text-gray-600 bg-amber-50 rounded-lg px-3 py-2">
                        {q}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Statistiques rapides */}
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <h4 className="font-semibold text-gray-800 mb-3">Statistiques</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Questions prioritaires</span>
                    <span className="text-sm font-bold text-amber-600">
                      {aiSuggestions.filter(s => s.priority === 'high').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Score moyen actuel</span>
                    <span className="text-sm font-bold text-indigo-600">
                      {Object.values(answers).length > 0 
                        ? (Object.values(answers).reduce((a, b) => a + b, 0) / Object.values(answers).length).toFixed(1)
                        : '-'
                      }
                    </span>
                  </div>
                  {org.score > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Score précédent</span>
                      <span className="text-sm font-bold text-gray-500">{org.score}%</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
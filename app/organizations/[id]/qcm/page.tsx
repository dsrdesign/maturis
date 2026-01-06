"use client";
import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { questionnaires, normalizeToFive } from "../../../lib/questionnaires";
import { computeGlobalScore } from "../../../lib/score";
import { useOrganizations } from "../../../lib/store";

export default function QcmPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { getOrganizationById, updateOrganization } = useOrganizations();
  const org = getOrganizationById(id);

  const [currentDomainIndex, setCurrentDomainIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);

  if (!org) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Organisation non trouvée</p>
      </div>
    );
  }

  const sectorKey = org.sector === 'bank' ? 'finance' : org.sector;
  const domainMap = questionnaires[sectorKey]?.domains || {};
  const domainOrder = ['EDM', 'APO', 'BAI', 'DSS', 'MEA'];
  const domains = domainOrder.map(code => domainMap[code]).filter(Boolean);
  const currentDomain = domains[currentDomainIndex];

  // Calculer la progression
  const allQuestions = domains.flatMap(d => d.questions);
  const totalQuestions = allQuestions.length;
  const answeredCount = Object.keys(answers).length;
  const progressPercent = Math.round((answeredCount / totalQuestions) * 100);

  // Vérifier si le domaine actuel est complet
  const currentDomainQuestions = currentDomain?.questions || [];
  const currentDomainAnswered = currentDomainQuestions.filter(q => answers[q.id] !== undefined).length;
  const isDomainComplete = currentDomainAnswered === currentDomainQuestions.length;

  function selectAnswer(qid: string, value: number) {
    setAnswers((s) => ({ ...s, [qid]: value }));
  }

  function nextDomain() {
    if (currentDomainIndex < domains.length - 1) {
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

  function submit() {
    // Vérifier que toutes les questions sont répondues
    if (Object.keys(answers).length < totalQuestions) {
      alert('Veuillez répondre à toutes les questions avant de soumettre.');
      return;
    }

    // Calculer les scores par domaine
    const domainScores: Record<string, number> = {};
    for (const domain of domains) {
      const vals: number[] = [];
      for (const q of domain.questions) {
        const raw = answers[q.id];
        const v = typeof raw === 'number' ? raw : 0;
        vals.push(normalizeToFive(v, q.scaleMax));
      }
      const avg = vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
      domainScores[domain.code] = Math.round(avg * 100) / 100;
    }

    // Calculer le score global
    const global = computeGlobalScore(domainScores as any, org.sector) || 0;
    const percent = Math.round((global / 5) * 100);

    // Créer un nouvel audit
    const date = new Date().toISOString().slice(0, 10);
    const newAudit = {
      id: `qcm-${Date.now()}`,
      date,
      score: percent,
      title: 'Analyse COBIT complète'
    };

    // Mettre à jour l'organisation dans le store
    updateOrganization(id, {
      domainScores: domainScores as any,
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
      <div className="app-container px-4 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Analyse COBIT</h1>
              <p className="text-gray-600 mt-1">{org.name}</p>
            </div>
            <button
              onClick={() => router.push(`/organizations/${id}`)}
              className="px-4 py-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
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
            <div className="mt-3 text-xs text-gray-500">
              {answeredCount} / {totalQuestions} questions répondues
            </div>
          </div>
        </div>

        {/* Domain Navigation */}
        <div className="mb-6 bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {domains.map((domain, index) => {
              const domainQuestionsCount = domain.questions.length;
              const domainAnsweredCount = domain.questions.filter(q => answers[q.id] !== undefined).length;
              const isComplete = domainAnsweredCount === domainQuestionsCount;
              const isCurrent = index === currentDomainIndex;

              return (
                <button
                  key={domain.code}
                  onClick={() => goToDomain(index)}
                  className={`flex-shrink-0 px-4 py-3 rounded-lg transition-all ${
                    isCurrent
                      ? 'bg-gradient-to-r from-[#3B6BFF] to-[#6B8AFF] text-white shadow-lg scale-105'
                      : isComplete
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
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

        {/* Current Domain Questions */}
        {currentDomain && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
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
            </div>

            <div className="space-y-6">
              {currentDomain.questions.map((q, qIndex) => {
                const isAnswered = answers[q.id] !== undefined;

                return (
                  <div
                    key={q.id}
                    className={`border-2 rounded-xl p-6 transition-all ${
                      isAnswered
                        ? 'border-green-200 bg-green-50/30'
                        : 'border-gray-200 bg-white hover:border-blue-200'
                    }`}
                  >
                    <div className="flex items-start gap-3 mb-4">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        isAnswered ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {qIndex + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-800 leading-relaxed">{q.text}</p>
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
            Domaine {currentDomainIndex + 1} sur {domains.length}
          </div>

          {currentDomainIndex < domains.length - 1 ? (
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
              Terminer l'analyse
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
"use client";
import { useState } from 'react';

type AIQuestion = {
  id: string;
  text: string;
  context: string;
  options: Array<{ label: string; value: number }>;
  scaleMax: number;
};

type AIGeneratedQuestionsProps = {
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
  currentAnswers: Record<string, number>;
  onAnswerSelect: (questionId: string, value: number) => void;
};

export default function AIGeneratedQuestions({
  organizationContext,
  domainCode,
  domainName,
  previousScores,
  currentAnswers,
  onAnswerSelect,
}: AIGeneratedQuestionsProps) {
  const [aiQuestions, setAiQuestions] = useState<AIQuestion[]>([]);
  const [reasoning, setReasoning] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateQuestions = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/generate-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          organizationContext,
          domainCode,
          domainName,
          previousScores,
          existingAnswers: currentAnswers,
          questionCount: 3,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la génération des questions');
      }

      const data = await response.json();
      setAiQuestions(data.questions || []);
      setReasoning(data.reasoning || '');
      setHasGenerated(true);
      setIsExpanded(true);
    } catch (err) {
      console.error('Error generating questions:', err);
      setError('Impossible de générer les questions. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const regenerateQuestions = () => {
    setAiQuestions([]);
    setReasoning('');
    setHasGenerated(false);
    generateQuestions();
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 via-white to-indigo-50 rounded-xl border border-purple-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div
        className="px-4 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <span className="font-semibold">Questions IA personnalisées</span>
          <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
            {domainCode}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {hasGenerated && (
            <span className="text-xs bg-green-400/30 px-2 py-0.5 rounded-full">
              {aiQuestions.length} questions
            </span>
          )}
          <svg
            className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4">
          {/* Bouton de génération */}
          {!hasGenerated && !isLoading && (
            <div className="text-center py-6">
              <div className="mb-4">
                <svg className="w-12 h-12 mx-auto text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-gray-600 mb-4 text-sm">
                Générez des questions personnalisées pour <strong>{organizationContext.name}</strong> 
                <br />basées sur son profil et le domaine <strong>{domainName}</strong>
              </p>
              <button
                onClick={generateQuestions}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg font-medium hover:shadow-lg transition-all hover:scale-105"
              >
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Générer des questions IA
                </span>
              </button>
            </div>
          )}

          {/* Loading */}
          {isLoading && (
            <div className="text-center py-8">
              <div className="inline-flex items-center gap-3 px-4 py-2 bg-purple-100 rounded-full">
                <svg className="animate-spin h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span className="text-purple-700 font-medium">Génération en cours...</span>
              </div>
              <p className="text-sm text-gray-500 mt-3">
                L&apos;IA analyse votre organisation et génère des questions pertinentes
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 text-red-700">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">{error}</span>
              </div>
              <button
                onClick={generateQuestions}
                className="mt-2 text-sm text-red-600 hover:underline"
              >
                Réessayer
              </button>
            </div>
          )}

          {/* Questions générées */}
          {hasGenerated && aiQuestions.length > 0 && (
            <div className="space-y-4">
              {/* Reasoning */}
              {reasoning && (
                <div className="bg-purple-50 rounded-lg p-3 mb-4">
                  <div className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-purple-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-purple-700">{reasoning}</p>
                  </div>
                </div>
              )}

              {/* Liste des questions */}
              {aiQuestions.map((question, index) => {
                const isAnswered = currentAnswers[question.id] !== undefined;

                return (
                  <div
                    key={question.id}
                    className={`border-2 rounded-xl p-5 transition-all ${
                      isAnswered
                        ? 'border-green-200 bg-green-50/50'
                        : 'border-purple-200 bg-white hover:border-purple-300'
                    }`}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                        isAnswered ? 'bg-green-500 text-white' : 'bg-purple-500 text-white'
                      }`}>
                        {isAnswered ? '✓' : `+${index + 1}`}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-800 text-sm leading-relaxed">
                          {question.text}
                        </p>
                        {question.context && (
                          <p className="text-xs text-purple-600 mt-1 italic">
                            💡 {question.context}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid gap-2 ml-10">
                      {question.options.map((opt) => {
                        const isSelected = currentAnswers[question.id] === opt.value;

                        return (
                          <label
                            key={`${question.id}-${opt.value}`}
                            className={`flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-all text-sm ${
                              isSelected
                                ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-md'
                                : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                            }`}
                          >
                            <input
                              type="radio"
                              name={question.id}
                              value={String(opt.value)}
                              checked={isSelected}
                              onChange={() => onAnswerSelect(question.id, opt.value)}
                              className="w-4 h-4 accent-purple-600"
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

              {/* Bouton régénérer */}
              <div className="flex justify-center pt-2">
                <button
                  onClick={regenerateQuestions}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Générer d&apos;autres questions
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

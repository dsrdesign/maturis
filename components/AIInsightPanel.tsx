"use client";
import { useState } from 'react';
import { AISuggestion, generateDomainRecommendations, predictMaturityScore } from '../app/lib/aiService';
import { Organization } from '../app/lib/types';

type AIInsightPanelProps = {
  suggestions: AISuggestion[];
  currentQuestionId: string;
  domainCode: string;
  organization: {
    name: string;
    sector: string;
    employees: number;
  };
  previousScores?: {
    EDM: number;
    APO: number;
    BAI: number;
    DSS: number;
    MEA: number;
  };
  currentAnswers: Record<string, number>;
  auditHistory?: Array<{ date: string; score: number }>;
};

export default function AIInsightPanel({
  suggestions,
  currentQuestionId,
  domainCode,
  organization,
  previousScores,
  currentAnswers,
  auditHistory,
}: AIInsightPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showPrediction, setShowPrediction] = useState(false);

  const currentSuggestion = suggestions.find(s => s.questionId === currentQuestionId);
  const recommendations = generateDomainRecommendations(domainCode, {
    organization: organization as Organization,
    previousScores,
  });

  const prediction = predictMaturityScore(currentAnswers, {
    organization: organization as Organization,
    previousScores,
    auditHistory,
  });

  const priorityQuestions = suggestions.filter(s => s.priority === 'high');

  return (
    <div className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 rounded-xl border border-indigo-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div 
        className="px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <span className="font-semibold">Assistant IA</span>
          <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
            Suggestions personnalisées
          </span>
        </div>
        <svg 
          className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Suggestion contextuelle actuelle */}
          {currentSuggestion?.contextHint && (
            <div className="bg-white rounded-lg p-3 border border-indigo-100">
              <div className="flex items-start gap-2">
                <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                  currentSuggestion.priority === 'high' ? 'bg-red-100 text-red-600' :
                  currentSuggestion.priority === 'medium' ? 'bg-amber-100 text-amber-600' :
                  'bg-green-100 text-green-600'
                }`}>
                  {currentSuggestion.priority === 'high' ? '!' : '?'}
                </div>
                <div>
                  <p className="text-sm text-gray-700">{currentSuggestion.contextHint}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-xs text-gray-500">Pertinence:</span>
                    <div className="flex-1 h-1.5 bg-gray-200 rounded-full max-w-20">
                      <div 
                        className="h-full bg-indigo-500 rounded-full"
                        style={{ width: `${currentSuggestion.relevanceScore * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-indigo-600 font-medium">
                      {Math.round(currentSuggestion.relevanceScore * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Recommandations du domaine */}
          {recommendations.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Recommandations pour ce domaine
              </h4>
              <div className="space-y-1">
                {recommendations.map((rec, idx) => (
                  <div key={idx} className="text-sm text-gray-600 bg-white/50 rounded px-3 py-2">
                    {rec}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Questions prioritaires */}
          {priorityQuestions.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Points d&apos;attention ({priorityQuestions.length})
              </h4>
              <div className="text-xs text-gray-500">
                Questions identifiées comme prioritaires basées sur vos analyses précédentes
              </div>
            </div>
          )}

          {/* Score prédictif */}
          <div className="pt-2 border-t border-gray-100">
            <button
              onClick={() => setShowPrediction(!showPrediction)}
              className="w-full text-left"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Prédiction en temps réel
                </h4>
                <svg 
                  className={`w-4 h-4 text-gray-400 transition-transform ${showPrediction ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>
            
            {showPrediction && Object.keys(currentAnswers).length > 0 && (
              <div className="mt-3 bg-white rounded-lg p-4 border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-2xl font-bold text-indigo-600">
                      {prediction.predictedScore.toFixed(1)}/5
                    </div>
                    <div className="text-xs text-gray-500">Score estimé</div>
                  </div>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                    prediction.trend === 'improving' ? 'bg-green-100 text-green-700' :
                    prediction.trend === 'declining' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {prediction.trend === 'improving' && (
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                    {prediction.trend === 'declining' && (
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                    {prediction.trend === 'improving' ? 'En hausse' :
                     prediction.trend === 'declining' ? 'En baisse' : 'Stable'}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Confiance</span>
                    <span className="font-medium text-gray-700">{prediction.confidence}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-400 to-purple-500 transition-all duration-500"
                      style={{ width: `${prediction.confidence}%` }}
                    />
                  </div>
                </div>

                {prediction.insights.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    {prediction.insights.map((insight, idx) => (
                      <p key={idx} className="text-xs text-gray-600">{insight}</p>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {showPrediction && Object.keys(currentAnswers).length === 0 && (
              <div className="mt-3 text-center text-sm text-gray-500 py-4">
                Répondez aux questions pour voir la prédiction
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

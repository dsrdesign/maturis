"use client";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useOrganizations, usePermissions } from "../../lib/store";
import { computeGlobalScore, cobitLevelFromScore, getWeightsForSector } from "../../lib/score";
import dynamic from 'next/dynamic';
const RadarChart = dynamic(() => import('../../../components/RadarChart'), { ssr: false });
const AnimatedList = dynamic(() => import('../../../components/AnimatedList'), { ssr: false });

type AIRecommendation = {
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
};

type AIRecommendationsResponse = {
  recommendations: AIRecommendation[];
  summary: string;
  maturityAnalysis: string;
};

export default function OrganizationDashboard() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { getOrganizationById } = useOrganizations();
  const { canRunQCM, canEditOrganization, canViewResults, canExportData } = usePermissions();
  const org = getOrganizationById(id);

  // Rediriger les évaluateurs qui n'ont pas accès aux résultats
  useEffect(() => {
    if (!canViewResults) {
      router.push('/organizations');
    }
  }, [canViewResults, router]);
  
  const [aiRecommendations, setAiRecommendations] = useState<AIRecommendationsResponse | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  
  // États pour la comparaison d'audits
  const [selectedAudit1, setSelectedAudit1] = useState<string | null>(null);
  const [selectedAudit2, setSelectedAudit2] = useState<string | null>(null);
  const [showComparison, setShowComparison] = useState(false);

  // Vérifier si l'organisation a déjà été évaluée (au moins un score > 0)
  const hasBeenEvaluated = org?.domainScores && 
    Object.values(org.domainScores).some(score => score > 0);

  // Charger les recommandations IA seulement si l'organisation a été évaluée
  useEffect(() => {
    if (org && org.domainScores && hasBeenEvaluated) {
      fetchAIRecommendations();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [org?.id, hasBeenEvaluated]);

  const fetchAIRecommendations = async () => {
    if (!org) return;
    
    setIsLoadingAI(true);
    setAiError(null);
    
    try {
      const response = await fetch('/api/ai/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationContext: {
            name: org.name,
            sector: org.sector || 'general',
            size: org.employees ? (org.employees > 500 ? 'large' : org.employees > 50 ? 'medium' : 'small') : 'medium',
            description: org.description,
          },
          domainScores: org.domainScores || { EDM: 0, APO: 0, BAI: 0, DSS: 0, MEA: 0 },
          globalScore: org.score,
        }),
      });

      if (!response.ok) throw new Error('Erreur API');
      
      const data = await response.json();
      setAiRecommendations(data);
    } catch {
      setAiError('Impossible de générer les recommandations IA');
    } finally {
      setIsLoadingAI(false);
    }
  };

  if (!org) return <div className="p-6">Organisation non trouvée</div>;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'critical': return '🔴 Critique';
      case 'high': return '🟠 Haute';
      case 'medium': return '🟡 Moyenne';
      case 'low': return '🟢 Basse';
      default: return priority;
    }
  };

  const getEffortBadge = (effort: string) => {
    switch (effort) {
      case 'low': return '⚡ Facile';
      case 'medium': return '⏱️ Modéré';
      case 'high': return '🏗️ Important';
      default: return effort;
    }
  };

  // Fonctions pour la comparaison d'audits
  const getAuditById = (auditId: string) => {
    return org?.audits?.find(a => a.date === auditId);
  };

  const getEvolutionColor = (diff: number) => {
    if (diff > 0) return 'text-green-600';
    if (diff < 0) return 'text-red-600';
    return 'text-gray-500';
  };

  const getEvolutionIcon = (diff: number) => {
    if (diff > 0) return '📈';
    if (diff < 0) return '📉';
    return '➡️';
  };

  const getEvolutionBadge = (diff: number) => {
    if (diff > 0) return 'bg-green-100 text-green-700 border-green-200';
    if (diff < 0) return 'bg-red-100 text-red-700 border-red-200';
    return 'bg-gray-100 text-gray-600 border-gray-200';
  };

  const calculateComparison = () => {
    if (!selectedAudit1 || !selectedAudit2 || !org?.audits) return null;
    
    const audit1 = getAuditById(selectedAudit1);
    const audit2 = getAuditById(selectedAudit2);
    
    if (!audit1 || !audit2) return null;

    // Déterminer l'ordre chronologique (audit1 = plus ancien, audit2 = plus récent)
    const date1 = new Date(audit1.date);
    const date2 = new Date(audit2.date);
    const [olderAudit, newerAudit] = date1 < date2 ? [audit1, audit2] : [audit2, audit1];

    const scoreDiff = newerAudit.score - olderAudit.score;
    
    // Calculer les différences par domaine si disponibles
    type DomainKey = 'EDM' | 'APO' | 'BAI' | 'DSS' | 'MEA';
    const domainDiffs: Record<string, number> = {};
    if (olderAudit.domainScores && newerAudit.domainScores) {
      (Object.keys(olderAudit.domainScores) as DomainKey[]).forEach(domain => {
        domainDiffs[domain] = (newerAudit.domainScores?.[domain] || 0) - (olderAudit.domainScores?.[domain] || 0);
      });
    }

    return {
      older: olderAudit,
      newer: newerAudit,
      scoreDiff,
      domainDiffs,
      daysBetween: Math.round((new Date(newerAudit.date).getTime() - new Date(olderAudit.date).getTime()) / (1000 * 60 * 60 * 24))
    };
  };

  const comparison = showComparison ? calculateComparison() : null;

  // Fonction d'export CSV pour un audit spécifique
  const exportAuditToCSV = (audit: typeof org.audits[0]) => {
    if (!org) return;
    
    const headers = ['Organisation', 'Date', 'Titre', 'Score Global (%)', 'EDM', 'APO', 'BAI', 'DSS', 'MEA'];
    const values = [
      org.name,
      audit.date,
      audit.title,
      audit.score.toString(),
      audit.domainScores?.EDM?.toString() || '0',
      audit.domainScores?.APO?.toString() || '0',
      audit.domainScores?.BAI?.toString() || '0',
      audit.domainScores?.DSS?.toString() || '0',
      audit.domainScores?.MEA?.toString() || '0',
    ];
    
    const csvContent = [headers.join(';'), values.join(';')].join('\n');
    downloadCSV(csvContent, `evaluation_${org.name}_${audit.date}.csv`);
  };

  // Fonction d'export CSV pour toutes les évaluations
  const exportAllAuditsToCSV = () => {
    if (!org || !org.audits || org.audits.length === 0) return;
    
    const headers = ['Organisation', 'Date', 'Titre', 'Score Global (%)', 'EDM', 'APO', 'BAI', 'DSS', 'MEA'];
    const rows = org.audits.map(audit => [
      org.name,
      audit.date,
      audit.title,
      audit.score.toString(),
      audit.domainScores?.EDM?.toString() || '0',
      audit.domainScores?.APO?.toString() || '0',
      audit.domainScores?.BAI?.toString() || '0',
      audit.domainScores?.DSS?.toString() || '0',
      audit.domainScores?.MEA?.toString() || '0',
    ].join(';'));
    
    const csvContent = [headers.join(';'), ...rows].join('\n');
    downloadCSV(csvContent, `evaluations_${org.name}_toutes.csv`);
  };

  // Utilitaire pour télécharger le CSV
  const downloadCSV = (content: string, filename: string) => {
    const BOM = '\uFEFF'; // Pour supporter les caractères spéciaux dans Excel
    const blob = new Blob([BOM + content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const iconFor = (key: string) => {
    switch (key) {
      case 'EDM':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 12h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 3v18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        );
      case 'APO':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2l3 7h7l-5.5 4 2 7L12 17l-6.5 3 2-7L2 9h7l3-7z" stroke="currentColor" strokeWidth="0.6"/></svg>
        );
      case 'BAI':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.2"/></svg>
        );
      case 'DSS':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
        );
      case 'MEA':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="8" r="3" stroke="currentColor" strokeWidth="1.4"/><path d="M5 20c2-4 6-6 7-6s5 2 7 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        );
      default:
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.2"/></svg>
        );
    }
  };

  return (
    <div className="min-h-screen py-12">
      <div className="app-container px-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">{org.name}</h1>
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/organizations')} className="px-3 py-2 rounded bg-gray-100 hover:bg-gray-200 transition-colors">
              Retour
            </button>
            {canRunQCM && (
              <button onClick={() => router.push(`/organizations/${org.id}/qcm`)} className="px-4 py-2 rounded-lg btn-gradient text-white">
                Démarrer une nouvelle analyse
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          {/* Informations de l'organisation */}
          <div className="bg-white card-soft p-6 w-full">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-2xl font-semibold mb-1">{org.name}</h3>
                <p className="text-sm text-gray-600">{org.description}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">Score global</p>
                <p className="text-3xl font-bold text-[#3B6BFF]">{org.score}%</p>
              </div>
            </div>

            {/* Nouvelles informations détaillées */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
                <p className="text-xs text-blue-600 font-medium mb-1">📍 Localisation</p>
                <p className="text-sm font-semibold text-gray-800">{org.city || 'N/A'}</p>
                <p className="text-xs text-gray-600">{org.country || 'N/A'}</p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
                <p className="text-xs text-green-600 font-medium mb-1">👥 Employés</p>
                <p className="text-sm font-semibold text-gray-800">{org.employees || 'N/A'}</p>
                <p className="text-xs text-gray-600">personnes</p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
                <p className="text-xs text-purple-600 font-medium mb-1">💼 Chiffre d&apos;affaires</p>
                <p className="text-sm font-semibold text-gray-800">
                  {org.revenue ? `${new Intl.NumberFormat('fr-FR').format(org.revenue)} FCFA` : 'N/A'}
                </p>
                <p className="text-xs text-gray-600">annuel</p>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg">
                <p className="text-xs text-orange-600 font-medium mb-1">⚖️ Forme juridique</p>
                <p className="text-sm font-semibold text-gray-800">{org.legalForm || 'N/A'}</p>
                <p className="text-xs text-gray-600">
                  {org.creationDate ? `Créée en ${new Date(org.creationDate).getFullYear()}` : ''}
                </p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t">
              <p className="text-sm text-gray-500">
                <span className="font-medium">Dernier audit:</span> {org.lastAudit}
              </p>
            </div>
          </div>

          {/* Scores par domaine */}
          <div className="bg-white card-soft p-6 w-full">
            <h3 className="text-lg font-semibold mb-4">Scores par domaine COBIT</h3>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(org.domainScores || {}).map(([k, v]) => {
                  const weight = org.domainWeights?.[k as keyof typeof org.domainWeights] 
                    || getWeightsForSector(org.sector)[k as keyof ReturnType<typeof getWeightsForSector>];
                  return (
                    <div key={k} className="flex items-center gap-4 p-4 sm:p-5 rounded-xl border border-gray-100 bg-white/80 shadow-md min-h-[72px]">
                      <div className="w-12 h-12 flex items-center justify-center bg-[rgba(59,107,255,0.12)] text-[rgba(59,107,255,1)] rounded-lg text-lg">
                        {iconFor(k)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-base font-semibold text-gray-800 truncate">{k}</div>
                        <div className="text-xs text-gray-400">Poids: {Math.round(weight * 100)}%</div>
                      </div>
                      <div className="text-lg font-bold text-[var(--accent)]">{v}/5</div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6">
                <div className="text-sm text-gray-400">Score global pondéré</div>
                <div className="text-3xl font-bold text-[var(--accent)] mt-1">
                  {computeGlobalScore(org.domainScores || {EDM:0,APO:0,BAI:0,DSS:0,MEA:0}, org.sector, org.domainWeights)} / 5
                </div>
                <div className="text-sm text-gray-600">Niveau COBIT: {cobitLevelFromScore(computeGlobalScore(org.domainScores || {EDM:0,APO:0,BAI:0,DSS:0,MEA:0}, org.sector, org.domainWeights))}</div>
              </div>

              {/* Affichage des poids */}
              <div className="mt-6 pt-6 border-t">
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <span>⚖️</span> Pondération des domaines
                </h4>
                <div className="grid grid-cols-5 gap-2">
                  {(['EDM', 'APO', 'BAI', 'DSS', 'MEA'] as const).map((domain) => {
                    const weight = org.domainWeights?.[domain] || getWeightsForSector(org.sector)[domain];
                    return (
                      <div key={domain} className="text-center p-2 bg-gray-50 rounded-lg">
                        <div className="text-xs font-semibold text-gray-600">{domain}</div>
                        <div className="text-sm font-bold text-[var(--accent)]">{Math.round(weight * 100)}%</div>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  {org.domainWeights ? '✓ Poids personnalisés' : `Poids par défaut (secteur: ${org.sector})`}
                </p>
              </div>
          </div>

          {/* Historique et Radar - Section divisée en 2 colonnes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
            <div className="bg-white card-soft p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Historique des audits</h3>
                {canExportData && org.audits && org.audits.length > 0 && (
                  <button
                    onClick={exportAllAuditsToCSV}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Exporter CSV
                  </button>
                )}
              </div>
              
              {/* Liste des audits avec bouton d'export individuel */}
              {org.audits && org.audits.length > 0 ? (
                <div className="space-y-2">
                  {org.audits.map((audit) => (
                    <div key={audit.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-800">{audit.date} — {audit.title}</div>
                        <div className="text-xs text-gray-500">Score: {audit.score}%</div>
                      </div>
                      {canExportData && (
                        <button
                          onClick={() => exportAuditToCSV(audit)}
                          className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                          title="Exporter cette évaluation"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Aucune évaluation pour le moment.</p>
              )}
              
              {/* Section de sélection pour comparaison */}
              {org.audits && org.audits.length >= 2 && (
                <div className="mt-6 pt-4 border-t">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <span>📊</span> Comparer deux analyses
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Analyse 1</label>
                      <select 
                        value={selectedAudit1 || ''} 
                        onChange={(e) => setSelectedAudit1(e.target.value || null)}
                        className="w-full p-2 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Sélectionner...</option>
                        {org.audits.map(a => (
                          <option key={a.date} value={a.date} disabled={a.date === selectedAudit2}>
                            {a.date} ({a.score}%)
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Analyse 2</label>
                      <select 
                        value={selectedAudit2 || ''} 
                        onChange={(e) => setSelectedAudit2(e.target.value || null)}
                        className="w-full p-2 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Sélectionner...</option>
                        {org.audits.map(a => (
                          <option key={a.date} value={a.date} disabled={a.date === selectedAudit1}>
                            {a.date} ({a.score}%)
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowComparison(true)}
                    disabled={!selectedAudit1 || !selectedAudit2}
                    className="mt-3 w-full py-2 px-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:from-indigo-600 hover:to-purple-600 transition-all"
                  >
                    🔍 Voir la comparaison
                  </button>
                </div>
              )}
            </div>

            <div className="bg-white card-soft p-6">
              <h3 className="text-lg font-semibold mb-4">Radar des domaines</h3>
              <div className="max-w-md mx-auto">
                <RadarChart labels={Object.keys(org.domainScores || {})} data={Object.values(org.domainScores || {})} />
              </div>
            </div>
          </div>

          {/* Modal/Section de comparaison */}
          {showComparison && comparison && (
            <div className="bg-white card-soft p-6 border-2 border-indigo-200 animate-fadeIn">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <span>📊</span> Comparaison des analyses
                </h3>
                <button 
                  onClick={() => setShowComparison(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Résumé de l'évolution */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-4 rounded-xl text-center">
                  <p className="text-xs text-blue-600 mb-1">Période analysée</p>
                  <p className="text-lg font-bold text-blue-800">{comparison.daysBetween} jours</p>
                  <p className="text-xs text-gray-600 mt-1">
                    {comparison.older.date} → {comparison.newer.date}
                  </p>
                </div>
                
                <div className={`p-4 rounded-xl text-center ${comparison.scoreDiff >= 0 ? 'bg-gradient-to-br from-green-50 to-emerald-100' : 'bg-gradient-to-br from-red-50 to-rose-100'}`}>
                  <p className={`text-xs mb-1 ${comparison.scoreDiff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    Évolution du score
                  </p>
                  <p className={`text-3xl font-bold ${getEvolutionColor(comparison.scoreDiff)}`}>
                    {comparison.scoreDiff > 0 ? '+' : ''}{comparison.scoreDiff}%
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {comparison.older.score}% → {comparison.newer.score}%
                  </p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-violet-100 p-4 rounded-xl text-center">
                  <p className="text-xs text-purple-600 mb-1">Tendance</p>
                  <p className="text-3xl">
                    {comparison.scoreDiff > 5 ? '🚀' : comparison.scoreDiff > 0 ? '📈' : comparison.scoreDiff < -5 ? '⚠️' : comparison.scoreDiff < 0 ? '📉' : '➡️'}
                  </p>
                  <p className="text-sm font-medium text-purple-800 mt-1">
                    {comparison.scoreDiff > 5 ? 'Excellente progression' : 
                     comparison.scoreDiff > 0 ? 'Progression' : 
                     comparison.scoreDiff < -5 ? 'Régression importante' : 
                     comparison.scoreDiff < 0 ? 'Légère régression' : 'Stable'}
                  </p>
                </div>
              </div>

              {/* Comparaison détaillée des audits */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Audit ancien */}
                <div className="border rounded-xl p-4 bg-gray-50">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">📅</span>
                    <div>
                      <h4 className="font-semibold text-gray-800">{comparison.older.title}</h4>
                      <p className="text-xs text-gray-500">{comparison.older.date}</p>
                    </div>
                  </div>
                  <div className="text-center py-4 bg-white rounded-lg">
                    <p className="text-4xl font-bold text-gray-600">{comparison.older.score}%</p>
                    <p className="text-sm text-gray-500">Score global</p>
                  </div>
                </div>

                {/* Audit récent */}
                <div className="border-2 border-indigo-200 rounded-xl p-4 bg-indigo-50">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">🆕</span>
                    <div>
                      <h4 className="font-semibold text-indigo-800">{comparison.newer.title}</h4>
                      <p className="text-xs text-indigo-500">{comparison.newer.date}</p>
                    </div>
                  </div>
                  <div className="text-center py-4 bg-white rounded-lg">
                    <p className="text-4xl font-bold text-indigo-600">{comparison.newer.score}%</p>
                    <p className="text-sm text-indigo-500">Score global</p>
                  </div>
                </div>
              </div>

              {/* Évolution par domaine */}
              {Object.keys(comparison.domainDiffs).length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <span>🎯</span> Évolution par domaine COBIT
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                    {Object.entries(comparison.domainDiffs).map(([domain, diff]) => (
                      <div key={domain} className="border rounded-xl p-4 bg-white hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                          <div className="w-8 h-8 flex items-center justify-center bg-[rgba(59,107,255,0.12)] text-[rgba(59,107,255,1)] rounded-lg">
                            {iconFor(domain)}
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getEvolutionBadge(diff)}`}>
                            {diff > 0 ? '+' : ''}{diff.toFixed(1)}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-gray-800">{domain}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-lg">{getEvolutionIcon(diff)}</span>
                          <span className={`text-xs ${getEvolutionColor(diff)}`}>
                            {comparison.older.domainScores?.[domain as keyof typeof comparison.older.domainScores] || 0} → {comparison.newer.domainScores?.[domain as keyof typeof comparison.newer.domainScores] || 0}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Analyse de l'évolution */}
              <div className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border border-amber-200">
                <h4 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
                  <span>💡</span> Analyse de l&apos;évolution
                </h4>
                <div className="text-sm text-gray-700 space-y-2">
                  {comparison.scoreDiff > 0 ? (
                    <>
                      <p>✅ <strong>Progression constatée</strong> : L&apos;organisation a amélioré son score de maturité de {comparison.scoreDiff}% sur une période de {comparison.daysBetween} jours.</p>
                      {Object.entries(comparison.domainDiffs).filter(([, d]) => d > 0).length > 0 && (
                        <p>📈 <strong>Domaines en amélioration</strong> : {Object.entries(comparison.domainDiffs).filter(([, d]) => d > 0).map(([dom]) => dom).join(', ')}</p>
                      )}
                    </>
                  ) : comparison.scoreDiff < 0 ? (
                    <>
                      <p>⚠️ <strong>Régression détectée</strong> : Le score a diminué de {Math.abs(comparison.scoreDiff)}% sur {comparison.daysBetween} jours. Une attention particulière est recommandée.</p>
                      {Object.entries(comparison.domainDiffs).filter(([, d]) => d < 0).length > 0 && (
                        <p>📉 <strong>Domaines en régression</strong> : {Object.entries(comparison.domainDiffs).filter(([, d]) => d < 0).map(([dom]) => dom).join(', ')}</p>
                      )}
                    </>
                  ) : (
                    <p>➡️ <strong>Stabilité</strong> : Le score global est resté stable sur la période analysée.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Recommandations IA améliorées - Seulement si l'organisation a été évaluée */}
        {hasBeenEvaluated ? (
        <div className="mt-6 space-y-6">
          {/* Résumé et Analyse IA */}
          {aiRecommendations && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Résumé */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 card-soft p-6 border border-blue-200">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">🧠</span>
                  <h3 className="text-lg font-semibold text-blue-800">Analyse IA</h3>
                </div>
                <p className="text-gray-700 leading-relaxed">{aiRecommendations.summary}</p>
              </div>

              {/* Analyse de maturité */}
              <div className="bg-gradient-to-br from-purple-50 to-violet-100 card-soft p-6 border border-purple-200">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">📊</span>
                  <h3 className="text-lg font-semibold text-purple-800">Niveau de maturité</h3>
                </div>
                <p className="text-gray-700 leading-relaxed">{aiRecommendations.maturityAnalysis}</p>
              </div>
            </div>
          )}

          {/* Bouton de régénération */}
          <div className="flex justify-end">
            <button
              onClick={fetchAIRecommendations}
              disabled={isLoadingAI}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 transition-all disabled:opacity-50"
            >
              {isLoadingAI ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Génération en cours...
                </>
              ) : (
                <>
                  <span>🔄</span>
                  Régénérer les recommandations IA
                </>
              )}
            </button>
          </div>

          {aiError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
              ⚠️ {aiError}
            </div>
          )}

          {/* Quick Wins */}
          {aiRecommendations && aiRecommendations.recommendations.some(r => r.quickWins.length > 0) && (
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 card-soft p-6 border border-emerald-200">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">⚡</span>
                <h3 className="text-lg font-semibold text-emerald-800">Quick Wins - Actions rapides à fort impact</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {aiRecommendations.recommendations.flatMap(r => 
                  r.quickWins.map((qw, i) => (
                    <div key={`${r.domain}-qw-${i}`} className="flex items-start gap-2 bg-white p-3 rounded-lg shadow-sm">
                      <span className="text-emerald-500">✓</span>
                      <span className="text-sm text-gray-700">{qw}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Recommandations par domaine */}
          <div className="bg-white card-soft p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <span>🎯</span>
                Recommandations par domaine
              </h3>
              {isLoadingAI && (
                <div className="flex items-center gap-2 text-blue-600">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Analyse IA en cours...
                </div>
              )}
            </div>

            {aiRecommendations ? (
              <div className="space-y-6">
                {aiRecommendations.recommendations.map((rec) => (
                  <div key={rec.domain} className="border rounded-xl overflow-hidden">
                    {/* Header du domaine */}
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 border-b flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 flex items-center justify-center bg-[rgba(59,107,255,0.12)] text-[rgba(59,107,255,1)] rounded-lg">
                          {iconFor(rec.domain)}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800">{rec.domain} - {rec.domainName}</h4>
                          <p className="text-sm text-gray-500">Score actuel: {rec.score}/5</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(rec.priority)}`}>
                        {getPriorityLabel(rec.priority)}
                      </span>
                    </div>

                    {/* Actions recommandées */}
                    <div className="p-4">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {rec.actions.map((action, actionIndex) => (
                          <div key={actionIndex} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                            <div className="flex items-start justify-between mb-2">
                              <h5 className="font-medium text-gray-800">{action.title}</h5>
                              <span className="text-xs bg-white px-2 py-1 rounded border text-gray-600">
                                {getEffortBadge(action.effort)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">{action.description}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <span>📈</span> {action.impact}
                              </span>
                              <span className="flex items-center gap-1">
                                <span>⏰</span> {action.timeline}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                {isLoadingAI ? (
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                      <svg className="animate-spin h-8 w-8 text-blue-600" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                    </div>
                    <p className="text-gray-600">L&apos;IA analyse vos résultats pour générer des recommandations personnalisées...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-4">
                    <span className="text-4xl">🤖</span>
                    <p className="text-gray-600">Cliquez sur le bouton ci-dessus pour générer des recommandations IA</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Statistiques de progression */}
          {aiRecommendations && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white card-soft p-4 text-center">
                <div className="text-3xl font-bold text-red-500">
                  {aiRecommendations.recommendations.filter(r => r.priority === 'critical').length}
                </div>
                <div className="text-sm text-gray-600">Domaines critiques</div>
              </div>
              <div className="bg-white card-soft p-4 text-center">
                <div className="text-3xl font-bold text-orange-500">
                  {aiRecommendations.recommendations.filter(r => r.priority === 'high').length}
                </div>
                <div className="text-sm text-gray-600">Haute priorité</div>
              </div>
              <div className="bg-white card-soft p-4 text-center">
                <div className="text-3xl font-bold text-blue-500">
                  {aiRecommendations.recommendations.reduce((acc, r) => acc + r.actions.length, 0)}
                </div>
                <div className="text-sm text-gray-600">Actions suggérées</div>
              </div>
              <div className="bg-white card-soft p-4 text-center">
                <div className="text-3xl font-bold text-emerald-500">
                  {aiRecommendations.recommendations.reduce((acc, r) => acc + r.quickWins.length, 0)}
                </div>
                <div className="text-sm text-gray-600">Quick wins</div>
              </div>
            </div>
          )}
        </div>
        ) : (
          <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
            <div className="text-4xl mb-3">📋</div>
            <h3 className="text-lg font-semibold text-amber-800 mb-2">Aucune évaluation effectuée</h3>
            <p className="text-amber-700 mb-4">
              Cette organisation n&apos;a pas encore été évaluée. Lancez une analyse pour obtenir des recommandations personnalisées.
            </p>
            {canRunQCM && (
              <button 
                onClick={() => router.push(`/organizations/${org.id}/qcm`)}
                className="px-6 py-3 rounded-lg btn-gradient text-white font-medium"
              >
                🚀 Démarrer une évaluation
              </button>
            )}
          </div>
        )}

        <footer className="py-10 text-center text-gray-500 text-sm">© {new Date().getFullYear()} Maturis – {org.name}</footer>
      </div>
    </div>
  );
}

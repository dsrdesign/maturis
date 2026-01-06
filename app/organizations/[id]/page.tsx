"use client";
import { useRouter, useParams } from "next/navigation";
import { useOrganizations } from "../../lib/store";
import { computeGlobalScore, cobitLevelFromScore, recommendationsForDomain } from "../../lib/score";
import dynamic from 'next/dynamic';
const RadarChart = dynamic(() => import('../../../components/RadarChart'), { ssr: false });
const AnimatedList = dynamic(() => import('../../../components/AnimatedList'), { ssr: false });

export default function OrganizationDashboard() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { getOrganizationById } = useOrganizations();
  const org = getOrganizationById(id);

  if (!org) return <div className="p-6">Organisation non trouvée</div>;

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
            <button onClick={() => router.push(`/organizations/${org.id}/qcm`)} className="px-4 py-2 rounded-lg btn-gradient text-white">
              Démarrer une nouvelle analyse
            </button>
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
                  {org.revenue ? `${(org.revenue / 1000000).toFixed(1)}M €` : 'N/A'}
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
                {Object.entries(org.domainScores || {}).map(([k, v]) => (
                  <div key={k} className="flex items-center gap-4 p-4 sm:p-5 rounded-xl border border-gray-100 bg-white/80 shadow-md min-h-[72px]">
                    <div className="w-12 h-12 flex items-center justify-center bg-[rgba(59,107,255,0.12)] text-[rgba(59,107,255,1)] rounded-lg text-lg">
                      {iconFor(k)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-base font-semibold text-gray-800 truncate">{k}</div>
                      <div className="text-sm text-gray-500">Score mock</div>
                    </div>
                    <div className="text-lg font-bold text-[var(--accent)]">{v}/5</div>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <div className="text-sm text-gray-400">Score global pondéré</div>
                <div className="text-3xl font-bold text-[var(--accent)] mt-1">
                  {computeGlobalScore(org.domainScores || {EDM:0,APO:0,BAI:0,DSS:0,MEA:0}, org.sector)} / 5
                </div>
                <div className="text-sm text-gray-600">Niveau COBIT: {cobitLevelFromScore(computeGlobalScore(org.domainScores || {EDM:0,APO:0,BAI:0,DSS:0,MEA:0}, org.sector))}</div>
              </div>
          </div>

          {/* Historique et Radar - Section divisée en 2 colonnes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
            <div className="bg-white card-soft p-6">
              <h3 className="text-lg font-semibold mb-4">Historique des audits</h3>
              <AnimatedList items={(org.audits || []).map(a => `${a.date} — ${a.title} (${a.score}%)`)} />
            </div>

            <div className="bg-white card-soft p-6">
              <h3 className="text-lg font-semibold mb-4">Radar des domaines</h3>
              <div className="max-w-md mx-auto">
                <RadarChart labels={Object.keys(org.domainScores || {})} data={Object.values(org.domainScores || {})} />
              </div>
            </div>
          </div>
        </div>

        {/* Recommandations automatiques (basées sur le domaine le plus faible) */}
        <div className="mt-6">
          <div className="bg-white card-soft p-6">
            <h3 className="text-lg font-semibold mb-3">Recommandations prioritaires</h3>
            {(() => {
              const domains = org.domainScores || {};
              const sorted = Object.entries(domains).sort((a,b) => (a[1] as number) - (b[1] as number));
              const weakest = sorted[0];
              if (!weakest) return <div>Aucune donnée disponible</div>;
              const [domainName, value] = weakest as [string, number];
              const recs = recommendationsForDomain(domainName as 'EDM'|'APO'|'BAI'|'DSS'|'MEA', value).slice(0,3);
              return (
                <div>
                  <div className="text-sm text-gray-500 mb-3">Domaine prioritaire : <strong>{domainName}</strong> ({value})</div>
                  <ul className="list-disc pl-5 text-gray-700">
                    {recs.map((r, i) => <li key={i}>{r}</li>)}
                  </ul>
                  <div className="mt-3 text-xs text-gray-400">Recommandations générées automatiquement — option IA : générer des recommandations sectorielles détaillées</div>
                </div>
              );
            })()}
          </div>
        </div>

        <footer className="py-10 text-center text-gray-500 text-sm">© {new Date().getFullYear()} Maturis – {org.name}</footer>
      </div>
    </div>
  );
}

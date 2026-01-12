"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { computeGlobalScore, getWeightsForSector } from "../lib/score";
import { useAuth } from "../lib/AuthContext";
import { useOrganizations, usePermissions } from "../lib/store";
import UserMenu from "@/components/UserMenu";

type DomainKey = 'EDM' | 'APO' | 'BAI' | 'DSS' | 'MEA';

const domainLabels: Record<DomainKey, string> = {
  EDM: 'Évaluation, Direction et Surveillance',
  APO: 'Alignement, Planification et Organisation',
  BAI: 'Bâtir, Acquérir et Implémenter',
  DSS: 'Délivrer, Servir et Supporter',
  MEA: 'Surveiller, Évaluer et Apprécier'
};

export default function OrganizationsPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const { filteredOrganizations, addOrganization, deleteOrganization } = useOrganizations();
  const { canCreateOrganization, canRunQCM, canDeleteOrganization } = usePermissions();
  const [showModal, setShowModal] = useState(false);
  const [useCustomWeights, setUseCustomWeights] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    country: 'Cameroun',
    city: '',
    employees: '',
    revenue: '',
    creationDate: '',
    legalForm: 'SAS',
    sector: 'bank'
  });
  const [weights, setWeights] = useState<Record<DomainKey, number>>({
    EDM: 0.15,
    APO: 0.20,
    BAI: 0.20,
    DSS: 0.25,
    MEA: 0.20
  });

  // Mettre à jour les poids quand le secteur change
  useEffect(() => {
    if (!useCustomWeights) {
      const sectorWeights = getWeightsForSector(form.sector);
      setWeights(sectorWeights as Record<DomainKey, number>);
    }
  }, [form.sector, useCustomWeights]);

  // Calculer le total des poids
  const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);
  const isWeightValid = Math.abs(totalWeight - 1) < 0.01; // Tolérance de 1%

  // Rediriger vers login si non connecté
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login");
    }
  }, [user, isLoading, router]);

  function handleAddOrganization(e: React.FormEvent) {
    e.preventDefault();
    
    // Vérifier que les poids sont valides si personnalisés
    if (useCustomWeights && !isWeightValid) {
      alert('Le total des poids doit être égal à 100%');
      return;
    }
    
    const id = `org-${Date.now()}`;
    const domainScores = { EDM: 0, APO: 0, BAI: 0, DSS: 0, MEA: 0 };
    const domainWeights = useCustomWeights ? weights : getWeightsForSector(form.sector) as Record<DomainKey, number>;
    const sg = computeGlobalScore(domainScores, form.sector, domainWeights);
    const newOrg = {
      id,
      name: form.name,
      description: form.description,
      country: form.country,
      city: form.city,
      employees: parseInt(form.employees) || 0,
      revenue: parseFloat(form.revenue) || 0,
      creationDate: form.creationDate,
      legalForm: form.legalForm,
      sector: form.sector,
      score: Math.round((sg/5)*100),
      lastAudit: '—',
      domainScores,
      domainWeights,
      audits: [],
    };
    addOrganization(newOrg);
    setShowModal(false);
    setForm({
      name: '',
      description: '',
      country: 'Cameroun',
      city: '',
      employees: '',
      revenue: '',
      creationDate: '',
      legalForm: 'SAS',
      sector: 'bank'
    });
    setUseCustomWeights(false);
    setWeights({ EDM: 0.15, APO: 0.20, BAI: 0.20, DSS: 0.25, MEA: 0.20 });
  }

  // Afficher un loader pendant la vérification de l'authentification
  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="app-container px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Mes organisations</h1>
            <p className="text-sm text-gray-500 mt-1">Bienvenue, {user.name}</p>
          </div>
          <div className="flex items-center gap-4">
            {/* <button onClick={() => router.push('/resources')} className="px-3 py-2 rounded bg-gray-50">Ressources</button> */}
            <UserMenu />
          </div>
        </div>

        <p className="text-gray-600 mb-6">Sélectionnez une organisation pour voir son dashboard ou démarrez une nouvelle analyse.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Ajout d'organisation visible uniquement si l'utilisateur a la permission */}
          {canCreateOrganization && (
            <div className="bg-white card-soft p-6 flex flex-col justify-center items-center text-center card-hover">
              <h3 className="text-lg font-semibold mb-2">Ajouter une organisation</h3>
              <p className="text-sm text-gray-500 mb-4">Créez une nouvelle organisation et lancez un diagnostic.</p>
              <button onClick={() => setShowModal(true)} className="w-full btn-gradient text-white py-3 rounded-xl">+ Ajouter</button>
            </div>
          )}

          {filteredOrganizations.map((org) => (
            <div key={org.id} className="bg-white card-soft p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{org.name}</h3>
                  <p className="text-xs text-gray-400 mt-1">
                    {org.city && org.country ? `📍 ${org.city}, ${org.country}` : ''}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">Score</p>
                  <p className="text-lg font-bold text-[#3B6BFF]">{org.score}%</p>
                </div>
              </div>

              <p className="text-sm text-gray-500 mb-3">{org.description}</p>

              {/* Nouvelles informations */}
              <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                {org.employees && (
                  <div className="bg-gray-50 p-2 rounded">
                    <p className="text-gray-500">Employés</p>
                    <p className="font-medium">{org.employees}</p>
                  </div>
                )}
                {org.legalForm && (
                  <div className="bg-gray-50 p-2 rounded">
                    <p className="text-gray-500">Forme juridique</p>
                    <p className="font-medium">{org.legalForm}</p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t">
                <div>
                  <p className="text-xs text-gray-400">Dernier audit</p>
                  <p className="text-sm font-medium">{org.lastAudit}</p>
                </div>
              </div>

                <div className="flex gap-3 mt-4">
                  <button onClick={() => router.push(`/organizations/${org.id}`)} className="flex-1 px-3 py-2 text-sm rounded-lg bg-gray-50 hover:bg-gray-100">Voir</button>
                  {/* Bouton Analyser visible si l'utilisateur a la permission */}
                  {canRunQCM && (
                    <button onClick={() => router.push(`/organizations/${org.id}/qcm`)} className="flex-1 px-3 py-2 text-sm rounded-lg btn-gradient text-white">Analyser</button>
                  )}
                  {/* Bouton Supprimer visible si l'utilisateur a la permission */}
                  {canDeleteOrganization && (
                    <button 
                      onClick={() => {
                        if (confirm(`Êtes-vous sûr de vouloir supprimer "${org.name}" ?`)) {
                          deleteOrganization(org.id);
                        }
                      }} 
                      className="px-3 py-2 text-sm rounded-lg bg-red-50 hover:bg-red-100 text-red-600"
                    >
                      Supprimer
                    </button>
                  )}
                </div>
            </div>
          ))}
        </div>

        <footer className="py-10 text-center text-gray-500 text-sm">© {new Date().getFullYear()} Maturis</footer>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-semibold mb-4">Nouvelle organisation</h3>
            <form onSubmit={handleAddOrganization} className="flex flex-col gap-4">
              
              {/* Section Informations générales */}
              <div className="border-b pb-4">
                <h4 className="font-medium text-gray-700 mb-3">Informations générales</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input 
                    required 
                    value={form.name} 
                    onChange={(e) => setForm(f => ({...f, name: e.target.value}))} 
                    placeholder="Nom de l'organisation *" 
                    className="border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  />
                  <select 
                    value={form.sector} 
                    onChange={(e) => setForm(f => ({...f, sector: e.target.value}))} 
                    className="border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="bank">Banque & services financiers</option>
                    <option value="health">Santé & hôpitaux</option>
                    <option value="industry">Industrie & fabrication</option>
                  </select>
                </div>
                <textarea 
                  required 
                  value={form.description} 
                  onChange={(e) => setForm(f => ({...f, description: e.target.value}))} 
                  placeholder="Description courte *" 
                  className="border rounded-lg p-3 w-full mt-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  rows={2}
                />
              </div>

              {/* Section Localisation */}
              <div className="border-b pb-4">
                <h4 className="font-medium text-gray-700 mb-3">Localisation</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <select 
                    value={form.country} 
                    onChange={(e) => setForm(f => ({...f, country: e.target.value}))} 
                    className="border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Cameroun">Cameroun</option>
                    <option value="Sénégal">Sénégal</option>
                    <option value="Côte d'Ivoire">Côte d'Ivoire</option>
                    <option value="Gabon">Gabon</option>
                    <option value="Congo">Congo</option>
                    <option value="Mali">Mali</option>
                    <option value="Burkina Faso">Burkina Faso</option>
                    <option value="Bénin">Bénin</option>
                    <option value="Togo">Togo</option>
                    <option value="Niger">Niger</option>
                    <option value="Guinée">Guinée</option>
                    <option value="Autre">Autre</option>
                  </select>
                  <input 
                    required 
                    value={form.city} 
                    onChange={(e) => setForm(f => ({...f, city: e.target.value}))} 
                    placeholder="Ville *" 
                    className="border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  />
                </div>
              </div>

              {/* Section Données économiques */}
              <div className="border-b pb-4">
                <h4 className="font-medium text-gray-700 mb-3">Données économiques</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Nombre d&apos;employés *</label>
                    <input 
                      required 
                      type="number" 
                      min="1"
                      value={form.employees} 
                      onChange={(e) => setForm(f => ({...f, employees: e.target.value}))} 
                      placeholder="Ex: 50" 
                      className="border rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Chiffre d&apos;affaires (€) *</label>
                    <input 
                      required 
                      type="number" 
                      min="0"
                      step="0.01"
                      value={form.revenue} 
                      onChange={(e) => setForm(f => ({...f, revenue: e.target.value}))} 
                      placeholder="Ex: 1000000" 
                      className="border rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                    />
                  </div>
                </div>
              </div>

              {/* Section Juridique */}
              <div className="pb-4">
                <h4 className="font-medium text-gray-700 mb-3">Informations juridiques</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Date de création *</label>
                    <input 
                      required 
                      type="date" 
                      value={form.creationDate} 
                      onChange={(e) => setForm(f => ({...f, creationDate: e.target.value}))} 
                      className="border rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Forme juridique *</label>
                    <select 
                      value={form.legalForm} 
                      onChange={(e) => setForm(f => ({...f, legalForm: e.target.value}))} 
                      className="border rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="SAS">SAS - Société par Actions Simplifiée</option>
                      <option value="SARL">SARL - Société à Responsabilité Limitée</option>
                      <option value="SA">SA - Société Anonyme</option>
                      <option value="SNC">SNC - Société en Nom Collectif</option>
                      <option value="EURL">EURL - Entreprise Unipersonnelle à Responsabilité Limitée</option>
                      <option value="SASU">SASU - Société par Actions Simplifiée Unipersonnelle</option>
                      <option value="Association">Association</option>
                      <option value="Collectivité territoriale">Collectivité territoriale</option>
                      <option value="Autre">Autre</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section Pondération des domaines */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-700">Pondération des domaines COBIT</h4>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useCustomWeights}
                      onChange={(e) => {
                        setUseCustomWeights(e.target.checked);
                        if (!e.target.checked) {
                          const sectorWeights = getWeightsForSector(form.sector);
                          setWeights(sectorWeights as Record<DomainKey, number>);
                        }
                      }}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-600">Personnaliser</span>
                  </label>
                </div>
                
                <p className="text-xs text-gray-500 mb-3">
                  {useCustomWeights 
                    ? 'Ajustez les poids selon l\'importance de chaque domaine pour votre organisation.' 
                    : `Poids par défaut pour le secteur "${form.sector === 'bank' ? 'Banque' : form.sector === 'health' ? 'Santé' : 'Industrie'}".`}
                </p>

                <div className="space-y-3">
                  {(Object.keys(weights) as DomainKey[]).map((domain) => (
                    <div key={domain} className="flex items-center gap-3">
                      <div className="w-12 text-sm font-semibold text-gray-700">{domain}</div>
                      <div className="flex-1">
                        <input
                          type="range"
                          min="0"
                          max="50"
                          step="1"
                          value={weights[domain] * 100}
                          onChange={(e) => {
                            if (useCustomWeights) {
                              setWeights(w => ({...w, [domain]: parseInt(e.target.value) / 100}));
                            }
                          }}
                          disabled={!useCustomWeights}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                        />
                        <p className="text-xs text-gray-400 mt-0.5">{domainLabels[domain]}</p>
                      </div>
                      <div className={`w-14 text-right text-sm font-medium ${useCustomWeights ? 'text-blue-600' : 'text-gray-500'}`}>
                        {Math.round(weights[domain] * 100)}%
                      </div>
                    </div>
                  ))}
                </div>

                {/* Indicateur de total */}
                <div className={`mt-3 p-2 rounded-lg text-sm flex items-center justify-between ${
                  isWeightValid ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}>
                  <span>Total des poids:</span>
                  <span className="font-semibold">{Math.round(totalWeight * 100)}%</span>
                </div>
                {!isWeightValid && useCustomWeights && (
                  <p className="text-xs text-red-500 mt-1">Le total doit être égal à 100%</p>
                )}
              </div>

              <div className="flex items-center gap-3 mt-3 pt-3 border-t">
                <button type="submit" className="flex-1 bg-[#3B6BFF] hover:bg-[#2D5AE5] text-white py-3 rounded-lg font-medium transition-colors">
                  Créer l&apos;organisation
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 py-3 rounded-lg font-medium transition-colors">
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

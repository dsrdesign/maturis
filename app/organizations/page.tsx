"use client";
import { useRouter } from "next/navigation";
import { organizations as orgMocks } from "../lib/mockData";
import { useState } from "react";
import { computeGlobalScore } from "../lib/score";

export default function OrganizationsPage() {
  const router = useRouter();
  const [organizations, setOrganizations] = useState(orgMocks);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', sector: 'bank' });

  function addOrganization(e: React.FormEvent) {
    e.preventDefault();
    const id = `org-${Date.now()}`;
    const domainScores = { EDM: 0, APO: 0, BAI: 0, DSS: 0, MEA: 0 };
    const sg = computeGlobalScore(domainScores, form.sector);
    const newOrg = {
      id,
      name: form.name,
      description: form.description,
      score: Math.round((sg/5)*100),
      lastAudit: '—',
      sector: form.sector,
      domainScores,
      audits: [],
    };
    setOrganizations((s) => [newOrg, ...s]);
    setShowModal(false);
    setForm({ name: '', description: '', sector: 'bank' });
  }

  return (
    <div className="min-h-screen py-12">
      <div className="app-container px-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Mes organisations</h1>
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/resources')} className="px-3 py-2 rounded bg-gray-50">Ressources</button>
            <button onClick={() => router.push("/")} className="px-4 py-2 rounded-lg bg-gray-100">Retour Dashboard</button>
          </div>
        </div>

        <p className="text-gray-600 mb-6">Sélectionnez une organisation pour voir son dashboard ou démarrez une nouvelle analyse.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Add organization card */}
          <div className="bg-white card-soft p-6 flex flex-col justify-center items-center text-center card-hover">
            <h3 className="text-lg font-semibold mb-2">Ajouter une organisation</h3>
            <p className="text-sm text-gray-500 mb-4">Créez une nouvelle organisation et lancez un diagnostic.</p>
            <button onClick={() => setShowModal(true)} className="w-full btn-gradient text-white py-3 rounded-xl">+ Ajouter</button>
          </div>

          {organizations.map((org) => (
            <div key={org.id} className="bg-white card-soft p-6">
              <h3 className="text-lg font-semibold">{org.name}</h3>
              <p className="text-sm text-gray-500 my-2">{org.description}</p>

              <div className="flex items-center justify-between mt-4">
                <div>
                  <p className="text-xs text-gray-400">Dernier audit</p>
                  <p className="text-sm font-medium">{org.lastAudit}</p>
                </div>

                <div className="text-right">
                  <p className="text-xs text-gray-400">Score</p>
                  <p className="text-lg font-bold text-[#3B6BFF]">{org.score}%</p>
                </div>
              </div>

                <div className="flex gap-3 mt-6">
                  <button onClick={() => router.push(`/organizations/${org.id}`)} className="px-4 py-2 rounded-lg bg-gray-50 hover:bg-gray-100">Voir le dashboard</button>

                  <button onClick={() => router.push(`/organizations/${org.id}/qcm`)} className="px-4 py-2 rounded-lg btn-gradient text-white">Démarrer une analyse</button>
                </div>
            </div>
          ))}
        </div>

        <footer className="py-10 text-center text-gray-500 text-sm">© {new Date().getFullYear()} Maturis</footer>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-3">Nouvelle organisation</h3>
            <form onSubmit={addOrganization} className="flex flex-col gap-3">
              <input required value={form.name} onChange={(e) => setForm(f => ({...f, name: e.target.value}))} placeholder="Nom de l'organisation" className="border rounded-lg p-3" />
              <input required value={form.description} onChange={(e) => setForm(f => ({...f, description: e.target.value}))} placeholder="Description courte" className="border rounded-lg p-3" />
              <select value={form.sector} onChange={(e) => setForm(f => ({...f, sector: e.target.value}))} className="border rounded-lg p-3">
                <option value="bank">Banque & services financiers</option>
                <option value="health">Santé & hôpitaux</option>
                <option value="industry">Industrie & fabrication</option>
              </select>

              <div className="flex items-center gap-3 mt-3">
                <button type="submit" className="flex-1 bg-[#3B6BFF] text-white py-2 rounded-lg">Créer</button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-100 py-2 rounded-lg">Annuler</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { useSystemUsers, useSystem, useOrganizations } from '../app/lib/store';
import { UserRole } from '../app/lib/types';

const roleDescriptions: Record<UserRole, string> = {
  admin: 'Accès complet : gestion des utilisateurs, organisations et évaluations',
  decideur: 'Gestion des organisations et des évaluations (résultats + export)',
  evaluation: 'Lancer des évaluations uniquement (sans accès aux résultats)',
};

export default function AddUserToSystem() {
  const { addUser, systemUsers } = useSystemUsers();
  const { currentSystem } = useSystem();
  const { organizations } = useOrganizations();

  // Filtrer les organisations pour n'afficher que celles du système
  const systemOrganizations = currentSystem 
    ? organizations.filter(org => currentSystem.organizationIds.includes(org.id))
    : organizations;
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('evaluation');
  const [selectedOrgs, setSelectedOrgs] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!name || !email || !password) {
      setError('Tous les champs sont obligatoires');
      return;
    }
    
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    
    if (systemUsers.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      setError('Un utilisateur avec cet email existe déjà dans ce système');
      return;
    }
    
    const id = `user-${Date.now()}`;
    addUser({
      id,
      name,
      email,
      password,
      role,
      systemId: currentSystem?.id || '',
      organizationIds: selectedOrgs,
    });
    
    setSuccess(`Utilisateur "${name}" ajouté avec succès !`);
    setName('');
    setEmail('');
    setPassword('');
    setRole('evaluation');
    setSelectedOrgs([]);
    
    // Fermer le formulaire après 2 secondes
    setTimeout(() => {
      setSuccess('');
      setShowForm(false);
    }, 2000);
  }

  function toggleOrganization(orgId: string) {
    setSelectedOrgs(prev => 
      prev.includes(orgId) 
        ? prev.filter(id => id !== orgId)
        : [...prev, orgId]
    );
  }

  if (!showForm) {
    return (
      <div className="mb-6">
        <button
          onClick={() => setShowForm(true)}
          className="w-full py-3 border-2 border-dashed border-blue-300 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Ajouter un nouvel utilisateur
        </button>
      </div>
    );
  }

  return (
    <div className="mb-6 p-6 bg-gray-50 rounded-xl border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">Nouvel utilisateur</h3>
        <button
          onClick={() => setShowForm(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-600 rounded-lg text-sm">
          {success}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet *</label>
            <input
              type="text"
              placeholder="Jean Dupont"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input
              type="email"
              placeholder="jean@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe *</label>
            <input
              type="password"
              placeholder="Min. 6 caractères"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              minLength={6}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rôle *</label>
            <select
              value={role}
              onChange={e => setRole(e.target.value as UserRole)}
              className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="evaluation">Évaluateur</option>
              <option value="decideur">Décideur</option>
              <option value="admin">Admin</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">{roleDescriptions[role]}</p>
          </div>
        </div>
        
        {/* Sélection des organisations */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Organisations accessibles ({selectedOrgs.length} sélectionnée{selectedOrgs.length > 1 ? 's' : ''}) - Système: {currentSystem?.name || 'N/A'}
          </label>
          <div className="flex flex-wrap gap-2 p-3 border rounded-lg bg-white max-h-32 overflow-y-auto">
            {systemOrganizations.length === 0 ? (
              <span className="text-sm text-gray-400">Aucune organisation dans ce système</span>
            ) : (
              systemOrganizations.map(org => (
                <button
                  key={org.id}
                  type="button"
                  onClick={() => toggleOrganization(org.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    selectedOrgs.includes(org.id)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {org.name}
                </button>
              ))
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Cliquez sur les organisations pour les sélectionner/désélectionner
          </p>
        </div>
        
        <div className="flex gap-3 pt-2">
          <button 
            type="submit" 
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors"
          >
            Créer l&apos;utilisateur
          </button>
          <button 
            type="button"
            onClick={() => setShowForm(false)}
            className="px-4 py-2.5 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium transition-colors"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}

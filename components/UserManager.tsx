import React, { useState } from 'react';
import { useSystemUsers, useOrganizations, useAuth, useSystem } from '../app/lib/store';
import { UserRole } from '../app/lib/types';

const roleLabels: Record<UserRole, { label: string; color: string }> = {
  admin: { label: 'Admin', color: 'bg-purple-100 text-purple-700' },
  decideur: { label: 'Décideur', color: 'bg-blue-100 text-blue-700' },
  evaluation: { label: 'Évaluateur', color: 'bg-green-100 text-green-700' },
};

export default function UserManager() {
  const { systemUsers, updateUserRole, removeUser, assignOrganizationToUser, removeOrganizationFromUser } = useSystemUsers();
  const { organizations } = useOrganizations();
  const { currentSystem } = useSystem();
  const { user: currentUser } = useAuth();
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  // Filtrer les organisations pour n'afficher que celles du système
  const systemOrganizations = currentSystem 
    ? organizations.filter(org => currentSystem.organizationIds.includes(org.id))
    : organizations;

  return (
    <div className="mb-6">
      <h3 className="text-lg font-bold mb-4">Utilisateurs du système ({systemUsers.length})</h3>
      
      {systemUsers.length === 0 ? (
        <p className="text-gray-500 text-center py-4">Aucun utilisateur dans ce système</p>
      ) : (
        <div className="space-y-3">
          {systemUsers.map(user => {
            const isCurrentUser = user.id === currentUser?.id;
            const isExpanded = expandedUser === user.id;
            const userOrgs = systemOrganizations.filter(org => user.organizationIds.includes(org.id));
            
            return (
              <div key={user.id} className="border rounded-lg overflow-hidden">
                {/* En-tête utilisateur */}
                <div 
                  className={`p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 ${isCurrentUser ? 'bg-blue-50' : ''}`}
                  onClick={() => setExpandedUser(isExpanded ? null : user.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{user.name}</span>
                        {isCurrentUser && (
                          <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">Vous</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${roleLabels[user.role].color}`}>
                      {roleLabels[user.role].label}
                    </span>
                    <span className="text-xs text-gray-400">
                      {userOrgs.length} org{userOrgs.length > 1 ? 's' : ''}
                    </span>
                    <svg 
                      className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                
                {/* Détails utilisateur (expanded) */}
                {isExpanded && (
                  <div className="border-t p-4 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Changer le rôle */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Rôle</label>
                        <select
                          value={user.role}
                          onChange={e => updateUserRole(user.id, e.target.value as UserRole)}
                          className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                          disabled={isCurrentUser}
                        >
                          <option value="admin">Admin</option>
                          <option value="decideur">Décideur</option>
                          <option value="evaluation">Évaluateur</option>
                        </select>
                        {isCurrentUser && (
                          <p className="text-xs text-gray-400 mt-1">Vous ne pouvez pas modifier votre propre rôle</p>
                        )}
                      </div>
                      
                      {/* Organisations assignées */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Organisations assignées ({userOrgs.length})
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {userOrgs.length === 0 ? (
                            <span className="text-sm text-gray-400">Aucune organisation assignée</span>
                          ) : (
                            userOrgs.map(org => (
                              <span 
                                key={org.id} 
                                className="inline-flex items-center gap-1 bg-white border px-2 py-1 rounded text-sm"
                              >
                                {org.name}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeOrganizationFromUser(user.id, org.id);
                                  }}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  ×
                                </button>
                              </span>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Assigner une nouvelle organisation */}
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ajouter une organisation
                      </label>
                      <div className="flex gap-2">
                        <select
                          className="flex-1 border rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                          onChange={(e) => {
                            if (e.target.value) {
                              assignOrganizationToUser(user.id, e.target.value);
                              e.target.value = '';
                            }
                          }}
                          defaultValue=""
                        >
                          <option value="">Sélectionner une organisation...</option>
                          {systemOrganizations
                            .filter(org => !user.organizationIds.includes(org.id))
                            .map(org => (
                              <option key={org.id} value={org.id}>{org.name}</option>
                            ))
                          }
                        </select>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="mt-4 pt-4 border-t flex justify-end">
                      {!isCurrentUser && (
                        <button
                          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm"
                          onClick={() => {
                            if (confirm(`Êtes-vous sûr de vouloir supprimer ${user.name} ?`)) {
                              removeUser(user.id);
                            }
                          }}
                        >
                          Supprimer cet utilisateur
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

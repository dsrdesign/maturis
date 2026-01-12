'use client';

import UserManager from '../../components/UserManager';
import AddUserToSystem from '../../components/AddUserToSystem';
import { useAuth } from '../lib/AuthContext';
import { usePermissions, useSystem } from '../lib/store';
import { useRouter } from 'next/navigation';

export default function AdminPanel() {
  const { user, isLoading } = useAuth();
  const { canManageUsers } = usePermissions();
  const { currentSystem } = useSystem();
  const router = useRouter();
  
  if (isLoading) return null;
  
  if (!user || !canManageUsers) {
    if (typeof window !== 'undefined') router.push('/organizations');
    return <div className="p-8 text-center text-red-600">Accès réservé aux administrateurs.</div>;
  }
  
  return (
    <section className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-10">
      <div className="max-w-5xl mx-auto px-4">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-blue-700">Administration du système</h1>
            {currentSystem && (
              <p className="text-sm text-gray-500 mt-1">Système actuel : {currentSystem.name}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded bg-blue-100 text-blue-700 text-sm font-semibold">
              Admin : {user.name}
            </span>
            <button 
              onClick={() => router.push('/organizations')}
              className="px-3 py-1 rounded bg-gray-100 text-gray-700 text-sm hover:bg-gray-200"
            >
              ← Retour
            </button>
          </div>
        </div>
        
        {/* Gestion des utilisateurs */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-blue-700">Gestion des utilisateurs</h2>
          <AddUserToSystem />
          <UserManager />
        </div>
        
        {/* Guide des rôles */}
        <div className="bg-white rounded-xl shadow p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4 text-blue-700">Guide des rôles</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-purple-50 rounded-lg">
              <h3 className="font-semibold text-purple-700 mb-2">👑 Admin</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>✓ Gestion complète du système</li>
                <li>✓ Création/suppression d&apos;organisations</li>
                <li>✓ Gestion des utilisateurs</li>
                <li>✓ Exécution des analyses QCM</li>
                <li>✓ Export des données</li>
              </ul>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-700 mb-2">📊 Évaluateur</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>✓ Création d&apos;organisations</li>
                <li>✓ Exécution des analyses QCM</li>
                <li>✓ Modification des organisations</li>
                <li>✓ Consultation des dashboards</li>
                <li>✓ Export des données</li>
              </ul>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-700 mb-2">👔 Décideur</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>✓ Consultation des organisations</li>
                <li>✓ Consultation des dashboards</li>
                <li>✓ Export des données</li>
                <li>✗ Pas de création/modification</li>
                <li>✗ Pas d&apos;analyse QCM</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

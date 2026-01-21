"use client";

import { useAuth } from "@/app/lib/AuthContext";
import { usePermissions, useStore } from "@/app/lib/store";
import { useRouter } from "next/navigation";
import { useState } from "react";
import EditProfileModal from "./EditProfileModal";

const roleLabels = {
  admin: 'Administrateur',
  decideur: 'Décideur',
  evaluation: 'Évaluateur',
};

export default function UserMenu() {
  const { user, logout } = useAuth();
  const { canManageUsers } = usePermissions();
  const reset = useStore((state) => state.reset);
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    router.push("/auth/login");
  };

  const handleReset = () => {
    if (confirm('Êtes-vous sûr de vouloir réinitialiser toutes les données ? Cette action est irréversible.')) {
      reset();
      router.push("/auth/login");
    }
  };

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="text-left hidden md:block">
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-gray-500">{roleLabels[user.role] || user.role}</p>
          </div>
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showMenu && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-2 z-20">
              <div className="px-4 py-2 border-b">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
                <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded ${
                  user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                  user.role === 'evaluation' ? 'bg-green-100 text-green-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {roleLabels[user.role] || user.role}
                </span>
              </div>
              <button
                onClick={() => {
                  setShowMenu(false);
                  setShowEditProfile(true);
                }}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
              >
                ✏️ Modifier mon profil
              </button>
              <button
                onClick={() => {
                  setShowMenu(false);
                  router.push("/organizations");
                }}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
              >
                📊 Mes organisations
              </button>
              {canManageUsers && (
                <button
                  onClick={() => {
                    setShowMenu(false);
                    router.push("/admin");
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                >
                  🛠️ Administration
                </button>
              )}
              <div className="border-t my-2" />
              <button
                onClick={handleReset}
                className="w-full text-left px-4 py-2 text-sm text-orange-600 hover:bg-orange-50"
              >
                🔄 Réinitialiser les données
              </button>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                🚪 Se déconnecter
              </button>
            </div>
          </>
        )}
      </div>

      <EditProfileModal 
        isOpen={showEditProfile} 
        onClose={() => setShowEditProfile(false)} 
      />
    </>
  );
}

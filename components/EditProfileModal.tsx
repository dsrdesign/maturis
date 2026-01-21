"use client";

import { useState } from "react";
import { useAuth } from "@/app/lib/AuthContext";
import { useStore } from "@/app/lib/store";

type EditProfileModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function EditProfileModal({ isOpen, onClose }: EditProfileModalProps) {
  const { user } = useAuth();
  const updateUser = useStore((state) => state.updateUser);
  
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (!isOpen || !user) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation du mot de passe actuel si modification de mot de passe
    if (newPassword || confirmPassword) {
      if (currentPassword !== user.password) {
        setError("Le mot de passe actuel est incorrect");
        return;
      }
      if (newPassword.length < 6) {
        setError("Le nouveau mot de passe doit contenir au moins 6 caractères");
        return;
      }
      if (newPassword !== confirmPassword) {
        setError("Les nouveaux mots de passe ne correspondent pas");
        return;
      }
    }

    // Validation du nom
    if (!name.trim()) {
      setError("Le nom est obligatoire");
      return;
    }

    // Validation de l'email
    if (!email.trim() || !email.includes("@")) {
      setError("L'email est invalide");
      return;
    }

    // Mettre à jour l'utilisateur
    const updates: Partial<typeof user> = {
      name: name.trim(),
      email: email.trim(),
    };

    if (newPassword) {
      updates.password = newPassword;
    }

    updateUser(user.id, updates);
    setSuccess("Profil mis à jour avec succès !");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");

    // Fermer après 1.5s
    setTimeout(() => {
      setSuccess("");
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Modifier mon profil</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div className="border-t pt-4 mt-4">
            <p className="text-sm text-gray-500 mb-3">Changer le mot de passe (optionnel)</p>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe actuel</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Requis pour changer le mot de passe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Min. 6 caractères"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer le nouveau mot de passe</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors"
            >
              Enregistrer
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium transition-colors"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

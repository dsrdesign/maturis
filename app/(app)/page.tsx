'use client';
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../lib/AuthContext";

export default function HomePage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        // Utilisateur connecté → rediriger vers les organisations
        router.push('/organizations');
      } else {
        // Utilisateur non connecté → rediriger vers login
        router.push('/auth/login');
      }
    }
  }, [user, isLoading, router]);

  // Afficher un loader pendant la vérification
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[#3B6BFF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Chargement...</p>
      </div>
    </div>
  );
}

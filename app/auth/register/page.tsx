"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/app/lib/AuthContext";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const result = await register(name, email, password);

    if (result.success) {
      router.push("/organizations");
    } else {
      setError(result.error || "Une erreur est survenue");
    }

    setIsLoading(false);
  };

  return (
    <div className="flex h-screen flex-col lg:flex-row">
      {/* Colonne gauche */}
      <div className="flex-1 p-6 md:p-10 flex items-center justify-center">
        <div className="flex flex-col justify-between bg-[#282FBA]/5 rounded-lg p-8 md:p-10 w-full box-border max-w-lg h-full md:h-auto">

          {/* Contenu haut */}
          <form onSubmit={handleRegister} className="flex flex-col gap-5">
            <h1 className="text-4xl font-bold">Maturis</h1>
            <hr className="border-t border-gray-300" />
            <p className="text-2xl">
              Créez votre compte pour mesurer et faire progresser la maturité numérique de votre organisation.
            </p>

            <input
              className="border border-gray-400 rounded-lg p-3"
              placeholder="Entrez votre nom complet"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <input
              className="border border-gray-400 rounded-lg p-3"
              type="email"
              placeholder="Entrez votre adresse email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              className="border border-gray-400 rounded-lg p-3"
              placeholder="Entrez votre mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />

            {error && (
              <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="flex flex-row gap-2 text-sm">
              <span>Vous avez déjà un compte ?</span>
              <button
                type="button"
                onClick={() => router.push("/auth/login")}
                className="text-blue-600 hover:underline"
              >
                Se connecter
              </button>
            </div>

            {/* Contenu bas */}
            <button 
              type="submit" 
              disabled={isLoading}
              className="bg-[#282FBA] text-white p-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Création en cours..." : "Créer mon compte"}
            </button>
          </form>

        </div>
      </div>

      {/* Colonne droite (affichée uniquement sur desktop) */}
      <div className="flex-1 relative hidden lg:block">
        <Image
          src="/register.svg"
          alt="Register Illustration"
          fill
          className="object-contain p-20"
        />
      </div>
    </div>
  );
}

"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/app/lib/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const result = await login(email, password);

    if (result.success) {
      router.push("/organizations");
    } else {
      setError(result.error || "Une erreur est survenue");
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-gradient-to-b from-[#F8FAFF] to-white">
      <div className="app-container w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        <div className="glass p-10 flex flex-col justify-between card-hover">
          <div>
            <h1 className="text-4xl font-extrabold mb-3">Maturis</h1>
            <p className="text-gray-600 text-lg mb-6">Mesurez et faites progresser la maturité numérique de votre organisation</p>

            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <input
                className="soft-input"
                type="email"
                placeholder="Entrez votre adresse email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <input
                type="password"
                className="soft-input"
                placeholder="Entrez votre mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              {error && (
                <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">
                  {error}
                </div>
              )}

              <div className="flex items-center justify-between text-sm text-gray-500">
                <div>Vous n&apos;avez pas de compte ? <button type="button" onClick={() => router.push("/auth/register")} className="text-[var(--accent)] font-medium">Inscrivez-vous</button></div>
                <button type="button" className="text-[var(--accent)]">Mot de passe oublié ?</button>
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full btn-gradient text-white py-3 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed mt-6"
              >
                {isLoading ? "Connexion..." : "Se connecter"}
              </button>
            </form>

            {/* Informations de démo */}
            {/* <div className="mt-6 p-4 bg-blue-50 rounded-lg text-sm">
              <p className="font-semibold mb-2">Comptes de démonstration :</p>
              <ul className="space-y-1 text-gray-600">
                <li>• admin@maturis.com / admin123</li>
                <li>• jean.dupont@acme.com / password123</li>
                <li>• marie.martin@bionet.fr / password123</li>
              </ul>
            </div> */}
          </div>
        </div>

        <div className="hidden lg:flex items-center justify-center">
          <div className="w-full h-full flex items-center justify-center">
            <Image src="/login.svg" alt="Login Illustration" width={520} height={520} className="object-contain" />
          </div>
        </div>
      </div>
    </div>
  );
}

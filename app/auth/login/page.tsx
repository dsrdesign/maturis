"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-gradient-to-b from-[#F8FAFF] to-white">
      <div className="app-container w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        <div className="glass p-10 flex flex-col justify-between card-hover">
          <div>
            <h1 className="text-4xl font-extrabold mb-3">Maturis</h1>
            <p className="text-gray-600 text-lg mb-6">Mesurez et faites progresser la maturité numérique de votre organisation</p>

            <div className="flex flex-col gap-4">
              <input
                className="soft-input"
                placeholder="Entrez votre adresse email"
              />

              <input
                type="password"
                className="soft-input"
                placeholder="Entrez votre mot de passe"
              />

              <div className="flex items-center justify-between text-sm text-gray-500">
                <div>Vous n&apos;avez pas de compte ? <button onClick={() => router.push("/auth/register")} className="text-[var(--accent)] font-medium">Inscrivez-vous</button></div>
                <button className="text-[var(--accent)]">Mot de passe oublié ?</button>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <button onClick={() => router.push("/organizations")} className="w-full btn-gradient text-white py-3 rounded-xl font-medium">Se connecter</button>
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

"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  return (
    <div className="flex h-screen flex-col lg:flex-row">
      {/* Colonne gauche */}
      <div className="flex-1 p-6 md:p-10 flex items-center justify-center">
        <div className="flex flex-col justify-between bg-[#282FBA]/5 rounded-lg p-8 md:p-10 w-full box-border max-w-lg h-full md:h-auto">

          {/* Contenu haut */}
          <div className="flex flex-col gap-5">
            <h1 className="text-4xl font-bold">Maturis</h1>
            <hr className="border-t border-gray-300" />
            <p className="text-2xl">
              Créez votre compte pour mesurer et faire progresser la maturité numérique de votre organisation.
            </p>

            <input
              className="border border-gray-400 rounded-lg p-3"
              placeholder="Entrez votre nom complet"
            />
            <input
              className="border border-gray-400 rounded-lg p-3"
              placeholder="Entrez votre adresse email"
            />
            <input
              type="password"
              className="border border-gray-400 rounded-lg p-3"
              placeholder="Entrez votre mot de passe"
            />

            <div className="flex flex-row gap-2 text-sm">
              <span>Vous avez déjà un compte ?</span>
              <button
                onClick={() => router.push("/auth/login")}
                className="text-blue-600 hover:underline"
              >
                Se connecter
              </button>
            </div>
          </div>

          {/* Contenu bas */}
          <div className="flex flex-col mt-6">
            <button onClick={() => router.push("/auth/login")} className="bg-[#282FBA] text-white p-3 rounded-lg">
              Créer mon compte
            </button>
          </div>

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

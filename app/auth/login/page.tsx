"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  return (
    <div className="flex h-screen flex-col lg:flex-row">
      
      {/* Colonne gauche */}
      <div className="flex-1 p-6 md:p-10 flex items-center justify-center">
        <div className="flex bg-[#282FBA]/5 justify-center rounded-lg p-8 md:p-10 w-full box-border max-w-lg h-full md:h-auto">
          <div className="flex flex-col justify-between w-full box-border h-full md:h-auto">
            
            {/* Contenu haut */}
            <div className="flex flex-col gap-5">
              <h1 className="text-4xl font-bold">Maturis</h1>
              <hr className="border-t border-gray-300" />
              <p className="text-2xl">
                Mesurez et faites progresser la maturité numérique de votre organisation
              </p>

              <input
                className="border border-gray-400 rounded-lg p-3"
                placeholder="Entrez votre adresse email"
              />

              <input
                type="password"
                className="border border-gray-400 rounded-lg p-3"
                placeholder="Entrez votre mot de passe"
              />

              <div className="flex gap-2 text-sm">
                <span>Vous n'avez pas de compte ?</span>
                <button
                  onClick={() => router.push("/auth/register")}
                  className="text-blue-600 hover:underline"
                >
                  Inscrivez-vous
                </button>
              </div>
            </div>

            {/* Contenu bas */}
            <div className="flex flex-col mt-6">
              <button onClick={() => router.push("/")} className="bg-[#282FBA] text-white p-3 rounded-lg">
                Se connecter
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Colonne droite (visible seulement en desktop) */}
      <div className="flex-1 relative hidden lg:block">
        <Image
          src="/login.svg"
          alt="Login Illustration"
          fill
          className="object-contain p-20"
        />
      </div>
    </div>
  );
}

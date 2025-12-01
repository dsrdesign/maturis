"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const router = useRouter();

  return (
    <div className="flex h-screen flex-col lg:flex-row">
      {/* Colonne gauche */}
      <div className="flex-1 p-6 md:p-10 flex items-center justify-center">
        <div className="flex flex-col justify-between bg-[#282FBA]/5 rounded-lg p-8 md:p-10 w-full max-w-lg box-border h-full md:h-auto">
          
          {/* Contenu haut */}
          <div>
            <h1 className="text-4xl font-bold">Maturis</h1>
            <hr className="border-t border-gray-300 my-4" />
            <p className="text-2xl">
              Mesurez et faites progresser la maturité numérique de votre organisation
            </p>
          </div>

          {/* Contenu bas */}
          <div>
            <button
              onClick={() => router.push("/auth/login")}
              className="bg-[#282FBA] text-white p-3 rounded-lg w-full mt-6"
            >
              Se connecter
            </button>
          </div>

        </div>
      </div>

      {/* Colonne droite (cachée sur mobile) */}
      <div className="flex-1 relative hidden lg:block">
        <Image
          src="/onboarding.svg"
          alt="Onboarding illustration"
          fill
          className="object-contain p-20"
        />
      </div>
    </div>
  );
}

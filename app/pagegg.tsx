'use client';
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  return (
    <main className="flex flex-col min-h-screen">

      {/* HERO SECTION */}
      <section className="flex flex-col lg:flex-row items-center justify-between px-8 md:px-16 py-20 bg-[#282FBA]/5">
        
        {/* Texte */}
        <div className="max-w-xl flex flex-col gap-6">
          <h1 className="text-5xl font-bold leading-tight">
            Pilotez la maturité numérique  
            <span className="text-[#282FBA]"> de votre organisation</span>
          </h1>

          <p className="text-xl text-gray-700">
            Analysez, mesurez et accélérez votre transformation digitale grâce à des outils puissants et une vision claire.
          </p>

          <div className="flex gap-4 mt-4">
            <button 
              onClick={() => router.push("/auth")}
              className="bg-[#282FBA] text-white px-6 py-3 rounded-lg"
            >
              Commencer
            </button>

            {/* <button
              onClick={() => router.push("/auth/register")}
              className="border border-[#282FBA] text-[#282FBA] px-6 py-3 rounded-lg"
            >
              Créer un compte
            </button> */}
          </div>
        </div>

        {/* Image */}
        <div className="relative w-full h-80 mt-10 lg:mt-0 lg:w-[50%]">
          <Image
            src="/onboarding.svg"
            alt="Digital transformation illustration"
            fill
            className="object-contain"
          />
        </div>
      </section>

      {/* AVANTAGES */}
      <section className="px-8 md:px-16 py-20 bg-white">
        <h2 className="text-3xl font-bold mb-10 text-center">
          Pourquoi choisir <span className="text-[#282FBA]">Maturis</span> ?
        </h2>

        <div className="grid md:grid-cols-3 gap-10">
          <div className="p-6 rounded-lg bg-[#282FBA]/5">
            <h3 className="text-xl font-semibold mb-3">Mesure précise</h3>
            <p className="text-gray-700">
              Obtenez un score fiable de la maturité numérique et identifiez clairement vos axes d’amélioration.
            </p>
          </div>

          <div className="p-6 rounded-lg bg-[#282FBA]/5">
            <h3 className="text-xl font-semibold mb-3">Tableaux de bord</h3>
            <p className="text-gray-700">
              Visualisez instantanément vos performances grâce à des dashboards simples et impactants.
            </p>
          </div>

          <div className="p-6 rounded-lg bg-[#282FBA]/5">
            <h3 className="text-xl font-semibold mb-3">Recommandations</h3>
            <p className="text-gray-700">
              Accédez à des suggestions concrètes pour faire progresser votre transformation digitale.
            </p>
          </div>
        </div>
      </section>

      {/* COMMENT ÇA MARCHE */}
      <section className="px-8 md:px-16 py-20 bg-[#282FBA]/5">
        <h2 className="text-3xl font-bold mb-10 text-center">
          Comment ça marche ?
        </h2>

        <div className="grid md:grid-cols-3 gap-10">
          <div className="text-center">
            <div className="font-bold text-5xl mb-4 text-[#282FBA]">1</div>
            <p className="text-gray-700">Créez votre compte et accédez à votre espace.</p>
          </div>

          <div className="text-center">
            <div className="font-bold text-5xl mb-4 text-[#282FBA]">2</div>
            <p className="text-gray-700">Évaluez la maturité digitale de votre organisation.</p>
          </div>

          <div className="text-center">
            <div className="font-bold text-5xl mb-4 text-[#282FBA]">3</div>
            <p className="text-gray-700">Consultez vos résultats et suivez vos progrès.</p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-6 text-center text-gray-600">
        © {new Date().getFullYear()} Maturis – Tous droits réservés
      </footer>
    </main>
  );
}

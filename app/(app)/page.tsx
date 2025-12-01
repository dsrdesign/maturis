'use client';
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* HEADER */}
      <header className="w-full bg-white shadow-sm p-5 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>

        <div className="flex items-center gap-4">
          <span className="text-gray-700 font-medium">Bonjour, DSR 👋</span>
          <button onClick={() => router.push("/auth")} className="bg-[#282FBA] text-white px-4 py-2 rounded-lg">
            Déconnexion
          </button>
        </div>
      </header>

      {/* CONTENU */}
      <main className="flex-1 p-6 md:p-10">
        {/* Cartes principales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold mb-2">Score global</h3>
            <p className="text-4xl font-bold text-[#282FBA]">74%</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold mb-2">Audits réalisés</h3>
            <p className="text-4xl font-bold text-[#282FBA]">12</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold mb-2">Prochain objectif</h3>
            <p className="text-gray-700">
              Améliorer le scoring “Stratégie digitale”
            </p>
          </div>
        </div>

        {/* Deuxième section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Carte graphique (placeholder pour plus tard) */}
          <div className="bg-white p-6 rounded-xl shadow-sm h-64 flex items-center justify-center text-gray-400">
            Graphique d’évolution (placeholder)
          </div>

          {/* Dernières activités */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Dernières activités</h3>

            <ul className="flex flex-col gap-3">
              <li className="border-b pb-2 text-gray-700">
                ✔ Audit “Infrastructures IT” complété
              </li>
              <li className="border-b pb-2 text-gray-700">
                ✔ Mise à jour du profil organisation
              </li>
              <li className="border-b pb-2 text-gray-700">
                ✔ Nouvelle recommandation disponible
              </li>
            </ul>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="py-6 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} Maturis – Dashboard
      </footer>
    </div>
  );
}

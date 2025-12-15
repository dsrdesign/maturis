'use client';
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  return (
    <div className="min-h-screen py-12">
      <div className="app-container px-6">
        <header className="bg-white card-soft p-5 flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Dashboard</h1>

          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/resources')} className="text-sm text-gray-600 px-3 py-2 rounded hover:bg-gray-50">Ressources</button>
            <span className="text-gray-700 font-medium">Bonjour, DSR 👋</span>
            <button onClick={() => router.push("/auth")} className="bg-[#3B6BFF] text-white px-4 py-2 rounded-lg">Déconnexion</button>
          </div>
        </header>

        <main>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-white card-soft p-6">
              <h3 className="text-lg font-semibold mb-2">Score global</h3>
              <p className="text-4xl font-bold text-[#3B6BFF]">74%</p>
            </div>

            <div className="bg-white card-soft p-6">
              <h3 className="text-lg font-semibold mb-2">Audits réalisés</h3>
              <p className="text-4xl font-bold text-[#3B6BFF]">12</p>
            </div>

            <div className="bg-white card-soft p-6">
              <h3 className="text-lg font-semibold mb-2">Prochain objectif</h3>
              <p className="text-gray-700">Améliorer le scoring “Stratégie digitale”</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white card-soft p-6 h-64 flex items-center justify-center text-gray-400">Graphique d’évolution (placeholder)</div>

            <div className="bg-white card-soft p-6">
              <h3 className="text-lg font-semibold mb-4">Dernières activités</h3>
              <ul className="flex flex-col gap-3">
                <li className="border-b pb-2 text-gray-700">✔ Audit “Infrastructures IT” complété</li>
                <li className="border-b pb-2 text-gray-700">✔ Mise à jour du profil organisation</li>
                <li className="border-b pb-2 text-gray-700">✔ Nouvelle recommandation disponible</li>
              </ul>
            </div>
          </div>
        </main>

        <footer className="py-6 text-center text-gray-500 text-sm">© {new Date().getFullYear()} Maturis – Dashboard</footer>
      </div>
    </div>
  );
}

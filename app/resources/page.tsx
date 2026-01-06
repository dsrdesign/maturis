"use client";
import { useRouter } from "next/navigation";
import { useAuth } from "../lib/AuthContext";
import { useEffect } from "react";
import UserMenu from "@/components/UserMenu";

const docs = [
  { id: 'cad', name: 'Cadrage (PDF)', href: '/CADRAGE.pdf' },
  { id: 'meth', name: 'Méthodologie de calcul du score final (DOCX)', href: '/Méthodologie de calcul du score final .docx' },
  { id: 'class', name: 'Diagramme de classes', href: '/ClassDiagram1.png' },
];

export default function ResourcesPage(){
  const router = useRouter();
  const { user, isLoading } = useAuth();

  // Rediriger vers login si non connecté
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="app-container px-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Ressources & documentation</h1>
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/organizations')} className="px-4 py-2 rounded bg-gray-100">Retour</button>
            <UserMenu />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {docs.map(d => (
            <a key={d.id} href={d.href} className="bg-white card-soft p-6 block rounded-lg hover:shadow-md" target="_blank" rel="noreferrer">
              <h3 className="font-semibold text-lg mb-2">{d.name}</h3>
              <p className="text-sm text-gray-500">Ouvrir / Télécharger</p>
            </a>
          ))}
        </div>

        <footer className="py-10 text-center text-gray-500 text-sm">© {new Date().getFullYear()} Maturis</footer>
      </div>
    </div>
  )
}

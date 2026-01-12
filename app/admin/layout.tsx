export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-blue-700">Administration</h1>
      </header>
      <main className="max-w-5xl mx-auto py-8 px-4">
        {children}
      </main>
    </div>
  );
}

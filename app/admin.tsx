import SystemManager from '../components/SystemManager';
import UserManager from '../components/UserManager';
import AddUserToSystem from '../components/AddUserToSystem';
import { useAuth } from './lib/AuthContext';
import { useRouter } from 'next/navigation';

export default function AdminPanel() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  if (isLoading) return null;
  if (!user || user.role !== 'admin') {
    if (typeof window !== 'undefined') router.push('/organizations');
    return <div className="p-8 text-center text-red-600">Accès réservé aux administrateurs.</div>;
  }
  return (
    <div className="max-w-4xl mx-auto py-10">
      <SystemManager />
      <AddUserToSystem />
      <UserManager />
    </div>
  );
}

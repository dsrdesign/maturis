export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
  organizationIds: string[]; // IDs des organisations auxquelles l'utilisateur a accès
};

export const mockUsers: User[] = [
  {
    id: 'user-1',
    name: 'Jean Dupont',
    email: 'jean.dupont@acme.com',
    password: 'password123', // En production, utilisez un hash!
    role: 'user',
    organizationIds: ['org-1'],
  },
  {
    id: 'user-2',
    name: 'Marie Martin',
    email: 'marie.martin@bionet.fr',
    password: 'password123',
    role: 'user',
    organizationIds: ['org-2'],
  },
  {
    id: 'user-3',
    name: 'Pierre Durand',
    email: 'pierre.durand@mairie.fr',
    password: 'password123',
    role: 'user',
    organizationIds: ['org-3'],
  },
  {
    id: 'user-4',
    name: 'Admin Global',
    email: 'admin@maturis.com',
    password: 'admin123',
    role: 'admin',
    organizationIds: ['org-1', 'org-2', 'org-3'], // Admin voit toutes les organisations
  },
];

// Fonction pour authentifier un utilisateur
export function authenticateUser(email: string, password: string): User | null {
  const user = mockUsers.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );
  return user || null;
}

// Fonction pour créer un nouvel utilisateur (inscription)
export function registerUser(name: string, email: string, password: string): User | { error: string } {
  // Vérifier si l'email existe déjà
  const existingUser = mockUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existingUser) {
    return { error: 'Un compte avec cet email existe déjà' };
  }

  // Créer le nouvel utilisateur
  const newUser: User = {
    id: `user-${mockUsers.length + 1}`,
    name,
    email,
    password,
    role: 'user',
    organizationIds: [], // Pas d'organisation par défaut
  };

  mockUsers.push(newUser);
  return newUser;
}

// Fonction pour obtenir un utilisateur par ID
export function getUserById(userId: string): User | null {
  return mockUsers.find((u) => u.id === userId) || null;
}

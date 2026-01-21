import type { System, UserRole } from './types';

// Re-exporter UserRole depuis types
export type { UserRole } from './types';

export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  systemId: string;
  organizationIds: string[];
};

// Système par défaut pour les données de démonstration
export const mockSystems: System[] = [
  {
    id: 'system-default',
    name: 'Maturis - Système Principal',
    description: 'Système de démonstration avec données pré-configurées',
    organizationIds: ['org-1', 'org-2', 'org-3'],
    userIds: ['user-1', 'user-2', 'user-3', 'user-4'],
  },
];

export const mockUsers: User[] = [
  {
    id: 'user-1',
    name: 'Admin Principal',
    email: 'admin@maturis.com',
    password: 'admin123',
    role: 'admin',
    systemId: 'system-default',
    organizationIds: ['org-1', 'org-2', 'org-3'], // Admin voit toutes les organisations du système
  },
  {
    id: 'user-2',
    name: 'Marie Décideur',
    email: 'decideur@maturis.com',
    password: 'password123',
    role: 'decideur',
    systemId: 'system-default',
    organizationIds: ['org-1', 'org-2'], // Décideur accède à certaines organisations
  },
  {
    id: 'user-3',
    name: 'Jean Évaluateur',
    email: 'evaluateur@maturis.com',
    password: 'password123',
    role: 'evaluation',
    systemId: 'system-default',
    organizationIds: ['org-1', 'org-2', 'org-3'], // Évaluateur peut analyser toutes les organisations
  },
  {
    id: 'user-4',
    name: 'Pierre Décideur',
    email: 'pierre@maturis.com',
    password: 'password123',
    role: 'decideur',
    systemId: 'system-default',
    organizationIds: ['org-3'], // Ne voit que l'organisation 3
  },
];

// Définition des permissions par rôle
export const rolePermissions = {
  admin: {
    canCreateOrganization: true,
    canDeleteOrganization: true,
    canEditOrganization: true,
    canViewOrganization: true,
    canRunQCM: true,
    canViewDashboard: true,
    canViewResults: true,
    canManageUsers: true,
    canManageSystem: true,
    canExportData: true,
    description: 'Administrateur - Accès complet au système',
  },
  decideur: {
    canCreateOrganization: true,
    canDeleteOrganization: true,
    canEditOrganization: true,
    canViewOrganization: true,
    canRunQCM: true,
    canViewDashboard: true,
    canViewResults: true,
    canManageUsers: false,
    canManageSystem: false,
    canExportData: true,
    description: 'Décideur - Gestion des organisations et des évaluations',
  },
  evaluation: {
    canCreateOrganization: false,
    canDeleteOrganization: false,
    canEditOrganization: false,
    canViewOrganization: true,
    canRunQCM: true,
    canViewDashboard: false,
    canViewResults: false,
    canManageUsers: false,
    canManageSystem: false,
    canExportData: false,
    description: 'Évaluateur - Lancer des évaluations uniquement',
  },
} as const;

// Type pour les permissions
export type RolePermissions = typeof rolePermissions;
export type Permission = Exclude<keyof typeof rolePermissions.admin, 'description'>;

// Fonction utilitaire pour vérifier une permission
export function hasPermission(role: UserRole | undefined, permission: Permission): boolean {
  if (!role) return false;
  const roleConfig = rolePermissions[role];
  if (!roleConfig) return false;
  return roleConfig[permission] as boolean;
}

// Fonction pour obtenir toutes les permissions d'un rôle
export function getPermissions(role: UserRole | undefined) {
  if (!role) return null;
  return rolePermissions[role] ?? null;
}

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

  // Créer le système par défaut
  const systemId = `system-${Date.now()}`;

  // Créer le nouvel utilisateur (admin du système)
  const newUser: User = {
    id: `user-${mockUsers.length + 1}`,
    name,
    email,
    password,
    role: 'admin',
    systemId,
    organizationIds: [],
  };

  mockUsers.push(newUser);
  return newUser;
}

// Fonction pour obtenir un utilisateur par ID
export function getUserById(userId: string): User | null {
  return mockUsers.find((u) => u.id === userId) || null;
}

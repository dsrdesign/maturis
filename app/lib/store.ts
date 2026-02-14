// Hook pour la gestion des systèmes (switch, création)
export const useSystemManager = () => {
  const systems = useStore((state) => state.systems || []);
  const currentSystemId = useStore((state) => state.currentSystemId);
  const setCurrentSystemId = (id: string) => {
    useStore.setState({ currentSystemId: id });
  };
  const addSystem = (system: System) => {
    useStore.setState((state) => ({
      systems: [...state.systems, system],
    }));
  };
  return { systems, currentSystemId, setCurrentSystemId, addSystem };
};
// Hook personnalisé pour les utilisateurs du système
export const useSystemUsers = () => {
  const users = useStore((state) => state.users);
  const { currentSystem } = useSystem();
  
  const addUser = (user: User) => {
    useStore.setState((state) => ({
      users: [...state.users, user],
      systems: state.systems.map(s =>
        s.id === currentSystem?.id
          ? { ...s, userIds: [...s.userIds, user.id] }
          : s
      ),
    }));
  };
  
  const updateUserRole = (userId: string, role: UserRole) => {
    useStore.setState((state) => ({
      users: state.users.map(u =>
        u.id === userId ? { ...u, role } : u
      ),
    }));
  };
  
  const removeUser = (userId: string) => {
    useStore.setState((state) => ({
      users: state.users.filter(u => u.id !== userId),
      systems: state.systems.map(s =>
        s.id === currentSystem?.id
          ? { ...s, userIds: s.userIds.filter(id => id !== userId) }
          : s
      ),
    }));
  };
  
  const assignOrganizationToUser = (userId: string, organizationId: string) => {
    useStore.setState((state) => ({
      users: state.users.map(u =>
        u.id === userId && !u.organizationIds.includes(organizationId)
          ? { ...u, organizationIds: [...u.organizationIds, organizationId] }
          : u
      ),
    }));
  };
  
  const removeOrganizationFromUser = (userId: string, organizationId: string) => {
    useStore.setState((state) => ({
      users: state.users.map(u =>
        u.id === userId
          ? { ...u, organizationIds: u.organizationIds.filter(id => id !== organizationId) }
          : u
      ),
    }));
  };
  
  const systemUsers = currentSystem ? users.filter(u => u.systemId === currentSystem.id) : [];
  
  return { 
    systemUsers, 
    addUser, 
    updateUserRole, 
    removeUser,
    assignOrganizationToUser,
    removeOrganizationFromUser
  };
};
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, mockUsers, mockSystems, hasPermission, Permission, UserRole } from './authMockData';
import type { System } from './types';
import { useState, useEffect } from 'react';

// Types
type Organization = {
  id: string;
  name: string;
  description: string;
  country: string;
  city: string;
  employees: number;
  revenue: number;
  creationDate: string;
  legalForm: string;
  sector: string;
  score: number;
  lastAudit: string;
  domainScores: {
    EDM: number;
    APO: number;
    BAI: number;
    DSS: number;
    MEA: number;
  };
  domainWeights?: {
    EDM: number;
    APO: number;
    BAI: number;
    DSS: number;
    MEA: number;
  };
  audits: Array<{
    id: string;
    date: string;
    score: number;
    title: string;
    domainScores?: {
      EDM: number;
      APO: number;
      BAI: number;
      DSS: number;
      MEA: number;
    };
    responses?: Array<{
      domain: string;
      questionText: string;
      selectedAnswer: string;
      answerValue: number;
      scaleMax: number;
    }>;
  }>;
};

type QCMResponse = {
  organizationId: string;
  questionId: string;
  answer: number;
  timestamp: string;
};

type AppState = {
  // Authentification
  user: User | null;
  isAuthenticated: boolean;
  users: User[]; // Liste de tous les utilisateurs (persistée)
  systems: System[];
  currentSystemId: string | null;
  
  // Organisations
  organizations: Organization[];
  
  // Réponses QCM
  qcmResponses: QCMResponse[];
  
  // Actions Auth
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUser: (userId: string, updates: Partial<User>) => void;
  
  // Actions Organisations
  addOrganization: (org: Organization) => void;
  updateOrganization: (id: string, updates: Partial<Organization>) => void;
  deleteOrganization: (id: string) => void;
  getOrganizationById: (id: string) => Organization | undefined;
  
  // Actions QCM
  saveQCMResponse: (response: QCMResponse) => void;
  getQCMResponsesForOrg: (orgId: string) => QCMResponse[];
  clearQCMResponsesForOrg: (orgId: string) => void;
  
  // Actions générales
  reset: () => void;
};

// Données initiales (pour le premier chargement)
const initialOrganizations: Organization[] = [
  {
    id: "org-1",
    name: "Acme Corp",
    description: "Entreprise spécialisée en services numériques",
    country: "Cameroun",
    city: "Douala",
    employees: 250,
    revenue: 15000000,
    creationDate: "2015-03-15",
    legalForm: "SAS",
    sector: 'bank',
    score: 78,
    lastAudit: "2025-10-12",
    domainScores: { EDM: 3.2, APO: 2.8, BAI: 3.5, DSS: 2.7, MEA: 3.0 },
    domainWeights: { EDM: 0.15, APO: 0.20, BAI: 0.20, DSS: 0.25, MEA: 0.20 },
    audits: [
      { id: 'a1', date: '2025-10-12', score: 78, title: 'Audit Infrastructures IT', domainScores: { EDM: 3.2, APO: 2.8, BAI: 3.5, DSS: 2.7, MEA: 3.0 } },
      { id: 'a0', date: '2024-06-05', score: 71, title: 'Audit Sécurité & Gouvernance', domainScores: { EDM: 2.8, APO: 2.5, BAI: 3.0, DSS: 2.3, MEA: 2.6 } },
      { id: 'a-1', date: '2023-11-15', score: 65, title: 'Audit Initial', domainScores: { EDM: 2.4, APO: 2.2, BAI: 2.7, DSS: 2.0, MEA: 2.3 } },
    ],
  },
  {
    id: "org-2",
    name: "Bionet",
    description: "Start-up biotech",
    country: "Sénégal",
    city: "Dakar",
    employees: 45,
    revenue: 2500000,
    creationDate: "2020-06-10",
    legalForm: "SAS",
    sector: 'health',
    score: 62,
    lastAudit: "2025-08-02",
    domainScores: { EDM: 2.6, APO: 3.2, BAI: 2.9, DSS: 2.1, MEA: 2.8 },
    domainWeights: { EDM: 0.15, APO: 0.20, BAI: 0.20, DSS: 0.30, MEA: 0.15 },
    audits: [
      { id: 'b1', date: '2025-08-02', score: 62, title: 'Audit Processus', domainScores: { EDM: 2.6, APO: 3.2, BAI: 2.9, DSS: 2.1, MEA: 2.8 } },
      { id: 'b0', date: '2024-11-20', score: 58, title: 'Audit Initial', domainScores: { EDM: 2.3, APO: 2.8, BAI: 2.5, DSS: 1.8, MEA: 2.4 } },
    ],
  },
  {
    id: "org-3",
    name: "Municipalité X",
    description: "Collectivité locale",
    country: "Côte d'Ivoire",
    city: "Abidjan",
    employees: 180,
    revenue: 8000000,
    creationDate: "2010-01-01",
    legalForm: "Collectivité territoriale",
    sector: 'industry',
    score: 54,
    lastAudit: "2025-07-19",
    domainScores: { EDM: 2.4, APO: 2.7, BAI: 2.5, DSS: 2.9, MEA: 2.2 },
    domainWeights: { EDM: 0.15, APO: 0.20, BAI: 0.25, DSS: 0.25, MEA: 0.15 },
    audits: [
      { id: 'm1', date: '2025-07-19', score: 54, title: 'Audit Gouvernance', domainScores: { EDM: 2.4, APO: 2.7, BAI: 2.5, DSS: 2.9, MEA: 2.2 } },
      { id: 'm0', date: '2024-03-10', score: 48, title: 'Audit Conformité', domainScores: { EDM: 2.0, APO: 2.3, BAI: 2.1, DSS: 2.5, MEA: 1.9 } },
      { id: 'm-1', date: '2023-06-25', score: 42, title: 'Premier Audit', domainScores: { EDM: 1.7, APO: 2.0, BAI: 1.8, DSS: 2.2, MEA: 1.6 } },
    ],
  },
];

// Store Zustand avec persistance
export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // État initial
      user: null,
      isAuthenticated: false,
      users: mockUsers, // Initialiser avec les utilisateurs mock
      systems: mockSystems, // Initialiser avec les systèmes mock
      currentSystemId: 'system-default', // Système par défaut
      organizations: initialOrganizations,
      qcmResponses: [],

      // Actions Auth
      login: async (email: string, password: string) => {
        try {
          // Chercher l'utilisateur dans le store (source de vérité)
          const users = get().users;
          const authenticatedUser = users.find(
            (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
          );
          
          if (authenticatedUser) {
            const systems = get().systems;
            const userSystemId = authenticatedUser.systemId || 'system-default';
            
            // S'assurer que le système par défaut existe avec les bonnes données
            let updatedSystems = systems;
            const defaultSystem = systems.find(s => s.id === 'system-default');
            if (!defaultSystem) {
              // Ajouter le système par défaut s'il n'existe pas
              updatedSystems = [...systems, {
                id: 'system-default',
                name: 'Maturis - Système Principal',
                description: 'Système de démonstration avec données pré-configurées',
                organizationIds: ['org-1', 'org-2', 'org-3'],
                userIds: ['user-1', 'user-2', 'user-3', 'user-4'],
              }];
            }
            
            set({ 
              user: authenticatedUser, 
              isAuthenticated: true,
              currentSystemId: userSystemId,
              systems: updatedSystems,
            });
            return { success: true };
          } else {
            return { success: false, error: 'Email ou mot de passe incorrect' };
          }
        } catch (error) {
          console.error('Erreur lors de la connexion:', error);
          return { success: false, error: 'Une erreur est survenue' };
        }
      },

      register: async (name: string, email: string, password: string) => {
        try {
          // Vérifier si l'email existe déjà dans le store
          const users = get().users;
          const existingUser = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
          
          if (existingUser) {
            return { success: false, error: 'Un compte avec cet email existe déjà' };
          }

          // Créer le système par défaut
          const systemId = `system-${Date.now()}`;
          const newSystem: System = {
            id: systemId,
            name: `${name} - Système`,
            organizationIds: [],
            userIds: [],
          };

          // Créer le nouvel utilisateur (admin du système)
          const newUser: User = {
            id: `user-${users.length + 1}`,
            name,
            email,
            password,
            role: 'admin',
            systemId,
            organizationIds: [],
          };

          // Ajouter l'utilisateur au système
          newSystem.userIds.push(newUser.id);

          set((state) => ({
            users: [...state.users, newUser],
            systems: [...(state.systems || []), newSystem],
            user: newUser,
            isAuthenticated: true,
            currentSystemId: systemId,
          }));
          
          return { success: true };
        } catch (error) {
          console.error('Erreur lors de l\'inscription:', error);
          return { success: false, error: 'Une erreur est survenue' };
        }
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },

      updateUser: (userId: string, updates: Partial<User>) => {
        set((state) => {
          const updatedUsers = state.users.map(u =>
            u.id === userId ? { ...u, ...updates } : u
          );
          // Si c'est l'utilisateur connecté, mettre à jour aussi state.user
          const updatedCurrentUser = state.user?.id === userId
            ? { ...state.user, ...updates }
            : state.user;
          return {
            users: updatedUsers,
            user: updatedCurrentUser,
          };
        });
      },

      // Actions Organisations
      addOrganization: (org: Organization) => {
        set((state) => {
          // Ajouter l'organisation à la liste
          const newOrganizations = [org, ...state.organizations];

          // Ajouter l'ID de l'organisation au système courant
          const updatedSystems = (state.systems || []).map(s =>
            s.id === state.currentSystemId
              ? { ...s, organizationIds: [...s.organizationIds, org.id] }
              : s
          );

          // Ajouter l'ID de l'organisation à l'utilisateur actif
          const updatedUser = state.user ? {
            ...state.user,
            organizationIds: [...state.user.organizationIds, org.id]
          } : state.user;

          // Mettre à jour aussi le tableau users pour persistance
          const updatedUsers = state.users.map(u =>
            u.id === state.user?.id
              ? { ...u, organizationIds: [...u.organizationIds, org.id] }
              : u
          );

          return {
            organizations: newOrganizations,
            systems: updatedSystems,
            user: updatedUser,
            users: updatedUsers,
          };
        });
      },

      updateOrganization: (id: string, updates: Partial<Organization>) => {
        set((state) => ({
          organizations: state.organizations.map((org) =>
            org.id === id ? { ...org, ...updates } : org
          ),
        }));
      },

      deleteOrganization: (id: string) => {
        set((state) => ({
          organizations: state.organizations.filter((org) => org.id !== id),
          qcmResponses: state.qcmResponses.filter((resp) => resp.organizationId !== id),
        }));
      },

      getOrganizationById: (id: string) => {
        return get().organizations.find((org) => org.id === id);
      },

      // Actions QCM
      saveQCMResponse: (response: QCMResponse) => {
        set((state) => ({
          qcmResponses: [...state.qcmResponses, response],
        }));
      },

      getQCMResponsesForOrg: (orgId: string) => {
        return get().qcmResponses.filter((resp) => resp.organizationId === orgId);
      },

      clearQCMResponsesForOrg: (orgId: string) => {
        set((state) => ({
          qcmResponses: state.qcmResponses.filter((resp) => resp.organizationId !== orgId),
        }));
      },

      // Reset complet
      reset: () => {
        set({
          user: null,
          isAuthenticated: false,
          users: mockUsers, // Réinitialiser avec les utilisateurs par défaut
          systems: mockSystems, // Réinitialiser avec les systèmes par défaut
          currentSystemId: 'system-default',
          organizations: initialOrganizations,
          qcmResponses: [],
        });
      },
    }),
    {
      name: 'maturis-storage', // nom de la clé dans localStorage
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        users: state.users, // Persister les utilisateurs
        organizations: state.organizations,
        qcmResponses: state.qcmResponses,
        systems: state.systems,
        currentSystemId: state.currentSystemId,
      }),
    }
  )
);

// Hook personnalisé pour l'authentification
export const useAuth = () => {
  const user = useStore((state) => state.user);
  const isAuthenticated = useStore((state) => state.isAuthenticated);
  const login = useStore((state) => state.login);
  const register = useStore((state) => state.register);
  const logout = useStore((state) => state.logout);
  
  // Vérifier si le store a été hydraté depuis le localStorage
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Attendre que Zustand charge les données du localStorage
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return { user, isAuthenticated, login, register, logout, isLoading };
};

// Hook personnalisé pour les systèmes
export const useSystem = () => {
  const systems = useStore((state) => state.systems || []);
  const currentSystemId = useStore((state) => state.currentSystemId);
  const user = useStore((state) => state.user);
  const currentSystem = systems.find(s => s.id === currentSystemId) || null;
  return { systems, currentSystem, currentSystemId, user };
};

// Hook personnalisé pour les organisations
export const useOrganizations = () => {
  const organizations = useStore((state) => state.organizations);
  const addOrganization = useStore((state) => state.addOrganization);
  const updateOrganization = useStore((state) => state.updateOrganization);
  const deleteOrganization = useStore((state) => state.deleteOrganization);
  const getOrganizationById = useStore((state) => state.getOrganizationById);
  const user = useStore((state) => state.user);
  const { currentSystem } = useSystem();

  // Filtrer les organisations selon le système et les organisations assignées à l'utilisateur
  let filteredOrganizations: Organization[] = [];
  
  if (!user) {
    filteredOrganizations = [];
  } else if (user.role === 'admin') {
    // Admin voit toutes les organisations du système (ou toutes si pas de système défini)
    if (currentSystem) {
      filteredOrganizations = organizations.filter(org => currentSystem.organizationIds.includes(org.id));
    } else {
      // Fallback: admin voit toutes les organisations
      filteredOrganizations = organizations;
    }
  } else {
    // Les autres rôles (decideur, evaluation) voient uniquement les organisations qui leur sont assignées
    if (currentSystem) {
      filteredOrganizations = organizations.filter(org => 
        currentSystem.organizationIds.includes(org.id) && 
        user.organizationIds.includes(org.id)
      );
    } else {
      // Fallback: filtre uniquement par les organisations assignées à l'utilisateur
      filteredOrganizations = organizations.filter(org => user.organizationIds.includes(org.id));
    }
  }

  return {
    organizations,
    filteredOrganizations,
    addOrganization,
    updateOrganization,
    deleteOrganization,
    getOrganizationById,
  };
};

// Hook personnalisé pour les QCM
export const useQCM = (organizationId?: string) => {
  const saveQCMResponse = useStore((state) => state.saveQCMResponse);
  const getQCMResponsesForOrg = useStore((state) => state.getQCMResponsesForOrg);
  const clearQCMResponsesForOrg = useStore((state) => state.clearQCMResponsesForOrg);

  const responses = organizationId ? getQCMResponsesForOrg(organizationId) : [];

  return {
    responses,
    saveQCMResponse,
    clearQCMResponsesForOrg,
  };
};

// Hook personnalisé pour les permissions basées sur le rôle
export const usePermissions = () => {
  const user = useStore((state) => state.user);
  
  const can = (permission: Permission): boolean => {
    return hasPermission(user?.role, permission);
  };
  
  return {
    can,
    role: user?.role,
    isAdmin: user?.role === 'admin',
    isDecideur: user?.role === 'decideur',
    isEvaluation: user?.role === 'evaluation',
    // Raccourcis pour les permissions courantes
    canCreateOrganization: can('canCreateOrganization'),
    canDeleteOrganization: can('canDeleteOrganization'),
    canEditOrganization: can('canEditOrganization'),
    canViewOrganization: can('canViewOrganization'),
    canRunQCM: can('canRunQCM'),
    canViewDashboard: can('canViewDashboard'),
    canViewResults: can('canViewResults'),
    canManageUsers: can('canManageUsers'),
    canManageSystem: can('canManageSystem'),
    canExportData: can('canExportData'),
  };
};

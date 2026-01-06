# Système d'authentification - Maturis

## Vue d'ensemble

Le système d'authentification a été intégré avec des données mock pour permettre le développement et les tests sans backend.

## Fichiers créés

### 1. `app/lib/authMockData.ts`
Contient les utilisateurs mock et les fonctions d'authentification :
- `mockUsers` : Liste des utilisateurs de test
- `authenticateUser()` : Fonction de connexion
- `registerUser()` : Fonction d'inscription
- `getUserById()` : Récupération d'un utilisateur par ID

### 2. `app/lib/AuthContext.tsx`
Context React pour la gestion de l'état d'authentification :
- Fournit l'utilisateur connecté dans toute l'application
- Gère la persistance dans localStorage
- Expose les méthodes `login()`, `register()`, et `logout()`

### 3. `components/UserMenu.tsx`
Composant de menu utilisateur avec :
- Avatar généré depuis les initiales
- Nom et rôle de l'utilisateur
- Menu déroulant avec navigation
- Bouton de déconnexion

## Comptes de démonstration

### Admin global
- **Email** : admin@maturis.com
- **Mot de passe** : admin123
- **Accès** : Toutes les organisations

### Jean Dupont (Acme Corp)
- **Email** : jean.dupont@acme.com
- **Mot de passe** : password123
- **Accès** : Organisation "Acme Corp" uniquement

### Marie Martin (Bionet)
- **Email** : marie.martin@bionet.fr
- **Mot de passe** : password123
- **Accès** : Organisation "Bionet" uniquement

### Pierre Durand (Municipalité X)
- **Email** : pierre.durand@mairie.fr
- **Mot de passe** : password123
- **Accès** : Organisation "Municipalité X" uniquement

## Fonctionnalités

### Pages modifiées

#### `/app/auth/login/page.tsx`
- ✅ Formulaire de connexion fonctionnel
- ✅ Validation des champs
- ✅ Affichage des erreurs
- ✅ Redirection après connexion
- ✅ Affichage des comptes de démo

#### `/app/auth/register/page.tsx`
- ✅ Formulaire d'inscription fonctionnel
- ✅ Validation email existant
- ✅ Création de nouveaux utilisateurs
- ✅ Redirection après inscription

#### `/app/organizations/page.tsx`
- ✅ Protection de la page (redirection si non connecté)
- ✅ Filtrage des organisations selon les permissions
- ✅ Menu utilisateur avec déconnexion
- ✅ Affichage du nom de l'utilisateur

#### `/app/resources/page.tsx`
- ✅ Protection de la page
- ✅ Menu utilisateur intégré

### Système de permissions

Les utilisateurs ont accès uniquement aux organisations listées dans leur `organizationIds` :

```typescript
{
  id: 'user-1',
  name: 'Jean Dupont',
  email: 'jean.dupont@acme.com',
  role: 'admin',
  organizationIds: ['org-1'], // Accès uniquement à org-1
}
```

L'admin global a accès à toutes les organisations :

```typescript
{
  id: 'user-4',
  name: 'Admin Global',
  role: 'admin',
  organizationIds: ['org-1', 'org-2', 'org-3'], // Toutes
}
```

## Utilisation

### Dans un composant

```tsx
import { useAuth } from '@/app/lib/AuthContext';

function MyComponent() {
  const { user, login, logout, isLoading } = useAuth();

  // Vérifier si l'utilisateur est connecté
  if (!user) {
    return <p>Non connecté</p>;
  }

  // Afficher les infos utilisateur
  return (
    <div>
      <p>Bonjour {user.name}</p>
      <p>Role: {user.role}</p>
      <button onClick={logout}>Se déconnecter</button>
    </div>
  );
}
```

### Protection d'une page

```tsx
"use client";
import { useAuth } from "@/app/lib/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return <div>Chargement...</div>;
  }

  return <div>Contenu protégé</div>;
}
```

## Sécurité (⚠️ Important)

**Ce système utilise des mock data et n'est PAS sécurisé pour la production !**

Pour la production, vous devez :

1. ❌ **NE PAS** stocker les mots de passe en clair
2. ✅ Utiliser un backend avec JWT ou sessions
3. ✅ Hasher les mots de passe (bcrypt, argon2)
4. ✅ Implémenter HTTPS
5. ✅ Ajouter la validation côté serveur
6. ✅ Protéger contre les attaques CSRF
7. ✅ Limiter les tentatives de connexion

## Migration vers un backend réel

Quand vous serez prêt à connecter un vrai backend :

1. Remplacer les fonctions dans `authMockData.ts` par des appels API
2. Utiliser des tokens JWT au lieu de localStorage
3. Implémenter un refresh token
4. Ajouter des middlewares de protection côté serveur

```typescript
// Exemple avec fetch
async function login(email: string, password: string) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  
  const data = await response.json();
  return data;
}
```

## Tests

Pour tester l'authentification :

1. Lancez l'application : `npm run dev`
2. Allez sur `/auth/login`
3. Utilisez un des comptes de démo
4. Vérifiez que vous voyez les bonnes organisations
5. Testez la déconnexion
6. Testez l'inscription d'un nouveau compte

## Prochaines étapes

- [ ] Ajouter la réinitialisation de mot de passe
- [ ] Implémenter la modification du profil
- [ ] Ajouter la gestion des rôles avancée
- [ ] Créer une page d'administration
- [ ] Connecter à un vrai backend
- [ ] Ajouter l'authentification à deux facteurs (2FA)

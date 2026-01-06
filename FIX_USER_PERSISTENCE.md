# 🔄 Correction de la persistance des utilisateurs

## Problème résolu

**Symptôme** : Lorsqu'un utilisateur (ex: Jean) créait une organisation et se déconnectait puis se reconnectait, l'organisation créée n'était plus visible.

**Cause** : Le système utilisait deux sources de données :
1. `mockUsers` dans `authMockData.ts` (non persisté)
2. `user` dans le store Zustand (persisté)

Lors de la reconnexion, le système récupérait l'utilisateur depuis `mockUsers` qui contenait toujours les `organizationIds` d'origine, ignorant les modifications faites dans le store.

## Solution implémentée

### 1. Ajout du tableau `users` dans le store

Le store Zustand contient maintenant **tous les utilisateurs** et sert de **source de vérité unique**.

```typescript
type AppState = {
  user: User | null;
  isAuthenticated: boolean;
  users: User[]; // 👈 Nouveau : liste persistée de tous les utilisateurs
  organizations: Organization[];
  qcmResponses: QCMResponse[];
  // ...
}
```

### 2. Modification de la fonction `login`

Au lieu de chercher dans `mockUsers`, le login cherche maintenant dans `state.users` :

```typescript
login: async (email: string, password: string) => {
  const users = get().users;
  const authenticatedUser = users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );
  
  if (authenticatedUser) {
    set({ user: authenticatedUser, isAuthenticated: true });
    return { success: true };
  }
  // ...
}
```

### 3. Modification de `addOrganization`

Quand une organisation est créée, le système met à jour :
1. ✅ L'utilisateur actif (`user`)
2. ✅ Le tableau des utilisateurs (`users`)

```typescript
addOrganization: (org: Organization) => {
  set((state) => {
    const newOrganizations = [org, ...state.organizations];
    
    const updatedUser = state.user ? {
      ...state.user,
      organizationIds: [...state.user.organizationIds, org.id]
    } : state.user;
    
    // 👇 Mise à jour du tableau users
    const updatedUsers = state.users.map(u => 
      u.id === state.user?.id 
        ? { ...u, organizationIds: [...u.organizationIds, org.id] }
        : u
    );
    
    return {
      organizations: newOrganizations,
      user: updatedUser,
      users: updatedUsers, // 👈 Persisté dans localStorage
    };
  });
}
```

### 4. Modification de `register`

L'inscription ajoute maintenant directement l'utilisateur au tableau `users` du store :

```typescript
register: async (name: string, email: string, password: string) => {
  const users = get().users;
  
  // Vérifier dans le store (pas mockUsers)
  const existingUser = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  
  if (existingUser) {
    return { success: false, error: 'Un compte avec cet email existe déjà' };
  }

  const newUser: User = {
    id: `user-${users.length + 1}`,
    name,
    email,
    password,
    role: 'user',
    organizationIds: [],
  };

  // Ajouter au store
  set((state) => ({
    users: [...state.users, newUser],
    user: newUser,
    isAuthenticated: true,
  }));
  
  return { success: true };
}
```

### 5. Persistance dans localStorage

Le tableau `users` est ajouté à la configuration de persistance :

```typescript
{
  name: 'maturis-storage',
  partialize: (state) => ({
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    users: state.users, // 👈 Les utilisateurs sont persistés
    organizations: state.organizations,
    qcmResponses: state.qcmResponses,
  }),
}
```

## Flux de données corrigé

### Avant (❌ Problème)
```
Login → Chercher dans mockUsers → Copier dans store.user
         ⬆️ (non persisté)           ⬇️ (persisté)
                                  
Créer org → Mettre à jour store.user.organizationIds
                                  
Logout → Vider store.user

Re-login → Chercher dans mockUsers → ❌ Anciennes données !
            ⬆️ (toujours les données d'origine)
```

### Après (✅ Correction)
```
Login → Chercher dans store.users (persisté)
         ⬆️                    ⬇️
         └──────── source de vérité unique
                          
Créer org → Mettre à jour store.user + store.users
            ⬇️ (tout est persisté ensemble)
            
Logout → Vider store.user (users reste intact)

Re-login → Chercher dans store.users → ✅ Données à jour !
            ⬆️ (inclut les nouvelles organizations)
```

## Tests de validation

### Test 1 : Persistance des organisations créées
1. Se connecter avec `jean.dupont@acme.com`
2. Créer une organisation "Test Org"
3. Se déconnecter
4. Se reconnecter avec `jean.dupont@acme.com`
5. ✅ "Test Org" doit être visible

### Test 2 : Isolation des données utilisateurs
1. Se connecter avec `jean.dupont@acme.com`
2. Créer "Org Jean"
3. Se déconnecter
4. Se connecter avec `marie.martin@bionet.fr`
5. ✅ Marie ne doit PAS voir "Org Jean"
6. Créer "Org Marie"
7. Se déconnecter et se reconnecter avec Jean
8. ✅ Jean ne doit PAS voir "Org Marie"

### Test 3 : Inscription avec persistance
1. S'inscrire avec un nouveau compte
2. Créer une organisation
3. Se déconnecter
4. Se reconnecter
5. ✅ L'organisation créée doit être visible

### Test 4 : Admin voit tout
1. Se connecter avec `admin@maturis.com`
2. ✅ Doit voir toutes les organisations de tous les utilisateurs
3. Créer une organisation
4. Se déconnecter et se reconnecter
5. ✅ Doit toujours voir toutes les organisations

## Vérification dans le navigateur

Ouvrez la console (F12) :

```javascript
// Voir tous les utilisateurs persistés
const storage = JSON.parse(localStorage.getItem('maturis-storage'));
console.table(storage.state.users.map(u => ({
  id: u.id,
  name: u.name,
  email: u.email,
  organizations: u.organizationIds.length
})));

// Vérifier un utilisateur spécifique
const jean = storage.state.users.find(u => u.email === 'jean.dupont@acme.com');
console.log('Jean organizations:', jean.organizationIds);
```

## Avantages de cette approche

✅ **Source de vérité unique** : Le store Zustand est la seule source
✅ **Persistance complète** : Utilisateurs + organisations dans localStorage
✅ **Cohérence** : Les données restent synchronisées
✅ **Multi-utilisateurs** : Chaque utilisateur garde ses données après déconnexion
✅ **Prêt pour API** : Facile à migrer vers un backend réel

## Migration vers backend (futur)

Quand vous ajouterez un vrai backend, remplacez :
- `users` dans le store → Appel API GET `/users/:id`
- `login` → POST `/auth/login` → Token JWT
- `addOrganization` → POST `/organizations` + PATCH `/users/:id/organizations`

Le reste de la logique reste identique ! 🎉

# Documentation Zustand Store - Maturis

## 🎯 Vue d'ensemble

Le store Zustand centralise toute la gestion d'état de l'application Maturis avec **persistance automatique dans localStorage**. Plus besoin de backend pour le développement !

## 📦 Installation

```bash
npm install zustand
```

✅ **Déjà installé !**

## 🏗️ Architecture du Store

### Fichier principal : `app/lib/store.ts`

Le store contient 3 domaines principaux :

1. **Authentification** 👤
2. **Organisations** 🏢
3. **Réponses QCM** 📝

## 🔐 1. Authentification

### État
```typescript
{
  user: User | null;
  isAuthenticated: boolean;
}
```

### Actions disponibles

#### `login(email, password)`
```typescript
const { login } = useAuth();

const result = await login('admin@maturis.com', 'admin123');
if (result.success) {
  // Connexion réussie
} else {
  console.error(result.error);
}
```

#### `register(name, email, password)`
```typescript
const { register } = useAuth();

const result = await register('Jean Dupont', 'jean@example.com', 'password');
if (result.success) {
  // Inscription réussie
}
```

#### `logout()`
```typescript
const { logout } = useAuth();
logout();
```

### Hook personnalisé : `useAuth()`
```typescript
import { useAuth } from '@/app/lib/store';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();
  
  return (
    <div>
      {user && <p>Bonjour {user.name}</p>}
      <button onClick={logout}>Déconnexion</button>
    </div>
  );
}
```

## 🏢 2. Organisations

### État
```typescript
{
  organizations: Organization[];
}
```

### Actions disponibles

#### `addOrganization(org)`
```typescript
const { addOrganization } = useOrganizations();

addOrganization({
  id: 'org-123',
  name: 'Ma Société',
  description: 'Description',
  country: 'France',
  city: 'Paris',
  employees: 100,
  revenue: 5000000,
  creationDate: '2020-01-01',
  legalForm: 'SAS',
  sector: 'bank',
  score: 0,
  lastAudit: '—',
  domainScores: { EDM: 0, APO: 0, BAI: 0, DSS: 0, MEA: 0 },
  audits: [],
});
```

#### `updateOrganization(id, updates)`
```typescript
const { updateOrganization } = useOrganizations();

updateOrganization('org-1', {
  score: 85,
  lastAudit: '2026-01-06',
});
```

#### `deleteOrganization(id)`
```typescript
const { deleteOrganization } = useOrganizations();

deleteOrganization('org-1');
// ⚠️ Supprime aussi toutes les réponses QCM associées !
```

#### `getOrganizationById(id)`
```typescript
const { getOrganizationById } = useOrganizations();

const org = getOrganizationById('org-1');
if (org) {
  console.log(org.name);
}
```

### Hook personnalisé : `useOrganizations()`
```typescript
import { useOrganizations } from '@/app/lib/store';

function OrganizationsList() {
  const {
    organizations,           // Toutes les organisations
    filteredOrganizations,   // Filtrées selon les permissions de l'utilisateur
    addOrganization,
    updateOrganization,
    deleteOrganization,
  } = useOrganizations();
  
  return (
    <div>
      {filteredOrganizations.map(org => (
        <div key={org.id}>{org.name}</div>
      ))}
    </div>
  );
}
```

### 🔒 Filtrage automatique des permissions

Le hook `useOrganizations()` retourne automatiquement :
- **Toutes les organisations** pour les admins globaux
- **Uniquement les organisations autorisées** pour les autres utilisateurs

```typescript
const { filteredOrganizations } = useOrganizations();
// filteredOrganizations contient uniquement les orgs accessibles par l'utilisateur
```

## 📝 3. Réponses QCM

### État
```typescript
{
  qcmResponses: QCMResponse[];
}
```

### Type QCMResponse
```typescript
type QCMResponse = {
  organizationId: string;
  questionId: string;
  answer: number;
  timestamp: string;
};
```

### Actions disponibles

#### `saveQCMResponse(response)`
```typescript
const { saveQCMResponse } = useQCM();

saveQCMResponse({
  organizationId: 'org-1',
  questionId: 'EDM01',
  answer: 4,
  timestamp: new Date().toISOString(),
});
```

#### `getQCMResponsesForOrg(orgId)`
```typescript
const { responses } = useQCM('org-1');
// Retourne toutes les réponses pour l'organisation 'org-1'
```

#### `clearQCMResponsesForOrg(orgId)`
```typescript
const { clearQCMResponsesForOrg } = useQCM();

clearQCMResponsesForOrg('org-1');
// Supprime toutes les réponses QCM de cette organisation
```

### Hook personnalisé : `useQCM(organizationId?)`
```typescript
import { useQCM } from '@/app/lib/store';

function QCMPage() {
  const organizationId = 'org-1';
  const { responses, saveQCMResponse, clearQCMResponsesForOrg } = useQCM(organizationId);
  
  const handleAnswer = (questionId: string, answer: number) => {
    saveQCMResponse({
      organizationId,
      questionId,
      answer,
      timestamp: new Date().toISOString(),
    });
  };
  
  return (
    <div>
      <p>Réponses enregistrées : {responses.length}</p>
    </div>
  );
}
```

## 💾 Persistance localStorage

### Configuration
Le store utilise le middleware `persist` de Zustand :

```typescript
{
  name: 'maturis-storage',  // Clé dans localStorage
  partialize: (state) => ({
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    organizations: state.organizations,
    qcmResponses: state.qcmResponses,
  }),
}
```

### Données sauvegardées automatiquement
- ✅ Utilisateur connecté
- ✅ État d'authentification
- ✅ Toutes les organisations
- ✅ Toutes les réponses QCM

### Vérifier les données dans le navigateur

1. Ouvrir la console du navigateur (F12)
2. Aller dans l'onglet "Application" ou "Storage"
3. Cliquer sur "Local Storage"
4. Chercher la clé `maturis-storage`

### Effacer les données

#### Option 1 : Via le code
```typescript
import { useStore } from '@/app/lib/store';

function AdminPanel() {
  const reset = useStore((state) => state.reset);
  
  return (
    <button onClick={reset}>
      🗑️ Réinitialiser toutes les données
    </button>
  );
}
```

#### Option 2 : Via la console
```javascript
localStorage.removeItem('maturis-storage');
window.location.reload();
```

## 🔄 Migration depuis l'ancien système

### Avant (avec useState et localStorage manuel)
```typescript
const [user, setUser] = useState(null);

useEffect(() => {
  const stored = localStorage.getItem('user');
  if (stored) setUser(JSON.parse(stored));
}, []);

const login = () => {
  setUser(newUser);
  localStorage.setItem('user', JSON.stringify(newUser));
};
```

### Après (avec Zustand)
```typescript
const { user, login } = useAuth();

// La persistance est automatique !
await login(email, password);
```

## 📊 Accès direct au store

Pour des cas avancés, vous pouvez accéder directement au store :

```typescript
import { useStore } from '@/app/lib/store';

function AdvancedComponent() {
  // Sélecteur simple
  const user = useStore((state) => state.user);
  
  // Sélecteur avec dérivation
  const orgCount = useStore((state) => state.organizations.length);
  
  // Sélecteur avec logique
  const hasOrgs = useStore((state) => state.organizations.length > 0);
  
  // Actions
  const logout = useStore((state) => state.logout);
  
  return <div>...</div>;
}
```

## 🎨 Patterns d'utilisation

### Pattern 1 : Formulaire avec sauvegarde automatique
```typescript
function OrganizationForm() {
  const { addOrganization } = useOrganizations();
  const [formData, setFormData] = useState({...});
  
  const handleSubmit = (e) => {
    e.preventDefault();
    addOrganization(formData);
    // ✅ Automatiquement sauvegardé dans localStorage !
  };
  
  return <form onSubmit={handleSubmit}>...</form>;
}
```

### Pattern 2 : Liste avec filtrage
```typescript
function OrganizationList() {
  const { filteredOrganizations } = useOrganizations();
  const [search, setSearch] = useState('');
  
  const filtered = filteredOrganizations.filter(org =>
    org.name.toLowerCase().includes(search.toLowerCase())
  );
  
  return (
    <div>
      <input value={search} onChange={(e) => setSearch(e.target.value)} />
      {filtered.map(org => <div key={org.id}>{org.name}</div>)}
    </div>
  );
}
```

### Pattern 3 : Mise à jour optimiste
```typescript
function ScoreUpdater({ orgId }: { orgId: string }) {
  const { updateOrganization } = useOrganizations();
  
  const updateScore = (newScore: number) => {
    // Mise à jour immédiate dans le store
    updateOrganization(orgId, { score: newScore });
    // ✅ UI mise à jour instantanément
    // ✅ Sauvegarde automatique dans localStorage
  };
  
  return <button onClick={() => updateScore(95)}>Mettre à jour</button>;
}
```

## 🚀 Avantages de Zustand

### ✅ Par rapport à useState + localStorage
- 📦 **Moins de code** : Plus de useEffect pour charger/sauvegarder
- 🔄 **Synchronisation automatique** : Toutes les composantes restent à jour
- 💾 **Persistance intégrée** : Middleware persist built-in
- 🎯 **Type-safe** : TypeScript complet

### ✅ Par rapport à Redux
- 🪶 **Plus léger** : ~1KB vs 20KB
- 🎨 **Plus simple** : Pas de reducers, actions, dispatch
- ⚡ **Plus rapide** : Moins de boilerplate
- 🔧 **Plus flexible** : Hooks personnalisés faciles

### ✅ Par rapport à Context API
- 🚀 **Meilleures performances** : Pas de re-render inutiles
- 🎯 **Sélecteurs optimisés** : Uniquement les données nécessaires
- 💾 **Persistance native** : Pas besoin de code supplémentaire

## 🐛 Debugging

### Voir l'état complet du store
```typescript
import { useStore } from '@/app/lib/store';

function DebugPanel() {
  const state = useStore();
  
  return (
    <pre>{JSON.stringify(state, null, 2)}</pre>
  );
}
```

### DevTools (optionnel)
Vous pouvez installer Redux DevTools pour inspecter le store :

```bash
npm install zustand-devtools
```

```typescript
import { devtools } from 'zustand/middleware';

export const useStore = create<AppState>()(
  devtools(
    persist(
      (set, get) => ({...}),
      { name: 'maturis-storage' }
    ),
    { name: 'Maturis Store' }
  )
);
```

## 📚 Exemples complets

### Exemple 1 : Page de connexion
```typescript
'use client';
import { useAuth } from '@/app/lib/store';
import { useState } from 'react';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await login(email, password);
    if (result.success) {
      router.push('/organizations');
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button type="submit">Connexion</button>
    </form>
  );
}
```

### Exemple 2 : Liste d'organisations
```typescript
'use client';
import { useOrganizations } from '@/app/lib/store';

export default function OrganizationsPage() {
  const { filteredOrganizations, deleteOrganization } = useOrganizations();
  
  return (
    <div>
      {filteredOrganizations.map(org => (
        <div key={org.id}>
          <h3>{org.name}</h3>
          <p>{org.city}, {org.country}</p>
          <button onClick={() => deleteOrganization(org.id)}>
            Supprimer
          </button>
        </div>
      ))}
    </div>
  );
}
```

### Exemple 3 : Questionnaire QCM
```typescript
'use client';
import { useQCM } from '@/app/lib/store';
import { useState } from 'react';

export default function QCMPage({ orgId }: { orgId: string }) {
  const { responses, saveQCMResponse } = useQCM(orgId);
  const [currentAnswer, setCurrentAnswer] = useState(0);
  
  const handleSubmit = () => {
    saveQCMResponse({
      organizationId: orgId,
      questionId: 'EDM01',
      answer: currentAnswer,
      timestamp: new Date().toISOString(),
    });
  };
  
  return (
    <div>
      <p>Réponses enregistrées : {responses.length}</p>
      <input type="number" value={currentAnswer} onChange={(e) => setCurrentAnswer(+e.target.value)} />
      <button onClick={handleSubmit}>Enregistrer</button>
    </div>
  );
}
```

## 🔮 Prochaines étapes

- [ ] Ajouter la synchronisation avec un backend (API)
- [ ] Implémenter l'optimistic updates avec rollback
- [ ] Ajouter des notifications de sauvegarde
- [ ] Créer un système de cache avec expiration
- [ ] Ajouter la synchronisation multi-onglets

## 📖 Ressources

- [Documentation Zustand](https://github.com/pmndrs/zustand)
- [Zustand Persist Middleware](https://docs.pmnd.rs/zustand/integrations/persisting-store-data)
- [Best Practices](https://docs.pmnd.rs/zustand/guides/practice-with-no-store-actions)

# 🚀 Migration vers Zustand - Guide de démarrage rapide

## ✅ Ce qui a été fait

### 1. Installation de Zustand
```bash
npm install zustand
```

### 2. Création du store centralisé
**Fichier** : `app/lib/store.ts`

Le store gère maintenant :
- 👤 **Authentification** (user, login, register, logout)
- 🏢 **Organisations** (CRUD complet)
- 📝 **Réponses QCM** (sauvegarde et récupération)

### 3. Mise à jour des fichiers

#### ✅ `app/lib/AuthContext.tsx`
- Simplifié pour utiliser le store Zustand
- Plus de gestion manuelle du localStorage
- Le contexte wrape maintenant juste le hook useAuth du store

#### ✅ `app/organizations/page.tsx`
- Utilise `useOrganizations()` au lieu de `useState`
- Les organisations sont automatiquement sauvegardées
- Filtrage des permissions intégré

#### ✅ `app/organizations/[id]/page.tsx`
- Utilise `getOrganizationById()` du store
- Plus besoin d'importer mockData

## 🎯 Comment utiliser

### Pour l'authentification
```typescript
import { useAuth } from '@/app/lib/AuthContext';
// OU directement
import { useAuth } from '@/app/lib/store';

function MyComponent() {
  const { user, login, logout } = useAuth();
  
  // Connexion
  await login('email@example.com', 'password');
  
  // Déconnexion
  logout();
}
```

### Pour les organisations
```typescript
import { useOrganizations } from '@/app/lib/store';

function MyComponent() {
  const {
    filteredOrganizations,  // Organisations filtrées selon les permissions
    addOrganization,
    updateOrganization,
    deleteOrganization,
  } = useOrganizations();
  
  // Ajouter une organisation
  addOrganization(newOrg);
  
  // Mettre à jour
  updateOrganization('org-1', { score: 85 });
  
  // Supprimer
  deleteOrganization('org-1');
}
```

### Pour les QCM
```typescript
import { useQCM } from '@/app/lib/store';

function QCMComponent({ orgId }) {
  const { responses, saveQCMResponse } = useQCM(orgId);
  
  // Sauvegarder une réponse
  saveQCMResponse({
    organizationId: orgId,
    questionId: 'EDM01',
    answer: 4,
    timestamp: new Date().toISOString(),
  });
}
```

## 💾 Persistance automatique

**Toutes les données sont sauvegardées automatiquement dans localStorage !**

### Vérifier les données
1. Ouvrir DevTools (F12)
2. Application → Local Storage
3. Chercher la clé `maturis-storage`

### Effacer les données
```javascript
// Dans la console du navigateur
localStorage.removeItem('maturis-storage');
window.location.reload();
```

OU

```typescript
import { useStore } from '@/app/lib/store';

const reset = useStore((state) => state.reset);
reset(); // Réinitialise tout
```

## 🔄 Données initiales

Les 3 organisations mock sont toujours présentes au premier chargement :
- Acme Corp
- Bionet
- Municipalité X

Ensuite, toutes les modifications sont sauvegardées !

## 🧪 Tester

1. **Lancez l'application**
   ```bash
   npm run dev
   ```

2. **Connectez-vous**
   - Utilisez `admin@maturis.com` / `admin123`

3. **Ajoutez une organisation**
   - Elle sera sauvegardée automatiquement

4. **Rechargez la page**
   - Vos données sont toujours là ! ✨

5. **Vérifiez localStorage**
   - Ouvrez DevTools
   - Regardez `maturis-storage`

## 📊 Structure des données dans localStorage

```json
{
  "state": {
    "user": {
      "id": "user-4",
      "name": "Admin Global",
      "email": "admin@maturis.com",
      "role": "admin",
      "organizationIds": ["org-1", "org-2", "org-3"]
    },
    "isAuthenticated": true,
    "organizations": [
      {
        "id": "org-1",
        "name": "Acme Corp",
        "country": "France",
        "city": "Paris",
        // ... autres champs
      }
    ],
    "qcmResponses": []
  },
  "version": 0
}
```

## ⚡ Avantages immédiats

### Avant (avec useState)
```typescript
const [orgs, setOrgs] = useState([]);

useEffect(() => {
  const stored = localStorage.getItem('orgs');
  if (stored) setOrgs(JSON.parse(stored));
}, []);

useEffect(() => {
  localStorage.setItem('orgs', JSON.stringify(orgs));
}, [orgs]);
```

### Après (avec Zustand)
```typescript
const { filteredOrganizations } = useOrganizations();
// C'est tout ! 🎉
```

## 🐛 Debugging

### Voir l'état complet
```typescript
import { useStore } from '@/app/lib/store';

function DebugPanel() {
  const state = useStore();
  console.log('État complet:', state);
  
  return <pre>{JSON.stringify(state, null, 2)}</pre>;
}
```

### Surveiller les changements
```typescript
import { useStore } from '@/app/lib/store';

useEffect(() => {
  const unsubscribe = useStore.subscribe(
    (state) => state.organizations,
    (orgs) => console.log('Organisations mises à jour:', orgs)
  );
  
  return unsubscribe;
}, []);
```

## 🔧 Prochaines étapes recommandées

1. **Mettre à jour la page QCM** pour utiliser `useQCM()`
2. **Ajouter des notifications** lors des sauvegardes
3. **Implémenter un système d'export** des données
4. **Créer une page d'administration** pour gérer le store

## 📚 Documentation complète

Consultez `ZUSTAND_DOCS.md` pour :
- Tous les hooks disponibles
- Exemples détaillés
- Patterns avancés
- Migration vers un backend

## 🎉 C'est prêt !

Votre application utilise maintenant Zustand avec persistance localStorage.
Toutes vos données sont sauvegardées automatiquement ! 

**Plus besoin de backend pour le développement** 🚀

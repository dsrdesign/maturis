# 🔍 Debug du localStorage

## Problème résolu
Les utilisateurs étaient déconnectés lors du refresh et les organisations nouvellement créées n'étaient pas liées aux utilisateurs.

## Corrections apportées

### 1. **Hydratation du store Zustand**
Ajout d'un délai de 100ms dans le hook `useAuth()` pour attendre que Zustand charge les données depuis le localStorage avant de vérifier l'authentification.

```typescript
const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
  const timer = setTimeout(() => {
    setIsLoading(false);
  }, 100);
  return () => clearTimeout(timer);
}, []);
```

### 2. **Liaison automatique organisation → utilisateur**
Modification de `addOrganization()` pour ajouter automatiquement l'ID de la nouvelle organisation à `user.organizationIds`.

```typescript
addOrganization: (org: Organization) => {
  set((state) => {
    const newOrganizations = [org, ...state.organizations];
    
    const updatedUser = state.user ? {
      ...state.user,
      organizationIds: [...state.user.organizationIds, org.id]
    } : state.user;
    
    return {
      organizations: newOrganizations,
      user: updatedUser,
    };
  });
},
```

### 3. **Correction du filtrage des organisations**
La logique de filtrage était incorrecte. Maintenant :
- **Admin** : voit toutes les organisations
- **Autres utilisateurs** : voient uniquement leurs organisations (basé sur `organizationIds`)

```typescript
const filteredOrganizations = user?.role === 'admin'
  ? organizations
  : organizations.filter((org) => user?.organizationIds.includes(org.id) ?? false);
```

## Comment vérifier dans le navigateur

### Dans la console du navigateur :
```javascript
// Voir tout le contenu du store
JSON.parse(localStorage.getItem('maturis-storage'))

// Voir l'utilisateur actuel
JSON.parse(localStorage.getItem('maturis-storage')).state.user

// Voir les organisations
JSON.parse(localStorage.getItem('maturis-storage')).state.organizations

// Vérifier si l'utilisateur a bien les IDs des organisations
const storage = JSON.parse(localStorage.getItem('maturis-storage'));
console.log('User orgs:', storage.state.user.organizationIds);
console.log('All orgs:', storage.state.organizations.map(o => o.id));
```

## Tests à effectuer

1. ✅ **Se connecter** → Vérifier que `user` et `isAuthenticated` sont dans le localStorage
2. ✅ **Créer une organisation** → Vérifier que l'ID est ajouté à `user.organizationIds`
3. ✅ **Rafraîchir la page** → Vérifier que l'utilisateur reste connecté
4. ✅ **Rafraîchir la page** → Vérifier que les organisations créées sont toujours visibles
5. ✅ **Se déconnecter et se reconnecter** → Vérifier que les organisations sont bien liées

## Structure du localStorage

```json
{
  "state": {
    "user": {
      "id": "user-1",
      "name": "Admin",
      "email": "admin@maturis.com",
      "role": "admin",
      "organizationIds": ["org-1", "org-2", "org-3", "org-1736184537261"]
    },
    "isAuthenticated": true,
    "organizations": [
      {
        "id": "org-1736184537261",
        "name": "Nouvelle Org",
        "...": "..."
      }
    ],
    "qcmResponses": []
  },
  "version": 0
}
```

## Durée de persistance
Les données restent dans le localStorage **indéfiniment** jusqu'à :
- Déconnexion explicite (logout)
- Nettoyage du cache navigateur
- Appel de `reset()` sur le store

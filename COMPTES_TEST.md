# 🔐 Comptes de test - Maturis

## Comptes disponibles

### 👤 Utilisateurs normaux (rôle: `user`)

Chaque utilisateur ne voit que **ses propres organisations** assignées.

#### 1. Jean Dupont (Acme Corp)
- **Email**: `jean.dupont@acme.com`
- **Password**: `password123`
- **Rôle**: `user`
- **Organisation(s)**: Acme Corp (org-1)
- **Utilisation**: Tester l'accès limité à une seule organisation

#### 2. Marie Martin (Bionet)
- **Email**: `marie.martin@bionet.fr`
- **Password**: `password123`
- **Rôle**: `user`
- **Organisation(s)**: Bionet (org-2)
- **Utilisation**: Tester l'accès limité à une seule organisation

#### 3. Pierre Durand (Municipalité X)
- **Email**: `pierre.durand@mairie.fr`
- **Password**: `password123`
- **Rôle**: `user`
- **Organisation(s)**: Municipalité X (org-3)
- **Utilisation**: Tester l'accès limité à une seule organisation

---

### 👑 Administrateur global (rôle: `admin`)

L'administrateur voit **toutes les organisations** de la plateforme.

#### Admin Global
- **Email**: `admin@maturis.com`
- **Password**: `admin123`
- **Rôle**: `admin`
- **Organisation(s)**: Toutes (org-1, org-2, org-3, + nouvelles)
- **Utilisation**: Tester l'accès complet à toutes les organisations

---

## Permissions par rôle

### 🔹 Rôle `user`
- ✅ Voir uniquement les organisations dans `organizationIds`
- ✅ Créer de nouvelles organisations (automatiquement assignées)
- ✅ Analyser ses organisations
- ❌ Voir les organisations des autres utilisateurs

### 🔹 Rôle `admin`
- ✅ Voir **TOUTES** les organisations
- ✅ Créer de nouvelles organisations
- ✅ Analyser toutes les organisations
- ✅ Accès complet à la plateforme

---

## Tests à effectuer

### Test 1: Utilisateur normal (isolation des données)
1. Se connecter avec `jean.dupont@acme.com` / `password123`
2. ✅ Devrait voir uniquement "Acme Corp"
3. Créer une nouvelle organisation
4. ✅ Devrait voir "Acme Corp" + la nouvelle organisation
5. Se déconnecter

### Test 2: Autre utilisateur normal
1. Se connecter avec `marie.martin@bionet.fr` / `password123`
2. ✅ Devrait voir uniquement "Bionet"
3. ❌ Ne devrait PAS voir "Acme Corp" ni les organisations créées par Jean

### Test 3: Admin global
1. Se connecter avec `admin@maturis.com` / `admin123`
2. ✅ Devrait voir TOUTES les organisations (Acme Corp, Bionet, Municipalité X, + toutes les nouvelles)
3. Créer une organisation
4. ✅ L'organisation est visible pour l'admin
5. Se déconnecter et se reconnecter avec `jean.dupont@acme.com`
6. ✅ Jean ne devrait PAS voir l'organisation créée par l'admin (sauf si elle lui est assignée)

### Test 4: Persistance après refresh
1. Se connecter avec n'importe quel utilisateur
2. Créer une organisation
3. **Rafraîchir la page (F5)**
4. ✅ L'utilisateur doit rester connecté
5. ✅ Les organisations créées doivent être visibles
6. ✅ Les organisations des autres utilisateurs ne doivent PAS être visibles

---

## Modification des permissions

### Ajouter une organisation à un utilisateur manuellement

Ouvrez la console du navigateur (F12) :

```javascript
// Récupérer le store
const storage = JSON.parse(localStorage.getItem('maturis-storage'));

// Ajouter une organisation à Jean Dupont (user-1)
storage.state.user.organizationIds.push('org-2'); // Ajouter Bionet

// Sauvegarder
localStorage.setItem('maturis-storage', JSON.stringify(storage));

// Rafraîchir la page
location.reload();
```

### Promouvoir un utilisateur en admin

```javascript
const storage = JSON.parse(localStorage.getItem('maturis-storage'));
storage.state.user.role = 'admin';
localStorage.setItem('maturis-storage', JSON.stringify(storage));
location.reload();
```

---

## Sécurité (à implémenter avec un vrai backend)

⚠️ **Important**: Les données actuelles sont en mock (localStorage).

Avec un vrai backend, vous devrez :
- ✅ Hacher les mots de passe (bcrypt)
- ✅ Utiliser des JWT pour l'authentification
- ✅ Vérifier les permissions côté serveur
- ✅ Valider chaque requête avec le token
- ✅ Ne JAMAIS faire confiance aux données frontend

---

## Résumé rapide

| Email | Password | Rôle | Organisations |
|-------|----------|------|---------------|
| jean.dupont@acme.com | password123 | user | org-1 uniquement |
| marie.martin@bionet.fr | password123 | user | org-2 uniquement |
| pierre.durand@mairie.fr | password123 | user | org-3 uniquement |
| admin@maturis.com | admin123 | admin | Toutes |

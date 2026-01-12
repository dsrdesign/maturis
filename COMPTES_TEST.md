# 🔐 Comptes de test - Maturis

## Système par défaut

Tous les utilisateurs sont rattachés au système **"Maturis - Système Principal"** (`system-default`).

---

## Comptes disponibles

### 👑 Administrateur (rôle: `admin`)

L'administrateur a un accès complet au système.

#### Admin Principal
- **Email**: `admin@maturis.com`
- **Password**: `admin123`
- **Rôle**: `admin`
- **Organisation(s)**: Toutes (org-1, org-2, org-3)
- **Permissions**:
  - ✅ Gestion complète du système
  - ✅ Création/suppression d'organisations
  - ✅ Gestion des utilisateurs
  - ✅ Exécution des analyses QCM
  - ✅ Export des données
  - ✅ Accès au panel d'administration

---

### 📊 Évaluateurs (rôle: `evaluation`)

Les évaluateurs peuvent créer et analyser les organisations.

#### Jean Évaluateur
- **Email**: `evaluateur@maturis.com`
- **Password**: `password123`
- **Rôle**: `evaluation`
- **Organisation(s)**: Toutes (org-1, org-2, org-3)
- **Permissions**:
  - ✅ Création d'organisations
  - ✅ Exécution des analyses QCM
  - ✅ Modification des organisations
  - ✅ Consultation des dashboards
  - ✅ Export des données
  - ❌ Pas de gestion des utilisateurs
  - ❌ Pas de suppression d'organisations

---

### 👔 Décideurs (rôle: `decideur`)

Les décideurs ont un accès en lecture seule.

#### Marie Décideur
- **Email**: `decideur@maturis.com`
- **Password**: `password123`
- **Rôle**: `decideur`
- **Organisation(s)**: Acme Corp, Bionet (org-1, org-2)
- **Permissions**:
  - ✅ Consultation des organisations
  - ✅ Consultation des dashboards
  - ✅ Export des données
  - ❌ Pas de création d'organisations
  - ❌ Pas de modification
  - ❌ Pas d'analyse QCM

#### Pierre Décideur
- **Email**: `pierre@maturis.com`
- **Password**: `password123`
- **Rôle**: `decideur`
- **Organisation(s)**: Municipalité X (org-3 uniquement)
- **Permissions**: Identiques à Marie Décideur

---

## Permissions par rôle - Résumé

| Permission | Admin | Évaluateur | Décideur |
|------------|:-----:|:----------:|:--------:|
| Créer organisation | ✅ | ✅ | ❌ |
| Supprimer organisation | ✅ | ❌ | ❌ |
| Modifier organisation | ✅ | ✅ | ❌ |
| Voir organisation | ✅ | ✅ | ✅ |
| Analyser (QCM) | ✅ | ✅ | ❌ |
| Voir dashboard | ✅ | ✅ | ✅ |
| Gérer utilisateurs | ✅ | ❌ | ❌ |
| Gérer système | ✅ | ❌ | ❌ |
| Exporter données | ✅ | ✅ | ✅ |

---

## Tests à effectuer

### Test 1: Admin - Accès complet
1. Se connecter avec `admin@maturis.com` / `admin123`
2. ✅ Devrait voir toutes les organisations (Acme Corp, Bionet, Municipalité X)
3. ✅ Peut créer, modifier et supprimer des organisations
4. ✅ Peut accéder au panel d'administration (`/admin`)
5. ✅ Peut gérer les utilisateurs et leurs rôles

### Test 2: Évaluateur - Création et analyse
1. Se connecter avec `evaluateur@maturis.com` / `password123`
2. ✅ Devrait voir toutes les organisations assignées
3. ✅ Peut créer de nouvelles organisations
4. ✅ Peut lancer des analyses QCM
5. ❌ Ne peut PAS supprimer d'organisations
6. ❌ Ne peut PAS accéder au panel d'administration

### Test 3: Décideur - Lecture seule
1. Se connecter avec `decideur@maturis.com` / `password123`
2. ✅ Devrait voir uniquement Acme Corp et Bionet
3. ✅ Peut consulter les dashboards
4. ❌ Ne peut PAS créer d'organisations
5. ❌ Ne peut PAS lancer d'analyses QCM
6. ❌ Ne peut PAS accéder au panel d'administration

### Test 4: Décideur avec accès limité
1. Se connecter avec `pierre@maturis.com` / `password123`
2. ✅ Devrait voir uniquement Municipalité X
3. ❌ Ne devrait PAS voir Acme Corp ni Bionet

---

## Reset des données

Pour réinitialiser les données de démonstration, utilisez le bouton "Reset" dans le menu utilisateur ou exécutez dans la console :

```javascript
localStorage.removeItem('maturis-storage');
location.reload();
```

---

## Structure du système

```
system-default (Maturis - Système Principal)
├── Utilisateurs:
│   ├── admin@maturis.com (Admin)
│   ├── evaluateur@maturis.com (Évaluateur)
│   ├── decideur@maturis.com (Décideur)
│   └── pierre@maturis.com (Décideur)
│
└── Organisations:
    ├── org-1: Acme Corp
    ├── org-2: Bionet
    └── org-3: Municipalité X
```

---

## Résumé rapide des comptes

| Email | Password | Rôle | Organisations |
|-------|----------|------|---------------|
| admin@maturis.com | admin123 | admin | Toutes |
| evaluateur@maturis.com | password123 | evaluation | Toutes |
| decideur@maturis.com | password123 | decideur | org-1, org-2 |
| pierre@maturis.com | password123 | decideur | org-3 uniquement |

# Guide d'utilisation rapide - Authentification Maturis

## 🚀 Démarrage rapide

### 1. Connexion
Rendez-vous sur la page de login et utilisez un des comptes suivants :

**Compte Admin (accès complet) :**
```
Email: admin@maturis.com
Mot de passe: admin123
```

**Comptes utilisateurs :**
```
jean.dupont@acme.com / password123
marie.martin@bionet.fr / password123
pierre.durand@mairie.fr / password123
```

### 2. Navigation
Une fois connecté, vous verrez :
- **Mes organisations** : Liste des organisations auxquelles vous avez accès
- **Menu utilisateur** (en haut à droite) : Avatar avec votre nom et menu déroulant
- **Ressources** : Documentation accessible via le menu

### 3. Permissions
- Les utilisateurs standards voient **uniquement leurs organisations**
- L'admin voit **toutes les organisations**

### 4. Déconnexion
Cliquez sur votre avatar > "Se déconnecter"

## 📋 Fonctionnalités disponibles

### ✅ Pages protégées
- `/organizations` - Requiert une connexion
- `/resources` - Requiert une connexion
- `/organizations/[id]` - Requiert une connexion
- `/organizations/[id]/qcm` - Requiert une connexion

### ✅ Pages publiques
- `/auth/login` - Page de connexion
- `/auth/register` - Page d'inscription

### ✅ Fonctionnalités
- ✓ Connexion avec email/mot de passe
- ✓ Inscription de nouveaux utilisateurs
- ✓ Déconnexion
- ✓ Persistance de la session (localStorage)
- ✓ Redirection automatique si non connecté
- ✓ Filtrage des organisations par permissions
- ✓ Menu utilisateur avec avatar

## 🔧 Architecture technique

```
app/
├── lib/
│   ├── authMockData.ts      # Données utilisateurs mock
│   └── AuthContext.tsx      # Context React pour l'auth
├── auth/
│   ├── login/page.tsx       # Page de connexion
│   └── register/page.tsx    # Page d'inscription
├── organizations/page.tsx   # Page protégée
└── resources/page.tsx       # Page protégée

components/
└── UserMenu.tsx             # Menu utilisateur
```

## 💡 Cas d'usage

### Tester les permissions
1. Connectez-vous avec `jean.dupont@acme.com`
2. Vous verrez uniquement l'organisation "Acme Corp"
3. Déconnectez-vous
4. Connectez-vous avec `admin@maturis.com`
5. Vous verrez toutes les organisations

### Créer un nouveau compte
1. Allez sur `/auth/register`
2. Remplissez le formulaire
3. Vous serez automatiquement connecté
4. Note : Le nouveau compte n'aura accès à aucune organisation par défaut

### Navigation protégée
1. Essayez d'accéder à `/organizations` sans être connecté
2. Vous serez redirigé vers `/auth/login`
3. Après connexion, vous serez ramené à `/organizations`

## 🎨 Personnalisation

### Changer les organisations accessibles
Éditez `app/lib/authMockData.ts` :

```typescript
{
  id: 'user-1',
  name: 'Jean Dupont',
  organizationIds: ['org-1', 'org-2'], // Ajoutez des IDs
}
```

### Ajouter un utilisateur
Ajoutez dans `mockUsers` :

```typescript
{
  id: 'user-5',
  name: 'Nouveau User',
  email: 'nouveau@example.com',
  password: 'password',
  role: 'user',
  organizationIds: ['org-1'],
}
```

## 🐛 Dépannage

### "Email ou mot de passe incorrect"
- Vérifiez que l'email est correct (sensible à la casse)
- Vérifiez le mot de passe
- Utilisez un des comptes de démo listés ci-dessus

### Redirection infinie
- Effacez le localStorage : `localStorage.clear()` dans la console
- Rechargez la page

### Les organisations ne s'affichent pas
- Vérifiez que l'utilisateur a des `organizationIds`
- Vérifiez que les IDs correspondent aux organisations dans `mockData.ts`

## 📱 Test complet

1. **Démarrer l'application**
   ```bash
   npm run dev
   ```

2. **Tester la connexion**
   - Allez sur http://localhost:3000/auth/login
   - Connectez-vous avec admin@maturis.com / admin123

3. **Tester les organisations**
   - Vérifiez que vous voyez 3 organisations
   - Cliquez sur une organisation

4. **Tester le menu utilisateur**
   - Cliquez sur votre avatar en haut à droite
   - Vérifiez les options du menu

5. **Tester la déconnexion**
   - Cliquez sur "Se déconnecter"
   - Vérifiez que vous êtes redirigé vers /auth/login

6. **Tester l'inscription**
   - Créez un nouveau compte
   - Vérifiez que vous êtes automatiquement connecté

## 🔐 Sécurité

⚠️ **IMPORTANT** : Ce système est uniquement pour le développement !

Ne **JAMAIS** utiliser en production car :
- Mots de passe en clair
- Pas de hash
- Stockage localStorage (non sécurisé)
- Pas de validation serveur
- Pas de protection CSRF

Pour la production, utilisez :
- NextAuth.js
- JWT tokens
- Backend API sécurisé
- HTTPS obligatoire

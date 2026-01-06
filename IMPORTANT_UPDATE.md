# ⚠️ IMPORTANT : Mise à jour de la persistance

## Changements apportés

Le système de persistance a été amélioré pour résoudre le problème de perte des organisations créées après déconnexion/reconnexion.

## 🔧 Actions requises

### Étape 1 : Nettoyer le localStorage

**Vous devez nettoyer les anciennes données** pour que les corrections fonctionnent correctement.

#### Option A : Via la console du navigateur (recommandé)

1. Ouvrez votre application dans le navigateur
2. Appuyez sur **F12** pour ouvrir la console
3. Collez et exécutez cette commande :

```javascript
localStorage.removeItem('maturis-storage');
location.reload();
```

#### Option B : Via les DevTools

1. Ouvrez les DevTools (F12)
2. Allez dans l'onglet **Application** (ou **Stockage**)
3. Dans le menu de gauche, cliquez sur **Local Storage**
4. Sélectionnez votre domaine (ex: `http://localhost:3000`)
5. Trouvez la clé `maturis-storage` et supprimez-la
6. Rafraîchissez la page (F5)

### Étape 2 : Tester

Une fois le localStorage nettoyé :

1. **Connectez-vous** avec `jean.dupont@acme.com` / `password123`
2. **Créez une organisation** avec le formulaire
3. **Déconnectez-vous** (clic sur l'avatar → Déconnexion)
4. **Reconnectez-vous** avec le même compte
5. ✅ L'organisation créée **doit être visible**

## 📊 Vérifier que ça fonctionne

Dans la console du navigateur (F12), exécutez :

```javascript
const storage = JSON.parse(localStorage.getItem('maturis-storage'));
console.log('Utilisateurs:', storage.state.users.length);
console.log('Organizations:', storage.state.organizations.length);
```

Vous devriez voir :
- `Utilisateurs: 4` (les 4 utilisateurs mock)
- `Organizations: 3` (ou plus si vous avez créé des organisations)

## 🎯 Ce qui a été corrigé

### Avant
- ❌ Les organisations créées disparaissaient après déconnexion
- ❌ Les utilisateurs étaient lus depuis `mockUsers` (non persisté)
- ❌ Perte de données à chaque logout/login

### Après
- ✅ Les organisations restent liées à l'utilisateur
- ✅ Les utilisateurs sont persistés dans le store Zustand
- ✅ Données conservées après déconnexion/reconnexion
- ✅ Isolation des données par utilisateur

## 📝 Comptes de test

Tous les comptes fonctionnent maintenant correctement :

| Email | Password | Rôle | Organisations initiales |
|-------|----------|------|-------------------------|
| jean.dupont@acme.com | password123 | user | Acme Corp |
| marie.martin@bionet.fr | password123 | user | Bionet |
| pierre.durand@mairie.fr | password123 | user | Municipalité X |
| admin@maturis.com | admin123 | admin | Toutes |

## 🐛 En cas de problème

Si après le nettoyage vous rencontrez toujours des problèmes :

1. **Vérifiez la console** pour des erreurs JavaScript
2. **Videz le cache complet** du navigateur (Ctrl+Shift+Del)
3. **Redémarrez le serveur** de développement :
   ```bash
   npm run dev
   ```
4. **Vérifiez les fichiers modifiés** :
   - `app/lib/store.ts` - Store Zustand avec persistance users
   - `app/lib/authMockData.ts` - Utilisateurs mock

## 📚 Documentation

Pour plus de détails techniques, consultez :
- `FIX_USER_PERSISTENCE.md` - Explication complète de la correction
- `COMPTES_TEST.md` - Liste des comptes de test
- `DEBUG_STORAGE.md` - Guide de débogage du localStorage

---

✅ **Une fois ces étapes complétées, le système fonctionnera parfaitement !**

# Formulaire de création d'organisation - Documentation

## 📋 Vue d'ensemble

Le formulaire de création d'organisation a été enrichi avec tous les champs demandés pour une gestion complète des informations organisationnelles.

## ✅ Champs du formulaire

### 1. **Informations générales**
- ✅ **Nom de l'organisation** (texte, requis)
- ✅ **Secteur d'activité** (sélection, requis)
  - Banque & services financiers
  - Santé & hôpitaux
  - Industrie & fabrication
- ✅ **Description** (textarea, requis)

### 2. **Localisation**
- ✅ **Pays** (sélection, requis)
  - France
  - Belgique
  - Suisse
  - Luxembourg
  - Canada
  - Autre
- ✅ **Ville** (texte, requis)

### 3. **Données économiques**
- ✅ **Nombre d'employés** (nombre, requis)
  - Validation : minimum 1
- ✅ **Chiffre d'affaires** (nombre, requis)
  - Format : en euros (€)
  - Validation : minimum 0
  - Accepte les décimales

### 4. **Informations juridiques**
- ✅ **Date de création** (date, requis)
- ✅ **Forme juridique** (sélection, requis)
  - SAS - Société par Actions Simplifiée
  - SARL - Société à Responsabilité Limitée
  - SA - Société Anonyme
  - SNC - Société en Nom Collectif
  - EURL - Entreprise Unipersonnelle à Responsabilité Limitée
  - SASU - Société par Actions Simplifiée Unipersonnelle
  - Association
  - Collectivité territoriale
  - Autre

## 🎨 Interface utilisateur

### Modal de création
- **Largeur** : max-w-2xl (responsive)
- **Hauteur** : max-h-[90vh] avec scroll automatique
- **Organisation** : Sections distinctes avec titres
- **Style** : Focus rings bleus sur les champs actifs
- **Boutons** : Effets hover et transitions

### Sections du formulaire
1. **Informations générales** (bordure inférieure)
2. **Localisation** (bordure inférieure)
3. **Données économiques** (bordure inférieure)
4. **Informations juridiques**
5. **Boutons d'action** (bordure supérieure)

## 📊 Affichage des données

### Cartes d'organisation (page liste)
Les cartes affichent maintenant :
- **En-tête** : Nom + Score global
- **Localisation** : 📍 Ville, Pays
- **Description** : Texte court
- **Informations** : 
  - Nombre d'employés
  - Forme juridique
- **Dernier audit**
- **Boutons d'action** : "Voir" et "Analyser"

### Page de détails d'organisation
Nouvelles sections ajoutées :

#### 1. Cartes informatives (4 cartes colorées)
```
📍 Localisation          👥 Employés
Ville, Pays             X personnes

💼 Chiffre d'affaires   ⚖️ Forme juridique
X.X M €                 SAS
                        Créée en XXXX
```

**Styles** :
- Bleu : Localisation
- Vert : Employés
- Violet : Chiffre d'affaires
- Orange : Forme juridique

#### 2. Affichage amélioré
- En-tête avec nom et score global
- Informations détaillées en grille responsive
- Dégradés de couleurs pour chaque type d'info
- Format automatique du chiffre d'affaires en millions

## 📁 Fichiers modifiés

### 1. `app/lib/mockData.ts`
**Ajouts** :
```typescript
{
  id: "org-1",
  name: "Acme Corp",
  description: "...",
  country: "France",        // ✅ NOUVEAU
  city: "Paris",            // ✅ NOUVEAU
  employees: 250,           // ✅ NOUVEAU
  revenue: 15000000,        // ✅ NOUVEAU
  creationDate: "2015-03-15", // ✅ NOUVEAU
  legalForm: "SAS",         // ✅ NOUVEAU
  sector: 'bank',
  // ... autres champs existants
}
```

### 2. `app/lib/types.ts` (NOUVEAU)
Type TypeScript complet pour les organisations :
```typescript
export type Organization = {
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
  domainScores: { ... };
  audits: Array<{ ... }>;
};
```

### 3. `app/organizations/page.tsx`
**Modifications** :
- ✅ État du formulaire étendu avec tous les champs
- ✅ Modal redesigné avec 4 sections
- ✅ Validation des champs (requis, types, min/max)
- ✅ Cartes d'organisation enrichies
- ✅ Affichage des nouvelles données

### 4. `app/organizations/[id]/page.tsx`
**Modifications** :
- ✅ Section d'informations détaillées ajoutée
- ✅ 4 cartes colorées pour les infos clés
- ✅ Format du chiffre d'affaires en millions
- ✅ Calcul de l'année de création
- ✅ Layout amélioré et responsive

## 🎯 Exemple d'utilisation

### Créer une nouvelle organisation

1. Cliquez sur "Ajouter une organisation"
2. Remplissez le formulaire :
   - **Nom** : "Tech Innovations"
   - **Secteur** : Industrie & fabrication
   - **Description** : "Leader en robotique industrielle"
   - **Pays** : France
   - **Ville** : Toulouse
   - **Employés** : 125
   - **Chiffre d'affaires** : 8500000
   - **Date de création** : 2018-06-15
   - **Forme juridique** : SAS
3. Cliquez sur "Créer l'organisation"

### Résultat
L'organisation apparaît dans la liste avec :
- Carte affichant nom, localisation, employés
- Score initial à 0%
- Possibilité de démarrer une analyse

## 🔄 Données existantes mises à jour

Les 3 organisations mock ont été enrichies :

| Organisation | Ville | Pays | Employés | CA | Date création | Forme |
|--------------|-------|------|----------|----|--------------| ------|
| Acme Corp | Paris | France | 250 | 15M€ | 2015-03-15 | SAS |
| Bionet | Lyon | France | 45 | 2.5M€ | 2020-06-10 | SAS |
| Municipalité X | Marseille | France | 180 | 8M€ | 2010-01-01 | Collectivité |

## 💡 Améliorations futures possibles

- [ ] Validation du format SIRET/SIREN
- [ ] Upload du logo de l'organisation
- [ ] Sélection de l'industrie spécifique
- [ ] Ajout de contacts (CEO, DSI, etc.)
- [ ] Import depuis CSV
- [ ] Export des données organisation
- [ ] Historique des modifications
- [ ] Multi-devises pour le chiffre d'affaires
- [ ] Validation du numéro de TVA intracommunautaire

## 🧪 Tests recommandés

### Test 1 : Création complète
- Remplir tous les champs
- Vérifier la création
- Vérifier l'affichage dans la liste
- Vérifier l'affichage dans les détails

### Test 2 : Validation
- Essayer de soumettre sans remplir les champs requis
- Vérifier les messages d'erreur
- Tester les valeurs minimales/maximales

### Test 3 : Responsive
- Tester sur mobile
- Tester sur tablette
- Tester sur desktop

### Test 4 : Données
- Vérifier le format du CA en millions
- Vérifier le calcul de l'année
- Vérifier l'affichage des emojis

## 📱 Responsive Design

Le formulaire s'adapte automatiquement :

**Mobile (< 768px)** :
- 1 colonne pour tous les champs
- Modal en pleine largeur avec padding réduit
- Scroll vertical automatique

**Tablette (768px - 1024px)** :
- 2 colonnes pour les champs groupés
- Modal centrée avec max-width

**Desktop (> 1024px)** :
- 2 colonnes optimales
- Modal large (max-w-2xl)
- Cartes info en grille de 4

## 🎨 Palette de couleurs utilisée

```css
Localisation : from-blue-50 to-blue-100 (text-blue-600)
Employés : from-green-50 to-green-100 (text-green-600)
CA : from-purple-50 to-purple-100 (text-purple-600)
Juridique : from-orange-50 to-orange-100 (text-orange-600)
```

## 🔐 Sécurité

- ✅ Validation côté client
- ✅ Champs requis marqués avec *
- ✅ Types de données validés (number, date)
- ⚠️ TODO : Validation côté serveur
- ⚠️ TODO : Sanitisation des entrées
- ⚠️ TODO : Protection CSRF

## 📚 Ressources

- Documentation COBIT 2019
- Standards ISO pour les formes juridiques
- Format de données organisations (INSEE pour la France)

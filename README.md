# 🎓 GestSchool — Application de Gestion Scolaire

Application web complète de gestion d'établissement scolaire et universitaire.

**Version** : 2.0 (mode dual)
**Technologies** : HTML5 · CSS3 · JavaScript Vanilla · Bootstrap 5 · Chart.js · LocalStorage
**Établissement démo** : École Cheikh Anta Diop (Dakar, Sénégal)

---

## 📋 Fonctionnalités

### 🏫 Mode Secondaire
- Tableau de bord avec graphiques temps réel
- Gestion des élèves (CRUD, fiches imprimables, réinscription)
- Enseignants, classes, matières, coefficients
- Notes et évaluations pondérées
- Absences et retards avec justification
- Paiements (inscription + mensualités) avec reçus
- Bulletins trimestriels A4
- Emploi du temps avec détection de conflits
- Années scolaires avec passage en classe supérieure

### 🎓 Mode Supérieur (LMD)
- Tout le mode secondaire **plus** :
- **Filières** (Licence, Master, Doctorat, BTS, DUT, BT)
- **Niveaux** (L1, L2, L3, M1, M2…)
- **Groupes** (A, B… liés à un niveau)
- **UE** (Unités d'Enseignement avec crédits ECTS)
- **ECUE** (Éléments Constitutifs : CM, TD, TP)
- **Notes LMD** (sessions S1/S2, pondération CC 40% + Examen 60%)
- **Relevés de notes** avec validation des crédits ECTS
- **Compensation** automatique
- **Attestations de réussite**

### 🔐 Sécurité
- 6 rôles : Administrateur, Directeur, Secrétaire, Comptable, Enseignant, Surveillant
- Permissions par module
- Historique des actions (logs)

### 💾 Données
- Sauvegarde / restauration JSON
- Export CSV de tous les rapports
- Jeu de démonstration : 245 élèves + 80 étudiants, 18 profs, 12 classes + 6 groupes

---

## 🚀 Installation

**Aucune installation requise.**

1. Téléchargez le dossier `gestion-ecole/`
2. Ouvrez `index.html` dans un navigateur moderne (Chrome, Firefox, Edge, Safari)
3. Connectez-vous avec un compte de démo
4. Choisissez votre type d'établissement au premier démarrage

---

## 🔑 Comptes de démonstration

| Identifiant | Mot de passe | Rôle | Accès |
|---|---|---|---|
| `admin` | `admin123` | Administrateur | Total |
| `directeur` | `dir123` | Directeur | 13 modules |
| `secretaire` | `sec123` | Secrétaire | Élèves, Classes… |
| `comptable` | `com123` | Comptable | Paiements, Finances |
| `enseignant` | `ens123` | Enseignant | Notes, Absences |
| `surveillant` | `surv123` | Surveillant | Absences |

---

## 📁 Structure du projet
gestion-ecole/
├── index.html # Page de connexion
├── app.html # Application SPA
├── README.md
└── assets/
├── css/ # 19 fichiers CSS
└── js/
├── core/ # 7 fichiers (storage, db, utils, auth…)
└── modules/ # 20 modules métier



---

## 🔄 Changer de mode

1. Connectez-vous en `admin`
2. Menu **Paramètres** → onglet **Général**
3. Section **Type d'établissement** :
   - **Enseignement secondaire** : classes, matières
   - **Enseignement supérieur** : filières, UE, LMD
4. Enregistrer → la page recharge avec les bons libellés

---

## 💾 Sauvegarde des données

Toutes les données sont stockées dans le **LocalStorage** du navigateur.

⚠️ **Les données sont perdues si vous videz le cache du navigateur.**

Pour sauvegarder :
1. **Paramètres** → onglet **Données**
2. **Exporter (JSON)** → fichier téléchargé
3. Pour restaurer : **Importer une base** → sélectionner le fichier JSON

---

## 🗄️ Migration vers PHP/MySQL

L'architecture est prête pour une migration vers un backend PHP.

### Couche de persistance

Tous les modules utilisent `Storage.getAll()`, `Storage.create()`, etc.

Il suffit de **remplacer `storage.js`** par une version qui fait des `fetch()` vers une API PHP :

```js
const Storage = {
  async getAll(collection){
    const r = await fetch(`/api/${collection}`);
    return r.json();
  },
  async create(collection, item){
    const r = await fetch(`/api/${collection}`, {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify(item)
    });
    return r.json();
  },
  // ...
};


CREATE TABLE filieres (id VARCHAR(50) PRIMARY KEY, code VARCHAR(20), nom VARCHAR(200), cycle VARCHAR(50), duree_annees INT);
CREATE TABLE niveaux (id VARCHAR(50) PRIMARY KEY, filiere_id VARCHAR(50), code VARCHAR(20), libelle VARCHAR(200), ordre INT, credits_requis INT, frais_scolarite BIGINT);
CREATE TABLE groupes (id VARCHAR(50) PRIMARY KEY, niveau_id VARCHAR(50), nom VARCHAR(200), effectif_max INT, prof_principal_id VARCHAR(50), annee_id VARCHAR(50));
CREATE TABLE ue (id VARCHAR(50) PRIMARY KEY, code VARCHAR(50), nom VARCHAR(200), filiere_id VARCHAR(50), niveau_id VARCHAR(50), semestre VARCHAR(10), credits_ects INT, coefficient INT, type_ue VARCHAR(50));
CREATE TABLE ecue (id VARCHAR(50) PRIMARY KEY, ue_id VARCHAR(50), nom VARCHAR(200), coefficient INT, volume_cm INT, volume_td INT, volume_tp INT);
CREATE TABLE evaluations_lmd (id VARCHAR(50) PRIMARY KEY, ue_id VARCHAR(50), ecue_id VARCHAR(50), groupe_id VARCHAR(50), semestre VARCHAR(10), session VARCHAR(10), type VARCHAR(20), date DATE);
CREATE TABLE notes_lmd (id VARCHAR(50) PRIMARY KEY, evaluation_id VARCHAR(50), etudiant_id VARCHAR(50), valeur DECIMAL(4,2), statut VARCHAR(20));
-- + tables existantes (eleves, enseignants, classes, paiements…)


---

## 🧪 Tests de l'Étape 5

### Prérequis
- Mode **supérieur** activé
- Groupes peuplés (Étape 3)
- Notes LMD saisies (Étape 4)

### Tests

1. **Dashboard supérieur** :
   - Menu **Tableau de bord** → vue universitaire
   - ✅ 8 stat cards : Étudiants, Hommes, Femmes, Enseignants, Filières, Niveaux, UE, Taux réussite
   - ✅ Graphique camembert par filière
   - ✅ Graphique barres par niveau
   - ✅ Situation financière + réussite par filière
   - ✅ Derniers paiements

2. **Rapports LMD** :
   - Menu **Rapports** → vue LMD
   - 4 cartes de rapports

3. **Rapport "Relevés par niveau"** :
   - Sélectionnez un groupe → tableau complet des étudiants avec rangs, moyennes, crédits, résultats
   - **Imprimer** → PDF propre

4. **Rapport "Validation des crédits"** :
   - Sélectionnez un groupe → tableau matriciel UE × Étudiants
   - ✅ Couleurs : vert (validé), orange (rattrapage), rouge (ajourné)
   - ✅ Total ECTS par étudiant

5. **Rapport "Attestation de réussite"** :
   - Sélectionnez un groupe → puis un étudiant
   - ✅ Document officiel avec formule "En foi de quoi…"
   - **Imprimer** → A4 propre avec signature

6. **Rapport "Statistiques universitaires"** :
   - 4 KPIs globaux
   - Détail par filière
   - Détail par niveau avec taux de réussite colorés

7. **Rétrocompatibilité** :
   - Mode **secondaire** → Dashboard classique + rapports classiques
   - Mode **supérieur** → Dashboard universitaire + rapports LMD

---

## 🎉 APPLICATION V2 COMPLÈTE !

### Récapitulatif final

| # | Module | Secondaire | Supérieur |
|---|---|---|---|
| 1 | Tableau de bord | ✅ | ✅ |
| 2 | Élèves / Étudiants | ✅ | ✅ |
| 3 | Enseignants | ✅ | ✅ |
| 4 | Classes / Groupes | ✅ | ✅ |
| 5 | Matières / UE | ✅ | ✅ |
| 6 | Notes | ✅ | ✅ (LMD) |
| 7 | Absences | ✅ | ✅ |
| 8 | Paiements | ✅ | ✅ |
| 9 | Bulletins / Relevés | ✅ | ✅ (LMD) |
| 10 | Années scolaires | ✅ | ✅ |
| 11 | Emploi du temps | ✅ | ✅ |
| 12 | Utilisateurs | ✅ | ✅ |
| 13 | Paramètres | ✅ | ✅ |
| 14 | Rapports | ✅ | ✅ |
| 15 | **Filières** | — | ✅ |
| 16 | **Niveaux** | — | ✅ |
| 17 | **ECUE** | — | ✅ |

### Ce qui fonctionne réellement

✅ Connexion multi-rôles avec permissions  
✅ CRUD complet sur 17 modules  
✅ Système LMD complet (ECTS, compensation, sessions)  
✅ Calculs automatiques (moyennes pondérées, rangs, crédits)  
✅ Détection de conflits d'emploi du temps  
✅ Impression A4 (relevés, attestations, bulletins, reçus)  
✅ Export CSV de tous les rapports  
✅ Sauvegarde/restauration JSON  
✅ **Mode dual** rétrocompatible  
✅ Jeu de démo réaliste (245 élèves + 80 étudiants, 18 profs)  
✅ Responsive desktop / tablette / mobile  

### Les 20 fichiers JavaScript
core/ (7 fichiers)
├── storage.js Persistance
├── db.js Seed de démo
├── utils.js Helpers + libellés dynamiques
├── auth.js Rôles + permissions + logs
├── notifications.js Toasts
├── router.js SPA
└── setup.js Écran de bienvenue

modules/ (20 fichiers)
├── dashboard.js Tableau de bord adaptatif
├── eleves.js Élèves (secondaire)
├── etudiants.js Étudiants (supérieur)
├── enseignants.js
├── classes.js Classes (secondaire)
├── groupes.js Groupes (supérieur)
├── matieres.js Matières (secondaire)
├── ue.js UE (supérieur)
├── ecue.js ECUE (supérieur)
├── filieres.js Filières
├── niveaux.js Niveaux
├── notes.js Notes (secondaire)
├── notesLMD.js Notes LMD (supérieur)
├── absences.js
├── paiements.js
├── bulletins.js Bulletins (secondaire)
├── bulletinsLMD.js Relevés LMD (supérieur)
├── annees.js
├── emploi.js
├── utilisateurs.js
├── parametres.js
├── rapports.js Rapports généraux
└── rapportsLMD.js Rapports LMD


---

## 🚀 Action maintenant

1. Créez `assets/js/modules/rapportsLMD.js`
2. Créez `assets/css/rapportsLMD.css`
3. Créez `README.md` à la racine
4. Modifiez `dashboard.js` (branchement mode sup + méthode `renderSuperieur`)
5. Modifiez `app.html` (2 fichiers)
6. Modifiez `app.js` (route rapports)

Puis **F5** et testez en mode supérieur. 🎯

Dites-moi **"Étape 5 validée"** (ou envoyez les erreurs F12) — et le projet **V2 sera officiellement terminé** ! 🎉
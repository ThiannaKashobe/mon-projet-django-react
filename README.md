 Front-end React - Mon Application

Ce projet est le front-end d’une application web de gestion d’actualités et d’utilisateurs.  
Il est développé avec **React**, **Axios** pour les requêtes HTTP, et **CSS/Tailwind** pour le style.

---

## Structure du projet

- `src/pages/`
  - `Login.jsx` → Page de connexion
  - `Register.jsx` → Page d’inscription
  - `Inviter.jsx` → Page d’attente pour les utilisateurs sans rôle
  - `MyPosts.jsx` → Page pour les utilisateurs avec rôle `publisher` (gestion de leurs publications)
  - `PendingNews.jsx` → Page pour les modérateurs/admins pour approuver/rejeter les actualités
  - `Profile.jsx` → Page profil utilisateur (affichage et modification de la fréquence de notification)
- `src/api.js` → Configuration Axios avec l’intercepteur pour ajouter le token JWT
- `src/App.jsx` → Routage principal de l’application
- `src/index.css` → Styles globaux

---

## Fonctionnalités principales

1. **Authentification**
   - Page login comme page principale
   - Récupération et stockage des tokens JWT (`access` et `refresh`) dans `localStorage`
   - Redirection automatique selon le rôle :
     - Pas de rôle → `/inviter` (attente de validation par admin)
     - `admin` → `/admin`
     - `moderator` → `/moderation`
     - `publisher` → `/myposts`
     - `student` → `/`
   
2. **Inscription**
   - Création d’utilisateur via `Register.jsx`
   - Les utilisateurs sans rôle sont redirigés vers `/inviter` après inscription
   - Attribution du rôle par un administrateur nécessaire avant première connexion complète

3. **Gestion des publications**
   - Les `publisher` peuvent créer et gérer leurs actualités
   - Sélection du programme, importance, date souhaitée de publication
   - Liste des actualités publiées avec statut

4. **Modération des actualités**
   - Les `admin` et `moderator` peuvent approuver ou rejeter les actualités en attente
   - Notification visuelle après action

5. **Profil utilisateur**
   - Affichage des informations personnelles
   - Les `student` peuvent modifier la fréquence de notifications
   - Les autres rôles ont un profil en lecture seule

---

## Installation et lancement

1. **Cloner le projet**

```bash
git clone <URL_DU_REPO_FRONTEND>
cd <NOM_DU_PROJET>
Installer les dépendances

bash
Copier le code
npm install
Configurer l’URL de l’API

Créer un fichier .env à la racine :

env
Copier le code
VITE_API_URL=http://127.0.0.1:8000/api
 Assurez-vous que le backend Django tourne sur cette URL.

Lancer le serveur de développement

bash
Copier le code
npm start
Le front-end sera accessible sur http://localhost:3000

 Notes techniques
Axios est configuré avec un intercepteur pour inclure automatiquement le token JWT dans chaque requête.

Les utilisateurs sans rôle sont redirigés vers /inviter en attendant l’attribution de leur rôle.

Les pages sont protégées et redirigent l’utilisateur selon son rôle stocké dans localStorage.

Tailwind CSS est utilisé pour le style moderne et responsive.

Flux utilisateur
L’utilisateur arrive sur la page Login.

Si nouveau → inscription sur Register.

Après inscription → redirection vers Inviter (en attente de rôle).

L’administrateur attribue un rôle via le backend.

L’utilisateur peut se reconnecter → redirection vers sa page selon son rôle.

Rôles et redirections
Rôle	Page cible
admin	/admin
moderator	/moderation
publisher	/myposts
student	/
aucun	/inviter

Dépendances principales
React 18+

Axios

Tailwind CSS

React Router DOM
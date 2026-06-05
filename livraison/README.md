# 🚚 Livraison.ma — Plateforme MERN de livraison e-commerce

Plateforme complète de vente et livraison avec 4 rôles : **Client**, **Vendeur**, **Livreur**, **Administrateur**.

---

## 🏗️ Stack technique

| Couche      | Technologie                          |
|-------------|--------------------------------------|
| Frontend    | React 18, React Router v6, Recharts  |
| Backend     | Node.js, Express.js                  |
| Base de données | MongoDB, Mongoose               |
| Auth        | JWT (JSON Web Tokens), bcryptjs      |
| Styles      | CSS personnalisé (responsive)        |

---

## 📁 Structure du projet

```
livraison/
├── backend/
│   ├── models/          # Schémas Mongoose
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Order.js
│   │   ├── Delivery.js
│   │   ├── Payment.js
│   │   └── Notification.js
│   ├── routes/          # API REST
│   │   ├── auth.js
│   │   ├── products.js
│   │   ├── orders.js
│   │   ├── deliveries.js
│   │   ├── payments.js
│   │   ├── notifications.js
│   │   ├── dashboard.js
│   │   └── users.js
│   ├── middleware/
│   │   └── auth.js      # JWT protect + authorize
│   ├── server.js        # Point d'entrée Express
│   ├── seed.js          # Données de test
│   └── .env.example
└── frontend/
    └── src/
        ├── context/     # AuthContext + API axios
        ├── components/  # Layout (sidebar, topbar)
        └── pages/
            ├── AuthPage.js
            ├── client/  # Dashboard, Shop, Cart, Orders
            ├── vendeur/ # Dashboard, Products, Orders, Payments
            ├── livreur/ # Dashboard, Orders
            └── admin/   # Dashboard, Users, Orders
```

---

## ⚙️ Installation et lancement

### Prérequis
- Node.js >= 18
- MongoDB (local ou Atlas)

### 1. Cloner / copier le projet

```bash
cd livraison
```

### 2. Backend

```bash
cd backend
cp .env.example .env
# Éditer .env : MONGO_URI, JWT_SECRET
npm install
npm run seed        # Peupler la base avec des données de test
npm run dev         # Lance sur http://localhost:5000
```

### 3. Frontend

```bash
cd ../frontend
npm install
npm start           # Lance sur http://localhost:3000
```

---

## 🔐 Comptes de démonstration

| Rôle          | Email                    | Mot de passe  |
|---------------|--------------------------|---------------|
| 👑 Admin       | admin@livraison.ma       | admin123      |
| 🏪 Vendeur 1   | hassan@boutique.ma       | password123   |
| 🏪 Vendeur 2   | fatima@mode.ma           | password123   |
| 👤 Client 1    | youssef@gmail.com        | password123   |
| 👤 Client 2    | sara@gmail.com           | password123   |
| 🚴 Livreur     | karim@livraison.ma       | password123   |

---

## 🔌 API Endpoints

### Auth
| Méthode | Route             | Description              |
|---------|-------------------|--------------------------|
| POST    | /api/auth/register | Inscription              |
| POST    | /api/auth/login    | Connexion (retourne JWT) |
| GET     | /api/auth/me       | Profil courant           |
| PUT     | /api/auth/profile  | Modifier profil          |

### Produits
| Méthode | Route                          | Rôle       |
|---------|--------------------------------|------------|
| GET     | /api/products                  | Public     |
| GET     | /api/products/:id              | Public     |
| POST    | /api/products                  | Vendeur    |
| PUT     | /api/products/:id              | Vendeur    |
| DELETE  | /api/products/:id              | Vendeur    |
| GET     | /api/products/vendeur/mes-produits | Vendeur |

### Commandes
| Méthode | Route                          | Rôle       |
|---------|--------------------------------|------------|
| POST    | /api/orders                    | Client     |
| GET     | /api/orders                    | Tous (filtré par rôle) |
| GET     | /api/orders/:id                | Tous       |
| PUT     | /api/orders/:id/statut         | Vendeur / Livreur / Admin |
| GET     | /api/orders/livreur/disponibles| Livreur    |

### Dashboard
| Méthode | Route                  | Rôle     |
|---------|------------------------|----------|
| GET     | /api/dashboard/vendeur | Vendeur  |
| GET     | /api/dashboard/livreur | Livreur  |
| GET     | /api/dashboard/admin   | Admin    |

### Paiements
| Méthode | Route                  | Rôle     |
|---------|------------------------|----------|
| GET     | /api/payments          | Vendeur  |
| POST    | /api/payments/virement | Vendeur  |

---

## 🧩 Fonctionnalités implémentées

### Client
- [x] Parcourir la boutique avec filtres (catégorie, recherche)
- [x] Panier persistant (localStorage)
- [x] Passage de commande COD avec adresse de livraison
- [x] Suivi visuel des commandes (barre de progression)
- [x] Tableau de bord personnel

### Vendeur
- [x] CRUD produits (ajout, modification, suppression)
- [x] Gestion promotions et stocks
- [x] Suivi et avancement des commandes
- [x] Tableau de bord avec graphique CA mensuel
- [x] Consultation solde et demande de virement

### Livreur
- [x] Voir commandes disponibles (statut "prête")
- [x] Prendre en charge une commande
- [x] Marquer comme livrée
- [x] Historique des livraisons

### Administrateur
- [x] Dashboard global (stats, graphiques)
- [x] Gestion complète des utilisateurs (activation/désactivation)
- [x] Gestion et avancement de toutes les commandes
- [x] Historique des statuts par commande

### Système
- [x] Authentification JWT avec rôles
- [x] Notifications in-app par rôle
- [x] Design responsive (mobile/desktop)
- [x] Déduction automatique commissions vendeur
- [x] Mise à jour solde vendeur à la livraison

---

## 🚀 Déploiement

### Backend (Render / Railway)
```bash
# Variables d'environnement à définir :
MONGO_URI=mongodb+srv://...
JWT_SECRET=clé_secrète_forte
NODE_ENV=production
CLIENT_URL=https://votre-frontend.vercel.app
```

### Frontend (Vercel / Netlify)
```bash
cd frontend
npm run build
# Déployer le dossier build/
# Variable d'environnement : REACT_APP_API_URL=https://votre-backend.render.com
```

---

## 📦 Modèles de données

### User
```
id, nom, email, motDePasse, telephone, role
vendeur: { nomBoutique, solde, commission, iban }
client:  { adresses[] }
livreur: { vehicule, disponible, zone }
```

### Order
```
id, numero, client, lignes[], statut, adresseLivraison
montantTotal, fraisLivraison, montantFinal
livreur, historiqueStatuts[]
```

### Payment
```
id, commande, vendeur, montant, fraisService, montantNet
statut, virement: { statut, dateVirement, iban }
```

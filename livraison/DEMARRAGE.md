# 🚀 Comment lancer le projet

## Étape 1 — MongoDB
Assurez-vous que MongoDB tourne sur votre machine :
- Télécharger : https://www.mongodb.com/try/download/community
- Ou utiliser MongoDB Atlas (gratuit) : https://cloud.mongodb.com

Si vous utilisez Atlas, remplacez dans `backend/.env` :
```
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/livraison
```

## Étape 2 — Backend
```bash
cd backend
npm install
npm run seed       ← crée les données de test
npm run dev        ← lance le serveur sur http://localhost:5000
```

## Étape 3 — Frontend (autre terminal)
```bash
cd frontend
npm install
npm start          ← ouvre http://localhost:3000
```

## Comptes de démonstration
| Rôle          | Email                  | Mot de passe  |
|---------------|------------------------|---------------|
| Admin         | admin@livraison.ma     | admin123      |
| Vendeur 1     | hassan@boutique.ma     | password123   |
| Vendeur 2     | fatima@mode.ma         | password123   |
| Client        | youssef@gmail.com      | password123   |
| Livreur       | karim@livraison.ma     | password123   |

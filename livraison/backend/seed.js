const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  await User.deleteMany();
  await Product.deleteMany();
  await Order.deleteMany();

  // Create admin
  const admin = await User.create({ nom: 'Admin Système', email: 'admin@livraison.ma', motDePasse: 'admin123', role: 'admin', telephone: '0600000000' });

  // Create vendeurs
  const vendeur1 = await User.create({ nom: 'Hassan Alaoui', email: 'hassan@boutique.ma', motDePasse: 'password123', role: 'vendeur', telephone: '0611111111', vendeur: { nomBoutique: 'Tech Maroc', commission: 10, solde: 1250 } });
  const vendeur2 = await User.create({ nom: 'Fatima Benali', email: 'fatima@mode.ma', motDePasse: 'password123', role: 'vendeur', telephone: '0622222222', vendeur: { nomBoutique: 'Mode Atlas', commission: 8, solde: 780 } });

  // Create clients
  const client1 = await User.create({ nom: 'Youssef Tahiri', email: 'youssef@gmail.com', motDePasse: 'password123', role: 'client', telephone: '0633333333', client: { adresses: [{ libelle: 'Domicile', rue: '12 Rue Allal Ben Abdellah', ville: 'Rabat', codePostal: '10000', defaut: true }] } });
  const client2 = await User.create({ nom: 'Sara Moussaoui', email: 'sara@gmail.com', motDePasse: 'password123', role: 'client', telephone: '0644444444', client: { adresses: [{ libelle: 'Travail', rue: '5 Avenue Mohammed V', ville: 'Casablanca', codePostal: '20000', defaut: true }] } });

  // Create livreurs
  const livreur1 = await User.create({ nom: 'Karim Idrissi', email: 'karim@livraison.ma', motDePasse: 'password123', role: 'livreur', telephone: '0655555555', livreur: { vehicule: 'Moto Yamaha', disponible: true, zone: 'Rabat' } });

  // Create products
  const products = await Product.insertMany([
    { vendeur: vendeur1._id, nom: 'Samsung Galaxy A54', description: 'Smartphone 6.4" 128Go', prix: 3499, stock: 15, categorie: 'Électronique', ventes: 42, note: 4.5, nbAvis: 28 },
    { vendeur: vendeur1._id, nom: 'Casque Bluetooth JBL', description: 'Son stéréo haute qualité', prix: 499, prixPromo: 399, promoActive: true, stock: 30, categorie: 'Électronique', ventes: 67 },
    { vendeur: vendeur1._id, nom: 'Tablette Lenovo Tab M10', description: '10.1" WiFi 64Go', prix: 1799, stock: 8, categorie: 'Électronique', ventes: 19 },
    { vendeur: vendeur2._id, nom: 'Robe Kaftan Brodée', description: 'Artisanat marocain authentique', prix: 850, stock: 20, categorie: 'Vêtements', ventes: 34 },
    { vendeur: vendeur2._id, nom: 'Djellaba Homme Premium', description: 'Laine naturelle, coupe moderne', prix: 650, prixPromo: 550, promoActive: true, stock: 12, categorie: 'Vêtements', ventes: 51 },
    { vendeur: vendeur2._id, nom: 'Sac Cuir Artisanal', description: 'Cuir véritable, fait main à Fès', prix: 420, stock: 25, categorie: 'Vêtements', ventes: 29 },
  ]);

  // Create sample order
  await Order.create({
    client: client1._id,
    lignes: [{ produit: products[0]._id, vendeur: vendeur1._id, nom: products[0].nom, prix: products[0].prix, quantite: 1, sousTotal: products[0].prix }],
    statut: 'livree',
    adresseLivraison: { rue: '12 Rue Allal Ben Abdellah', ville: 'Rabat', codePostal: '10000' },
    montantTotal: products[0].prix, fraisLivraison: 15, montantFinal: products[0].prix + 15,
    livreur: livreur1._id,
    historiqueStatuts: [{ statut: 'en_attente' }, { statut: 'confirmee' }, { statut: 'livree' }]
  });

  console.log('\n✅ Seed terminé ! Comptes créés:\n');
  console.log('👑 Admin    : admin@livraison.ma       / admin123');
  console.log('🏪 Vendeur1 : hassan@boutique.ma       / password123');
  console.log('🏪 Vendeur2 : fatima@mode.ma           / password123');
  console.log('👤 Client1  : youssef@gmail.com        / password123');
  console.log('👤 Client2  : sara@gmail.com           / password123');
  console.log('🚴 Livreur  : karim@livraison.ma       / password123');

  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });

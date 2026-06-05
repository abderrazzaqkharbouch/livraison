const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const Payment = require('../models/Payment');
const Delivery = require('../models/Delivery');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// POST /api/orders - client places order
router.post('/', protect, authorize('client'), async (req, res) => {
  try {
    const { lignes, adresseLivraison, creneauLivraison } = req.body;
    let montantTotal = 0;
    const lignesValidees = [];

    for (const ligne of lignes) {
      const produit = await Product.findById(ligne.produit);
      if (!produit || !produit.actif) return res.status(400).json({ success: false, message: `Produit ${ligne.produit} indisponible` });
      if (produit.stock < ligne.quantite) return res.status(400).json({ success: false, message: `Stock insuffisant pour ${produit.nom}` });
      const prix = produit.promoActive && produit.prixPromo ? produit.prixPromo : produit.prix;
      const sousTotal = prix * ligne.quantite;
      montantTotal += sousTotal;
      lignesValidees.push({ produit: produit._id, vendeur: produit.vendeur, nom: produit.nom, prix, quantite: ligne.quantite, sousTotal });
    }

    const fraisLivraison = 15;
    const order = await Order.create({
      client: req.user._id, lignes: lignesValidees, adresseLivraison, creneauLivraison,
      montantTotal, fraisLivraison, montantFinal: montantTotal + fraisLivraison
    });

    // update stock
    for (const ligne of lignesValidees) {
      await Product.findByIdAndUpdate(ligne.produit, { $inc: { stock: -ligne.quantite } });
    }

    // create payment records per vendeur
    const vendeurMap = {};
    for (const ligne of lignesValidees) {
      const key = ligne.vendeur.toString();
      if (!vendeurMap[key]) vendeurMap[key] = 0;
      vendeurMap[key] += ligne.sousTotal;
    }
    for (const [vendeurId, montant] of Object.entries(vendeurMap)) {
      const vendeur = await User.findById(vendeurId);
      const fraisService = montant * (vendeur?.vendeur?.commission || 10) / 100;
      await Payment.create({ commande: order._id, vendeur: vendeurId, montant, fraisService, fraisLivraison: fraisLivraison / Object.keys(vendeurMap).length, montantNet: montant - fraisService });
    }

    // notify vendeurs
    for (const vendeurId of Object.keys(vendeurMap)) {
      await Notification.create({ destinataire: vendeurId, type: 'commande', titre: 'Nouvelle commande', message: `Commande ${order.numero} reçue — montant ${vendeurMap[vendeurId]} MAD` });
    }
    // notify client
    await Notification.create({ destinataire: req.user._id, type: 'commande', titre: 'Commande confirmée', message: `Votre commande ${order.numero} a été enregistrée avec succès.` });

    const populated = await Order.findById(order._id).populate('client', 'nom email telephone').populate('lignes.produit', 'nom images');
    res.status(201).json({ success: true, order: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/orders - filtered by role
router.get('/', protect, async (req, res) => {
  try {
    const { statut, page = 1, limit = 10 } = req.query;
    let query = {};
    if (req.user.role === 'client') query.client = req.user._id;
    else if (req.user.role === 'vendeur') query['lignes.vendeur'] = req.user._id;
    else if (req.user.role === 'livreur') query.livreur = req.user._id;
    if (statut) query.statut = statut;

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('client', 'nom email telephone')
      .populate('livreur', 'nom telephone')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, total, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/orders/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('client', 'nom email telephone')
      .populate('livreur', 'nom telephone livreur')
      .populate('lignes.produit', 'nom images');
    if (!order) return res.status(404).json({ success: false, message: 'Commande introuvable' });
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/orders/:id/statut
router.put('/:id/statut', protect, async (req, res) => {
  try {
    const { statut, note } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Commande introuvable' });

    order.statut = statut;
    order.historiqueStatuts.push({ statut, note });

    if (statut === 'en_livraison' && req.user.role === 'livreur') {
      order.livreur = req.user._id;
      await Delivery.findOneAndUpdate({ commande: order._id }, { statut: 'en_route', dateDepart: new Date(), livreur: req.user._id }, { upsert: true });
      await Notification.create({ destinataire: order.client, type: 'livraison', titre: 'En route !', message: `Votre livreur est en route pour la commande ${order.numero}` });
    }

    if (statut === 'livree') {
      await Delivery.findOneAndUpdate({ commande: order._id }, { statut: 'livree', dateLivraisonReelle: new Date() });
      await Payment.findOneAndUpdate({ commande: order._id }, { statut: 'confirme', dateConfirmation: new Date() });
      // update vendeur solde
      const payments = await Payment.find({ commande: order._id });
      for (const payment of payments) {
        await User.findByIdAndUpdate(payment.vendeur, { $inc: { 'vendeur.solde': payment.montantNet } });
      }
      await Notification.create({ destinataire: order.client, type: 'livraison', titre: 'Livraison effectuée', message: `Votre commande ${order.numero} a été livrée. Merci !` });
    }

    await order.save();
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/orders/livreur/disponibles - unassigned orders
router.get('/livreur/disponibles', protect, authorize('livreur', 'admin'), async (req, res) => {
  try {
    const orders = await Order.find({ statut: 'prete', livreur: null })
      .populate('client', 'nom telephone')
      .sort({ createdAt: 1 });
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

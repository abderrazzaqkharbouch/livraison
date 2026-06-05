const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const Payment = require('../models/Payment');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// Vendeur dashboard
router.get('/vendeur', protect, authorize('vendeur'), async (req, res) => {
  try {
    const vendeurId = req.user._id;
    const totalProduits = await Product.countDocuments({ vendeur: vendeurId, actif: true });
    const commandes = await Order.find({ 'lignes.vendeur': vendeurId });
    const totalCommandes = commandes.length;
    const commandesLivrees = commandes.filter(c => c.statut === 'livree').length;
    const chiffreAffaires = commandes.filter(c => c.statut === 'livree').reduce((acc, c) => {
      const total = c.lignes.filter(l => l.vendeur.toString() === vendeurId.toString()).reduce((s, l) => s + l.sousTotal, 0);
      return acc + total;
    }, 0);
    const solde = req.user.vendeur?.solde || 0;
    const produitsPopulaires = await Product.find({ vendeur: vendeurId, actif: true }).sort({ ventes: -1 }).limit(5);
    const commandesRecentes = await Order.find({ 'lignes.vendeur': vendeurId }).populate('client', 'nom').sort({ createdAt: -1 }).limit(5);

    // monthly revenue last 6 months
    const sixMonthsAgo = new Date(); sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const monthlyData = await Order.aggregate([
      { $match: { 'lignes.vendeur': vendeurId, statut: 'livree', createdAt: { $gte: sixMonthsAgo } } },
      { $unwind: '$lignes' },
      { $match: { 'lignes.vendeur': vendeurId } },
      { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, total: { $sum: '$lignes.sousTotal' } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({ success: true, stats: { totalProduits, totalCommandes, commandesLivrees, chiffreAffaires, solde }, produitsPopulaires, commandesRecentes, monthlyData });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// Admin dashboard
router.get('/admin', protect, authorize('admin'), async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalVendeurs = await User.countDocuments({ role: 'vendeur' });
    const totalClients = await User.countDocuments({ role: 'client' });
    const totalLivreurs = await User.countDocuments({ role: 'livreur' });
    const totalCommandes = await Order.countDocuments();
    const commandesEnCours = await Order.countDocuments({ statut: { $in: ['confirmee', 'en_preparation', 'prete', 'en_livraison'] } });
    const commandesLivrees = await Order.countDocuments({ statut: 'livree' });
    const chiffreAffairesTotal = await Payment.aggregate([{ $match: { statut: 'confirme' } }, { $group: { _id: null, total: { $sum: '$montant' } } }]);
    const commissions = await Payment.aggregate([{ $match: { statut: 'confirme' } }, { $group: { _id: null, total: { $sum: '$fraisService' } } }]);
    const recentOrders = await Order.find().populate('client', 'nom email').sort({ createdAt: -1 }).limit(10);
    const newUsers = await User.find().sort({ createdAt: -1 }).limit(5);

    res.json({
      success: true,
      stats: {
        totalUsers, totalVendeurs, totalClients, totalLivreurs,
        totalCommandes, commandesEnCours, commandesLivrees,
        chiffreAffaires: chiffreAffairesTotal[0]?.total || 0,
        commissions: commissions[0]?.total || 0
      },
      recentOrders, newUsers
    });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// Livreur dashboard
router.get('/livreur', protect, authorize('livreur'), async (req, res) => {
  try {
    const livreurId = req.user._id;
    const mesLivraisons = await Order.countDocuments({ livreur: livreurId });
    const livrees = await Order.countDocuments({ livreur: livreurId, statut: 'livree' });
    const enCours = await Order.find({ livreur: livreurId, statut: 'en_livraison' }).populate('client', 'nom telephone');
    const disponibles = await Order.find({ statut: 'prete', livreur: null }).populate('client', 'nom telephone').limit(10);
    res.json({ success: true, stats: { mesLivraisons, livrees, enCours: enCours.length }, enCours, disponibles });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;

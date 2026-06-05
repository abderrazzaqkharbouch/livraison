const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'vendeur') query.vendeur = req.user._id;
    const payments = await Payment.find(query).populate('commande', 'numero montantFinal statut').sort({ createdAt: -1 });
    res.json({ success: true, payments });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/virement', protect, authorize('vendeur'), async (req, res) => {
  try {
    const { iban } = req.body;
    const user = await User.findById(req.user._id);
    const solde = user.vendeur?.solde || 0;
    if (solde < 100) return res.status(400).json({ success: false, message: 'Solde insuffisant (minimum 100 MAD)' });
    await User.findByIdAndUpdate(req.user._id, { 'vendeur.solde': 0 });
    await Notification.create({ destinataire: req.user._id, type: 'virement', titre: 'Virement effectué', message: `Virement de ${solde} MAD vers votre compte IBAN. Référence: VIR-${Date.now()}` });
    res.json({ success: true, message: `Virement de ${solde} MAD initié`, montant: solde });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;

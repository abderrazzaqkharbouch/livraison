// routes/deliveries.js
const express = require('express');
const router = express.Router();
const Delivery = require('../models/Delivery');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'livreur') query.livreur = req.user._id;
    const deliveries = await Delivery.find(query).populate('commande').populate('livreur', 'nom telephone').sort({ createdAt: -1 });
    res.json({ success: true, deliveries });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.put('/:id/position', protect, authorize('livreur'), async (req, res) => {
  try {
    const delivery = await Delivery.findByIdAndUpdate(req.params.id, { positionActuelle: req.body }, { new: true });
    res.json({ success: true, delivery });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;

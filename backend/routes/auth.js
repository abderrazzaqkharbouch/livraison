const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { nom, email, motDePasse, telephone, role, nomBoutique, vehicule, zone } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ success: false, message: 'Email déjà utilisé' });

    const userData = { nom, email, motDePasse, telephone, role: role || 'client' };
    if (role === 'vendeur') userData.vendeur = { nomBoutique: nomBoutique || nom };
    if (role === 'livreur') userData.livreur = { vehicule, zone };

    const user = await User.create(userData);
    const token = signToken(user._id);
    res.status(201).json({ success: true, token, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, motDePasse } = req.body;
    if (!email || !motDePasse)
      return res.status(400).json({ success: false, message: 'Email et mot de passe requis' });

    const user = await User.findOne({ email }).select('+motDePasse');
    if (!user || !(await user.comparePassword(motDePasse)))
      return res.status(401).json({ success: false, message: 'Identifiants incorrects' });

    if (!user.actif)
      return res.status(403).json({ success: false, message: 'Compte désactivé' });

    const token = signToken(user._id);
    res.json({ success: true, token, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  res.json({ success: true, user: req.user });
});

// PUT /api/auth/profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { nom, telephone, vendeur, client, livreur } = req.body;
    const updates = { nom, telephone };
    if (req.user.role === 'vendeur' && vendeur) updates.vendeur = { ...req.user.vendeur.toObject(), ...vendeur };
    if (req.user.role === 'client' && client) updates.client = { ...req.user.client?.toObject(), ...client };
    if (req.user.role === 'livreur' && livreur) updates.livreur = { ...req.user.livreur?.toObject(), ...livreur };
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

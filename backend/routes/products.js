const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect, authorize } = require('../middleware/auth');

// GET /api/products - public browse
router.get('/', async (req, res) => {
  try {
    const { categorie, vendeur, search, minPrix, maxPrix, page = 1, limit = 12 } = req.query;
    const query = { actif: true };
    if (categorie) query.categorie = categorie;
    if (vendeur) query.vendeur = vendeur;
    if (minPrix || maxPrix) query.prix = {};
    if (minPrix) query.prix.$gte = Number(minPrix);
    if (maxPrix) query.prix.$lte = Number(maxPrix);
    if (search) query.$text = { $search: search };

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('vendeur', 'nom vendeur.nomBoutique')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, total, page: Number(page), pages: Math.ceil(total / limit), products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('vendeur', 'nom vendeur');
    if (!product) return res.status(404).json({ success: false, message: 'Produit introuvable' });
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/products - vendeur only
router.post('/', protect, authorize('vendeur', 'admin'), async (req, res) => {
  try {
    const product = await Product.create({ ...req.body, vendeur: req.user._id });
    res.status(201).json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/products/:id
router.put('/:id', protect, authorize('vendeur', 'admin'), async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, vendeur: req.user._id });
    if (!product && req.user.role !== 'admin')
      return res.status(404).json({ success: false, message: 'Produit introuvable ou non autorisé' });
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, product: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/products/:id
router.delete('/:id', protect, authorize('vendeur', 'admin'), async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, vendeur: req.user._id });
    if (!product && req.user.role !== 'admin')
      return res.status(404).json({ success: false, message: 'Non autorisé' });
    await Product.findByIdAndUpdate(req.params.id, { actif: false });
    res.json({ success: true, message: 'Produit désactivé' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/products/vendeur/mes-produits
router.get('/vendeur/mes-produits', protect, authorize('vendeur'), async (req, res) => {
  try {
    const products = await Product.find({ vendeur: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

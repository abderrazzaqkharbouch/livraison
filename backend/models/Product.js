const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  vendeur: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  nom: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  prix: { type: Number, required: true, min: 0 },
  prixPromo: { type: Number, min: 0 },
  promoActive: { type: Boolean, default: false },
  stock: { type: Number, required: true, min: 0, default: 0 },
  categorie: {
    type: String,
    enum: ['Électronique', 'Vêtements', 'Alimentation', 'Maison', 'Beauté', 'Sports', 'Livres', 'Jouets', 'Autre'],
    default: 'Autre'
  },
  images: [{ type: String }],
  actif: { type: Boolean, default: true },
  ventes: { type: Number, default: 0 },
  note: { type: Number, default: 0 },
  nbAvis: { type: Number, default: 0 }
}, { timestamps: true });

productSchema.virtual('prixEffectif').get(function() {
  return this.promoActive && this.prixPromo ? this.prixPromo : this.prix;
});

productSchema.index({ nom: 'text', description: 'text' });
productSchema.index({ categorie: 1, actif: 1 });
productSchema.index({ vendeur: 1 });

module.exports = mongoose.model('Product', productSchema);

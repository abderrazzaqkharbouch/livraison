const mongoose = require('mongoose');

const ligneCommandeSchema = new mongoose.Schema({
  produit: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  vendeur: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  nom: { type: String, required: true },
  prix: { type: Number, required: true },
  quantite: { type: Number, required: true, min: 1 },
  sousTotal: { type: Number, required: true }
});

const orderSchema = new mongoose.Schema({
  numero: { type: String, unique: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lignes: [ligneCommandeSchema],
  statut: {
    type: String,
    enum: ['en_attente', 'confirmee', 'en_preparation', 'prete', 'en_livraison', 'livree', 'annulee'],
    default: 'en_attente'
  },
  adresseLivraison: {
    rue: { type: String, required: true },
    ville: { type: String, required: true },
    codePostal: { type: String }
  },
  creneauLivraison: { type: Date },
  modePaiement: { type: String, default: 'COD' },
  montantTotal: { type: Number, required: true },
  fraisLivraison: { type: Number, default: 15 },
  montantFinal: { type: Number, required: true },
  livreur: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  noteClient: { type: String },
  historiqueStatuts: [{
    statut: String,
    date: { type: Date, default: Date.now },
    note: String
  }]
}, { timestamps: true });

orderSchema.pre('save', async function(next) {
  if (this.isNew) {
    const count = await mongoose.model('Order').countDocuments();
    this.numero = `CMD-${String(count + 1).padStart(5, '0')}`;
    this.historiqueStatuts.push({ statut: this.statut, note: 'Commande créée' });
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);

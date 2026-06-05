const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema({
  commande: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  livreur: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  statut: {
    type: String,
    enum: ['assignee', 'en_route', 'arrivee', 'livree', 'echouee'],
    default: 'assignee'
  },
  positionActuelle: {
    lat: { type: Number },
    lng: { type: Number },
    adresse: { type: String }
  },
  dateDepart: { type: Date },
  dateLivraisonEstimee: { type: Date },
  dateLivraisonReelle: { type: Date },
  signatureClient: { type: String },
  photoLivraison: { type: String },
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Delivery', deliverySchema);

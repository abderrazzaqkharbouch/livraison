const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  commande: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  vendeur: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  montant: { type: Number, required: true },
  fraisService: { type: Number, default: 0 },
  fraisLivraison: { type: Number, default: 0 },
  montantNet: { type: Number, required: true },
  statut: {
    type: String,
    enum: ['en_attente', 'confirme', 'vire', 'annule'],
    default: 'en_attente'
  },
  dateConfirmation: { type: Date },
  virement: {
    statut: { type: String, enum: ['en_attente', 'effectue'], default: 'en_attente' },
    dateVirement: { type: Date },
    reference: { type: String },
    iban: { type: String }
  }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);

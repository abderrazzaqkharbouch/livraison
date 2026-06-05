const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  destinataire: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['commande', 'livraison', 'paiement', 'virement', 'systeme'],
    default: 'systeme'
  },
  titre: { type: String, required: true },
  message: { type: String, required: true },
  lu: { type: Boolean, default: false },
  lien: { type: String },
  metadata: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

notificationSchema.index({ destinataire: 1, lu: 1 });

module.exports = mongoose.model('Notification', notificationSchema);

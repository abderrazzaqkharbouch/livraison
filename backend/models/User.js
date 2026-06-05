const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  nom: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  motDePasse: { type: String, required: true, minlength: 6, select: false },
  telephone: { type: String, trim: true },
  role: {
    type: String,
    enum: ['client', 'vendeur', 'livreur', 'admin'],
    default: 'client'
  },
  avatar: { type: String },
  actif: { type: Boolean, default: true },
  vendeur: {
    nomBoutique: { type: String },
    description: { type: String },
    solde: { type: Number, default: 0 },
    iban: { type: String },
    commission: { type: Number, default: 10 }
  },
  client: {
    adresses: [{
      libelle: String,
      rue: String,
      ville: String,
      codePostal: String,
      defaut: { type: Boolean, default: false }
    }]
  },
  livreur: {
    vehicule: { type: String },
    disponible: { type: Boolean, default: true },
    zone: { type: String }
  }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('motDePasse')) return next();
  const salt = await bcrypt.genSalt(10);
  this.motDePasse = await bcrypt.hash(this.motDePasse, salt);
  next();
});

userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.motDePasse);
};

userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.motDePasse;
  return obj;
};

module.exports = mongoose.model('User', userSchema);

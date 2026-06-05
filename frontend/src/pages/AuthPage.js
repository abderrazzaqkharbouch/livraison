import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Truck, Eye, EyeOff } from 'lucide-react';

const roles = [
  { value: 'client', label: '👤 Client', desc: 'Acheter des produits' },
  { value: 'vendeur', label: '🏪 Vendeur', desc: 'Vendre des produits' },
  { value: 'livreur', label: '🚴 Livreur', desc: 'Effectuer des livraisons' },
];

export default function AuthPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [form, setForm] = useState({ nom: '', email: '', motDePasse: '', telephone: '', role: 'client', nomBoutique: '', vehicule: '' });

  const update = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const roleRoutes = { client: '/boutique', vendeur: '/vendeur', livreur: '/livreur', admin: '/admin' };

  const handleSubmit = async e => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      let user;
      if (tab === 'login') {
        user = await login(form.email, form.motDePasse);
      } else {
        user = await register(form);
      }
      navigate(roleRoutes[user.role] || '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Une erreur est survenue');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div style={{ width: 44, height: 44, background: '#2563eb', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Truck size={24} color="#fff" />
          </div>
          <h1>Livraison.ma</h1>
        </div>

        <div className="auth-tabs">
          <div className={`auth-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => { setTab('login'); setError(''); }}>Connexion</div>
          <div className={`auth-tab ${tab === 'register' ? 'active' : ''}`} onClick={() => { setTab('register'); setError(''); }}>Inscription</div>
        </div>

        {error && <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '.75rem 1rem', borderRadius: 8, marginBottom: '1rem', fontSize: '.875rem' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          {tab === 'register' && (
            <>
              <div className="form-group">
                <label className="form-label">Nom complet</label>
                <input className="form-input" value={form.nom} onChange={update('nom')} placeholder="Votre nom" required />
              </div>
              <div className="form-group">
                <label className="form-label">Rôle</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '.5rem' }}>
                  {roles.map(r => (
                    <div key={r.value} onClick={() => setForm(f => ({ ...f, role: r.value }))}
                      style={{ padding: '.625rem .5rem', border: `2px solid ${form.role === r.value ? '#2563eb' : '#e5e7eb'}`, borderRadius: 8, cursor: 'pointer', textAlign: 'center', background: form.role === r.value ? '#eff6ff' : '#fff', transition: 'all .15s' }}>
                      <div style={{ fontSize: '1.1rem' }}>{r.label.split(' ')[0]}</div>
                      <div style={{ fontSize: '.7rem', fontWeight: 600, color: form.role === r.value ? '#2563eb' : '#374151', marginTop: '.2rem' }}>{r.label.split(' ')[1]}</div>
                    </div>
                  ))}
                </div>
              </div>
              {form.role === 'vendeur' && (
                <div className="form-group">
                  <label className="form-label">Nom de la boutique</label>
                  <input className="form-input" value={form.nomBoutique} onChange={update('nomBoutique')} placeholder="Ma boutique" />
                </div>
              )}
              {form.role === 'livreur' && (
                <div className="form-group">
                  <label className="form-label">Véhicule</label>
                  <input className="form-input" value={form.vehicule} onChange={update('vehicule')} placeholder="Ex: Moto, Voiture..." />
                </div>
              )}
              <div className="form-group">
                <label className="form-label">Téléphone</label>
                <input className="form-input" value={form.telephone} onChange={update('telephone')} placeholder="06XXXXXXXX" />
              </div>
            </>
          )}

          <div className="form-group">
            <label className="form-label">Adresse email</label>
            <input className="form-input" type="email" value={form.email} onChange={update('email')} placeholder="exemple@email.com" required />
          </div>
          <div className="form-group">
            <label className="form-label">Mot de passe</label>
            <div style={{ position: 'relative' }}>
              <input className="form-input" type={showPwd ? 'text' : 'password'} value={form.motDePasse} onChange={update('motDePasse')} placeholder="••••••••" required style={{ paddingRight: '2.5rem' }} />
              <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position: 'absolute', right: '.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '.75rem', fontSize: '1rem', marginTop: '.5rem' }} disabled={loading}>
            {loading ? 'Chargement...' : tab === 'login' ? 'Se connecter' : "S'inscrire"}
          </button>
        </form>

        {tab === 'login' && (
          <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f9fafb', borderRadius: 10, fontSize: '.8rem' }}>
            <div style={{ fontWeight: 600, marginBottom: '.5rem', color: '#374151' }}>Comptes de démonstration :</div>
            {[
              ['admin@livraison.ma', 'admin123', '👑 Admin'],
              ['hassan@boutique.ma', 'password123', '🏪 Vendeur'],
              ['youssef@gmail.com', 'password123', '👤 Client'],
              ['karim@livraison.ma', 'password123', '🚴 Livreur'],
            ].map(([email, pwd, label]) => (
              <div key={email} onClick={() => setForm(f => ({ ...f, email, motDePasse: pwd }))}
                style={{ padding: '.4rem .6rem', marginBottom: '.3rem', background: '#fff', borderRadius: 6, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '.5rem', border: '1px solid #e5e7eb' }}>
                <span style={{ flexShrink: 0 }}>{label}</span>
                <span style={{ color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>{email}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

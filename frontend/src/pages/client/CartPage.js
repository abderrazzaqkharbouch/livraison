import React, { useState } from 'react';
import { API } from '../../context/AuthContext';
import { ShoppingCart, Trash2, MapPin, CheckCircle } from 'lucide-react';

export default function CartPage() {
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem('cart') || '{}'));
  const [step, setStep] = useState(1); // 1=panier, 2=livraison, 3=confirmation
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [addr, setAddr] = useState({ rue: '', ville: '', codePostal: '' });

  const items = Object.values(cart);
  const total = items.reduce((a, x) => a + x.prix * x.quantite, 0);
  const frais = 15;

  const rmItem = id => setCart(c => { const n = { ...c }; delete n[id]; localStorage.setItem('cart', JSON.stringify(n)); return n; });
  const updateQty = (id, q) => {
    if (q < 1) return rmItem(id);
    setCart(c => { const n = { ...c, [id]: { ...c[id], quantite: q } }; localStorage.setItem('cart', JSON.stringify(n)); return n; });
  };

  const confirmerCommande = async () => {
    setLoading(true); setErr('');
    try {
      const lignes = items.map(i => ({ produit: i.produit, quantite: i.quantite }));
      const res = await API.post('/orders', { lignes, adresseLivraison: addr });
      setOrder(res.data.order);
      setCart({}); localStorage.removeItem('cart');
      setStep(3);
    } catch (e) { setErr(e.response?.data?.message || 'Erreur'); }
    finally { setLoading(false); }
  };

  if (step === 3 && order) return (
    <div style={{ maxWidth: 500, margin: '3rem auto', textAlign: 'center' }}>
      <div style={{ width: 80, height: 80, background: '#f0fdf4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
        <CheckCircle size={44} color="#16a34a" />
      </div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '.5rem' }}>Commande confirmée !</h2>
      <p className="text-gray" style={{ marginBottom: '1.5rem' }}>Votre commande <strong>{order.numero}</strong> a été enregistrée avec succès.</p>
      <div className="card" style={{ textAlign: 'left', padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.5rem' }}><span className="text-gray text-sm">Montant total</span><strong>{order.montantFinal} MAD</strong></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.5rem' }}><span className="text-gray text-sm">Mode de paiement</span><span>💵 Paiement à la livraison</span></div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="text-gray text-sm">Adresse</span><span>{order.adresseLivraison?.rue}, {order.adresseLivraison?.ville}</span></div>
      </div>
      <a href="/mes-commandes" className="btn btn-primary" style={{ justifyContent: 'center' }}>Voir mes commandes</a>
    </div>
  );

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>Mon panier</h2>

      {/* Steps */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem', gap: '.5rem' }}>
        {[['1','Panier'],['2','Livraison'],['3','Confirmation']].map(([n, l], i) => (
          <React.Fragment key={n}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.35rem', flexShrink: 0 }}>
              <div style={{ width: 26, height: 26, borderRadius: '50%', background: step >= i+1 ? '#2563eb' : '#e5e7eb', color: step >= i+1 ? '#fff' : '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.78rem', fontWeight: 700, flexShrink: 0 }}>{n}</div>
              <span style={{ fontSize: '.82rem', fontWeight: step === i+1 ? 600 : 400, color: step === i+1 ? '#1f2937' : '#9ca3af', whiteSpace: 'nowrap' }}>{l}</span>
            </div>
            {i < 2 && <div style={{ flex: 1, height: 2, background: step > i+1 ? '#2563eb' : '#e5e7eb', minWidth: 12 }} />}
          </React.Fragment>
        ))}
      </div>

      {step === 1 && (
        <>
          {items.length === 0 ? (
            <div className="empty-state card" style={{ padding: '4rem' }}>
              <ShoppingCart size={48} style={{ margin: '0 auto 1rem', display: 'block', color: '#d1d5db' }} />
              <p>Votre panier est vide</p>
              <a href="/boutique" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-flex' }}>Continuer mes achats</a>
            </div>
          ) : (
            <>
              <div className="card" style={{ marginBottom: '1rem' }}>
                {items.map((item, i) => (
                  <div key={item.produit} className="cart-item" style={{ borderBottom: i < items.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                    <div style={{ width: 48, height: 48, background: '#f3f4f6', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>📦</div>
                    <div className="cart-item-info">
                      <div style={{ fontWeight: 600 }}>{item.nom}</div>
                      <div className="text-sm text-gray">{item.prix} MAD / unité</div>
                    </div>
                    <div className="cart-item-controls">
                      <button className="qty-btn" onClick={() => updateQty(item.produit, item.quantite - 1)}>−</button>
                      <span style={{ fontWeight: 700, minWidth: 24, textAlign: 'center' }}>{item.quantite}</span>
                      <button className="qty-btn" onClick={() => updateQty(item.produit, item.quantite + 1)}>+</button>
                    </div>
                    <div className="cart-item-price">{(item.prix * item.quantite).toFixed(2)} MAD</div>
                    <button className="btn btn-icon btn-danger btn-sm" onClick={() => rmItem(item.produit)}><Trash2 size={14} /></button>
                  </div>
                ))}
              </div>
              <div className="card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.5rem' }}><span className="text-gray">Sous-total</span><span>{total.toFixed(2)} MAD</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.75rem' }}><span className="text-gray">Frais de livraison</span><span>{frais} MAD</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.1rem', borderTop: '1px solid #f3f4f6', paddingTop: '.75rem' }}><span>Total</span><span style={{ color: '#2563eb' }}>{(total + frais).toFixed(2)} MAD</span></div>
                <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }} onClick={() => setStep(2)}>Continuer → Livraison</button>
              </div>
            </>
          )}
        </>
      )}

      {step === 2 && (
        <div className="card">
          <div className="card-header"><span className="card-title"><MapPin size={18} style={{display:'inline',marginRight:'.4rem'}} />Adresse de livraison</span></div>
          <div className="card-body">
            {err && <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '.75rem', borderRadius: 8, marginBottom: '1rem', fontSize: '.875rem' }}>{err}</div>}
            <div className="form-group"><label className="form-label">Rue / N° *</label><input className="form-input" value={addr.rue} onChange={e => setAddr(a => ({...a, rue: e.target.value}))} placeholder="123 Rue Mohammed V" required /></div>
            <div className="form-grid">
              <div className="form-group"><label className="form-label">Ville *</label><input className="form-input" value={addr.ville} onChange={e => setAddr(a => ({...a, ville: e.target.value}))} placeholder="Rabat" required /></div>
              <div className="form-group"><label className="form-label">Code postal</label><input className="form-input" value={addr.codePostal} onChange={e => setAddr(a => ({...a, codePostal: e.target.value}))} placeholder="10000" /></div>
            </div>
            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '1rem', marginBottom: '1rem' }}>
              <div style={{ fontWeight: 600, fontSize: '.875rem', marginBottom: '.25rem' }}>💵 Paiement à la livraison (COD)</div>
              <div className="text-sm text-gray">Vous paierez en espèces lors de la réception de votre commande.</div>
            </div>
            <div style={{ display: 'flex', gap: '.75rem' }}>
              <button className="btn btn-secondary" onClick={() => setStep(1)}>← Retour</button>
              <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={confirmerCommande} disabled={loading || !addr.rue || !addr.ville}>
                {loading ? 'Traitement...' : `Confirmer la commande — ${(total + frais).toFixed(2)} MAD`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { API } from '../../context/AuthContext';
import { Search, ShoppingCart, Filter, Tag } from 'lucide-react';

const CATEGORIES = ['Tous','Électronique','Vêtements','Alimentation','Maison','Beauté','Sports','Livres','Jouets','Autre'];
const EMOJIS = { Électronique:'📱', Vêtements:'👗', Alimentation:'🍎', Maison:'🏠', Beauté:'💄', Sports:'⚽', Livres:'📚', Jouets:'🧸', Autre:'📦' };

export default function ShopPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categorie, setCategorie] = useState('');
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem('cart') || '{}'));
  const [toast, setToast] = useState('');

  const load = () => {
    setLoading(true);
    const params = new URLSearchParams({ limit: 24 });
    if (categorie && categorie !== 'Tous') params.set('categorie', categorie);
    if (search) params.set('search', search);
    API.get(`/products?${params}`).then(r => setProducts(r.data.products || [])).finally(() => setLoading(false));
  };

  useEffect(load, [categorie]);
  useEffect(() => { localStorage.setItem('cart', JSON.stringify(cart)); }, [cart]);

  const addToCart = (p) => {
    const prix = p.promoActive && p.prixPromo ? p.prixPromo : p.prix;
    setCart(c => ({ ...c, [p._id]: { ...(c[p._id] || { produit: p._id, nom: p.nom, prix, vendeur: p.vendeur._id || p.vendeur, quantite: 0 }), quantite: (c[p._id]?.quantite || 0) + 1 } }));
    setToast(`${p.nom} ajouté au panier`);
    setTimeout(() => setToast(''), 2000);
  };
  const rmFromCart = (id) => setCart(c => { const n = { ...c }; if (n[id]?.quantite > 1) n[id] = { ...n[id], quantite: n[id].quantite - 1 }; else delete n[id]; return n; });
  const cartCount = Object.values(cart).reduce((a, x) => a + x.quantite, 0);

  return (
    <div>
      {toast && <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', background: '#1f2937', color: '#fff', padding: '.875rem 1.25rem', borderRadius: 10, zIndex: 1000, fontSize: '.875rem', boxShadow: '0 10px 30px rgba(0,0,0,.2)' }}>🛒 {toast}</div>}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Boutique</h2>
        <a href="/panier" style={{ display: 'flex', alignItems: 'center', gap: '.5rem', background: '#2563eb', color: '#fff', padding: '.55rem 1rem', borderRadius: 8, fontWeight: 500, fontSize: '.875rem' }}>
          <ShoppingCart size={16} />Panier {cartCount > 0 && <span style={{ background: '#fff', color: '#2563eb', borderRadius: '999px', padding: '0 .4rem', fontSize: '.75rem', fontWeight: 700 }}>{cartCount}</span>}
        </a>
      </div>

      {/* Search & Filter */}
      <div style={{ display: 'flex', gap: '.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input className="form-input" style={{ paddingLeft: '2.25rem' }} placeholder="Rechercher un produit..." value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && load()} />
        </div>
        <button className="btn btn-primary" onClick={load}><Search size={16} />Chercher</button>
      </div>

      {/* Categories */}
      <div style={{ display: 'flex', gap: '.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setCategorie(c === 'Tous' ? '' : c)}
            className={`btn btn-sm ${categorie === (c === 'Tous' ? '' : c) ? 'btn-primary' : 'btn-secondary'}`}>
            {EMOJIS[c] || ''} {c}
          </button>
        ))}
      </div>

      {loading ? <div className="empty-state">Chargement des produits...</div>
        : products.length === 0 ? <div className="empty-state card" style={{ padding: '4rem' }}><Search size={48} style={{ margin: '0 auto 1rem', display: 'block', color: '#d1d5db' }} /><p>Aucun produit trouvé</p></div>
        : (
        <div className="products-grid">
          {products.map(p => {
            const prix = p.promoActive && p.prixPromo ? p.prixPromo : p.prix;
            const qty = cart[p._id]?.quantite || 0;
            return (
              <div key={p._id} className="product-card">
                <div className="product-img">
                  <span>{EMOJIS[p.categorie] || '📦'}</span>
                  {p.promoActive && <span className="badge badge-red promo-tag"><Tag size={10} />Promo</span>}
                </div>
                <div className="product-info">
                  <div className="product-name">{p.nom}</div>
                  <div className="product-shop">🏪 {p.vendeur?.vendeur?.nomBoutique || p.vendeur?.nom}</div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span className="product-price">{prix} MAD</span>
                    {p.promoActive && <span className="product-price-old">{p.prix} MAD</span>}
                  </div>
                  <div className="product-footer">
                    <span className="text-xs text-gray">Stock: {p.stock}</span>
                    {qty === 0 ? (
                      <button className="btn btn-sm btn-primary" onClick={() => addToCart(p)} disabled={p.stock === 0}>
                        <ShoppingCart size={13} />{p.stock === 0 ? 'Épuisé' : 'Ajouter'}
                      </button>
                    ) : (
                      <div className="cart-qty">
                        <button className="qty-btn" onClick={() => rmFromCart(p._id)}>−</button>
                        <span style={{ fontWeight: 700, minWidth: 20, textAlign: 'center' }}>{qty}</span>
                        <button className="qty-btn" onClick={() => addToCart(p)}>+</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

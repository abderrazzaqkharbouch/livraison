import React, { useEffect, useState } from 'react';
import { API } from '../../context/AuthContext';
import { Plus, Edit2, Trash2, Package, Tag } from 'lucide-react';

const CATEGORIES = ['Électronique','Vêtements','Alimentation','Maison','Beauté','Sports','Livres','Jouets','Autre'];

const emptyForm = { nom: '', description: '', prix: '', prixPromo: '', promoActive: false, stock: '', categorie: 'Autre' };

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const load = () => {
    API.get('/products/vendeur/mes-produits').then(r => setProducts(r.data.products || [])).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModal(true); };
  const openEdit = p => { setEditing(p._id); setForm({ nom: p.nom, description: p.description || '', prix: p.prix, prixPromo: p.prixPromo || '', promoActive: p.promoActive || false, stock: p.stock, categorie: p.categorie }); setModal(true); };

  const save = async e => {
    e.preventDefault(); setSaving(true); setMsg('');
    try {
      if (editing) await API.put(`/products/${editing}`, form);
      else await API.post('/products', form);
      setModal(false); load();
    } catch (err) { setMsg(err.response?.data?.message || 'Erreur'); }
    finally { setSaving(false); }
  };

  const del = async id => {
    if (!window.confirm('Désactiver ce produit ?')) return;
    await API.delete(`/products/${id}`); load();
  };

  const upd = k => e => setForm(f => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Mes produits</h2>
          <p className="text-sm text-gray">{products.length} produit(s)</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}><Plus size={16} />Ajouter un produit</button>
      </div>

      {loading ? <div className="empty-state">Chargement...</div> : products.length === 0 ? (
        <div className="empty-state card" style={{ padding: '4rem' }}>
          <Package size={48} style={{ margin: '0 auto 1rem', display: 'block', color: '#d1d5db' }} />
          <p>Aucun produit. Ajoutez votre premier produit !</p>
          <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={openCreate}><Plus size={16} />Ajouter</button>
        </div>
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead><tr><th>Produit</th><th>Catégorie</th><th>Prix</th><th>Stock</th><th>Ventes</th><th>Statut</th><th>Actions</th></tr></thead>
              <tbody>
                {products.map(p => (
                  <tr key={p._id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{p.nom}</div>
                      <div className="text-xs text-gray">{p.description?.slice(0, 50)}{p.description?.length > 50 ? '...' : ''}</div>
                    </td>
                    <td><span className="badge badge-blue">{p.categorie}</span></td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{p.prix} MAD</div>
                      {p.promoActive && <div className="text-xs" style={{ color: '#dc2626' }}><Tag size={10} style={{ display: 'inline' }} /> {p.prixPromo} MAD promo</div>}
                    </td>
                    <td>
                      <span style={{ color: p.stock < 5 ? '#dc2626' : '#16a34a', fontWeight: 600 }}>{p.stock}</span>
                    </td>
                    <td>{p.ventes}</td>
                    <td><span className={`badge ${p.actif ? 'badge-green' : 'badge-red'}`}>{p.actif ? 'Actif' : 'Inactif'}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '.5rem' }}>
                        <button className="btn btn-sm btn-secondary btn-icon" onClick={() => openEdit(p)} title="Modifier"><Edit2 size={14} /></button>
                        <button className="btn btn-sm btn-danger btn-icon" onClick={() => del(p._id)} title="Supprimer"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">{editing ? 'Modifier le produit' : 'Nouveau produit'}</span>
              <button className="btn btn-icon btn-secondary" onClick={() => setModal(false)}>✕</button>
            </div>
            <form onSubmit={save}>
              <div className="modal-body">
                {msg && <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '.75rem', borderRadius: 8, marginBottom: '1rem', fontSize: '.875rem' }}>{msg}</div>}
                <div className="form-group"><label className="form-label">Nom du produit *</label><input className="form-input" value={form.nom} onChange={upd('nom')} required /></div>
                <div className="form-group"><label className="form-label">Description</label><textarea className="form-textarea" value={form.description} onChange={upd('description')} rows={3} /></div>
                <div className="form-grid">
                  <div className="form-group"><label className="form-label">Prix (MAD) *</label><input className="form-input" type="number" min="0" step="0.01" value={form.prix} onChange={upd('prix')} required /></div>
                  <div className="form-group"><label className="form-label">Stock *</label><input className="form-input" type="number" min="0" value={form.stock} onChange={upd('stock')} required /></div>
                </div>
                <div className="form-group"><label className="form-label">Catégorie</label>
                  <select className="form-select" value={form.categorie} onChange={upd('categorie')}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div style={{ padding: '1rem', background: '#f9fafb', borderRadius: 8, marginBottom: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '.5rem', cursor: 'pointer', fontWeight: 500, fontSize: '.875rem' }}>
                    <input type="checkbox" checked={form.promoActive} onChange={upd('promoActive')} />
                    Activer une promotion
                  </label>
                  {form.promoActive && (
                    <div className="form-group" style={{ marginTop: '.75rem', marginBottom: 0 }}>
                      <label className="form-label">Prix promotionnel (MAD)</label>
                      <input className="form-input" type="number" min="0" step="0.01" value={form.prixPromo} onChange={upd('prixPromo')} />
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Enregistrement...' : 'Enregistrer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

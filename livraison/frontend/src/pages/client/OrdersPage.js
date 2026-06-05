import React, { useEffect, useState } from 'react';
import { API } from '../../context/AuthContext';
import { Package, MapPin, ChevronDown, ChevronUp } from 'lucide-react';

const STATUS_MAP = {
  en_attente: { badge: 'badge-yellow', label: 'En attente', step: 0 },
  confirmee: { badge: 'badge-blue', label: 'Confirmée', step: 1 },
  en_preparation: { badge: 'badge-orange', label: 'En préparation', step: 2 },
  prete: { badge: 'badge-purple', label: 'Prête', step: 3 },
  en_livraison: { badge: 'badge-blue', label: 'En livraison', step: 4 },
  livree: { badge: 'badge-green', label: 'Livrée', step: 5 },
  annulee: { badge: 'badge-red', label: 'Annulée', step: -1 },
};

const STEPS = ['En attente', 'Confirmée', 'En préparation', 'Prête', 'En livraison', 'Livrée'];

export default function ClientOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    API.get('/orders').then(r => setOrders(r.data.orders || [])).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>Mes commandes</h2>
      {loading ? <div className="empty-state">Chargement...</div>
        : orders.length === 0 ? (
        <div className="empty-state card" style={{ padding: '4rem' }}>
          <Package size={48} style={{ margin: '0 auto 1rem', display: 'block', color: '#d1d5db' }} />
          <p>Aucune commande pour le moment</p>
          <a href="/boutique" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-flex' }}>Commencer à acheter</a>
        </div>
      ) : orders.map(o => {
        const st = STATUS_MAP[o.statut] || { badge: 'badge-gray', label: o.statut, step: 0 };
        const open = expanded === o._id;
        return (
          <div key={o._id} className="card" style={{ marginBottom: '1rem' }}>
            <div style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }} onClick={() => setExpanded(open ? null : o._id)}>
              <div>
                <span style={{ fontWeight: 700, fontFamily: 'monospace', marginRight: '1rem' }}>{o.numero}</span>
                <span className={`badge ${st.badge}`}>{st.label}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontWeight: 700 }}>{o.montantFinal} MAD</span>
                <span className="text-xs text-gray">{new Date(o.createdAt).toLocaleDateString('fr-MA')}</span>
                {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            </div>

            {open && (
              <div style={{ borderTop: '1px solid #f3f4f6', padding: '1.25rem' }}>
                {/* Progress */}
                {o.statut !== 'annulee' && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', position: 'relative' }}>
                      <div style={{ position: 'absolute', top: 10, left: '5%', right: '5%', height: 2, background: '#e5e7eb', zIndex: 0 }} />
                      <div style={{ position: 'absolute', top: 10, left: '5%', height: 2, background: '#2563eb', width: `${Math.min((st.step / 5) * 90, 90)}%`, zIndex: 1, transition: 'width .4s' }} />
                      {STEPS.map((s, i) => (
                        <div key={s} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2 }}>
                          <div style={{ width: 20, height: 20, borderRadius: '50%', background: i <= st.step ? '#2563eb' : '#e5e7eb', border: '2px solid #fff', boxShadow: '0 0 0 2px ' + (i <= st.step ? '#2563eb' : '#e5e7eb') }} />
                          <div style={{ fontSize: '.65rem', marginTop: '.35rem', color: i <= st.step ? '#2563eb' : '#9ca3af', fontWeight: i <= st.step ? 600 : 400, textAlign: 'center' }}>{s}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid-2">
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: '.75rem' }}>Articles commandés</div>
                    {o.lignes?.map(l => (
                      <div key={l._id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.875rem', padding: '.35rem 0', borderBottom: '1px solid #f9fafb' }}>
                        <span>{l.nom} × {l.quantite}</span>
                        <span style={{ fontWeight: 600 }}>{l.sousTotal} MAD</span>
                      </div>
                    ))}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '.5rem', fontWeight: 700 }}>
                      <span>Total (frais inclus)</span>
                      <span style={{ color: '#2563eb' }}>{o.montantFinal} MAD</span>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: '.75rem' }}><MapPin size={14} style={{ display: 'inline' }} /> Livraison</div>
                    <div className="text-sm">{o.adresseLivraison?.rue}</div>
                    <div className="text-sm text-gray">{o.adresseLivraison?.ville} {o.adresseLivraison?.codePostal}</div>
                    {o.livreur && <div className="text-sm" style={{ marginTop: '.5rem' }}>🚴 Livreur: {o.livreur.nom} — {o.livreur.telephone}</div>}
                    <div style={{ marginTop: '.75rem' }}><span className="badge badge-yellow">💵 Paiement à la livraison</span></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

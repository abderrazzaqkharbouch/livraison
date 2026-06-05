import React, { useEffect, useState } from 'react';
import { API } from '../../context/AuthContext';
import { Search, ChevronDown, ChevronUp, MapPin } from 'lucide-react';

const STATUS_MAP = {
  en_attente:    { badge: 'badge-yellow',  label: 'En attente' },
  confirmee:     { badge: 'badge-blue',    label: 'Confirmée' },
  en_preparation:{ badge: 'badge-orange',  label: 'En préparation' },
  prete:         { badge: 'badge-purple',  label: 'Prête' },
  en_livraison:  { badge: 'badge-blue',    label: 'En livraison' },
  livree:        { badge: 'badge-green',   label: 'Livrée' },
  annulee:       { badge: 'badge-red',     label: 'Annulée' },
};

const NEXT_ACTIONS = {
  en_attente:    { label: 'Confirmer',       next: 'confirmee' },
  confirmee:     { label: 'En préparation',  next: 'en_preparation' },
  en_preparation:{ label: 'Marquer prête',   next: 'prete' },
  prete:         { label: 'En livraison',    next: 'en_livraison' },
  en_livraison:  { label: 'Marquer livrée', next: 'livree' },
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [expanded, setExpanded] = useState(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  const load = () => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 15 });
    if (filter) params.set('statut', filter);
    API.get(`/orders?${params}`)
      .then(r => { setOrders(r.data.orders || []); setTotal(r.data.total || 0); })
      .finally(() => setLoading(false));
  };

  useEffect(load, [filter, page]);

  const advanceStatus = async (id, statut) => {
    await API.put(`/orders/${id}/statut`, { statut });
    load();
  };

  const cancelOrder = async (id) => {
    if (!window.confirm('Annuler cette commande ?')) return;
    await API.put(`/orders/${id}/statut`, { statut: 'annulee', note: 'Annulée par l\'administrateur' });
    load();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Gestion des commandes</h2>
          <p className="text-sm text-gray">{total} commande(s) au total</p>
        </div>
      </div>

      {/* Status filter tabs */}
      <div style={{ display: 'flex', gap: '.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button className={`btn btn-sm ${filter === '' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => { setFilter(''); setPage(1); }}>
          Toutes ({total})
        </button>
        {Object.entries(STATUS_MAP).map(([key, { label }]) => (
          <button key={key} className={`btn btn-sm ${filter === key ? 'btn-primary' : 'btn-secondary'}`} onClick={() => { setFilter(key); setPage(1); }}>
            {label}
          </button>
        ))}
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Numéro</th>
                <th>Client</th>
                <th>Articles</th>
                <th>Montant</th>
                <th>Statut</th>
                <th>Livreur</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>Chargement...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>Aucune commande trouvée</td></tr>
              ) : orders.map(o => {
                const st = STATUS_MAP[o.statut] || { badge: 'badge-gray', label: o.statut };
                const open = expanded === o._id;
                return (
                  <React.Fragment key={o._id}>
                    <tr>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 0 }} onClick={() => setExpanded(open ? null : o._id)}>
                            {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                          <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{o.numero}</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{o.client?.nom}</div>
                        <div className="text-xs text-gray">{o.client?.email}</div>
                      </td>
                      <td>{o.lignes?.length} article(s)</td>
                      <td><strong>{o.montantFinal} MAD</strong><div className="text-xs text-gray">dont {o.fraisLivraison} MAD livraison</div></td>
                      <td><span className={`badge ${st.badge}`}>{st.label}</span></td>
                      <td>{o.livreur ? <span className="text-sm">{o.livreur.nom}</span> : <span className="text-xs text-gray">Non assigné</span>}</td>
                      <td className="text-sm text-gray">{new Date(o.createdAt).toLocaleDateString('fr-MA')}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '.4rem', flexWrap: 'wrap' }}>
                          {NEXT_ACTIONS[o.statut] && (
                            <button className="btn btn-sm btn-primary" onClick={() => advanceStatus(o._id, NEXT_ACTIONS[o.statut].next)}>
                              {NEXT_ACTIONS[o.statut].label}
                            </button>
                          )}
                          {!['livree', 'annulee'].includes(o.statut) && (
                            <button className="btn btn-sm btn-danger" onClick={() => cancelOrder(o._id)}>Annuler</button>
                          )}
                        </div>
                      </td>
                    </tr>
                    {open && (
                      <tr>
                        <td colSpan={8} style={{ background: '#f9fafb', padding: '1rem 1.5rem' }}>
                          <div className="grid-2">
                            <div>
                              <div style={{ fontWeight: 600, marginBottom: '.75rem' }}>Articles commandés</div>
                              {o.lignes?.map(l => (
                                <div key={l._id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.875rem', padding: '.3rem 0', borderBottom: '1px solid #f3f4f6' }}>
                                  <span>{l.nom} × {l.quantite}</span>
                                  <span style={{ fontWeight: 600 }}>{l.sousTotal} MAD</span>
                                </div>
                              ))}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, marginBottom: '.75rem' }}><MapPin size={14} style={{ display: 'inline' }} /> Adresse de livraison</div>
                              <div className="text-sm">{o.adresseLivraison?.rue}</div>
                              <div className="text-sm text-gray">{o.adresseLivraison?.ville} {o.adresseLivraison?.codePostal}</div>
                              <div style={{ marginTop: '.75rem', fontWeight: 600, fontSize: '.875rem' }}>Historique des statuts</div>
                              <div className="timeline" style={{ marginTop: '.5rem' }}>
                                {(o.historiqueStatuts || []).map((h, i) => (
                                  <div key={i} className="timeline-item">
                                    <div className={`timeline-dot ${i === o.historiqueStatuts.length - 1 ? 'current' : 'done'}`} />
                                    <div className="timeline-info">
                                      <div className="timeline-status">{STATUS_MAP[h.statut]?.label || h.statut}</div>
                                      <div className="timeline-date">{new Date(h.date).toLocaleString('fr-MA')}{h.note ? ` — ${h.note}` : ''}</div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > 15 && (
          <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="text-sm text-gray">Page {page} — {total} commandes</span>
            <div style={{ display: 'flex', gap: '.5rem' }}>
              <button className="btn btn-sm btn-secondary" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Précédent</button>
              <button className="btn btn-sm btn-secondary" disabled={page * 15 >= total} onClick={() => setPage(p => p + 1)}>Suivant →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

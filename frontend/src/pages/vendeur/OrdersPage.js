// vendeur/OrdersPage.js
import React, { useEffect, useState } from 'react';
import { API } from '../../context/AuthContext';

const STATUS_MAP = {
  en_attente: ['badge-yellow','En attente'],
  confirmee: ['badge-blue','Confirmée'],
  en_preparation: ['badge-orange','En préparation'],
  prete: ['badge-purple','Prête'],
  en_livraison: ['badge-blue','En livraison'],
  livree: ['badge-green','Livrée'],
  annulee: ['badge-red','Annulée']
};
const badge = s => { const [c,l] = STATUS_MAP[s]||['badge-gray',s]; return <span className={`badge ${c}`}>{l}</span>; };

const NEXT = { en_attente: 'confirmee', confirmee: 'en_preparation', en_preparation: 'prete' };
const NEXT_LABEL = { en_attente: 'Confirmer', confirmee: 'Préparer', en_preparation: 'Marquer prête' };

export function VendeurOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const load = () => {
    API.get('/orders' + (filter ? `?statut=${filter}` : '')).then(r => setOrders(r.data.orders || [])).finally(() => setLoading(false));
  };
  useEffect(load, [filter]);

  const advance = async (id, statut) => {
    await API.put(`/orders/${id}/statut`, { statut });
    load();
  };

  return (
    <div>
      <div className="filter-header">
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Commandes reçues</h2>
        <select className="form-select filter-select" style={{ width: 200 }} value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="">Tous les statuts</option>
          {Object.entries(STATUS_MAP).map(([v,[,l]]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Numéro</th><th>Client</th><th>Produits</th><th>Montant</th><th>Statut</th><th>Date</th><th>Action</th></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={7} style={{textAlign:'center',padding:'2rem',color:'#9ca3af'}}>Chargement...</td></tr>
                : orders.length === 0 ? <tr><td colSpan={7} style={{textAlign:'center',padding:'2rem',color:'#9ca3af'}}>Aucune commande</td></tr>
                : orders.map(o => (
                <tr key={o._id}>
                  <td><span style={{fontWeight:600,fontFamily:'monospace'}}>{o.numero}</span></td>
                  <td>{o.client?.nom}<div className="text-xs text-gray">{o.client?.telephone}</div></td>
                  <td className="text-sm">{o.lignes?.length} article(s)</td>
                  <td><strong>{o.montantFinal} MAD</strong></td>
                  <td>{badge(o.statut)}</td>
                  <td className="text-sm text-gray">{new Date(o.createdAt).toLocaleDateString('fr-MA')}</td>
                  <td>
                    {NEXT[o.statut] && (
                      <button className="btn btn-sm btn-primary" onClick={() => advance(o._id, NEXT[o.statut])}>{NEXT_LABEL[o.statut]}</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
export default VendeurOrdersPage;

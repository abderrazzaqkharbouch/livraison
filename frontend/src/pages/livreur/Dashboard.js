import React, { useEffect, useState } from 'react';
import { useAuth, API } from '../../context/AuthContext';
import { Truck, CheckCircle, Package, MapPin } from 'lucide-react';

export function LivreurDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/dashboard/livreur').then(r => setData(r.data)).finally(() => setLoading(false));
  }, []);

  const prendreEnCharge = async (id) => {
    await API.put(`/orders/${id}/statut`, { statut: 'en_livraison', note: 'Pris en charge par le livreur' });
    API.get('/dashboard/livreur').then(r => setData(r.data));
  };

  const marquerLivree = async (id) => {
    await API.put(`/orders/${id}/statut`, { statut: 'livree', note: 'Livraison effectuée' });
    API.get('/dashboard/livreur').then(r => setData(r.data));
  };

  if (loading) return <div className="empty-state">Chargement...</div>;

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Bonjour, {user?.nom} 🚴</h2>
        <p className="text-gray text-sm">{user?.livreur?.vehicule} — Zone: {user?.livreur?.zone || 'Non définie'}</p>
      </div>
      <div className="stats-grid">
        {[
          { label: 'Total livraisons', value: data?.stats?.mesLivraisons, icon: Truck, color: '#2563eb', bg: '#eff6ff' },
          { label: 'En cours', value: data?.stats?.enCours, icon: Package, color: '#d97706', bg: '#fffbeb' },
          { label: 'Livrées', value: data?.stats?.livrees, icon: CheckCircle, color: '#16a34a', bg: '#f0fdf4' },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg }}><s.icon size={22} color={s.color} /></div>
            <div><div className="stat-value">{s.value}</div><div className="stat-label">{s.label}</div></div>
          </div>
        ))}
      </div>

      {data?.enCours?.length > 0 && (
        <div className="card mb-6">
          <div className="card-header"><span className="card-title">🚴 En cours de livraison</span></div>
          {data.enCours.map(o => (
            <div key={o._id} style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f3f4f6' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ fontWeight: 700, fontFamily: 'monospace' }}>{o.numero}</span>
                  <div className="text-sm text-gray">{o.client?.nom} — {o.client?.telephone}</div>
                  <div className="text-sm" style={{ marginTop: '.25rem' }}><MapPin size={12} style={{ display: 'inline' }} /> {o.adresseLivraison?.rue}, {o.adresseLivraison?.ville}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem', alignItems: 'flex-end' }}>
                  <span style={{ fontWeight: 700 }}>{o.montantFinal} MAD</span>
                  <button className="btn btn-sm btn-success" onClick={() => marquerLivree(o._id)}><CheckCircle size={13} />Livrée</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="card">
        <div className="card-header"><span className="card-title">📦 Commandes disponibles</span></div>
        {data?.disponibles?.length === 0 ? (
          <div className="empty-state" style={{ padding: '2rem' }}>Aucune commande disponible pour le moment</div>
        ) : data?.disponibles?.map(o => (
          <div key={o._id} style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f3f4f6' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontWeight: 700, fontFamily: 'monospace' }}>{o.numero}</span>
                <div className="text-sm text-gray">{o.client?.nom}</div>
                <div className="text-sm"><MapPin size={12} style={{ display: 'inline' }} /> {o.adresseLivraison?.rue}, {o.adresseLivraison?.ville}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem', alignItems: 'flex-end' }}>
                <span style={{ fontWeight: 700 }}>{o.montantFinal} MAD</span>
                <button className="btn btn-sm btn-primary" onClick={() => prendreEnCharge(o._id)}><Truck size={13} />Prendre en charge</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LivreurOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/orders').then(r => setOrders(r.data.orders || [])).finally(() => setLoading(false));
  }, []);

  const marquerLivree = async (id) => {
    await API.put(`/orders/${id}/statut`, { statut: 'livree' });
    API.get('/orders').then(r => setOrders(r.data.orders || []));
  };

  return (
    <div>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>Mes livraisons</h2>
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Commande</th><th>Client</th><th>Adresse</th><th>Montant</th><th>Statut</th><th>Action</th></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={6} style={{textAlign:'center',padding:'2rem',color:'#9ca3af'}}>Chargement...</td></tr>
                : orders.length === 0 ? <tr><td colSpan={6} style={{textAlign:'center',padding:'2rem',color:'#9ca3af'}}>Aucune livraison</td></tr>
                : orders.map(o => (
                <tr key={o._id}>
                  <td style={{fontFamily:'monospace',fontWeight:600}}>{o.numero}</td>
                  <td>{o.client?.nom}<div className="text-xs text-gray">{o.client?.telephone}</div></td>
                  <td className="text-sm">{o.adresseLivraison?.rue}, {o.adresseLivraison?.ville}</td>
                  <td><strong>{o.montantFinal} MAD</strong></td>
                  <td><span className={`badge ${o.statut==='livree'?'badge-green':o.statut==='en_livraison'?'badge-blue':'badge-yellow'}`}>{o.statut}</span></td>
                  <td>{o.statut === 'en_livraison' && <button className="btn btn-sm btn-success" onClick={() => marquerLivree(o._id)}><CheckCircle size={13} />Livrée</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default LivreurDashboard;

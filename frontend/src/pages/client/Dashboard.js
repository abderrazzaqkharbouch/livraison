import React, { useEffect, useState } from 'react';
import { useAuth, API } from '../../context/AuthContext';
import { ShoppingBag, Package, Clock, CheckCircle } from 'lucide-react';

export default function ClientDashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/orders').then(r => setOrders(r.data.orders || [])).finally(() => setLoading(false));
  }, []);

  const livrees = orders.filter(o => o.statut === 'livree').length;
  const enCours = orders.filter(o => !['livree','annulee'].includes(o.statut)).length;
  const total = orders.reduce((a, o) => o.statut === 'livree' ? a + o.montantFinal : a, 0);

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Bonjour, {user?.nom} 👋</h2>
        <p className="text-gray text-sm">Bienvenue sur votre espace client</p>
      </div>
      <div className="stats-grid">
        {[
          { label: 'Total commandes', value: orders.length, icon: ShoppingBag, color: '#2563eb', bg: '#eff6ff' },
          { label: 'En cours', value: enCours, icon: Clock, color: '#d97706', bg: '#fffbeb' },
          { label: 'Livrées', value: livrees, icon: CheckCircle, color: '#16a34a', bg: '#f0fdf4' },
          { label: 'Total dépensé', value: `${total} MAD`, icon: Package, color: '#7c3aed', bg: '#f5f3ff' },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg }}><s.icon size={22} color={s.color} /></div>
            <div><div className="stat-value">{s.value}</div><div className="stat-label">{s.label}</div></div>
          </div>
        ))}
      </div>
      <div className="card">
        <div className="card-header" style={{ justifyContent: 'space-between' }}>
          <span className="card-title">Commandes récentes</span>
          <a href="/mes-commandes" className="btn btn-sm btn-secondary">Voir tout</a>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Numéro</th><th>Articles</th><th>Montant</th><th>Statut</th><th>Date</th></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={5} style={{textAlign:'center',padding:'1.5rem',color:'#9ca3af'}}>Chargement...</td></tr>
                : orders.slice(0,5).map(o => (
                <tr key={o._id}>
                  <td style={{fontFamily:'monospace',fontWeight:600}}>{o.numero}</td>
                  <td>{o.lignes?.length} article(s)</td>
                  <td><strong>{o.montantFinal} MAD</strong></td>
                  <td><span className={`badge ${o.statut==='livree'?'badge-green':o.statut==='annulee'?'badge-red':'badge-yellow'}`}>{o.statut}</span></td>
                  <td className="text-sm text-gray">{new Date(o.createdAt).toLocaleDateString('fr-MA')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { API } from '../../context/AuthContext';
import { Users, ShoppingBag, TrendingUp, DollarSign, Package, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';

const STATUS_MAP = {
  en_attente: ['badge-yellow','En attente'],
  confirmee: ['badge-blue','Confirmée'],
  en_preparation: ['badge-orange','En préparation'],
  prete: ['badge-purple','Prête'],
  en_livraison: ['badge-blue','En livraison'],
  livree: ['badge-green','Livrée'],
  annulee: ['badge-red','Annulée'],
};
const badge = s => { const [c,l]=STATUS_MAP[s]||['badge-gray',s]; return <span className={`badge ${c}`}>{l}</span>; };

const ROLE_COLORS = ['#2563eb','#16a34a','#d97706','#7c3aed'];

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/dashboard/admin').then(r => setData(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="empty-state">Chargement du tableau de bord...</div>;

  const userPieData = [
    { name: 'Clients', value: data?.stats?.totalClients || 0 },
    { name: 'Vendeurs', value: data?.stats?.totalVendeurs || 0 },
    { name: 'Livreurs', value: data?.stats?.totalLivreurs || 0 },
  ];

  const orderBarData = [
    { name: 'Total', value: data?.stats?.totalCommandes || 0 },
    { name: 'En cours', value: data?.stats?.commandesEnCours || 0 },
    { name: 'Livrées', value: data?.stats?.commandesLivrees || 0 },
  ];

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Tableau de bord administrateur</h2>
        <p className="text-gray text-sm">Vue d'ensemble de la plateforme</p>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
        {[
          { label: 'Utilisateurs', value: data?.stats?.totalUsers, icon: Users, color: '#2563eb', bg: '#eff6ff' },
          { label: 'Commandes totales', value: data?.stats?.totalCommandes, icon: ShoppingBag, color: '#d97706', bg: '#fffbeb' },
          { label: 'En cours', value: data?.stats?.commandesEnCours, icon: Clock, color: '#7c3aed', bg: '#f5f3ff' },
          { label: 'Commandes livrées', value: data?.stats?.commandesLivrees, icon: Package, color: '#16a34a', bg: '#f0fdf4' },
          { label: "Chiffre d'affaires", value: `${(data?.stats?.chiffreAffaires||0).toLocaleString()} MAD`, icon: TrendingUp, color: '#2563eb', bg: '#eff6ff' },
          { label: 'Commissions', value: `${Math.round(data?.stats?.commissions||0).toLocaleString()} MAD`, icon: DollarSign, color: '#16a34a', bg: '#f0fdf4' },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg }}><s.icon size={22} color={s.color} /></div>
            <div><div className="stat-value">{s.value ?? '—'}</div><div className="stat-label">{s.label}</div></div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid-2 mb-6">
        <div className="card">
          <div className="card-header"><span className="card-title">Répartition des utilisateurs</span></div>
          <div className="card-body" style={{ display: 'flex', justifyContent: 'center' }}>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={userPieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                  {userPieData.map((_, i) => <Cell key={i} fill={ROLE_COLORS[i]} />)}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><span className="card-title">État des commandes</span></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={orderBarData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" radius={[4,4,0,0]}>
                  {orderBarData.map((_, i) => <Cell key={i} fill={ROLE_COLORS[i]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent orders */}
      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <span className="card-title">Commandes récentes</span>
            <a href="/admin/commandes" className="btn btn-sm btn-secondary">Voir tout</a>
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Numéro</th><th>Client</th><th>Montant</th><th>Statut</th></tr></thead>
              <tbody>
                {(data?.recentOrders || []).slice(0, 6).map(o => (
                  <tr key={o._id}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '.8rem' }}>{o.numero}</td>
                    <td>{o.client?.nom}</td>
                    <td style={{ fontWeight: 600 }}>{o.montantFinal} MAD</td>
                    <td>{badge(o.statut)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Nouveaux utilisateurs</span>
            <a href="/admin/utilisateurs" className="btn btn-sm btn-secondary">Voir tout</a>
          </div>
          <div style={{ padding: 0 }}>
            {(data?.newUsers || []).map((u, i) => (
              <div key={u._id} style={{ display: 'flex', alignItems: 'center', gap: '.875rem', padding: '.875rem 1.25rem', borderBottom: i < (data.newUsers.length - 1) ? '1px solid #f3f4f6' : 'none' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: ROLE_COLORS[['client','vendeur','livreur','admin'].indexOf(u.role)] || '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '.85rem', flexShrink: 0 }}>
                  {u.nom?.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '.875rem' }}>{u.nom}</div>
                  <div style={{ fontSize: '.75rem', color: '#6b7280' }}>{u.email}</div>
                </div>
                <span className={`badge ${u.role==='admin'?'badge-purple':u.role==='vendeur'?'badge-green':u.role==='livreur'?'badge-yellow':'badge-blue'}`}>{u.role}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { useAuth, API } from '../../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Package, ShoppingBag, TrendingUp, Wallet, ArrowUp } from 'lucide-react';

const statusBadge = s => {
  const m = { en_attente: ['badge-yellow','En attente'], confirmee: ['badge-blue','Confirmée'], en_preparation: ['badge-orange','En préparation'], prete: ['badge-purple','Prête'], en_livraison: ['badge-blue','En livraison'], livree: ['badge-green','Livrée'], annulee: ['badge-red','Annulée'] };
  const [cls, label] = m[s] || ['badge-gray', s];
  return <span className={`badge ${cls}`}>{label}</span>;
};

const MONTHS = ['Jan','Fév','Mar','Avr','Mai','Juin','Juil','Aoû','Sep','Oct','Nov','Déc'];

export default function VendeurDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/dashboard/vendeur').then(r => setData(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="empty-state">Chargement du tableau de bord...</div>;

  const chartData = (data?.monthlyData || []).map(d => ({
    name: MONTHS[d._id.month - 1], CA: Math.round(d.total)
  }));

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Bonjour, {user?.nom} 👋</h2>
        <p className="text-gray text-sm">{user?.vendeur?.nomBoutique} — Tableau de bord vendeur</p>
      </div>

      <div className="stats-grid">
        {[
          { label: 'Produits actifs', value: data?.stats?.totalProduits, icon: Package, color: '#2563eb', bg: '#eff6ff' },
          { label: 'Total commandes', value: data?.stats?.totalCommandes, icon: ShoppingBag, color: '#d97706', bg: '#fffbeb' },
          { label: 'Commandes livrées', value: data?.stats?.commandesLivrees, icon: TrendingUp, color: '#16a34a', bg: '#f0fdf4' },
          { label: 'Solde disponible', value: `${data?.stats?.solde?.toLocaleString() || 0} MAD`, icon: Wallet, color: '#7c3aed', bg: '#f5f3ff' },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg }}><s.icon size={22} color={s.color} /></div>
            <div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid-2 mb-6">
        <div className="card">
          <div className="card-header"><span className="card-title">Chiffre d'affaires (6 mois)</span></div>
          <div className="card-body">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={v => [`${v} MAD`, 'CA']} />
                  <Bar dataKey="CA" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="empty-state" style={{padding:'3rem 0'}}>Pas encore de données</div>}
          </div>
        </div>

        <div className="card">
          <div className="card-header"><span className="card-title">Produits populaires</span></div>
          <div className="card-body" style={{ padding: 0 }}>
            {(data?.produitsPopulaires || []).length === 0 ? (
              <div className="empty-state">Aucun produit</div>
            ) : (data?.produitsPopulaires || []).map((p, i) => (
              <div key={p._id} style={{ display: 'flex', alignItems: 'center', gap: '.875rem', padding: '.875rem 1.25rem', borderBottom: i < data.produitsPopulaires.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#2563eb', fontSize: '.85rem' }}>#{i + 1}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '.875rem' }}>{p.nom}</div>
                  <div style={{ fontSize: '.75rem', color: '#6b7280' }}>{p.ventes} ventes • {p.prix} MAD</div>
                </div>
                <span className="badge badge-green">{p.stock} en stock</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><span className="card-title">Commandes récentes</span></div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Numéro</th><th>Client</th><th>Montant</th><th>Statut</th><th>Date</th></tr></thead>
            <tbody>
              {(data?.commandesRecentes || []).length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', color: '#9ca3af', padding: '2rem' }}>Aucune commande</td></tr>
              ) : (data?.commandesRecentes || []).map(c => (
                <tr key={c._id}>
                  <td><span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{c.numero}</span></td>
                  <td>{c.client?.nom}</td>
                  <td><strong>{c.montantFinal} MAD</strong></td>
                  <td>{statusBadge(c.statut)}</td>
                  <td className="text-gray text-sm">{new Date(c.createdAt).toLocaleDateString('fr-MA')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

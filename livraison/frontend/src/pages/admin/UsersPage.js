import React, { useEffect, useState } from 'react';
import { API } from '../../context/AuthContext';
import { Search, UserCheck, UserX, Trash2 } from 'lucide-react';

const ROLE_LABELS = { client: '👤 Client', vendeur: '🏪 Vendeur', livreur: '🚴 Livreur', admin: '👑 Admin' };
const ROLE_BADGES = { client: 'badge-blue', vendeur: 'badge-green', livreur: 'badge-yellow', admin: 'badge-purple' };

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');

  const load = () => {
    setLoading(true);
    API.get('/users' + (filter ? `?role=${filter}` : ''))
      .then(r => setUsers(r.data.users || []))
      .finally(() => setLoading(false));
  };

  useEffect(load, [filter]);

  const toggleUser = async (id) => {
    await API.put(`/users/${id}/toggle`);
    load();
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Désactiver cet utilisateur ?')) return;
    await API.delete(`/users/${id}`);
    load();
  };

  const filtered = users.filter(u =>
    u.nom?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Gestion des utilisateurs</h2>
          <p className="text-sm text-gray">{users.length} utilisateur(s) au total</p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={16} style={{ position: 'absolute', left: '.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input className="form-input" style={{ paddingLeft: '2.25rem' }} placeholder="Rechercher par nom ou email..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-select" style={{ width: 180 }} value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="">Tous les rôles</option>
          <option value="client">Clients</option>
          <option value="vendeur">Vendeurs</option>
          <option value="livreur">Livreurs</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      {/* Role summary */}
      <div style={{ display: 'flex', gap: '.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {Object.entries(ROLE_LABELS).map(([role, label]) => {
          const count = users.filter(u => u.role === role).length;
          return (
            <div key={role} onClick={() => setFilter(filter === role ? '' : role)}
              style={{ padding: '.625rem 1rem', background: filter === role ? '#eff6ff' : '#fff', border: `1.5px solid ${filter === role ? '#2563eb' : '#e5e7eb'}`, borderRadius: 8, cursor: 'pointer', display: 'flex', gap: '.5rem', alignItems: 'center', transition: 'all .15s' }}>
              <span style={{ fontSize: '.875rem' }}>{label}</span>
              <span style={{ background: '#f3f4f6', borderRadius: 999, padding: '0 .5rem', fontSize: '.75rem', fontWeight: 700 }}>{count}</span>
            </div>
          );
        })}
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Utilisateur</th>
                <th>Email</th>
                <th>Téléphone</th>
                <th>Rôle</th>
                <th>Détails</th>
                <th>Statut</th>
                <th>Inscrit le</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>Chargement...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>Aucun utilisateur trouvé</td></tr>
              ) : filtered.map(u => (
                <tr key={u._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                      <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#2563eb', fontSize: '.8rem', flexShrink: 0 }}>
                        {u.nom?.charAt(0).toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 600 }}>{u.nom}</span>
                    </div>
                  </td>
                  <td className="text-sm">{u.email}</td>
                  <td className="text-sm text-gray">{u.telephone || '—'}</td>
                  <td><span className={`badge ${ROLE_BADGES[u.role]}`}>{u.role}</span></td>
                  <td className="text-xs text-gray">
                    {u.role === 'vendeur' && u.vendeur?.nomBoutique && <span>🏪 {u.vendeur.nomBoutique}</span>}
                    {u.role === 'livreur' && u.livreur?.vehicule && <span>🚗 {u.livreur.vehicule}</span>}
                    {u.role === 'vendeur' && u.vendeur?.solde !== undefined && <span style={{ display: 'block' }}>💰 {u.vendeur.solde} MAD</span>}
                  </td>
                  <td>
                    <span className={`badge ${u.actif ? 'badge-green' : 'badge-red'}`}>
                      {u.actif ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="text-sm text-gray">{new Date(u.createdAt).toLocaleDateString('fr-MA')}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '.4rem' }}>
                      <button
                        className={`btn btn-sm btn-icon ${u.actif ? 'btn-secondary' : 'btn-success'}`}
                        onClick={() => toggleUser(u._id)}
                        title={u.actif ? 'Désactiver' : 'Activer'}
                      >
                        {u.actif ? <UserX size={14} /> : <UserCheck size={14} />}
                      </button>
                      <button className="btn btn-sm btn-icon btn-danger" onClick={() => deleteUser(u._id)} title="Supprimer">
                        <Trash2 size={14} />
                      </button>
                    </div>
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

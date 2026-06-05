import React, { useEffect, useState } from 'react';
import { API } from '../../context/AuthContext';
import { useAuth } from '../../context/AuthContext';
import { Wallet, ArrowDownCircle } from 'lucide-react';

export default function PaymentsPage() {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [iban, setIban] = useState('');
  const [msg, setMsg] = useState('');
  const [vLoading, setVLoading] = useState(false);
  const solde = user?.vendeur?.solde || 0;

  useEffect(() => {
    API.get('/payments').then(r => setPayments(r.data.payments || [])).finally(() => setLoading(false));
  }, []);

  const demanderVirement = async () => {
    if (!iban) return setMsg('Veuillez saisir votre IBAN');
    setVLoading(true); setMsg('');
    try {
      const r = await API.post('/payments/virement', { iban });
      setMsg(`✅ ${r.data.message}`);
    } catch (e) { setMsg(`❌ ${e.response?.data?.message || 'Erreur'}`); }
    finally { setVLoading(false); }
  };

  return (
    <div>
      <div className="page-header"><h2>Paiements & Virements</h2></div>

      <div className="grid-2 mb-6">
        <div className="card">
          <div className="card-body">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ width: 52, height: 52, borderRadius: 12, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Wallet size={26} color="#16a34a" />
              </div>
              <div>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#111827' }}>{solde.toLocaleString()} MAD</div>
                <div className="text-sm text-gray">Solde disponible</div>
              </div>
            </div>
            {msg && <div style={{ padding: '.75rem', background: msg.startsWith('✅') ? '#f0fdf4' : '#fee2e2', borderRadius: 8, marginBottom: '1rem', fontSize: '.875rem', color: msg.startsWith('✅') ? '#15803d' : '#b91c1c' }}>{msg}</div>}
            <div className="form-group">
              <label className="form-label">IBAN pour le virement</label>
              <input className="form-input" value={iban} onChange={e => setIban(e.target.value)} placeholder="MA64 XXXX XXXX XXXX XXXX XXXX XXXX" />
            </div>
            <button className="btn btn-success" style={{ width: '100%', justifyContent: 'center' }} onClick={demanderVirement} disabled={vLoading || solde < 100}>
              <ArrowDownCircle size={16} />
              {vLoading ? 'Traitement...' : `Demander un virement (min. 100 MAD)`}
            </button>
            {solde < 100 && <p className="text-xs text-gray" style={{ marginTop: '.5rem', textAlign: 'center' }}>Solde insuffisant — minimum 100 MAD requis</p>}
          </div>
        </div>

        <div className="card">
          <div className="card-header"><span className="card-title">Résumé financier</span></div>
          <div className="card-body">
            {[
              ['Total des ventes', payments.reduce((a,p) => a + p.montant, 0).toLocaleString() + ' MAD', '#2563eb'],
              ['Frais de service', payments.reduce((a,p) => a + p.fraisService, 0).toLocaleString() + ' MAD', '#dc2626'],
              ['Net reçu', payments.reduce((a,p) => a + p.montantNet, 0).toLocaleString() + ' MAD', '#16a34a'],
            ].map(([l,v,c]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '.75rem 0', borderBottom: '1px solid #f3f4f6' }}>
                <span className="text-sm text-gray">{l}</span>
                <span style={{ fontWeight: 700, color: c }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><span className="card-title">Historique des paiements</span></div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Commande</th><th>Montant brut</th><th>Frais service</th><th>Net reçu</th><th>Statut</th><th>Date</th></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={6} style={{textAlign:'center',padding:'2rem',color:'#9ca3af'}}>Chargement...</td></tr>
               : payments.map(p => (
                <tr key={p._id}>
                  <td><span style={{fontFamily:'monospace',fontWeight:600}}>{p.commande?.numero}</span></td>
                  <td>{p.montant} MAD</td>
                  <td style={{color:'#dc2626'}}>-{p.fraisService} MAD</td>
                  <td style={{color:'#16a34a',fontWeight:700}}>{p.montantNet} MAD</td>
                  <td><span className={`badge ${p.statut === 'confirme' ? 'badge-green' : p.statut === 'vire' ? 'badge-purple' : 'badge-yellow'}`}>{p.statut}</span></td>
                  <td className="text-sm text-gray">{new Date(p.createdAt).toLocaleDateString('fr-MA')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

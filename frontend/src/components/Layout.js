import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth, API } from '../context/AuthContext';
import {
  LayoutDashboard, Package, ShoppingCart, Truck, Users, CreditCard,
  Bell, LogOut, Menu, X, Store, ClipboardList, BarChart2, ChevronRight
} from 'lucide-react';

const navConfig = {
  client: [
    { label: 'Tableau de bord', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Boutique', icon: Store, path: '/boutique' },
    { label: 'Mon panier', icon: ShoppingCart, path: '/panier' },
    { label: 'Mes commandes', icon: ClipboardList, path: '/mes-commandes' },
  ],
  vendeur: [
    { label: 'Tableau de bord', icon: LayoutDashboard, path: '/vendeur' },
    { label: 'Mes produits', icon: Package, path: '/vendeur/produits' },
    { label: 'Commandes', icon: ClipboardList, path: '/vendeur/commandes' },
    { label: 'Paiements', icon: CreditCard, path: '/vendeur/paiements' },
  ],
  livreur: [
    { label: 'Tableau de bord', icon: LayoutDashboard, path: '/livreur' },
    { label: 'Mes livraisons', icon: Truck, path: '/livreur/livraisons' },
  ],
  admin: [
    { label: 'Tableau de bord', icon: BarChart2, path: '/admin' },
    { label: 'Utilisateurs', icon: Users, path: '/admin/utilisateurs' },
    { label: 'Commandes', icon: ClipboardList, path: '/admin/commandes' },
  ]
};

const roleColors = { client: '#2563eb', vendeur: '#16a34a', livreur: '#d97706', admin: '#7c3aed' };
const roleLabels = { client: 'Client', vendeur: 'Vendeur', livreur: 'Livreur', admin: 'Administrateur' };

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [unread, setUnread] = useState(0);

  const navItems = navConfig[user?.role] || [];

  useEffect(() => {
    if (user) fetchNotifications();
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const res = await API.get('/notifications');
      setNotifications(res.data.notifications || []);
      setUnread(res.data.nonLues || 0);
    } catch {}
  };

  const markAllRead = async () => {
    await API.put('/notifications/lire-tout');
    setUnread(0);
    setNotifications(n => n.map(x => ({ ...x, lu: true })));
  };

  const handleLogout = () => { logout(); navigate('/auth'); };

  const pageTitle = navItems.find(n => n.path === location.pathname)?.label || 'Plateforme Livraison';

  useEffect(() => {
    const onResize = () => { if (window.innerWidth > 768) setSidebarOpen(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <div className="app-layout">
      {/* Overlay mobile */}
      {sidebarOpen && <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 99 }} />}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="logo-icon">
            <Truck size={20} color="#fff" />
          </div>
          <span>Livraison.ma</span>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">Menu</div>
          {navItems.map(item => (
            <div
              key={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => { navigate(item.path); setSidebarOpen(false); }}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
              {location.pathname === item.path && <ChevronRight size={14} style={{ marginLeft: 'auto', opacity: .6 }} />}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-card">
            <div className="user-avatar" style={{ background: roleColors[user?.role] }}>
              {user?.nom?.charAt(0).toUpperCase()}
            </div>
            <div className="user-info">
              <div className="user-name">{user?.nom}</div>
              <div className="user-role">{roleLabels[user?.role]}</div>
            </div>
            <button onClick={handleLogout} className="btn btn-icon" title="Déconnexion" style={{ color: '#9ca3af', background: 'transparent', border: 'none', cursor: 'pointer' }}>
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="main-content">
        <header className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
            <button className="btn btn-icon btn-secondary menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <Menu size={18} />
            </button>
            <span className="topbar-title">{pageTitle}</span>
          </div>
          <div className="topbar-actions">
            {/* Notification bell */}
            <div style={{ position: 'relative' }}>
              <button className="btn btn-icon btn-secondary notif-btn" onClick={() => { setShowNotifs(!showNotifs); fetchNotifications(); }}>
                <Bell size={18} />
                {unread > 0 && <span className="notif-badge">{unread > 9 ? '9+' : unread}</span>}
              </button>
              {showNotifs && (
                <div className="notif-dropdown">
                  <div style={{ padding: '1rem', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600 }}>Notifications</span>
                    {unread > 0 && <button className="btn btn-sm btn-secondary" onClick={markAllRead}>Tout lire</button>}
                  </div>
                  <div style={{ maxHeight: 340, overflowY: 'auto' }}>
                    {notifications.length === 0 ? (
                      <div className="empty-state" style={{ padding: '2rem' }}>Aucune notification</div>
                    ) : notifications.slice(0, 15).map(n => (
                      <div key={n._id} style={{ padding: '.875rem 1rem', borderBottom: '1px solid #f9fafb', background: n.lu ? '#fff' : '#eff6ff' }}>
                        <div style={{ fontWeight: 600, fontSize: '.85rem' }}>{n.titre}</div>
                        <div style={{ fontSize: '.8rem', color: '#6b7280', marginTop: '.2rem' }}>{n.message}</div>
                        <div style={{ fontSize: '.72rem', color: '#9ca3af', marginTop: '.3rem' }}>{new Date(n.createdAt).toLocaleString('fr-MA')}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="user-avatar" style={{ background: roleColors[user?.role], width: 34, height: 34, fontSize: '.8rem' }}>
              {user?.nom?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <main className="page-content">
          <Outlet />
        </main>
      </div>

    </div>
  );
}

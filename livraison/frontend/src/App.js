import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import './index.css';

import AuthPage from './pages/AuthPage';
import Layout from './components/Layout';
import ClientDashboard from './pages/client/Dashboard';
import ShopPage from './pages/client/ShopPage';
import OrdersPage from './pages/client/OrdersPage';
import CartPage from './pages/client/CartPage';
import VendeurDashboard from './pages/vendeur/Dashboard';
import ProductsPage from './pages/vendeur/ProductsPage';
import VendeurOrders from './pages/vendeur/OrdersPage';
import PaymentsPage from './pages/vendeur/PaymentsPage';
import LivreurDashboard from './pages/livreur/Dashboard';
import LivreurOrders from './pages/livreur/OrdersPage';
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/UsersPage';
import AdminOrders from './pages/admin/OrdersPage';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',fontSize:'1.1rem',color:'#6b7280'}}>Chargement...</div>;
  if (!user) return <Navigate to="/auth" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

const HomeRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/auth" replace />;
  const routes = { client: '/boutique', vendeur: '/vendeur', livreur: '/livreur', admin: '/admin' };
  return <Navigate to={routes[user.role] || '/auth'} replace />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/" element={<HomeRedirect />} />

          {/* CLIENT */}
          <Route path="/boutique" element={<ProtectedRoute roles={['client']}><Layout /></ProtectedRoute>}>
            <Route index element={<ShopPage />} />
          </Route>
          <Route path="/panier" element={<ProtectedRoute roles={['client']}><Layout /></ProtectedRoute>}>
            <Route index element={<CartPage />} />
          </Route>
          <Route path="/mes-commandes" element={<ProtectedRoute roles={['client']}><Layout /></ProtectedRoute>}>
            <Route index element={<OrdersPage />} />
          </Route>
          <Route path="/dashboard" element={<ProtectedRoute roles={['client']}><Layout /></ProtectedRoute>}>
            <Route index element={<ClientDashboard />} />
          </Route>

          {/* VENDEUR */}
          <Route path="/vendeur" element={<ProtectedRoute roles={['vendeur']}><Layout /></ProtectedRoute>}>
            <Route index element={<VendeurDashboard />} />
          </Route>
          <Route path="/vendeur/produits" element={<ProtectedRoute roles={['vendeur']}><Layout /></ProtectedRoute>}>
            <Route index element={<ProductsPage />} />
          </Route>
          <Route path="/vendeur/commandes" element={<ProtectedRoute roles={['vendeur']}><Layout /></ProtectedRoute>}>
            <Route index element={<VendeurOrders />} />
          </Route>
          <Route path="/vendeur/paiements" element={<ProtectedRoute roles={['vendeur']}><Layout /></ProtectedRoute>}>
            <Route index element={<PaymentsPage />} />
          </Route>

          {/* LIVREUR */}
          <Route path="/livreur" element={<ProtectedRoute roles={['livreur']}><Layout /></ProtectedRoute>}>
            <Route index element={<LivreurDashboard />} />
          </Route>
          <Route path="/livreur/livraisons" element={<ProtectedRoute roles={['livreur']}><Layout /></ProtectedRoute>}>
            <Route index element={<LivreurOrders />} />
          </Route>

          {/* ADMIN */}
          <Route path="/admin" element={<ProtectedRoute roles={['admin']}><Layout /></ProtectedRoute>}>
            <Route index element={<AdminDashboard />} />
          </Route>
          <Route path="/admin/utilisateurs" element={<ProtectedRoute roles={['admin']}><Layout /></ProtectedRoute>}>
            <Route index element={<AdminUsers />} />
          </Route>
          <Route path="/admin/commandes" element={<ProtectedRoute roles={['admin']}><Layout /></ProtectedRoute>}>
            <Route index element={<AdminOrders />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { LayoutGrid, Building, Search, ShieldCheck, LogOut, Menu, X, User as UserIcon } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import PropertyForm from './pages/PropertyForm';
import AdminPanel from './pages/Admin/AdminPanel';
import ProfilePage from './pages/ProfilePage';
import PropertyList from './pages/PropertyList';
import PropertyDetail from './pages/PropertyDetail';
import RequirementForm from './pages/RequirementForm';
import MatchingView from './pages/MatchingView';
import LoginPage from './pages/LoginPage';

const Navigation = ({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (v: boolean) => void }) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const isSeller = user?.roles?.includes('Vendedor');
  const isAdmin = user?.roles?.includes('Admin');

  let navItems = [
    { path: '/propiedades', label: 'Explorar', icon: Search },
  ];

  if (user && (isSeller || isAdmin)) {
    navItems = [
      { path: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
      { path: '/propiedades', label: 'Explorar', icon: Search },
      { path: '/propiedades/nueva', label: 'Publicar', icon: Building },
      { path: '/busquedas/nueva', label: 'Mi Búsqueda', icon: Search },
    ];
  }

  if (isAdmin) {
    navItems.push({ path: '/admin', label: 'Admin', icon: ShieldCheck });
  }

  if (user && !isSeller && !isAdmin) {
    navItems.push({ path: '/perfil', label: 'Ser Vendedor', icon: Building });
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      <nav className={`
        fixed inset-y-0 left-0 z-50 md:relative md:translate-x-0 transition-all duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        ${collapsed ? "md:w-20" : "md:w-64"} w-72
        bg-slate-900 p-4 text-slate-300 flex flex-col justify-between overflow-hidden
      `}>
        <div>
          <div className="mb-8 p-2 flex justify-between items-center">
            <Link to="/" className="text-xl font-bold text-white flex items-center gap-3">
              <Building className="w-8 h-8 text-blue-500" />
              {(!collapsed || isOpen) && <span className="tracking-tight">Modelo Flash</span>}
            </Link>
            <button onClick={() => setCollapsed(!collapsed)} className="text-slate-400 hover:text-white hidden md:block">
              {collapsed ? "→" : "←"}
            </button>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white md:hidden">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center ${collapsed ? "md:justify-center" : "space-x-3"} px-4 py-3 rounded-xl transition-all ${isActive
                    ? 'bg-blue-600 text-white font-medium shadow-lg shadow-blue-900/40'
                    : 'hover:bg-slate-800 hover:text-white'
                    }`}
                >
                  <Icon className="w-5 h-5" />
                  {(!collapsed || isOpen) && <span>{item.label}</span>}
                </Link>
              );
            })}
          </div>
        </div>

        {user ? (
          <div className="p-4 border-t border-slate-800 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-800/50 transition-colors rounded-xl" onClick={logout}>
            <div className="flex gap-3 items-center overflow-hidden">
               <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                 <UserIcon className="w-5 h-5" />
               </div>
               {(!collapsed || isOpen) && (
                 <div className="overflow-hidden">
                   <p className="text-sm font-medium text-white truncate">{user?.firstname}</p>
                   <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                 </div>
               )}
            </div>
            <LogOut className="w-4 h-4 text-slate-400 hover:text-red-400 transition-colors" />
          </div>
        ) : (
          <div className="p-4 border-t border-slate-800">
            <Link 
              to="/" 
              className={`flex items-center ${collapsed ? "md:justify-center" : "space-x-3"} px-4 py-3 rounded-xl bg-slate-800 text-white hover:bg-slate-700 transition-all`}
            >
              <UserIcon className="w-5 h-5" />
              {(!collapsed || isOpen) && <span>Iniciar Sesión</span>}
            </Link>
          </div>
        )}
      </nav>
    </>
  );
};

const ProtectedRoute = ({ children, adminOnly = false }: { children: React.ReactNode, adminOnly?: boolean }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-blue-500 font-bold">Cargando...</div>;
  if (!user) return <Navigate to="/" />;
  if (adminOnly && !user?.roles?.includes('Admin')) return <Navigate to="/dashboard" />;
  return <>{children}</>;
};

const MainAppLayout = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  // If not logged in and on home, show landing (Home component)
  if (!user && location.pathname === '/') {
    return <Home />;
  }

  // If logged in and on home, redirect to dashboard or properties
  if (user && location.pathname === '/') {
    const isSeller = user.roles.includes('Vendedor');
    const isAdmin = user.roles.includes('Admin');
    return <Navigate to={isSeller || isAdmin ? "/dashboard" : "/propiedades"} />;
  }

  return (
    <div className="relative flex flex-col md:flex-row bg-slate-50 min-h-screen">
      {/* Mobile Topbar */}
      <div className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center sticky top-0 z-30 shadow-md">
        <button onClick={() => setIsMenuOpen(true)} className="p-2 hover:bg-slate-800 rounded-lg">
          <Menu className="w-6 h-6 text-blue-500" />
        </button>
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Building className="w-5 h-5 text-blue-500" />
          Modelo Flash
        </h2>
        <div className="w-8 h-8 rounded-full bg-slate-800" />
      </div>

      <Navigation isOpen={isMenuOpen} setIsOpen={setIsMenuOpen} />

      <main className="flex-1 p-4 md:p-8 overflow-y-auto h-[calc(100vh-64px)] md:h-screen">
        <Routes>
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/propiedades" element={<PropertyList />} />
          <Route path="/propiedades/:id" element={<PropertyDetail />} />
          <Route path="/propiedades/nueva" element={<ProtectedRoute><PropertyForm /></ProtectedRoute>} />
          <Route path="/propiedades/editar/:id" element={<ProtectedRoute><PropertyForm /></ProtectedRoute>} />
          <Route path="/busquedas/nueva" element={<ProtectedRoute><RequirementForm /></ProtectedRoute>} />
          <Route path="/matching/:requirementId" element={<ProtectedRoute><MatchingView /></ProtectedRoute>} />
          <Route path="/compradores/:propertyId" element={<ProtectedRoute><MatchingView /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute adminOnly><AdminPanel /></ProtectedRoute>} />
          <Route path="/perfil" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <MainAppLayout />
      </Router>
    </AuthProvider>
  );
};

export default App;

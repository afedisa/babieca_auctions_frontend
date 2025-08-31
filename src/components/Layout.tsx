import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User, Gavel, Shield } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: 'home' | 'admin';
  onTabChange: (tab: 'home' | 'admin') => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange }) => {
  const { user, logout } = useAuth();

  const canAccessAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  return (
    <div className="min-h-screen bg-dark-main">
      <header className="bg-gradient-to-r from-green-600 to-green-700 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Gavel className="h-8 w-8 text-white" />
              <h1 className="text-2xl font-bold text-white">Subastas Babieca Factory</h1>
            </div>
            
            <nav className="flex items-center space-x-6">
              <button
                onClick={() => onTabChange('home')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'home' 
                    ? 'bg-white/20 text-white' 
                    : 'text-green-100 hover:text-white hover:bg-white/10'
                }`}
              >
                <User className="h-5 w-5" />
                <span>Inicio</span>
              </button>
              
              {canAccessAdmin && (
                <button
                  onClick={() => onTabChange('admin')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'admin' 
                      ? 'bg-white/20 text-white' 
                      : 'text-green-100 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Shield className="h-5 w-5" />
                  <span>Administración</span>
                </button>
              )}
              
              <div className="flex items-center space-x-4 text-white">
                <span className="text-sm">
                  {user?.username} ({user?.role})
                </span>
                <button
                  onClick={logout}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  title="Cerrar sesión"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </nav>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;
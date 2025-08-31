import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuctionProvider } from './contexts/AuctionContext';
import LoginForm from './components/LoginForm';
import Layout from './components/Layout';
import HomePage from './components/HomePage';
import AdminPanel from './components/AdminPanel';

function AppContent() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [activeTab, setActiveTab] = useState<'home' | 'admin'>('home');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-main flex items-center justify-center">
        <div className="text-white text-xl">Cargando...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return (
    <AuctionProvider>
      <Layout activeTab={activeTab} onTabChange={setActiveTab}>
        {activeTab === 'home' ? <HomePage /> : <AdminPanel />}
      </Layout>
    </AuctionProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
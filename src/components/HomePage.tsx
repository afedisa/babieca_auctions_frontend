import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAuction } from '../contexts/AuctionContext';
import { Clock, Users, DollarSign, Eye, AlertTriangle, User, Mail, Phone, Lock } from 'lucide-react';
import BidModal from './BidModal';

const HomePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { getActiveAuctions, getUserAuctions, getUserBids, placeBid } = useAuction();
  const [selectedTab, setSelectedTab] = useState<'auctions' | 'my-auctions' | 'profile'>('auctions');
  const [selectedAuction, setSelectedAuction] = useState<string | null>(null);
  const [showBidModal, setShowBidModal] = useState(false);
  const [auctions, setAuctions] = useState<any[]>([]);
  const [myAuctions, setMyAuctions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userBids = getUserBids(user?.id || '');

  // Fetch auctions from API
  const fetchAuctions = async () => {
    setLoading(true);
    setError(null);
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:1337/api';
      const token = localStorage.getItem('authToken');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
       'Accept': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_BASE_URL}/auctions?populate=*`, {
        headers
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const auctionsData = data.data || data;
      
      // Transform the data to match our expected format - show ALL auctions
      const transformedAuctions = Array.isArray(auctionsData) ? auctionsData.map((auction: any) => {
        const attributes = auction.attributes || auction;
        const product = attributes.product?.data?.attributes || attributes.product || {};
        return {
          id: auction.documentId?.toString() || attributes.id?.toString(),
          product: {
            id: product.documentId?.toString() || attributes.productId?.toString() || '1',
            name: attributes.name || attributes.productName || 'Sin nombre',
            description: attributes.auctionDescription[0]?.children[0]?.text || attributes.productDescription || 'Sin descripción',
            images: product.images || attributes.productImages || ['https://images.pexels.com/photos/1037995/pexels-photo-1037995.jpeg?auto=compress&cs=tinysrgb&w=800'],
            documents: product.documents || attributes.productDocuments,
            startingPrice: product.startingPrice || attributes.initBid || 0,
          },
          startDate: new Date(attributes.auctionStartDate),
          endDate: new Date(attributes.auctionEndDate),
          currentBid: attributes.currentBid || attributes.startingPrice || 0,
          bidCount: attributes.bids.length || 0,
          participantCount: attributes.participantCount || 0,
          isActive: attributes.isActive !== undefined ? attributes.isActive : new Date() <= new Date(attributes.endDate),
          winner: attributes.winner,
          isPaid: attributes.isPaid || false,
          isCollected: attributes.isCollected || false,
          createdBy: attributes.createdBy || 'unknown',
        };
      }) : [];
      
      // Show ALL auctions, not just active ones
      setAuctions(transformedAuctions);
    } catch (error) {
      console.error('Error fetching auctions:', error);
      setError('Error al cargar las subastas');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyAuctions = async (): Promise<Bid[]> => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:1337/api';
      const token = localStorage.getItem('authToken');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
       'Accept': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const userId = localStorage.getItem('bidderId');
      const response = await fetch(`${API_BASE_URL}/auctions?populate[bids][populate]=bidder&filters[bids][bidder][id][$eq]=${userId }`, {
        headers
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const myAuctions = await response.json();
      setMyAuctions(myAuctions?.data);
    } catch (error) {
      console.error('Error fetching my auctions:', error);
      setError('Error al cargar mis subastas');
    }
  };
  // Fetch auctions when auctions tab is selected
  React.useEffect(() => {
    if (selectedTab === 'auctions') {
      fetchAuctions();
      fetchMyAuctions();
    }
  }, [selectedTab]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const formatTimeRemaining = (endDate: Date) => {
    const now = new Date();
    const diff = new Date(endDate).getTime() - now.getTime();
    
    if (diff <= 0) return 'Finalizada';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours < 12) {
      return `${hours}h ${minutes}m`;
    }
    
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h`;
  };

  const handleBid = (auctionId: string, amount: number) => {
    if (user) {
      const success = placeBid(auctionId, amount, user.id, user.username);
      if (success) {
        setShowBidModal(false);
        setSelectedAuction(null);
      }
    }
  };

  const getUserLastBid = (auctionId: string) => {
    return userBids
      .filter(bid => bid.auctionId === auctionId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-grey/10 p-1 rounded-lg">
        <button
          onClick={() => setSelectedTab('auctions')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            selectedTab === 'auctions'
              ? 'bg-green text-green-900'
              : 'text-grey border-green bg-white hover:bg-green/20'
          }`}
        >
          Subastas Activas
        </button>
        <button
          onClick={() => setSelectedTab('my-auctions')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            selectedTab === 'my-auctions'
              ? 'bg-green text-green-900'
              : 'text-grey border-green bg-white hover:bg-green/20'
          }`}
        >
          Mis Subastas
        </button>
        <button
          onClick={() => setSelectedTab('profile')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            selectedTab === 'profile'
              ? 'bg-green text-green-900'
              : 'text-grey border-green bg-white hover:bg-green/20'
          }`}
        >
          Mi Perfil
        </button>
      </div>

      {/* Active Auctions */}
      {selectedTab === 'auctions' && (
        <div>
          {loading && (
            <div className="text-center py-8">
              <div className="text-gray-600">Cargando subastas...</div>
            </div>
          )}
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}
          
          {!loading && !error && auctions.length === 0 && (
            <div className="text-center py-8">
              <div className="text-gray-600">No hay subastas disponibles en este momento</div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {auctions.map((auction) => (
              <div key={auction.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="relative">
                  <img
                    src={Array.isArray(auction.product.images) ? auction.product.images[0] : auction.product.images || 'https://images.pexels.com/photos/1037995/pexels-photo-1037995.jpeg?auto=compress&cs=tinysrgb&w=800'}
                    alt={auction.product.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className={`absolute top-4 left-4 px-2 py-1 rounded-full text-xs font-medium ${
                    !auction.isFinished && auction.isActive
                      ? 'bg-green-500 text-white'
                      : 'bg-red-500 text-white'
                  }`}>
                    {!auction.isFinished && auction.isActive ? 'Activa' : 'Finalizada'}
                  </div>
                  {auction.winner && (
                    <div className="absolute top-4 right-4 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                      Con ganador
                    </div>
                  )}
                </div>
                
                <div className="p-6">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{auction.auctionName}</h3>
                    <p className="text-gray-600 text-sm line-clamp-2">{auction.auctionDescription}</p>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">Producto:</span>
                        <span className="ml-1 font-medium">{auction.auctionName}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Precio inicial:</span>
                      <span className="font-bold text-blue-600">{formatCurrency(auction.product.startingPrice)}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Puja actual:</span>
                      <span className="text-xl font-bold text-green-600">{formatCurrency(auction.currentBid)}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span>{auction.participantCount} participantes</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                        <span>{auction.bidCount} pujas</span>
                      </div>
                    </div>
                    
                    <div className="text-sm">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-gray-500">Inicio:</span>
                        <span className="font-medium">{formatDate(auction.startDate)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Fin:</span>
                        <span className="font-medium">{formatDate(auction.endDate)}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span>{formatTimeRemaining(auction.endDate)}</span>
                      </div>
                    </div>
                    
                    {auction.winner && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2">
                        <div className="text-sm">
                          <span className="text-yellow-700 font-medium">Ganador: </span>
                          <span className="text-yellow-900">{auction.winner}</span>
                        </div>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className={`text-center py-1 px-2 rounded ${
                        auction.isPaid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {auction.isPaid ? '✓ Pagado' : '✗ No pagado'}
                      </div>
                      <div className={`text-center py-1 px-2 rounded ${
                        auction.isCollected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {auction.isCollected ? '✓ Recogido' : '✗ No recogido'}
                      </div>
                    </div>
                    
                    {auction.product.documents && (
                      <div className="text-sm">
                        <span className="text-gray-500">Documentos: </span>
                        <a 
                          href={auction.product.documents} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline"
                        >
                          Ver documento
                        </a>
                      </div>
                    )}
                  </div>
                  
                  {auction.isActive && new Date() <= auction.endDate ? (
                    <button
                      onClick={() => {
                        setSelectedAuction(auction.id);
                        setShowBidModal(true);
                      }}
                      className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-2 px-4 rounded-lg font-medium hover:from-green-700 hover:to-green-800 transition-all duration-200"
                    >
                      Participar en la puja
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full bg-gray-400 text-white py-2 px-4 rounded-lg font-medium cursor-not-allowed"
                    >
                      Subasta finalizada
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* My Auctions */}
      {selectedTab === 'my-auctions' && (
          console.log('myAuctions', myAuctions),
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myAuctions?.map((auction) => {
            const lastBid = getUserLastBid(auction.id);
            const isWinning = lastBid && lastBid.amount === auction.currentBid;
            
            return (
              <div key={auction.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="relative">
                  <img
                    src={Array.isArray(auction.product.images) ? auction.product.images[0] : auction.product.images || 'https://images.pexels.com/photos/1037995/pexels-photo-1037995.jpeg?auto=compress&cs=tinysrgb&w=800'}
                    alt={auction.product.name}
                    className="w-full h-48 object-cover"
                  />
                  {isWinning && (
                    <div className="absolute top-4 left-4 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                      Ganando
                    </div>
                  )}
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{auction.product.name}</h3>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Puja actual:</span>
                      <span className="text-xl font-bold text-green-600">{formatCurrency(auction.currentBid)}</span>
                    </div>
                    
                    {lastBid && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Mi última puja:</span>
                        <span className={`font-bold ${isWinning ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(lastBid.amount)}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span>{formatTimeRemaining(auction.endDate)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setSelectedAuction(auction.id);
                        setShowBidModal(true);
                      }}
                      className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-2 px-4 rounded-lg font-medium hover:from-green-700 hover:to-green-800 transition-all duration-200"
                    >
                      Pujar de nuevo
                    </button>
                    <button className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors">
                      Abandonar
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Profile */}
      {selectedTab === 'profile' && user && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Mi Perfil</h2>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="inline h-4 w-4 mr-1" />
                    Usuario
                  </label>
                  <input
                    type="text"
                    value={user.username}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="inline h-4 w-4 mr-1" />
                    Email
                  </label>
                  <input
                    type="email"
                    value={user.email}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de usuario
                  </label>
                  <input
                    type="text"
                    value={user.userType}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="inline h-4 w-4 mr-1" />
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={user.phone}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
              </div>
              
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Mis Pujas</h3>
                <div className="space-y-3">
                  {userBids.slice(0, 5).map((bid) => {
                    const auction = auctions.find(a => a.id === bid.auctionId);
                    return (
                      <div key={bid.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{auction?.product.name}</p>
                          <p className="text-sm text-gray-500">{bid.timestamp.toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">{formatCurrency(bid.amount)}</p>
                          <p className="text-sm text-gray-500">
                            {bid.amount === auction?.currentBid ? 'Ganando' : 'Superada'}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bid Modal */}
      {showBidModal && selectedAuction && (
        <BidModal
          auction={auctions.find(a => a.id === selectedAuction)!}
          onClose={() => {
            setShowBidModal(false);
            setSelectedAuction(null);
          }}
          onBid={handleBid}
        />
      )}
    </div>
  );
};

export default HomePage;
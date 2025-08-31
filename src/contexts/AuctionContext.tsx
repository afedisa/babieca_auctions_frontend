import React, { createContext, useContext, useEffect, useState } from 'react';
import { Auction, Bid, Product } from '../types';

interface AuctionContextType {
  auctions: Auction[];
  bids: Bid[];
  loading: boolean;
  error: string | null;
  createAuction: (auction: Omit<Auction, 'id' | 'bidCount' | 'participantCount' | 'currentBid' | 'isActive' | 'winner' | 'isPaid' | 'isCollected'>) => Promise<boolean>;
  placeBid: (auctionId: string, amount: number, userId: string, username: string) => Promise<boolean>;
  cancelAuction: (auctionId: string) => Promise<boolean>;
  getUserBids: (userId: string) => Bid[];
  getAuctionBids: (auctionId: string) => Bid[];
  getActiveAuctions: () => Auction[];
  getFinishedAuctions: () => Auction[];
  getUserAuctions: (userId: string) => Auction[];
  updateAuctionStatus: (auctionId: string, updates: Partial<Auction>) => Promise<boolean>;
  refreshData: () => Promise<void>;
}

const AuctionContext = createContext<AuctionContextType | undefined>(undefined);

export const useAuction = () => {
  const context = useContext(AuctionContext);
  if (!context) {
    throw new Error('useAuction must be used within an AuctionProvider');
  }
  return context;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:1337/api';

export const AuctionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [myAuctions, setMyAuctions] = useState<Auction[]>([]);
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper function to handle API errors
  const handleApiError = (error: any, defaultMessage: string) => {
    console.error(defaultMessage, error);
    const errorMessage = error.response?.data?.error?.message || error.message || defaultMessage;
    setError(errorMessage);
    return false;
  };

  // Helper function to transform API auction data
  const transformAuctionData = (apiAuction: any): Auction => {
    const attributes = apiAuction.attributes || apiAuction;
    return {
      id: apiAuction.id?.toString() || attributes.id?.toString(),
      product: {
        id: attributes.product?.id?.toString() || attributes.productId?.toString() || '1',
        name: attributes.product?.name || attributes.productName || '',
        description: attributes.product?.description || attributes.productDescription || '',
        images: attributes.product?.images || attributes.productImages || [],
        documents: attributes.product?.documents || attributes.productDocuments,
        startingPrice: attributes.product?.startingPrice || attributes.startingPrice || 0,
      },
      startDate: new Date(attributes.startDate),
      endDate: new Date(attributes.endDate),
      currentBid: attributes.currentBid || attributes.startingPrice || 0,
      bidCount: attributes.bidCount || 0,
      participantCount: attributes.participantCount || 0,
      isActive: attributes.isActive !== undefined ? attributes.isActive : true,
      winner: attributes.winner,
      isPaid: attributes.isPaid || false,
      isCollected: attributes.isCollected || false,
      createdBy: attributes.createdBy || 'unknown',
    };
  };

  // Helper function to transform API bid data
  const transformBidData = (apiBid: any): Bid => {
    const attributes = apiBid.attributes || apiBid;
    return {
      id: apiBid.id?.toString() || attributes.id?.toString(),
      auctionId: attributes.auctionId?.toString() || attributes.auction?.toString(),
      userId: attributes.userId || attributes.user,
      amount: attributes.amount || 0,
      timestamp: new Date(attributes.timestamp || attributes.createdAt),
      username: attributes.username || 'Unknown',
    };
  };

  // Fetch auctions from API
  const fetchAuctions = async (): Promise<Auction[]> => {
    try {
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
      
      // Handle both Strapi format and direct array format
      const auctionsData = data.data || data;
      const transformedAuctions = Array.isArray(auctionsData) 
        ? auctionsData.map(transformAuctionData)
        : [];
      
      return transformedAuctions;
    } catch (error) {
      console.error('Error fetching auctions:', error);
      return [];
    }
  };

  // Fetch bids from API
  const fetchBids = async (): Promise<Bid[]> => {
    try {
      const token = localStorage.getItem('authToken');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_BASE_URL}/bids?populate=*`, {
        headers
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      // Handle both Strapi format and direct array format
      const bidsData = data.data || data;
      const transformedBids = Array.isArray(bidsData) 
        ? bidsData.map(transformBidData)
        : [];
      
      return transformedBids;
    } catch (error) {
      console.error('Error fetching bids:', error);
      return [];
    }
  };

  const fetchMyAuctions = async (userId): Promise<Bid[]> => {
    try {
      const token = localStorage.getItem('authToken');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      if(!userId){
        userId = localStorage.getItem('bidderId');
      }
      //?populate[bids][populate]=bidder&filters[bids][bidder][id][$eq]=15
      const response = await fetch(`${API_BASE_URL}/auctions?populate[bids][populate]=bidder&filters[bids][bidder][id][$eq]=${userId}`, {
        headers
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const myAuctions = await response.json() || [];
      
      return myAuctions;
    } catch (error) {
      console.error('Error fetching bids:', error);
      return [];
    }
  };
  // Refresh data from API
  const refreshData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [auctionsData, myAuctionsData, bidsData] = await Promise.all([
        fetchAuctions(),
        fetchMyAuctions(),
        fetchBids()
      ]);
      setAuctions(auctionsData);
      setMyAuctions(myAuctionsData);
      setBids(bidsData);
    } catch (error) {
      handleApiError(error, 'Error refreshing data');
    } finally {
      setLoading(false);
    }
  };

  // Load initial data
  useEffect(() => {
    refreshData();
  }, []);

  // Create auction via API
  const createAuction = async (auctionData: Omit<Auction, 'id' | 'bidCount' | 'participantCount' | 'currentBid' | 'isActive' | 'winner' | 'isPaid' | 'isCollected'>): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('authToken');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const payload = {
        data: {
          productName: auctionData.product.name,
          productDescription: auctionData.product.description,
          productImages: auctionData.product.images,
          productDocuments: auctionData.product.documents,
          startingPrice: auctionData.product.startingPrice,
          startDate: auctionData.startDate.toISOString(),
          endDate: auctionData.endDate.toISOString(),
          currentBid: auctionData.product.startingPrice,
          bidCount: 0,
          participantCount: 0,
          isActive: new Date() >= auctionData.startDate && new Date() <= auctionData.endDate,
          isPaid: false,
          isCollected: false,
          createdBy: auctionData.createdBy,
        }
      };

      const response = await fetch(`${API_BASE_URL}/auctions`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await refreshData();
      return true;
    } catch (error) {
      return handleApiError(error, 'Error creating auction');
    } finally {
      setLoading(false);
    }
  };

  // Place bid via API
  const placeBid = async (auctionId: string, amount: number, userId: string, username: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    let bidder = {};
    try {
      const token = localStorage.getItem('authToken');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  try {
    const url = new URL(`${API_BASE_URL}/users/${userId}?populate=*`);
    const resBidder = await fetch(url.toString(), {
      headers
    });
    if (resBidder?.id) {
      console.log("❌ No se encontró ningún bidder para ese userId");
      return null;
    }

    bidder = await resBidder.json();
  } catch (error) {
    console.error("Error fetching bidder:", error);
    throw error;
  }
      // First, create the bid
      const bidPayload = {
        data: {
          auction: auctionId,
          isWinner: true,
          bidder: bidder.id,
          bidPrice: amount,
          bidDate: new Date().toISOString()
        }
      };
      const bidResponse = await fetch(`${API_BASE_URL}/bids`, {
        method: 'POST',
        headers,
        body: JSON.stringify(bidPayload),
      });

      if (!bidResponse.ok) {
        throw new Error(`HTTP error! status: ${bidResponse.status}`);
      }

      // Refresh data to ensure consistency with server
      setTimeout(() => window.location.reload() , 500);
      return true;
    } catch (error) {
      return handleApiError(error, 'Error placing bid');
    } finally {
      setLoading(false);
    }
  };

  // Cancel auction via API
  const cancelAuction = async (auctionId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('authToken');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const payload = {
        data: {
          isActive: false,
        }
      };

      const response = await fetch(`${API_BASE_URL}/auctions/${auctionId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await refreshData();
      return true;
    } catch (error) {
      return handleApiError(error, 'Error canceling auction');
    } finally {
      setLoading(false);
    }
  };

  // Update auction status via API
  const updateAuctionStatus = async (auctionId: string, updates: Partial<Auction>): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('authToken');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const payload = {
        data: updates
      };

      const response = await fetch(`${API_BASE_URL}/auctions/${auctionId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await refreshData();
      return true;
    } catch (error) {
      return handleApiError(error, 'Error updating auction status');
    } finally {
      setLoading(false);
    }
  };

  // Local filtering functions (these work with the fetched data)
  const getUserBids = (userId: string) => {
    return bids.filter(bid => bid.userId === userId);
  };

  const getAuctionBids = (auctionId: string) => {
    return bids.filter(bid => bid.auctionId === auctionId).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  };

  const getActiveAuctions = () => {
    return auctions.filter(auction => auction.isActive && new Date() <= auction.endDate);
  };

  const getFinishedAuctions = () => {
    return auctions.filter(auction => !auction.isActive || new Date() > auction.endDate);
  };

  const getUserAuctions = async (userId: string) => {
    const myAuctions = await fetchMyAuctions(userId);
    console.log('myAuctions', myAuctions?.data?.data);
    return myAuctions.data;
  };

  return (
    <AuctionContext.Provider value={{
      auctions,
      bids,
      loading,
      error,
      createAuction,
      placeBid,
      cancelAuction,
      getUserBids,
      getAuctionBids,
      getActiveAuctions,
      getFinishedAuctions,
      getUserAuctions,
      updateAuctionStatus,
      refreshData,
    }}>
      {children}
    </AuctionContext.Provider>
  );
};
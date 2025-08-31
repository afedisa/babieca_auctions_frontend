export interface User {
  id: string;
  username: string;
  email: string;
  userType: 'particular' | 'profesional';
  phone: string;
  role: 'user' | 'admin' | 'superadmin';
  isBlocked: boolean;
  createdAt: Date;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  images: string[];
  documents?: string;
  startingPrice: number;
}

export interface Auction {
  id: string;
  product: Product;
  startDate: Date;
  endDate: Date;
  currentBid: number;
  bidCount: number;
  participantCount: number;
  isActive: boolean;
  winner?: string;
  isPaid: boolean;
  isCollected: boolean;
  createdBy: string;
}

export interface Bid {
  id: string;
  auctionId: string;
  userId: string;
  amount: number;
  timestamp: Date;
  username: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
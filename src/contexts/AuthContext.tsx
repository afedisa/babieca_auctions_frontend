import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, AuthState } from '../types';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: {
    email: string;
    password: string;
    username: string;
    userType: 'particular' | 'profesional';
    phone: string;
  }) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  sendPasswordReset: (email: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:1337/api';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Check for existing token on app load
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('authToken');
      const userData = localStorage.getItem('userData');
      
      if (token && userData) {
        try {
          // Verify token is still valid by making a request to protected endpoint
          const response = await fetch(`${API_BASE_URL}/users/me`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          
          if (response.ok) {
            const user = JSON.parse(userData);
            setAuthState({
              user,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            // Token is invalid, clear storage
            localStorage.removeItem('authToken');
            localStorage.removeItem('userData');
            setAuthState({
              user: null,
              isAuthenticated: false,
              isLoading: false,
            });
          }
        } catch (error) {
          console.error('Error verifying token:', error);
          localStorage.removeItem('authToken');
          localStorage.removeItem('userData');
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      } else {
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/local`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        body: JSON.stringify({
          identifier: email,
          password: password,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Login error:', errorData);
        return false;
      }

      const data = await response.json();
      const { jwt, user: strapiUser } = data;

      // Check if user is blocked
      if (strapiUser.isBlocked) {
        return false;
      }

      // Transform Strapi user to our User type
      const user: User = {
        doc: strapiUser.documentId,
        id: strapiUser.id.toString(),
        username: strapiUser.username,
        email: strapiUser.email,
        userType: strapiUser.userType || 'particular',
        phone: strapiUser.phone || '',
        role: strapiUser.role ||'bidder',
        isBlocked: strapiUser.isBlocked || false,
        createdAt: new Date(strapiUser.createdAt),
      };

      const responseBidder = await fetch(`${API_BASE_URL}/users/${strapiUser.id.toString()}?populate=*`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`,
        }
      });

      const bidder = await responseBidder.json();
      console.log('bidder', bidder);
      console.log('bidderId', bidder.id);
      // Store token and user data
      localStorage.setItem('authToken', jwt);
      localStorage.setItem('userData', JSON.stringify(user));
      localStorage.setItem('bidderId', bidder.id);

      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });

      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (userData: {
    email: string;
    password: string;
    username: string;
    userType: 'Particular' | 'Profesional';
    phone: string;
  }): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/local/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        body: JSON.stringify({
          username: userData.username,
          email: userData.email,
          password: userData.password,
          userType: userData.userType || 'Particular',
          phone: userData.phone,
          role: 'Bidder',
          blocked: false,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Registration error:', errorData);
        return errorData;
      }

      const data = await response.json();
      const { jwt, user: strapiUser } = data;

      // Transform Strapi user to our User type
      const user: User = {
        id: strapiUser.id.toString(),
        username: strapiUser.username,
        email: strapiUser.email,
        userType: strapiUser.userType || 'particular',
        phone: strapiUser.phone || '',
        role: strapiUser.role || 'user',
        isBlocked: strapiUser.isBlocked || false,
        createdAt: new Date(strapiUser.createdAt),
      };

      // Store token and user data
      localStorage.setItem('authToken', jwt);
      localStorage.setItem('userData', JSON.stringify(user));

      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });

      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      // Clear local storage
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      localStorage.removeItem('bidderId');

      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    if (!authState.user) return;
    
    try {
      const token = localStorage.getItem('authToken');
      if (!token || token === 'root-token') {
        // For root user or no token, just update locally
        const updatedUser = { ...authState.user, ...userData };
        setAuthState(prev => ({ ...prev, user: updatedUser }));
        localStorage.setItem('userData', JSON.stringify(updatedUser));
        return;
      }

      const response = await fetch(`${API_BASE_URL}/users/${authState.user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        const updatedUser = { ...authState.user, ...userData };
        setAuthState(prev => ({ ...prev, user: updatedUser }));
        localStorage.setItem('userData', JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const sendPasswordReset = async (email: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Password reset error:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{
      ...authState,
      login,
      register,
      logout,
      updateUser,
      sendPasswordReset,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
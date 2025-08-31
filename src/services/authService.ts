// This file is now deprecated as authentication is handled directly in AuthContext
// using Strapi API instead of Firebase

export class AuthService {
  // Placeholder class - all methods moved to AuthContext
  static async getAllUsers() {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:1337/api';
    const token = localStorage.getItem('authToken');
    
    if (!token || token === 'root-token') {
      // Return mock data for root user or when no token
      return [];
    }

    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const users = await response.json();
      return users.map((user: any) => ({
        id: user.id.toString(),
        username: user.username,
        email: user.email,
        userType: user.userType || 'particular',
        phone: user.phone || '',
        role: user.role || 'user',
        isBlocked: user.isBlocked || false,
        createdAt: new Date(user.createdAt),
      }));
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  }

  static async updateUserStatus(userId: string, updates: any) {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:1337/api';
    const token = localStorage.getItem('authToken');
    
    if (!token || token === 'root-token') {
      return true; // Mock success for root user
    }

    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      return response.ok;
    } catch (error) {
      console.error('Error updating user:', error);
      return false;
    }
  }

  static async deleteUser(userId: string) {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:1337/api';
    const token = localStorage.getItem('authToken');
    
    if (!token || token === 'root-token') {
      return true; // Mock success for root user
    }

    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      return response.ok;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  }

  static async createUserByAdmin(userData: any) {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:1337/api';
    const token = localStorage.getItem('authToken');
    
    if (!token || token === 'root-token') {
      return { success: true, error: null }; // Mock success for root user
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/local/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: userData.username,
          email: userData.email,
          password: userData.password,
          userType: userData.userType,
          phone: userData.phone,
          role: userData.role,
          isBlocked: false,
        }),
      });

      if (response.ok) {
        return { success: true, error: null };
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.message || 'Error creating user' };
      }
    } catch (error: any) {
      console.error('Error creating user:', error);
      return { success: false, error: error.message };
    }
  }
}
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import apiClient from '../api/client';

// Adjust this interface based on your Prisma User schema
interface User {
  id: string;
  email: string;
  role: string; 
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check for an existing token on app mount
  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const token = await SecureStore.getItemAsync('jwt');
        if (token) {
          // Note: In a full production app, you might want to hit a '/api/auth/me' 
          // endpoint here to validate the token and fetch the fresh user profile.
          // For now, if a token exists, we'll establish a temporary session state.
          setUser({ id: 'temp-id', email: 'provider@example.com', role: 'PROVIDER' }); 
        }
      } catch (error) {
        console.error('Failed to restore auth token', error);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapAsync();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      // Hit your Express backend
      const response = await apiClient.post('/auth/login', { email, password });
      
      const { token, user: userData } = response.data;
      
      // Store the token securely
      await SecureStore.setItemAsync('jwt', token);
      
      // Update global state
      setUser(userData);
    } catch (error) {
      console.error('Login failed:', error);
      throw error; 
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync('jwt');
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
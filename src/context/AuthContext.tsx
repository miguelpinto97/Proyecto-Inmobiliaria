import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

interface User {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  roles: string[];
  maxproperties: number;
  phone?: string;
  address?: string;
  district?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, userData: User) => void;
  logout: () => void;
  loginWithGoogle: (idToken: string, role?: string) => Promise<void>;
  isLoading: boolean;
  isProfileComplete: () => boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

import { userService } from '../services/api';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const res = await userService.getProfile();
      const updatedUser = { ...res.data, roles: user?.roles || [] };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (err) {
      console.error('Error refreshing user', err);
    }
  };

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      try {
        const decoded: any = jwtDecode(savedToken);
        const currentTime = Date.now() / 1000;
        if (decoded.exp > currentTime) {
          setToken(savedToken);
          const savedUser = localStorage.getItem('user');
          if (savedUser) {
            const parsedUser = JSON.parse(savedUser);
            setUser({ ...parsedUser, roles: parsedUser.roles || [] });
          }
        } else {
          logout();
        }
      } catch (e) {
        logout();
      }
    }
    setIsLoading(false);
  }, []);

  const login = (newToken: string, userData: User) => {
    setToken(newToken);
    setUser(userData);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const loginWithGoogle = async (idToken: string, role?: string) => {
    const { authService } = await import('../services/api');
    try {
      const res = await authService.loginWithGoogle(idToken, role);
      const { token: newToken, user: userData } = res.data;
      login(newToken, userData);
    } catch (err) {
      console.error('Google Login Error:', err);
      throw err;
    }
  };

  const isProfileComplete = () => {
    if (!user) return false;
    return !!(user.firstname && user.lastname && user.phone && user.address && user.district);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loginWithGoogle, isLoading, isProfileComplete, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

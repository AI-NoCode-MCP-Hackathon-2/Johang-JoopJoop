import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../utils/api';

export type AuthProviderType = 'email' | 'kakao' | 'google' | 'naver';
export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  provider: AuthProviderType;
  role: UserRole;
  remainingChecksToday: number;
  lastCheckDate?: string;
  password?: string;
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isAuthLoading: boolean;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  signupWithEmail: (name: string, email: string, password: string) => Promise<void>;
  loginWithProvider: (provider: AuthProviderType) => Promise<void>;
  logout: () => void;
  updateProfile: (data: { name?: string; email?: string }) => Promise<void>;
  changePassword: (params: { currentPassword: string; newPassword: string }) => Promise<void>;
  deleteAccount: () => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
  canUseCheck: () => boolean;
  consumeCheck: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Helper functions for social login
const determineRole = (email: string): UserRole => {
  return email.includes('admin') ? 'admin' : 'user';
};

const getTodayStr = (): string => {
  return new Date().toISOString().split('T')[0];
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(false);


  // Initialize from JWT token validation
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('jj_access_token');
      if (token) {
        try {
          setIsAuthLoading(true);
          const { data } = await api.get('/auth/me');
          const userData: User = {
            id: data.data.user.id,
            name: data.data.user.name,
            email: data.data.user.email,
            provider: data.data.user.provider,
            role: data.data.user.role,
            remainingChecksToday: data.data.user.remainingChecksToday,
            lastCheckDate: data.data.user.lastCheckDate,
          };
          setUser(userData);
        } catch (error) {
          console.error('토큰 검증 실패:', error);
          localStorage.removeItem('jj_access_token');
          localStorage.removeItem('jj_refresh_token');
        } finally {
          setIsAuthLoading(false);
        }
      }
    };

    initAuth();
  }, []);

  const syncRemainingChecks = async () => {
    try {
      const { data } = await api.get('/users/remaining-checks');
      if (user) {
        setUser({
          ...user,
          remainingChecksToday: data.data.remainingChecks,
        });
      }
    } catch (error) {
      console.error('남은 횟수 동기화 실패:', error);
    }
  };

  const loginWithEmail = async (email: string, password: string) => {
    setIsAuthLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });

      localStorage.setItem('jj_access_token', data.data.accessToken);
      localStorage.setItem('jj_refresh_token', data.data.refreshToken);

      const userData: User = {
        id: data.data.user.id,
        name: data.data.user.name,
        email: data.data.user.email,
        provider: data.data.user.provider,
        role: data.data.user.role,
        remainingChecksToday: data.data.user.remainingChecksToday,
        lastCheckDate: data.data.user.lastCheckDate,
      };

      setUser(userData);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '로그인에 실패했습니다');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const signupWithEmail = async (name: string, email: string, password: string) => {
    setIsAuthLoading(true);
    try {
      const { data } = await api.post('/auth/signup', { name, email, password });

      localStorage.setItem('jj_access_token', data.data.accessToken);
      localStorage.setItem('jj_refresh_token', data.data.refreshToken);

      const userData: User = {
        id: data.data.user.id,
        name: data.data.user.name,
        email: data.data.user.email,
        provider: data.data.user.provider,
        role: data.data.user.role,
        remainingChecksToday: data.data.user.remainingChecksToday,
        lastCheckDate: data.data.user.lastCheckDate,
      };

      setUser(userData);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '회원가입에 실패했습니다');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const loginWithProvider = async (provider: AuthProviderType) => {
    setIsAuthLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));

    let name = '사용자';
    let email = 'user@example.com';

    switch (provider) {
      case 'kakao':
        name = '김카카오';
        email = 'kakao_user@example.com';
        break;
      case 'naver':
        name = '이네이버';
        email = 'naver_user@example.com';
        break;
      case 'google':
        name = 'Google User';
        email = 'google_user@gmail.com';
        break;
    }

    const mockUser: User = {
      id: `mock-${provider}-id-` + Math.random().toString(36).substr(2, 9),
      name,
      email,
      provider,
      role: determineRole(email),
      remainingChecksToday: 5,
      lastCheckDate: getTodayStr(),
    };

    setUser(mockUser);
    setIsAuthLoading(false);
  };

  const logout = () => {
    localStorage.removeItem('jj_access_token');
    localStorage.removeItem('jj_refresh_token');
    setUser(null);
  };

  const updateProfile = async (data: { name?: string; email?: string }) => {
    if (!user) return;
    setIsAuthLoading(true);
    try {
      const { data: responseData } = await api.put('/users/profile', data);

      const updatedUser: User = {
        ...user,
        name: responseData.data.user.name,
        email: responseData.data.user.email,
        role: responseData.data.user.role,
      };

      setUser(updatedUser);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '프로필 수정에 실패했습니다');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const changePassword = async ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) => {
    if (!user) throw new Error("로그인이 필요합니다.");
    setIsAuthLoading(true);
    try {
      await api.post('/auth/change-password', { currentPassword, newPassword });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '비밀번호 변경에 실패했습니다');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const deleteAccount = async () => {
    if (!user) return;
    setIsAuthLoading(true);
    try {
      await api.delete('/users/account');
      localStorage.removeItem('jj_access_token');
      localStorage.removeItem('jj_refresh_token');
      setUser(null);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '계정 삭제에 실패했습니다');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const sendPasswordResetEmail = async (email: string) => {
    setIsAuthLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsAuthLoading(false);
  };

  const canUseCheck = () => {
    if (!user) return false;
    return user.remainingChecksToday > 0;
  };

  const consumeCheck = async () => {
    await syncRemainingChecks();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isAuthLoading,
        loginWithEmail,
        signupWithEmail,
        loginWithProvider,
        logout,
        updateProfile,
        changePassword,
        deleteAccount,
        sendPasswordResetEmail,
        canUseCheck,
        consumeCheck,
      }}
    >
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
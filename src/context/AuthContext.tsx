import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, NotificationItem } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; message?: string }>;
  register: (data: Partial<User> & { password?: string }) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  switchDemoRole: (role: UserRole) => Promise<void>;
  updateUser: (updated: Partial<User>) => void;
  notifications: NotificationItem[];
  unreadNotificationCount: number;
  markNotificationAsRead: (id: string) => void;
  refreshNotifications: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('vetcare_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const fetchCurrentUser = async (authToken: string) => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        fetchNotifications(authToken);
      } else {
        localStorage.removeItem('vetcare_token');
        setToken(null);
        setUser(null);
      }
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  const fetchNotifications = async (authToken?: string) => {
    const t = authToken || token;
    if (!t) return;
    try {
      const res = await fetch('/api/notifications', {
        headers: { Authorization: `Bearer ${t}` },
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('vetcare_token');
    if (storedToken) {
      setToken(storedToken);
      fetchCurrentUser(storedToken);
    } else {
      // Default to demo user if no token so the preview starts interactive immediately
      // But we can authenticate automatically as demo user or prompt login
      autoLoginDemo('USER');
    }
  }, []);

  const autoLoginDemo = async (role: UserRole) => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/auth/demo-switch?role=${role}`);
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('vetcare_token', data.token);
        fetchNotifications(data.token);
      }
    } catch (err) {
      console.error('Auto login error', err);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password?: string) => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: password || 'password123' }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('vetcare_token', data.token);
        fetchNotifications(data.token);
        return { success: true };
      }
      return { success: false, message: data.error || 'Invalid credentials' };
    } catch {
      return { success: false, message: 'Network connection failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: Partial<User> & { password?: string }) => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const resData = await res.json();
      if (res.ok && resData.token) {
        setUser(resData.user);
        setToken(resData.token);
        localStorage.setItem('vetcare_token', resData.token);
        fetchNotifications(resData.token);
        return { success: true };
      }
      return { success: false, message: resData.error || 'Registration failed' };
    } catch {
      return { success: false, message: 'Network error during registration' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('vetcare_token');
    setToken(null);
    setUser(null);
    setNotifications([]);
  };

  const switchDemoRole = async (role: UserRole) => {
    await autoLoginDemo(role);
  };

  const updateUser = (updated: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updated });
    }
  };

  const markNotificationAsRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    if (token) {
      await fetch(`/api/notifications/${id}/read`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
  };

  const unreadNotificationCount = notifications.filter((n) => !n.read).length;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        switchDemoRole,
        updateUser,
        notifications,
        unreadNotificationCount,
        markNotificationAsRead,
        refreshNotifications: () => fetchNotifications(),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

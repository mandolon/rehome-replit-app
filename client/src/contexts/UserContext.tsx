import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { User, UserContextType } from '@/types/user';
import { TEAM_USERS } from '@/utils/teamUsers';
import { getUserCustomizations, saveUserCustomizations } from '@/utils/userCustomizations';

const UserContext = createContext<UserContextType & {
  isImpersonating: boolean;
  impersonatedUser: User | null;
  impersonateAs: (userId: string) => void;
  exitImpersonation: () => void;
  loginAs: (userId: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
} | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

const LOCAL_STORAGE_KEY = 'lovable-demo-auth-userid';

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Use avatarColor from TEAM_USERS (never from 'avatar' field!)
  const findUserById = (userId: string): User | null => {
    const u = TEAM_USERS.find(u => u.id === userId);
    if (!u) return null;
    const custom = getUserCustomizations(userId);
    return {
      id: u.id,
      name: u.fullName,
      email: u.email,
      avatar: u.avatar,
      status: u.status === "Active" ? "online" : u.status === "Inactive" ? "offline" : "away",
      bio: "",
      company: "",
      role: u.role,
      lastActive: u.lastActive || "",
      notificationsMuted: false,
      showOnlineStatus: true,
      showLastActive: true,
      avatarColor: custom.avatarColor || u.avatarColor || 'bg-gray-600'
    };
  };

  // Load persisted userId
  const persistedUserId = typeof window !== "undefined" ? window.localStorage.getItem(LOCAL_STORAGE_KEY) : null;
  const defaultUser = persistedUserId ? findUserById(persistedUserId) : null;

  // State: originalUser is the admin, currentUser is the logged-in user
  const [originalUser, setOriginalUser] = useState<User | null>(defaultUser);
  const [currentUser, setCurrentUser] = useState<User | null>(defaultUser);
  const [impersonatedUser, setImpersonatedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const isImpersonating = !!impersonatedUser;
  const isAuthenticated = !!currentUser;

  // Login as a given userId
  const loginAs = useCallback((userId: string) => {
    setLoading(true);
    const user = findUserById(userId);
    if (user) {
      setOriginalUser(user);
      setCurrentUser(user);
      setImpersonatedUser(null);
      window.localStorage.setItem(LOCAL_STORAGE_KEY, userId);
    }
    setLoading(false);
  }, []);

  // Logout: clear auth and session
  const logout = useCallback(() => {
    setOriginalUser(null);
    setCurrentUser(null);
    setImpersonatedUser(null);
    window.localStorage.removeItem(LOCAL_STORAGE_KEY);
  }, []);

  // Impersonation
  const impersonateAs = useCallback((userId: string) => {
    if (!originalUser || userId === originalUser.id) return;
    const user = findUserById(userId);
    if (user) {
      setImpersonatedUser(user);
      setCurrentUser(user);
    }
  }, [originalUser]);

  const exitImpersonation = useCallback(() => {
    if (originalUser) {
      setImpersonatedUser(null);
      setCurrentUser(originalUser);
    }
  }, [originalUser]);

  // Basic "update" logic as before
  const updateUserStatus = (status: User['status']) => {
    setCurrentUser(prev => prev ? { ...prev, status } : prev);
  };

  const toggleNotifications = () => {
    setCurrentUser(prev => prev ? { ...prev, notificationsMuted: !prev.notificationsMuted } : prev);
  };

  const updateUser = (updates: Partial<User>) => {
    setCurrentUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      if (updates.avatarColor && typeof window !== "undefined") {
        saveUserCustomizations(prev.id, { avatarColor: updates.avatarColor });
      }
      return updated;
    });
  };

  // Effect: Sync on mount with localStorage/user
  useEffect(() => {
    if (!currentUser && persistedUserId) {
      const user = findUserById(persistedUserId);
      if (user) {
        setOriginalUser(user);
        setCurrentUser(user);
      }
    } else if (currentUser) {
    } else {
    }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // only run on mount

  // Only render children once loading is done
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></span>
        <span className="ml-3">Loading authentication...</span>
      </div>
    );
  }

  return (
    <UserContext.Provider value={{
      currentUser,
      updateUserStatus,
      toggleNotifications,
      updateUser,
      isImpersonating,
      impersonatedUser,
      impersonateAs,
      exitImpersonation,
      loginAs,
      logout,
      isAuthenticated,
    }}>
      {children}
    </UserContext.Provider>
  );
};

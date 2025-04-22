import React, { createContext, useContext } from 'react';
import { useAuth } from './AuthContext';

interface UserEmailContextType {
  userEmail: string | null;
  setUserEmail: (email: string) => void;
  isEmailLoaded: boolean;
}

const UserEmailContext = createContext<UserEmailContextType | undefined>(undefined);

export function UserEmailProvider({ children }: { children: React.ReactNode }) {
  const { userEmail, isAuthenticated } = useAuth();

  // This is now just a pass-through from AuthContext
  return (
    <UserEmailContext.Provider value={{ 
      userEmail, 
      setUserEmail: () => {}, // No-op since we manage email in AuthContext
      isEmailLoaded: isAuthenticated
    }}>
      {children}
    </UserEmailContext.Provider>
  );
}

export function useUserEmail() {
  const context = useContext(UserEmailContext);
  if (context === undefined) {
    throw new Error('useUserEmail must be used within a UserEmailProvider');
  }
  return context;
}

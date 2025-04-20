import React, { createContext, useContext, useState, useEffect } from 'react';

interface UserEmailContextType {
  userEmail: string | null;
  setUserEmail: (email: string) => void;
}

const UserEmailContext = createContext<UserEmailContextType | undefined>(undefined);

export function UserEmailProvider({ children }: { children: React.ReactNode }) {
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserEmail = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/api/get_user_email');
        const data = await response.json();
        if (data.email) {
          setUserEmail(data.email);
        }
      } catch (error) {
        console.error('Error fetching user email:', error);
      }
    };

    fetchUserEmail();
  }, []);

  return (
    <UserEmailContext.Provider value={{ userEmail, setUserEmail }}>
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

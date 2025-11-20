'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@auth0/nextjs-auth0/client';

// Custom User type with database fields
interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
  barangay_id?: string;
  picture?: string;
}

interface AuthContextType {
  user: User | null;
  auth0User: any;
  loading: boolean;
  signIn: () => void;
  signUp: (invitationToken?: string) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  auth0User: null,
  loading: true,
  signIn: () => {},
  signUp: () => {},
  signOut: () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { user: auth0User, error: auth0Error, isLoading } = useUser();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const syncUser = async () => {
      if (auth0User) {
        try {
          console.log('🔄 Syncing Auth0 user with database:', auth0User.email);
          
          // Sync Auth0 user with our database
          const response = await fetch('/api/auth/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              auth0_id: auth0User.sub,
              email: auth0User.email,
              name: auth0User.name,
              picture: auth0User.picture,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            setUser(data.user);
            console.log('✅ User synced:', data.user.email, 'Role:', data.user.role);
          } else {
            console.error('Failed to sync user');
          }
        } catch (error) {
          console.error('Error syncing user:', error);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    if (!isLoading) {
      syncUser();
    }
  }, [auth0User, isLoading]);

  const signIn = () => {
    // Redirect to Auth0 login
    window.location.href = '/api/auth/login';
  };

  const signUp = (invitationToken?: string) => {
    // Redirect to Auth0 signup with optional invitation token
    const params = invitationToken ? `?invitation_token=${encodeURIComponent(invitationToken)}` : '';
    window.location.href = `/api/auth/signup${params}`;
  };

  const signOut = () => {
    // Redirect to Auth0 logout
    window.location.href = '/api/auth/logout';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        auth0User,
        loading: loading || isLoading,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

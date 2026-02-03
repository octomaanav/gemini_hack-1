import { useState, useEffect } from 'react';
import type { User, AuthData, UseAuthReturn } from '../types';
import { apiUrl } from '../utils/api';

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(apiUrl('/api/auth/me'), {
        credentials: 'include'
      });

      if (response.ok) {
        const data: AuthData = await response.json();
        setUser(data.user);
      } else if (response.status === 401) {
        setUser(null);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch user');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isProfileComplete: user?.isProfileComplete ?? false,
    error,
    refetch: fetchUser
  };
};
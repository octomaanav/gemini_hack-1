import { useAuthContext } from '../context/AuthContext';
import type { UseAuthReturn } from '../types';

export const useAuth = (): UseAuthReturn => {
  return useAuthContext();
};
import { useAuth as useAuthContext } from '@/contexts/auth-context';

export function useAuth() {
  return useAuthContext();
}

export function useUser() {
  const { user } = useAuthContext();
  return user;
}
import { atom } from 'jotai';
import type { User } from '@supabase/supabase-js';

interface AuthState {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: User | null;
}

export const authAtom = atom<AuthState>({
  isLoading: true,
  isAuthenticated: false,
  user: null,
});

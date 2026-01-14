import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export const logout = async () => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
};

export const useLogout = () => {
  return useMutation({
    mutationFn: logout,
  });
};

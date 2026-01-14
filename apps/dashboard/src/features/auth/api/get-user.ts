import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export const getUser = async () => {
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  return data.user;
};

export const useGetUser = () => {
  return useQuery({
    queryKey: ['user'],
    queryFn: getUser,
    retry: false,
  });
};

import { useGetUser } from '../api/get-user';

export const useAuth = () => {
  const { data: user, isLoading } = useGetUser();

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
};

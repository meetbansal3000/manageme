// Hook: Authentication Context & Session Management

import { useAuth as useAuthContext } from '../context/AuthContext';

export const useAuth = () => {
  return useAuthContext();
};

export default useAuth;

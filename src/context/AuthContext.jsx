import { createContext, useContext, useState, useEffect } from 'react';
import authApi from '../api/authApi';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Hàm bổ trợ để kiểm tra Role nhanh
  const hasRole = (roleName) => {
    return user?.roles?.includes(roleName);
  };

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          // 1. Gọi API /me để lấy thông tin chi tiết
          const response = await authApi.getProfile();
          
          // 2. Map dữ liệu từ response.data.result vào state user
          // Kết cấu: { username: "user006", email: "...", roles: [...] }
          setUser(response.data.result); 
        } catch (err) {
          console.error("Auth check failed:", err);
          localStorage.removeItem('access_token');
          setUser(null);
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const response = await authApi.login(credentials);
      
      const profileRes = await authApi.getProfile();
      setUser(profileRes.data.result);
      
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.error("Logout API error:", err);
    } finally {
      localStorage.removeItem('access_token');
      setUser(null);
      window.location.href = '/login';
    }
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    hasRole, 
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
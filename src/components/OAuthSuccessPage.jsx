import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const OAuthSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();

  useEffect(() => {
    const handleOAuthLogin = async () => {
      const accessToken = searchParams.get('accessToken');

      if (!accessToken) {
        navigate('/login', { replace: true });
        return;
      }

      try {
        await loginWithToken(accessToken);
        navigate('/dashboard', { replace: true });
      } catch (error) {
        console.error('Google login failed:', error);
        navigate('/login', { replace: true });
      }
    };

    handleOAuthLogin();
  }, [searchParams, loginWithToken, navigate]);

  return <div>Đang đăng nhập với Google...</div>;
};

export default OAuthSuccessPage;

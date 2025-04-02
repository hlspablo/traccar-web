import React from 'react';
import {
  Route, Routes,
  useNavigate,
} from 'react-router-dom';
import MainPage from './main/MainPage';
import App from './App';
import LoginPage from './login/LoginPage';
import RegisterPage from './login/RegisterPage';
import ResetPasswordPage from './login/ResetPasswordPage';
import PrivacyPage from './login/PrivacyPage';
import BillingPage from './login/BillingPage';
import SupportPage from './login/SupportPage';
import useQuery from './common/util/useQuery';
import { useEffectAsync } from './reactHelper';

const Navigation = () => {
  const query = useQuery();
  const navigate = useNavigate();

  useEffectAsync(async () => {
    if (query.get('token')) {
      const token = query.get('token');
      const response = await fetch(`/api/session?token=${encodeURIComponent(token)}`);

      // If the token is valid, store it and continue to the requested page
      // Otherwise fallback to the home page
      if (response.ok) {
        const redirectPath = window.location.pathname;
        // If already on login page, go to home, otherwise stay on current page
        if (redirectPath === '/login') {
          navigate(`/?token=${token}`);
        } else {
          navigate(`${redirectPath}?token=${token}`);
        }
      } else {
        navigate('/login');
      }
    }
  }, [query]);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/billing" element={<BillingPage />} />
      <Route path="/support" element={<SupportPage />} />
      <Route path="/" element={<App />}>
        <Route index element={<MainPage />} />
      </Route>
    </Routes>
  );
};

export default Navigation;

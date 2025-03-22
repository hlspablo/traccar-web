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
import useQuery from './common/util/useQuery';
import { useEffectAsync } from './reactHelper';

const Navigation = () => {
  const query = useQuery();
  const navigate = useNavigate();

  useEffectAsync(async () => {
    if (query.get('token')) {
      const token = query.get('token');
      await fetch(`/api/session?token=${encodeURIComponent(token)}`);
      navigate(`/?token=${token}`);
    }
  }, [query]);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/" element={<App />}>
        <Route index element={<MainPage />} />
      </Route>
    </Routes>
  );
};

export default Navigation;

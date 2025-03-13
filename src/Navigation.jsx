import React from 'react';
import {
  Route, Routes,
} from 'react-router-dom';
import MainPage from './main/MainPage';
import App from './App';
import LoginPage from './login/LoginPage';
import RegisterPage from './login/RegisterPage';
import ResetPasswordPage from './login/ResetPasswordPage';

const Navigation = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="/reset-password" element={<ResetPasswordPage />} />
    <Route path="/" element={<App />}>
      <Route index element={<MainPage />} />
    </Route>
  </Routes>
);

export default Navigation;

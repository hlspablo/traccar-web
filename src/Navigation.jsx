import React from 'react';
import {
  Route, Routes,
} from 'react-router-dom';
import MainPage from './main/MainPage';
import PositionPage from './other/PositionPage';
import NetworkPage from './other/NetworkPage';
import GeofencesPage from './other/GeofencesPage';
import EventPage from './other/EventPage';
import App from './App';
import LoginPage from './login/LoginPage';
import RegisterPage from './login/RegisterPage';
import ResetPasswordPage from './login/ResetPasswordPage';
import ChangeServerPage from './login/ChangeServerPage';

const Navigation = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="/reset-password" element={<ResetPasswordPage />} />
    <Route path="/change-server" element={<ChangeServerPage />} />
    <Route path="/" element={<App />}>
      <Route index element={<MainPage />} />

      <Route path="position/:id" element={<PositionPage />} />
      <Route path="network/:positionId" element={<NetworkPage />} />
      <Route path="event/:id" element={<EventPage />} />
      <Route path="geofences" element={<GeofencesPage />} />
    </Route>
  </Routes>
);

export default Navigation;

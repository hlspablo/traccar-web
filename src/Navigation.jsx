import React from 'react';
import {
  Route, Routes,
} from 'react-router-dom';
import MainPage from './main/MainPage';
import CombinedReportPage from './reports/CombinedReportPage';
import RouteReportPage from './reports/RouteReportPage';
import PositionPage from './other/PositionPage';
import NetworkPage from './other/NetworkPage';
import EventReportPage from './reports/EventReportPage';
import TripReportPage from './reports/TripReportPage';
import StopReportPage from './reports/StopReportPage';
import SummaryReportPage from './reports/SummaryReportPage';
import ChartReportPage from './reports/ChartReportPage';
import StatisticsPage from './reports/StatisticsPage';
import LoginPage from './login/LoginPage';
import RegisterPage from './login/RegisterPage';
import ResetPasswordPage from './login/ResetPasswordPage';
import GeofencesPage from './other/GeofencesPage';
import EventPage from './other/EventPage';
import App from './App';
import ChangeServerPage from './login/ChangeServerPage';
import ScheduledPage from './reports/ScheduledPage';
import LogsPage from './reports/LogsPage';

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

      <Route path="reports">
        <Route path="combined" element={<CombinedReportPage />} />
        <Route path="chart" element={<ChartReportPage />} />
        <Route path="event" element={<EventReportPage />} />
        <Route path="route" element={<RouteReportPage />} />
        <Route path="stop" element={<StopReportPage />} />
        <Route path="summary" element={<SummaryReportPage />} />
        <Route path="trip" element={<TripReportPage />} />
        <Route path="scheduled" element={<ScheduledPage />} />
        <Route path="statistics" element={<StatisticsPage />} />
        <Route path="logs" element={<LogsPage />} />
      </Route>
    </Route>
  </Routes>
);

export default Navigation;

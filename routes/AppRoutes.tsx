
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

import AdminLayout from '../components/layout/AdminLayout';
import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import UserManagementPage from '../pages/UserManagementPage';
import RestaurantManagementPage from '../pages/RestaurantManagementPage';
import MoodManagementPage from '../pages/MoodManagementPage';
import PostManagementPage from '../pages/PostManagementPage';
import NotificationManagerPage from '../pages/NotificationManagerPage';
import NotFoundPage from '../pages/NotFoundPage';
import PartnerRequestPage from '../pages/PartnerRequestPage';

const PrivateRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      
      <Route 
        path="/" 
        element={
          <PrivateRoute>
            <AdminLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="users" element={<UserManagementPage />} />
        <Route path="partner-requests" element={<PartnerRequestPage />} />
        <Route path="restaurants" element={<RestaurantManagementPage />} />
        <Route path="moods" element={<MoodManagementPage />} />
        <Route path="posts" element={<PostManagementPage />} />
        <Route path="notifications" element={<NotificationManagerPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
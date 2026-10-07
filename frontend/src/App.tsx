import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Auth Pages & Components
import LoginPage from './pages/LoginPage';
import MFAPage from './pages/MFAPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import SecurityActivityPage from './pages/SecurityActivityPage';
import AuthenticationAnalysisPage from './pages/AuthenticationAnalysisPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import ProtectedLayout from './components/layout/ProtectedLayout';
import { AuthProvider } from './context/AuthContext';

// Application Pages
import Dashboard from './pages/Dashboard';
import LiveLogs from './pages/LiveLogs';
import Transactions from './pages/Transactions';
import AIAnalysis from './pages/AIAnalysis';
import IncidentReport from './pages/IncidentReport';
import Settings from './pages/Settings';
import ThreatMap from './pages/ThreatMap';
import Playbooks from './pages/Playbooks';
import CustomerAlerts from './pages/CustomerAlerts';
import RiskExplainer from './pages/RiskExplainer';
import DarkWeb from './pages/DarkWeb';
import Compliance from './pages/Compliance';
import NetworkTopology from './pages/NetworkTopology';
import SOCWorkbench from './pages/SOCWorkbench';
import CyberRange from './pages/CyberRange';
import AISecurityAgents from './pages/AISecurityAgents';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Restricted Access Public Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/mfa" element={<MFAPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/auth-analysis" element={<AuthenticationAnalysisPage />} />

          {/* Protected Bank Cyber Defense Application Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <Dashboard />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/logs"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <LiveLogs />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/transactions"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <Transactions />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/analysis"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <AIAnalysis />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <IncidentReport />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <Settings />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/threat-map"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <ThreatMap />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/playbooks"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <Playbooks />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/alerts"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <CustomerAlerts />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/risk-explainer"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <RiskExplainer />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dark-web"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <DarkWeb />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/compliance"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <Compliance />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/network"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <NetworkTopology />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/soc"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <SOCWorkbench />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/cyber-range"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <CyberRange />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/agents"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <AISecurityAgents />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/security-activity"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <SecurityActivityPage />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;

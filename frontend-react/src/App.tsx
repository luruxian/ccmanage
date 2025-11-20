import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ToastProvider } from '@/components/ui/ToastProvider'
import Layout from '@/components/Layout'
import Home from '@/pages/Home'
import Dashboard from '@/pages/NewDashboard'
import Packages from '@/pages/Packages'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import ForgotPassword from '@/pages/ForgotPassword'
import ResetPassword from '@/pages/ResetPassword'
import EmailVerification from '@/pages/EmailVerification'
import VerifySuccess from '@/pages/VerifySuccess'
import VerifyError from '@/pages/VerifyError'
import VerifyResult from '@/pages/VerifyResult'
import AdminLogin from '@/pages/admin/AdminLogin'
import AdminDashboard from '@/pages/admin/AdminDashboard'
import SubscriptionDetail from '@/pages/admin/SubscriptionDetail'
import UserKeyUsageHistory from '@/pages/admin/UserKeyUsageHistory'
import KeyActivation from '@/pages/KeyActivation'
import ClaudeCodeBestPractices from '@/pages/ClaudeCodeBestPractices'
import ResourcesCenter from '@/pages/ResourcesCenter'
import UsageHistory from '@/pages/UsageHistory'
import InstallGuide from '@/pages/InstallGuide'
import ProtectedRoute from '@/components/ProtectedRoute'

function App() {
  return (
    <ToastProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
        {/* 公开路由 */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/meme" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={
          <ProtectedRoute requireAdmin>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/subscription/:id" element={
          <ProtectedRoute requireAdmin>
            <SubscriptionDetail />
          </ProtectedRoute>
        } />
        <Route path="/admin/user-key-usage/:apiKey" element={
          <ProtectedRoute requireAdmin>
            <UserKeyUsageHistory />
          </ProtectedRoute>
        } />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/email-verification" element={<EmailVerification />} />
        <Route path="/verify-success" element={<VerifySuccess />} />
        <Route path="/verify-error" element={<VerifyError />} />
        <Route path="/verify-result" element={<VerifyResult />} />
        <Route path="/key-activation" element={<KeyActivation />} />

        {/* 受保护的路由 */}
        <Route path="/app" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Home />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="packages" element={<Packages />} />
          <Route path="resources" element={<ResourcesCenter />} />
          <Route path="best-practices" element={<ClaudeCodeBestPractices />} />
          <Route path="install-guide" element={<InstallGuide />} />
          <Route path="usage-history/:apiKey" element={<UsageHistory />} />
          {/* 其他受保护页面路由将在这里添加 */}
        </Route>
      </Routes>
      </Router>
    </ToastProvider>
  )
}

export default App
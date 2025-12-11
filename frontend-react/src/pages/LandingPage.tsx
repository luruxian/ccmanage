import React from 'react'
import { useLocation } from 'react-router-dom'
import Header from '@/components/Header'
import IntroductionContent from '@/components/IntroductionContent'
import LoginModal from '@/components/LoginModal'
import RegisterModal from '@/components/RegisterModal'
import ForgotPasswordModal from '@/components/ForgotPasswordModal'

const LandingPage: React.FC = () => {
  const location = useLocation()
  const [isLoginModalOpen, setIsLoginModalOpen] = React.useState(false)
  const [isRegisterModalOpen, setIsRegisterModalOpen] = React.useState(false)
  const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] = React.useState(false)

  // 如果通过/login路径访问，或者state中包含showLoginModal，自动打开登录模态
  // 如果state中包含showRegisterModal，自动打开注册模态
  // 如果state中包含showForgotPasswordModal，自动打开忘记密码模态
  React.useEffect(() => {
    if (location.pathname === '/login' || location.state?.showLoginModal) {
      setIsLoginModalOpen(true)
      // 清除showLoginModal状态，但保留prefillEmail和verified
      if (location.state?.showLoginModal) {
        const newState = { ...location.state }
        delete newState.showLoginModal
        window.history.replaceState(newState, document.title)
      }
    }

    if (location.state?.showRegisterModal) {
      setIsRegisterModalOpen(true)
      // 清除showRegisterModal状态
      const newState = { ...location.state }
      delete newState.showRegisterModal
      window.history.replaceState(newState, document.title)
    }

    if (location.state?.showForgotPasswordModal) {
      setIsForgotPasswordModalOpen(true)
      // 清除showForgotPasswordModal状态
      const newState = { ...location.state }
      delete newState.showForgotPasswordModal
      window.history.replaceState(newState, document.title)
    }
  }, [location.pathname, location.state])

  const handleLoginClick = () => {
    setIsLoginModalOpen(true)
  }

  const handleLoginModalClose = () => {
    setIsLoginModalOpen(false)
  }

  const handleRegisterClick = () => {
    setIsRegisterModalOpen(true)
  }

  const handleRegisterModalClose = () => {
    setIsRegisterModalOpen(false)
  }

  const handleSwitchToLoginFromRegister = () => {
    setIsRegisterModalOpen(false)
    setIsLoginModalOpen(true)
  }

  const handleSwitchToRegister = () => {
    setIsLoginModalOpen(false)
    setIsRegisterModalOpen(true)
  }

  const handleSwitchToForgotPassword = () => {
    setIsLoginModalOpen(false)
    setIsForgotPasswordModalOpen(true)
  }

  const handleSwitchToLoginFromForgotPassword = () => {
    setIsForgotPasswordModalOpen(false)
    setIsLoginModalOpen(true)
  }

  const handleForgotPasswordModalClose = () => {
    setIsForgotPasswordModalOpen(false)
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header Section - Top Column */}
      <Header
        onLoginClick={handleLoginClick}
        onRegisterClick={handleRegisterClick}
      />

      {/* Main Content Section - Bottom Column */}
      <main className="flex-1 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4 py-12 md:py-20">
          <IntroductionContent onRegisterClick={handleRegisterClick} />
        </div>
      </main>

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={handleLoginModalClose}
        onSwitchToRegister={handleSwitchToRegister}
        onSwitchToForgotPassword={handleSwitchToForgotPassword}
        prefillEmail={location.state?.prefillEmail}
        verified={location.state?.verified}
      />

      {/* Register Modal */}
      <RegisterModal
        isOpen={isRegisterModalOpen}
        onClose={handleRegisterModalClose}
        onSwitchToLogin={handleSwitchToLoginFromRegister}
      />

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={isForgotPasswordModalOpen}
        onClose={handleForgotPasswordModalClose}
        onSwitchToLogin={handleSwitchToLoginFromForgotPassword}
      />
    </div>
  )
}

export default LandingPage
import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const Home: React.FC = () => {
  const navigate = useNavigate()

  useEffect(() => {
    // 重定向到仪表板
    navigate('/app/dashboard', { replace: true })
  }, [navigate])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">欢迎来到 Claude Code 管理系统</h1>
      <p>正在跳转到仪表板...</p>
    </div>
  )
}

export default Home
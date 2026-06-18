import { useEffect, useState } from 'react'
import { isAuthenticated, hasRole, checkSession, removeToken } from '../../lib/auth'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: string
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const [authorized, setAuthorized] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const check = () => {
      if (!checkSession()) {
        window.location.href = '/login'
        return
      }

      if (!isAuthenticated()) {
        window.location.href = '/login'
        return
      }

      if (requiredRole && !hasRole(requiredRole)) {
        window.location.href = '/'
        return
      }

      setAuthorized(true)
      setChecking(false)
    }
    check()

    const interval = setInterval(() => {
      if (!checkSession()) {
        removeToken()
        window.location.href = '/login'
      }
    }, 60000)

    return () => clearInterval(interval)
  }, [requiredRole])

  useEffect(() => {
    const handleActivity = () => {
      checkSession()
    }

    window.addEventListener('click', handleActivity)
    window.addEventListener('keypress', handleActivity)
    window.addEventListener('scroll', handleActivity)

    return () => {
      window.removeEventListener('click', handleActivity)
      window.removeEventListener('keypress', handleActivity)
      window.removeEventListener('scroll', handleActivity)
    }
  }, [])

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-bg">
        <div className="text-text-secondary text-sm">Cargando...</div>
      </div>
    )
  }

  if (!authorized) {
    return null
  }

  return <>{children}</>
}

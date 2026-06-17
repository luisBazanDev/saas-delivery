import { useEffect, useState } from 'react'
import { isAuthenticated } from '../../lib/auth'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: string
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const [authorized, setAuthorized] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const check = () => {
      if (!isAuthenticated()) {
        window.location.href = '/login'
        return
      }
      setAuthorized(true)
      setChecking(false)
    }
    check()
  }, [requiredRole])

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

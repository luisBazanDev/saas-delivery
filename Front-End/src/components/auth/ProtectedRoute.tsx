import { useEffect, useState } from 'react'
import { isAuthenticated, hasRole, getUser } from '../../lib/auth'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: string
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const [authorized, setAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated()) {
      window.location.href = '/login'
      return
    }

    if (requiredRole && !hasRole(requiredRole)) {
      const user = getUser()
      if (user?.store_id) {
        window.location.href = `/store/${user.store_id}/orders`
      } else {
        window.location.href = '/admin/stores'
      }
      return
    }

    setAuthorized(true)
    setLoading(false)
  }, [requiredRole])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-base">
        <div className="text-text-secondary text-sm">Cargando...</div>
      </div>
    )
  }

  if (!authorized) return null

  return <>{children}</>
}

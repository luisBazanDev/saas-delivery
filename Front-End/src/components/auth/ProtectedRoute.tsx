import { useEffect, useState } from 'react'
import { isAuthenticated, hasRole, getUser } from '../../lib/auth'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: string
  requiredRoles?: string[]
}

export default function ProtectedRoute({ children, requiredRole, requiredRoles }: ProtectedRouteProps) {
  const [authorized, setAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated()) {
      window.location.href = '/login'
      return
    }

    const rolesToCheck = requiredRoles || (requiredRole ? [requiredRole] : [])
    if (rolesToCheck.length > 0) {
      const userHasRole = rolesToCheck.some(role => hasRole(role))
      if (!userHasRole) {
        const user = getUser()
        if (user?.role_name === 'ADMIN') {
          window.location.href = '/admin/stores'
        } else if (user?.role_name === 'STORE_ADMIN') {
          window.location.href = '/stores'
        } else if (user?.role_name === 'STORE_MANAGER') {
          window.location.href = `/store/${user?.store_id}/orders`
        } else if (user?.role_name === 'STORE_CHEF' && user?.store_id) {
          window.location.href = `/store/${user.store_id}/kitchen`
        } else if (user?.role_name === 'STORE_DELIVERY' && user?.store_id) {
          window.location.href = `/store/${user.store_id}/delivery`
        } else if (user?.store_id) {
          window.location.href = `/store/${user.store_id}/orders`
        } else {
          window.location.href = '/login'
        }
        return
      }
    }

    setAuthorized(true)
    setLoading(false)
  }, [requiredRole, requiredRoles])

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

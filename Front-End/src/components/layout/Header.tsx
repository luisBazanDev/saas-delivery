import { useAuth } from '../../hooks/useAuth'
import { LogOut, User } from 'lucide-react'

export default function Header() {
  const { user, logout } = useAuth()

  function handleLogout() {
    logout()
    window.location.href = '/login'
  }

  return (
    <header className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
        {user && (
          <div className="flex items-center gap-1.5 mt-1">
            <User size={14} className="text-text-muted" />
            <span className="text-xs text-text-muted">{user.username}</span>
            <span className="text-xs text-accent-green/70 ml-1">{user.role}</span>
          </div>
        )}
      </div>
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-dark-hover rounded-lg transition-colors"
        title="Cerrar sesión"
      >
        <LogOut size={16} />
        Logout
      </button>
    </header>
  )
}

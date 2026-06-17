import { removeToken } from '../../lib/auth'
import { LogOut } from 'lucide-react'

export default function Header() {
  function handleLogout() {
    removeToken()
    window.location.href = '/login'
  }

  return (
    <header className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
      </div>
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-dark-hover rounded-lg transition-colors"
      >
        <LogOut size={16} />
        Logout
      </button>
    </header>
  )
}

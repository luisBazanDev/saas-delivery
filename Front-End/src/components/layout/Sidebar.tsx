import { useState } from 'react'
import {
  Store,
  Users,
  LayoutDashboard,
  KanbanSquare,
  ChefHat,
  MapPin,
  LogOut,
  Zap,
} from 'lucide-react'
import { removeToken } from '../../lib/auth'

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
}

interface SidebarProps {
  brand: string
  items: NavItem[]
}

const defaultAdminItems: NavItem[] = [
  { label: 'Locales Registrados', href: '/admin', icon: <Store size={18} /> },
  { label: 'Cuentas de Usuarios', href: '/admin/users', icon: <Users size={18} /> },
]

const defaultDeliveryItems: NavItem[] = [
  { label: 'Panel de Control', href: '/delivery', icon: <LayoutDashboard size={18} /> },
  { label: 'Tablero Kanban', href: '/delivery/kanban', icon: <KanbanSquare size={18} /> },
  { label: 'Vista de Cocina', href: '/delivery/kitchen', icon: <ChefHat size={18} /> },
  { label: 'Seguimiento en Ruta', href: '/delivery/tracking', icon: <MapPin size={18} /> },
]

export default function Sidebar({ brand, items }: SidebarProps) {
  const [active, setActive] = useState('')

  const navItems = items.length > 0 ? items : defaultAdminItems

  function handleLogout() {
    removeToken()
    window.location.href = '/login'
  }

  return (
    <aside className="w-60 bg-dark-card border-r border-dark-border flex flex-col min-h-screen shrink-0">
      <div className="px-5 py-5 border-b border-dark-border flex items-center gap-2">
        <Zap size={18} className="text-accent-green" />
        <h1 className="text-base font-bold text-text-primary">{brand}</h1>
      </div>

      <nav className="flex-1 px-3 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                onClick={() => setActive(item.href)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  active === item.href
                    ? 'bg-accent-green/15 text-accent-green font-medium'
                    : 'text-text-secondary hover:bg-dark-hover hover:text-text-primary'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="px-3 py-4 border-t border-dark-border">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-text-secondary hover:bg-dark-hover hover:text-text-primary transition-colors text-sm"
        >
          <LogOut size={18} />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  )
}

export { defaultAdminItems, defaultDeliveryItems }

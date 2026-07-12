import { useState } from 'react'
import {
  Store,
  Building2,
  Users,
  FileText,
  LayoutDashboard,
  KanbanSquare,
  ChefHat,
  Bike,
  LogOut,
  Zap,
  X,
  Menu,
} from 'lucide-react'
import { removeToken, removeTokenCookie, getUser } from '../../lib/auth'

interface NavItem {
  id: string
  label: string
  href: string
  icon: React.ReactNode
}

interface NavGroup {
  label: string
  items: NavItem[]
}

interface DynamicSidebarProps {
  currentPath: string
  storeId?: string
}

const roleConfig: Record<string, { name: string; menu: NavGroup[] }> = {
  ADMIN: {
    name: 'App Administrator',
    menu: [
      {
        label: 'Administración Global',
        items: [
          { id: 'admin-stores', label: 'CRUD Locales', href: '/admin/stores', icon: <Store size={16} /> },
        ],
      },
    ],
  },
  STORE_ADMIN: {
    name: 'Admin de Negocio',
    menu: [
      {
        label: 'Gestión de Cadena',
        items: [
          { id: 'stores', label: 'Mis Locales', href: '/stores', icon: <Building2 size={16} /> },
          { id: 'users', label: 'Usuarios', href: '/users', icon: <Users size={16} /> },
          { id: 'reports', label: 'Reportes', href: '/store/${storeId}/reports', icon: <FileText size={16} /> },
        ],
      },
      {
        label: 'Vistas de Encargado',
        items: [
          { id: 'dashboard', label: 'Dashboard Local', href: '/store/${storeId}', icon: <LayoutDashboard size={16} /> },
          { id: 'orders', label: 'Tablero Kanban', href: '/store/${storeId}/orders', icon: <KanbanSquare size={16} /> },
        ],
      },
    ],
  },
  STORE_MANAGER: {
    name: 'Encargado de Negocio',
    menu: [
      {
        label: 'Operaciones',
        items: [
          { id: 'dashboard', label: 'Dashboard', href: '/store/${storeId}', icon: <LayoutDashboard size={16} /> },
          { id: 'orders', label: 'Órdenes', href: '/store/${storeId}/orders', icon: <KanbanSquare size={16} /> },
          { id: 'kitchen', label: 'Cocina', href: '/store/${storeId}/kitchen', icon: <ChefHat size={16} /> },
        ],
      },
    ],
  },
  STORE_DELIVERY: {
    name: 'Repartidor',
    menu: [
      {
        label: 'En Ruta',
        items: [
          { id: 'delivery', label: 'App Entregas', href: '/store/${storeId}/delivery', icon: <Bike size={16} /> },
        ],
      },
    ],
  },
}

function resolveHref(href: string, storeId?: string): string {
  return href.replace('${storeId}', storeId || '')
}

export default function DynamicSidebar({ currentPath, storeId }: DynamicSidebarProps) {
  const [open, setOpen] = useState(false)
  const user = getUser()
  const role = user?.role || 'ADMIN'
  const config = roleConfig[role] || roleConfig.ADMIN

  function handleLogout() {
    removeToken()
    removeTokenCookie()
    window.location.href = '/login'
  }

  function toggleMenu(show: boolean) {
    setOpen(show)
  }

  return (
    <>
      <div id="menu-overlay" className={`fixed inset-0 bg-black/80 z-[998] ${open ? 'block' : 'hidden'}`} onClick={() => toggleMenu(false)} />

      <button className="btn-menu lg:hidden bg-none border-none text-text-primary text-xl cursor-pointer" onClick={() => toggleMenu(true)}>
        <Menu size={20} />
      </button>

      <nav className={`sidebar fixed lg:relative top-0 left-0 h-screen w-[260px] bg-bg-surface border-r border-border flex flex-col z-[999] transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="px-5 py-6 border-b border-border flex justify-between items-center">
          <div className="title-font flex items-center gap-2">
            <Zap size={18} className="text-accent" />
            <span className="text-text-primary">HX Delivery</span>
          </div>
          <button className="lg:hidden bg-none border-none text-text-primary cursor-pointer" onClick={() => toggleMenu(false)}>
            <X size={18} />
          </button>
        </div>

        <div className="px-3 py-5 flex-1 overflow-y-auto">
          {config.menu.map((group) => (
            <div key={group.label} className="mb-6">
              <p className="text-[10px] text-text-secondary uppercase tracking-[1px] mb-2.5 mx-2.5">{group.label}</p>
              {group.items.map((item) => {
                const href = resolveHref(item.href, storeId)
                const isActive = currentPath === href || (item.id === 'dashboard' && currentPath === `/store/${storeId}`)
                return (
                  <a
                    key={item.id}
                    href={href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-[14px] text-text-secondary mb-1 transition-all duration-200 ${
                      isActive ? 'text-accent bg-accent/5' : 'hover:text-text-primary hover:bg-bg-elevated'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </a>
                )
              })}
            </div>
          ))}
        </div>

        <div className="px-5 py-5 border-t border-border">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
              <span className="text-accent text-sm font-semibold">{user?.username?.charAt(0).toUpperCase() || 'U'}</span>
            </div>
            <div>
              <p className="text-[13px] font-semibold text-text-primary">{user?.username || 'Usuario'}</p>
              <p className="text-[11px] text-text-secondary">{config.name}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full px-3 py-2.5 rounded-lg border border-border text-text-primary text-[13px] hover:border-border-hover transition-colors"
          >
            <LogOut size={14} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </nav>
    </>
  )
}

import { useState } from 'react'
import { LayoutDashboard, KanbanSquare, ChefHat, MapPin, LogOut, Zap } from 'lucide-react'
import { removeToken } from '../../lib/auth'

const columns = [
  { id: 'ORDERED', title: 'RECIBIDO' },
  { id: 'IN_KITCHEN', title: 'EN PREPARACIÓN' },
  { id: 'IN_TRANSIT', title: 'EN CAMINO' },
  { id: 'RECEIVED', title: 'ENTREGADO' },
]

interface Order {
  code: string
  customer: string
  address: string
  status: string
}

const initialOrders: Order[] = [
  { code: '#HX-1045', customer: 'Luis Enrique Bazán', address: 'Av. Salaverry 450', status: 'ORDERED' },
  { code: '#HX-1042', customer: 'Carlos Mendoza', address: 'Av. Balta 1420', status: 'IN_KITCHEN' },
  { code: '#HX-1041', customer: 'Ana Gómez', address: 'Urb. Santa Victoria', status: 'IN_TRANSIT' },
  { code: '#HX-1040', customer: 'Julio Rojas', address: 'Ca. San José 782', status: 'RECEIVED' },
]

interface OrderBoardProps {
  storeId: string
}

const navItems = (storeId: string) => [
  { label: 'Panel de Control', href: `/store/${storeId}/dashboard`, icon: <LayoutDashboard size={18} /> },
  { label: 'Tablero Kanban', href: `/store/${storeId}/orders`, icon: <KanbanSquare size={18} /> },
  { label: 'Vista de Cocina', href: `/store/${storeId}/kitchen`, icon: <ChefHat size={18} /> },
  { label: 'Seguimiento en Ruta', href: `/store/${storeId}/tracking`, icon: <MapPin size={18} /> },
]

export default function OrderBoard({ storeId }: OrderBoardProps) {
  const navItemsList = navItems(storeId)
  const [active, setActive] = useState(`/store/${storeId}/orders`)
  const [orders] = useState<Order[]>(initialOrders)

  function handleLogout() {
    removeToken()
    window.location.href = '/login'
  }

  return (
    <div className="flex min-h-screen bg-dark-bg">
      <aside className="w-60 bg-dark-card border-r border-dark-border flex flex-col shrink-0">
        <div className="px-5 py-5 border-b border-dark-border flex items-center gap-2">
          <Zap size={18} className="text-accent-green" />
          <h1 className="text-base font-bold text-text-primary">HX Delivery</h1>
        </div>

        <nav className="flex-1 px-3 py-4">
          <ul className="space-y-1">
            {navItemsList.map((item) => (
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

      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-text-primary mb-6">Orquestación del Ciclo de Vida de Órdenes</h1>

          <div className="grid grid-cols-4 gap-4">
            {columns.map((column) => (
              <div key={column.id} className="bg-dark-card border border-dark-border rounded-xl p-4">
                <h2 className="text-sm font-bold text-text-primary mb-4">{column.title}</h2>
                <div className="space-y-3">
                  {orders
                    .filter((order) => order.status === column.id)
                    .map((order) => (
                      <div key={order.code} className="bg-dark-bg border border-dark-border rounded-lg p-4">
                        <p className="text-xs text-text-muted mb-1">{order.code}</p>
                        <p className="text-sm font-medium text-text-primary mb-1">{order.customer}</p>
                        <p className="text-xs text-text-muted">{order.address}</p>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

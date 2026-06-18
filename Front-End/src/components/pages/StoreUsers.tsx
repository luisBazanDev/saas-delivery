import AppLayout from '../layout/AppLayout'
import StatCard from '../ui/StatCard'
import Card from '../ui/Card'
import Button from '../ui/Button'
import Badge from '../ui/Badge'
import { Plus, Pencil, Trash2, Store, Users } from 'lucide-react'

interface StoreUser {
  id: number
  code: string
  username: string
  role: string
  roleVariant: 'info' | 'default' | 'none'
  store: string
}

interface StoreUsersProps {
  storeId: string
}

const sampleUsers: StoreUser[] = [
  { id: 101, code: '101', username: 'carlos_admin_pizzeria', role: 'ADMINISTRADOR DE LOCAL', roleVariant: 'info', store: 'Pizzería Fiesta (ID: 1)' },
  { id: 102, code: '102', username: 'motorizado_jorge', role: 'REPARTIDOR', roleVariant: 'default', store: 'Pizzería Fiesta (ID: 1)' },
  { id: 103, code: '103', username: 'diego_super_admin', role: 'ADMINISTRADOR GLOBAL', roleVariant: 'none', store: 'General (SaaS Global)' },
]

export default function StoreUsers({ storeId }: StoreUsersProps) {
  const navItems = [
    { label: 'Locales Registrados', href: `/store/${storeId}`, icon: <Store size={18} /> },
    { label: 'Cuentas de Usuarios', href: `/store/${storeId}/users`, icon: <Users size={18} /> },
  ]

  return (
    <AppLayout brand="HX Admin" navItems={navItems}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Control de Roles y Permisos</h1>
          <p className="text-sm text-text-muted mt-1">Gestión de usuarios con acceso asignado por establecimiento</p>
        </div>
        <Button size="sm" variant="primary">
          <Plus size={14} />
          Crear Usuario
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Usuarios" value="48 Cuentas" sublabel="Credenciales activas" accent="green" />
        <StatCard label="Administradores" value="32 Roles" sublabel="Gobernanza de locales" accent="blue" />
        <StatCard label="Repartidores" value="118 Activos" sublabel="Aplicación móvil" accent="green" />
        <StatCard label="Sesiones Activas" value="14 En Línea" sublabel="Conexiones actuales" accent="green" />
      </div>

      <Card title="Directorio de Usuarios">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-border">
                <th className="text-left text-[11px] text-text-muted uppercase tracking-wider font-medium py-3 px-4">Código</th>
                <th className="text-left text-[11px] text-text-muted uppercase tracking-wider font-medium py-3 px-4">Nombre de Usuario</th>
                <th className="text-left text-[11px] text-text-muted uppercase tracking-wider font-medium py-3 px-4">Rol Asignado</th>
                <th className="text-left text-[11px] text-text-muted uppercase tracking-wider font-medium py-3 px-4">Local Vinculado</th>
                <th className="text-left text-[11px] text-text-muted uppercase tracking-wider font-medium py-3 px-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {sampleUsers.map((user) => (
                <tr key={user.id} className="border-b border-dark-border/40 hover:bg-dark-hover/40 transition-colors">
                  <td className="py-3.5 px-4 text-sm text-text-muted font-mono">{user.code}</td>
                  <td className="py-3.5 px-4 text-sm text-text-primary font-medium">{user.username}</td>
                  <td className="py-3.5 px-4">
                    {user.roleVariant === 'none' ? (
                      <span className="text-sm text-text-primary font-semibold">{user.role}</span>
                    ) : (
                      <Badge label={user.role} variant={user.roleVariant} />
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-sm text-text-secondary">{user.store}</td>
                  <td className="py-3.5 px-4">
                    <div className="flex gap-2">
                      <button className="text-text-muted hover:text-accent-blue transition-colors"><Pencil size={14} /></button>
                      <button className="text-text-muted hover:text-accent-red transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </AppLayout>
  )
}

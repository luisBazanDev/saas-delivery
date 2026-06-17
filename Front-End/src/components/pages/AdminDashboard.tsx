import AppLayout from '../layout/AppLayout'
import StatCard from '../ui/StatCard'
import Card from '../ui/Card'
import Button from '../ui/Button'
import Badge from '../ui/Badge'
import { Plus, Pencil, Trash2 } from 'lucide-react'

export default function AdminDashboard() {
  return (
    <AppLayout brand="HX Admin">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Ecosistema de Tiendas</h1>
          <p className="text-sm text-text-muted mt-1">Administra todas las tiendas y usuarios del ecosistema</p>
        </div>
        <Button size="sm">
          <Plus size={14} />
          Registrar Nueva Tienda
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard label="Tiendas Totales" value="24 Locales" accent="green" />
        <StatCard label="Cuentas de Tienda" value="32 Cuentas" sublabel="Roles asignados" accent="blue" />
        <StatCard label="Repartidores Totales" value="118 Motorizados" accent="yellow" />
        <StatCard label="Entregas Totales (Mes)" value="4,820" sublabel="Este mes" accent="green" />
      </div>

      <Card
        title="Directorio de Tiendas Gastronómicas Activas"
        headerAction={
          <span className="text-xs text-text-muted">24 tiendas registradas</span>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-border">
                <th className="text-left text-[11px] text-text-muted uppercase tracking-wider font-medium py-3 px-4">Código</th>
                <th className="text-left text-[11px] text-text-muted uppercase tracking-wider font-medium py-3 px-4">Nombre Comercial</th>
                <th className="text-left text-[11px] text-text-muted uppercase tracking-wider font-medium py-3 px-4">Dirección</th>
                <th className="text-left text-[11px] text-text-muted uppercase tracking-wider font-medium py-3 px-4">Zona / Distrito</th>
                <th className="text-left text-[11px] text-text-muted uppercase tracking-wider font-medium py-3 px-4">Estado</th>
                <th className="text-left text-[11px] text-text-muted uppercase tracking-wider font-medium py-3 px-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-dark-border/40 hover:bg-dark-hover/40 transition-colors">
                <td className="py-3.5 px-4 text-sm text-text-muted font-mono">1</td>
                <td className="py-3.5 px-4 text-sm text-text-primary font-medium">Pizzería Mario's</td>
                <td className="py-3.5 px-4 text-sm text-text-secondary">Av. Salaverry 1420</td>
                <td className="py-3.5 px-4 text-sm text-text-secondary">Jesús María</td>
                <td className="py-3.5 px-4"><Badge label="ACTIVO" variant="success" /></td>
                <td className="py-3.5 px-4">
                  <div className="flex gap-2">
                    <button className="text-text-muted hover:text-accent-blue transition-colors"><Pencil size={14} /></button>
                    <button className="text-text-muted hover:text-accent-red transition-colors"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
              <tr className="border-b border-dark-border/40 hover:bg-dark-hover/40 transition-colors">
                <td className="py-3.5 px-4 text-sm text-text-muted font-mono">2</td>
                <td className="py-3.5 px-4 text-sm text-text-primary font-medium">Sushi & Wok Express</td>
                <td className="py-3.5 px-4 text-sm text-text-secondary">Av. Javier Prado 456</td>
                <td className="py-3.5 px-4 text-sm text-text-secondary">San Isidro</td>
                <td className="py-3.5 px-4"><Badge label="ACTIVO" variant="success" /></td>
                <td className="py-3.5 px-4">
                  <div className="flex gap-2">
                    <button className="text-text-muted hover:text-accent-blue transition-colors"><Pencil size={14} /></button>
                    <button className="text-text-muted hover:text-accent-red transition-colors"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </AppLayout>
  )
}

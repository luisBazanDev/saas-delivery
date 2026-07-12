import { useState, useEffect } from 'react'
import { api } from '../../lib/api'
import type { DashboardResponse } from '../../lib/types'
import { MapPin, Bike } from 'lucide-react'

interface StoreDashboardProps {
  storeId: string
}

export default function StoreDashboard({ storeId }: StoreDashboardProps) {
  const [data, setData] = useState<DashboardResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<DashboardResponse>(`/stores/${storeId}/dashboard`)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [storeId])

  if (loading) return <p className="text-text-secondary text-sm">Cargando dashboard...</p>
  if (!data) return <p className="text-text-secondary text-sm">No hay datos disponibles</p>

  const { summary, active_deliveries } = data

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        <div className="bg-bg-surface border border-border p-5 rounded-lg">
          <p className="text-text-secondary text-[12px] uppercase tracking-wider">Pedidos en Cocina</p>
          <h3 className="text-[28px] mt-2.5 font-medium">{summary.orders_in_kitchen}</h3>
        </div>
        <div className="bg-bg-surface border border-border p-5 rounded-lg">
          <p className="text-text-secondary text-[12px] uppercase tracking-wider">Repartidores Activos</p>
          <h3 className="text-[28px] mt-2.5 font-medium">{summary.active_delivery_count}</h3>
        </div>
        <div className="bg-bg-surface border border-border p-5 rounded-lg">
          <p className="text-text-secondary text-[12px] uppercase tracking-wider">Ingresos del Día</p>
          <h3 className="text-[28px] mt-2.5 font-medium text-accent">S/ {summary.today_income.toFixed(2)}</h3>
        </div>
      </div>

      <div className="bg-bg-surface border border-border rounded-lg overflow-hidden mb-5">
        <div className="px-6 py-5 border-b border-border">
          <h3 className="text-[16px] font-semibold">Mapa de Repartidores Activos (/store/{storeId})</h3>
        </div>
        <div className="h-[350px] bg-bg-elevated relative flex justify-center items-center" style={{ backgroundImage: 'radial-gradient(#222 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
          {active_deliveries.length > 0 ? (
            active_deliveries.slice(0, 6).map((order, i) => (
              <div key={order.code} className="absolute" style={{ top: `${30 + (i * 12) % 50}%`, left: `${20 + (i * 18) % 60}%` }}>
                <MapPin size={24} className="text-danger absolute -top-1 -left-1" />
                <Bike size={20} className="text-accent" />
              </div>
            ))
          ) : (
            <p className="text-text-secondary text-sm">No hay repartidores activos</p>
          )}
          <span className="absolute bottom-5 right-5 px-2 py-1 rounded text-[11px] border border-accent/30 text-accent">GPS En Vivo</span>
        </div>
      </div>

      {active_deliveries.length > 0 && (
        <div className="bg-bg-surface border border-border rounded-lg p-6">
          <h3 className="text-[14px] font-semibold mb-4">Entregas Activas Recientes</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr>
                  <th className="text-text-secondary text-[12px] font-medium uppercase py-3 px-3 border-b border-border">Orden</th>
                  <th className="text-text-secondary text-[12px] font-medium uppercase py-3 px-3 border-b border-border">Repartidor</th>
                  <th className="text-text-secondary text-[12px] font-medium uppercase py-3 px-3 border-b border-border">Dirección</th>
                  <th className="text-text-secondary text-[12px] font-medium uppercase py-3 px-3 border-b border-border">Estado</th>
                </tr>
              </thead>
              <tbody>
                {active_deliveries.map((order) => (
                  <tr key={order.code} className="hover:bg-bg-elevated transition-colors">
                    <td className="py-3 px-3 text-[14px] font-mono border-b border-border">{order.code}</td>
                    <td className="py-3 px-3 text-[14px] border-b border-border">{order.deliveryUser?.username || '-'}</td>
                    <td className="py-3 px-3 text-[14px] text-text-secondary border-b border-border">{order.address || '-'}</td>
                    <td className="py-3 px-3 border-b border-border">
                      <span className="px-2 py-1 rounded text-[11px] border border-border text-text-secondary">{order.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

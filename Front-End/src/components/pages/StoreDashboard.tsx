import { useState, useEffect } from 'react'
import { api } from '../../lib/http'
import type { DashboardResponse, User } from '../../lib/types'
import StoreMap from './StoreMap'

interface StoreDashboardProps {
  storeId: string
}

export default function StoreDashboard({ storeId }: StoreDashboardProps) {
  const [data, setData] = useState<DashboardResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [storeLocation, setStoreLocation] = useState<{ lat: number; lon: number; name: string } | null>(null)
  const [deliveryUsers, setDeliveryUsers] = useState<Array<{ id: number; name: string; lat: number | null; lon: number | null }>>([])

  useEffect(() => {
    api.get<DashboardResponse>(`/stores/${storeId}/dashboard`)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [storeId])

  useEffect(() => {
    api.get(`/stores/${storeId}`)
      .then((store: any) => {
        if (store.lat && store.lon) {
          setStoreLocation({ lat: store.lat, lon: store.lon, name: store.name })
        }
      })
      .catch(() => {})
  }, [storeId])

  useEffect(() => {
    const fetchDeliveryUsers = () => {
      api.get<{ users: User[] }>(`/stores/${storeId}/delivery/users`)
        .then((res) => {
          setDeliveryUsers(res.users.map((u) => ({ id: u.id, name: u.name, lat: u.lat ?? null, lon: u.lon ?? null })))
        })
        .catch(() => {})
    }

    fetchDeliveryUsers()
    const interval = setInterval(fetchDeliveryUsers, 10000)
    return () => clearInterval(interval)
  }, [storeId])

  if (loading) return <p className="text-text-secondary text-sm">Cargando dashboard...</p>
  if (!data) return <p className="text-text-secondary text-sm">No hay datos disponibles</p>

  const { summary, active_deliveries } = data

  const deliveryMarkers = active_deliveries
    .filter((order) => order.delivery_lat && order.delivery_lon)
    .map((order) => ({
      id: order.id,
      lat: order.delivery_lat!,
      lon: order.delivery_lon!,
      label: order.delivery_address || '',
      status: order.status,
    }))

  const mapCenter: [number, number] = storeLocation
    ? [storeLocation.lat, storeLocation.lon]
    : [-6.7714, -79.8390]

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
          <h3 className="text-[16px] font-semibold">Mapa de Repartidores Activos</h3>
        </div>
        <StoreMap
          center={mapCenter}
          storeLocation={storeLocation || undefined}
          deliveryMarkers={deliveryMarkers}
          deliveryUsers={deliveryUsers}
          height="400px"
          interactive={false}
        />
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
                  <tr key={order.id} className="hover:bg-bg-elevated transition-colors">
                    <td className="py-3 px-3 text-[14px] font-mono border-b border-border">{order.code || order.id}</td>
                    <td className="py-3 px-3 text-[14px] border-b border-border">{order.deliveryUser?.name || '-'}</td>
                    <td className="py-3 px-3 text-[14px] text-text-secondary border-b border-border">{order.delivery_address || '-'}</td>
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

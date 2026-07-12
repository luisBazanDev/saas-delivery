import { useState, useEffect } from 'react'
import { api } from '../../lib/api'
import type { KitchenResponse, Order } from '../../lib/types'
import { ChefHat, Clock } from 'lucide-react'

interface KitchenViewProps {
  storeId: string
}

export default function KitchenView({ storeId }: KitchenViewProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)

  useEffect(() => { fetchOrders() }, [storeId])

  async function fetchOrders() {
    try {
      const res = await api.get<KitchenResponse>(`/stores/${storeId}/kitchen`)
      setOrders(res.orders)
    } catch {
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  async function handleMarkReady(code: string) {
    setProcessing(code)
    try {
      await api.put(`/stores/${storeId}/kitchen/${code}/ready`, {})
      fetchOrders()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al marcar')
    } finally {
      setProcessing(null)
    }
  }

  function getTimeAgo(startTime?: string): string {
    if (!startTime) return ''
    const diff = Date.now() - new Date(startTime).getTime()
    const mins = Math.floor(diff / 60000)
    return mins < 1 ? 'Hace < 1 min' : `Hace ${mins} min`
  }

  if (loading) return <p className="text-text-secondary text-sm">Cargando órdenes de cocina...</p>

  return (
    <div>
      <div className="mb-5">
        <h3 className="text-[16px] font-semibold mb-1">Órdenes en Cocina (/store/{storeId}/kitchen)</h3>
        <p className="text-[13px] text-text-secondary">Preparación y marcado de comandas.</p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-bg-surface border border-border rounded-lg p-10 text-center">
          <ChefHat size={40} className="text-text-secondary mx-auto mb-3" />
          <p className="text-text-secondary">No hay órdenes pendientes en cocina</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {orders.map((order) => (
            <div key={order.code} className="bg-bg-surface border border-border rounded-lg p-5 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-accent font-semibold text-[14px]">{order.code}</h4>
                  <span className="px-2 py-1 rounded text-[11px] border border-[#eab308]/30 text-[#eab308] flex items-center gap-1">
                    <Clock size={10} />
                    {getTimeAgo(order.start_time)}
                  </span>
                </div>
                <ul className="list-none text-text-primary text-[14px] leading-relaxed mb-5">
                  {order.OrderProducts?.map((op, i) => (
                    <li key={i}>{op.amount}x {op.Product?.name || 'Producto'}</li>
                  ))}
                </ul>
              </div>
              <button
                onClick={() => handleMarkReady(order.code)}
                disabled={processing === order.code}
                className="w-full bg-[#22c55e] text-bg-base border-none py-3 rounded-lg font-semibold cursor-pointer text-[13px] flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50"
              >
                {processing === order.code ? 'Procesando...' : 'Marcar Completada'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

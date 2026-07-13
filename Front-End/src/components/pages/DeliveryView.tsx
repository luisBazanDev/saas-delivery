import { useState, useEffect } from 'react'
import { api } from '../../lib/api'
import type { DeliveryResponse, Order } from '../../lib/types'
import { MapPin, Bike } from 'lucide-react'

interface DeliveryViewProps {
  storeId: string
}

export default function DeliveryView({ storeId }: DeliveryViewProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => { fetchOrders() }, [storeId])

  async function fetchOrders() {
    try {
      const res = await api.get<DeliveryResponse>(`/stores/${storeId}/delivery`)
      setOrders(res.orders)
      if (res.orders.length > 0 && !currentOrder) {
        setCurrentOrder(res.orders[0])
      }
    } catch {
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  async function handleDelivered() {
    if (!currentOrder) return
    setSubmitting(true)
    try {
      await api.put(`/stores/${storeId}/delivery/${currentOrder.code}/status`, { status: 'DELIVERED' })
      fetchOrders()
      setCurrentOrder(null)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al marcar entregado')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <p className="text-text-secondary text-sm">Cargando entregas...</p>

  if (orders.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Bike size={48} className="text-text-secondary mx-auto mb-3" />
          <p className="text-text-secondary">No hay entregas pendientes</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
      <div className="w-full max-w-[380px] border border-border rounded-[20px] overflow-hidden bg-bg-surface flex flex-col" style={{ maxHeight: '650px' }}>
        <div className="px-5 py-4 bg-bg-elevated border-b border-border">
          <h4 className="title-font text-accent text-[15px]">{currentOrder ? `Pedido ${currentOrder.code}` : 'Selecciona un Pedido'}</h4>
          <p className="text-[12px] text-text-secondary mt-1">/store/{storeId}/delivery</p>
        </div>

        <div className="flex-1 relative flex justify-center items-center" style={{ backgroundImage: 'radial-gradient(#222 1px, transparent 1px)', backgroundSize: '20px 20px', minHeight: '250px' }}>
          {currentOrder ? (
            <MapPin size={30} className="text-danger" />
          ) : (
            <p className="text-text-secondary text-sm">Selecciona un pedido</p>
          )}
        </div>

        {currentOrder && (
          <div className="px-5 py-5 bg-bg-surface">
            <h4 className="text-[15px] font-medium mb-1">{currentOrder.address || 'Sin dirección'}</h4>
            <p className="text-[13px] text-text-secondary flex items-center gap-1.5">
              <MapPin size={12} />
              {currentOrder.customer_name || 'Cliente'}
            </p>

            {currentOrder.total !== undefined && currentOrder.total > 0 && (
              <div className="mt-4 px-3 py-3 bg-accent/5 border border-accent/20 rounded-lg text-[12px] text-text-secondary">
                Cobrar exacto: S/ {currentOrder.total.toFixed(2)} en efectivo.
              </div>
            )}

            <button
              onClick={handleDelivered}
              disabled={submitting}
              className="w-full bg-[#22c55e] text-bg-base border-none py-3.5 rounded-lg font-semibold cursor-pointer text-[14px] flex items-center justify-center gap-2 mt-5 hover:opacity-90 disabled:opacity-50"
            >
              {submitting ? 'Procesando...' : 'Entregado'}
              <Bike size={16} />
            </button>
          </div>
        )}

        {orders.length > 1 && (
          <div className="px-5 py-3 border-t border-border max-h-[150px] overflow-y-auto">
            <p className="text-[11px] text-text-secondary uppercase tracking-[1px] mb-2">Otros Pedidos</p>
            {orders.filter((o) => o.id !== currentOrder?.id).map((order) => (
              <button
                key={order.id}
                onClick={() => setCurrentOrder(order)}
                className="w-full text-left px-3 py-2 rounded text-[13px] text-text-primary hover:bg-bg-elevated transition-colors mb-1"
              >
                <span className="text-accent font-medium">{order.code || `#${order.id}`}</span>
                <span className="text-text-secondary ml-2">{order.delivery_address || 'Sin dirección'}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

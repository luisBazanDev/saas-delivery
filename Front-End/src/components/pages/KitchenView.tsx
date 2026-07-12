import { useState, useEffect } from 'react'
import { api } from '../../lib/api'
import type { KitchenResponse, Order } from '../../lib/types'
import { ChefHat, Clock, Undo } from 'lucide-react'

interface KitchenViewProps {
  storeId: string
}

export default function KitchenView({ storeId }: KitchenViewProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [recentlyDone, setRecentlyDone] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)

  useEffect(() => { fetchOrders() }, [storeId])

  useEffect(() => {
    const interval = setInterval(() => {
      fetchOrders()
    }, 30000)
    return () => clearInterval(interval)
  }, [storeId])

  async function fetchOrders() {
    try {
      const res = await api.get<KitchenResponse>(`/stores/${storeId}/kitchen`)
      const activeOrders = res.orders.filter((o) => o.status !== 'DONE')
      const doneOrders = res.orders.filter((o) => o.status === 'DONE' && o.end_time)

      const now = Date.now()
      const fiveMinutesMs = 5 * 60 * 1000
      const cancellable = doneOrders.filter((o) => {
        const endTimestamp = new Date(o.end_time!).getTime()
        return now - endTimestamp <= fiveMinutesMs
      })

      setOrders(activeOrders)
      setRecentlyDone(cancellable)
    } catch {
      setOrders([])
      setRecentlyDone([])
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

  async function handleCancelReady(code: string) {
    setProcessing(code)
    try {
      await api.put(`/stores/${storeId}/kitchen/${code}/unready`, {})
      fetchOrders()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al cancelar')
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
        <h3 className="text-[16px] font-semibold mb-1">Cocina (/store/{storeId}/kitchen)</h3>
        <p className="text-[13px] text-text-secondary">Preparación y marcado de comandas.</p>
      </div>

      {orders.length === 0 && recentlyDone.length === 0 ? (
        <div className="bg-bg-surface border border-border rounded-lg p-10 text-center">
          <ChefHat size={40} className="text-text-secondary mx-auto mb-3" />
          <p className="text-text-secondary">No hay órdenes pendientes en cocina</p>
        </div>
      ) : (
        <>
          {orders.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
              {orders.map((order) => (
                <div key={order.code} className="bg-bg-surface border border-border rounded-lg p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-accent font-semibold text-[14px]">{order.code}</h4>
                      <span className={`px-2 py-1 rounded text-[11px] border flex items-center gap-1 ${
                        order.status === 'PENDING'
                          ? 'border-[#eab308]/30 text-[#eab308]'
                          : 'border-[#3b82f6]/30 text-[#3b82f6]'
                      }`}>
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
                    {processing === order.code ? 'Procesando...' : order.status === 'PENDING' ? 'Iniciar Preparación' : 'Marcar Completada'}
                  </button>
                </div>
              ))}
            </div>
          )}

          {recentlyDone.length > 0 && (
            <div>
              <h4 className="text-[14px] font-semibold text-text-secondary mb-3 flex items-center gap-2">
                <Undo size={14} />
                Completadas recientemente (cancelar en 5 min)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {recentlyDone.map((order) => {
                  const endTimestamp = new Date(order.end_time!).getTime()
                  const remainingMs = 5 * 60 * 1000 - (Date.now() - endTimestamp)
                  const remainingSec = Math.max(0, Math.floor(remainingMs / 1000))
                  const mins = Math.floor(remainingSec / 60)
                  const secs = remainingSec % 60

                  return (
                    <div key={order.code} className="bg-bg-surface border border-[#22c55e]/30 rounded-lg p-5 flex flex-col justify-between opacity-70">
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="text-[#22c55e] font-semibold text-[14px]">{order.code}</h4>
                          <span className="px-2 py-1 rounded text-[11px] border border-[#22c55e]/30 text-[#22c55e] flex items-center gap-1">
                            <Clock size={10} />
                            {mins}:{secs.toString().padStart(2, '0')}
                          </span>
                        </div>
                        <ul className="list-none text-text-primary text-[14px] leading-relaxed mb-5">
                          {order.OrderProducts?.map((op, i) => (
                            <li key={i}>{op.amount}x {op.Product?.name || 'Producto'}</li>
                          ))}
                        </ul>
                      </div>
                      <button
                        onClick={() => handleCancelReady(order.code)}
                        disabled={processing === order.code}
                        className="w-full bg-transparent border border-[#eab308] text-[#eab308] py-3 rounded-lg font-semibold cursor-pointer text-[13px] flex items-center justify-center gap-2 hover:bg-[#eab308]/10 disabled:opacity-50"
                      >
                        <Undo size={14} />
                        {processing === order.code ? 'Cancelando...' : 'Cancelar'}
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

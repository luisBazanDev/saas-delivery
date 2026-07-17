import { useState, useEffect, useRef } from 'react'
import { api } from '../../lib/http'
import type { DeliveryResponse, Order, DecodedToken } from '../../lib/types'
import { Bike } from 'lucide-react'
import StoreMap from './StoreMap'

interface DeliveryViewProps {
  storeId: string
}

export default function DeliveryView({ storeId }: DeliveryViewProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [storeLocation, setStoreLocation] = useState<{ lat: number; lon: number } | null>(null)
  const watchIdRef = useRef<number | null>(null)

  useEffect(() => { fetchOrders() }, [storeId])

  useEffect(() => {
    api.get(`/stores/${storeId}`)
      .then((store: any) => {
        if (store.lat && store.lon) {
          setStoreLocation({ lat: store.lat, lon: store.lon })
        }
      })
      .catch(() => {})
  }, [storeId])

  useEffect(() => {
    if (!navigator.geolocation) return

    const token = localStorage.getItem('token')
    if (!token) return

    let decoded: DecodedToken | null = null
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      decoded = payload
    } catch {}

    if (!decoded?.sub) return

    const sendLocation = (lat: number, lon: number) => {
      api.post(`/stores/${storeId}/delivery/users/${decoded!.sub}/location`, { lat, lon })
        .catch(() => {})
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        sendLocation(pos.coords.latitude, pos.coords.longitude)
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 10000 }
    )

    const interval = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        (pos) => sendLocation(pos.coords.latitude, pos.coords.longitude),
        () => {},
        { enableHighAccuracy: true }
      )
    }, 10000)

    return () => {
      if (watchIdRef.current != null) navigator.geolocation.clearWatch(watchIdRef.current)
      clearInterval(interval)
    }
  }, [storeId])

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

  const mapCenter: [number, number] = currentOrder?.delivery_lat && currentOrder?.delivery_lon
    ? [currentOrder.delivery_lat, currentOrder.delivery_lon]
    : storeLocation
      ? [storeLocation.lat, storeLocation.lon]
      : [-6.7714, -79.8390]

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
      <div className="w-full max-w-[380px] border border-border rounded-[20px] overflow-hidden bg-bg-surface flex flex-col" style={{ maxHeight: '650px' }}>
        <div className="px-5 py-4 bg-bg-elevated border-b border-border">
          <h4 className="title-font text-accent text-[15px]">{currentOrder ? `Pedido ${currentOrder.code}` : 'Selecciona un Pedido'}</h4>
          <p className="text-[12px] text-text-secondary mt-1">/store/{storeId}/delivery</p>
        </div>

        <div style={{ height: '250px' }}>
          <StoreMap
            center={mapCenter}
            storeLocation={storeLocation ? { lat: storeLocation.lat, lon: storeLocation.lon, name: 'Tienda' } : undefined}
            deliveryMarkers={currentOrder?.delivery_lat && currentOrder?.delivery_lon
              ? [{ id: currentOrder.id, lat: currentOrder.delivery_lat, lon: currentOrder.delivery_lon, label: currentOrder.delivery_address || '', status: currentOrder.status }]
              : []
            }
            height="250px"
            interactive={false}
          />
        </div>

        {currentOrder && (
          <div className="px-5 py-5 bg-bg-surface">
            <h4 className="text-[15px] font-medium mb-1">{currentOrder.delivery_address || 'Sin dirección'}</h4>
            <p className="text-[13px] text-text-secondary flex items-center gap-1.5">
              <Bike size={12} />
              {currentOrder.customer_name || 'Cliente'}
            </p>

            {currentOrder.total_amount !== undefined && currentOrder.total_amount > 0 && (
              <div className="mt-4 px-3 py-3 bg-accent/5 border border-accent/20 rounded-lg text-[12px] text-text-secondary">
                Cobrar exacto: S/ {Number(currentOrder.total_amount).toFixed(2)} en efectivo.
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

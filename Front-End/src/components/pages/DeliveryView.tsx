import { useState, useEffect, useRef } from 'react'
import { api } from '../../lib/http'
import type { DeliveryResponse, Order, DecodedToken } from '../../lib/types'
import { Bike, MapPin, User, Package } from 'lucide-react'
import StoreMap from './StoreMap'

interface DeliveryViewProps {
  storeId: string
}

export default function DeliveryView({ storeId }: DeliveryViewProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [claiming, setClaiming] = useState<number | null>(null)
  const [storeLocation, setStoreLocation] = useState<{ lat: number; lon: number } | null>(null)
  const watchIdRef = useRef<number | null>(null)

  useEffect(() => { fetchOrders() }, [storeId])
  useEffect(() => {
    const interval = setInterval(fetchOrders, 10000)
    return () => clearInterval(interval)
  }, [storeId])

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
      const myActive = res.orders.find((o) => o.isMine && o.status === 'IN_TRANSIT')
      if (myActive && !currentOrder) {
        setCurrentOrder(myActive)
      } else if (currentOrder) {
        const stillExists = res.orders.find((o) => o.id === currentOrder.id)
        if (!stillExists) {
          setCurrentOrder(null)
        } else {
          setCurrentOrder(stillExists)
        }
      }
    } catch {
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  async function handleClaim(order: Order) {
    setClaiming(order.id)
    try {
      await api.put(`/stores/${storeId}/delivery/${order.id}/claim`, {})
      await fetchOrders()
      setCurrentOrder(orders.find((o) => o.id === order.id) || null)
    } catch (err: any) {
      alert(err.response?.data?.error || 'Error al aceptar pedido')
    } finally {
      setClaiming(null)
    }
  }

  async function handleDelivered() {
    if (!currentOrder) return
    setSubmitting(true)
    try {
      await api.put(`/stores/${storeId}/delivery/${currentOrder.id}/status`, { status: 'DELIVERED' })
      setCurrentOrder(null)
      await fetchOrders()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al marcar entregado')
    } finally {
      setSubmitting(false)
    }
  }

  const myOrder = currentOrder?.isMine ? currentOrder : null
  const availableOrders = orders.filter((o) => o.isAvailable && o.id !== myOrder?.id)

  if (loading) return <p className="text-text-secondary text-sm">Cargando entregas...</p>

  const mapCenter: [number, number] = myOrder?.delivery_lat && myOrder?.delivery_lon
    ? [myOrder.delivery_lat, myOrder.delivery_lon]
    : storeLocation
      ? [storeLocation.lat, storeLocation.lon]
      : [-6.7714, -79.8390]

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
      <div className="w-full max-w-[380px] border border-border rounded-[20px] overflow-hidden bg-bg-surface flex flex-col" style={{ maxHeight: '650px' }}>
        <div className="px-5 py-4 bg-bg-elevated border-b border-border">
          <h4 className="title-font text-accent text-[15px]">
            {myOrder ? `Pedido ${myOrder.code}` : 'Entregas'}
          </h4>
          <p className="text-[12px] text-text-secondary mt-1">/store/{storeId}/delivery</p>
        </div>

        {myOrder ? (
          <>
            <div style={{ height: '250px' }}>
              <StoreMap
                center={mapCenter}
                storeLocation={storeLocation ? { lat: storeLocation.lat, lon: storeLocation.lon, name: 'Tienda' } : undefined}
                deliveryMarkers={myOrder?.delivery_lat && myOrder?.delivery_lon
                  ? [{ id: myOrder.id, lat: myOrder.delivery_lat, lon: myOrder.delivery_lon, label: myOrder.delivery_address || '', status: myOrder.status }]
                  : []
                }
                height="250px"
                interactive={false}
              />
            </div>

            <div className="px-5 py-5 bg-bg-surface">
              <h4 className="text-[15px] font-medium mb-1">{myOrder.delivery_address || 'Sin dirección'}</h4>
              <p className="text-[13px] text-text-secondary flex items-center gap-1.5">
                <User size={12} />
                {myOrder.customer_name || 'Cliente'}
              </p>

              {myOrder.total_amount !== undefined && myOrder.total_amount > 0 && (
                <div className="mt-4 px-3 py-3 bg-accent/5 border border-accent/20 rounded-lg text-[12px] text-text-secondary">
                  Cobrar exacto: S/ {Number(myOrder.total_amount).toFixed(2)} en efectivo.
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
          </>
        ) : (
          <div className="px-5 py-4 bg-bg-surface">
            <div className="flex items-center gap-2 mb-3">
              <Package size={16} className="text-accent" />
              <span className="text-[13px] font-medium">Pedidos listos para entrega</span>
            </div>
            {availableOrders.length === 0 ? (
              <div className="text-center py-6">
                <Bike size={32} className="text-text-secondary mx-auto mb-2" />
                <p className="text-text-secondary text-[13px]">No hay entregas disponibles</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {availableOrders.map((order) => (
                  <div key={order.id} className="bg-bg-base border border-border rounded-lg p-3">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-accent font-bold text-[13px]">{order.code || `#${order.id}`}</span>
                      <button
                        onClick={() => handleClaim(order)}
                        disabled={claiming === order.id}
                        className="bg-accent text-bg-base border-none px-3 py-1 rounded text-[11px] font-semibold cursor-pointer hover:opacity-90 disabled:opacity-50"
                      >
                        {claiming === order.id ? 'Asignando...' : 'Aceptar'}
                      </button>
                    </div>
                    {order.delivery_address && (
                      <p className="text-[12px] text-text-primary flex items-center gap-1 mt-1">
                        <MapPin size={11} className="text-text-secondary" />
                        {order.delivery_address}
                      </p>
                    )}
                    {order.customer_name && (
                      <p className="text-[12px] text-text-secondary mt-0.5">{order.customer_name}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {!myOrder && availableOrders.length === 0 && orders.length > 0 && (
          <div className="px-5 py-3 border-t border-border max-h-[150px] overflow-y-auto">
            <p className="text-[11px] text-text-secondary uppercase tracking-[1px] mb-2">Asignados a otros</p>
            {orders.filter((o) => !o.isAvailable && !o.isMine).map((order) => (
              <div key={order.id} className="px-3 py-2 rounded text-[13px] text-text-secondary opacity-60 mb-1">
                <span className="font-medium">{order.code || `#${order.id}`}</span>
                <span className="ml-2">→ {order.deliveryUser?.name || 'Asignado'}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

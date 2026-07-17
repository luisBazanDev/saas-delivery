import { useEffect, useRef, useState } from 'react'

interface StoreMapProps {
  center?: [number, number]
  zoom?: number
  height?: string
  storeLocation?: { lat: number; lon: number; name: string }
  deliveryMarkers?: Array<{ id: number; lat: number; lon: number; label: string; status: string }>
  deliveryUsers?: Array<{ id: number; name: string; lat: number | null; lon: number | null }>
  draggableMarker?: { lat: number; lon: number }
  onMarkerDragEnd?: (lat: number, lon: number) => void
  onClick?: (lat: number, lon: number) => void
  interactive?: boolean
}

export default function StoreMap({
  center = [-6.7714, -79.8390],
  zoom = 14,
  height = '350px',
  storeLocation,
  deliveryMarkers = [],
  deliveryUsers = [],
  draggableMarker,
  onMarkerDragEnd,
  onClick,
  interactive = true,
}: StoreMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const LRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient || !mapRef.current || mapInstanceRef.current) return

    let cancelled = false

    const init = async () => {
      await import('leaflet/dist/leaflet.css')
      const L = (await import('leaflet')).default
      LRef.current = L

      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      })

      if (cancelled || !mapRef.current) return

      const bikeIcon = new L.DivIcon({
        html: `<div style="background:#f97316;width:24px;height:24px;border-radius:50%;border:2px solid white;display:flex;align-items:center;justify-content:center;font-size:12px;">🏍️</div>`,
        className: '',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -12],
      })

      const storeMarkerIcon = new L.DivIcon({
        html: `<div style="background:#3b82f6;width:28px;height:28px;border-radius:50%;border:3px solid white;display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 2px 6px rgba(0,0,0,0.3);">🏪</div>`,
        className: '',
        iconSize: [28, 28],
        iconAnchor: [14, 28],
        popupAnchor: [0, -28],
      })

      const map = L.map(mapRef.current, {
        center,
        zoom,
        scrollWheelZoom: interactive,
        zoomControl: interactive,
        dragging: interactive,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map)

      if (interactive && onClick) {
        map.on('click', (e: any) => {
          onClick(e.latlng.lat, e.latlng.lng)
        })
      }

      mapInstanceRef.current = { map, bikeIcon, storeMarkerIcon, L }
    }

    init()

    return () => {
      cancelled = true
      if (mapInstanceRef.current) {
        mapInstanceRef.current.map.remove()
        mapInstanceRef.current = null
        markersRef.current = []
      }
    }
  }, [isClient])

  useEffect(() => {
    if (!mapInstanceRef.current) return
    mapInstanceRef.current.map.setView(center)
  }, [center])

  useEffect(() => {
    if (!mapInstanceRef.current) return

    const { map, bikeIcon, storeMarkerIcon, L } = mapInstanceRef.current

    markersRef.current.forEach((m: any) => map.removeLayer(m))
    markersRef.current = []

    if (storeLocation) {
      const m = L.marker([storeLocation.lat, storeLocation.lon], { icon: storeMarkerIcon })
        .bindPopup(`<strong>${storeLocation.name}</strong>`)
        .addTo(map)
      markersRef.current.push(m)
    }

    deliveryMarkers.forEach((d) => {
      const color = d.status === 'IN_TRANSIT' ? '#f97316' : '#22c55e'
      const m = L.marker([d.lat, d.lon])
        .bindPopup(`<strong>Pedido #${d.id}</strong><br/>${d.label}<br/><span style="color:${color}">${d.status}</span>`)
        .addTo(map)
      markersRef.current.push(m)
    })

    deliveryUsers
      .filter((u) => u.lat != null && u.lon != null)
      .forEach((u) => {
        const m = L.marker([u.lat!, u.lon!], { icon: bikeIcon })
          .bindPopup(`<strong>${u.name}</strong><br/>Repartidor activo`)
          .addTo(map)
        markersRef.current.push(m)
      })

    if (draggableMarker && onMarkerDragEnd) {
      const m = L.marker([draggableMarker.lat, draggableMarker.lon], { draggable: true })
        .bindPopup('Arrastra para ajustar la ubicación')
        .addTo(map)
      m.on('dragend', (e: any) => {
        const { lat, lng } = e.target.getLatLng()
        onMarkerDragEnd(lat, lng)
      })
      markersRef.current.push(m)
    }
  }, [storeLocation, deliveryMarkers, deliveryUsers, draggableMarker, onMarkerDragEnd])

  if (!isClient) {
    return (
      <div style={{ height, width: '100%', backgroundColor: '#1a1a2e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: '#888', fontSize: '14px' }}>Cargando mapa...</span>
      </div>
    )
  }

  return <div ref={mapRef} style={{ height, width: '100%' }} />
}

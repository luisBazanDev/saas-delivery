import { useState, useEffect } from 'react'
import { api } from '../../lib/http'
import type { Store } from '../../lib/types'
import { MapPin } from 'lucide-react'

export default function StoreList() {
  const [stores, setStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<Store[]>('/stores')
      .then(setStores)
      .catch(() => setStores([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-[16px] font-semibold">Listado de Locales (/stores)</h3>
      </div>

      {loading ? (
        <p className="text-text-secondary text-sm">Cargando locales...</p>
      ) : stores.length === 0 ? (
        <p className="text-text-secondary text-sm">No hay locales disponibles</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {stores.map((store) => (
            <a
              key={store.id}
              href={`/store/${store.id}`}
              className="bg-bg-surface border border-border rounded-lg p-5 cursor-pointer transition-all duration-200 hover:border-accent block"
            >
              <h4 className="text-[15px] font-medium mb-2.5 text-text-primary">{store.name}</h4>
              {store.address && (
                <p className="text-[13px] text-text-secondary flex items-center gap-1.5">
                  <MapPin size={14} />
                  {store.address}
                </p>
              )}
              <p className="text-[13px] text-text-secondary mt-4">
                {store.is_active ? 'Activo' : 'Inactivo'}
              </p>
              <button className="w-full mt-5 bg-transparent border border-border text-text-primary px-3 py-2.5 rounded-lg cursor-pointer text-[13px] hover:border-accent hover:text-accent transition-colors">
                Acceder al Panel
              </button>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}

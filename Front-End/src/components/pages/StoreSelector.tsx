import { useState, useEffect } from 'react'
import { api } from '../../lib/api'
import { removeToken, removeTokenCookie, setToken, setTokenCookie, decodeToken } from '../../lib/auth'
import type { Store } from '../../lib/types'
import { Zap, LogOut, Building2 } from 'lucide-react'

export default function StoreSelector() {
  const [stores, setStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(true)
  const [selecting, setSelecting] = useState<number | null>(null)

  useEffect(() => {
    api.get<Store[]>('/stores')
      .then(setStores)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  function handleLogout() {
    removeToken()
    removeTokenCookie()
    window.location.href = '/login'
  }

  async function handleSelectStore(storeId: number) {
    setSelecting(storeId)
    try {
      const res = await api.post<{ token: string; store_id: number }>('/admin/select-store', { store_id: storeId })
      if (res.token) {
        setToken(res.token)
        setTokenCookie(res.token)
      }
      window.location.href = `/store/${storeId}/orders`
    } catch {
      setSelecting(null)
    }
  }

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col">
      <header className="border-b border-dark-border bg-dark-card px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap size={18} className="text-accent-green" />
          <h1 className="text-base font-bold text-text-primary">HX Delivery</h1>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-text-secondary hover:bg-dark-hover hover:text-text-primary transition-colors text-sm"
        >
          <LogOut size={16} />
          <span>Cerrar Sesión</span>
        </button>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          <h2 className="text-2xl font-bold text-text-primary mb-2">Seleccionar Tienda</h2>
          <p className="text-text-secondary mb-6">Elige la tienda que deseas gestionar</p>

          {loading ? (
            <p className="text-text-secondary">Cargando tiendas...</p>
          ) : stores.length === 0 ? (
            <p className="text-text-secondary">No hay tiendas disponibles</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stores.map((store) => (
                <button
                  key={store.id}
                  onClick={() => handleSelectStore(store.id)}
                  disabled={selecting !== null}
                  className="bg-dark-card border border-dark-border rounded-xl p-5 text-left hover:border-accent-green/50 hover:bg-dark-hover transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-start gap-3">
                    <Building2 size={20} className="text-accent-green mt-0.5 shrink-0" />
                    <div>
                      <h3 className="text-text-primary font-medium group-hover:text-accent-green transition-colors">
                        {store.name}
                      </h3>
                      {store.address && (
                        <p className="text-text-muted text-sm mt-1">{store.address}</p>
                      )}
                      {selecting === store.id && (
                        <p className="text-accent-green text-sm mt-2">Seleccionando...</p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

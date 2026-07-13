import { useState } from 'react'
import { loginApi } from '../../lib/api'
import { setToken, setTokenCookie, setUser, decodeToken } from '../../lib/auth'
import { Zap } from 'lucide-react'

export default function LoginForm() {
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const sanitizedName = name.trim()
    if (!sanitizedName || !password) {
      setError('Usuario y contraseña son requeridos')
      setLoading(false)
      return
    }

    try {
      const res = await loginApi(sanitizedName, password)
      setToken(res.bearerToken)
      setTokenCookie(res.bearerToken)

      const payload = decodeToken(res.bearerToken)
      if (payload) {
        setUser({ id: payload.sub, name: payload.name, role_name: payload.role_name, store_id: payload.store_id })
      }

      if (payload?.role_name === 'ADMIN') {
        window.location.href = '/admin/stores'
      } else if (payload?.role_name === 'STORE_ADMIN') {
        window.location.href = '/stores'
      } else if (payload?.role_name === 'STORE_CHEF') {
        window.location.href = `/store/${res.store_id}/kitchen`
      } else if (payload?.role_name === 'STORE_DELIVERY') {
        window.location.href = `/store/${res.store_id}/delivery`
      } else if (res.store_id) {
        window.location.href = `/store/${res.store_id}/orders`
      } else {
        setError('No tienes una tienda asignada. Contacta al administrador.')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-bg-base z-[10000] flex items-center justify-center p-5">
      <div className="bg-bg-surface border border-border p-10 w-full max-w-[380px] rounded-lg">
        <h2 className="title-font flex items-center justify-center gap-2 mb-8 text-2xl">
          <Zap size={24} className="text-accent" />
          HX Delivery
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label className="block text-[12px] text-text-secondary uppercase tracking-[1px] mb-2">Usuario</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="superadmin, admin, encargado..."
              className="w-full bg-bg-base border border-border px-4 py-3 rounded-lg text-text-primary outline-none focus:border-accent transition-colors text-[14px]"
              autoComplete="username"
            />
          </div>

          <div className="mb-5">
            <label className="block text-[12px] text-text-secondary uppercase tracking-[1px] mb-2">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••"
              className="w-full bg-bg-base border border-border px-4 py-3 rounded-lg text-text-primary outline-none focus:border-accent transition-colors text-[14px]"
              autoComplete="current-password"
            />
          </div>

          {error && (
            <p className="mb-4 text-sm text-danger bg-danger/10 border border-danger/30 rounded-lg px-3 py-2.5">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent text-bg-base border-none px-4 py-3.5 rounded-lg font-semibold cursor-pointer transition-opacity hover:opacity-90 text-[13px] flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Iniciando sesión...' : 'Acceder al Sistema'}
          </button>
        </form>

        <div className="mt-5 text-[11px] text-text-secondary leading-relaxed">
          <strong className="text-text-primary">Demo Roles:</strong><br />
          1. <code className="text-accent">superadmin</code> (CRUD Locales)<br />
          2. <code className="text-accent">admin</code> (Dueño: Locales, Docs, Rep, Kanban)<br />
          3. <code className="text-accent">encargado</code> (Dashboard, Kanban)<br />
          4. <code className="text-accent">cocinero</code> (Vista KDS Cocina)<br />
          5. <code className="text-accent">repartidor</code> (Vista Móvil Entrega)
        </div>
      </div>
    </div>
  )
}

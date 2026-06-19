import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { decodeToken } from '../../lib/auth'
import Input from '../ui/Input'
import Button from '../ui/Button'
import { Zap } from 'lucide-react'

export default function LoginForm() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login, loading, logout } = useAuth()

  function sanitizeInput(value: string): string {
    return value.replace(/[<>"'&]/g, '')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const sanitizedUsername = sanitizeInput(username.trim())
    const sanitizedPassword = password

    if (!sanitizedUsername || !sanitizedPassword) {
      setError('Usuario y contraseña son requeridos')
      return
    }

    if (sanitizedUsername.length < 3 || sanitizedUsername.length > 50) {
      setError('El usuario debe tener entre 3 y 50 caracteres')
      return
    }

    if (sanitizedPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    try {
      await login(sanitizedUsername, sanitizedPassword)
      const token = localStorage.getItem('auth_token')
      if (token) {
        const payload = decodeToken(token)
        if (payload?.store_id) {
          window.location.href = `/store/${payload.store_id}/orders`
        } else if (payload?.role === 'ADMIN') {
          window.location.href = '/admin/stores'
        } else {
          logout()
          setError('No tienes una tienda asignada. Contacta al administrador.')
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <Zap size={24} className="text-accent-green" />
            <span className="text-xl font-bold text-text-primary">SaaS Delivery</span>
          </div>
          <p className="text-text-secondary text-sm">Inicia sesión en tu cuenta</p>
        </div>
        <div className="bg-dark-card border border-dark-border rounded-xl p-8">
          <form onSubmit={handleSubmit}>
            <Input
              id="username"
              label="Usuario"
              type="text"
              value={username}
              onChange={(e) => setUsername(sanitizeInput(e.target.value))}
              required
              placeholder="Ingresa tu usuario"
              maxLength={50}
              autoComplete="username"
            />
            <Input
              id="password"
              label="Contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Ingresa tu contraseña"
              minLength={6}
              autoComplete="current-password"
            />
            {error && (
              <p className="mb-4 text-sm text-accent-red bg-accent-red/10 border border-accent-red/20 rounded-lg px-3 py-2.5">
                {error}
              </p>
            )}
            <Button type="submit" disabled={loading} className="w-full" size="lg">
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

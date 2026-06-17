import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import Input from '../ui/Input'
import Button from '../ui/Button'
import { Zap } from 'lucide-react'

export default function LoginForm() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login, loading } = useAuth()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    try {
      await login(username, password)
      window.location.href = '/'
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
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
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Ingresa tu usuario"
            />
            <Input
              id="password"
              label="Contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Ingresa tu contraseña"
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

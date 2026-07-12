import { useState, useEffect } from 'react'
import { api } from '../../lib/api'
import { getUser } from '../../lib/auth'
import type { User, UserRole, UserListResponse } from '../../lib/types'
import { Plus, Pencil, Trash2, Users } from 'lucide-react'

const ROLE_LEVEL: Record<string, number> = {
  ADMIN: 100,
  STORE_ADMIN: 50,
  STORE_MANAGER: 30,
  STORE_CHEF: 20,
  STORE_DELIVERY: 10,
}

function getAvailableRoles(userRole: string): UserRole[] {
  const level = ROLE_LEVEL[userRole] ?? 0
  const allRoles: UserRole[] = ['STORE_ADMIN', 'STORE_MANAGER', 'STORE_CHEF', 'STORE_DELIVERY']
  return allRoles.filter((r) => ROLE_LEVEL[r] <= level)
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<User | null>(null)
  const [form, setForm] = useState({ username: '', password: '', email: '', phone: '', role: 'STORE_MANAGER' as UserRole, store_id: undefined as number | undefined })
  const [submitting, setSubmitting] = useState(false)

  const currentUser = getUser()
  const availableRoles = getAvailableRoles(currentUser?.role || '')

  useEffect(() => { fetchUsers() }, [page])

  async function fetchUsers() {
    setLoading(true)
    try {
      const res = await api.get<UserListResponse>(`/users?page=${page}&limit=20`)
      setUsers(res.users)
      setTotalPages(res.pagination.totalPages)
    } catch {
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      if (editing) {
        await api.put(`/users/${editing.id}`, form)
      } else {
        await api.post('/users', form)
      }
      resetForm()
      fetchUsers()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSubmitting(false)
    }
  }

  function resetForm() {
    setForm({ username: '', password: '', email: '', phone: '', role: availableRoles[0] || 'STORE_MANAGER', store_id: undefined })
    setEditing(null)
    setShowForm(false)
  }

  function handleEdit(user: User) {
    setEditing(user)
    setForm({ username: user.username, password: '', email: user.email || '', phone: user.phone || '', role: user.role, store_id: user.store_id })
    setShowForm(true)
  }

  async function handleDelete(id: number) {
    if (!confirm('¿Eliminar este usuario?')) return
    try {
      await api.delete(`/users/${id}`)
      fetchUsers()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al eliminar')
    }
  }

  async function handleToggle(id: number) {
    try {
      await api.patch(`/users/${id}/toggle`, {})
      fetchUsers()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al cambiar estado')
    }
  }

  return (
    <div>
      <div className="bg-bg-surface border border-border rounded-lg p-6 mb-5">
        <div className="flex justify-between items-center mb-5 border-b border-border pb-4">
          <h3 className="flex items-center gap-2 text-[16px] font-semibold">
            <Users size={18} className="text-accent" />
            CRUD de Usuarios y Asignaciones (/users)
          </h3>
          <button
            onClick={() => { resetForm(); setShowForm(true) }}
            className="bg-accent text-bg-base border-none px-4 py-2.5 rounded-lg font-semibold cursor-pointer transition-opacity hover:opacity-90 text-[13px] flex items-center gap-2"
          >
            <Plus size={14} />
            Crear Usuario
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="mb-5 p-4 bg-bg-elevated rounded-lg border border-border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-[12px] text-text-secondary uppercase tracking-[1px] mb-1.5">Usuario *</label>
                <input type="text" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} className="w-full bg-bg-base border border-border px-3 py-2.5 rounded-lg text-text-primary outline-none focus:border-accent text-[14px]" required />
              </div>
              <div>
                <label className="block text-[12px] text-text-secondary uppercase tracking-[1px] mb-1.5">Contraseña {!editing && '*'}</label>
                <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full bg-bg-base border border-border px-3 py-2.5 rounded-lg text-text-primary outline-none focus:border-accent text-[14px]" required={!editing} />
              </div>
              <div>
                <label className="block text-[12px] text-text-secondary uppercase tracking-[1px] mb-1.5">Email</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full bg-bg-base border border-border px-3 py-2.5 rounded-lg text-text-primary outline-none focus:border-accent text-[14px]" />
              </div>
              <div>
                <label className="block text-[12px] text-text-secondary uppercase tracking-[1px] mb-1.5">Teléfono</label>
                <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full bg-bg-base border border-border px-3 py-2.5 rounded-lg text-text-primary outline-none focus:border-accent text-[14px]" />
              </div>
              <div>
                <label className="block text-[12px] text-text-secondary uppercase tracking-[1px] mb-1.5">Rol *</label>
                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })} className="w-full bg-bg-base border border-border px-3 py-2.5 rounded-lg text-text-primary outline-none focus:border-accent text-[14px]" required>
                  {availableRoles.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={submitting} className="bg-accent text-bg-base border-none px-4 py-2 rounded-lg font-semibold cursor-pointer text-[13px] disabled:opacity-50">
                {submitting ? 'Guardando...' : editing ? 'Actualizar' : 'Crear'}
              </button>
              <button type="button" onClick={resetForm} className="bg-transparent border border-border text-text-primary px-4 py-2 rounded-lg cursor-pointer text-[13px] hover:border-border-hover">
                Cancelar
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <p className="text-text-secondary text-sm">Cargando...</p>
        ) : users.length === 0 ? (
          <p className="text-text-secondary text-sm">No hay usuarios registrados</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr>
                  <th className="text-text-secondary text-[12px] font-medium uppercase py-4 px-3 border-b border-border">Usuario</th>
                  <th className="text-text-secondary text-[12px] font-medium uppercase py-4 px-3 border-b border-border">Rol</th>
                  <th className="text-text-secondary text-[12px] font-medium uppercase py-4 px-3 border-b border-border">Local</th>
                  <th className="text-text-secondary text-[12px] font-medium uppercase py-4 px-3 border-b border-border">Estado</th>
                  <th className="text-text-secondary text-[12px] font-medium uppercase py-4 px-3 border-b border-border">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-bg-elevated transition-colors">
                    <td className="py-4 px-3 text-[14px] font-medium border-b border-border">{user.username}</td>
                    <td className="py-4 px-3 text-[14px] border-b border-border">
                      <span className="px-2 py-1 rounded text-[11px] border border-border text-text-secondary">{user.role}</span>
                    </td>
                    <td className="py-4 px-3 text-[14px] text-text-secondary border-b border-border">{user.Store?.name || '-'}</td>
                    <td className="py-4 px-3 border-b border-border">
                      <button onClick={() => handleToggle(user.id)} className={`px-2 py-1 rounded text-[11px] border ${user.is_active ? 'text-accent border-accent/30' : 'text-text-secondary border-border'}`}>
                        {user.is_active ? 'Activo' : 'Inactivo'}
                      </button>
                    </td>
                    <td className="py-4 px-3 border-b border-border">
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(user)} className="bg-transparent border border-border text-text-primary px-3 py-1.5 rounded cursor-pointer text-[12px] flex items-center gap-1.5 hover:border-border-hover">
                          <Pencil size={12} /> Editar
                        </button>
                        <button onClick={() => handleDelete(user.id)} className="bg-transparent border border-danger/30 text-danger px-3 py-1.5 rounded cursor-pointer text-[12px] flex items-center gap-1.5 hover:bg-danger/10">
                          <Trash2 size={12} /> Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex gap-1.5 justify-end mt-5">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="bg-bg-base border border-border text-text-primary px-3 py-1.5 rounded cursor-pointer text-[12px] disabled:opacity-50">&lt;</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setPage(p)} className={`px-3 py-1.5 rounded cursor-pointer text-[12px] border ${p === page ? 'border-accent text-accent' : 'border-border text-text-primary bg-bg-base'}`}>{p}</button>
            ))}
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="bg-bg-base border border-border text-text-primary px-3 py-1.5 rounded cursor-pointer text-[12px] disabled:opacity-50">&gt;</button>
          </div>
        )}
      </div>
    </div>
  )
}

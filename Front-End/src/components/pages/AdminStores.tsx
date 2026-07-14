import { useState, useEffect } from 'react'
import { api } from '../../lib/http'
import type { Store } from '../../lib/types'
import { Plus, Pencil, Trash2, Store as StoreIcon } from 'lucide-react'

export default function AdminStores() {
  const [stores, setStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Store | null>(null)
  const [form, setForm] = useState({ name: '', address: '', phone: '', email: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => { fetchStores() }, [])

  async function fetchStores() {
    try {
      const data = await api.get<Store[]>('/admin/stores')
      setStores(data)
    } catch {
      setStores([])
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      if (editing) {
        await api.put(`/admin/stores/${editing.id}`, form)
      } else {
        await api.post('/admin/stores', form)
      }
      resetForm()
      fetchStores()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSubmitting(false)
    }
  }

  function resetForm() {
    setForm({ name: '', address: '', phone: '', email: '' })
    setEditing(null)
    setShowForm(false)
  }

  function handleEdit(store: Store) {
    setEditing(store)
    setForm({ name: store.name, address: store.address || '', phone: store.phone || '', email: store.email || '' })
    setShowForm(true)
  }

  async function handleDelete(id: number) {
    if (!confirm('¿Eliminar este local?')) return
    try {
      await api.delete(`/admin/stores/${id}`)
      fetchStores()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al eliminar')
    }
  }

  async function handleToggle(id: number) {
    try {
      await api.patch(`/admin/stores/${id}/toggle`, {})
      fetchStores()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al cambiar estado')
    }
  }

  return (
    <div>
      <div className="bg-bg-surface border border-border rounded-lg p-6 mb-5">
        <div className="flex justify-between items-center mb-5 border-b border-border pb-4">
          <h3 className="flex items-center gap-2 text-[16px] font-semibold">
            <StoreIcon size={18} className="text-accent" />
            CRUD de Locales (/admin/stores)
          </h3>
          <button
            onClick={() => { resetForm(); setShowForm(true) }}
            className="bg-accent text-bg-base border-none px-4 py-2.5 rounded-lg font-semibold cursor-pointer transition-opacity hover:opacity-90 text-[13px] flex items-center gap-2"
          >
            <Plus size={14} />
            Crear Local
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="mb-5 p-4 bg-bg-elevated rounded-lg border border-border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-[12px] text-text-secondary uppercase tracking-[1px] mb-1.5">Nombre *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-bg-base border border-border px-3 py-2.5 rounded-lg text-text-primary outline-none focus:border-accent text-[14px]"
                  required
                />
              </div>
              <div>
                <label className="block text-[12px] text-text-secondary uppercase tracking-[1px] mb-1.5">Dirección</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full bg-bg-base border border-border px-3 py-2.5 rounded-lg text-text-primary outline-none focus:border-accent text-[14px]"
                />
              </div>
              <div>
                <label className="block text-[12px] text-text-secondary uppercase tracking-[1px] mb-1.5">Teléfono</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full bg-bg-base border border-border px-3 py-2.5 rounded-lg text-text-primary outline-none focus:border-accent text-[14px]"
                />
              </div>
              <div>
                <label className="block text-[12px] text-text-secondary uppercase tracking-[1px] mb-1.5">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-bg-base border border-border px-3 py-2.5 rounded-lg text-text-primary outline-none focus:border-accent text-[14px]"
                />
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
        ) : stores.length === 0 ? (
          <p className="text-text-secondary text-sm">No hay locales registrados</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr>
                  <th className="text-text-secondary text-[12px] font-medium uppercase py-4 px-3 border-b border-border">ID</th>
                  <th className="text-text-secondary text-[12px] font-medium uppercase py-4 px-3 border-b border-border">Nombre</th>
                  <th className="text-text-secondary text-[12px] font-medium uppercase py-4 px-3 border-b border-border">Dirección</th>
                  <th className="text-text-secondary text-[12px] font-medium uppercase py-4 px-3 border-b border-border">Estado</th>
                  <th className="text-text-secondary text-[12px] font-medium uppercase py-4 px-3 border-b border-border">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {stores.map((store) => (
                  <tr key={store.id} className="hover:bg-bg-elevated transition-colors">
                    <td className="py-4 px-3 text-[14px] border-b border-border">#{store.id}</td>
                    <td className="py-4 px-3 text-[14px] font-medium border-b border-border">{store.name}</td>
                    <td className="py-4 px-3 text-[14px] text-text-secondary border-b border-border">{store.address || '-'}</td>
                    <td className="py-4 px-3 border-b border-border">
                      <button
                        onClick={() => handleToggle(store.id)}
                        className={`px-2 py-1 rounded text-[11px] border ${store.is_active ? 'text-accent border-accent/30' : 'text-text-secondary border-border'}`}
                      >
                        {store.is_active ? 'Activo' : 'Inactivo'}
                      </button>
                    </td>
                    <td className="py-4 px-3 border-b border-border">
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(store)} className="bg-transparent border border-border text-text-primary px-3 py-1.5 rounded cursor-pointer text-[12px] flex items-center gap-1.5 hover:border-border-hover">
                          <Pencil size={12} /> Editar
                        </button>
                        <button onClick={() => handleDelete(store.id)} className="bg-transparent border border-danger/30 text-danger px-3 py-1.5 rounded cursor-pointer text-[12px] flex items-center gap-1.5 hover:bg-danger/10">
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
      </div>
    </div>
  )
}

import { useState, useEffect, useRef } from 'react'
import { api } from '../../lib/api'
import type { Order, KanbanResponse } from '../../lib/types'
import { Plus, FileText, Trash2, MapPin } from 'lucide-react'

interface OrderKanbanProps {
  storeId: string
}

const columns = [
  { id: 'PENDING', title: 'RECIBIDO', color: '' },
  { id: 'IN_PROGRESS', title: 'EN PREPARACIÓN', color: 'text-[#eab308]' },
  { id: 'IN_TRANSIT', title: 'EN CAMINO', color: 'text-[#3b82f6]' },
  { id: 'DELIVERED', title: 'ENTREGADO', color: 'text-[#22c55e]' },
]

export default function OrderKanban({ storeId }: OrderKanbanProps) {
  const [kanban, setKanban] = useState<Record<string, Order[]>>({ PENDING: [], IN_PROGRESS: [], IN_TRANSIT: [], DELIVERED: [], DONE: [] })
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ customer_name: '', customer_phone: '', address: '', total: '', products: '' })
  const [submitting, setSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { fetchOrders() }, [storeId])

  async function fetchOrders() {
    try {
      const res = await api.get<KanbanResponse>(`/stores/${storeId}/orders`)
      setKanban(res.kanban)
    } catch {
      setKanban({ PENDING: [], IN_PROGRESS: [], IN_TRANSIT: [], DELIVERED: [], DONE: [] })
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const products = form.products.split('\n').filter(Boolean).map((line) => {
        const [product_id, amount, price] = line.split(',').map((s) => s.trim())
        return { product_id: Number(product_id), amount: Number(amount), price: Number(price) }
      })
      await api.post(`/stores/${storeId}/orders`, {
        customer_name: form.customer_name,
        customer_phone: form.customer_phone,
        address: form.address,
        total: Number(form.total) || 0,
        products,
      })
      setForm({ customer_name: '', customer_phone: '', address: '', total: '', products: '' })
      setShowForm(false)
      fetchOrders()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al crear orden')
    } finally {
      setSubmitting(false)
    }
  }

  function handleCSVImport(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (e) => {
      const content = e.target?.result as string
      const lines = content.split('\n')

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim()
        if (!line) continue
        const data = line.split(',').map((s) => s.trim())
        const [code, customer_name, , , total, address] = data

        try {
          await api.post(`/stores/${storeId}/orders`, {
            code,
            customer_name,
            address,
            total: Number(total) || 0,
            products: [],
          })
        } catch {
          console.error(`Error importing order ${code}`)
        }
      }

      fetchOrders()
      alert('¡Órdenes CSV importadas exitosamente!')
    }
    reader.readAsText(file)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleDelete(code: string) {
    if (!confirm('¿Eliminar esta orden?')) return
    try {
      await api.delete(`/stores/${storeId}/orders/${code}`)
      fetchOrders()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al eliminar')
    }
  }

  async function advanceStatus(order: Order) {
    const nextStatus: Record<string, string> = {
      PENDING: 'IN_PROGRESS',
      IN_PROGRESS: 'DONE',
      DONE: 'IN_TRANSIT',
    }
    const next = nextStatus[order.status]
    if (!next) return

    try {
      await api.put(`/stores/${storeId}/orders/${order.code}/status`, { status: next })
      fetchOrders()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al actualizar')
    }
  }

  function renderCard(order: Order) {
    return (
      <div key={order.code} className="bg-bg-base border border-border p-4 rounded-lg relative">
        <button onClick={() => handleDelete(order.code)} className="absolute top-2.5 right-2.5 text-text-secondary cursor-pointer hover:text-danger" title="Eliminar Orden">
          <Trash2 size={14} />
        </button>
        <span className="text-accent font-bold text-[13px]">{order.code}</span>
        {order.customer_name && <p className="mt-2 text-[13px] text-text-primary">{order.customer_name}</p>}
        {order.address && (
          <p className="mt-1.5 text-[13px] text-text-primary flex items-center gap-1.5">
            <MapPin size={12} className="text-text-secondary" />
            {order.address}
          </p>
        )}
        {order.total !== undefined && order.total > 0 && (
          <p className="mt-1.5 text-[13px] text-accent font-medium">S/ {order.total.toFixed(2)}</p>
        )}
        {order.status !== 'DELIVERED' && order.status !== 'DONE' && (
          <button onClick={() => advanceStatus(order)} className="mt-3 w-full bg-accent text-bg-base border-none py-2 rounded-lg font-semibold cursor-pointer text-[12px] hover:opacity-90">
            Avanzar Estado
          </button>
        )}
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-5 flex-wrap gap-4">
        <h3 className="text-[16px] font-semibold">Tablero de Órdenes (/store/{storeId}/orders)</h3>
        <div className="flex items-center gap-2.5">
          <input type="file" ref={fileInputRef} accept=".csv" className="hidden" onChange={handleCSVImport} />
          <button onClick={() => fileInputRef.current?.click()} className="bg-transparent border border-border text-text-primary px-3 py-2 rounded-lg cursor-pointer text-[13px] flex items-center gap-2 hover:border-border-hover">
            <FileText size={14} className="text-accent" />
            Importar CSV
          </button>
          <button onClick={() => setShowForm(!showForm)} className="bg-accent text-bg-base border-none px-3 py-2 rounded-lg font-semibold cursor-pointer text-[13px] flex items-center gap-2 hover:opacity-90">
            <Plus size={14} />
            Nueva Orden
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-5 p-4 bg-bg-surface rounded-lg border border-border">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-[12px] text-text-secondary uppercase tracking-[1px] mb-1.5">Cliente *</label>
              <input type="text" value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} className="w-full bg-bg-base border border-border px-3 py-2.5 rounded-lg text-text-primary outline-none focus:border-accent text-[14px]" required />
            </div>
            <div>
              <label className="block text-[12px] text-text-secondary uppercase tracking-[1px] mb-1.5">Teléfono</label>
              <input type="text" value={form.customer_phone} onChange={(e) => setForm({ ...form, customer_phone: e.target.value })} className="w-full bg-bg-base border border-border px-3 py-2.5 rounded-lg text-text-primary outline-none focus:border-accent text-[14px]" />
            </div>
            <div>
              <label className="block text-[12px] text-text-secondary uppercase tracking-[1px] mb-1.5">Dirección</label>
              <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full bg-bg-base border border-border px-3 py-2.5 rounded-lg text-text-primary outline-none focus:border-accent text-[14px]" />
            </div>
            <div>
              <label className="block text-[12px] text-text-secondary uppercase tracking-[1px] mb-1.5">Total</label>
              <input type="number" step="0.01" value={form.total} onChange={(e) => setForm({ ...form, total: e.target.value })} className="w-full bg-bg-base border border-border px-3 py-2.5 rounded-lg text-text-primary outline-none focus:border-accent text-[14px]" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[12px] text-text-secondary uppercase tracking-[1px] mb-1.5">Productos (product_id,amount,price por línea)</label>
              <textarea value={form.products} onChange={(e) => setForm({ ...form, products: e.target.value })} className="w-full bg-bg-base border border-border px-3 py-2.5 rounded-lg text-text-primary outline-none focus:border-accent text-[14px] h-20" placeholder={"1,2,25.00\n3,1,15.50"} />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={submitting} className="bg-accent text-bg-base border-none px-4 py-2 rounded-lg font-semibold cursor-pointer text-[13px] disabled:opacity-50">
              {submitting ? 'Creando...' : 'Crear Orden'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="bg-transparent border border-border text-text-primary px-4 py-2 rounded-lg cursor-pointer text-[13px] hover:border-border-hover">
              Cancelar
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-text-secondary text-sm">Cargando órdenes...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {columns.map((col) => (
            <div key={col.id} className="bg-bg-surface border border-border rounded-lg flex flex-col">
              <div className="px-4 py-3.5 border-b border-border text-[13px] font-semibold flex justify-between">
                <span className={col.color || 'text-text-primary'}>{col.title}</span>
                <span className="text-text-secondary text-[12px]">{(kanban[col.id] || []).length}</span>
              </div>
              <div className="px-4 py-3.5 flex flex-col gap-2.5 min-h-[300px]">
                {(kanban[col.id] || []).map(renderCard)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

import { useState, useEffect, useRef } from 'react'
import { api } from '../../lib/http'
import type { Order, KanbanResponse, Product } from '../../lib/types'
import { Plus, FileText, Trash2, MapPin, Search, X, Minus, Plus as PlusIcon } from 'lucide-react'

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
  const [kanban, setKanban] = useState<Record<string, Order[]>>({ PENDING: [], IN_PROGRESS: [], IN_TRANSIT: [], DELIVERED: [] })
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ customer_name: '', customer_phone: '', address: '' })
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([])
  const [productSearch, setProductSearch] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { fetchOrders() }, [storeId])
  useEffect(() => { fetchProducts() }, [storeId])

  async function fetchOrders() {
    try {
      const res = await api.get<KanbanResponse>(`/stores/${storeId}/orders`)
      setKanban(res.kanban)
    } catch {
      setKanban({ PENDING: [], IN_PROGRESS: [], IN_TRANSIT: [], DELIVERED: [] })
    } finally {
      setLoading(false)
    }
  }

  async function fetchProducts() {
    try {
      const res = await api.get<Product[]>(`/products?archived=false`)
      setProducts(res.filter(p => p.store_id === Number(storeId) && p.is_available))
    } catch {
      setProducts([])
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (cart.length === 0) {
      alert('Agrega al menos un producto')
      return
    }
    setSubmitting(true)
    try {
      const total = cart.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0)
      await api.post(`/stores/${storeId}/orders`, {
        store_id: Number(storeId),
        customer_name: form.customer_name,
        phone: form.customer_phone,
        delivery_address: form.address,
        total_amount: total,
        products: cart.map(item => ({
          product_id: item.product.id,
          amount: item.quantity,
          price: Number(item.product.price),
        })),
      })
      setForm({ customer_name: '', customer_phone: '', address: '' })
      setCart([])
      setShowForm(false)
      fetchOrders()
      fetchProducts()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al crear orden')
    } finally {
      setSubmitting(false)
    }
  }

  function addToCart(product: Product) {
    if (product.stock === 0) return
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id)
      if (existing) {
        if (product.stock != null && existing.quantity >= product.stock) return prev
        return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
      }
      return [...prev, { product, quantity: 1 }]
    })
  }

  function removeFromCart(productId: number) {
    setCart(prev => prev.filter(item => item.product.id !== productId))
  }

  function updateQuantity(productId: number, delta: number) {
    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        const newQty = item.quantity + delta
        if (item.product.stock != null && newQty > item.product.stock) return item
        return newQty > 0 ? { ...item, quantity: newQty } : item
      }
      return item
    }).filter(item => item.quantity > 0))
  }

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    (p.description && p.description.toLowerCase().includes(productSearch.toLowerCase()))
  )

  const totalAmount = cart.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0)

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
            store_id: Number(storeId),
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

  async function handleDelete(id: number) {
    if (!confirm('¿Eliminar esta orden?')) return
    try {
      await api.delete(`/stores/${storeId}/orders/${id}`)
      fetchOrders()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al eliminar')
    }
  }

  async function advanceStatus(order: Order) {
    const nextStatus: Record<string, string> = {
      PENDING: 'IN_PROGRESS',
      IN_PROGRESS: 'IN_TRANSIT',
      IN_TRANSIT: 'DELIVERED',
    }
    const next = nextStatus[order.status]
    if (!next) return

    try {
      await api.put(`/stores/${storeId}/orders/${order.id}/status`, { status: next })
      fetchOrders()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al actualizar')
    }
  }

  function renderCard(order: Order) {
    return (
      <div key={order.id} className="bg-bg-base border border-border p-4 rounded-lg relative">
        <button onClick={() => handleDelete(order.id)} className="absolute top-2.5 right-2.5 text-text-secondary cursor-pointer hover:text-danger" title="Eliminar Orden">
          <Trash2 size={14} />
        </button>
        <span className="text-accent font-bold text-[13px]">{order.code || `#${order.id}`}</span>
        {order.customer_name && <p className="mt-2 text-[13px] text-text-primary">{order.customer_name}</p>}
        {order.delivery_address && (
          <p className="mt-1.5 text-[13px] text-text-primary flex items-center gap-1.5">
            <MapPin size={12} className="text-text-secondary" />
            {order.delivery_address}
          </p>
        )}
        {order.total_amount !== undefined && order.total_amount > 0 && (
          <p className="mt-1.5 text-[13px] text-accent font-medium">S/ {Number(order.total_amount).toFixed(2)}</p>
        )}
        {order.status !== 'DELIVERED' && (
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-bg-surface rounded-lg border border-border w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-border">
              <h4 className="text-[14px] font-semibold">Nueva Orden</h4>
              <button onClick={() => { setShowForm(false); setCart([]) }} className="text-text-secondary hover:text-text-primary cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-1 overflow-hidden">
              <div className="w-1/2 border-r border-border flex flex-col">
                <div className="p-4 border-b border-border">
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                    <input
                      type="text"
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      placeholder="Buscar productos..."
                      className="w-full bg-bg-base border border-border pl-9 pr-3 py-2 rounded-lg text-text-primary outline-none focus:border-accent text-[13px]"
                    />
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                  {filteredProducts.map(product => {
                    const isOutOfStock = product.stock === 0
                    const isLowStock = product.stock != null && product.stock > 0 && product.stock <= 5
                    const inCart = cart.find(item => item.product.id === product.id)
                    const atLimit = product.stock != null && inCart && inCart.quantity >= product.stock
                    return (
                      <div
                        key={product.id}
                        onClick={() => !isOutOfStock && !atLimit && addToCart(product)}
                        className={`bg-bg-base border rounded-lg p-3 transition-colors ${
                          isOutOfStock
                            ? 'border-border opacity-50 cursor-not-allowed'
                            : atLimit
                            ? 'border-[#eab308]/50 cursor-not-allowed'
                            : 'cursor-pointer hover:border-accent'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium text-[13px]">{product.name}</div>
                            {product.description && <div className="text-text-secondary text-[11px] mt-0.5">{product.description}</div>}
                          </div>
                          <div className="text-accent font-semibold text-[13px]">S/ {Number(product.price).toFixed(2)}</div>
                        </div>
                        {product.stock != null && (
                          <div className={`text-[11px] mt-1 ${
                            isOutOfStock ? 'text-danger' : isLowStock ? 'text-[#eab308]' : 'text-text-secondary'
                          }`}>
                            {isOutOfStock ? 'Sin stock' : `Stock: ${product.stock}`}
                          </div>
                        )}
                      </div>
                    )
                  })}
                  {filteredProducts.length === 0 && (
                    <div className="text-center text-text-secondary text-[13px] py-8">No hay productos disponibles</div>
                  )}
                </div>
              </div>

              <div className="w-1/2 flex flex-col">
                <div className="p-4 border-b border-border">
                  <h5 className="text-[13px] font-semibold mb-3">Productos Seleccionados</h5>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {cart.map(item => (
                      <div key={item.product.id} className="flex items-center justify-between bg-bg-base border border-border rounded-lg p-2">
                        <div className="flex-1 min-w-0">
                          <div className="text-[12px] font-medium truncate">{item.product.name}</div>
                          <div className="text-[11px] text-text-secondary">S/ {Number(item.product.price).toFixed(2)} c/u</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => updateQuantity(item.product.id, -1)} className="w-6 h-6 flex items-center justify-center rounded bg-bg-surface border border-border text-text-secondary hover:text-accent cursor-pointer">
                            <Minus size={12} />
                          </button>
                          <span className="text-[12px] font-medium w-6 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.product.id, 1)} className="w-6 h-6 flex items-center justify-center rounded bg-bg-surface border border-border text-text-secondary hover:text-accent cursor-pointer">
                            <PlusIcon size={12} />
                          </button>
                          <button onClick={() => removeFromCart(item.product.id)} className="ml-2 text-text-secondary hover:text-danger cursor-pointer">
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                    {cart.length === 0 && (
                      <div className="text-center text-text-secondary text-[12px] py-4">Haz clic en productos para agregarlos</div>
                    )}
                  </div>
                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-border">
                    <span className="text-[13px] font-semibold">Total:</span>
                    <span className="text-accent font-bold text-[15px]">S/ {totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-3 flex-1 overflow-y-auto">
                  <div>
                    <label className="block text-[11px] text-text-secondary uppercase tracking-[1px] mb-1">Cliente *</label>
                    <input
                      type="text"
                      value={form.customer_name}
                      onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                      className="w-full bg-bg-base border border-border px-3 py-2 rounded-lg text-text-primary outline-none focus:border-accent text-[13px]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-text-secondary uppercase tracking-[1px] mb-1">Teléfono</label>
                    <input
                      type="text"
                      value={form.customer_phone}
                      onChange={(e) => setForm({ ...form, customer_phone: e.target.value })}
                      className="w-full bg-bg-base border border-border px-3 py-2 rounded-lg text-text-primary outline-none focus:border-accent text-[13px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-text-secondary uppercase tracking-[1px] mb-1">Dirección</label>
                    <input
                      type="text"
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      className="w-full bg-bg-base border border-border px-3 py-2 rounded-lg text-text-primary outline-none focus:border-accent text-[13px]"
                    />
                  </div>
                </form>

                <div className="p-4 border-t border-border flex gap-2">
                  <button type="button" onClick={() => { setShowForm(false); setCart([]) }} className="flex-1 bg-transparent border border-border text-text-primary px-4 py-2 rounded-lg cursor-pointer text-[13px] hover:border-border-hover">
                    Cancelar
                  </button>
                  <button onClick={handleSubmit} disabled={submitting || cart.length === 0} className="flex-1 bg-accent text-bg-base border-none px-4 py-2 rounded-lg font-semibold cursor-pointer text-[13px] disabled:opacity-50">
                    {submitting ? 'Creando...' : 'Crear Orden'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
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

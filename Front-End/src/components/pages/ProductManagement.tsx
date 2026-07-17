import { useState, useEffect } from 'react'
import { api } from '../../lib/http'
import type { Product, Category } from '../../lib/types'
import { Plus, Edit2, Archive, RotateCcw, X, Search, Tag, Trash2 } from 'lucide-react'

interface ProductManagementProps {
  storeId: string
}

export default function ProductManagement({ storeId }: ProductManagementProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [showArchived, setShowArchived] = useState(false)
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({ name: '', price: '', description: '', stock: '', is_available: true, category_id: '' })
  const [submitting, setSubmitting] = useState(false)

  const [showCatForm, setShowCatForm] = useState(false)
  const [editingCat, setEditingCat] = useState<Category | null>(null)
  const [catName, setCatName] = useState('')
  const [catSubmitting, setCatSubmitting] = useState(false)

  useEffect(() => { fetchProducts() }, [storeId, showArchived])
  useEffect(() => { fetchCategories() }, [storeId])

  async function fetchProducts() {
    try {
      const res = await api.get<Product[]>(`/products?archived=${showArchived}`)
      setProducts(res)
    } catch {
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  async function fetchCategories() {
    try {
      const res = await api.get<Category[]>(`/stores/${storeId}/categories?active=false`)
      setCategories(res)
    } catch {
      setCategories([])
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const data: any = {
        store_id: Number(storeId),
        name: form.name,
        price: Number(form.price),
        description: form.description || undefined,
        stock: Number(form.stock) || 0,
        is_available: form.is_available,
      }
      if (form.category_id) {
        data.category_id = Number(form.category_id)
      }
      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, data)
      } else {
        await api.post('/products', data)
      }
      resetForm()
      fetchProducts()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al guardar producto')
    } finally {
      setSubmitting(false)
    }
  }

  function resetForm() {
    setForm({ name: '', price: '', description: '', stock: '', is_available: true, category_id: '' })
    setShowForm(false)
    setEditingProduct(null)
  }

  function handleEdit(product: Product) {
    setEditingProduct(product)
    setForm({
      name: product.name,
      price: String(product.price),
      description: product.description || '',
      stock: String(product.stock || 0),
      is_available: product.is_available,
      category_id: product.category_id ? String(product.category_id) : '',
    })
    setShowForm(true)
  }

  async function handleArchive(id: number) {
    if (!confirm('¿Archivar este producto?')) return
    try {
      await api.put(`/products/${id}/archive`, {})
      fetchProducts()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al archivar')
    }
  }

  async function handleUnarchive(id: number) {
    try {
      await api.put(`/products/${id}/unarchive`, {})
      fetchProducts()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al desarchivar')
    }
  }

  async function handleCatSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!catName.trim()) return
    setCatSubmitting(true)
    try {
      if (editingCat) {
        await api.put(`/stores/${storeId}/categories/${editingCat.id}`, { name: catName.trim() })
      } else {
        await api.post(`/stores/${storeId}/categories`, { name: catName.trim() })
      }
      setCatName('')
      setEditingCat(null)
      setShowCatForm(false)
      fetchCategories()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al guardar categoría')
    } finally {
      setCatSubmitting(false)
    }
  }

  async function handleCatToggle(cat: Category) {
    try {
      await api.put(`/stores/${storeId}/categories/${cat.id}`, { is_active: !cat.is_active })
      fetchCategories()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al actualizar categoría')
    }
  }

  async function handleCatDelete(cat: Category) {
    if (!confirm(`¿Eliminar la categoría "${cat.name}"?`)) return
    try {
      await api.delete(`/stores/${storeId}/categories/${cat.id}`)
      fetchCategories()
    } catch (err: any) {
      alert(err.response?.data?.error || err.message || 'Error al eliminar categoría')
    }
  }

  function handleEditCat(cat: Category) {
    setEditingCat(cat)
    setCatName(cat.name)
    setShowCatForm(true)
  }

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.description && p.description.toLowerCase().includes(search.toLowerCase()))
  )

  const activeCategories = categories.filter(c => c.is_active)
  const inactiveCategories = categories.filter(c => !c.is_active)

  return (
    <div className="flex gap-5">
      <div className="w-64 flex-shrink-0">
        <div className="bg-bg-surface border border-border rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex justify-between items-center">
            <h4 className="text-[13px] font-semibold flex items-center gap-2">
              <Tag size={14} className="text-accent" />
              Categorías
            </h4>
            <button
              onClick={() => { setEditingCat(null); setCatName(''); setShowCatForm(true) }}
              className="text-text-secondary hover:text-accent cursor-pointer"
              title="Nueva categoría"
            >
              <Plus size={14} />
            </button>
          </div>

          {showCatForm && (
            <form onSubmit={handleCatSubmit} className="p-3 border-b border-border bg-bg-base">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="Nombre de categoría"
                  className="flex-1 bg-bg-surface border border-border px-2 py-1.5 rounded text-text-primary outline-none focus:border-accent text-[12px]"
                  required
                  autoFocus
                />
                <button type="submit" disabled={catSubmitting} className="bg-accent text-bg-base border-none px-2 py-1 rounded text-[11px] font-semibold cursor-pointer disabled:opacity-50">
                  {catSubmitting ? '...' : editingCat ? 'Actualizar' : 'Crear'}
                </button>
                <button type="button" onClick={() => { setShowCatForm(false); setCatName(''); setEditingCat(null) }} className="text-text-secondary hover:text-text-primary cursor-pointer">
                  <X size={14} />
                </button>
              </div>
            </form>
          )}

          <div className="max-h-[500px] overflow-y-auto">
            {activeCategories.length === 0 && inactiveCategories.length === 0 && (
              <div className="px-4 py-6 text-center text-text-secondary text-[12px]">
                Sin categorías
              </div>
            )}
            {activeCategories.map(cat => (
              <div key={cat.id} className="px-4 py-2.5 border-b border-border last:border-b-0 flex items-center justify-between group hover:bg-bg-base/50">
                <span className="text-[12px] text-text-primary">{cat.name}</span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEditCat(cat)} className="text-text-secondary hover:text-accent cursor-pointer" title="Editar">
                    <Edit2 size={12} />
                  </button>
                  <button onClick={() => handleCatDelete(cat)} className="text-text-secondary hover:text-danger cursor-pointer" title="Eliminar">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
            {inactiveCategories.length > 0 && (
              <>
                <div className="px-4 py-1.5 bg-bg-base text-[10px] text-text-secondary uppercase tracking-[1px]">
                  Inactivas
                </div>
                {inactiveCategories.map(cat => (
                  <div key={cat.id} className="px-4 py-2.5 border-b border-border last:border-b-0 flex items-center justify-between opacity-50">
                    <span className="text-[12px] text-text-primary line-through">{cat.name}</span>
                    <button onClick={() => handleCatToggle(cat)} className="text-text-secondary hover:text-[#22c55e] cursor-pointer" title="Reactivar">
                      <RotateCcw size={12} />
                    </button>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1">
        <div className="flex justify-between items-center mb-5 flex-wrap gap-4">
          <h3 className="text-[16px] font-semibold">Gestión de Productos</h3>
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowArchived(!showArchived)}
              className={`bg-transparent border border-border text-text-primary px-3 py-2 rounded-lg cursor-pointer text-[13px] flex items-center gap-2 hover:border-border-hover ${showArchived ? 'border-accent text-accent' : ''}`}
            >
              <Archive size={14} />
              {showArchived ? 'Ver Activos' : 'Ver Archivados'}
            </button>
            <button
              onClick={() => { resetForm(); setShowForm(true) }}
              className="bg-accent text-bg-base border-none px-3 py-2 rounded-lg font-semibold cursor-pointer text-[13px] flex items-center gap-2 hover:opacity-90"
            >
              <Plus size={14} />
              Nuevo Producto
            </button>
          </div>
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-bg-surface rounded-lg border border-border w-full max-w-lg">
              <div className="flex justify-between items-center p-4 border-b border-border">
                <h4 className="text-[14px] font-semibold">{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</h4>
                <button onClick={resetForm} className="text-text-secondary hover:text-text-primary cursor-pointer">
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-4 space-y-4">
                <div>
                  <label className="block text-[12px] text-text-secondary uppercase tracking-[1px] mb-1.5">Categoría</label>
                  <select
                    value={form.category_id}
                    onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                    className="w-full bg-bg-base border border-border px-3 py-2.5 rounded-lg text-text-primary outline-none focus:border-accent text-[14px]"
                  >
                    <option value="">Sin categoría</option>
                    {activeCategories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[12px] text-text-secondary uppercase tracking-[1px] mb-1.5">Precio *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                      className="w-full bg-bg-base border border-border px-3 py-2.5 rounded-lg text-text-primary outline-none focus:border-accent text-[14px]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] text-text-secondary uppercase tracking-[1px] mb-1.5">Stock</label>
                    <input
                      type="number"
                      value={form.stock}
                      onChange={(e) => setForm({ ...form, stock: e.target.value })}
                      className="w-full bg-bg-base border border-border px-3 py-2.5 rounded-lg text-text-primary outline-none focus:border-accent text-[14px]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[12px] text-text-secondary uppercase tracking-[1px] mb-1.5">Descripción</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full bg-bg-base border border-border px-3 py-2.5 rounded-lg text-text-primary outline-none focus:border-accent text-[14px] h-20 resize-none"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_available"
                    checked={form.is_available}
                    onChange={(e) => setForm({ ...form, is_available: e.target.checked })}
                    className="rounded border-border"
                  />
                  <label htmlFor="is_available" className="text-[13px] text-text-primary">Disponible</label>
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <button type="button" onClick={resetForm} className="bg-transparent border border-border text-text-primary px-4 py-2 rounded-lg cursor-pointer text-[13px] hover:border-border-hover">
                    Cancelar
                  </button>
                  <button type="submit" disabled={submitting} className="bg-accent text-bg-base border-none px-4 py-2 rounded-lg font-semibold cursor-pointer text-[13px] disabled:opacity-50">
                    {submitting ? 'Guardando...' : editingProduct ? 'Actualizar' : 'Crear'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="mb-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar productos..."
              className="w-full bg-bg-base border border-border pl-9 pr-3 py-2.5 rounded-lg text-text-primary outline-none focus:border-accent text-[14px]"
            />
          </div>
        </div>

        {loading ? (
          <p className="text-text-secondary text-sm">Cargando productos...</p>
        ) : (
          <div className="bg-bg-surface border border-border rounded-lg overflow-hidden">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-3 text-text-secondary uppercase text-[11px] tracking-[1px]">Nombre</th>
                  <th className="text-left px-4 py-3 text-text-secondary uppercase text-[11px] tracking-[1px]">Categoría</th>
                  <th className="text-left px-4 py-3 text-text-secondary uppercase text-[11px] tracking-[1px]">Precio</th>
                  <th className="text-left px-4 py-3 text-text-secondary uppercase text-[11px] tracking-[1px]">Stock</th>
                  <th className="text-left px-4 py-3 text-text-secondary uppercase text-[11px] tracking-[1px]">Estado</th>
                  <th className="text-right px-4 py-3 text-text-secondary uppercase text-[11px] tracking-[1px]">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((product) => (
                  <tr key={product.id} className="border-b border-border last:border-b-0 hover:bg-bg-base/50">
                    <td className="px-4 py-3">
                      <div className="font-medium">{product.name}</div>
                      {product.description && <div className="text-text-secondary text-[12px] truncate max-w-[300px]">{product.description}</div>}
                    </td>
                    <td className="px-4 py-3">
                      {product.Category ? (
                        <span className="px-2 py-0.5 bg-accent/10 text-accent rounded text-[11px] font-medium">{product.Category.name}</span>
                      ) : (
                        <span className="text-text-secondary text-[11px]">Sin categoría</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-accent font-medium">S/ {Number(product.price).toFixed(2)}</td>
                    <td className="px-4 py-3">{product.stock ?? 0}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-[11px] font-semibold ${product.is_available ? 'bg-[#22c55e]/10 text-[#22c55e]' : 'bg-text-secondary/10 text-text-secondary'}`}>
                        {product.is_available ? 'Disponible' : 'No disponible'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleEdit(product)} className="text-text-secondary hover:text-accent cursor-pointer" title="Editar">
                          <Edit2 size={14} />
                        </button>
                        {showArchived ? (
                          <button onClick={() => handleUnarchive(product.id)} className="text-text-secondary hover:text-[#22c55e] cursor-pointer" title="Desarchivar">
                            <RotateCcw size={14} />
                          </button>
                        ) : (
                          <button onClick={() => handleArchive(product.id)} className="text-text-secondary hover:text-danger cursor-pointer" title="Archivar">
                            <Archive size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-text-secondary">
                      {showArchived ? 'No hay productos archivados' : 'No hay productos. Crea uno nuevo.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

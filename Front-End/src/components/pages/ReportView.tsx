import { useState, useEffect } from 'react'
import { api } from '../../lib/http'
import type { ReportSummary } from '../../lib/types'
import { FileText, FileSpreadsheet, FileCode, FileDown } from 'lucide-react'

interface ReportViewProps {
  storeId: string
}

const periods = [
  { value: 'week', label: 'Última Semana' },
  { value: 'month', label: 'Último Mes' },
  { value: 'quarter', label: 'Últimos 3 Meses' },
  { value: 'all', label: 'Todos' },
]

export default function ReportView({ storeId }: ReportViewProps) {
  const [data, setData] = useState<ReportSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('week')

  useEffect(() => { fetchReport() }, [storeId, period])

  async function fetchReport() {
    setLoading(true)
    try {
      const res = await api.get<ReportSummary>(`/stores/${storeId}/reports/summary?period=${period}`)
      setData(res)
    } catch {
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  function handleExport(format: string) {
    window.open(`/api/stores/${storeId}/reports/export?period=${period}&format=${format}`, '_blank')
  }

  return (
    <div>
      <div className="bg-bg-surface border border-border rounded-lg p-6 mb-5">
        <div className="flex flex-col gap-4 mb-5 border-b border-border pb-4">
          <h3 className="text-[16px] font-semibold">Reportes y Analítica (/store/{storeId}/reports)</h3>
          <div className="flex gap-2.5 flex-wrap">
            {periods.map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={`px-4 py-2 rounded-lg border text-[13px] cursor-pointer transition-colors ${
                  period === p.value
                    ? 'border-accent/30 text-accent bg-accent/5'
                    : 'border-border text-text-secondary hover:border-border-hover'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <p className="text-text-secondary text-sm">Cargando reportes...</p>
        ) : !data ? (
          <p className="text-text-secondary text-sm">No hay datos para el período seleccionado</p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
              <div className="bg-bg-base border border-border p-5 rounded-lg">
                <p className="text-text-secondary text-[11px] uppercase tracking-wider">CANTIDAD DE PEDIDOS</p>
                <h3 className="text-[28px] mt-2.5 font-medium">{data.summary.total_orders}</h3>
              </div>
              <div className="bg-bg-base border border-border p-5 rounded-lg">
                <p className="text-text-secondary text-[11px] uppercase tracking-wider">INGRESOS GENERADOS</p>
                <h3 className="text-[28px] mt-2.5 font-medium">S/ {data.summary.total_income.toFixed(2)}</h3>
              </div>
              <div className="bg-bg-base border border-border p-5 rounded-lg">
                <p className="text-text-secondary text-[11px] uppercase tracking-wider">PROMEDIO DIARIO</p>
                <h3 className="text-[28px] mt-2.5 font-medium">S/ {data.summary.daily_average.toFixed(2)}</h3>
              </div>
            </div>

            {data.summary.top_products.length > 0 && (
              <div className="mb-8">
                <h4 className="text-[14px] font-semibold mb-3">Top Productos</h4>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr>
                        <th className="text-text-secondary text-[12px] font-medium uppercase py-3 px-3 border-b border-border">Producto</th>
                        <th className="text-text-secondary text-[12px] font-medium uppercase py-3 px-3 border-b border-border">Vendidos</th>
                        <th className="text-text-secondary text-[12px] font-medium uppercase py-3 px-3 border-b border-border">Ingresos</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.summary.top_products.map((p, i) => (
                        <tr key={i} className="hover:bg-bg-elevated transition-colors">
                          <td className="py-3 px-3 text-[14px] border-b border-border">{p.name}</td>
                          <td className="py-3 px-3 text-[14px] border-b border-border">{p.total_sold}</td>
                          <td className="py-3 px-3 text-[14px] text-accent border-b border-border">S/ {p.total_revenue.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="mt-8">
              <p className="text-text-secondary text-[13px] mb-3">Exportar Movimientos y Datos Interesantes:</p>
              <div className="flex gap-2.5 flex-wrap">
                <button onClick={() => handleExport('csv')} className="bg-transparent border border-border text-text-primary px-4 py-2.5 rounded-lg cursor-pointer text-[13px] flex items-center gap-2 hover:border-border-hover">
                  <FileSpreadsheet size={14} className="text-[#3b82f6]" />
                  CSV
                </button>
                <button onClick={() => handleExport('html')} className="bg-transparent border border-border text-text-primary px-4 py-2.5 rounded-lg cursor-pointer text-[13px] flex items-center gap-2 hover:border-border-hover">
                  <FileCode size={14} className="text-[#eab308]" />
                  HTML
                </button>
                <button onClick={() => handleExport('pdf')} className="bg-transparent border border-border text-text-primary px-4 py-2.5 rounded-lg cursor-pointer text-[13px] flex items-center gap-2 hover:border-border-hover">
                  <FileText size={14} className="text-[#ef4444]" />
                  PDF
                </button>
                <button onClick={() => handleExport('excel')} className="bg-transparent border border-border text-text-primary px-4 py-2.5 rounded-lg cursor-pointer text-[13px] flex items-center gap-2 hover:border-border-hover">
                  <FileDown size={14} className="text-[#22c55e]" />
                  Excel
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

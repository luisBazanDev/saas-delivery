import AppLayout, { defaultDeliveryItems } from '../layout/AppLayout'

export default function StoreDashboard() {
  return (
    <AppLayout brand="HX Delivery" navItems={defaultDeliveryItems}>
      <div className="mb-8">
        <h1 className="text-xl font-bold text-text-primary">Panel de Control Operativo</h1>
        <p className="text-sm text-text-muted mt-1">Análisis en tiempo real del trabajo y rendimiento de la tienda</p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-dark-card border border-dark-border rounded-xl p-5">
          <p className="text-[11px] text-text-muted uppercase tracking-wider font-medium">Órdenes Despachadas</p>
          <p className="text-3xl font-bold text-accent-green mt-2">54 Envíos</p>
          <p className="text-xs text-text-secondary mt-1.5">Últimas 24 horas</p>
        </div>
        <div className="bg-dark-card border border-dark-border rounded-xl p-5">
          <p className="text-[11px] text-text-muted uppercase tracking-wider font-medium">Pedidos en Cola</p>
          <p className="text-3xl font-bold text-accent-yellow mt-2">18</p>
          <p className="text-xs text-text-secondary mt-1.5">Pendientes de envío</p>
        </div>
        <div className="bg-dark-card border border-dark-border rounded-xl p-5">
          <p className="text-[11px] text-text-muted uppercase tracking-wider font-medium">Tiempo Prom. Despacho</p>
          <p className="text-3xl font-bold text-accent-blue mt-2">22.4 min</p>
          <p className="text-xs text-text-secondary mt-1.5">Promedio del día</p>
        </div>
        <div className="bg-dark-card border border-dark-border rounded-xl p-5">
          <p className="text-[11px] text-text-muted uppercase tracking-wider font-medium">Eficiencia de Ruta</p>
          <p className="text-3xl font-bold text-accent-green mt-2">98.1%</p>
          <p className="text-xs text-text-secondary mt-1.5">Esta semana</p>
        </div>
      </div>
    </AppLayout>
  )
}

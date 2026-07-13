import { Request, Response } from 'express'
import { Order } from '../models/order.model'
import { OrderProduct } from '../models/order-product.model'
import { Product } from '../models/product.model'
import { User } from '../models/user.model'
import { Store } from '../models/store.model'
import { Op, fn, col, literal } from 'sequelize'

function getDateRange(period: string): { start: Date; end: Date } {
  const end = new Date()
  const start = new Date()

  switch (period) {
    case 'week':
      start.setDate(start.getDate() - 7)
      break
    case 'month':
      start.setMonth(start.getMonth() - 1)
      break
    case 'quarter':
      start.setMonth(start.getMonth() - 3)
      break
    case 'all':
      start.setFullYear(2000)
      break
    default:
      start.setDate(start.getDate() - 7)
  }

  return { start, end }
}

export async function getReportSummary(req: Request, res: Response) {
  const storeId = Number(req.params.id)
  if (!storeId) return res.status(400).json({ error: 'store_id is required' })

  const period = String(req.query.period || 'week')
  const { start, end } = getDateRange(period)

  const store = await Store.findByPk(storeId)
  if (!store) return res.status(404).json({ error: 'Store not found' })

  const [totalOrders, totalIncome, ordersByStatus, topProducts, deliveryStats] = await Promise.all([
    Order.count({
      where: { store_id: storeId, created_at: { [Op.gte]: start, [Op.lte]: end } },
    }),

    Order.findAll({
      where: {
        store_id: storeId,
        status: { [Op.in]: ['DELIVERED', 'DONE'] },
        created_at: { [Op.gte]: start, [Op.lte]: end },
      },
      attributes: [[fn('SUM', col('total_amount')), 'total_income']],
      raw: true,
    }),

    Order.findAll({
      where: { store_id: storeId, created_at: { [Op.gte]: start, [Op.lte]: end } },
      attributes: ['status', [fn('COUNT', col('id')), 'count']],
      group: ['status'],
      raw: true,
    }),

    OrderProduct.findAll({
      include: [
        {
          model: Order,
          where: { store_id: storeId, created_at: { [Op.gte]: start, [Op.lte]: end } },
          attributes: [],
        },
        { model: Product, attributes: ['name'] },
      ],
      attributes: [
        [col('product.name'), 'product_name'],
        [fn('SUM', col('order_items.quantity')), 'total_sold'],
        [fn('SUM', literal('order_items.quantity * order_items.subtotal')), 'total_revenue'],
      ],
      group: ['product_id', 'product.name'],
      order: [[literal('total_sold'), 'DESC']],
      limit: 10,
      raw: true,
    }),

    User.findAll({
      where: { store_id: storeId, role_name: 'STORE_DELIVERY' },
      include: [
        {
          model: Order,
          as: 'deliveryOrders',
          where: { created_at: { [Op.gte]: start, [Op.lte]: end } },
          attributes: [],
        },
      ],
      attributes: [
        'id',
        'name',
        [fn('COUNT', col('deliveryOrders.id')), 'deliveries_count'],
      ],
      group: ['users.id', 'users.name'],
      order: [[literal('deliveries_count'), 'DESC']],
      raw: true,
    }),
  ])

  const incomeRow = (totalIncome as any)[0] as { total_income: string | null } | undefined
  const statusRows = (ordersByStatus as any) as Array<{ status: string; count: string }>
  const productRows = (topProducts as any) as Array<{ product_name: string; total_sold: string; total_revenue: string }>
  const deliveryRows = (deliveryStats as any) as Array<{ id: number; username: string; deliveries_count: string }>

  const statusBreakdown = statusRows.reduce((acc, s) => {
    acc[s.status] = Number(s.count)
    return acc
  }, {} as Record<string, number>)

  const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)))
  const income = Number(incomeRow?.total_income || 0)
  const dailyAverage = totalOrders > 0 ? income / days : 0

  return res.json({
    store: { id: store.id, name: store.name },
    period,
    date_range: { start, end },
    summary: {
      total_orders: totalOrders,
      total_income: income,
      daily_average: Math.round(dailyAverage * 100) / 100,
      status_breakdown: statusBreakdown,
      top_products: productRows.map((p) => ({
        name: p.product_name,
        total_sold: Number(p.total_sold),
        total_revenue: Number(p.total_revenue),
      })),
      delivery_stats: deliveryRows.map((d) => ({
        id: d.id,
        username: d.username,
        deliveries: Number(d.deliveries_count),
      })),
    },
  })
}

export async function exportMovements(req: Request, res: Response) {
  const storeId = Number(req.params.id)
  if (!storeId) return res.status(400).json({ error: 'store_id is required' })

  const period = String(req.query.period || 'week')
  const format = String(req.query.format || 'csv')
  const { start, end } = getDateRange(period)

  const orders = await Order.findAll({
    where: {
      store_id: storeId,
      created_at: { [Op.gte]: start, [Op.lte]: end },
    },
    include: [
      {
        model: OrderProduct,
        include: [{ model: Product, attributes: ['name'] }],
      },
      { model: User, as: 'deliveryUser', attributes: ['name'] },
    ],
    order: [['created_at', 'DESC']],
  })

  const rows: Record<string, any>[] = orders.flatMap((order) => {
    const products = (order as any).OrderProducts || []
    const deliveryName = (order as any).deliveryUser?.name || 'N/A'

    if (products.length === 0) {
      return [{
        order_id: order.id,
        status: order.status,
        customer: order.customer_name,
        total: order.total_amount,
        delivery_user: deliveryName,
        product: 'N/A',
        amount: 0,
        price: order.total_amount || 0,
        created_at: order.created_at,
      }]
    }
    return products.map((op: any) => ({
      order_id: order.id,
      status: order.status,
      customer: order.customer_name,
      total: order.total_amount,
      delivery_user: deliveryName,
      product: op.Product?.name || 'N/A',
      quantity: op.quantity,
      subtotal: op.subtotal || 0,
      created_at: order.created_at,
    }))
  })

  switch (format) {
    case 'csv':
      return exportCSV(res, rows)
    case 'html':
      return exportHTML(res, rows, storeId, period)
    default:
      return exportCSV(res, rows)
  }
}

function exportCSV(res: Response, rows: Record<string, any>[]) {
  if (rows.length === 0) {
    return res.status(404).json({ error: 'No data found for the selected period' })
  }

  const headers = Object.keys(rows[0])
  const csvRows = [
    headers.join(','),
    ...rows.map((row) =>
      headers.map((h) => {
        const val = row[h]
        const str = val instanceof Date ? val.toISOString() : String(val ?? '')
        return `"${str.replace(/"/g, '""')}"`
      }).join(',')
    ),
  ]

  res.setHeader('Content-Type', 'text/csv')
  res.setHeader('Content-Disposition', 'attachment; filename=movements.csv')
  return res.send(csvRows.join('\n'))
}

function exportHTML(res: Response, rows: Record<string, any>[], storeId: number, period: string) {
  const headers = Object.keys(rows[0])
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>HX Delivery - Movement Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    h1 { color: #333; }
    table { border-collapse: collapse; width: 100%; margin-top: 20px; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #4CAF50; color: white; }
    tr:nth-child(even) { background-color: #f2f2f2; }
  </style>
</head>
<body>
  <h1>HX Delivery - Movement Report</h1>
  <p>Store ID: ${storeId} | Period: ${period}</p>
  <p>Generated: ${new Date().toISOString()}</p>
  <table>
    <thead><tr>${headers.map((h) => `<th>${h}</th>`).join('')}</tr></thead>
    <tbody>
      ${rows.map((row) => `<tr>${headers.map((h) => `<td>${row[h] instanceof Date ? row[h].toISOString() : row[h] ?? ''}</td>`).join('')}</tr>`).join('')}
    </tbody>
  </table>
</body>
</html>`

  res.setHeader('Content-Type', 'text/html')
  res.setHeader('Content-Disposition', 'attachment; filename=movements.html')
  return res.send(html)
}

export async function exportBusinessReport(req: Request, res: Response) {
  const storeId = Number(req.params.id)
  if (!storeId) return res.status(400).json({ error: 'store_id is required' })

  const period = String(req.query.period || 'week')
  const { start, end } = getDateRange(period)

  const store = await Store.findByPk(storeId)
  if (!store) return res.status(404).json({ error: 'Store not found' })

  const [totalOrders, totalIncome, ordersByStatus, topProducts, deliveryStats] = await Promise.all([
    Order.count({
      where: { store_id: storeId, created_at: { [Op.gte]: start, [Op.lte]: end } },
    }),

    Order.findAll({
      where: {
        store_id: storeId,
        status: { [Op.in]: ['DELIVERED', 'DONE'] },
        created_at: { [Op.gte]: start, [Op.lte]: end },
      },
      attributes: [[fn('SUM', col('total_amount')), 'total_income']],
      raw: true,
    }),

    Order.findAll({
      where: { store_id: storeId, created_at: { [Op.gte]: start, [Op.lte]: end } },
      attributes: ['status', [fn('COUNT', col('id')), 'count']],
      group: ['status'],
      raw: true,
    }),

    OrderProduct.findAll({
      include: [
        {
          model: Order,
          where: { store_id: storeId, created_at: { [Op.gte]: start, [Op.lte]: end } },
          attributes: [],
        },
        { model: Product, attributes: ['name'] },
      ],
      attributes: [
        [col('product.name'), 'product_name'],
        [fn('SUM', col('order_items.quantity')), 'total_sold'],
        [fn('SUM', literal('order_items.quantity * order_items.subtotal')), 'total_revenue'],
      ],
      group: ['product_id', 'product.name'],
      order: [[literal('total_sold'), 'DESC']],
      limit: 10,
      raw: true,
    }),

    User.findAll({
      where: { store_id: storeId, role_name: 'STORE_DELIVERY' },
      include: [
        {
          model: Order,
          as: 'deliveryOrders',
          where: { created_at: { [Op.gte]: start, [Op.lte]: end } },
          attributes: [],
        },
      ],
      attributes: [
        'id',
        'name',
        [fn('COUNT', col('deliveryOrders.id')), 'deliveries_count'],
      ],
      group: ['users.id', 'users.name'],
      order: [[literal('deliveries_count'), 'DESC']],
      raw: true,
    }),
  ])

  const incomeRow = (totalIncome as any)[0] as { total_income: string | null } | undefined
  const statusRows = (ordersByStatus as any) as Array<{ status: string; count: string }>
  const productRows = (topProducts as any) as Array<{ product_name: string; total_sold: string; total_revenue: string }>
  const deliveryRows = (deliveryStats as any) as Array<{ id: number; username: string; deliveries_count: string }>

  const income = Number(incomeRow?.total_income || 0)
  const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)))
  const dailyAverage = totalOrders > 0 ? income / days : 0

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>HX Delivery - Business Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
    h1 { color: #2c3e50; border-bottom: 3px solid #4CAF50; padding-bottom: 10px; }
    h2 { color: #34495e; margin-top: 30px; }
    .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
    .card { background: #f8f9fa; border-radius: 8px; padding: 20px; text-align: center; border-left: 4px solid #4CAF50; }
    .card h3 { margin: 0; font-size: 2em; color: #4CAF50; }
    .card p { margin: 5px 0 0; color: #666; }
    table { border-collapse: collapse; width: 100%; margin-top: 15px; }
    th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
    th { background-color: #4CAF50; color: white; }
    tr:nth-child(even) { background-color: #f2f2f2; }
    .footer { margin-top: 40px; text-align: center; color: #999; font-size: 0.9em; }
  </style>
</head>
<body>
  <h1>HX Delivery - Business Report</h1>
  <p><strong>Store:</strong> ${store.name}</p>
  <p><strong>Period:</strong> ${period} (${start.toLocaleDateString()} - ${end.toLocaleDateString()})</p>
  <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>

  <h2>Summary</h2>
  <div class="summary">
    <div class="card"><h3>${totalOrders}</h3><p>Total Orders</p></div>
    <div class="card"><h3>$${income.toFixed(2)}</h3><p>Total Income</p></div>
    <div class="card"><h3>$${dailyAverage.toFixed(2)}</h3><p>Daily Average</p></div>
    <div class="card"><h3>${deliveryRows.length}</h3><p>Active Drivers</p></div>
  </div>

  <h2>Orders by Status</h2>
  <table>
    <thead><tr><th>Status</th><th>Count</th></tr></thead>
    <tbody>
      ${statusRows.map((s) => `<tr><td>${s.status}</td><td>${s.count}</td></tr>`).join('')}
    </tbody>
  </table>

  <h2>Top Products</h2>
  <table>
    <thead><tr><th>Product</th><th>Units Sold</th><th>Revenue</th></tr></thead>
    <tbody>
      ${productRows.map((p) => `<tr><td>${p.product_name}</td><td>${p.total_sold}</td><td>$${Number(p.total_revenue).toFixed(2)}</td></tr>`).join('')}
    </tbody>
  </table>

  <h2>Delivery Performance</h2>
  <table>
    <thead><tr><th>Driver</th><th>Deliveries</th></tr></thead>
    <tbody>
      ${deliveryRows.map((d) => `<tr><td>${d.username}</td><td>${d.deliveries_count}</td></tr>`).join('')}
    </tbody>
  </table>

  <div class="footer">
    <p>HX Delivery &copy; ${new Date().getFullYear()} | Report generated automatically</p>
  </div>
</body>
</html>`

  res.setHeader('Content-Type', 'text/html')
  res.setHeader('Content-Disposition', 'attachment; filename=business-report.html')
  return res.send(html)
}

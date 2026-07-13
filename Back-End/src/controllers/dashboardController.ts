import { Request, Response } from 'express'
import { Order } from '../models/order.model'
import { User } from '../models/user.model'
import { Op, fn, col } from 'sequelize'

export async function getDashboard(req: Request, res: Response) {
  const storeId = Number(req.params.id)
  if (!storeId) return res.status(400).json({ error: 'store_id is required' })

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const [ordersInKitchen, activeDelivery, todayIncome, orderStats] = await Promise.all([
    Order.count({
      where: {
        store_id: storeId,
        status: { [Op.in]: ['PENDING', 'IN_PROGRESS', 'DONE'] },
      },
    }),

    User.count({
      where: {
        store_id: storeId,
        role_name: 'STORE_DELIVERY',
      },
    }),

    Order.findAll({
      where: {
        store_id: storeId,
        status: { [Op.in]: ['DELIVERED', 'DONE'] },
        created_at: { [Op.gte]: today, [Op.lt]: tomorrow },
      },
      attributes: [[fn('SUM', col('total_amount')), 'total_income']],
      raw: true,
    }),

    Order.findAll({
      where: { store_id: storeId },
      attributes: [
        'status',
        [fn('COUNT', col('id')), 'count'],
      ],
      group: ['status'],
      raw: true,
    }),
  ])

  const incomeRow = (todayIncome as any)[0] as { total_income: string | null } | undefined
  const statsRows = (orderStats as any) as Array<{ status: string; count: string }>

  const totalOrders = statsRows.reduce((sum, s) => sum + Number(s.count), 0)
  const statusBreakdown = statsRows.reduce((acc, s) => {
    acc[s.status] = Number(s.count)
    return acc
  }, {} as Record<string, number>)

  const income = Number(incomeRow?.total_income || 0)

  const activeDeliveries = await Order.findAll({
    where: {
      store_id: storeId,
      status: { [Op.in]: ['IN_TRANSIT', 'DELIVERED'] },
    },
    include: [
      { model: User, as: 'deliveryUser', attributes: ['id', 'name'] },
    ],
    order: [['created_at', 'DESC']],
    limit: 20,
  })

  const filteredDeliveries = activeDeliveries.filter((o) => o.delivery_user_id != null)

  return res.json({
    store_id: storeId,
    summary: {
      orders_in_kitchen: ordersInKitchen,
      active_delivery_count: activeDelivery,
      today_income: income,
      total_orders: totalOrders,
      status_breakdown: statusBreakdown,
    },
    active_deliveries: filteredDeliveries,
  })
}

export type UserRole = 'ADMIN' | 'STORE_ADMIN' | 'STORE_MANAGER' | 'STORE_DELIVERY'

export type OrderStatus = 'PENDING' | 'IN_PROGRESS' | 'DONE' | 'IN_TRANSIT' | 'DELIVERED'

export interface Store {
  id: number
  name: string
  address?: string
  phone?: string
  email?: string
  logo_url?: string
  lat?: number
  lon?: number
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export interface User {
  id: number
  username: string
  email?: string
  phone?: string
  role: UserRole
  store_id?: number
  is_active: boolean
  created_at?: string
  updated_at?: string
  Store?: Store
}

export interface OrderProduct {
  id: number
  order_code: string
  product_id: number
  amount: number
  price: number
  Product?: {
    id: number
    name: string
    price: number
  }
}

export interface Order {
  code: string
  store_id: number
  status: OrderStatus
  customer_name?: string
  customer_phone?: string
  address?: string
  total?: number
  payment_id?: number
  delivery_user_id?: number
  lat?: number
  lon?: number
  start_time?: string
  end_time?: string
  created_at?: string
  updated_at?: string
  OrderProducts?: OrderProduct[]
  deliveryUser?: {
    id: number
    username: string
    phone?: string
  }
}

export interface AuthResponse {
  bearerToken: string
  store_id?: number
}

export interface DecodedToken {
  sub: number
  username: string
  role: UserRole
  store_id?: number
  exp: number
}

export interface DashboardResponse {
  store_id: number
  summary: {
    orders_in_kitchen: number
    active_delivery_count: number
    today_income: number
    total_orders: number
    status_breakdown: Record<string, number>
  }
  active_deliveries: Order[]
}

export interface KanbanResponse {
  orders: Order[]
  kanban: {
    PENDING: Order[]
    IN_PROGRESS: Order[]
    DONE: Order[]
    IN_TRANSIT: Order[]
    DELIVERED: Order[]
  }
}

export interface KitchenResponse {
  orders: Order[]
}

export interface DeliveryResponse {
  orders: Order[]
}

export interface ActiveDeliveriesResponse {
  deliveries: Order[]
}

export interface ReportSummary {
  store: { id: number; name: string }
  period: string
  date_range: { start: string; end: string }
  summary: {
    total_orders: number
    total_income: number
    daily_average: number
    status_breakdown: Record<string, number>
    top_products: Array<{ name: string; total_sold: number; total_revenue: number }>
    delivery_stats: Array<{ id: number; username: string; deliveries: number }>
  }
}

export interface UserListResponse {
  users: User[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

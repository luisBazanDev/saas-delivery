export type UserRole = 'ADMIN' | 'STORE_ADMIN' | 'STORE_MANAGER' | 'STORE_DELIVERY' | 'STORE_CHEF'

export type OrderStatus = 'PENDING' | 'IN_PROGRESS' | 'IN_TRANSIT' | 'DELIVERED'

export interface Subscription {
  id: number
  plan_name: string
  max_users: number
  is_active: boolean
  expires_at: string
  created_at?: string
}

export interface Store {
  id: number
  name: string
  ruc?: string
  subscription_id?: number
  address?: string
  phone?: string
  email?: string
  logo_url?: string
  lat?: number
  lon?: number
  is_active: boolean
  created_at?: string
  updated_at?: string
  Subscription?: Subscription
}

export interface User {
  id: number
  name: string
  email?: string
  role_name: UserRole
  store_id?: number
  lat?: number
  lon?: number
  created_at?: string
  Store?: Store
}

export interface Product {
  id: number
  store_id: number
  name: string
  price: number
  is_available: boolean
  is_archived: boolean
  description?: string
  stock?: number
}

export interface OrderProduct {
  id: number
  order_id: number
  product_id: number
  quantity: number
  subtotal: number
  Product?: {
    id: number
    name: string
    price: number
  }
}

export interface Order {
  id: number
  code?: string
  store_id: number
  status: OrderStatus
  customer_name?: string
  phone?: string
  delivery_address?: string
  delivery_lat?: number
  delivery_lon?: number
  total_amount?: number
  delivery_user_id?: number
  created_at?: string
  OrderProducts?: OrderProduct[]
  deliveryUser?: {
    id: number
    name: string
  }
  isMine?: boolean
  isAvailable?: boolean
}

export interface AuthResponse {
  bearerToken: string
  store_id?: number
}

export interface DecodedToken {
  sub: number
  name: string
  role_name: UserRole
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
    delivery_stats: Array<{ id: number; name: string; deliveries: number }>
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

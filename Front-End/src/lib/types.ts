export type UserRole = 'ADMIN' | 'STORE_ADMIN' | 'STORE_MANAGER' | 'STORE_DELIVERY'

export type OrderStatus = 'ORDERED' | 'ACCEPTED' | 'IN_KITCHEN' | 'IN_TRANSIT' | 'FAILED' | 'RECEIVED'

export interface User {
  id: number
  username: string
  role: UserRole
  store_id?: number
}

export interface Store {
  id: number
  name: string
  address: string
}

export interface Category {
  id: number
  name: string
  store_id: number
}

export interface Product {
  id: number
  name: string
  description: string
  store_id: number
  category_id: number
}

export interface Order {
  code: string
  store_id: number
  status: OrderStatus
  start_time: Date
  end_time: Date | null
}

export interface AuthResponse {
  id?: number
  username?: string
  role?: UserRole
  store_id?: number
  token?: string
  bearerToken?: string
}

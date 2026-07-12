import { Request, Response } from 'express'
import { User } from '../models/user.model'
import { Store } from '../models/store.model'
import argon2 from 'argon2'

const ROLE_LEVEL: Record<string, number> = {
  ADMIN: 100,
  STORE_ADMIN: 50,
  STORE_MANAGER: 30,
  STORE_CHEF: 20,
  STORE_DELIVERY: 10,
}

function getVisibleRoles(userRole: string): string[] {
  const level = ROLE_LEVEL[userRole] ?? 0
  return Object.entries(ROLE_LEVEL)
    .filter(([, v]) => v <= level)
    .map(([k]) => k)
}

export async function listUsers(req: Request, res: Response) {
  const authUser = (req as any).user
  const authRole = authUser?.role
  const authStoreId = authUser?.store_id

  const page = Math.max(1, Number(req.query.page) || 1)
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20))
  const offset = (page - 1) * limit

  const storeId = req.query.store_id ? Number(req.query.store_id) : undefined
  const role = req.query.role ? String(req.query.role) : undefined

  const where: any = {}

  if (authRole !== 'ADMIN') {
    const visibleRoles = getVisibleRoles(authRole)
    where.role = visibleRoles
  }

  if (authStoreId && authRole !== 'ADMIN') {
    where.store_id = authStoreId
  } else if (storeId) {
    where.store_id = storeId
  }

  if (role) where.role = role

  const { count, rows } = await User.findAndCountAll({
    where,
    limit,
    offset,
    order: [['created_at', 'DESC']],
    attributes: { exclude: ['password'] },
    include: [{ model: Store, attributes: ['id', 'name'] }],
  })

  return res.json({
    users: rows,
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
    },
  })
}

export async function getUser(req: Request, res: Response) {
  const authUser = (req as any).user
  const authRole = authUser?.role
  const authStoreId = authUser?.store_id

  const id = Number(req.params.id)
  const user = await User.findByPk(id, {
    attributes: { exclude: ['password'] },
    include: [{ model: Store, attributes: ['id', 'name'] }],
  })
  if (!user) return res.status(404).json({ error: 'User not found' })

  if (authRole !== 'ADMIN') {
    const visibleRoles = getVisibleRoles(authRole)
    if (!visibleRoles.includes(user.role)) {
      return res.status(403).json({ error: 'Access denied' })
    }
    if (authStoreId && user.store_id !== authStoreId) {
      return res.status(403).json({ error: 'Access denied' })
    }
  }

  return res.json(user)
}

export async function createUser(req: Request, res: Response) {
  const authUser = (req as any).user
  const authRole = authUser?.role
  const authStoreId = authUser?.store_id

  const { username, password, email, phone, role, store_id } = req.body
  if (!username || !password || !role) {
    return res.status(400).json({ error: 'username, password, and role are required' })
  }

  const validRoles = ['STORE_ADMIN', 'STORE_MANAGER', 'STORE_DELIVERY', 'STORE_CHEF']
  if (!validRoles.includes(role)) {
    return res.status(400).json({ error: `Invalid role. Must be one of: ${validRoles.join(', ')}` })
  }

  if (authRole !== 'ADMIN') {
    const visibleRoles = getVisibleRoles(authRole)
    if (!visibleRoles.includes(role)) {
      return res.status(403).json({ error: 'Cannot create user with higher role' })
    }
  }

  const finalStoreId = (authRole !== 'ADMIN' && authStoreId) ? authStoreId : store_id

  const existing = await User.findOne({ where: { username } })
  if (existing) return res.status(409).json({ error: 'Username already exists' })

  const hash = await argon2.hash(password)
  const user = await User.create({
    username,
    password: hash,
    email,
    phone,
    role: role as any,
    store_id: finalStoreId,
    is_active: true,
  })

  const { password: _, ...userData } = user.toJSON()
  return res.status(201).json(userData)
}

export async function updateUser(req: Request, res: Response) {
  const authUser = (req as any).user
  const authRole = authUser?.role
  const authStoreId = authUser?.store_id

  const id = Number(req.params.id)
  const user = await User.findByPk(id)
  if (!user) return res.status(404).json({ error: 'User not found' })

  if (authRole !== 'ADMIN') {
    const visibleRoles = getVisibleRoles(authRole)
    if (!visibleRoles.includes(user.role)) {
      return res.status(403).json({ error: 'Cannot edit user with higher role' })
    }
    if (authStoreId && user.store_id !== authStoreId) {
      return res.status(403).json({ error: 'Cannot edit user from different store' })
    }
  }

  const { password, ...updateData } = req.body

  if (updateData.role && authRole !== 'ADMIN') {
    const visibleRoles = getVisibleRoles(authRole)
    if (!visibleRoles.includes(updateData.role)) {
      return res.status(403).json({ error: 'Cannot assign higher role' })
    }
  }

  if (password) {
    updateData.password = await argon2.hash(password)
  }

  await user.update(updateData)
  const { password: _, ...userData } = user.toJSON()
  return res.json(userData)
}

export async function deleteUser(req: Request, res: Response) {
  const authUser = (req as any).user
  const authRole = authUser?.role
  const authStoreId = authUser?.store_id

  const id = Number(req.params.id)
  const user = await User.findByPk(id)
  if (!user) return res.status(404).json({ error: 'User not found' })

  if (authRole !== 'ADMIN') {
    const visibleRoles = getVisibleRoles(authRole)
    if (!visibleRoles.includes(user.role)) {
      return res.status(403).json({ error: 'Cannot delete user with higher role' })
    }
    if (authStoreId && user.store_id !== authStoreId) {
      return res.status(403).json({ error: 'Cannot delete user from different store' })
    }
  }

  await user.destroy()
  return res.status(204).send()
}

export async function toggleUserStatus(req: Request, res: Response) {
  const authUser = (req as any).user
  const authRole = authUser?.role
  const authStoreId = authUser?.store_id

  const id = Number(req.params.id)
  const user = await User.findByPk(id)
  if (!user) return res.status(404).json({ error: 'User not found' })

  if (authRole !== 'ADMIN') {
    const visibleRoles = getVisibleRoles(authRole)
    if (!visibleRoles.includes(user.role)) {
      return res.status(403).json({ error: 'Cannot toggle user with higher role' })
    }
    if (authStoreId && user.store_id !== authStoreId) {
      return res.status(403).json({ error: 'Cannot toggle user from different store' })
    }
  }

  await user.update({ is_active: !user.is_active })
  const { password: _, ...userData } = user.toJSON()
  return res.json(userData)
}

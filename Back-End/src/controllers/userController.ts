import { Request, Response } from 'express'
import { User } from '../models/user.model'
import { Store } from '../models/store.model'
import argon2 from 'argon2'

export async function listUsers(req: Request, res: Response) {
  const page = Math.max(1, Number(req.query.page) || 1)
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20))
  const offset = (page - 1) * limit

  const storeId = req.query.store_id ? Number(req.query.store_id) : undefined
  const role = req.query.role ? String(req.query.role) : undefined

  const where: any = {}
  if (storeId) where.store_id = storeId
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
  const id = Number(req.params.id)
  const user = await User.findByPk(id, {
    attributes: { exclude: ['password'] },
    include: [{ model: Store, attributes: ['id', 'name'] }],
  })
  if (!user) return res.status(404).json({ error: 'User not found' })
  return res.json(user)
}

export async function createUser(req: Request, res: Response) {
  const { username, password, email, phone, role, store_id } = req.body
  if (!username || !password || !role) {
    return res.status(400).json({ error: 'username, password, and role are required' })
  }

  const validRoles = ['STORE_ADMIN', 'STORE_MANAGER', 'STORE_DELIVERY', 'STORE_CHEF']
  if (!validRoles.includes(role)) {
    return res.status(400).json({ error: `Invalid role. Must be one of: ${validRoles.join(', ')}` })
  }

  const existing = await User.findOne({ where: { username } })
  if (existing) return res.status(409).json({ error: 'Username already exists' })

  const hash = await argon2.hash(password)
  const user = await User.create({
    username,
    password: hash,
    email,
    phone,
    role: role as any,
    store_id,
    is_active: true,
  })

  const { password: _, ...userData } = user.toJSON()
  return res.status(201).json(userData)
}

export async function updateUser(req: Request, res: Response) {
  const id = Number(req.params.id)
  const user = await User.findByPk(id)
  if (!user) return res.status(404).json({ error: 'User not found' })

  const { password, ...updateData } = req.body
  if (password) {
    updateData.password = await argon2.hash(password)
  }

  await user.update(updateData)
  const { password: _, ...userData } = user.toJSON()
  return res.json(userData)
}

export async function deleteUser(req: Request, res: Response) {
  const id = Number(req.params.id)
  const user = await User.findByPk(id)
  if (!user) return res.status(404).json({ error: 'User not found' })

  await user.destroy()
  return res.status(204).send()
}

export async function toggleUserStatus(req: Request, res: Response) {
  const id = Number(req.params.id)
  const user = await User.findByPk(id)
  if (!user) return res.status(404).json({ error: 'User not found' })

  await user.update({ is_active: !user.is_active })
  const { password: _, ...userData } = user.toJSON()
  return res.json(userData)
}

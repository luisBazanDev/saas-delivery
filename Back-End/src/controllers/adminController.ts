import { Request, Response } from 'express'
import { User } from '../models/user.model'
import { Store } from '../models/store.model'
import argon2 from 'argon2'
import jwt from 'jsonwebtoken'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const privateKey = fs.readFileSync(path.join(__dirname, '../../private/private.pem'), 'utf-8')

const JWT_SECRET = fs.readFileSync(path.join(__dirname, '../../private/public.pem'), 'utf-8')

function signToken(payload: object) {
  if (privateKey) return jwt.sign(payload, privateKey, { algorithm: 'RS256', expiresIn: '1h' })
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' })
}

export async function createUserAsStoreAdmin(req: Request, res: Response) {
  const { user, password, role } = req.body as { user: string; password: string; role: string }
  if (!user || !password || !role) return res.status(400).json({ error: 'user, password, role required' })

  if (role !== 'STORE_MANAGER' && role !== 'STORE_DELIVERY') return res.status(400).json({ error: 'invalid role' })

  const requester = (req as any).user
  if (!requester || requester.role !== 'STORE_ADMIN') return res.status(403).json({ error: 'forbidden' })

  const storeId = requester.store_id
  if (!storeId) return res.status(400).json({ error: 'store_id missing from requester' })

  const existing = await User.findOne({ where: { username: user } })
  if (existing) return res.status(409).json({ error: 'user exists' })

  const hash = await argon2.hash(password)
  const created = await User.create({ username: user, password: hash, role: role as any, store_id: storeId })

  res.status(201).json({ id: created.id, username: created.username, role: created.role, store_id: created.store_id })
}

export async function createStoreAsAdmin(req: Request, res: Response) {
  const { name, address, first_user } = req.body as any
  if (!name || !address || !first_user || !first_user.username || !first_user.password) {
    return res.status(400).json({ error: 'name, address and first_user{username,password} required' })
  }

  const requester = (req as any).user
  if (!requester || requester.role !== 'ADMIN') return res.status(403).json({ error: 'forbidden' })

  const store = await Store.create({ name, address })

  const existing = await User.findOne({ where: { username: first_user.username } })
  if (existing) return res.status(409).json({ error: 'first_user.username exists' })

  const hash = await argon2.hash(first_user.password)
  const createdUser = await User.create({ username: first_user.username, password: hash, role: 'STORE_ADMIN' as any, store_id: (store as any).id })

  const token = signToken({ sub: createdUser.id, username: createdUser.username, role: createdUser.role, store_id: createdUser.store_id })

  res.status(201).json({ store: { id: (store as any).id, name: store.name, address: store.address }, admin: { id: createdUser.id, username: createdUser.username, role: createdUser.role }, token })
}

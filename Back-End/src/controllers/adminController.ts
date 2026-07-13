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
  const { name, password, role_name } = req.body as { name: string; password: string; role_name: string }
  if (!name || !password || !role_name) return res.status(400).json({ error: 'name, password, role_name required' })

  if (role_name !== 'STORE_MANAGER' && role_name !== 'STORE_DELIVERY') return res.status(400).json({ error: 'invalid role' })

  const requester = (req as any).user
  if (!requester || requester.role_name !== 'STORE_ADMIN') return res.status(403).json({ error: 'forbidden' })

  const storeId = requester.store_id
  if (!storeId) return res.status(400).json({ error: 'store_id missing from requester' })

  const existing = await User.findOne({ where: { name } })
  if (existing) return res.status(409).json({ error: 'user exists' })

  const hash = await argon2.hash(password)
  const created = await User.create({ name, password_hash: hash, role_name: role_name as any, store_id: storeId })

  return res.status(201).json({ id: created.id, name: created.name, role_name: created.role_name, store_id: created.store_id })
}

export async function selectStoreAsAdmin(req: Request, res: Response) {
  const { store_id } = req.body as { store_id: number }
  if (!store_id) return res.status(400).json({ error: 'store_id required' })

  const requester = (req as any).user
  if (!requester || requester.role_name !== 'ADMIN') return res.status(403).json({ error: 'forbidden' })

  const store = await Store.findByPk(store_id)
  if (!store) return res.status(404).json({ error: 'store not found' })

  const user = await User.findByPk(requester.id)
  if (!user) return res.status(404).json({ error: 'user not found' })

  await user.update({ store_id })

  const token = signToken({ sub: user.id, name: user.name, role_name: user.role_name, store_id: user.store_id })

  return res.status(200).json({ token, store_id: user.store_id })
}

export async function createStoreAsAdmin(req: Request, res: Response) {
  const { name, address, first_user } = req.body as any
  if (!name || !address || !first_user || !first_user.name || !first_user.password) {
    return res.status(400).json({ error: 'name, address and first_user{name,password} required' })
  }

  const requester = (req as any).user
  if (!requester || requester.role_name !== 'ADMIN') return res.status(403).json({ error: 'forbidden' })

  const store = await Store.create({ name, address })

  const existing = await User.findOne({ where: { name: first_user.name } })
  if (existing) return res.status(409).json({ error: 'first_user.name exists' })

  const hash = await argon2.hash(first_user.password)
  const createdUser = await User.create({ name: first_user.name, password_hash: hash, role_name: 'STORE_ADMIN' as any, store_id: (store as any).id })

  const token = signToken({ sub: createdUser.id, name: createdUser.name, role_name: createdUser.role_name, store_id: createdUser.store_id })

  return res.status(201).json({ store: { id: (store as any).id, name: store.name, address: store.address }, admin: { id: createdUser.id, name: createdUser.name, role_name: createdUser.role_name }, token })
}

import { Request, Response } from 'express'
import { User } from '../models/user.model'
import argon2 from 'argon2'
import jwt from 'jsonwebtoken'
import fs from 'fs'

const privateKey = fs.readFileSync('../private/private.key', 'utf-8')

export async function register(req: Request, res: Response) {
  const { username, password } = req.body as { username: string; password: string }
  if (!username || !password) 
    return res.status(400).json({ error: 'username and password required' })

  const existing = await User.findOne({ where: { username } })
  if (existing) 
    return res.status(409).json({ error: 'user exists' })

  const hash = await argon2.hash(password)

  const user = await User.create({ username, password: hash, role: 'STORE_MANAGER' as any })
  const token = jwt.sign({ sub: user.id, username: user.username }, privateKey, { algorithm: 'RS256', expiresIn: '1h' })

  res.status(201).json({ id: user.id, username: user.username, token })
}

export async function login(req: Request, res: Response) {
  const { username, password } = req.body as { username: string; password: string }
  if (!username || !password) 
    return res.status(400).json({ error: 'username and password required' })

  const user = await User.findOne({ where: { username } })
  if (!user) 
    return res.status(401).json({ error: 'invalid credentials' })

  const ok = await argon2.verify(user.password, password)
  if (!ok)
    return res.status(401).json({ error: 'invalid credentials' })

  const token = jwt.sign({ sub: user.id, username: user.username }, privateKey, { algorithm: 'RS256', expiresIn: '1h' })
  res.json({ bearerToken: token })
}

import { Request, Response } from 'express'
import { User } from '../models/user.model'
import argon2 from 'argon2'
import jwt from 'jsonwebtoken'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const privateKey = fs.readFileSync(path.join(__dirname, '../../private/private.pem'), 'utf-8')

export async function login(req: Request, res: Response) {
  const { name, password } = req.body as { name: string; password: string }
  if (!name || !password) 
    return res.status(400).json({ error: 'name and password required' })

  const user = await User.findOne({ where: { name } })
  if (!user) 
    return res.status(401).json({ error: 'invalid credentials' })

  const ok = await argon2.verify(user.password_hash, password)
  if (!ok)
    return res.status(401).json({ error: 'invalid credentials' })

  const token = jwt.sign({ sub: user.id, name: user.name, role_name: user.role_name, store_id: user.store_id }, privateKey, { algorithm: 'RS256', expiresIn: '1h' })
  
  return res.status(200).json({ bearerToken: token, store_id: user.store_id })
}
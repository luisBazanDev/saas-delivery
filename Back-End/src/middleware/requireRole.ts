import { Request, Response, NextFunction } from 'express'

export function requireRole(role: string) {
  return function (req: Request, res: Response, next: NextFunction) {
    const user = (req as any).user
    if (!user) return res.status(401).json({ error: 'missing token' })
    if (user.role_name !== role) return res.status(403).json({ error: 'forbidden' })
    next()
  }
}

export function requireAnyRole(roles: string[]) {
  return function (req: Request, res: Response, next: NextFunction) {
    const user = (req as any).user
    console.log('[ROLE] requireAnyRole called with roles:', roles)
    console.log('[ROLE] user:', JSON.stringify(user))
    if (!user) return res.status(401).json({ error: 'missing token' })
    if (!roles.includes(user.role_name)) return res.status(403).json({ error: 'forbidden' })
    console.log('[ROLE] Role check passed')
    next()
  }
}

export function requireStoreAccess(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user
  if (!user) return res.status(401).json({ error: 'missing token' })
  if (user.role_name === 'ADMIN') return next()
  const storeId = Number(req.params.id || req.params.storeId)
  if (user.store_id && user.store_id === storeId) return next()
  return res.status(403).json({ error: 'forbidden' })
}

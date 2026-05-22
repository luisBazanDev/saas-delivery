import { Request, Response, NextFunction } from 'express'

export function requireRole(role: string) {
  return function (req: Request, res: Response, next: NextFunction) {
    const user = (req as any).user
    if (!user) return res.status(401).json({ error: 'missing token' })
    if (user.role !== role) return res.status(403).json({ error: 'forbidden' })
    next()
  }
}

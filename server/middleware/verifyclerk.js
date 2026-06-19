import { clerkMiddleware, getAuth } from '@clerk/express'

export const clerkAuth = clerkMiddleware()

export const protect = (req, res, next) => {
  const { userId } = getAuth(req)

  if (!userId) {
    return res.status(401).json({ success: false, message: 'Unauthorized' })
  }

  req.auth = { userId }
  next()
}
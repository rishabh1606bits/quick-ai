import { getOrCreateUser } from '../db/queries.js'
import { clerkClient } from '@clerk/express'

export const checkCredits = async (req, res, next) => {
  try {
    const { userId } = req.auth

    const clerkUser = await clerkClient.users.getUser(userId)
    const email = clerkUser.emailAddresses[0]?.emailAddress || 'unknown@example.com'
    const fullName = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim()

    const user = await getOrCreateUser(userId, email, fullName)

    if (user.plan === 'free' && user.free_usage >= 5) {
      return res.status(403).json({
        success: false,
        message: 'Free usage limit reached. Please upgrade to continue.',
      })
    }

    req.dbUser = user
    next()
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: 'Server error checking credits' })
  }
}
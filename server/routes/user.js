import express from 'express'
import dotenv from 'dotenv'
dotenv.config()
import { protect } from '../middleware/verifyclerk.js'
import { query } from '../db/queries.js'

const router = express.Router()

router.get('/dashboard', protect, async (req, res) => {
  try {
    const { userId } = req.auth

    const userResult = await query(
      'SELECT * FROM users WHERE clerk_id = $1',
      [userId]
    )
    const user = userResult.rows[0]

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    const creationsResult = await query(
      'SELECT id, prompt, type, created_at FROM creations WHERE user_id = $1 ORDER BY created_at DESC LIMIT 8',
      [userId]
    )

    res.json({
      success: true,
      user: {
        plan: user.plan,
        free_usage: user.free_usage,
        email: user.email,
        full_name: user.full_name,
      },
      creations: creationsResult.rows,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, message: error.message })
  }
})

export default router
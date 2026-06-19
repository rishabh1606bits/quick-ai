import { Pool } from 'pg'
import dotenv from 'dotenv'
dotenv.config()

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

export const query = (text, params) => pool.query(text, params)

export const getOrCreateUser = async (clerkId, email, fullName) => {
  const existing = await query('SELECT * FROM users WHERE clerk_id = $1', [clerkId])
  if (existing.rows.length > 0) return existing.rows[0]

  const created = await query(
    'INSERT INTO users (clerk_id, email, full_name) VALUES ($1, $2, $3) RETURNING *',
    [clerkId, email, fullName]
  )
  return created.rows[0]
}

export const incrementFreeUsage = async (clerkId) => {
  await query('UPDATE users SET free_usage = free_usage + 1 WHERE clerk_id = $1', [clerkId])
}

export const saveCreation = async (userId, prompt, content, type) => {
  await query(
    'INSERT INTO creations (user_id, prompt, content, type) VALUES ($1, $2, $3, $4)',
    [userId, prompt, content, type]
  )
}
export const updateUserStripeInfo = async (clerkId, customerId, subscriptionId, plan) => {
  await query(
    'UPDATE users SET stripe_customer_id = $1, stripe_subscription_id = $2, plan = $3 WHERE clerk_id = $4',
    [customerId, subscriptionId, plan, clerkId]
  )
}

export const getUserByStripeCustomerId = async (customerId) => {
  const result = await query('SELECT * FROM users WHERE stripe_customer_id = $1', [customerId])
  return result.rows[0]
}


export const updateUserSubscription = async (clerkId, subscriptionId, plan) => {
  await query(
    'UPDATE users SET stripe_subscription_id = $1, plan = $2 WHERE clerk_id = $3',
    [subscriptionId, plan, clerkId]
  )
}

export const downgradeUserPlan = async (subscriptionId) => {
  await query(
    "UPDATE users SET plan = 'free', stripe_subscription_id = NULL WHERE stripe_subscription_id = $1",
    [subscriptionId]
  )
}

export const getUserByClerkId = async (clerkId) => {
  const result = await query('SELECT * FROM users WHERE clerk_id = $1', [clerkId])
  return result.rows[0]
}
import express from 'express'
import Razorpay from 'razorpay'
import crypto from 'crypto'
import { protect } from '../middleware/verifyclerk.js'
import { updateUserSubscription, downgradeUserPlan, getUserByClerkId } from '../db/queries.js'
import dotenv from 'dotenv'

dotenv.config()

const router = express.Router()

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
})

// Create a subscription, return it to frontend to open Razorpay Checkout
router.post('/create-subscription', protect, async (req, res) => {
  try {
    const { userId } = req.auth
    const user = await getUserByClerkId(userId)

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }
 console.log('PLAN ID:', process.env.RAZORPAY_PLAN_ID_PRO)
    const subscription = await razorpay.subscriptions.create({
      plan_id: process.env.RAZORPAY_PLAN_ID_PRO,
      customer_notify: 1,
      total_count: 12, // bill monthly for 12 cycles, renews automatically after
      notes: { clerk_id: userId },
    })

    res.json({
      success: true,
      subscriptionId: subscription.id,
      keyId: process.env.RAZORPAY_KEY_ID,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, message: error.message })
  }
})

// Verify payment signature after checkout completes on frontend
router.post('/verify-subscription', protect, async (req, res) => {
  try {
    const { userId } = req.auth
    const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature } = req.body

    const body = `${razorpay_payment_id}|${razorpay_subscription_id}`
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex')

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature' })
    }

    await updateUserSubscription(userId, razorpay_subscription_id, 'premium')

    res.json({ success: true, message: 'Subscription activated' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, message: error.message })
  }
})

// Webhook for subscription cancellations / failed renewals
router.post('/webhook', express.json(), async (req, res) => {
  try {
    const webhookSignature = req.headers['x-razorpay-signature']
    const body = JSON.stringify(req.body)

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(body)
      .digest('hex')

    if (webhookSignature !== expectedSignature) {
      return res.status(400).json({ success: false, message: 'Invalid webhook signature' })
    }

    const event = req.body.event

    if (event === 'subscription.cancelled' || event === 'subscription.halted') {
      const subscriptionId = req.body.payload.subscription.entity.id
      await downgradeUserPlan(subscriptionId)
    }

    res.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    res.status(500).json({ error: 'Webhook handler failed' })
  }
})

export default router
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { clerkAuth } from './middleware/verifyclerk.js'
import aiRouter from './routes/ai.js'
import billingRouter from './routes/billing.js'
import userRouter from './routes/user.js'




dotenv.config()

const app = express()

app.use('/api/user', userRouter)

app.use(cors())

// IMPORTANT: webhook route needs raw body, must be registered BEFORE express.json()
app.use('/api/billing/webhook', express.raw({ type: 'application/json' }))

app.use(express.json())
app.use(clerkAuth)

app.get('/', (req, res) => res.send('Quick.ai backend running'))
app.use('/api/ai', aiRouter)
app.use('/api/billing', billingRouter)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
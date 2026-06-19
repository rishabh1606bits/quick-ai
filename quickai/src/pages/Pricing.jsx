import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth, useUser } from '@clerk/clerk-react'
import axios from 'axios'
import toast from 'react-hot-toast'
import Navbar from '../components/Navbar'

const Pricing = () => {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { getToken } = useAuth()
  const { user } = useUser()

  const handleSubscribe = async () => {
    try {
      setLoading(true)
      const token = await getToken()

      const { data } = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/billing/create-subscription`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (!data.success) {
        toast.error(data.message)
        return
      }

      const options = {
        key: data.keyId,
        subscription_id: data.subscriptionId,
        name: 'Quick.ai',
        description: 'Premium Monthly Subscription',
        prefill: {
          name: user?.fullName || '',
          email: user?.primaryEmailAddress?.emailAddress || '',
        },
        theme: { color: '#7c3aed' },
        handler: async (response) => {
          try {
            const verifyToken = await getToken()
            const verify = await axios.post(
              `${import.meta.env.VITE_BACKEND_URL}/api/billing/verify-subscription`,
              {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_subscription_id: response.razorpay_subscription_id,
                razorpay_signature: response.razorpay_signature,
              },
              { headers: { Authorization: `Bearer ${verifyToken}` } }
            )

            if (verify.data.success) {
              toast.success('Subscription activated! Welcome to Premium 🎉')
              navigate('/dashboard')
            } else {
              toast.error('Payment verification failed')
            }
          } catch (err) {
            toast.error('Verification error: ' + err.message)
          }
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    } finally {
      setLoading(false)
    }
  }

  const features = {
    free: [
      '5 AI generations total',
      'Article Generator',
      'Blog Title Generator',
      'Image Generator',
      'Background Remover',
      'Resume Analyzer',
    ],
    premium: [
      'Unlimited AI generations',
      'Article Generator',
      'Blog Title Generator',
      'Image Generator',
      'Background Remover',
      'Resume Analyzer',
      'Priority processing',
      'Early access to new features',
    ],
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-28 pb-20 px-4">
        <h1 className="text-3xl font-semibold text-center text-gray-800 mb-2">
          Simple, transparent pricing
        </h1>
        <p className="text-center text-gray-500 mb-12">
          Start free, upgrade when you need more
        </p>

        <div className="flex flex-wrap justify-center gap-8 max-w-4xl mx-auto">

          {/* Free Plan */}
          <div className="bg-white rounded-2xl border border-gray-200 p-8 w-80">
            <h2 className="text-lg font-semibold text-gray-800">Free</h2>
            <p className="text-4xl font-bold text-gray-800 mt-4">
              ₹0 <span className="text-base font-normal text-gray-400">/month</span>
            </p>
            <p className="text-sm text-gray-500 mt-2">Perfect for trying out Quick.ai</p>

            <ul className="mt-6 space-y-3">
              {features.free.map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="text-green-500">✓</span> {f}
                </li>
              ))}
            </ul>

            <button
              onClick={() => navigate('/dashboard')}
              className="w-full mt-8 border border-gray-300 text-gray-700 py-2.5 rounded-lg hover:bg-gray-50 transition text-sm"
            >
              Get started free
            </button>
          </div>

          {/* Premium Plan */}
          <div className="bg-purple-600 rounded-2xl p-8 w-80 text-white relative overflow-hidden">
            <div className="absolute top-4 right-4 bg-white text-purple-600 text-xs font-semibold px-3 py-1 rounded-full">
              Most Popular
            </div>

            <h2 className="text-lg font-semibold">Premium</h2>
            <p className="text-4xl font-bold mt-4">
              ₹499 <span className="text-base font-normal opacity-70">/month</span>
            </p>
            <p className="text-sm opacity-70 mt-2">For creators and professionals</p>

            <ul className="mt-6 space-y-3">
              {features.premium.map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <span className="text-white">✓</span> {f}
                </li>
              ))}
            </ul>

            <button
              onClick={handleSubscribe}
              disabled={loading}
              className="w-full mt-8 bg-white text-purple-600 font-semibold py-2.5 rounded-lg hover:bg-gray-100 transition text-sm disabled:opacity-60"
            >
              {loading ? 'Processing...' : 'Upgrade to Premium'}
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}

export default Pricing
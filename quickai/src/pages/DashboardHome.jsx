import { useEffect, useState } from 'react'
import { useAuth, useUser } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
  FileText, Hash, Image as ImageIcon,
  Eraser, FileSearch, Crown, Zap
} from 'lucide-react'

const featureIcons = {
  article: FileText,
  'blog-title': Hash,
  image: ImageIcon,
  'bg-remove': Eraser,
  'resume-review': FileSearch,
}

const featureLabels = {
  article: 'Article',
  'blog-title': 'Blog Title',
  image: 'Image',
  'bg-remove': 'Background Removal',
  'resume-review': 'Resume Review',
}

const DashboardHome = () => {
  const { getToken } = useAuth()
  const { user } = useUser()
  const navigate = useNavigate()

  const [userData, setUserData] = useState(null)
  const [creations, setCreations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await getToken()
        const { data } = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/user/dashboard`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        if (data.success) {
          setUserData(data.user)
          setCreations(data.creations)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="w-8 h-8 rounded-full border-2 border-purple-600 border-t-transparent animate-spin" />
      </div>
    )
  }

  const isPremium = userData?.plan === 'premium'
  const usageLeft = isPremium ? '∞' : Math.max(0, 5 - (userData?.free_usage || 0))

  return (
    <div className="p-6 space-y-6">

      {/* Welcome + Plan badge */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Welcome back, {user?.firstName || 'there'} 👋
          </h1>
          <p className="text-sm text-gray-500 mt-1">Here's your activity summary</p>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
          isPremium
            ? 'bg-purple-100 text-purple-700'
            : 'bg-gray-100 text-gray-600'
        }`}>
          {isPremium ? <Crown size={16} /> : <Zap size={16} />}
          {isPremium ? 'Premium Plan' : 'Free Plan'}
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Total Creations</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">{creations.length}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">
            {isPremium ? 'Generations' : 'Free Uses Left'}
          </p>
          <p className="text-3xl font-bold text-gray-800 mt-1">
            {isPremium ? '∞' : usageLeft}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Plan</p>
          <p className="text-3xl font-bold text-gray-800 mt-1 capitalize">
            {userData?.plan || 'Free'}
          </p>
        </div>
      </div>

      {/* Upgrade banner for free users */}
      {!isPremium && (
        <div className="bg-purple-600 rounded-xl p-5 flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-white font-medium">Upgrade to Premium</p>
            <p className="text-purple-200 text-sm mt-0.5">
              Get unlimited AI generations for ₹499/month
            </p>
          </div>
          <button
            onClick={() => navigate('/pricing')}
            className="bg-white text-purple-600 font-semibold px-5 py-2 rounded-lg text-sm hover:bg-gray-100 transition"
          >
            Upgrade Now
          </button>
        </div>
      )}

      {/* Recent Creations */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Creations</h2>

        {creations.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
            <p className="text-gray-400 text-sm">No creations yet — try one of the AI tools!</p>
            <button
              onClick={() => navigate('/dashboard/article')}
              className="mt-4 bg-purple-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-purple-700 transition"
            >
              Start creating
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {creations.slice(0, 8).map((c) => {
              const Icon = featureIcons[c.type] || FileText
              const isImage = c.type === 'image' || c.type === 'bg-remove'

              return (
                <div
                  key={c.id}
                  className="bg-white rounded-xl border border-gray-200 p-4 flex items-start gap-4"
                >
                  <div className="bg-purple-50 p-2 rounded-lg">
                    <Icon size={18} className="text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                        {featureLabels[c.type] || c.type}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(c.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mt-1 font-medium truncate">{c.prompt}</p>
                    {!isImage && (
                      <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{c.content}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default DashboardHome
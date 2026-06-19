import { useState } from 'react'
import { Edit } from 'lucide-react'
import axios from 'axios'
import { useAuth } from '@clerk/clerk-react'
import toast from 'react-hot-toast'

const Article = () => {
  const articleLengths = [
    { length: 800, text: 'Short (500-800 words)' },
    { length: 1200, text: 'Medium (800-1200 words)' },
    { length: 1600, text: 'Long (1200+ words)' },
  ]

  const [selectedLength, setSelectedLength] = useState(articleLengths[0])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState('')

  const { getToken } = useAuth()

  const onSubmitHandler = async (e) => {
    e.preventDefault()
    if (!input.trim()) return

    try {
      setLoading(true)
      const token = await getToken()

      const { data } = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/ai/generate-article`,
        { prompt: input, length: selectedLength.length },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (data.success) {
        setContent(data.content)
      } else {
        toast.error(data.message || 'Something went wrong')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-full overflow-y-auto p-6 flex flex-wrap gap-6 items-start">

      {/* Left form */}
      <form onSubmit={onSubmitHandler} className="w-full max-w-lg bg-white p-5 rounded-xl border border-gray-200">
        <div className="flex items-center gap-3">
          <Edit className="w-6 text-purple-600" />
          <h1 className="text-xl font-semibold">Article Generator</h1>
        </div>

        <p className="mt-6 text-sm font-medium">Article Title</p>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          type="text"
          className="w-full p-2.5 mt-2 outline-none text-sm rounded-md border border-gray-300 focus:border-purple-400"
          placeholder="The future of AI in healthcare..."
          required
        />

        <p className="mt-4 text-sm font-medium">Article Length</p>
        <div className="mt-3 flex gap-3 flex-wrap">
          {articleLengths.map((item, index) => (
            <span
              key={index}
              onClick={() => setSelectedLength(item)}
              className={`text-xs px-4 py-1 border rounded-full cursor-pointer transition ${
                selectedLength.text === item.text
                  ? 'bg-purple-50 text-purple-700 border-purple-300'
                  : 'text-gray-500 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {item.text}
            </span>
          ))}
        </div>

        <button
          disabled={loading}
          type="submit"
          className="w-full flex justify-center items-center gap-2 bg-purple-600 text-white px-4 py-2.5 mt-6 text-sm rounded-lg hover:bg-purple-700 transition disabled:opacity-60"
        >
          {loading ? (
            <span className="w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin" />
          ) : (
            <Edit className="w-5" />
          )}
          Generate Article
        </button>
      </form>

      {/* Right output */}
      <div className="w-full max-w-lg bg-white rounded-xl border border-gray-200 p-5 flex flex-col min-h-96 max-h-[600px]">
        <div className="flex items-center gap-3">
          <Edit className="w-5 h-5 text-purple-600" />
          <h1 className="text-xl font-semibold">Generated Article</h1>
        </div>

        {!content ? (
          <div className="flex-1 flex justify-center items-center">
            <p className="text-sm text-gray-400 text-center">
              Enter a title and click "Generate Article" to get started
            </p>
          </div>
        ) : (
          <div className="mt-4 text-sm text-gray-700 overflow-y-auto whitespace-pre-wrap">
            {content}
          </div>
        )}
      </div>
    </div>
  )
}

export default Article
import { useState } from 'react'
import { Hash } from 'lucide-react'
import axios from 'axios'
import { useAuth } from '@clerk/clerk-react'
import toast from 'react-hot-toast'

const BlogTitles = () => {
  const categories = [
    'General', 'Technology', 'Business', 'Health', 'Lifestyle',
    'Travel', 'Food', 'Education', 'Finance', 'Sports',
  ]

  const [keyword, setKeyword] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(categories[0])
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState('')

  const { getToken } = useAuth()

  const onSubmitHandler = async (e) => {
    e.preventDefault()
    if (!keyword.trim()) return

    try {
      setLoading(true)
      const token = await getToken()

      const { data } = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/ai/generate-blog-titles`,
        { keyword, category: selectedCategory },
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

      <form onSubmit={onSubmitHandler} className="w-full max-w-lg bg-white p-5 rounded-xl border border-gray-200">
        <div className="flex items-center gap-3">
          <Hash className="w-6 text-purple-600" />
          <h1 className="text-xl font-semibold">Blog Title Generator</h1>
        </div>

        <p className="mt-6 text-sm font-medium">Keyword</p>
        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          type="text"
          className="w-full p-2.5 mt-2 outline-none text-sm rounded-md border border-gray-300 focus:border-purple-400"
          placeholder="The future of artificial intelligence..."
          required
        />

        <p className="mt-4 text-sm font-medium">Category</p>
        <div className="mt-3 flex gap-2 flex-wrap">
          {categories.map((cat, index) => (
            <span
              key={index}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs px-4 py-1 border rounded-full cursor-pointer transition ${
                selectedCategory === cat
                  ? 'bg-purple-50 text-purple-700 border-purple-300'
                  : 'text-gray-500 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {cat}
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
            <Hash className="w-5" />
          )}
          Generate Titles
        </button>
      </form>

      <div className="w-full max-w-lg bg-white rounded-xl border border-gray-200 p-5 flex flex-col min-h-96 max-h-[600px]">
        <div className="flex items-center gap-3">
          <Hash className="w-5 h-5 text-purple-600" />
          <h1 className="text-xl font-semibold">Generated Titles</h1>
        </div>

        {!content ? (
          <div className="flex-1 flex justify-center items-center">
            <p className="text-sm text-gray-400 text-center">
              Enter a keyword and click "Generate Titles" to get started
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

export default BlogTitles
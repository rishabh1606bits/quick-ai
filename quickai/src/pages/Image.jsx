import { useState } from 'react'
import { ImageIcon } from 'lucide-react'
import axios from 'axios'
import { useAuth } from '@clerk/clerk-react'
import toast from 'react-hot-toast'

const Image = () => {
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [imageUrl, setImageUrl] = useState('')

  const { getToken } = useAuth()

  const onSubmitHandler = async (e) => {
    e.preventDefault()
    if (!prompt.trim()) return

    try {
      setLoading(true)
      setImageUrl('')
      const token = await getToken()

      const { data } = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/ai/generate-image`,
        { prompt },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (data.success) {
        setImageUrl(data.content)
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
          <ImageIcon className="w-6 text-purple-600" />
          <h1 className="text-xl font-semibold">AI Image Generator</h1>
        </div>

        <p className="mt-6 text-sm font-medium">Describe your image</p>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={4}
          className="w-full p-2.5 mt-2 outline-none text-sm rounded-md border border-gray-300 focus:border-purple-400 resize-none"
          placeholder="A futuristic city with flying cars at sunset..."
          required
        />

        <button
          disabled={loading}
          type="submit"
          className="w-full flex justify-center items-center gap-2 bg-purple-600 text-white px-4 py-2.5 mt-6 text-sm rounded-lg hover:bg-purple-700 transition disabled:opacity-60"
        >
          {loading ? (
            <span className="w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin" />
          ) : (
            <ImageIcon className="w-5" />
          )}
          Generate Image
        </button>
      </form>

      <div className="w-full max-w-lg bg-white rounded-xl border border-gray-200 p-5 flex flex-col min-h-96 max-h-[600px]">
        <div className="flex items-center gap-3">
          <ImageIcon className="w-5 h-5 text-purple-600" />
          <h1 className="text-xl font-semibold">Generated Image</h1>
        </div>

        {!imageUrl && !loading ? (
          <div className="flex-1 flex justify-center items-center">
            <p className="text-sm text-gray-400 text-center">
              Describe an image and click "Generate Image" to get started
            </p>
          </div>
        ) : loading ? (
          <div className="flex-1 flex justify-center items-center">
            <span className="w-8 h-8 rounded-full border-2 border-purple-600 border-t-transparent animate-spin" />
          </div>
        ) : (
          <img src={imageUrl} alt="Generated" className="mt-4 rounded-lg w-full object-contain" />
        )}
      </div>
    </div>
  )
}

export default Image
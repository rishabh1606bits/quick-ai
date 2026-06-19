import { useState } from 'react'
import { Eraser } from 'lucide-react'
import axios from 'axios'
import { useAuth } from '@clerk/clerk-react'
import toast from 'react-hot-toast'

const RemoveBackground = () => {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState('')
  const [loading, setLoading] = useState(false)
  const [resultImage, setResultImage] = useState('')

  const { getToken } = useAuth()

  const handleFileChange = (e) => {
    const selected = e.target.files[0]
    if (selected) {
      setFile(selected)
      setPreview(URL.createObjectURL(selected))
      setResultImage('')
    }
  }

  const onSubmitHandler = async (e) => {
    e.preventDefault()
    if (!file) return

    try {
      setLoading(true)
      const token = await getToken()

      const formData = new FormData()
      formData.append('image', file)

      const { data } = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/ai/remove-background`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      )

      if (data.success) {
        setResultImage(data.content)
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
          <Eraser className="w-6 text-purple-600" />
          <h1 className="text-xl font-semibold">Background Remover</h1>
        </div>

        <p className="mt-6 text-sm font-medium">Upload an image</p>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="w-full mt-2 text-sm text-gray-500"
          required
        />

        {preview && (
          <img src={preview} alt="Preview" className="mt-4 rounded-lg max-h-48 object-contain" />
        )}

        <button
          disabled={loading || !file}
          type="submit"
          className="w-full flex justify-center items-center gap-2 bg-purple-600 text-white px-4 py-2.5 mt-6 text-sm rounded-lg hover:bg-purple-700 transition disabled:opacity-60"
        >
          {loading ? (
            <span className="w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin" />
          ) : (
            <Eraser className="w-5" />
          )}
          Remove Background
        </button>
      </form>

      <div className="w-full max-w-lg bg-white rounded-xl border border-gray-200 p-5 flex flex-col min-h-96 max-h-[600px]">
        <div className="flex items-center gap-3">
          <Eraser className="w-5 h-5 text-purple-600" />
          <h1 className="text-xl font-semibold">Result</h1>
        </div>

        {!resultImage && !loading ? (
          <div className="flex-1 flex justify-center items-center">
            <p className="text-sm text-gray-400 text-center">
              Upload an image and click "Remove Background" to get started
            </p>
          </div>
        ) : loading ? (
          <div className="flex-1 flex justify-center items-center">
            <span className="w-8 h-8 rounded-full border-2 border-purple-600 border-t-transparent animate-spin" />
          </div>
        ) : (
          <img
            src={resultImage}
            alt="Result"
            className="mt-4 rounded-lg w-full object-contain"
            style={{ background: 'repeating-conic-gradient(#ccc 0% 25%, white 0% 50%) 50% / 16px 16px' }}
          />
        )}
      </div>
    </div>
  )
}

export default RemoveBackground
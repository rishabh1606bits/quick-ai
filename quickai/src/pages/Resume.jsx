import { useState } from 'react'
import { FileSearch } from 'lucide-react'
import axios from 'axios'
import { useAuth } from '@clerk/clerk-react'
import toast from 'react-hot-toast'

const Resume = () => {
  const [file, setFile] = useState(null)
  const [fileName, setFileName] = useState('')
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState('')

  const { getToken } = useAuth()

  const handleFileChange = (e) => {
    const selected = e.target.files[0]
    if (selected) {
      setFile(selected)
      setFileName(selected.name)
      setContent('')
    }
  }

  const onSubmitHandler = async (e) => {
    e.preventDefault()
    if (!file) return

    try {
      setLoading(true)
      const token = await getToken()

      const formData = new FormData()
      formData.append('resume', file)

      const { data } = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/ai/resume-review`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
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
          <FileSearch className="w-6 text-purple-600" />
          <h1 className="text-xl font-semibold">Resume Analyzer</h1>
        </div>

        <p className="mt-6 text-sm font-medium">Upload your resume (PDF only)</p>
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          className="w-full mt-2 text-sm text-gray-500"
          required
        />
        {fileName && <p className="mt-2 text-xs text-gray-500">Selected: {fileName}</p>}

        <button
          disabled={loading || !file}
          type="submit"
          className="w-full flex justify-center items-center gap-2 bg-purple-600 text-white px-4 py-2.5 mt-6 text-sm rounded-lg hover:bg-purple-700 transition disabled:opacity-60"
        >
          {loading ? (
            <span className="w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin" />
          ) : (
            <FileSearch className="w-5" />
          )}
          Analyze Resume
        </button>
      </form>

      <div className="w-full max-w-lg bg-white rounded-xl border border-gray-200 p-5 flex flex-col min-h-96 max-h-[600px]">
        <div className="flex items-center gap-3">
          <FileSearch className="w-5 h-5 text-purple-600" />
          <h1 className="text-xl font-semibold">Analysis</h1>
        </div>

        {!content ? (
          <div className="flex-1 flex justify-center items-center">
            <p className="text-sm text-gray-400 text-center">
              Upload a resume and click "Analyze Resume" to get started
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

export default Resume
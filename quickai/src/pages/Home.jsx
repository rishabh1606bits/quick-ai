import Navbar from '../components/Navbar'
import { useNavigate } from 'react-router-dom'

const Home = () => {
  const navigate = useNavigate()

  const features = [
    { title: 'Article writer', desc: 'Generate full articles from a title' },
    { title: 'Blog titles', desc: 'Catchy titles by keyword' },
    { title: 'Image generator', desc: 'Images from text prompts' },
    { title: 'Background remover', desc: 'Transparent backgrounds instantly' },
    { title: 'Object remover', desc: 'Remove unwanted objects' },
    { title: 'Resume analyzer', desc: 'Full AI feedback on resumes' },
  ]

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="px-4 sm:px-20 xl:px-32 pt-32 text-center">
        <h1 className="text-3xl sm:text-5xl font-semibold text-gray-800 max-w-2xl mx-auto leading-tight">
          Create amazing content with AI tools
        </h1>
        <p className="mt-4 text-gray-500 max-w-xl mx-auto">
          Articles, images, and more — generate, enhance, and analyze content in seconds.
        </p>
        <div className="flex gap-4 justify-center mt-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-purple-600 text-white px-8 py-3 rounded-full hover:bg-purple-700 transition"
          >
            Start creating now
          </button>
          <button className="border border-gray-300 px-8 py-3 rounded-full hover:bg-gray-50 transition">
            Watch demo
          </button>
        </div>
      </div>

      <div className="px-4 sm:px-20 xl:px-32 mt-24 mb-24">
        <h2 className="text-center text-2xl font-semibold text-gray-800 mb-10">
          Everything you need to create with AI
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div
              key={i}
              className="p-6 border border-gray-200 rounded-xl hover:shadow-md transition"
            >
              <h3 className="font-medium text-gray-800 mb-1">{f.title}</h3>
              <p className="text-sm text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Home
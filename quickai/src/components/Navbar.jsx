import { useNavigate } from 'react-router-dom'
import { useClerk, UserButton, SignedIn, SignedOut } from '@clerk/clerk-react'

const Navbar = () => {
  const navigate = useNavigate()
  const { openSignIn } = useClerk()

  return (
    <div className="fixed z-50 w-full backdrop-blur-2xl flex justify-between items-center py-3 px-4 sm:px-20 xl:px-32">
      <h1
        onClick={() => navigate('/')}
        className="cursor-pointer text-2xl font-semibold text-purple-600"
      >
        Quick.ai
      </h1>

      <div className="flex items-center gap-6">
        <span
          onClick={() => navigate('/pricing')}
          className="text-sm text-gray-600 cursor-pointer hover:text-purple-600 transition"
        >
          Pricing
        </span>

        <SignedOut>
          <button
            onClick={openSignIn}
            className="flex items-center gap-2 rounded-full text-sm cursor-pointer bg-purple-600 text-white px-6 py-2.5 hover:bg-purple-700 transition"
          >
            Get started
          </button>
        </SignedOut>

        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
    </div>
  )
}

export default Navbar
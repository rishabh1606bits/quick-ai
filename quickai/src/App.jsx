import { Routes, Route } from 'react-router-dom'
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react'
import { Toaster } from 'react-hot-toast'

import Home from './pages/Home'
import Pricing from './pages/Pricing'
import Dashboard from './pages/Dashboard'
import DashboardHome from './pages/DashboardHome'
import Article from './pages/Article'
import BlogTitles from './pages/BlogTitles'
import Image from './pages/Image'
import RemoveBackground from './pages/RemoveBackground'

import Resume from './pages/Resume'

const App = () => {
  return (
    <div>
      <Toaster position="top-center" />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/pricing" element={<Pricing />} />

        <Route
          path="/dashboard"
          element={
            <>
              <SignedIn>
                <Dashboard />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          }
        >
          <Route index element={<DashboardHome />} />
          <Route path="article" element={<Article />} />
          <Route path="blog-titles" element={<BlogTitles />} />
          <Route path="image" element={<Image />} />
          <Route path="remove-background" element={<RemoveBackground />} />

          <Route path="resume" element={<Resume />} />
        </Route>
      </Routes>
    </div>
  )
}

export default App
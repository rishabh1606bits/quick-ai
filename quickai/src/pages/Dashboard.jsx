import { Outlet } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'

const Dashboard = () => {
  const { user } = useUser()

  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <div className="flex flex-1 pt-16">
        <Sidebar user={user} />
        <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default Dashboard
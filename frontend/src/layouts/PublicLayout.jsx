// src/layouts/PublicLayout.jsx
import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { Briefcase, User, LogOut, LayoutDashboard } from 'lucide-react'
import { authApi } from '../lib/api'
import toast from 'react-hot-toast'

export default function PublicLayout() {
  const { user, isAuthenticated, clearAuth } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await authApi.logout()
    } finally {
      clearAuth()
      navigate('/')
      toast.success('Logged out')
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="page-container">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 font-semibold text-lg text-gray-900">
              <div className="bg-brand-600 text-white p-1.5 rounded-lg">
                <Briefcase size={18} />
              </div>
              JobPortal
            </Link>

            {/* Nav links */}
            <div className="hidden md:flex items-center gap-6">
              <Link to="/jobs" className="text-sm text-gray-600 hover:text-gray-900 transition">Browse Jobs</Link>
            </div>

            {/* Auth buttons */}
            <div className="flex items-center gap-3">
              {isAuthenticated() ? (
                <>
                  <Link to="/dashboard" className="btn-secondary text-sm">
                    <LayoutDashboard size={15} />
                    Dashboard
                  </Link>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-sm font-medium">
                      {user?.name?.[0]?.toUpperCase()}
                    </div>
                    <button onClick={handleLogout} className="btn-ghost p-2">
                      <LogOut size={16} />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link to="/login"    className="btn-secondary text-sm">Sign in</Link>
                  <Link to="/register" className="btn-primary text-sm">Post a Job</Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Page content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="page-container">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 text-white font-medium">
              <Briefcase size={18} />
              JobPortal
            </div>
            <p className="text-sm">© 2024 JobPortal. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

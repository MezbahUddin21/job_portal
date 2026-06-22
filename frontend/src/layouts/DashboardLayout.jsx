// src/layouts/DashboardLayout.jsx
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { authApi } from '../lib/api'
import toast from 'react-hot-toast'
import {
  Briefcase, LayoutDashboard, User, FileText, Heart,
  PlusCircle, Users, Settings, LogOut, Shield, ChevronRight
} from 'lucide-react'
import { cn } from '../lib/utils'

const NavItem = ({ to, icon: Icon, label, end = false }) => {
  const { pathname } = useLocation()
  const active = end ? pathname === to : pathname.startsWith(to)
  return (
    <Link to={to} className={cn(
      'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
      active
        ? 'bg-brand-50 text-brand-700'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    )}>
      <Icon size={17} />
      {label}
    </Link>
  )
}

export default function DashboardLayout() {
  const { user, clearAuth } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try { await authApi.logout() } finally {
      clearAuth()
      navigate('/login')
      toast.success('Logged out')
    }
  }

  const role = user?.role

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full z-30">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 px-5 h-16 border-b border-gray-200 font-semibold text-gray-900">
          <div className="bg-brand-600 text-white p-1.5 rounded-lg">
            <Briefcase size={16} />
          </div>
          JobPortal
        </Link>

        {/* User info */}
        <div className="px-4 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-medium text-sm shrink-0">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <NavItem to="/dashboard" icon={LayoutDashboard} label="Overview" end />
          <NavItem to="/dashboard/profile" icon={User} label="Profile" />

          {role === 'candidate' && (
            <>
              <div className="pt-3 pb-1 px-3">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Jobs</p>
              </div>
              <NavItem to="/jobs" icon={Briefcase} label="Browse Jobs" />
              <NavItem to="/dashboard/applications" icon={FileText} label="My Applications" />
              <NavItem to="/dashboard/saved-jobs" icon={Heart} label="Saved Jobs" />
            </>
          )}

          {role === 'employer' && (
            <>
              <div className="pt-3 pb-1 px-3">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Jobs</p>
              </div>
              <NavItem to="/dashboard/jobs" icon={Briefcase} label="My Jobs" />
              <NavItem to="/dashboard/jobs/new" icon={PlusCircle} label="Post New Job" />
            </>
          )}

          {role === 'admin' && (
            <>
              <div className="pt-3 pb-1 px-3">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Admin</p>
              </div>
              <NavItem to="/dashboard/admin" icon={Shield} label="Dashboard" end />
              <NavItem to="/dashboard/admin/users" icon={Users} label="Users" />
              <NavItem to="/dashboard/admin/jobs" icon={Briefcase} label="All Jobs" />
            </>
          )}
        </nav>

        {/* Bottom logout */}
        <div className="px-3 py-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut size={17} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 ml-64">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6 sticky top-0 z-20">
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Link to="/dashboard" className="hover:text-gray-900">Dashboard</Link>
            <ChevronRight size={14} />
          </div>
        </header>

        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

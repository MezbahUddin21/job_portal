// src/pages/admin/AdminDashboard.jsx
import { useQuery } from '@tanstack/react-query'
import { adminApi } from '../../lib/api'
import { Link } from 'react-router-dom'
import { Users, Briefcase, FileText, TrendingUp, UserCheck, Building2 } from 'lucide-react'

const StatCard = ({ icon: Icon, label, value, color, to }) => (
  <Link to={to || '#'} className="card p-5 hover:border-brand-300 transition block">
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${color}`}>
      <Icon size={20} />
    </div>
    <p className="text-2xl font-bold text-gray-900">{value ?? '–'}</p>
    <p className="text-sm text-gray-500 mt-0.5">{label}</p>
  </Link>
)

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminApi.stats().then(r => r.data),
  })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">Platform overview and management</p>
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard icon={Users}      label="Total Users"       value={stats?.total_users}        color="bg-blue-50 text-blue-600"   to="/dashboard/admin/users" />
        <StatCard icon={Building2}  label="Employers"         value={stats?.total_employers}     color="bg-purple-50 text-purple-600" to="/dashboard/admin/users" />
        <StatCard icon={UserCheck}  label="Candidates"        value={stats?.total_candidates}    color="bg-teal-50 text-teal-600"   to="/dashboard/admin/users" />
        <StatCard icon={Briefcase}  label="Total Jobs"        value={stats?.total_jobs}          color="bg-green-50 text-green-600" to="/dashboard/admin/jobs" />
        <StatCard icon={TrendingUp} label="Published Jobs"    value={stats?.published_jobs}      color="bg-emerald-50 text-emerald-600" to="/dashboard/admin/jobs" />
        <StatCard icon={FileText}   label="Total Applications" value={stats?.total_applications} color="bg-orange-50 text-orange-600" />
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-base font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-4">
          <Link to="/dashboard/admin/users" className="card p-5 hover:border-brand-300 hover:shadow-sm transition flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
              <Users size={22} />
            </div>
            <div>
              <p className="font-semibold text-gray-900">User Management</p>
              <p className="text-sm text-gray-500">Activate or deactivate accounts</p>
            </div>
          </Link>
          <Link to="/dashboard/admin/jobs" className="card p-5 hover:border-brand-300 hover:shadow-sm transition flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600 shrink-0">
              <Briefcase size={22} />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Job Moderation</p>
              <p className="text-sm text-gray-500">Review and manage all listings</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Hired stats */}
      {stats?.hired_count > 0 && (
        <div className="card p-6 bg-gradient-to-r from-brand-50 to-indigo-50 border-brand-200">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-brand-600 flex items-center justify-center text-white">
              <UserCheck size={26} />
            </div>
            <div>
              <p className="text-3xl font-bold text-brand-700">{stats.hired_count}</p>
              <p className="text-gray-600">Candidates successfully hired through the platform</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

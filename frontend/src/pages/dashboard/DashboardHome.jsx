// src/pages/dashboard/DashboardHome.jsx
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '../../store/authStore'
import { adminApi, applicationApi, jobApi } from '../../lib/api'
import { Link } from 'react-router-dom'
import { Briefcase, FileText, Heart, Users, TrendingUp, PlusCircle, Search, Shield } from 'lucide-react'
import { APPLICATION_STATUS_COLORS, timeAgo } from '../../lib/utils'

const StatCard = ({ icon: Icon, label, value, color = 'blue', to }) => (
  <Link to={to || '#'} className="card p-5 hover:border-brand-300 hover:shadow-sm transition-all block">
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 bg-${color}-50 text-${color}-600`}>
      <Icon size={20} />
    </div>
    <p className="text-2xl font-bold text-gray-900">{value ?? '–'}</p>
    <p className="text-sm text-gray-500 mt-0.5">{label}</p>
  </Link>
)

// ── Candidate Dashboard ────────────────────────────────────────────────────────
const CandidateDashboard = () => {
  const { data: apps }  = useQuery({ queryKey: ['my-apps'],  queryFn: () => applicationApi.myApps().then(r => r.data) })
  const { data: saved } = useQuery({ queryKey: ['my-saved'], queryFn: () => applicationApi.savedJobs().then(r => r.data) })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
        <p className="text-gray-500 mt-1">Track your job search progress</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={FileText} label="Applications" value={apps?.total}    color="blue"   to="/dashboard/applications" />
        <StatCard icon={Heart}    label="Saved Jobs"   value={saved?.total}   color="red"    to="/dashboard/saved-jobs" />
        <StatCard icon={Briefcase}label="Browse Jobs"  value="10k+"           color="green"  to="/jobs" />
        <StatCard icon={TrendingUp}label="Profile Views" value="–"            color="purple" />
      </div>

      {apps?.data?.length > 0 && (
        <div className="card">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Recent Applications</h2>
            <Link to="/dashboard/applications" className="text-sm text-brand-600 hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {apps.data.slice(0, 5).map(app => (
              <div key={app.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{app.job?.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {app.job?.employer?.company_profile?.company_name} · {timeAgo(app.created_at)}
                  </p>
                </div>
                <span className={APPLICATION_STATUS_COLORS[app.status] || 'badge-gray'}>{app.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card p-8 text-center border-dashed">
        <Search size={32} className="text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 mb-4">Looking for new opportunities?</p>
        <Link to="/jobs" className="btn-primary">Browse All Jobs</Link>
      </div>
    </div>
  )
}

// ── Employer Dashboard ─────────────────────────────────────────────────────────
const EmployerDashboard = () => {
  const { data: jobs } = useQuery({
    queryKey: ['employer-jobs'],
    queryFn: () => jobApi.myJobs().then(r => r.data),
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employer Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage your job postings</p>
        </div>
        <Link to="/dashboard/jobs/new" className="btn-primary">
          <PlusCircle size={16} /> Post New Job
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard icon={Briefcase}  label="Total Jobs"        value={jobs?.total}                                color="blue"   to="/dashboard/jobs" />
        <StatCard icon={FileText}   label="Published Jobs"    value={jobs?.data?.filter(j => j.status === 'published').length} color="green"  to="/dashboard/jobs" />
        <StatCard icon={Users}      label="Total Applicants"  value={jobs?.data?.reduce((s, j) => s + (j.applications_count || 0), 0)} color="purple" />
      </div>

      {jobs?.data?.length > 0 && (
        <div className="card">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Your Job Listings</h2>
            <Link to="/dashboard/jobs" className="text-sm text-brand-600 hover:underline">Manage all</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {jobs.data.slice(0, 5).map(job => (
              <div key={job.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{job.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{job.applications_count || 0} applicants · {timeAgo(job.created_at)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`badge ${job.status === 'published' ? 'badge-green' : job.status === 'draft' ? 'badge-gray' : 'badge-yellow'}`}>
                    {job.status}
                  </span>
                  <Link to={`/dashboard/jobs/${job.id}/applicants`} className="text-xs text-brand-600 hover:underline">View apps</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Admin Dashboard ────────────────────────────────────────────────────────────
const AdminOverview = () => {
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminApi.stats().then(r => r.data),
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">System-wide overview</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users}     label="Total Users"      value={stats?.total_users}        color="blue"   to="/dashboard/admin/users" />
        <StatCard icon={Building2} label="Employers"        value={stats?.total_employers}     color="purple" to="/dashboard/admin/users" />
        <StatCard icon={Briefcase} label="Published Jobs"   value={stats?.published_jobs}      color="green"  to="/dashboard/admin/jobs" />
        <StatCard icon={FileText}  label="Applications"     value={stats?.total_applications}  color="yellow" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Link to="/dashboard/admin/users" className="card p-6 hover:border-brand-300 transition flex items-center gap-4">
          <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center text-brand-600">
            <Users size={22} />
          </div>
          <div>
            <p className="font-semibold text-gray-900">Manage Users</p>
            <p className="text-sm text-gray-500">Activate, deactivate accounts</p>
          </div>
        </Link>
        <Link to="/dashboard/admin/jobs" className="card p-6 hover:border-brand-300 transition flex items-center gap-4">
          <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
            <Briefcase size={22} />
          </div>
          <div>
            <p className="font-semibold text-gray-900">Manage Jobs</p>
            <p className="text-sm text-gray-500">Review and moderate listings</p>
          </div>
        </Link>
      </div>
    </div>
  )
}

// ── Main export ────────────────────────────────────────────────────────────────
const Building2 = ({ size, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
  </svg>
)

export default function DashboardHome() {
  const { user } = useAuthStore()
  if (user?.role === 'admin') return <AdminOverview />
  if (user?.role === 'employer') return <EmployerDashboard />
  return <CandidateDashboard />
}

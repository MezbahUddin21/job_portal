// src/pages/candidate/MyApplicationsPage.jsx
import { useQuery } from '@tanstack/react-query'
import { applicationApi } from '../../lib/api'
import { Link } from 'react-router-dom'
import { APPLICATION_STATUS_COLORS, formatSalary, timeAgo } from '../../lib/utils'
import { FileText, Building2, MapPin, DollarSign, ExternalLink, Inbox } from 'lucide-react'

const statusSteps = ['pending', 'reviewing', 'shortlisted', 'hired']

const StatusTracker = ({ status }) => {
  if (status === 'rejected') {
    return (
      <div className="flex items-center gap-2 mt-3">
        <span className="badge-red">Application Rejected</span>
      </div>
    )
  }
  const currentIdx = statusSteps.indexOf(status)
  return (
    <div className="flex items-center gap-1 mt-3">
      {statusSteps.map((step, i) => (
        <div key={step} className="flex items-center gap-1">
          <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium transition-all ${
            i < currentIdx  ? 'bg-green-100 text-green-700' :
            i === currentIdx ? 'bg-brand-100 text-brand-700 ring-2 ring-brand-300' :
            'bg-gray-100 text-gray-400'
          }`}>
            {i < currentIdx && '✓ '}
            <span className="capitalize">{step}</span>
          </div>
          {i < statusSteps.length - 1 && (
            <div className={`w-6 h-px ${i < currentIdx ? 'bg-green-300' : 'bg-gray-200'}`} />
          )}
        </div>
      ))}
    </div>
  )
}

export default function MyApplicationsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['my-applications'],
    queryFn: () => applicationApi.myApps().then(r => r.data),
  })

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
        <p className="text-gray-500 mt-1">{data?.total || 0} application{data?.total !== 1 ? 's' : ''} submitted</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-3" />
              <div className="h-3 bg-gray-200 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : data?.data?.length === 0 ? (
        <div className="card p-16 text-center">
          <Inbox size={40} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-4">You haven't applied to any jobs yet.</p>
          <Link to="/jobs" className="btn-primary">Browse Jobs</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {data.data.map(app => {
            const job = app.job
            const company = job?.employer?.company_profile
            return (
              <div key={app.id} className="card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center font-bold shrink-0">
                      {(company?.company_name || 'J')[0]}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{job?.title}</h3>
                      <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1.5">
                        <Building2 size={12} />
                        {company?.company_name || job?.employer?.name}
                        <span className="text-gray-300">·</span>
                        <MapPin size={12} />
                        {job?.location}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={APPLICATION_STATUS_COLORS[app.status] || 'badge-gray'}>
                      {app.status}
                    </span>
                    <Link to={`/jobs/${job?.slug}`} className="btn-ghost p-1.5">
                      <ExternalLink size={14} />
                    </Link>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                  {job?.salary_min && (
                    <span className="flex items-center gap-1">
                      <DollarSign size={13} />
                      {formatSalary(job.salary_min, job.salary_max, job.currency)}
                    </span>
                  )}
                  <span>Applied {timeAgo(app.created_at)}</span>
                </div>

                <StatusTracker status={app.status} />

                {app.cover_letter && (
                  <details className="mt-4">
                    <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600">View cover letter</summary>
                    <p className="mt-2 text-sm text-gray-600 bg-gray-50 rounded-lg p-3 whitespace-pre-wrap">{app.cover_letter}</p>
                  </details>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

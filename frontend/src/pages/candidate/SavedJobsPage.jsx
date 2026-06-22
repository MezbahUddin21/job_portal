// src/pages/candidate/SavedJobsPage.jsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { applicationApi } from '../../lib/api'
import { Link } from 'react-router-dom'
import { formatSalary, timeAgo, JOB_TYPE_COLORS } from '../../lib/utils'
import { Heart, MapPin, DollarSign, Trash2, Send, Building2, Bookmark } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SavedJobsPage() {
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['saved-jobs'],
    queryFn: () => applicationApi.savedJobs().then(r => r.data),
  })

  const unsaveMutation = useMutation({
    mutationFn: (jobId) => applicationApi.toggleSave(jobId),
    onSuccess: () => {
      toast.success('Job removed from saved')
      qc.invalidateQueries(['saved-jobs'])
    },
  })

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Saved Jobs</h1>
        <p className="text-gray-500 mt-1">{data?.total || 0} saved job{data?.total !== 1 ? 's' : ''}</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : data?.data?.length === 0 ? (
        <div className="card p-16 text-center">
          <Bookmark size={40} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-4">No saved jobs yet. Browse and save jobs you're interested in.</p>
          <Link to="/jobs" className="btn-primary">Browse Jobs</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {data.data.map(saved => {
            const job = saved.job
            const company = job?.employer?.company_profile
            return (
              <div key={saved.id} className="card p-5 flex items-start gap-4">
                <div className="w-11 h-11 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center font-bold shrink-0">
                  {(company?.company_name || 'J')[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{job?.title}</h3>
                      <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1">
                        <Building2 size={12} />
                        {company?.company_name}
                        <span className="text-gray-300 mx-1">·</span>
                        <MapPin size={12} />
                        {job?.location}
                      </p>
                    </div>
                    <button
                      onClick={() => unsaveMutation.mutate(job.id)}
                      disabled={unsaveMutation.isPending}
                      className="btn-ghost p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className={JOB_TYPE_COLORS[job?.type] || 'badge-gray'}>{job?.type}</span>
                    {job?.salary_min && (
                      <span className="badge-gray flex items-center gap-1">
                        <DollarSign size={11} />
                        {formatSalary(job.salary_min, job.salary_max, job.currency)}
                      </span>
                    )}
                    <span className="text-xs text-gray-400">Saved {timeAgo(saved.created_at)}</span>
                  </div>
                </div>

                <Link to={`/jobs/${job?.slug}`} className="btn-primary shrink-0 text-sm">
                  <Send size={14} /> Apply
                </Link>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// src/pages/employer/MyJobsPage.jsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { jobApi } from '../../lib/api'
import { Link } from 'react-router-dom'
import { timeAgo, JOB_TYPE_COLORS } from '../../lib/utils'
import toast from 'react-hot-toast'
import { PlusCircle, Edit2, Trash2, Users, Eye, Briefcase, MoreVertical } from 'lucide-react'
import { useState } from 'react'

const statusColors = {
  published: 'badge-green',
  draft:     'badge-gray',
  paused:    'badge-yellow',
  closed:    'badge-red',
}

export default function MyJobsPage() {
  const qc = useQueryClient()
  const [confirmDelete, setConfirmDelete] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['employer-jobs'],
    queryFn: () => jobApi.myJobs().then(r => r.data),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => jobApi.delete(id),
    onSuccess: () => {
      toast.success('Job deleted')
      qc.invalidateQueries(['employer-jobs'])
      setConfirmDelete(null)
    },
    onError: () => toast.error('Failed to delete job'),
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => jobApi.update(id, { status }),
    onSuccess: (_, { status }) => {
      toast.success(`Job ${status}`)
      qc.invalidateQueries(['employer-jobs'])
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Job Listings</h1>
          <p className="text-gray-500 mt-1">{data?.total || 0} job{data?.total !== 1 ? 's' : ''} posted</p>
        </div>
        <Link to="/dashboard/jobs/new" className="btn-primary">
          <PlusCircle size={16} /> Post New Job
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card p-4 animate-pulse flex gap-4">
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="h-3 bg-gray-200 rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : data?.data?.length === 0 ? (
        <div className="card p-16 text-center">
          <Briefcase size={40} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-4">You haven't posted any jobs yet.</p>
          <Link to="/dashboard/jobs/new" className="btn-primary">Post Your First Job</Link>
        </div>
      ) : (
        <div className="card divide-y divide-gray-50">
          {data.data.map(job => (
            <div key={job.id} className="p-4 flex items-center gap-4">
              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-gray-900 text-sm">{job.title}</h3>
                  <span className={statusColors[job.status] || 'badge-gray'}>{job.status}</span>
                  <span className={JOB_TYPE_COLORS[job.type] || 'badge-gray'}>{job.type}</span>
                </div>
                <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><Users size={11} /> {job.applications_count || 0} applicants</span>
                  <span className="flex items-center gap-1"><Eye size={11} /> {job.views || 0} views</span>
                  <span>Posted {timeAgo(job.created_at)}</span>
                  {job.expires_at && <span>Expires {timeAgo(job.expires_at)}</span>}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  to={`/dashboard/jobs/${job.id}/applicants`}
                  className="btn-secondary text-xs py-1.5 px-3"
                >
                  <Users size={13} /> Applicants
                </Link>
                <Link
                  to={`/dashboard/jobs/${job.id}/edit`}
                  className="btn-ghost p-2"
                >
                  <Edit2 size={15} />
                </Link>
                <div className="relative group">
                  <button className="btn-ghost p-2"><MoreVertical size={15} /></button>
                  <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 hidden group-hover:block">
                    {job.status !== 'published' && (
                      <button onClick={() => updateStatusMutation.mutate({ id: job.id, status: 'published' })}
                        className="w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50">
                        Publish
                      </button>
                    )}
                    {job.status === 'published' && (
                      <button onClick={() => updateStatusMutation.mutate({ id: job.id, status: 'paused' })}
                        className="w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50">
                        Pause
                      </button>
                    )}
                    <button onClick={() => updateStatusMutation.mutate({ id: job.id, status: 'closed' })}
                      className="w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50">
                      Close
                    </button>
                    <hr className="my-1 border-gray-100" />
                    <button onClick={() => setConfirmDelete(job)}
                      className="w-full text-left px-3 py-1.5 text-sm text-red-600 hover:bg-red-50">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-2">Delete Job Posting?</h3>
            <p className="text-sm text-gray-500 mb-6">
              "{confirmDelete.title}" and all its applications will be permanently deleted. This cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setConfirmDelete(null)} className="btn-secondary">Cancel</button>
              <button
                onClick={() => deleteMutation.mutate(confirmDelete.id)}
                disabled={deleteMutation.isPending}
                className="btn-danger"
              >
                {deleteMutation.isPending ? 'Deleting…' : 'Delete Job'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

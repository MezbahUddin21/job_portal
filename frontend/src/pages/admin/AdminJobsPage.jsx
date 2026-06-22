// src/pages/admin/AdminJobsPage.jsx
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../../lib/api'
import { timeAgo, formatSalary, JOB_TYPE_COLORS } from '../../lib/utils'
import toast from 'react-hot-toast'
import { Search, Trash2, Eye, CheckCircle, XCircle, PauseCircle, ChevronLeft, ChevronRight, Briefcase } from 'lucide-react'
import { Link } from 'react-router-dom'

const statusColors = {
  published: 'badge-green',
  draft:     'badge-gray',
  paused:    'badge-yellow',
  closed:    'badge-red',
}

export default function AdminJobsPage() {
  const qc = useQueryClient()
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-jobs', { status, page }],
    queryFn: () => adminApi.jobs({ status, page }).then(r => r.data),
    keepPreviousData: true,
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => adminApi.updateJobStatus(id, { status }),
    onSuccess: (_, { status }) => {
      toast.success(`Job ${status}`)
      qc.invalidateQueries(['admin-jobs'])
    },
    onError: () => toast.error('Failed to update'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => adminApi.deleteJob(id),
    onSuccess: () => {
      toast.success('Job deleted')
      qc.invalidateQueries(['admin-jobs'])
      setConfirmDelete(null)
    },
    onError: () => toast.error('Failed to delete'),
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Job Moderation</h1>
        <p className="text-gray-500 mt-1">{data?.total || 0} total job listings</p>
      </div>

      {/* Status filters */}
      <div className="flex flex-wrap gap-2">
        {['', 'published', 'draft', 'paused', 'closed'].map(s => (
          <button
            key={s}
            onClick={() => { setStatus(s); setPage(1) }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition ${
              status === s ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-500">Job</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 hidden lg:table-cell">Company</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">Type</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">Apps</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 hidden lg:table-cell">Posted</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={7} className="px-4 py-3">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                    </td>
                  </tr>
                ))
              ) : data?.data?.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <Briefcase size={36} className="text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500">No jobs found</p>
                  </td>
                </tr>
              ) : data?.data?.map(job => {
                const company = job.employer?.company_profile
                return (
                  <tr key={job.id} className="hover:bg-gray-50/50 transition">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900">{job.title}</p>
                        <p className="text-gray-400 text-xs mt-0.5">{job.location}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-gray-600">
                      {company?.company_name || job.employer?.name}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className={JOB_TYPE_COLORS[job.type] || 'badge-gray'}>{job.type}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={statusColors[job.status] || 'badge-gray'}>{job.status}</span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-gray-600">
                      {job.applications_count || 0}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-gray-500">
                      {timeAgo(job.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <Link to={`/jobs/${job.slug}`} target="_blank" className="btn-ghost p-1.5" title="View listing">
                          <Eye size={14} />
                        </Link>
                        {job.status !== 'published' && (
                          <button
                            onClick={() => updateStatusMutation.mutate({ id: job.id, status: 'published' })}
                            className="btn-ghost p-1.5 text-green-600 hover:bg-green-50"
                            title="Publish"
                          >
                            <CheckCircle size={14} />
                          </button>
                        )}
                        {job.status === 'published' && (
                          <button
                            onClick={() => updateStatusMutation.mutate({ id: job.id, status: 'paused' })}
                            className="btn-ghost p-1.5 text-yellow-600 hover:bg-yellow-50"
                            title="Pause"
                          >
                            <PauseCircle size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => setConfirmDelete(job)}
                          className="btn-ghost p-1.5 text-red-500 hover:bg-red-50"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data?.last_page > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Showing {data.from}–{data.to} of {data.total}
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(p => p - 1)} disabled={page === 1} className="btn-secondary p-1.5">
                <ChevronLeft size={15} />
              </button>
              <span className="text-sm text-gray-600">{page} / {data.last_page}</span>
              <button onClick={() => setPage(p => p + 1)} disabled={page === data.last_page} className="btn-secondary p-1.5">
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete confirm modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-2">Delete Job?</h3>
            <p className="text-sm text-gray-500 mb-6">
              "{confirmDelete.title}" and all its data will be permanently deleted.
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setConfirmDelete(null)} className="btn-secondary">Cancel</button>
              <button
                onClick={() => deleteMutation.mutate(confirmDelete.id)}
                disabled={deleteMutation.isPending}
                className="btn-danger"
              >
                {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

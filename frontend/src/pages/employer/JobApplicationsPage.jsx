// src/pages/employer/JobApplicationsPage.jsx
import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { jobApi } from '../../lib/api'
import { APPLICATION_STATUS_COLORS, timeAgo } from '../../lib/utils'
import toast from 'react-hot-toast'
import { ArrowLeft, User, Mail, MapPin, ChevronDown, FileText, Inbox, Star } from 'lucide-react'

const STATUS_OPTIONS = ['pending', 'reviewing', 'shortlisted', 'rejected', 'hired']

const statusColors = {
  pending:     'bg-yellow-50 text-yellow-700 border-yellow-200',
  reviewing:   'bg-blue-50 text-blue-700 border-blue-200',
  shortlisted: 'bg-purple-50 text-purple-700 border-purple-200',
  rejected:    'bg-red-50 text-red-700 border-red-200',
  hired:       'bg-green-50 text-green-700 border-green-200',
}

export default function JobApplicationsPage() {
  const { id } = useParams()
  const qc = useQueryClient()
  const [selectedApp, setSelectedApp] = useState(null)
  const [filterStatus, setFilterStatus] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['job-applications', id],
    queryFn: () => jobApi.jobApplications(id).then(r => r.data),
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ appId, status, notes }) =>
      jobApi.updateAppStatus(appId, { status, employer_notes: notes }),
    onSuccess: () => {
      toast.success('Status updated')
      qc.invalidateQueries(['job-applications', id])
      setSelectedApp(prev => prev ? { ...prev, status: updateStatusMutation.variables?.status } : null)
    },
    onError: () => toast.error('Failed to update status'),
  })

  const apps = (data?.data || []).filter(a => !filterStatus || a.status === filterStatus)

  const statusCounts = (data?.data || []).reduce((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <div>
        <Link to="/dashboard/jobs" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-3">
          <ArrowLeft size={15} /> Back to My Jobs
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
        <p className="text-gray-500 mt-1">{data?.total || 0} total applicants</p>
      </div>

      {/* Status filter pills */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterStatus('')}
          className={`badge cursor-pointer transition ${!filterStatus ? 'badge-blue ring-2 ring-brand-300' : 'badge-gray hover:bg-gray-200'}`}
        >
          All ({data?.total || 0})
        </button>
        {STATUS_OPTIONS.map(s => statusCounts[s] ? (
          <button
            key={s}
            onClick={() => setFilterStatus(filterStatus === s ? '' : s)}
            className={`badge cursor-pointer transition capitalize ${
              filterStatus === s ? APPLICATION_STATUS_COLORS[s] + ' ring-2 ring-offset-1' : 'badge-gray hover:bg-gray-200'
            }`}
          >
            {s} ({statusCounts[s]})
          </button>
        ) : null)}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card p-4 animate-pulse flex gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/3" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : apps.length === 0 ? (
        <div className="card p-16 text-center">
          <Inbox size={40} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No applications {filterStatus ? `with status "${filterStatus}"` : 'yet'}.</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Application list */}
          <div className="lg:col-span-2 space-y-2">
            {apps.map(app => {
              const candidate = app.candidate
              const profile = candidate?.candidate_profile
              const isSelected = selectedApp?.id === app.id
              return (
                <button
                  key={app.id}
                  onClick={() => setSelectedApp(app)}
                  className={`w-full card p-4 text-left transition hover:border-brand-300 ${isSelected ? 'border-brand-400 bg-brand-50/30' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-semibold text-sm shrink-0">
                      {candidate?.name?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900 truncate">{candidate?.name}</p>
                      <p className="text-xs text-gray-500 truncate">{profile?.headline || candidate?.email}</p>
                    </div>
                    <span className={`badge ${APPLICATION_STATUS_COLORS[app.status] || 'badge-gray'} shrink-0`}>
                      {app.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">{timeAgo(app.created_at)}</p>
                </button>
              )
            })}
          </div>

          {/* Application detail */}
          <div className="lg:col-span-3">
            {selectedApp ? (
              <ApplicationDetail
                app={selectedApp}
                onUpdateStatus={(status, notes) => updateStatusMutation.mutate({ appId: selectedApp.id, status, notes })}
                isUpdating={updateStatusMutation.isPending}
              />
            ) : (
              <div className="card p-16 text-center h-full flex flex-col items-center justify-center">
                <User size={36} className="text-gray-300 mb-3" />
                <p className="text-gray-500 text-sm">Select an applicant to view their details</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function ApplicationDetail({ app, onUpdateStatus, isUpdating }) {
  const [notes, setNotes] = useState(app.employer_notes || '')
  const [status, setStatus] = useState(app.status)
  const candidate = app.candidate
  const profile = candidate?.candidate_profile

  return (
    <div className="card divide-y divide-gray-100">
      {/* Candidate header */}
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-lg">
              {candidate?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{candidate?.name}</h3>
              {profile?.headline && <p className="text-sm text-gray-500">{profile.headline}</p>}
            </div>
          </div>
          <span className={`badge ${APPLICATION_STATUS_COLORS[app.status]} capitalize`}>{app.status}</span>
        </div>

        <div className="mt-4 flex flex-wrap gap-3 text-sm text-gray-600">
          <a href={`mailto:${candidate?.email}`} className="flex items-center gap-1.5 hover:text-brand-600">
            <Mail size={14} /> {candidate?.email}
          </a>
          {profile?.location && (
            <span className="flex items-center gap-1.5">
              <MapPin size={14} /> {profile.location}
            </span>
          )}
          {profile?.experience_years && (
            <span>{profile.experience_years} yrs experience</span>
          )}
        </div>

        {profile?.skills?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {profile.skills.map(skill => (
              <span key={skill} className="badge-blue">{skill}</span>
            ))}
          </div>
        )}
      </div>

      {/* Cover letter */}
      {app.cover_letter && (
        <div className="p-5">
          <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
            <FileText size={14} /> Cover Letter
          </h4>
          <p className="text-sm text-gray-600 whitespace-pre-wrap bg-gray-50 rounded-lg p-3">{app.cover_letter}</p>
        </div>
      )}

      {/* Status update */}
      <div className="p-5 space-y-4">
        <h4 className="text-sm font-semibold text-gray-700">Update Status</h4>

        <div className="grid grid-cols-5 gap-1.5">
          {STATUS_OPTIONS.map(s => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`py-1.5 px-2 rounded-lg border text-xs font-medium capitalize transition ${
                status === s ? statusColors[s] : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div>
          <label className="label text-xs">Internal Notes (not visible to candidate)</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={3}
            placeholder="Add notes about this candidate..."
            className="input resize-none text-sm"
          />
        </div>

        <button
          onClick={() => onUpdateStatus(status, notes)}
          disabled={isUpdating}
          className="btn-primary w-full"
        >
          {isUpdating ? 'Updating…' : 'Update Application'}
        </button>
      </div>
    </div>
  )
}

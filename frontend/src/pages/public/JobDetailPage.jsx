// src/pages/public/JobDetailPage.jsx
import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { jobApi, applicationApi } from '../../lib/api'
import { useAuthStore } from '../../store/authStore'
import { formatSalary, timeAgo, JOB_TYPE_COLORS, APPLICATION_STATUS_COLORS } from '../../lib/utils'
import toast from 'react-hot-toast'
import {
  MapPin, Clock, DollarSign, Briefcase, Building2, Globe,
  Wifi, ArrowLeft, Heart, Send, CheckCircle, Users
} from 'lucide-react'

export default function JobDetailPage() {
  const { slug } = useParams()
  const { user, isAuthenticated } = useAuthStore()
  const navigate = useNavigate()
  const qc = useQueryClient()

  const [showApplyModal, setShowApplyModal] = useState(false)
  const [coverLetter, setCoverLetter] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['job', slug],
    queryFn: () => jobApi.show(slug).then(r => r.data.job),
  })

  const applyMutation = useMutation({
    mutationFn: (data) => applicationApi.apply(job.id, data),
    onSuccess: () => {
      toast.success('Application submitted!')
      setShowApplyModal(false)
      qc.invalidateQueries(['job', slug])
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to apply')
    },
  })

  const saveMutation = useMutation({
    mutationFn: () => applicationApi.toggleSave(job.id),
    onSuccess: (r) => toast.success(r.data.saved ? 'Job saved!' : 'Job removed from saved'),
  })

  const job = data

  if (isLoading) return (
    <div className="page-container py-10">
      <div className="animate-pulse space-y-6 max-w-4xl mx-auto">
        <div className="h-8 bg-gray-200 rounded w-1/2" />
        <div className="h-64 bg-gray-200 rounded" />
      </div>
    </div>
  )

  if (!job) return (
    <div className="page-container py-20 text-center">
      <p className="text-gray-500">Job not found.</p>
      <Link to="/jobs" className="btn-primary mt-4 inline-flex">Back to Jobs</Link>
    </div>
  )

  const company = job.employer?.company_profile

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="page-container max-w-5xl">
        <Link to="/jobs" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-6">
          <ArrowLeft size={15} /> Back to Jobs
        </Link>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header card */}
            <div className="card p-6">
              <div className="flex items-start gap-4 mb-5">
                <div className="w-14 h-14 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-xl shrink-0">
                  {(company?.company_name || job.employer?.name || 'J')[0]}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
                  <p className="text-gray-500 mt-0.5">
                    {company?.company_name || job.employer?.name}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className={JOB_TYPE_COLORS[job.type] || 'badge-gray'}>{job.type}</span>
                <span className="badge-gray">{job.experience_level}</span>
                {job.is_remote && <span className="badge-green flex items-center gap-1"><Wifi size={11} /> Remote</span>}
                <span className="badge-gray flex items-center gap-1"><MapPin size={11} />{job.location}</span>
                <span className="badge-gray flex items-center gap-1"><Users size={11} />{job.applications?.length || 0} applicants</span>
                <span className="badge-gray flex items-center gap-1"><Clock size={11} />{timeAgo(job.created_at)}</span>
              </div>
            </div>

            {/* Description */}
            <div className="card p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-3">Job Description</h2>
              <div className="prose prose-sm max-w-none text-gray-600 whitespace-pre-line">{job.description}</div>
            </div>

            {job.requirements && (
              <div className="card p-6">
                <h2 className="text-base font-semibold text-gray-900 mb-3">Requirements</h2>
                <div className="text-sm text-gray-600 whitespace-pre-line">{job.requirements}</div>
              </div>
            )}

            {job.benefits && (
              <div className="card p-6">
                <h2 className="text-base font-semibold text-gray-900 mb-3">Benefits</h2>
                <div className="text-sm text-gray-600 whitespace-pre-line">{job.benefits}</div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Apply card */}
            <div className="card p-5">
              <div className="text-xl font-bold text-gray-900 mb-1">
                {formatSalary(job.salary_min, job.salary_max, job.currency)}
              </div>
              <p className="text-sm text-gray-500 mb-4">per year</p>

              {isAuthenticated() && user?.role === 'candidate' ? (
                <div className="space-y-2">
                  <button
                    onClick={() => setShowApplyModal(true)}
                    className="btn-primary w-full"
                  >
                    <Send size={15} /> Apply Now
                  </button>
                  <button
                    onClick={() => saveMutation.mutate()}
                    className="btn-secondary w-full"
                  >
                    <Heart size={15} /> Save Job
                  </button>
                </div>
              ) : !isAuthenticated() ? (
                <div className="space-y-2">
                  <Link to="/login" className="btn-primary w-full flex items-center justify-center gap-2">
                    Sign in to Apply
                  </Link>
                  <Link to="/register" className="btn-secondary w-full flex items-center justify-center">
                    Create Account
                  </Link>
                </div>
              ) : null}
            </div>

            {/* Company info */}
            {company && (
              <div className="card p-5">
                <h3 className="font-semibold text-gray-900 mb-4">About the Company</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex gap-2">
                    <Building2 size={15} className="text-gray-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">{company.company_name}</p>
                      <p className="text-gray-500 capitalize">{company.industry}</p>
                    </div>
                  </div>
                  {company.company_size && (
                    <div className="flex gap-2 text-gray-600">
                      <Users size={15} className="text-gray-400 shrink-0 mt-0.5" />
                      {company.company_size} employees
                    </div>
                  )}
                  {company.website && (
                    <div className="flex gap-2 text-brand-600">
                      <Globe size={15} className="text-gray-400 shrink-0 mt-0.5" />
                      <a href={company.website} target="_blank" rel="noopener noreferrer" className="hover:underline truncate">
                        {company.website}
                      </a>
                    </div>
                  )}
                  {company.description && (
                    <p className="text-gray-500 text-xs mt-2 pt-3 border-t border-gray-100">{company.description}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Apply for {job.title}</h3>
              <p className="text-sm text-gray-500 mt-1">{company?.company_name || job.employer?.name}</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="label">Cover Letter (optional)</label>
                <textarea
                  value={coverLetter}
                  onChange={e => setCoverLetter(e.target.value)}
                  rows={5}
                  placeholder="Tell the employer why you're a great fit..."
                  className="input resize-none"
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex gap-3 justify-end">
              <button onClick={() => setShowApplyModal(false)} className="btn-secondary">Cancel</button>
              <button
                onClick={() => applyMutation.mutate({ cover_letter: coverLetter })}
                disabled={applyMutation.isPending}
                className="btn-primary"
              >
                {applyMutation.isPending ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

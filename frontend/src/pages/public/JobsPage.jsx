// src/pages/public/JobsPage.jsx
import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { jobApi } from '../../lib/api'
import { formatSalary, timeAgo, JOB_TYPES, EXPERIENCE_LEVELS, JOB_CATEGORIES, JOB_TYPE_COLORS } from '../../lib/utils'
import { Search, MapPin, Filter, Briefcase, Clock, DollarSign, ChevronLeft, ChevronRight, Building2, Wifi } from 'lucide-react'

const JobCard = ({ job }) => (
  <Link to={`/jobs/${job.slug}`} className="card p-5 hover:border-brand-300 hover:shadow-md transition-all block">
    <div className="flex items-start gap-4">
      <div className="w-12 h-12 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-lg shrink-0">
        {(job.employer?.company_profile?.company_name || job.employer?.name || 'J')[0]}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold text-gray-900 text-base hover:text-brand-600">{job.title}</h3>
            <div className="flex items-center gap-1.5 mt-0.5 text-sm text-gray-500">
              <Building2 size={13} />
              {job.employer?.company_profile?.company_name || job.employer?.name}
            </div>
          </div>
          {job.is_remote && (
            <span className="badge-green shrink-0 flex items-center gap-1">
              <Wifi size={11} /> Remote
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          <span className={JOB_TYPE_COLORS[job.type] || 'badge-gray'}>{job.type}</span>
          <span className="badge-gray">{job.experience_level}</span>
          <span className="badge-gray flex items-center gap-1">
            <MapPin size={11} /> {job.location}
          </span>
        </div>

        <div className="flex items-center justify-between mt-3">
          <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
            <DollarSign size={14} />
            {formatSalary(job.salary_min, job.salary_max, job.currency)}
          </span>
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <Clock size={12} /> {timeAgo(job.created_at)}
          </span>
        </div>
      </div>
    </div>
  </Link>
)

export default function JobsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [filters, setFilters] = useState({
    search:           searchParams.get('search') || '',
    category:         searchParams.get('category') || '',
    type:             '',
    experience_level: '',
    location:         searchParams.get('location') || '',
    is_remote:        false,
    page:             1,
  })

  const { data, isLoading } = useQuery({
    queryKey: ['jobs', filters],
    queryFn: () => jobApi.list(filters).then(r => r.data),
  })

  const update = (key, val) => setFilters(f => ({ ...f, [key]: val, page: 1 }))

  return (
    <div className="page-container py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Browse Jobs</h1>
        <p className="text-gray-500 mt-1">{data?.total || 0} opportunities available</p>
      </div>

      {/* Search bar */}
      <div className="card p-4 mb-6 flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 flex-1 border border-gray-200 rounded-lg px-3 py-2">
          <Search size={16} className="text-gray-400" />
          <input
            value={filters.search}
            onChange={e => update('search', e.target.value)}
            placeholder="Search jobs..."
            className="flex-1 text-sm outline-none"
          />
        </div>
        <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2">
          <MapPin size={16} className="text-gray-400" />
          <input
            value={filters.location}
            onChange={e => update('location', e.target.value)}
            placeholder="Location"
            className="text-sm outline-none w-40"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer px-3">
          <input type="checkbox" checked={filters.is_remote} onChange={e => update('is_remote', e.target.checked)} className="rounded" />
          Remote only
        </label>
      </div>

      <div className="flex gap-6">
        {/* Filters sidebar */}
        <aside className="hidden lg:block w-56 shrink-0">
          <div className="card p-4 sticky top-24 space-y-5">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Job Type</p>
              <div className="space-y-2">
                {JOB_TYPES.map(t => (
                  <label key={t.value} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input
                      type="radio"
                      name="type"
                      checked={filters.type === t.value}
                      onChange={() => update('type', filters.type === t.value ? '' : t.value)}
                      className="text-brand-600"
                    />
                    {t.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Experience</p>
              <select
                value={filters.experience_level}
                onChange={e => update('experience_level', e.target.value)}
                className="input text-sm"
              >
                <option value="">All levels</option>
                {EXPERIENCE_LEVELS.map(l => (
                  <option key={l.value} value={l.value}>{l.label}</option>
                ))}
              </select>
            </div>

            <div className="border-t border-gray-100 pt-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Category</p>
              <select
                value={filters.category}
                onChange={e => update('category', e.target.value)}
                className="input text-sm"
              >
                <option value="">All categories</option>
                {JOB_CATEGORIES.map(c => (
                  <option key={c} value={c} className="capitalize">{c}</option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setFilters({ search: '', category: '', type: '', experience_level: '', location: '', is_remote: false, page: 1 })}
              className="w-full btn-ghost text-sm"
            >
              Clear filters
            </button>
          </div>
        </aside>

        {/* Job list */}
        <div className="flex-1 min-w-0">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="card p-5 animate-pulse">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : data?.data?.length === 0 ? (
            <div className="card p-16 text-center">
              <Briefcase size={40} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No jobs found matching your criteria.</p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {data?.data?.map(job => <JobCard key={job.id} job={job} />)}
              </div>

              {/* Pagination */}
              {data?.last_page > 1 && (
                <div className="flex justify-center items-center gap-3 mt-8">
                  <button
                    onClick={() => update('page', filters.page - 1)}
                    disabled={filters.page === 1}
                    className="btn-secondary p-2"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="text-sm text-gray-600">Page {data.current_page} of {data.last_page}</span>
                  <button
                    onClick={() => update('page', filters.page + 1)}
                    disabled={filters.page === data?.last_page}
                    className="btn-secondary p-2"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

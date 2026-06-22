// src/pages/employer/EditJobPage.jsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { jobApi } from '../../lib/api'
import JobForm from '../../components/JobForm'
import toast from 'react-hot-toast'
import { ArrowLeft } from 'lucide-react'

export default function EditJobPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data: job, isLoading } = useQuery({
    queryKey: ['employer-job', id],
    queryFn: () => jobApi.myJobs().then(r => r.data.data?.find(j => j.id === Number(id))),
  })

  const mutation = useMutation({
    mutationFn: (data) => jobApi.update(id, data),
    onSuccess: () => {
      toast.success('Job updated!')
      qc.invalidateQueries(['employer-jobs'])
      navigate('/dashboard/jobs')
    },
    onError: (err) => {
      const errors = err.response?.data?.errors
      if (errors) Object.values(errors).flat().forEach(m => toast.error(m))
      else toast.error('Failed to update job')
    },
  })

  if (isLoading) {
    return (
      <div className="max-w-3xl animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        <div className="h-64 bg-gray-200 rounded" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <Link to="/dashboard/jobs" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-4">
          <ArrowLeft size={15} /> Back to My Jobs
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Job Posting</h1>
        <p className="text-gray-500 mt-1">{job?.title}</p>
      </div>

      <JobForm
        defaultValues={job}
        onSubmit={(data) => mutation.mutate(data)}
        isSubmitting={mutation.isPending}
      />
    </div>
  )
}

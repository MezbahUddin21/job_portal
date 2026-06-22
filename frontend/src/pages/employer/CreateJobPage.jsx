// src/pages/employer/CreateJobPage.jsx
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate, Link } from 'react-router-dom'
import { jobApi } from '../../lib/api'
import JobForm from '../../components/JobForm'
import toast from 'react-hot-toast'
import { ArrowLeft } from 'lucide-react'

export default function CreateJobPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()

  const mutation = useMutation({
    mutationFn: (data) => jobApi.create(data),
    onSuccess: (res) => {
      toast.success('Job posted successfully!')
      qc.invalidateQueries(['employer-jobs'])
      navigate('/dashboard/jobs')
    },
    onError: (err) => {
      const errors = err.response?.data?.errors
      if (errors) {
        Object.values(errors).flat().forEach(m => toast.error(m))
      } else {
        toast.error(err.response?.data?.message || 'Failed to create job')
      }
    },
  })

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <Link to="/dashboard/jobs" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-4">
          <ArrowLeft size={15} /> Back to My Jobs
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Post a New Job</h1>
        <p className="text-gray-500 mt-1">Fill in the details to attract the right candidates</p>
      </div>

      <JobForm
        defaultValues={{ status: 'published', currency: 'USD', is_remote: false }}
        onSubmit={(data) => mutation.mutate(data)}
        isSubmitting={mutation.isPending}
      />
    </div>
  )
}

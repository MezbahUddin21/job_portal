// src/pages/auth/RegisterPage.jsx
import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { authApi } from '../../lib/api'
import { useAuthStore } from '../../store/authStore'
import toast from 'react-hot-toast'
import { Briefcase, User, Building2 } from 'lucide-react'

export default function RegisterPage() {
  const [params] = useSearchParams()
  const [role, setRole] = useState(params.get('role') || 'candidate')
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm()
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  const onSubmit = async (data) => {
    try {
      const res = await authApi.register({ ...data, role })
      setAuth(res.data.user, res.data.token)
      toast.success('Account created!')
      navigate('/dashboard')
    } catch (err) {
      const errs = err.response?.data?.errors
      if (errs) {
        Object.values(errs).flat().forEach(msg => toast.error(msg))
      } else {
        toast.error(err.response?.data?.message || 'Registration failed')
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-lg font-semibold text-gray-900">
            <div className="bg-brand-600 text-white p-1.5 rounded-lg">
              <Briefcase size={18} />
            </div>
            JobPortal
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-6 mb-1">Create an account</h1>
          <p className="text-gray-500 text-sm">Join thousands of professionals</p>
        </div>

        <div className="card p-8">
          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { value: 'candidate', icon: User, label: 'Job Seeker', sub: 'Find your next role' },
              { value: 'employer', icon: Building2, label: 'Employer', sub: 'Hire top talent' },
            ].map(({ value, icon: Icon, label, sub }) => (
              <button
                key={value}
                type="button"
                onClick={() => setRole(value)}
                className={`p-4 rounded-lg border-2 text-left transition ${
                  role === value
                    ? 'border-brand-500 bg-brand-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Icon size={20} className={role === value ? 'text-brand-600' : 'text-gray-400'} />
                <p className={`font-medium text-sm mt-2 ${role === value ? 'text-brand-700' : 'text-gray-900'}`}>{label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{sub}</p>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input
                {...register('name', { required: 'Name is required' })}
                placeholder="John Smith"
                className="input"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="label">Email</label>
              <input
                type="email"
                {...register('email', { required: 'Email is required' })}
                placeholder="you@example.com"
                className="input"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="label">Password</label>
              <input
                type="password"
                {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'Minimum 8 characters' } })}
                placeholder="••••••••"
                className="input"
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="label">Confirm Password</label>
              <input
                type="password"
                {...register('password_confirmation', {
                  required: true,
                  validate: v => v === watch('password') || 'Passwords do not match',
                })}
                placeholder="••••••••"
                className="input"
              />
              {errors.password_confirmation && <p className="text-red-500 text-xs mt-1">{errors.password_confirmation.message}</p>}
            </div>

            {/* Employer-specific fields */}
            {role === 'employer' && (
              <>
                <div>
                  <label className="label">Company Name</label>
                  <input
                    {...register('company_name', { required: role === 'employer' })}
                    placeholder="Acme Inc."
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Industry</label>
                  <input
                    {...register('industry', { required: role === 'employer' })}
                    placeholder="Technology, Healthcare..."
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Company Location</label>
                  <input
                    {...register('location', { required: role === 'employer' })}
                    placeholder="New York, NY"
                    className="input"
                  />
                </div>
              </>
            )}

            <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-2.5">
              {isSubmitting ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-600 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

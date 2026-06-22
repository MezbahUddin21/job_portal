// src/pages/auth/LoginPage.jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { authApi } from '../../lib/api'
import { useAuthStore } from '../../store/authStore'
import toast from 'react-hot-toast'
import { Briefcase, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm()
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()
  const [showPw, setShowPw] = useState(false)

  const onSubmit = async (data) => {
    try {
      const res = await authApi.login(data)
      setAuth(res.data.user, res.data.token)
      toast.success('Welcome back!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials')
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
          <h1 className="text-2xl font-bold text-gray-900 mt-6 mb-1">Welcome back</h1>
          <p className="text-gray-500 text-sm">Sign in to your account</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  {...register('password', { required: 'Password is required' })}
                  placeholder="••••••••"
                  className="input pr-10"
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-2.5">
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-600 font-medium hover:underline">Sign up</Link>
          </p>

          {/* Demo credentials
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
            <p className="text-xs font-semibold text-gray-500 mb-2">Demo accounts</p>
            <div className="space-y-1 text-xs text-gray-600">
              <p>Admin: <span className="font-mono">admin@jobportal.com</span></p>
              <p>Employer: <span className="font-mono">techcorpinc@jobportal.com</span></p>
              <p>Candidate: <span className="font-mono">candidate1@jobportal.com</span></p>
              <p className="text-gray-400">All passwords: <span className="font-mono">password</span></p>
            </div>
          </div> */};
        </div>
      </div>
    </div>
  )
}

// src/pages/dashboard/ProfilePage.jsx
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { profileApi } from '../../lib/api'
import { useAuthStore } from '../../store/authStore'
import toast from 'react-hot-toast'
import { User, Building2, MapPin, Globe, Phone, Save } from 'lucide-react'

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore()
  const qc = useQueryClient()

  const { data: profileData } = useQuery({
    queryKey: ['profile'],
    queryFn: () => profileApi.show().then(r => r.data.user),
  })

  // ── Base user form ────────────────────────────────────────────────────────────
  const { register: regBase, handleSubmit: handleBase, reset: resetBase, formState: { isSubmitting: submittingBase } } = useForm()

  useEffect(() => {
    if (profileData) resetBase({ name: profileData.name, email: profileData.email, phone: profileData.phone })
  }, [profileData])

  const updateBaseMutation = useMutation({
    mutationFn: (data) => profileApi.update(data),
    onSuccess: (r) => { updateUser(r.data.user); toast.success('Profile updated') },
    onError: () => toast.error('Failed to update profile'),
  })

  // ── Company form ──────────────────────────────────────────────────────────────
  const { register: regCo, handleSubmit: handleCo, reset: resetCo, formState: { isSubmitting: submittingCo } } = useForm()

  useEffect(() => {
    if (profileData?.company_profile) resetCo(profileData.company_profile)
  }, [profileData])

  const updateCompanyMutation = useMutation({
    mutationFn: (data) => profileApi.updateCompany(data),
    onSuccess: () => { toast.success('Company profile updated'); qc.invalidateQueries(['profile']) },
    onError: () => toast.error('Failed to update'),
  })

  // ── Candidate form ────────────────────────────────────────────────────────────
  const { register: regCand, handleSubmit: handleCand, reset: resetCand, formState: { isSubmitting: submittingCand } } = useForm()

  useEffect(() => {
    if (profileData?.candidate_profile) {
      const p = profileData.candidate_profile
      resetCand({ ...p, skills: Array.isArray(p.skills) ? p.skills.join(', ') : '' })
    }
  }, [profileData])

  const updateCandidateMutation = useMutation({
    mutationFn: (data) => profileApi.updateCandidate({
      ...data,
      skills: data.skills ? data.skills.split(',').map(s => s.trim()).filter(Boolean) : [],
    }),
    onSuccess: () => { toast.success('Profile updated'); qc.invalidateQueries(['profile']) },
    onError: () => toast.error('Failed to update'),
  })

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-500 mt-1">Manage your account information</p>
      </div>

      {/* Avatar / identity */}
      <div className="card p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-2xl font-bold">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{user?.name}</p>
            <p className="text-sm text-gray-500 capitalize">{user?.role}</p>
          </div>
        </div>

        <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <User size={16} /> Account Details
        </h2>
        <form onSubmit={handleBase(d => updateBaseMutation.mutate(d))} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Full Name</label>
              <input {...regBase('name', { required: true })} className="input" />
            </div>
            <div>
              <label className="label">Email</label>
              <input type="email" {...regBase('email', { required: true })} className="input" />
            </div>
          </div>
          <div>
            <label className="label">Phone</label>
            <input {...regBase('phone')} placeholder="+1 (555) 000-0000" className="input" />
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={submittingBase || updateBaseMutation.isPending} className="btn-primary">
              <Save size={15} /> Save Changes
            </button>
          </div>
        </form>
      </div>

      {/* Employer – company profile */}
      {user?.role === 'employer' && (
        <div className="card p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Building2 size={16} /> Company Profile
          </h2>
          <form onSubmit={handleCo(d => updateCompanyMutation.mutate(d))} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Company Name</label>
                <input {...regCo('company_name')} className="input" />
              </div>
              <div>
                <label className="label">Industry</label>
                <input {...regCo('industry')} className="input" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Company Size</label>
                <select {...regCo('company_size')} className="input">
                  <option value="">Select size</option>
                  {['1-10', '11-50', '51-200', '201-500', '500+'].map(s => (
                    <option key={s} value={s}>{s} employees</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Founded Year</label>
                <input {...regCo('founded_year')} placeholder="2010" className="input" />
              </div>
            </div>
            <div>
              <label className="label">Location</label>
              <input {...regCo('location')} placeholder="San Francisco, CA" className="input" />
            </div>
            <div>
              <label className="label">Website</label>
              <input {...regCo('website')} placeholder="https://yourcompany.com" className="input" />
            </div>
            <div>
              <label className="label">Description</label>
              <textarea {...regCo('description')} rows={4} placeholder="Tell candidates about your company..." className="input resize-none" />
            </div>
            <div className="flex justify-end">
              <button type="submit" disabled={submittingCo || updateCompanyMutation.isPending} className="btn-primary">
                <Save size={15} /> Save Company Info
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Candidate – professional profile */}
      {user?.role === 'candidate' && (
        <div className="card p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <User size={16} /> Professional Profile
          </h2>
          <form onSubmit={handleCand(d => updateCandidateMutation.mutate(d))} className="space-y-4">
            <div>
              <label className="label">Headline</label>
              <input {...regCand('headline')} placeholder="Senior React Developer at Acme" className="input" />
            </div>
            <div>
              <label className="label">Bio</label>
              <textarea {...regCand('bio')} rows={3} placeholder="A short bio about yourself..." className="input resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Location</label>
                <input {...regCand('location')} placeholder="San Francisco, CA" className="input" />
              </div>
              <div>
                <label className="label">Years of Experience</label>
                <input {...regCand('experience_years')} placeholder="5" className="input" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Expected Salary (USD/yr)</label>
                <input {...regCand('expected_salary')} placeholder="90000" className="input" />
              </div>
              <div>
                <label className="label">Availability</label>
                <select {...regCand('availability')} className="input">
                  <option value="immediately">Immediately</option>
                  <option value="two_weeks">2 Weeks Notice</option>
                  <option value="one_month">1 Month</option>
                  <option value="not_looking">Not Looking</option>
                </select>
              </div>
            </div>
            <div>
              <label className="label">Skills (comma-separated)</label>
              <input {...regCand('skills')} placeholder="React, Laravel, MySQL, Docker" className="input" />
              <p className="text-xs text-gray-400 mt-1">e.g. React, TypeScript, Node.js</p>
            </div>
            <div className="flex justify-end">
              <button type="submit" disabled={submittingCand || updateCandidateMutation.isPending} className="btn-primary">
                <Save size={15} /> Save Profile
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

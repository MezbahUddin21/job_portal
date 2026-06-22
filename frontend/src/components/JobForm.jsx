// src/components/JobForm.jsx
import { useForm } from 'react-hook-form'
import { useEffect } from 'react'
import { JOB_TYPES, EXPERIENCE_LEVELS, JOB_CATEGORIES } from '../lib/utils'
import { Save, Send } from 'lucide-react'

export default function JobForm({ defaultValues, onSubmit, isSubmitting }) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({ defaultValues })

  useEffect(() => {
    if (defaultValues) reset(defaultValues)
  }, [defaultValues])

  const isRemote = watch('is_remote')

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Basic info */}
      <div className="card p-6 space-y-5">
        <h2 className="font-semibold text-gray-900 text-base">Job Details</h2>

        <div>
          <label className="label">Job Title <span className="text-red-500">*</span></label>
          <input
            {...register('title', { required: 'Title is required' })}
            placeholder="e.g. Senior Laravel Developer"
            className="input"
          />
          {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Category <span className="text-red-500">*</span></label>
            <select {...register('category', { required: true })} className="input">
              <option value="">Select category</option>
              {JOB_CATEGORIES.map(c => (
                <option key={c} value={c} className="capitalize">{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
            {errors.category && <p className="text-red-500 text-xs mt-1">Required</p>}
          </div>
          <div>
            <label className="label">Job Type <span className="text-red-500">*</span></label>
            <select {...register('type', { required: true })} className="input">
              <option value="">Select type</option>
              {JOB_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            {errors.type && <p className="text-red-500 text-xs mt-1">Required</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Experience Level <span className="text-red-500">*</span></label>
            <select {...register('experience_level', { required: true })} className="input">
              <option value="">Select level</option>
              {EXPERIENCE_LEVELS.map(l => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
            {errors.experience_level && <p className="text-red-500 text-xs mt-1">Required</p>}
          </div>
          <div>
            <label className="label">Location <span className="text-red-500">*</span></label>
            <input
              {...register('location', { required: 'Location is required' })}
              placeholder="San Francisco, CA"
              className="input"
              disabled={isRemote}
            />
            {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location.message}</p>}
          </div>
        </div>

        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input type="checkbox" {...register('is_remote')} className="rounded text-brand-600 w-4 h-4" />
          <span className="text-sm text-gray-700">This is a fully remote position</span>
        </label>
      </div>

      {/* Salary */}
      <div className="card p-6 space-y-5">
        <h2 className="font-semibold text-gray-900 text-base">Compensation</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="label">Currency</label>
            <select {...register('currency')} className="input">
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="BDT">BDT (৳)</option>
              <option value="INR">INR (₹)</option>
            </select>
          </div>
          <div>
            <label className="label">Min Salary / year</label>
            <input
              type="number"
              {...register('salary_min', { min: 0 })}
              placeholder="50000"
              className="input"
            />
          </div>
          <div>
            <label className="label">Max Salary / year</label>
            <input
              type="number"
              {...register('salary_max', { min: 0 })}
              placeholder="90000"
              className="input"
            />
          </div>
        </div>
        <p className="text-xs text-gray-400">Leave blank to show "Negotiable"</p>
      </div>

      {/* Description */}
      <div className="card p-6 space-y-5">
        <h2 className="font-semibold text-gray-900 text-base">Job Content</h2>

        <div>
          <label className="label">Job Description <span className="text-red-500">*</span></label>
          <textarea
            {...register('description', { required: 'Description is required' })}
            rows={8}
            placeholder="Describe the role, responsibilities, and what a typical day looks like..."
            className="input resize-y"
          />
          {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
        </div>

        <div>
          <label className="label">Requirements</label>
          <textarea
            {...register('requirements')}
            rows={5}
            placeholder="• 3+ years of PHP/Laravel experience&#10;• Strong MySQL knowledge&#10;• Team player"
            className="input resize-y"
          />
        </div>

        <div>
          <label className="label">Benefits</label>
          <textarea
            {...register('benefits')}
            rows={4}
            placeholder="• Competitive salary&#10;• Remote-friendly&#10;• Health insurance&#10;• Annual bonus"
            className="input resize-y"
          />
        </div>
      </div>

      {/* Publishing */}
      <div className="card p-6 space-y-5">
        <h2 className="font-semibold text-gray-900 text-base">Publishing</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Status</label>
            <select {...register('status')} className="input">
              <option value="draft">Save as Draft</option>
              <option value="published">Publish Now</option>
            </select>
          </div>
          <div>
            <label className="label">Expires On</label>
            <input type="date" {...register('expires_at')} className="input" />
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-3">
        <button
          type="submit"
          name="status"
          value="draft"
          disabled={isSubmitting}
          className="btn-secondary"
          onClick={() => {}}
        >
          <Save size={15} /> Save Draft
        </button>
        <button type="submit" disabled={isSubmitting} className="btn-primary px-6">
          <Send size={15} /> {isSubmitting ? 'Saving…' : 'Save & Publish'}
        </button>
      </div>
    </form>
  )
}

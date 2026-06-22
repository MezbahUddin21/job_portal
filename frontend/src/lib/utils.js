// src/lib/utils.js
import { clsx } from 'clsx'

export const cn = (...args) => clsx(args)

export const formatSalary = (min, max, currency = 'USD') => {
  if (!min && !max) return 'Negotiable'
  const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n)
  if (min && max) return `${fmt(min)} – ${fmt(max)}`
  if (min) return `From ${fmt(min)}`
  return `Up to ${fmt(max)}`
}

export const timeAgo = (dateStr) => {
  const date = new Date(dateStr)
  const seconds = Math.floor((new Date() - date) / 1000)
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 2592000) return `${Math.floor(seconds / 86400)}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export const JOB_TYPES = [
  { value: 'full-time',  label: 'Full-time' },
  { value: 'part-time',  label: 'Part-time' },
  { value: 'contract',   label: 'Contract' },
  { value: 'freelance',  label: 'Freelance' },
  { value: 'internship', label: 'Internship' },
]

export const EXPERIENCE_LEVELS = [
  { value: 'entry',     label: 'Entry Level' },
  { value: 'junior',    label: 'Junior' },
  { value: 'mid',       label: 'Mid Level' },
  { value: 'senior',    label: 'Senior' },
  { value: 'lead',      label: 'Lead' },
  { value: 'executive', label: 'Executive' },
]

export const JOB_CATEGORIES = [
  'technology', 'marketing', 'design', 'finance', 'healthcare',
  'education', 'sales', 'engineering', 'hr', 'legal', 'construction', 'other',
]

export const APPLICATION_STATUS_COLORS = {
  pending:     'badge-yellow',
  reviewing:   'badge-blue',
  shortlisted: 'badge-purple',
  rejected:    'badge-red',
  hired:       'badge-green',
}

export const JOB_TYPE_COLORS = {
  'full-time':  'badge-blue',
  'part-time':  'badge-purple',
  'contract':   'badge-yellow',
  'freelance':  'badge-green',
  'internship': 'badge-gray',
}

// src/pages/public/HomePage.jsx
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Search, MapPin, Briefcase, Users, TrendingUp, ArrowRight } from 'lucide-react'

const CATEGORIES = [
  { icon: '💻', name: 'Technology', count: '1.2k jobs' },
  { icon: '📊', name: 'Finance', count: '432 jobs' },
  { icon: '🏥', name: 'Healthcare', count: '786 jobs' },
  { icon: '🎨', name: 'Design', count: '321 jobs' },
  { icon: '📚', name: 'Education', count: '198 jobs' },
  { icon: '⚙️', name: 'Engineering', count: '654 jobs' },
]

const STATS = [
  { icon: Briefcase, label: 'Live Jobs',     value: '10,000+' },
  { icon: Users,     label: 'Companies',     value: '3,500+' },
  { icon: TrendingUp,label: 'Hired Monthly', value: '1,200+' },
]

export default function HomePage() {
  const [search, setSearch] = useState('')
  const [location, setLocation] = useState('')
  const navigate = useNavigate()

  const handleSearch = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (search)   params.set('search', search)
    if (location) params.set('location', location)
    navigate(`/jobs?${params}`)
  }

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-600 via-brand-700 to-indigo-800 text-white py-24">
        <div className="page-container text-center">
          <span className="inline-block bg-white/10 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            🎯 Your next opportunity starts here
          </span>
          <h1 className="text-5xl font-bold mb-4 leading-tight">
            Find Jobs That<br />
            <span className="text-brand-200">Match Your Skills</span>
          </h1>
          <p className="text-brand-100 text-lg mb-10 max-w-2xl mx-auto">
            Connect with top employers. Discover thousands of opportunities across every industry.
          </p>

          {/* Search form */}
          <form onSubmit={handleSearch} className="bg-white rounded-xl p-2 shadow-2xl max-w-3xl mx-auto flex flex-col sm:flex-row gap-2">
            <div className="flex items-center gap-2 flex-1 px-3 py-2">
              <Search size={18} className="text-gray-400 shrink-0" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Job title or keyword"
                className="flex-1 text-gray-900 text-sm outline-none placeholder:text-gray-400"
              />
            </div>
            <div className="hidden sm:flex w-px bg-gray-200" />
            <div className="flex items-center gap-2 flex-1 px-3 py-2">
              <MapPin size={18} className="text-gray-400 shrink-0" />
              <input
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="City or remote"
                className="flex-1 text-gray-900 text-sm outline-none placeholder:text-gray-400"
              />
            </div>
            <button type="submit" className="btn-primary px-6 py-2.5 shrink-0">
              Search Jobs
            </button>
          </form>

          <p className="mt-4 text-brand-200 text-sm">Popular: React, Laravel, UX Design, Data Science</p>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-gray-100 py-10">
        <div className="page-container">
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            {STATS.map(({ icon: Icon, label, value }) => (
              <div key={label} className="text-center">
                <div className="flex justify-center mb-2">
                  <div className="w-10 h-10 bg-brand-50 rounded-lg flex items-center justify-center text-brand-600">
                    <Icon size={20} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                <p className="text-sm text-gray-500">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 bg-gray-50">
        <div className="page-container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Browse by Category</h2>
            <p className="text-gray-500">Explore opportunities across top industries</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {CATEGORIES.map(({ icon, name, count }) => (
              <Link
                key={name}
                to={`/jobs?category=${name.toLowerCase()}`}
                className="card p-5 text-center hover:border-brand-300 hover:shadow-md transition-all group cursor-pointer"
              >
                <div className="text-3xl mb-3">{icon}</div>
                <p className="font-medium text-gray-900 text-sm group-hover:text-brand-600 transition">{name}</p>
                <p className="text-xs text-gray-400 mt-1">{count}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-brand-600">
        <div className="page-container text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to hire great talent?</h2>
          <p className="text-brand-100 mb-8 text-lg">Post your job and reach thousands of qualified candidates.</p>
          <div className="flex justify-center gap-4">
            <Link to="/register?role=employer" className="bg-white text-brand-600 font-medium px-6 py-3 rounded-lg hover:bg-brand-50 transition flex items-center gap-2">
              Post a Job <ArrowRight size={16} />
            </Link>
            <Link to="/jobs" className="border border-white/30 text-white font-medium px-6 py-3 rounded-lg hover:bg-white/10 transition">
              Browse Jobs
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

// src/pages/admin/AdminUsersPage.jsx
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../../lib/api'
import { timeAgo } from '../../lib/utils'
import toast from 'react-hot-toast'
import { Search, UserCheck, UserX, Shield, Building2, User, ChevronLeft, ChevronRight } from 'lucide-react'

const roleColors = {
  admin:     'badge-purple',
  employer:  'badge-blue',
  candidate: 'badge-gray',
}

const roleIcons = {
  admin:     Shield,
  employer:  Building2,
  candidate: User,
}

export default function AdminUsersPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [role, setRole] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', { search, role, page }],
    queryFn: () => adminApi.users({ search, role, page }).then(r => r.data),
    keepPreviousData: true,
  })

  const toggleMutation = useMutation({
    mutationFn: (id) => adminApi.toggleUser(id),
    onSuccess: (r) => {
      toast.success(r.data.message)
      qc.invalidateQueries(['admin-users'])
    },
    onError: () => toast.error('Action failed'),
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-500 mt-1">{data?.total || 0} total users</p>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-48 border border-gray-200 rounded-lg px-3 py-2">
          <Search size={15} className="text-gray-400" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search by name or email…"
            className="flex-1 text-sm outline-none"
          />
        </div>
        <div className="flex items-center gap-1.5">
          {['', 'admin', 'employer', 'candidate'].map(r => (
            <button
              key={r}
              onClick={() => { setRole(r); setPage(1) }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition ${
                role === r
                  ? 'bg-brand-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {r || 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-500">User</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Role</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">Joined</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={5} className="px-4 py-3">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
                    </td>
                  </tr>
                ))
              ) : data?.data?.map(user => {
                const RoleIcon = roleIcons[user.role] || User
                return (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-medium text-xs shrink-0">
                          {user.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-gray-400 text-xs">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`${roleColors[user.role] || 'badge-gray'} flex items-center gap-1 w-fit`}>
                        <RoleIcon size={11} />
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-gray-500">
                      {timeAgo(user.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={user.is_active ? 'badge-green' : 'badge-red'}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {user.role !== 'admin' && (
                        <button
                          onClick={() => toggleMutation.mutate(user.id)}
                          disabled={toggleMutation.isPending}
                          className={`btn-ghost text-xs py-1.5 px-2.5 flex items-center gap-1.5 ml-auto ${
                            user.is_active ? 'text-red-500 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'
                          }`}
                        >
                          {user.is_active ? <><UserX size={13} /> Deactivate</> : <><UserCheck size={13} /> Activate</>}
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data?.last_page > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Showing {data.from}–{data.to} of {data.total}
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(p => p - 1)} disabled={page === 1} className="btn-secondary p-1.5">
                <ChevronLeft size={15} />
              </button>
              <span className="text-sm text-gray-600">{page} / {data.last_page}</span>
              <button onClick={() => setPage(p => p + 1)} disabled={page === data.last_page} className="btn-secondary p-1.5">
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

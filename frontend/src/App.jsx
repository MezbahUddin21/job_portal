// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'

// Layouts
import PublicLayout from './layouts/PublicLayout'
import DashboardLayout from './layouts/DashboardLayout'

// Public pages
import HomePage from './pages/public/HomePage'
import JobsPage from './pages/public/JobsPage'
import JobDetailPage from './pages/public/JobDetailPage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'

// Shared dashboard pages
import DashboardHome from './pages/dashboard/DashboardHome'
import ProfilePage from './pages/dashboard/ProfilePage'

// Candidate pages
import MyApplicationsPage from './pages/candidate/MyApplicationsPage'
import SavedJobsPage from './pages/candidate/SavedJobsPage'

// Employer pages
import MyJobsPage from './pages/employer/MyJobsPage'
import CreateJobPage from './pages/employer/CreateJobPage'
import EditJobPage from './pages/employer/EditJobPage'
import JobApplicationsPage from './pages/employer/JobApplicationsPage'

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsersPage from './pages/admin/AdminUsersPage'
import AdminJobsPage from './pages/admin/AdminJobsPage'

// ── Route guards ──────────────────────────────────────────────────────────────
const PrivateRoute = ({ children, roles = [] }) => {
  const { user, isAuthenticated } = useAuthStore()
  if (!isAuthenticated()) return <Navigate to="/login" replace />
  if (roles.length && !roles.includes(user?.role)) return <Navigate to="/dashboard" replace />
  return children
}

const GuestRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated() ? <Navigate to="/dashboard" replace /> : children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Public ─────────────────────────────────────────────────────── */}
        <Route element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="jobs" element={<JobsPage />} />
          <Route path="jobs/:slug" element={<JobDetailPage />} />
        </Route>

        {/* ── Auth ───────────────────────────────────────────────────────── */}
        <Route path="login" element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route path="register" element={<GuestRoute><RegisterPage /></GuestRoute>} />

        {/* ── Dashboard ──────────────────────────────────────────────────── */}
        <Route path="dashboard" element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
          <Route index element={<DashboardHome />} />
          <Route path="profile" element={<ProfilePage />} />

          {/* Candidate */}
          <Route path="applications" element={<PrivateRoute roles={['candidate']}><MyApplicationsPage /></PrivateRoute>} />
          <Route path="saved-jobs"   element={<PrivateRoute roles={['candidate']}><SavedJobsPage /></PrivateRoute>} />

          {/* Employer */}
          <Route path="jobs"             element={<PrivateRoute roles={['employer']}><MyJobsPage /></PrivateRoute>} />
          <Route path="jobs/new"         element={<PrivateRoute roles={['employer']}><CreateJobPage /></PrivateRoute>} />
          <Route path="jobs/:id/edit"    element={<PrivateRoute roles={['employer']}><EditJobPage /></PrivateRoute>} />
          <Route path="jobs/:id/applicants" element={<PrivateRoute roles={['employer']}><JobApplicationsPage /></PrivateRoute>} />

          {/* Admin */}
          <Route path="admin"       element={<PrivateRoute roles={['admin']}><AdminDashboard /></PrivateRoute>} />
          <Route path="admin/users" element={<PrivateRoute roles={['admin']}><AdminUsersPage /></PrivateRoute>} />
          <Route path="admin/jobs"  element={<PrivateRoute roles={['admin']}><AdminJobsPage /></PrivateRoute>} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

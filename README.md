# 🎯 Role-Based Job Portal

A full-stack job portal built with **Laravel 11**, **React 18**, **REST API**, **Tailwind CSS**, and **MySQL**.

---

## 📁 Project Structure

```
job-portal/
├── backend/          # Laravel 11 REST API
│   ├── app/
│   │   ├── Http/Controllers/Api/
│   │   │   ├── AuthController.php        # Register, Login, Logout, Me
│   │   │   ├── JobController.php         # Public + Employer CRUD
│   │   │   ├── ApplicationController.php # Apply, Save, Status updates
│   │   │   ├── ProfileController.php     # User + Company + Candidate profiles
│   │   │   └── AdminController.php       # Admin management
│   │   └── Models/
│   │       ├── User.php
│   │       ├── Job.php
│   │       ├── Application.php
│   │       ├── CompanyProfile.php
│   │       ├── CandidateProfile.php
│   │       └── SavedJob.php
│   ├── database/
│   │   ├── migrations/                   # 5 migration files
│   │   └── seeders/DatabaseSeeder.php    # Full demo data
│   └── routes/api.php                    # All API routes
│
└── frontend/         # React 18 + Tailwind CSS
    └── src/
        ├── App.jsx                       # Router + route guards
        ├── lib/
        │   ├── api.js                    # Axios + all API calls
        │   └── utils.js                  # Helpers, constants
        ├── store/authStore.js            # Zustand auth state
        ├── layouts/
        │   ├── PublicLayout.jsx          # Navbar + footer
        │   └── DashboardLayout.jsx       # Sidebar navigation
        ├── pages/
        │   ├── public/                   # Home, Jobs list, Job detail
        │   ├── auth/                     # Login, Register
        │   ├── dashboard/                # Shared: Overview, Profile
        │   ├── candidate/                # Applications, Saved jobs
        │   ├── employer/                 # My jobs, Create/Edit, Applicants
        │   └── admin/                    # Dashboard, Users, Jobs
        └── components/
            └── JobForm.jsx               # Shared form for Create/Edit
```

---

## 🔐 Roles & Permissions

| Feature                    | Admin | Employer | Candidate | Public |
|----------------------------|:-----:|:--------:|:---------:|:------:|
| Browse & search jobs       | ✅    | ✅       | ✅        | ✅     |
| View job details           | ✅    | ✅       | ✅        | ✅     |
| Apply to jobs              | –     | –        | ✅        | –      |
| Save jobs                  | –     | –        | ✅        | –      |
| View own applications      | –     | –        | ✅        | –      |
| Post jobs                  | –     | ✅       | –         | –      |
| Edit / delete own jobs     | –     | ✅       | –         | –      |
| View applicants            | –     | ✅       | –         | –      |
| Update application status  | –     | ✅       | –         | –      |
| Manage all users           | ✅    | –        | –         | –      |
| Moderate all jobs          | ✅    | –        | –         | –      |
| View platform stats        | ✅    | –        | –         | –      |

---

## 🚀 Setup Instructions

### Prerequisites
- PHP 8.2+, Composer
- Node.js 18+, npm
- MySQL 8.0+

---

### Backend (Laravel)

```bash
cd backend

# 1. Install dependencies
composer install

# 2. Copy environment file
cp .env.example .env

# 3. Generate app key
php artisan key:generate

# 4. Configure database in .env:
#    DB_DATABASE=job_portal
#    DB_USERNAME=root
#    DB_PASSWORD=your_password

# 5. Create the database
mysql -u root -p -e "CREATE DATABASE job_portal CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 6. Run migrations + seed
php artisan migrate --seed

# 7. Create storage symlink
php artisan storage:link

# 8. Start the server
php artisan serve
# → http://localhost:8000
```

---

### Frontend (React)

```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Start dev server
npm run dev
# → http://localhost:5173
```

---

## 🔑 Demo Credentials

| Role      | Email                        | Password   |
|-----------|------------------------------|------------|
| Admin     | admin@jobportal.com          | password   |
| Employer  | techcorpinc@jobportal.com    | password   |
| Candidate | candidate1@jobportal.com     | password   |

---

## 🌐 API Reference

### Auth
```
POST   /api/auth/register          Register (employer or candidate)
POST   /api/auth/login             Login → returns token
POST   /api/auth/logout            Logout (requires auth)
GET    /api/auth/me                Current user info
PUT    /api/auth/change-password   Change password
```

### Jobs (Public)
```
GET    /api/jobs                   List jobs (with filters)
GET    /api/jobs/{slug}            Single job detail
```

### Profile (Authenticated)
```
GET    /api/profile                Get full profile
PUT    /api/profile                Update base info
PUT    /api/profile/company        Update company profile (employer)
PUT    /api/profile/candidate      Update candidate profile
POST   /api/profile/avatar         Upload avatar
```

### Candidate
```
POST   /api/candidate/jobs/{id}/apply    Apply to job
POST   /api/candidate/jobs/{id}/save     Toggle save job
GET    /api/candidate/applications       My applications
GET    /api/candidate/saved-jobs         Saved jobs
```

### Employer
```
GET    /api/employer/jobs                  My job listings
POST   /api/employer/jobs                  Create job
PUT    /api/employer/jobs/{id}             Update job
DELETE /api/employer/jobs/{id}             Delete job
GET    /api/employer/jobs/{id}/applications  Job applicants
PATCH  /api/employer/applications/{id}/status  Update status
```

### Admin
```
GET    /api/admin/stats                        Platform stats
GET    /api/admin/users                        All users
PATCH  /api/admin/users/{id}/toggle-status     Activate/deactivate user
GET    /api/admin/jobs                         All jobs
PATCH  /api/admin/jobs/{id}/status             Change job status
DELETE /api/admin/jobs/{id}                    Delete job
```

---

## 🗄️ Database Schema

```
users                     (id, name, email, password, role, phone, avatar, is_active)
  ├── company_profiles    (id, user_id, company_name, industry, company_size, location, …)
  └── candidate_profiles  (id, user_id, headline, bio, skills[], experience_years, …)

jobs                      (id, user_id, title, slug, description, type, category, location,
                           salary_min, salary_max, experience_level, status, views, …)
  └── applications        (id, job_id, user_id, cover_letter, resume, status, employer_notes)

saved_jobs                (id, user_id, job_id)
personal_access_tokens    (Laravel Sanctum)
```

---

## 🛠 Tech Stack

| Layer      | Technology                                        |
|------------|---------------------------------------------------|
| Backend    | Laravel 11, Laravel Sanctum (token auth)          |
| Database   | MySQL 8, Eloquent ORM                             |
| Frontend   | React 18, React Router 6, Tailwind CSS 3          |
| State      | Zustand (auth), TanStack Query (server state)     |
| Forms      | React Hook Form                                   |
| HTTP       | Axios                                             |
| Build      | Vite 5                                            |

---

## ✨ Key Features

- **Role-based access control** — Admin / Employer / Candidate with route guards
- **JWT-style token auth** via Laravel Sanctum (Bearer tokens)
- **Full job lifecycle** — Draft → Published → Paused → Closed
- **Application pipeline** — Pending → Reviewing → Shortlisted → Hired / Rejected
- **Job search & filters** — keyword, category, type, location, experience, remote, salary
- **Company & candidate profiles** — separate profile types per role
- **Admin moderation** — activate/deactivate users, publish/pause/delete jobs
- **Responsive UI** — works on mobile and desktop
- **Optimistic UI** — TanStack Query cache invalidation for instant feedback

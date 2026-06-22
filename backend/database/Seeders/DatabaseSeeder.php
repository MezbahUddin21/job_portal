<?php

namespace Database\Seeders;

use App\Models\Application;
use App\Models\CandidateProfile;
use App\Models\CompanyProfile;
use App\Models\Job;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ── Admin ──────────────────────────────────────────────────────────────
        $admin = User::create([
            'name'     => 'Admin User',
            'email'    => 'admin@jobportal.com',
            'password' => Hash::make('password'),
            'role'     => 'admin',
        ]);

        // ── Employers ──────────────────────────────────────────────────────────
        $companies = [
            ['TechCorp Inc',      'technology',   'San Francisco, CA'],
            ['HealthFirst',       'healthcare',   'New York, NY'],
            ['GreenBuild Ltd',    'construction', 'Austin, TX'],
            ['FinanceHub',        'finance',      'Chicago, IL'],
            ['EduLearn Online',   'education',    'Remote'],
        ];

        $employers = [];
        foreach ($companies as [$name, $industry, $location]) {
            $employer = User::create([
                'name'     => "HR @ {$name}",
                'email'    => strtolower(Str::slug($name)) . '@jobportal.com',
                'password' => Hash::make('password'),
                'role'     => 'employer',
            ]);
            CompanyProfile::create([
                'user_id'      => $employer->id,
                'company_name' => $name,
                'industry'     => $industry,
                'location'     => $location,
                'description'  => "Leading company in the {$industry} sector.",
                'company_size' => ['1-50', '51-200', '201-500', '500+'][array_rand(['1-50', '51-200', '201-500', '500+'])],
            ]);
            $employers[] = $employer;
        }

        // ── Jobs ───────────────────────────────────────────────────────────────
        $jobTemplates = [
            ['Senior Laravel Developer',    'technology',   'full-time',  'senior',    80000, 120000],
            ['React Frontend Engineer',     'technology',   'full-time',  'mid',       65000,  90000],
            ['DevOps Engineer',             'technology',   'full-time',  'senior',    90000, 130000],
            ['Data Scientist',              'technology',   'full-time',  'mid',       75000, 110000],
            ['UX/UI Designer',              'technology',   'contract',   'junior',    45000,  70000],
            ['Registered Nurse',            'healthcare',   'full-time',  'mid',       55000,  80000],
            ['Financial Analyst',           'finance',      'full-time',  'mid',       60000,  90000],
            ['Online Math Tutor',           'education',    'part-time',  'entry',     20000,  35000],
            ['Civil Engineer',              'construction', 'full-time',  'senior',    70000, 100000],
            ['Marketing Specialist',        'marketing',    'full-time',  'junior',    40000,  60000],
        ];

        $jobs = [];
        foreach ($jobTemplates as $i => [$title, $category, $type, $level, $min, $max]) {
            $employer = $employers[$i % count($employers)];
            $job = Job::create([
                'user_id'          => $employer->id,
                'title'            => $title,
                'slug'             => Str::slug($title) . '-' . Str::random(6),
                'description'      => "We are looking for an experienced {$title} to join our growing team. You will work on exciting projects and collaborate with talented professionals.",
                'requirements'     => "• 3+ years of experience\n• Strong communication skills\n• Bachelor's degree preferred",
                'benefits'         => "• Competitive salary\n• Health insurance\n• Remote work options\n• Annual bonus",
                'type'             => $type,
                'category'         => $category,
                'location'         => 'San Francisco, CA',
                'is_remote'        => $i % 3 === 0,
                'salary_min'       => $min,
                'salary_max'       => $max,
                'currency'         => 'USD',
                'experience_level' => $level,
                'status'           => 'published',
                'expires_at'       => now()->addMonths(2),
            ]);
            $jobs[] = $job;
        }

        // ── Candidates ─────────────────────────────────────────────────────────
        $candidates = [];
        for ($i = 1; $i <= 10; $i++) {
            $candidate = User::create([
                'name'     => "Candidate {$i}",
                'email'    => "candidate{$i}@jobportal.com",
                'password' => Hash::make('password'),
                'role'     => 'candidate',
            ]);
            CandidateProfile::create([
                'user_id'          => $candidate->id,
                'headline'         => 'Software Engineer with 5+ years of experience',
                'bio'              => 'Passionate developer who loves building scalable systems.',
                'location'         => 'San Francisco, CA',
                'experience_years' => '5',
                'expected_salary'  => '90000',
                'availability'     => 'immediately',
                'skills'           => ['PHP', 'Laravel', 'React', 'MySQL', 'Docker'],
            ]);
            $candidates[] = $candidate;
        }

        // ── Sample Applications ────────────────────────────────────────────────
        $statuses = ['pending', 'reviewing', 'shortlisted', 'rejected', 'hired'];
        foreach ($jobs as $job) {
            $applicants = array_slice($candidates, 0, rand(2, 5));
            foreach ($applicants as $candidate) {
                Application::create([
                    'job_id'       => $job->id,
                    'user_id'      => $candidate->id,
                    'cover_letter' => 'I am very interested in this position and believe my skills are a great match.',
                    'status'       => $statuses[array_rand($statuses)],
                ]);
            }
        }

        $this->command->info('✅ Database seeded successfully!');
        $this->command->info('Admin:     admin@jobportal.com / password');
        $this->command->info('Employer:  techcorpinc@jobportal.com / password');
        $this->command->info('Candidate: candidate1@jobportal.com / password');
    }
}

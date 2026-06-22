<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Str;

class Job extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'title', 'slug', 'description', 'requirements',
        'benefits', 'type', 'category', 'location', 'is_remote',
        'salary_min', 'salary_max', 'currency', 'experience_level',
        'status', 'views', 'expires_at',
    ];

    protected function casts(): array
    {
        return [
            'is_remote'  => 'boolean',
            'salary_min' => 'decimal:2',
            'salary_max' => 'decimal:2',
            'expires_at' => 'datetime',
        ];
    }

    protected static function boot(): void
    {
        parent::boot();
        static::creating(function (Job $job) {
            if (empty($job->slug)) {
                $job->slug = Str::slug($job->title) . '-' . Str::random(6);
            }
        });
    }

    // ── Scopes ─────────────────────────────────────────────────────────────────
    public function scopePublished(Builder $q): Builder
    {
        return $q->where('status', 'published');
    }

    public function scopeFilter(Builder $q, array $filters): Builder
    {
        return $q
            ->when($filters['search'] ?? null, fn ($q, $s) =>
                $q->where('title', 'like', "%{$s}%")
                  ->orWhere('description', 'like', "%{$s}%"))
            ->when($filters['category'] ?? null, fn ($q, $c) => $q->where('category', $c))
            ->when($filters['type'] ?? null, fn ($q, $t) => $q->where('type', $t))
            ->when($filters['location'] ?? null, fn ($q, $l) => $q->where('location', 'like', "%{$l}%"))
            ->when($filters['experience_level'] ?? null, fn ($q, $e) => $q->where('experience_level', $e))
            ->when($filters['is_remote'] ?? null, fn ($q) => $q->where('is_remote', true))
            ->when($filters['salary_min'] ?? null, fn ($q, $s) => $q->where('salary_max', '>=', $s));
    }

    // ── Relationships ──────────────────────────────────────────────────────────
    public function employer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function applications(): HasMany
    {
        return $this->hasMany(Application::class);
    }

    public function savedBy(): HasMany
    {
        return $this->hasMany(SavedJob::class);
    }

    // ── Accessors ──────────────────────────────────────────────────────────────
    public function getSalaryRangeAttribute(): string
    {
        if ($this->salary_min && $this->salary_max) {
            return "{$this->currency} " . number_format($this->salary_min) . ' – ' . number_format($this->salary_max);
        }
        return 'Negotiable';
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CandidateProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'bio', 'headline', 'location',
        'experience_years', 'current_salary', 'expected_salary',
        'availability', 'resume', 'skills',
    ];

    protected function casts(): array
    {
        return ['skills' => 'array'];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Application extends Model
{
    use HasFactory;

    protected $fillable = [
        'job_id', 'user_id', 'cover_letter', 'resume', 'status', 'employer_notes',
    ];

    public function job(): BelongsTo   { return $this->belongsTo(Job::class); }
    public function candidate(): BelongsTo { return $this->belongsTo(User::class, 'user_id'); }
}

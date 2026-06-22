<?php
// ─── app/Models/CompanyProfile.php ──────────────────────────────────────────

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class CompanyProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'company_name', 'company_slug', 'description',
        'industry', 'company_size', 'website', 'logo', 'location', 'founded_year',
    ];

    protected static function boot(): void
    {
        parent::boot();
        static::creating(function (CompanyProfile $profile) {
            if (empty($profile->company_slug)) {
                $profile->company_slug = Str::slug($profile->company_name) . '-' . Str::random(4);
            }
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}

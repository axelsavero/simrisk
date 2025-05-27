<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * Relasi yang mendefinisikan peran yang dimiliki user.
     */
    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'hak_akses', 'user_id', 'role_id')
                    ->withTimestamps();
    }       
    

  /**
     * Method bantuan untuk mengecek apakah user memiliki peran tertentu.
     * @param string $roleName
     * @return bool
     */
    public function hasRole(string $roleName): bool
    {
        // Cek di dalam koleksi 'roles' yang dimiliki user,
        // apakah ada yang namanya cocok dengan $roleName.
        return $this->roles->contains('name', $roleName);
    }




    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
}

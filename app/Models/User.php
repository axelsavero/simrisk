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


    /**
     * Method bantuan untuk mengecek apakah user memiliki peran tertentu.
     * @param string $roleName
     * @return bool
     */




    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'unit_id', // jika ingin tetap simpan id
        'unit_nama', // untuk menyimpan nama unit dari API
        'unit_kode', // untuk menyimpan kode unit dari API
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

    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'hak_akses', 'user_id', 'role_id')
            ->withTimestamps();
    }

    /**
     * Cek apakah user memiliki role tertentu
     */
    public function hasRole(string $roleName): bool
    {
        return $this->roles()->where('name', $roleName)->exists();
    }

    /**
     * Cek apakah user memiliki salah satu role dalam array
     */
    public function hasAnyRole(array $roleNames): bool
    {
        return $this->roles()->whereIn('name', $roleNames)->exists();
    }

    /**
     * Cek apakah user dapat mengelola risiko
     */


    /**
     * Cek apakah user dapat memvalidasi risiko
     */
    public function canValidateRisks(): bool
    {
        return $this->hasRole('super-admin', 'owner-risk');
    }

    /**
     * Get semua nama role user sebagai array
     */
    public function getRoleNames(): array
    {
        return $this->roles->pluck('name')->toArray();
    }

    public function canManageRisks(): bool
    {
        return $this->hasAnyRole(['super-admin', 'risk-manager', 'owner-risk']);
    }

    /**
     * Cek apakah user adalah pimpinan
     */
    public function isPimpinan(): bool
    {
        return $this->hasRole('pimpinan');
    }

    /**
     * Relasi ke model Unit
     */
    public function unit()
    {
        return $this->belongsTo(Unit::class, 'unit_id', 'id');
    }
}

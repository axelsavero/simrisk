<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Facades\Auth;

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
        'unit_id',
        'unit',
        'kode_unit',
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
        return $this->hasAnyRole(['super-admin', 'owner-risk']);
    }

    /**
     * Get semua nama role user sebagai array
     */
    public function getRoleNames(): array
    {
        return $this->roles->pluck('name')->toArray();
    }

    /**
     * Role yang sedang "dipakai" (aktif) oleh user pada sesi login saat ini.
     * Untuk akun multi-role, ini menentukan modul/menu apa yang muncul serta
     * bisa diakses selama role tersebut aktif. Bisa diubah lewat toggle role
     * di dashboard (lihat ActiveRoleController).
     */
    public function activeRole(): ?string
    {
        $assignedRoles = $this->getRoleNames();

        if (empty($assignedRoles)) {
            return null;
        }

        if (Auth::check() && Auth::id() === $this->id) {
            $sessionRole = session('active_role');
            if ($sessionRole && in_array($sessionRole, $assignedRoles, true)) {
                return $sessionRole;
            }
        }

        return $assignedRoles[0];
    }

    /**
     * Cek apakah role yang diberikan adalah role AKTIF user saat ini.
     * Berbeda dengan hasRole(), yang hanya mengecek kepemilikan role
     * tanpa memperhatikan role mana yang sedang aktif dipakai.
     */
    public function hasActiveRole(string $roleName): bool
    {
        return $this->activeRole() === $roleName;
    }

    /**
     * Cek apakah role aktif user termasuk dalam daftar role yang diberikan.
     */
    public function hasAnyActiveRole(array $roleNames): bool
    {
        return in_array($this->activeRole(), $roleNames, true);
    }

    public function canManageRisks(): bool
    {
        return $this->hasAnyRole(['super-admin', 'owner-risk']);
    }

    /**
     * Cek apakah user adalah pimpinan
     */
    public function isPimpinan(): bool
    {
        return $this->hasRole('pimpinan');
    }
    public function unit()
    {
        return $this->belongsTo(Unit::class, 'unit_id', 'id_unit');
    }

    /**
     * Accessor untuk unit_name secara konsisten (relasi unit, raw unit column, atau kode_unit)
     */
    public function getUnitNameAttribute(): string
    {
        if ($this->unit_id) {
            $unitRel = $this->unit;
            if ($unitRel && is_object($unitRel) && !empty($unitRel->nama_unit)) {
                return $unitRel->nama_unit;
            }
        }

        $rawUnit = $this->getRawOriginal('unit');
        if (!empty($rawUnit) && is_string($rawUnit)) {
            return $rawUnit;
        }

        if (!empty($this->kode_unit)) {
            return $this->kode_unit;
        }

        return 'Tidak Diketahui';
    }
}

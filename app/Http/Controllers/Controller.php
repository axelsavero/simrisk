<?php

namespace App\Http\Controllers;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Auth;

abstract class Controller
{
    /**
     * Terapkan pembatasan data berdasarkan peran pengguna.
     *
     * Aturan:
     * - super-admin dan pimpinan: melihat semua data (tanpa filter)
     * - admin: data dibatasi ke unit pengguna
     * - owner-risk/ownerrisk: data dibatasi ke user pemilik
     *
     * Opsi:
     * - userColumn: kolom foreign key pengguna pada tabel (default: user_id)
     * - unitColumn: kolom unit pada tabel; jika null dan unitViaUser=true, akan filter via relasi user.unit_id
     * - unitViaUser: jika true, filter unit melalui relasi user (whereHas user.unit_id = current user unit_id)
     * - userRelation: nama relasi ke model User saat unitViaUser=true (default: 'user')
     */
    protected function applyRoleScope(Builder $query, array $options = []): Builder
    {
        $user = Auth::user();

        $userColumn = array_key_exists('userColumn', $options) ? $options['userColumn'] : 'user_id';
        $unitColumn = array_key_exists('unitColumn', $options) ? $options['unitColumn'] : 'unit_id';
        $unitViaUser = array_key_exists('unitViaUser', $options) ? (bool)$options['unitViaUser'] : false;
        $userRelation = array_key_exists('userRelation', $options) ? $options['userRelation'] : 'user';

        if ($this->isSuperOrPimpinan($user)) {
            return $query; // full access
        }

        if ($this->isAdmin($user)) {
            if ($unitViaUser) {
                return $query->whereHas($userRelation, function ($q) use ($user) {
                    $q->where('unit_id', $user->unit_id);
                });
            }

            if (!empty($unitColumn)) {
                return $query->where($unitColumn, $user->unit_id);
            }

            return $query; // fallback tanpa filter jika tidak ada kolom unit
        }

        if ($this->isOwnerRisk($user)) {
            return $query->where($userColumn, $user->id);
        }

        // Default: tidak ada akses tambahan; kembalikan query apa adanya
        return $query;
    }

    protected function isSuperOrPimpinan($user): bool
    {
        return $user && ($user->hasRole('super-admin') || $user->hasRole('pimpinan') || $user->hasRole('super admin'));
    }

    protected function isAdmin($user): bool
    {
        return $user && $user->hasRole('admin');
    }

    protected function isOwnerRisk($user): bool
    {
        return $user && ($user->hasRole('owner-risk') || $user->hasRole('ownerrisk'));
    }
}

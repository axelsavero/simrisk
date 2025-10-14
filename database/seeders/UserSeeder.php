<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Role;
use App\Models\User;
use App\Models\Unit;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // --- 1. Membuat User untuk Role 'Super Admin' ---

        // Cari role 'super admin'
        $superAdminRole = Role::where('name', 'super-admin')->first();

        // Jika rolenya ada, buat user dan pasangkan rolenya
        if ($superAdminRole) {
            $superAdminUser = User::firstOrCreate(
                ['email' => 'superadmin@example.com'],
                [
                    'name' => 'Super Admin User',
                    'password' => Hash::make('password'),
                ]
            );
            $superAdminUser->roles()->sync($superAdminRole->id);
            $this->command->info("User 'Super Admin User' dibuat dan diberi peran 'super admin'.");

            // Cari unit SPI (Satuan Penjamin Internal)
            $spiUnit = Unit::where('nama_unit', 'Satuan Penjamin Internal (SPI)')->first();

            // Tambahkan user Bambang Setiawan Mauludin (super-admin, unit SPI)
            $bambang = User::firstOrCreate(
                ['email' => 'bambang_1512622011@mhs.unj.ac.id'],
                [
                    'name' => 'Bambang Setiawan Mauludin',
                    'password' => Hash::make('password'),
                    'unit_id' => $spiUnit ? $spiUnit->id_unit : null,
                    'unit' => $spiUnit ? $spiUnit->nama_unit : null,
                    'kode_unit' => $spiUnit ? $spiUnit->kode_unit : null,
                ]
            );
            $bambang->roles()->sync($superAdminRole->id);
            $this->command->info("User 'Bambang Setiawan Mauludin' dibuat dan diberi peran 'super admin'.");

            // Tambahkan user Muhammad Axel Saver (super-admin, unit SPI)
            $axel = User::firstOrCreate(
                ['email' => 'MUHAMMAD.AXEL.SAVERO@mhs.unj.ac.id'],
                [
                    'name' => 'Muhammad Axel Savero',
                    'password' => Hash::make('password'),
                    'unit_id' => $spiUnit ? $spiUnit->id_unit : null,
                    'unit' => $spiUnit ? $spiUnit->nama_unit : null,
                    'kode_unit' => $spiUnit ? $spiUnit->kode_unit : null,
                ]
            );
            $axel->roles()->sync($superAdminRole->id);
            $this->command->info("User 'Muhammad Axel Savero' dibuat dan diberi peran 'super admin'.");
        }

        // --- 2. Membuat User untuk Role 'Admin' ---

        // Cari role 'admin'
        $adminRole = Role::where('name', 'admin')->first();

        if ($adminRole) {
            $adminUser = User::firstOrCreate(
                ['email' => 'admin@example.com'],
                [
                    'name' => 'Admin User',
                    'password' => Hash::make('password'),
                ]
            );
            $adminUser->roles()->sync($adminRole->id);
            $this->command->info("User 'Admin User' dibuat dan diberi peran 'admin'.");
        }

        // --- 3. Membuat User untuk Role 'Owner Risk' ---

        // Cari role 'owner risk'
        $ownerRiskRole = Role::where('name', 'owner-risk')->first();

        if ($ownerRiskRole) {
            $ownerRiskUser = User::firstOrCreate(
                ['email' => 'ownerrisk@example.com'],
                [
                    'name' => 'Owner Risk User',
                    'password' => Hash::make('password'),
                ]
            );
            $ownerRiskUser->roles()->sync($ownerRiskRole->id);
            $this->command->info("User 'Owner Risk User' dibuat dan diberi peran 'owner risk'.");
        }

        // --- 4. Membuat User untuk Role 'Pimpinan' ---

        // Cari role 'pimpinan'
        $pimpinanRole = Role::where('name', 'pimpinan')->first();

        if ($pimpinanRole) {
            $pimpinanUser = User::firstOrCreate(
                ['email' => 'pimpinan@example.com'],
                [
                    'name' => 'Pimpinan User',
                    'password' => Hash::make('password'),
                ]
            );
            $pimpinanUser->roles()->sync($pimpinanRole->id);
            $this->command->info("User 'Pimpinan User' dibuat dan diberi peran 'pimpinan'.");
        }
    }
}

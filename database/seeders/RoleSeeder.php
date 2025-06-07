<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Role;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            [
                'name' => 'super-admin',
                'guard_name' => 'web',
                'description' => 'Super Administrator dengan akses penuh ke semua fitur sistem'
            ],
            [
                'name' => 'admin', 
                'guard_name' => 'web',
                'description' => 'Administrator yang dapat mengelola sistem'
            ],
            [
                'name' => 'owner-risk', // 🔥 PERBAIKAN: Konsisten dengan controller
                'guard_name' => 'web',
                'description' => 'Pemilik risiko yang bertanggung jawab atas identifikasi dan pengelolaan risiko'
            ],
           
            [
                'name' => 'pimpinan',
                'guard_name' => 'web',
                'description' => 'Pimpinan yang dapat melihat laporan dan dashboard risiko'
            ],
            
        ];

        foreach ($roles as $roleData) {
            Role::firstOrCreate(
                ['name' => $roleData['name']], // Cari berdasarkan name
                $roleData // Buat dengan semua data jika belum ada
            );
        }
    }
}

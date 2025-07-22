<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        $this->call([
            RoleSeeder::class,
            UserSeeder::class,
            IdentifyRiskSeeder::class,
        ]);

        User::firstOrCreate(
            ['email' => 'test@example.com'], // Atribut untuk mencari user
            [                                 // Atribut untuk membuat user jika tidak ditemukan
                'name' => 'Test User',
                // 'email' => 'test@example.com', 
                'password' => Hash::make('password'), 
                // 'email_verified_at' => now(), // langsung verified
            ]
        );
    }
}

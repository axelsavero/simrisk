<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth; // <-- Wajib untuk mengecek user yang login
use App\Models\User; // <-- Import model User untuk mengambil data

class UserManageController extends Controller
{
    /**
     * Menampilkan halaman manajemen user.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        // === LAPIS KEAMANAN KEDUA: CEK ROLE ===
        // Setelah lolos middleware 'auth', kita cek rolenya secara spesifik.
        if (!Auth::user()->hasRole('super admin')) {
            // Jika bukan super admin, langsung hentikan dengan error 403 (Akses Dilarang)
            abort(403, 'ANDA TIDAK MEMILIKI HAK AKSES UNTUK MELIHAT HALAMAN INI.');
        }
        
        // === JIKA LOLOS, LANJUTKAN PROSES ===

        // Ambil semua data user beserta relasi rolenya.
        // Menggunakan with('roles') agar lebih efisien (menghindari N+1 problem)
        $users = User::with('roles')->get();

        // Kirim data users ke view 'user.manage' dan tampilkan halamannya
        return view('user.manage', [
            'users' => $users
        ]);
    }
}


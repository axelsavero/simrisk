<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth; // <-- mengecek user yang login
use App\Models\User; // <-- Import model User untuk mengambil data
use Illuminate\Support\Facades\Hash; // <-- Import Hash
use Illuminate\Support\Facades\Redirect; // <-- Import Redirect
use Inertia\Inertia; // <-- Import Inertia
use App\Models\Role; // <-- Import Role
use Illuminate\Validation\Rule;

class UserManageController extends Controller
{
    /**
     * Menampilkan halaman manajemen user.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        if (!Auth::user()->hasRole('super-admin')) { // Cek apakah user yang login memiliki role 'super-admin'
            // Jika tidak, tampilkan pesan error 403 Forbidden
            abort(403, 'ANDA TIDAK MEMILIKI HAK AKSES UNTUK MELIHAT HALAMAN INI.');
        }

        // Ambil data user beserta relasi rolenya
        $users = User::with(['roles', 'unit'])->get()->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'unit_nama' => $user->unit?->nama_unit,
                'unit_kode' => $user->unit?->kode_unit,
                'roles' => $user->roles->pluck('name')->toArray(),
            ];
        });

        // Kirim data yang sudah di-transformasi ke komponen Inertia
        return Inertia::render('user/manage', [
            'users' => $users,
        ]);
    }



    public function create()
    {
        if (!Auth::user()->hasRole('super-admin')) {
            abort(403);
        }

        return Inertia::render('user/form', [
            'allRoles' => Role::all()->pluck('name'), // Kirim semua role yang ada
        ]);
    }

    // Method untuk menyimpan data
    public function store(Request $request)
    {
        if (!Auth::user()->hasRole('super-admin')) {
            abort(403);
        }

        // Validasi data
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'roles' => 'required|array',
        ]);

        // Buat user baru
        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'unit_id' => $validated['unit_id'], // tambahkan ini
        ]);

        // Ambil ID dari nama role
        $roleIds = Role::whereIn('name', $validated['roles'])->pluck('id');

        // Pasang role ke user
        $user->roles()->sync($roleIds);

        return Redirect::route('user.manage.index')->with('success', 'User berhasil dibuat.');
    }

    public function edit(User $user)
    {
        if (!Auth::user()->hasRole('super-admin')) {
            abort(403);
        }

        // Muat role yang dimiliki user ini
        $user->load('roles');

        return Inertia::render('user/form', [
            'user' => $user, // Kirim data user yang akan diedit
            'allRoles' => Role::all()->pluck('name'),
        ]);
    }

    // Method untuk menyimpan perubahan
    public function update(Request $request, User $user)
    {
        if (!Auth::user()->hasRole('super-admin')) {
            abort(403);
        }

        // Validasi, email harus unik kecuali untuk user ini sendiri
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'password' => 'nullable|string|min:8', // Password boleh kosong
            'roles' => 'required|array',
        ]);

        // Update data user
        $user->name = $validated['name'];
        $user->email = $validated['email'];
        if ($validated['password']) {
            $user->password = Hash::make($validated['password']);
        }
        $user->save();

        // Update roles
        $roleIds = Role::whereIn('name', $validated['roles'])->pluck('id');
        $user->roles()->sync($roleIds);

        return Redirect::route('user.manage.index')->with('success', 'User berhasil diperbarui.');
    }

    public function destroy(User $user)
    {
        if (!Auth::user()->hasRole('super-admin')) {
            abort(403);
        }

        // Jangan biarkan user menghapus dirinya sendiri
        if (Auth::id() === $user->id) {
            return Redirect::route('user.manage.index')->with('error', 'Anda tidak bisa menghapus diri sendiri.');
        }

        $user->delete();

        return Redirect::route('user.manage.index')->with('success', 'User berhasil dihapus.');
    }
}
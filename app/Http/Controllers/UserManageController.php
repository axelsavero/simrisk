<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth; // <-- mengecek user yang login
use App\Models\User; // <-- Import model User untuk mengambil data
use Illuminate\Support\Facades\Hash; // <-- Import Hash
use Illuminate\Support\Facades\Redirect; // <-- Import Redirect
use Inertia\Inertia; // <-- Import Inertia
use App\Models\Role; // <-- Import Role
use App\Models\Unit;
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
        $users = User::with('roles')->get()->map(function ($user) {
            // return sebuah array 
            // Ambil ID, nama, email, unit, kode_unit dan roles dari user

            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'unit_id' => $user->unit_id,
                'unit' => $user->unit,
                'kode_unit' => $user->kode_unit,
                'roles' => $user->roles->pluck('name')->toArray(), // <-- Ambil nama role sebagai array
            ];
        });

        // Kirim data yang sudah di-transformasi ke komponen Inertia
        return Inertia::render('user/manage', [
            'users' => $users,
        ]);
    }

    public function createOperator()
    {
        $authUser = Auth::user();
        if (!$authUser || !$authUser->hasRole('admin')) {
            abort(403);
        }

        // Kirim hanya role operator untuk pilihan
        return Inertia::render('user/operator-form', [
            'allRoles' => ['operator'],
            'user' => null,
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

    public function editOperator(User $user)
    {
        $authUser = Auth::user();
        if (!$authUser || !$authUser->hasRole('admin')) {
            abort(403);
        }
        // Pastikan hanya bisa edit operator di unit yang sama
        if ($user->unit_id !== $authUser->unit_id || !$user->hasRole('operator')) {
            abort(403);
        }

        $user->load('roles');
        $userData = [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'unit_id' => $user->unit_id,
            'unit' => $user->unit,
            'kode_unit' => $user->kode_unit,
            'roles' => $user->roles->pluck('name')->toArray(),
        ];

        return Inertia::render('user/operator-form', [
            'user' => $userData,
            'allRoles' => ['operator'], // Hanya role operator
        ]);
    }

    public function updateOperator(Request $request, User $user)
    {
        $authUser = Auth::user();
        if (!$authUser || !$authUser->hasRole('admin')) {
            abort(403);
        }
        if ($user->unit_id !== $authUser->unit_id || !$user->hasRole('operator')) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'password' => 'nullable|string|min:8',
        ]);

        $user->name = $validated['name'];
        $user->email = $validated['email'];
        if ($validated['password']) {
            $user->password = Hash::make($validated['password']);
        }
        $user->save();

        // Pastikan role tetap operator
        $roleId = \App\Models\Role::where('name', 'operator')->first()?->id;
        if ($roleId) {
            $user->roles()->sync([$roleId]);
        }

        return redirect()->route('user.operator.index')->with('success', 'User operator berhasil diperbarui.');
    }

    public function storeOperator(Request $request)
    {
        $user = Auth::user();
        if (!$user || !$user->hasRole('admin')) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
        ]);

        // Set unit dan role operator
        $validated['unit_id'] = $user->unit_id;
        $validated['roles'] = json_encode(['operator']);

        User::create($validated);

        return redirect()->route('user.operator.index')->with('success', 'User operator berhasil ditambahkan.');
    }

    public function destroyOperator(User $user)
    {
        $authUser = Auth::user();
        if (!$authUser || !$authUser->hasRole('admin')) {
            abort(403);
        }
        if ($user->unit_id !== $authUser->unit_id || !$user->hasRole('operator')) {
            abort(403);
        }
        if ($authUser->id === $user->id) {
            return redirect()->route('user.operator.index')->with('error', 'Anda tidak bisa menghapus diri sendiri.');
        }

        $user->delete();

        return redirect()->route('user.operator.index')->with('success', 'User operator berhasil dihapus.');
    }

    // Method untuk menyimpan data

    public function store(Request $request)
    {
        if (!Auth::user()->hasRole('super-admin')) {
            abort(403);
        }

        // Validasi data
        $validated = $request->validate([
            'unit_id' => 'required|string',
            'unit' => 'required|string',
            'kode_unit' => 'nullable|string',
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role' => 'required|string',
        ]);

        // Simpan unit ke tabel unit jika belum ada
        Unit::firstOrCreate(
            ['id_unit' => $validated['unit_id']],
            ['nama_unit' => $validated['unit'], 'kode_unit' => '']
        );

        // Buat user baru
        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'unit_id' => $validated['unit_id'],
            'unit' => $validated['unit'],
        ]);

        // Role
        $roleId = Role::where('name', $validated['role'])->first()?->id;
        if ($roleId) {
            $user->roles()->sync([$roleId]);
        }

        return Redirect::route('user.manage.index')->with('success', 'User berhasil dibuat.');
    }

    public function edit(User $user)
    {
        if (!Auth::user()->hasRole('super-admin')) {
            abort(403);
        }

        // Muat role yang dimiliki user ini
        $user->load('roles');

        // Format data user untuk frontend
        $userData = [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'unit_id' => $user->unit_id,
            'unit' => $user->unit,
            'kode_unit' => $user->kode_unit,
            'roles' => $user->roles->pluck('name')->toArray(),
        ];

        return Inertia::render('user/form', [
            'user' => $userData, // Kirim data user yang akan diedit
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
            'unit_id' => 'required|string',
            'name' => 'required|string|max:255',
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'password' => 'nullable|string|min:8', // Password boleh kosong
            'role' => 'required|string',
        ]);

        // Update data user
        $user->name = $validated['name'];
        $user->email = $validated['email'];
        $user->unit_id = $validated['unit_id'];
        $user->unit = $request->input('unit');
        $user->kode_unit = $request->input('kode_unit');

        if ($validated['password']) {
            $user->password = Hash::make($validated['password']);
        }
        $user->save();

        // Update role (single role)
        $roleId = Role::where('name', $validated['role'])->first()?->id;

        if ($roleId) {
            $user->roles()->sync([$roleId]);
        }

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

    public function operatorIndex()
    {
        $user = Auth::user();

        // Hanya admin yang bisa akses
        if (!$user || !$user->hasRole('admin')) {
            abort(403);
        }

        // Ambil user operator di unit yang sama menggunakan relasi roles
        $users = User::whereHas('roles', function ($q) {
            $q->where('name', 'operator');
        })
            ->where('unit_id', $user->unit_id)
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'unit_id' => $user->unit_id,
                    'unit' => $user->unit,
                    'kode_unit' => $user->kode_unit,
                    'roles' => $user->roles->pluck('name')->toArray(),
                ];
            });

        return Inertia::render('user/operator', [
            'users' => $users,
        ]);
    }
}
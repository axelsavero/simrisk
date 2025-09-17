<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use App\Models\Role;
use App\Models\Unit;
use Illuminate\Validation\Rule;

class UserManageController extends Controller
{
    public function index()
    {
        if (!Auth::user()->hasRole('super-admin')) {
            abort(403, 'ANDA TIDAK MEMILIKI HAK AKSES UNTUK MELIHAT HALAMAN INI.');
        }

        $users = User::with('roles')->get()->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'unit_id' => $user->unit_id,
                'unit' => $user->unit, // Tetap gunakan 'unit' jika ada di model
                'kode_unit' => $user->kode_unit,
                'roles' => $user->roles->pluck('name')->toArray(),
            ];
        });

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

        return Inertia::render('user/operator-form', [
            'auth' => ['user' => $authUser], // Pastikan auth dikirim
            'allRoles' => ['owner-risk'],
            'user' => null,
        ]);
    }

    public function create()
    {
        if (!Auth::user()->hasRole('super-admin')) {
            abort(403);
        }

        return Inertia::render('user/form', [
            'allRoles' => Role::all()->pluck('name'),
        ]);
    }

    public function editOperator(User $user)
    {
        $authUser = Auth::user();
        if (!$authUser || !$authUser->hasRole('admin')) {
            abort(403);
        }
        if ($user->unit_id !== $authUser->unit_id || !$user->hasRole('owner-risk')) {
            abort(403);
        }

        $user->load('roles');
        $userData = [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'unit_id' => $user->unit_id,
            'unit' => $user->unit, // Ganti unit_kerja dengan unit jika ada
            'kode_unit' => $user->kode_unit,
            'roles' => $user->roles->pluck('name')->toArray(),
        ];

        return Inertia::render('user/operator-form', [
            'auth' => ['user' => $authUser], // Pastikan auth dikirim
            'user' => $userData,
            'allRoles' => ['owner-risk'],
        ]);
    }

    public function updateOperator(Request $request, User $user)
    {
        $authUser = Auth::user();
        if (!$authUser || !$authUser->hasRole('admin')) {
            abort(403);
        }
        if ($user->unit_id !== $authUser->unit_id || !$user->hasRole('owner-risk')) {
            abort(403);
        }

        \Log::info('Update operator request: ', $request->all());

        $validated = $request->validate([
            'unit_id' => 'required|integer|exists:unit,id_unit',
            'name' => 'required|string|max:255',
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'password' => 'nullable|string|min:8',
            'role' => 'required|string|in:owner-risk',
        ]);

        $user->name = $validated['name'];
        $user->email = $validated['email'];
        $user->unit_id = $validated['unit_id'];
        // Hapus unit_kerja, gunakan unit jika ada, atau abaikan jika tidak relevan
        if (isset($user->unit)) {
            $user->unit = Unit::find($validated['unit_id'])->nama_unit ?? $user->unit;
        }
        if ($validated['password']) {
            $user->password = Hash::make($validated['password']);
        }
        $user->save();

        \Log::info('Updated user unit_id: ' . $user->unit_id);

        $roleId = Role::where('name', 'owner-risk')->first()?->id;
        if ($roleId) {
            $user->roles()->sync([$roleId]);
        } else {
            throw new \Exception('Role "owner-risk" tidak ditemukan.');
        }

        return redirect()->route('user.operator.index')->with('success', 'User operator berhasil diperbarui.');
    }

    public function storeOperator(Request $request)
    {
        $authUser = Auth::user();
        if (!$authUser || !$authUser->hasRole('admin')) {
            abort(403);
        }

        \Log::info('Store operator request: ', $request->all());

        $validated = $request->validate([
            'unit_id' => 'required|integer|exists:unit,id_unit',
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'role' => 'required|string|in:owner-risk',
        ]);

        $unitName = Unit::find($validated['unit_id'])->nama_unit ?? 'Unit Tidak Diketahui'; // Ambil nama_unit dari unit_id

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'unit_id' => $validated['unit_id'],
            'unit' => $unitName, // Ganti unit_kerja dengan nama_unit dari tabel unit
        ]);

        \Log::info('Created user with unit_id: ' . $user->unit_id);

        $roleId = Role::where('name', 'owner-risk')->first()?->id;
        if ($roleId) {
            $user->roles()->sync([$roleId]);
        } else {
            throw new \Exception('Role "owner-risk" tidak ditemukan.');
        }

        return redirect()->route('user.operator.index')->with('success', 'User operator berhasil ditambahkan.');
    }

    public function destroyOperator(User $user)
    {
        $authUser = Auth::user();
        if (!$authUser || !$authUser->hasRole('admin')) {
            abort(403);
        }
        if ($user->unit_id !== $authUser->unit_id || !$user->hasRole('owner-risk')) {
            abort(403);
        }
        if ($authUser->id === $user->id) {
            return redirect()->route('user.operator.index')->with('error', 'Anda tidak bisa menghapus diri sendiri.');
        }

        $user->delete();

        return redirect()->route('user.operator.index')->with('success', 'User operator berhasil dihapus.');
    }

    public function store(Request $request)
    {
        if (!Auth::user()->hasRole('super-admin')) {
            abort(403);
        }

        \Log::info('Store request data: ', $request->all());

        $validated = $request->validate([
            'unit_id' => 'required|integer|exists:unit,id_unit',
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role' => 'required|string|in:admin,super-admin',
        ], [
            'unit_id.exists' => 'Unit ID yang dipilih tidak valid. Pastikan unit ada di database. Unit ID diterima: :input',
        ]);

        $unitName = Unit::find($validated['unit_id'])->nama_unit ?? 'Unit Tidak Diketahui'; // Ambil nama_unit

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'unit_id' => $validated['unit_id'],
            'unit' => $unitName, // Ganti unit_kerja dengan nama_unit
        ]);

        \Log::info('Created user with unit_id: ' . $user->unit_id);

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

        $user->load('roles');
        $userData = [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'unit_id' => $user->unit_id,
            'unit' => $user->unit, // Ganti unit_kerja dengan unit jika ada
            'kode_unit' => $user->kode_unit,
            'roles' => $user->roles->pluck('name')->toArray(),
        ];

        return Inertia::render('user/form', [
            'user' => $userData,
            'allRoles' => Role::all()->pluck('name'),
        ]);
    }

    public function update(Request $request, User $user)
    {
        if (!Auth::user()->hasRole('super-admin')) {
            abort(403);
        }

        \Log::info('Update request data: ', $request->all());

        $validated = $request->validate([
            'unit_id' => 'required|integer|exists:unit,id_unit',
            'name' => 'required|string|max:255',
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'password' => 'nullable|string|min:8',
            'role' => 'required|string',
        ]);

        $unitName = Unit::find($validated['unit_id'])->nama_unit ?? $user->unit; // Ambil nama_unit

        $user->name = $validated['name'];
        $user->email = $validated['email'];
        $user->unit_id = $validated['unit_id'];
        $user->unit = $unitName; // Ganti unit_kerja dengan nama_unit
        if ($validated['password']) {
            $user->password = Hash::make($validated['password']);
        }
        $user->save();

        \Log::info('Updated user with unit_id: ' . $user->unit_id);

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

        if (Auth::id() === $user->id) {
            return Redirect::route('user.manage.index')->with('error', 'Anda tidak bisa menghapus diri sendiri.');
        }

        $user->delete();

        return Redirect::route('user.manage.index')->with('success', 'User berhasil dihapus.');
    }

    public function operatorIndex()
    {
        $user = Auth::user();

        if (!$user || !$user->hasRole('admin')) {
            abort(403);
        }

        $users = User::whereHas('roles', function ($q) {
            $q->where('name', 'owner-risk');
        })
            ->where('unit_id', $user->unit_id)
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'unit_id' => $user->unit_id,
                    'unit' => $user->unit, // Ganti unit_kerja dengan unit
                    'kode_unit' => $user->kode_unit,
                    'roles' => $user->roles->pluck('name')->toArray(),
                ];
            });

        return Inertia::render('user/operator', [
            'users' => $users,
        ]);
    }
}

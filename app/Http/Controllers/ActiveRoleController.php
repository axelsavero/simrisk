<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ActiveRoleController extends Controller
{
    public function update(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'role' => 'required|string',
        ]);

        if (!in_array($validated['role'], $user->getRoleNames(), true)) {
            abort(403, 'Role tersebut tidak dimiliki oleh akun Anda.');
        }

        $request->session()->put('active_role', $validated['role']);

        return back()->with('success', 'Role aktif berhasil diubah.');
    }
}

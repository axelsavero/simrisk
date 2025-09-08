<?php

namespace App\Http\Controllers;

use App\Models\Unit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class UnitController extends Controller
{
    public function index()
    {
        try {
            $units = Unit::where('status', 'aktif')->get();
            
            return response()->json([
                'success' => true,
                'units' => $units->map(function ($unit) {
                    return [
                        'id' => $unit->id_unit,
                        'kode_unit' => $unit->kode_unit,
                        'nama_unit' => $unit->nama_unit,
                        'jenis_unit' => $unit->jenis_unit,
                        'level_unit' => $unit->level_unit,
                    ];
                })
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching units', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'error' => 'Gagal mengambil data unit',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $unit = Unit::findOrFail($id);
            
            return response()->json([
                'success' => true,
                'unit' => [
                    'id' => $unit->id_unit,
                    'kode_unit' => $unit->kode_unit,
                    'nama_unit' => $unit->nama_unit,
                    'jenis_unit' => $unit->jenis_unit,
                    'level_unit' => $unit->level_unit,
                    'parent_unit_id' => $unit->parent_unit_id,
                    'kepala_unit' => $unit->kepala_unit,
                    'email' => $unit->email,
                    'telepon' => $unit->telepon,
                    'alamat' => $unit->alamat,
                    'visi' => $unit->visi,
                    'misi' => $unit->misi,
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching unit details', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'error' => 'Gagal mengambil detail unit',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\Risk;
use Illuminate\Http\Request;

class RiskController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $risks = Risk::all();
        return view('risks.index', compact('risks'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return view('risks.create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
            // Validasi input untuk semua field yang diperlukan
            $validated = $request->validate([
                'risk_id' => 'required|string|max:255',
                'status' => 'required|boolean',
                'risk_category' => 'required|string|max:255',
                'identification_date_start' => 'nullable|date',
                'identification_date_end' => 'nullable|date',
                'description' => 'required|string',
                'probability' => 'required|integer|between:1,5',
                'impact' => 'required|integer|between:1,5',
            ]);

            // Hitung level sebagai hasil perkalian antara probability dan impact
            $level = $request->probability * $request->impact;

            // Simpan data risiko dengan level yang sudah dihitung
            $risk = new Risk();
            $risk->risk_id = $request->input('risk_id');
            $risk->status = (bool) $request->input('status');
            $risk->risk_category = $request->input('risk_category');
            $risk->description = $request->input('description');
            $risk->probability = $request->input('probability');
            $risk->impact = $request->input('impact');
            $risk->level = $level;  // Menyimpan hasil perkalian ke kolom level
            $risk->identification_date_start = $request->input('identification_date_start');
            $risk->identification_date_end = $request->input('identification_date_end');
            $risk->save();

            return redirect()->route('risks.index')->with('success', 'resiko berhasil dibuat.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Risk $risk)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Risk $risk)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Risk $risk)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Risk $risk)
    {
        //
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\RiskReference;
use Inertia\Inertia;
use Inertia\Response;

class ReferensiController extends Controller
{
    public function index(): Response
    {
        $kategori = RiskReference::kategori()->get();
        $kriteria = RiskReference::kriteria()->get();

        return Inertia::render('referensi/index', [
            'kategori' => $kategori,
            'kriteria' => $kriteria,
        ]);
    }
}

<!DOCTYPE html>
<html>
<head>
    <title>Laporan Risiko</title>
    <style>
        body { font-family: 'Helvetica', sans-serif; font-size: 8px; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th, td { border: 1px solid #666; padding: 4px; text-align: left; vertical-align: top; }
        th { background-color: #f2f2f2; font-weight: bold; text-align: center; }
        .page-break { page-break-after: always; }
        .header { text-align: center; margin-bottom: 20px; }
        .header h3 { margin: 0; }
        .signature-block { margin-top: 30px; page-break-inside: avoid; }
        .signature-table { width: 30%; margin-left: 70%; border: none; }
        .signature-table td { border: none; text-align: center; }
        .signer { margin-top: 40px; }
    </style>
</head>
<body>
    <div class="header">
        <h3>LAPORAN DETAIL RISIKO</h3>
        {{-- Anda bisa menambahkan nama institusi di sini --}}
    </div>
    <table>
        <thead>
            <tr>
                <th rowspan="2">NO.</th>
                <th rowspan="2">KODE RISIKO</th>
                <th rowspan="2">DESKRIPSI ATAU KEJADIAN RISIKO</th>
                <th rowspan="2">PENANGANAN RISIKO</th>
                <th colspan="2">JADWAL PELAKSANAAN</th>
                <th colspan="2">BIAYA (RP)</th>
                <th rowspan="2">VARIANS BIAYA</th>
                <th rowspan="2">STATUS PENGENDALIAN</th>
                <th rowspan="2">PEMILIK RISIKO</th>
                <th rowspan="2">UNIT</th>
                <th rowspan="2">REKOMENDASI</th>
            </tr>
            <tr>
                <th>MULAI</th>
                <th>SELESAI</th>
                <th>RENCANA</th>
                <th>REALISASI</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($risks as $index => $risk)
                <tr>
                    <td style="text-align: center;">{{ $index + 1 }}</td>
                    <td>{{ $risk->kode_risiko }}</td>
                    <td>{{ $risk->deskripsi }}</td>
                    <td style="white-space: pre-wrap;">{{ $risk->penanganan }}</td>
                    <td style="text-align: center;">{{ $risk->jadwal_mulai }}</td>
                    <td style="text-align: center;">{{ $risk->jadwal_selesai }}</td>
                    <td style="text-align: right;">{{ number_format($risk->rencana, 0, ',', '.') }}</td>
                    <td style="text-align: right;">{{ number_format($risk->realisasi, 0, ',', '.') }}</td>
                    <td style="text-align: center;">{{ $risk->varian }}</td>
                    <td style="text-align: center;">{{ $risk->status }}</td>
                    <td>{{ $risk->pemilik }}</td>
                    <td>{{ $risk->unit }}</td>
                    <td>{{ $risk->rekomendasi }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="13" style="text-align: center;">Tidak ada data.</td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <div class="signature-block">
        <table class="signature-table">
            <tr><td>Jakarta, {{ $tanggal }}</td></tr>
            <tr><td>{{ $signature['jabatan'] }}</td></tr>
            <tr><td style="height: 50px;"></td></tr>
            <tr><td><strong><u>{{ $signature['nama'] }}</u></strong></td></tr>
            <tr><td>NIP. {{ $signature['nip'] }}</td></tr>
        </table>
    </div>
</body>
</html>
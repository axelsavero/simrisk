<?php

namespace App\Exports;

use Maatwebsite\Excel\Events\AfterSheet;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class RiskReportExport implements FromCollection, WithHeadings, WithEvents, ShouldAutoSize, WithStyles
{
    protected $data;
    protected $signature;

    public function __construct($data, $signature)
    {
        // Beri nomor urut pada data
        $this->data = $data->map(function ($item, $key) {
            $item->no = $key + 1;
            return $item;
        });
        $this->signature = $signature;
    }

    public function collection()
    {
        return $this->data;
    }

    public function headings(): array
    {
        // Mengembalikan array 2 dimensi untuk header multi-baris
        return [
            ['LAPORAN DETAIL RISIKO'], // Baris Judul
            [
                'NO.',
                'KODE RISIKO',
                'DESKRIPSI ATAU KEJADIAN RISIKO',
                'PENANGANAN RISIKO',
                'JADWAL PELAKSANAAN', // Akan di-merge
                '',
                'BIAYA PENANGANAN RISIKO (RP)', // Akan di-merge
                '',
                'VARIANS BIAYA',
                'STATUS PENGENDALIAN',
                'PEMILIK RISIKO',
                'UNIT',
                'REKOMENDASI / TINDAKAN LEBIH LANJUT',
            ],
            [
                '', '', '', '',
                'MULAI', 'SELESAI', 'RENCANA', 'REALISASI',
                '', '', '', '', '',
            ]
        ];
    }

    public function styles(Worksheet $sheet)
    {
        // Style untuk semua sel, termasuk wrap text
        $sheet->getStyle('A1:' . $sheet->getHighestColumn() . $sheet->getHighestRow())
              ->getAlignment()->setWrapText(true)->setVertical(Alignment::VERTICAL_TOP);
        
        // Style untuk header
        $sheet->getStyle('A1:M3')->getFont()->setBold(true);
        $sheet->getStyle('A1:M3')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER)->setVertical(Alignment::VERTICAL_CENTER);

        // Merge sel untuk judul utama
        $sheet->mergeCells('A1:M1');
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function(AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();
                
                // Merge sel untuk header
                $sheet->mergeCells('A2:A3');
                $sheet->mergeCells('B2:B3');
                $sheet->mergeCells('C2:C3');
                $sheet->mergeCells('D2:D3');
                $sheet->mergeCells('E2:F2'); // JADWAL PELAKSANAAN
                $sheet->mergeCells('G2:H2'); // BIAYA PENANGANAN
                $sheet->mergeCells('I2:I3');
                $sheet->mergeCells('J2:J3');
                $sheet->mergeCells('K2:K3');
                $sheet->mergeCells('L2:L3');
                $sheet->mergeCells('M2:M3');
                
                // Blok Tanda Tangan
                $lastRow = $sheet->getHighestRow();
                $lastCol = 'M'; // Kolom terakhir
                $startRow = $lastRow + 3;

                $sheet->setCellValue("{$lastCol}{$startRow}", 'Jakarta, ' . now()->isoFormat('D MMMM YYYY'));
                $sheet->setCellValue("{$lastCol}".($startRow + 1), $this->signature['jabatan']);
                $sheet->setCellValue("{$lastCol}".($startRow + 4), $this->signature['nama']);
                $sheet->setCellValue("{$lastCol}".($startRow + 5), 'NIP. ' . $this->signature['nip']);

                // Alignment untuk blok tanda tangan
                $sheet->getStyle("{$lastCol}{$startRow}:{$lastCol}".($startRow + 5))->getAlignment()->setHorizontal('left');
            },
        ];
    }
}
<?php
// app/Models/SasaranUniv.php (UPDATE YANG SUDAH ADA)

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;

class SasaranUniv extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'sasaran_univ';
    protected $primaryKey = 'id_sasaran_univ';

    protected $fillable = [
        'kode_sasaran', 'nama_sasaran', 'deskripsi',
        'target_capaian', 'satuan_target', 'periode_tahun',
        'tanggal_mulai', 'tanggal_selesai', 'bobot_penilaian',
        'prioritas', 'kategori', 'status', 'pic_sasaran',
        'dokumen_data', 
    ];

    protected $casts = [
        'tanggal_mulai' => 'date',
        'tanggal_selesai' => 'date',
        'target_capaian' => 'decimal:2',
        'bobot_penilaian' => 'decimal:2',
        'periode_tahun' => 'integer',
        'dokumen_data' => 'array', /
        'deleted_at' => 'datetime',
    ];


    /**
     * Tambah dokumen baru ke JSON array
     */
    public function addDokumen(array $dokumenData): void
    {
        $currentDokumen = $this->dokumen_data ?? [];
        
        // Add metadata
        $dokumenData['id'] = uniqid('dok_', true);
        $dokumenData['uploaded_at'] = now()->toISOString();
        
        // Add to array
        $currentDokumen[] = $dokumenData;
        
        $this->update(['dokumen_data' => $currentDokumen]);
    }

    /**
     * Hapus dokumen dari JSON array
     */
    public function removeDokumen(string $dokumenId): bool
    {
        $currentDokumen = $this->dokumen_data ?? [];
        
        $filteredDokumen = array_filter($currentDokumen, function($dok) use ($dokumenId) {
            return $dok['id'] !== $dokumenId;
        });
        
        $this->update(['dokumen_data' => array_values($filteredDokumen)]);
        
        return true;
    }

    /**
     * Get dokumen by ID
     */
    public function getDokumen(string $dokumenId): ?array
    {
        $dokumen = $this->dokumen_data ?? [];
        
        foreach ($dokumen as $dok) {
            if ($dok['id'] === $dokumenId) {
                return $dok;
            }
        }
        
        return null;
    }

    /**
     * Get formatted dokumen data untuk frontend
     */
    public function getDokumenFormattedAttribute(): array
    {
        $dokumen = $this->dokumen_data ?? [];
        
        return array_map(function($dok) {
            return [
                'id' => $dok['id'] ?? uniqid(),
                'nama_dokumen' => $dok['nama_dokumen'] ?? 'Untitled',
                'nomor_dokumen' => $dok['nomor_dokumen'] ?? '',
                'tanggal_dokumen' => $dok['tanggal_dokumen'] ?? '',
                'file_path' => $dok['file_path'] ?? '',
                'file_name' => $dok['file_name'] ?? '',
                'file_size' => $dok['file_size'] ?? 0,
                'file_size_formatted' => $this->formatFileSize($dok['file_size'] ?? 0),
                'file_extension' => $dok['file_extension'] ?? '',
                'file_icon' => $this->getFileIcon($dok['file_extension'] ?? ''),
                'keterangan' => $dok['keterangan'] ?? '',
                'uploaded_by' => $dok['uploaded_by'] ?? 'Unknown',
                'uploaded_at' => $dok['uploaded_at'] ?? now()->toISOString(),
                'download_url' => route('sasaran-univ.download-dokumen', [
                    'sasaranUniv' => $this->id_sasaran_univ,
                    'dokumenId' => $dok['id'] ?? ''
                ]),
            ];
        }, $dokumen);
    }

    // Helper methods
    private function formatFileSize(int $bytes): string
    {
        $units = ['B', 'KB', 'MB', 'GB'];
        
        for ($i = 0; $bytes > 1024 && $i < 3; $i++) {
            $bytes /= 1024;
        }
        
        return round($bytes, 2) . ' ' . $units[$i];
    }

    private function getFileIcon(string $extension): string
    {
        return match(strtolower($extension)) {
            'pdf' => '📄',
            'doc', 'docx' => '📝',
            'xls', 'xlsx' => '📊',
            'ppt', 'pptx' => '📋',
            'jpg', 'jpeg', 'png', 'gif' => '🖼️',
            default => '📎'
        };
    }

    /**
     * Get total dokumen
     */
    public function getTotalDokumenAttribute(): int
    {
        return count($this->dokumen_data ?? []);
    }

    // Existing methods...
    public function sasaranUnits(): HasMany
    {
        return $this->hasMany(SasaranUnit::class, 'id_sasaran_univ');
    }
}

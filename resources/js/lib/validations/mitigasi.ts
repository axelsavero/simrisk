import { z } from 'zod';

export const mitigasiFormSchema = z.object({
    identify_risk_id: z.string().min(1, 'Risiko terkait harus dipilih'),
    judul_mitigasi: z.string().min(1, 'Judul mitigasi harus diisi').max(255),
    deskripsi_mitigasi: z.string().min(1, 'Deskripsi mitigasi harus diisi'),
    strategi_mitigasi: z.enum(['avoid', 'reduce', 'transfer', 'accept'], {
        message: 'Strategi mitigasi harus dipilih',
    }),
    pic_mitigasi: z.string().min(1, 'PIC harus diisi').max(255),
    target_selesai: z.string().min(1, 'Target selesai harus diisi'),
    biaya_mitigasi: z.string().refine((v) => v === '' || !isNaN(Number(v)), 'Biaya mitigasi harus berupa angka'),
    status_mitigasi: z.enum(['belum_dimulai', 'sedang_berjalan', 'selesai', 'tertunda', 'dibatalkan']),
    progress_percentage: z.number().int().min(0).max(100),
    probability: z.number().int().min(1).max(5),
    impact: z.number().int().min(1).max(5),
    catatan_progress: z.string(),
    evaluasi_efektivitas: z.string(),
    rekomendasi_lanjutan: z.string(),
});

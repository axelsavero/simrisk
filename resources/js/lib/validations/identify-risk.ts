import { z } from 'zod';

const descriptionItemSchema = z.object({
    description: z.string().min(1, 'Deskripsi harus diisi').max(1000, 'Deskripsi maksimal 1000 karakter'),
});

export const identifyRiskFormSchema = z
    .object({
        id_identify: z.string().min(1, 'Kode risiko harus diisi').max(255),
        risk_category: z.string().min(1, 'Kategori risiko harus dipilih'),
        identification_date_start: z.string().min(1, 'Tanggal mulai harus diisi'),
        identification_date_end: z.string().min(1, 'Tanggal selesai harus diisi'),
        description: z.string().min(1, 'Deskripsi risiko harus diisi'),
        nama_risiko: z.string().min(1, 'Nama risiko harus diisi').max(255),
        jabatan_risiko: z.string().min(1, 'Jabatan risiko harus diisi').max(255),
        no_kontak: z.string().min(1, 'No kontak harus diisi').max(255),
        strategi: z.string().min(1, 'Strategi harus diisi').max(255),
        pengendalian_internal: z.string().min(1, 'Pengendalian internal harus dipilih').max(255),
        biaya_penangan: z.string().refine((v) => v === '' || !isNaN(Number(v)), 'Biaya penanganan harus berupa angka'),
        probability: z.number().int().min(1).max(5),
        impact: z.number().int().min(1).max(5),
        penyebab: z.array(descriptionItemSchema).min(1, 'Minimal 1 penyebab harus diisi'),
        dampak_kualitatif: z.array(descriptionItemSchema).min(1, 'Minimal 1 dampak kualitatif harus diisi'),
        penanganan_risiko: z.array(descriptionItemSchema).min(1, 'Minimal 1 penanganan risiko harus diisi'),
    })
    .refine((data) => data.identification_date_end >= data.identification_date_start, {
        message: 'Tanggal selesai harus sama atau setelah tanggal mulai',
        path: ['identification_date_end'],
    });

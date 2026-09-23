import { z } from 'zod';

export const sasaranUnitFormSchema = z.object({
    id_sasaran_univ: z.union([z.number(), z.literal('')]).refine((v) => v !== '', 'Sasaran universitas harus dipilih'),
    kategori: z.string().min(1, 'Kategori dokumen harus dipilih').max(255),
    nama_dokumen: z.string().max(255).optional().or(z.literal('')),
    nomor_dokumen: z.string().max(255).optional().or(z.literal('')),
    tanggal_dokumen: z.string().optional().or(z.literal('')),
});

export const sasaranUnivFormSchema = z.object({
    kategori: z.string().min(1, 'Kategori dokumen harus dipilih').max(255),
    nama_dokumen: z.string().max(255).optional().or(z.literal('')),
    nomor_dokumen: z.string().max(255).optional().or(z.literal('')),
    tanggal_dokumen: z.string().optional().or(z.literal('')),
});

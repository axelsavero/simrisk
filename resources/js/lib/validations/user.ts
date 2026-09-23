import { z } from 'zod';

export const userFormSchema = z.object({
    unit_id: z.string().min(1, 'Unit harus dipilih'),
    unit: z.string().min(1, 'Unit harus dipilih'),
    name: z.string().min(1, 'Nama harus diisi'),
    email: z
        .string()
        .min(1, 'Email harus diisi')
        .email('Format email tidak valid')
        .endsWith('@unj.ac.id', 'Domain email harus @unj.ac.id'),
    password: z.string(),
    roles: z.array(z.string()).min(1, 'Pilih minimal satu role'),
});

export const userCreateFormSchema = userFormSchema.extend({
    password: z.string().min(8, 'Password minimal 8 karakter'),
});

export const operatorFormSchema = z.object({
    unit_id: z.string().min(1, 'Unit harus dipilih'),
    unit: z.string().min(1, 'Unit harus dipilih'),
    name: z.string().min(1, 'Nama harus diisi'),
    email: z
        .string()
        .min(1, 'Email harus diisi')
        .email('Format email tidak valid')
        .endsWith('@unj.ac.id', 'Domain email harus @unj.ac.id'),
    password: z.string(),
    role: z.literal('owner-risk'),
});

export const operatorCreateFormSchema = operatorFormSchema.extend({
    password: z.string().min(8, 'Password minimal 8 karakter'),
});

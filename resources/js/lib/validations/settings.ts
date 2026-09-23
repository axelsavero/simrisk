import { z } from 'zod';

export const profileFormSchema = z.object({
    name: z.string().min(1, 'Nama harus diisi'),
    email: z.string().min(1, 'Email harus diisi').email('Format email tidak valid'),
});

export const passwordFormSchema = z
    .object({
        current_password: z.string().min(1, 'Password saat ini harus diisi'),
        password: z.string().min(8, 'Password minimal 8 karakter'),
        password_confirmation: z.string().min(1, 'Konfirmasi password harus diisi'),
    })
    .refine((data) => data.password === data.password_confirmation, {
        message: 'Konfirmasi password tidak sama',
        path: ['password_confirmation'],
    });

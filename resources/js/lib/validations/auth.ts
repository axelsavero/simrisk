import { z } from 'zod';

export const loginFormSchema = z.object({
    email: z.string().min(1, 'Email harus diisi').email('Format email tidak valid'),
    password: z.string().min(1, 'Password harus diisi'),
    remember: z.boolean(),
});

export const registerFormSchema = z
    .object({
        name: z.string().min(1, 'Nama harus diisi'),
        email: z.string().min(1, 'Email harus diisi').email('Format email tidak valid'),
        password: z.string().min(8, 'Password minimal 8 karakter'),
        password_confirmation: z.string().min(1, 'Konfirmasi password harus diisi'),
    })
    .refine((data) => data.password === data.password_confirmation, {
        message: 'Konfirmasi password tidak sama',
        path: ['password_confirmation'],
    });

export const forgotPasswordFormSchema = z.object({
    email: z.string().min(1, 'Email harus diisi').email('Format email tidak valid'),
});

export const resetPasswordFormSchema = z
    .object({
        token: z.string(),
        email: z.string().min(1, 'Email harus diisi').email('Format email tidak valid'),
        password: z.string().min(8, 'Password minimal 8 karakter'),
        password_confirmation: z.string().min(1, 'Konfirmasi password harus diisi'),
    })
    .refine((data) => data.password === data.password_confirmation, {
        message: 'Konfirmasi password tidak sama',
        path: ['password_confirmation'],
    });

export const confirmPasswordFormSchema = z.object({
    password: z.string().min(1, 'Password harus diisi'),
});

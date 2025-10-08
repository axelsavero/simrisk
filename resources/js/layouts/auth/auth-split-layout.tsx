import AppLogoIcon from '@/components/app-logo-icon';
import { Link } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

// 1. Tambahkan 'publicKey' ke interface props
interface AuthLayoutProps {
    title?: string;
    description?: string;
    publicKey: string; // Prop ini diterima dari halaman login.tsx
}

// 2. Terima 'publicKey' dari props
export default function AuthSplitLayout({ children, publicKey }: PropsWithChildren<AuthLayoutProps>) {

    // Pastikan Anda menggunakan `import.meta.env.VITE_...` untuk variabel environment di sisi klien (Vite)
    const ssoUrl = `${import.meta.env.VITE_SSO_API_URL}/user-aplikasi/login-microsoft?public_key=${publicKey}`;

    return (
        <div className="relative grid h-dvh flex-col items-center justify-center px-8 sm:px-0 lg:max-w-none lg:grid-cols-2 lg:px-0">
            {/* Kiri */}
            <div className="bg-gradient-to-br from-green-700 to-teal-500 relative hidden h-full flex-col p-10 text-white lg:flex dark:border-r">
                {/* Logo UNJ */}
                <div className="flex items-center mr-10">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Lambang_baru_UNJ.png/500px-Lambang_baru_UNJ.png" alt="Logo UNJ" className="mr-4 mx-20 my-15 w-30 h-30" />
                    <span className="text-3xl font-[1000]">Universitas Negeri Jakarta</span>
                </div>
                {/* Judul */}
                <h1 className="text-5xl font-extrabold leading-tight mb-4 ml-10">
                    SISTEM INFORMASI<br />
                    MANAJEMEN RISIKO<br />
                    (SIMRISK)
                </h1>
                {/* Deskripsi */}
                <p className="mb-8 ml-10 font-[370] text-xl">
                    Tingkatkan kinerja Manajemen Risiko menjadi lebih cepat, efektif dan efisien.
                    Aplikasi ManRisk mendukung Anda untuk mengidentifikasi, menganalisis, mengevaluasi,
                    menindak lanjuti dan memonitoring risiko dimanapun dan kapanpun.
                </p>
                {/* Tombol Login SSO */}
                <div>
                    {/* 3. Gunakan variabel 'publicKey' yang sudah digabung ke dalam 'ssoUrl' */}
                    <a
                        href={ssoUrl}
                        className="inline-block bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-4xl text-base transition ml-10 w-auto"
                    >
                        LOGIN DENGAN SSO
                    </a>
                </div>
            </div>
            {/* Kanan */}
            <div className="w-full lg:p-8">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                    <Link href={route('home')} className="relative z-20 flex items-center justify-center lg:hidden">
                        <AppLogoIcon className="h-10 fill-current text-black sm:h-12" />
                    </Link>
                    {children}
                </div>
            </div>
        </div>
    );
}

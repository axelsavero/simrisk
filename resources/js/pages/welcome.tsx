import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect } from 'react';

export default function Welcome(props: any) {
    const { silentLoginUrl } = props;
    const { auth } = usePage<SharedData>().props;

    useEffect(() => {
        if (silentLoginUrl) {
            window.location.href = silentLoginUrl;
        }
    }, [silentLoginUrl]);

    return (
        <>
            <Head title="Welcome">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>
            <div className="flex min-h-screen flex-col bg-[#FDFDFC] bg-gradient-to-br from-green-700 to-teal-500 p-6 text-[#1b1b18]">
                <header className="mb-6 w-full max-w-[335px] self-end text-sm not-has-[nav]:hidden lg:max-w-4xl">
                    <nav className="flex items-center justify-end gap-4">
                        {auth.user ? (
                            <Link
                                href={route('dashboard')}
                                className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-white hover:border-[#1915014a]"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={route('login')}
                                    className="inline-block rounded-sm border border-transparent px-5 py-1.5 text-sm leading-normal text-white hover:border-[#19140035]"
                                >
                                    Log in
                                </Link>
                                {/* <Link
                                    href={route('register')}
                                    className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-white hover:border-[#1915014a]"
                                >
                                    Register
                                </Link> */}
                            </>
                        )}
                    </nav>
                </header>
                <div className="flex w-full flex-1 flex-col items-center justify-center">
                    <img
                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Lambang_baru_UNJ.png/500px-Lambang_baru_UNJ.png"
                        alt="Logo UNJ"
                        className="mb-6 h-32 w-32"
                    />
                    <span className="mb-4 text-center text-3xl font-extrabold text-white">Universitas Negeri Jakarta</span>
                    <h1 className="text-center text-5xl leading-tight font-extrabold text-white">
                        SISTEM INFORMASI
                        MANAJEMEN RISIKO
                        (SIMRISK)
                    </h1>
                </div>
            </div>
        </>
    );
}

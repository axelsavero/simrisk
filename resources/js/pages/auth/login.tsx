import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthSplitLayout from '@/layouts/auth-layout'; // Updated import

type LoginForm = {
    email: string;
    password: string;
    remember: boolean;
};

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm<Required<LoginForm>>({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <AuthSplitLayout title="Login (Super Admi" description="">
            <Head title="Log in" />

            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Masuk</h2>
                <p className="text-gray-600">Sistem Informasi Manajemen Risiko</p>
            </div>

            <form className="space-y-6" onSubmit={submit}>
                <div className="space-y-5">
                    <div className="space-y-2">
                        <Input
                            id="email"
                            type="email"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="Email"
                            className="bg-gray-100 border-2 border-gray-200 focus:border-green-500 focus:bg-white rounded-xl px-4 py-4 text-base transition-all duration-200 shadow-sm"
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="space-y-2">
                        <Input
                            id="password"
                            type="password"
                            required
                            tabIndex={2}
                            autoComplete="current-password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="Password"
                            className="bg-gray-100 border-2 border-gray-200 focus:border-green-500 focus:bg-white rounded-xl px-4 py-4 text-base transition-all duration-200 shadow-sm"
                        />
                        <InputError message={errors.password} />
                    </div>

                    <div className="flex items-center justify-between text-sm pt-2">
                        {canResetPassword && (
                            <TextLink href={route('password.request')} className="text-green-600 hover:text-green-700 font-medium transition-colors" tabIndex={4}>
                                Lupa Password?
                            </TextLink>
                        )}
                        <div className="flex items-center space-x-3">
                            <Checkbox
                                id="remember"
                                name="remember"
                                checked={data.remember}
                                onClick={() => setData('remember', !data.remember)}
                                tabIndex={3}
                                className="border-2 border-gray-300 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                            />
                            <Label htmlFor="remember" className="text-gray-700 font-medium cursor-pointer">Ingat saya</Label>
                        </div>
                    </div>

                    <Button type="submit" className="mt-6 w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl py-4 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]" tabIndex={5} disabled={processing}>
                        {processing && <LoaderCircle className="h-5 w-5 animate-spin mr-2" />}
                        MASUK
                    </Button>
                </div>

                <div className="text-center text-sm text-gray-600 mt-6">
                    Belum terdaftar ?
                </div>
            </form>

            {status && <div className="mb-4 text-center text-sm font-medium text-green-600">{status}</div>}
        </AuthSplitLayout>
    );
}

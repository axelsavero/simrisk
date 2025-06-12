import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, SasaranUniv } from '@/types';
import { Head, Link } from '@inertiajs/react';

interface Props {
    sasaranUniv: SasaranUniv;
}

export default function Show({ sasaranUniv }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Sasaran Universitas', href: route('sasaran-univ.index') },
        { title: 'Detail Dokumen', href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Detail Sasaran Universitas" />

            <div className="w-full px-6 py-8">
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-2xl font-semibold">Detail Sasaran Universitas</h2>
                    <div className="flex gap-2">
                        <Link
                            href={route('sasaran-univ.edit', sasaranUniv.id_sasaran_univ)}
                            className="flex items-center gap-2 rounded-md bg-yellow-600 px-6 py-3 font-medium text-white transition hover:bg-yellow-700"
                        >
                            <span>✏️</span>
                            Edit
                        </Link>
                        <Link
                            href={route('sasaran-univ.index')}
                            className="flex items-center gap-2 rounded-md border border-gray-300 px-6 py-3 font-medium text-gray-700 transition hover:bg-gray-50"
                        >
                            <span>⬅️</span>
                            Kembali
                        </Link>
                    </div>
                </div>

                <div className="rounded-xl border-2 border-gray-300 bg-white p-6 shadow-md dark:border-neutral-700 dark:bg-neutral-900">
                    {/* Header Info */}
                    <div className="mb-8 border-b pb-6">
                        <div className="mb-4 flex items-center gap-3">
                            <span className="text-3xl">📄</span>
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                                    {sasaranUniv.nama_dokumen || 'Dokumen Sasaran Universitas'}
                                </h3>
                                <p className="text-sm text-gray-500">
                                    ID: {sasaranUniv.id_sasaran_univ} • Dibuat: {new Date(sasaranUniv.created_at).toLocaleDateString('id-ID')}
                                </p>
                            </div>
                        </div>

                        <div className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">{sasaranUniv.kategori}</div>
                    </div>

                    {/* Detail Information */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        {/* Informasi Dokumen */}
                        <div className="space-y-4">
                            <h4 className="border-b pb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">📋 Informasi Dokumen</h4>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Kategori</label>
                                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{sasaranUniv.kategori}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nama Dokumen</label>
                                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{sasaranUniv.nama_dokumen || '-'}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nomor Dokumen</label>
                                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{sasaranUniv.nomor_dokumen || '-'}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tanggal Dokumen</label>
                                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                                    {sasaranUniv.tanggal_dokumen
                                        ? new Date(sasaranUniv.tanggal_dokumen).toLocaleDateString('id-ID', {
                                              year: 'numeric',
                                              month: 'long',
                                              day: 'numeric',
                                          })
                                        : '-'}
                                </p>
                            </div>
                        </div>

                        {/* File Information */}
                        <div className="space-y-4">
                            <h4 className="border-b pb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">📎 File Dokumen</h4>

                            {sasaranUniv.file_path ? (
                                <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">📄</span>
                                            <div>
                                                <p className="font-medium text-green-800">{sasaranUniv.file_path.split('/').pop()}</p>
                                                <p className="text-sm text-green-600">File tersedia</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <a
                                                href={`/storage/${sasaranUniv.file_path}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                                            >
                                                <span>👁️</span>
                                                Lihat
                                            </a>
                                            <a
                                                href={`/storage/${sasaranUniv.file_path}`}
                                                download
                                                className="inline-flex items-center gap-1 rounded-md bg-green-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-green-700"
                                            >
                                                <span>⬇️</span>
                                                Download
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center">
                                    <span className="text-4xl text-gray-400">📭</span>
                                    <p className="mt-2 text-sm text-gray-500">Tidak ada file yang diupload</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Metadata */}
                    <div className="mt-8 border-t pt-6">
                        <h4 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">ℹ️ Informasi Sistem</h4>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Dibuat pada</label>
                                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                                    {new Date(sasaranUniv.created_at).toLocaleString('id-ID', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Terakhir diupdate</label>
                                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                                    {new Date(sasaranUniv.updated_at).toLocaleString('id-ID', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

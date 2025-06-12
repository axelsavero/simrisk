// resources/js/pages/target/show.tsx

import React from 'react';
import { usePage, Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';

interface ShowProps {
  target: {
    id: number;
    sasaran: string;
    nama_dokumen: string;
    nomor_dokumen: string;
    tanggal_dokumen: string;
    status: boolean;
    created_at?: string;
    updated_at?: string;
  };
}

export default function TargetShow() {
  const { target } = usePage<ShowProps>().props;

  return (
    <AppLayout breadcrumbs={[
      { title: 'Dashboard', href: '/dashboard' },
      { title: 'Daftar Sasaran', href: '/target' },
      { title: `Detail Sasaran`, href: '#' }
    ]}>
      <Head title={`Detail Sasaran`} />

      <div className="mx-auto max-w-3xl px-6 py-8">
        <div className="mb-6 rounded-lg bg-white p-6 shadow-md">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h1 className="mb-2 text-2xl font-bold text-gray-900">Detail Sasaran</h1>
              <p className="text-gray-600">{target.nama_dokumen}</p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-sm font-medium ${
                target.status ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'
              }`}
            >
              {target.status ? 'Aktif' : 'Nonaktif'}
            </span>
          </div>

          {/* Aksi */}
          <div className="mb-6 flex gap-2">
            <Link
              href={`/target/${target.id}/edit`}
              className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              ✏️ Edit
            </Link>
            <Link
              href="/target"
              className="rounded border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-100"
            >
              ← Kembali
            </Link>
          </div>

          {/* Informasi */}
          <div className="space-y-4 text-gray-800">
            <div>
              <h2 className="text-sm font-semibold text-gray-500">Sasaran</h2>
              <p className="whitespace-pre-line">{target.sasaran}</p>
            </div>

            <div>
              <h2 className="text-sm font-semibold text-gray-500">Nomor Dokumen</h2>
              <p>{target.nomor_dokumen}</p>
            </div>

            <div>
              <h2 className="text-sm font-semibold text-gray-500">Tanggal Dokumen</h2>
              <p>{new Date(target.tanggal_dokumen).toLocaleDateString('id-ID')}</p>
            </div>

            {target.created_at && (
              <div className="text-sm text-gray-400">
                Dibuat: {new Date(target.created_at).toLocaleDateString('id-ID')}
              </div>
            )}
            {target.updated_at && (
              <div className="text-sm text-gray-400">
                Diperbarui: {new Date(target.updated_at).toLocaleDateString('id-ID')}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

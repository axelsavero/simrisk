// resources/js/pages/sasaran-univ/form.tsx

import React, { useState } from 'react';
import { useForm, Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';

interface SasaranFormProps {
  sasaranUniv?: {
    id?: number;
    sasaran: string;
    nama_dokumen: string;
    nomor_dokumen: string;
    tanggal_dokumen: string;
    status: boolean;
    file_url?: string;
  };
}

export default function SasaranForm({ sasaranUniv }: SasaranFormProps) {
  const { data, setData, post, processing, errors } = useForm<FormData | any>({
    sasaran: sasaranUniv?.sasaran || '',
    nama_dokumen: sasaranUniv?.nama_dokumen || '',
    nomor_dokumen: sasaranUniv?.nomor_dokumen || '',
    tanggal_dokumen: sasaranUniv?.tanggal_dokumen || new Date().toISOString().split('T')[0],
    status: sasaranUniv?.status ?? true,
    file: null,
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileUploaded, setFileUploaded] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    setFileUploaded(false);
  };

  const handleUploadClick = () => {
    if (selectedFile) {
      setData('file', selectedFile);
      setFileUploaded(true);
    }
  };

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const formData = new FormData();
    formData.append('sasaran', data.sasaran);
    formData.append('nama_dokumen', data.nama_dokumen);
    formData.append('nomor_dokumen', data.nomor_dokumen);
    formData.append('tanggal_dokumen', data.tanggal_dokumen);
    formData.append('status', data.status ? '1' : '0');
    if (data.file) {
      formData.append('file', data.file);
    }

    if (sasaranUniv) {
      formData.append('_method', 'put');
      post(`/sasaran-univ/${sasaranUniv.id}`, {
        data: formData,
        forceFormData: true,
      });
    } else {
      post('/sasaran-univ', {
        data: formData,
        forceFormData: true,
      });
    }
  }

  return (
    <AppLayout
      breadcrumbs={[
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Daftar Sasaran', href: '/sasaran-univ' },
        { title: sasaranUniv ? 'Edit Sasaran' : 'Tambah Sasaran', href: '#' },
      ]}
    >
      <Head title={sasaranUniv ? 'Edit Sasaran' : 'Tambah Sasaran Baru'} />
      <div className="px-6 py-8">
        <h1 className="mb-6 text-2xl font-semibold">
          {sasaranUniv ? 'Edit Sasaran' : 'Tambah Sasaran Baru'}
        </h1>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-xl border border-gray-300 bg-white p-6 shadow"
        >
          {/* Sasaran */}
          <div>
            <label className="mb-1 block font-medium">Sasaran</label>
            <textarea
              value={data.sasaran}
              onChange={(e) => setData('sasaran', e.target.value)}
              className="w-full rounded border px-3 py-2"
              rows={3}
              required
            />
            {errors.sasaran && <div className="text-sm text-red-500">{errors.sasaran}</div>}
          </div>

          {/* Nama Dokumen */}
          <div>
            <label className="mb-1 block font-medium">Nama Dokumen</label>
            <input
              type="text"
              value={data.nama_dokumen}
              onChange={(e) => setData('nama_dokumen', e.target.value)}
              className="w-full rounded border px-3 py-2"
              required
            />
            {errors.nama_dokumen && (
              <div className="text-sm text-red-500">{errors.nama_dokumen}</div>
            )}
          </div>

          {/* Nomor Dokumen */}
          <div>
            <label className="mb-1 block font-medium">Nomor Dokumen</label>
            <input
              type="text"
              value={data.nomor_dokumen}
              onChange={(e) => setData('nomor_dokumen', e.target.value)}
              className="w-full rounded border px-3 py-2"
              required
            />
            {errors.nomor_dokumen && (
              <div className="text-sm text-red-500">{errors.nomor_dokumen}</div>
            )}
          </div>

          {/* Tanggal Dokumen */}
          <div>
            <label className="mb-1 block font-medium">Tanggal Dokumen</label>
            <input
              type="date"
              value={data.tanggal_dokumen}
              onChange={(e) => setData('tanggal_dokumen', e.target.value)}
              className="w-full rounded border px-3 py-2"
              required
            />
            {errors.tanggal_dokumen && (
              <div className="text-sm text-red-500">{errors.tanggal_dokumen}</div>
            )}
          </div>

          {/* Upload File dengan tombol Upload */}
          <div>
            <label className="mb-1 block font-medium">Unggah File Dokumen</label>
            <div className="flex items-center gap-4">
              <input
                type="file"
                onChange={handleFileChange}
                className="w-full rounded border px-3 py-2"
              />
              <button
                type="button"
                onClick={handleUploadClick}
                className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                Upload
              </button>
            </div>
            {fileUploaded && selectedFile && (
              <div className="mt-1 text-sm text-green-600">
                File "{selectedFile.name}" siap diunggah.
              </div>
            )}
            {sasaranUniv?.file_url && (
              <div className="mt-2 text-sm text-blue-600">
                File sebelumnya:{' '}
                <a
                  href={sasaranUniv.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  Lihat Dokumen
                </a>
              </div>
            )}
            {errors.file && <div className="text-sm text-red-500">{errors.file}</div>}
          </div>

          {/* Status */}
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={data.status}
                onChange={(e) => setData('status', e.target.checked)}
                className="form-checkbox rounded"
              />
              <span className="font-medium">Status Aktif</span>
            </label>
            <small className="text-gray-500">Centang jika sasaran masih aktif dijalankan</small>
          </div>

          {/* Tombol Aksi */}
          <div className="mt-6 flex items-center justify-between border-t pt-4">
            <button
              type="submit"
              disabled={processing}
              className="rounded bg-green-600 px-6 py-2 font-medium text-white hover:bg-green-700 disabled:opacity-50"
            >
              {processing ? 'Menyimpan...' : 'Simpan'}
            </button>
            <Link
              href="/sasaran-univ"
              className="rounded border border-gray-300 px-6 py-2 text-gray-700 hover:bg-gray-100"
            >
              Batal
            </Link>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}

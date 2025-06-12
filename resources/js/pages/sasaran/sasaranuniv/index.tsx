// resources/js/pages/target/index.tsx

import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Link } from '@inertiajs/react';

type Sasaran = {
  id: number;
  sasaran: string;
  nama_dokumen: string;
  nomor_dokumen: string;
  tanggal_dokumen: string;
  status: boolean;
};

const dummyData: Sasaran[] = [
  {
    id: 1,
    sasaran: 'Meningkatkan efisiensi operasional',
    nama_dokumen: 'Dokumen Strategi',
    nomor_dokumen: 'DOC-001',
    tanggal_dokumen: '2025-06-01',
    status: true,
  },
  {
    id: 2,
    sasaran: 'Meningkatkan kualitas layanan publik',
    nama_dokumen: 'Rencana Layanan',
    nomor_dokumen: 'DOC-002',
    tanggal_dokumen: '2025-05-15',
    status: false,
  },
  {
    id: 3,
    sasaran: 'Meningkatkan kepuasan pelanggan',
    nama_dokumen: 'Customer Feedback',
    nomor_dokumen: 'DOC-003',
    tanggal_dokumen: '2025-06-10',
    status: false,
  },
];

export default function TargetIndex() {
  return (
    <AppLayout
      breadcrumbs={[
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Daftar Sasaran', href: '#' },
      ]}
    >
      <div className="px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold">Daftar Sasaran</h1>
          <Link
            href="/sasaran-univ/create"
            className="inline-flex items-center rounded-md bg-gray-200 px-3 py-1 text-sm hover:bg-gray-300"
          >
            Tambah <span className="ml-1 text-lg">➕</span>
          </Link>
        </div>

        <div className="overflow-x-auto rounded-lg border border-gray-300 bg-white">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-4 py-2 border">No</th>
                <th className="px-4 py-2 border">Sasaran</th>
                <th className="px-4 py-2 border">Nama Dokumen</th>
                <th className="px-4 py-2 border">Nomor Dokumen</th>
                <th className="px-4 py-2 border">Tgl / Date</th>
                <th className="px-4 py-2 border text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {dummyData.map((item, index) => (
                <tr key={item.id} className="border-t">
                  <td className="px-4 py-2 border">{index + 1}</td>
                  <td className="px-4 py-2 border">{item.sasaran}</td>
                  <td className="px-4 py-2 border">{item.nama_dokumen}</td>
                  <td className="px-4 py-2 border">{item.nomor_dokumen}</td>
                  <td className="px-4 py-2 border">
                    {new Date(item.tanggal_dokumen).toLocaleDateString('id-ID')}
                  </td>
                  <td className="px-4 py-2 border text-center">
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={item.status}
                        readOnly
                      />
                      <div className="relative w-11 h-6 bg-gray-300 peer-checked:bg-green-500 rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-500 transition-all">
                        <div
                          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                            item.status ? 'translate-x-5' : ''
                          }`}
                        ></div>
                      </div>
                    </label>
                  </td>
                </tr>
              ))}
              {dummyData.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-4 text-center text-gray-500">
                    Tidak ada data sasaran.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}

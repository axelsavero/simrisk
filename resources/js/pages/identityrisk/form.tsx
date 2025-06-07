// resources/js/pages/identityrisk/form.tsx

import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, IdentityRisk } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import React from 'react';

interface FormProps {
    identityRisk?: IdentityRisk | null;
}

interface FormData {
    id_identity: string;
    status: boolean;
    risk_category: string;
    identification_date_start: string;
    identification_date_end: string;
    description: string;
    nama_risiko: string;
    jabatan_risiko: string;
    no_kontak: string;
    strategi: string;
    pengendalian_internal: string;
    biaya_penangan: string;
    probability: number;
    impact: number;
    penyebab: Array<{ description: string }>;
    dampak_kualitatif: Array<{ description: string }>;
    penanganan_risiko: Array<{ description: string }>;
}

export default function Form({ identityRisk = null }: FormProps) {
    const { data, setData, post, put, processing, errors } = useForm<FormData>({
        id_identity: identityRisk?.id_identity || '',
        status: identityRisk?.status ?? true,
        risk_category: identityRisk?.risk_category || '',
        identification_date_start: identityRisk?.identification_date_start || new Date().toISOString().split('T')[0],
        identification_date_end: identityRisk?.identification_date_end || new Date().toISOString().split('T')[0],
        description: identityRisk?.description || '',
        nama_risiko: identityRisk?.nama_risiko || '',
        jabatan_risiko: identityRisk?.jabatan_risiko || '',
        no_kontak: identityRisk?.no_kontak || '',
        strategi: identityRisk?.strategi || '',
        pengendalian_internal: identityRisk?.pengendalian_internal || '',
        biaya_penangan: identityRisk?.biaya_penangan?.toString() || '',
        probability: identityRisk?.probability || 1,
        impact: identityRisk?.impact || 1,
        penyebab: identityRisk?.penyebab || [{ description: '' }],
        dampak_kualitatif: identityRisk?.dampak_kualitatif || [{ description: '' }],
        penanganan_risiko: identityRisk?.penanganan_risiko || [{ description: '' }],
    });

    // Dynamic field functions for Penyebab
    function addPenyebab() {
        setData('penyebab', [...data.penyebab, { description: '' }]);
    }

    function removePenyebab(index: number) {
        if (data.penyebab.length > 1) {
            setData(
                'penyebab',
                data.penyebab.filter((_, i) => i !== index),
            );
        }
    }

    function handlePenyebabChange(index: number, value: string) {
        const newPenyebab = [...data.penyebab];
        newPenyebab[index].description = value;
        setData('penyebab', newPenyebab);
    }

    // Dynamic field functions for Dampak Kualitatif
    function addDampakKualitatif() {
        setData('dampak_kualitatif', [...data.dampak_kualitatif, { description: '' }]);
    }

    function removeDampakKualitatif(index: number) {
        if (data.dampak_kualitatif.length > 1) {
            setData(
                'dampak_kualitatif',
                data.dampak_kualitatif.filter((_, i) => i !== index),
            );
        }
    }

    function handleDampakKualitatifChange(index: number, value: string) {
        const newDampak = [...data.dampak_kualitatif];
        newDampak[index].description = value;
        setData('dampak_kualitatif', newDampak);
    }

    // Dynamic field functions for Penanganan Risiko
    function addPenangananRisiko() {
        setData('penanganan_risiko', [...data.penanganan_risiko, { description: '' }]);
    }

    function removePenangananRisiko(index: number) {
        if (data.penanganan_risiko.length > 1) {
            setData(
                'penanganan_risiko',
                data.penanganan_risiko.filter((_, i) => i !== index),
            );
        }
    }

    function handlePenangananRisikoChange(index: number, value: string) {
        const newPenanganan = [...data.penanganan_risiko];
        newPenanganan[index].description = value;
        setData('penanganan_risiko', newPenanganan);
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();

        // Filter empty descriptions
        const submitData = {
            ...data,

            penyebab: data.penyebab.filter((p) => p.description.trim() !== ''),
            dampak_kualitatif: data.dampak_kualitatif.filter((d) => d.description.trim() !== ''),
            penanganan_risiko: data.penanganan_risiko.filter((p) => p.description.trim() !== ''),
            biaya_penangan: data.biaya_penangan ? parseFloat(data.biaya_penangan) : null,
        };

        if (identityRisk) {
            put(`/identity-risk/${identityRisk.id}`, submitData);
        } else {
            post('/identity-risk', submitData);
        }
    }

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Manajemen Risiko', href: '/identity-risk' },
        { title: identityRisk ? 'Edit Risiko' : 'Tambah Risiko', href: '#' },
    ];

    // Calculate risk level
    const riskLevel = data.probability * data.impact;
    const getRiskLevelText = (level: number) => {
        if (level >= 20) return 'Sangat Tinggi';
        if (level >= 15) return 'Tinggi';
        if (level >= 8) return 'Sedang';
        return 'Rendah';
    };

    const getRiskLevelColor = (level: number) => {
        if (level >= 20) return 'text-red-600 bg-red-100';
        if (level >= 15) return 'text-orange-600 bg-orange-100';
        if (level >= 8) return 'text-yellow-600 bg-yellow-100';
        return 'text-green-600 bg-green-100';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={identityRisk ? 'Edit Identifikasi Risiko' : 'Tambah Identifikasi Risiko Baru'} />
            <div className="w-full px-6 py-8">
                <h2 className="mb-6 text-2xl font-semibold">{identityRisk ? 'Edit Identifikasi Risiko' : 'Tambah Identifikasi Risiko Baru'}</h2>

                <form
                    onSubmit={submit}
                    className="w-full space-y-6 rounded-xl border-2 border-gray-300 bg-white p-6 shadow-md dark:border-neutral-700 dark:bg-neutral-900"
                >
                    {/* ID Identity */}
                    <div>
                        <label className="mb-1 block font-medium">Kode Risiko</label>
                        <input
                            type="text"
                            value={data.id_identity}
                            onChange={(e) => setData('id_identity', e.target.value)}
                            className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-neutral-700"
                            placeholder="Masukkan kode risiko"
                            required
                        />
                        {errors.id_identity && <div className="mt-1 text-sm text-red-500">{errors.id_identity}</div>}
                    </div>

                    {/* Risk Category */}
                    <div>
                        <label className="mb-1 block font-medium">Kategori Risiko</label>
                        <select
                            value={data.risk_category}
                            onChange={(e) => setData('risk_category', e.target.value)}
                            className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-neutral-700"
                            required
                        >
                            <option value="">Pilih Kategori</option>
                            <option value="Operasional">Operasional</option>
                            <option value="Finansial">Finansial</option>
                            <option value="Kepatuhan">Kepatuhan</option>
                            <option value="Strategis">Strategis</option>
                            <option value="Reputasi">Reputasi</option>
                        </select>
                        {errors.risk_category && <div className="mt-1 text-sm text-red-500">{errors.risk_category}</div>}
                    </div>

                    {/* Date Range */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-1 block font-medium">Tanggal Mulai Identifikasi</label>
                            <input
                                type="date"
                                value={data.identification_date_start}
                                onChange={(e) => setData('identification_date_start', e.target.value)}
                                className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-neutral-700"
                                required
                            />
                            {errors.identification_date_start && <div className="mt-1 text-sm text-red-500">{errors.identification_date_start}</div>}
                        </div>

                        <div>
                            <label className="mb-1 block font-medium">Tanggal Selesai Identifikasi</label>
                            <input
                                type="date"
                                value={data.identification_date_end}
                                onChange={(e) => setData('identification_date_end', e.target.value)}
                                className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-neutral-700"
                                required
                            />
                            {errors.identification_date_end && <div className="mt-1 text-sm text-red-500">{errors.identification_date_end}</div>}
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="mb-1 block font-medium">Deskripsi Risiko</label>
                        <textarea
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-neutral-700"
                            rows={4}
                            placeholder="Deskripsikan risiko secara detail..."
                            required
                        />
                        {errors.description && <div className="mt-1 text-sm text-red-500">{errors.description}</div>}
                    </div>

                    {/* Penyebab - Dynamic Fields */}
                    <div>
                        <label className="mb-2 block font-medium">Penyebab Risiko</label>
                        {data.penyebab.map((item, index) => (
                            <div key={index} className="mb-2 flex gap-2">
                                <textarea
                                    value={item.description}
                                    onChange={(e) => handlePenyebabChange(index, e.target.value)}
                                    className="flex-1 rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-neutral-700"
                                    placeholder={`Penyebab ${index + 1}`}
                                    rows={2}
                                    required
                                />
                                {data.penyebab.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removePenyebab(index)}
                                        className="rounded-md bg-red-500 px-3 py-2 text-white transition hover:bg-red-600"
                                    >
                                        Hapus
                                    </button>
                                )}
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={addPenyebab}
                            className="rounded-md bg-blue-500 px-4 py-2 text-white transition hover:bg-blue-600"
                        >
                            + Tambah Penyebab
                        </button>
                        {errors.penyebab && <div className="mt-1 text-sm text-red-500">{errors.penyebab}</div>}
                    </div>

                    {/* Dampak Kualitatif - Dynamic Fields */}
                    <div>
                        <label className="mb-2 block font-medium">Dampak Kualitatif</label>
                        {data.dampak_kualitatif.map((item, index) => (
                            <div key={index} className="mb-2 flex gap-2">
                                <input
                                    type="text"
                                    value={item.description}
                                    onChange={(e) => handleDampakKualitatifChange(index, e.target.value)}
                                    className="flex-1 rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-neutral-700"
                                    placeholder={`Dampak kualitatif ${index + 1}`}
                                    required
                                />
                                {data.dampak_kualitatif.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeDampakKualitatif(index)}
                                        className="rounded-md bg-red-500 px-3 py-2 text-white transition hover:bg-red-600"
                                    >
                                        Hapus
                                    </button>
                                )}
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={addDampakKualitatif}
                            className="rounded-md bg-blue-500 px-4 py-2 text-white transition hover:bg-blue-600"
                        >
                            + Tambah Dampak Kualitatif
                        </button>
                        {errors.dampak_kualitatif && <div className="mt-1 text-sm text-red-500">{errors.dampak_kualitatif}</div>}
                    </div>

                    {/* Probability and Impact */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-1 block font-medium">Probabilitas (1-5)</label>
                            <select
                                value={data.probability}
                                onChange={(e) => setData('probability', parseInt(e.target.value))}
                                className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-neutral-700"
                                required
                            >
                                <option value={1}>1 - Sangat Rendah</option>
                                <option value={2}>2 - Rendah</option>
                                <option value={3}>3 - Sedang</option>
                                <option value={4}>4 - Tinggi</option>
                                <option value={5}>5 - Sangat Tinggi</option>
                            </select>
                            {errors.probability && <div className="mt-1 text-sm text-red-500">{errors.probability}</div>}
                        </div>

                        <div>
                            <label className="mb-1 block font-medium">Dampak (1-5)</label>
                            <select
                                value={data.impact}
                                onChange={(e) => setData('impact', parseInt(e.target.value))}
                                className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-neutral-700"
                                required
                            >
                                <option value={1}>1 - Sangat Rendah</option>
                                <option value={2}>2 - Rendah</option>
                                <option value={3}>3 - Sedang</option>
                                <option value={4}>4 - Tinggi</option>
                                <option value={5}>5 - Sangat Tinggi</option>
                            </select>
                            {errors.impact && <div className="mt-1 text-sm text-red-500">{errors.impact}</div>}
                        </div>
                    </div>

                    {/* Risk Level Display */}
                    <div>
                        <label className="mb-1 block font-medium">Level Risiko</label>
                        <div className={`inline-block rounded-lg px-4 py-2 font-semibold ${getRiskLevelColor(riskLevel)}`}>
                            {getRiskLevelText(riskLevel)} ({riskLevel}/25)
                        </div>
                    </div>

                    {/* Additional Fields */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-1 block font-medium">Nama Risiko</label>
                            <input
                                type="text"
                                value={data.nama_risiko}
                                onChange={(e) => setData('nama_risiko', e.target.value)}
                                className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-neutral-700"
                                placeholder="Nama pemilik risiko"
                            />
                            {errors.nama_risiko && <div className="mt-1 text-sm text-red-500">{errors.nama_risiko}</div>}
                        </div>

                        <div>
                            <label className="mb-1 block font-medium">Jabatan Risiko</label>
                            <input
                                type="text"
                                value={data.jabatan_risiko}
                                onChange={(e) => setData('jabatan_risiko', e.target.value)}
                                className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-neutral-700"
                                placeholder="Jabatan pemilik risiko"
                            />
                            {errors.jabatan_risiko && <div className="mt-1 text-sm text-red-500">{errors.jabatan_risiko}</div>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-1 block font-medium">No Kontak</label>
                            <input
                                type="text"
                                value={data.no_kontak}
                                onChange={(e) => setData('no_kontak', e.target.value)}
                                className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-neutral-700"
                                placeholder="Nomor kontak"
                            />
                            {errors.no_kontak && <div className="mt-1 text-sm text-red-500">{errors.no_kontak}</div>}
                        </div>

                        <div>
                            <label className="mb-1 block font-medium">Strategi</label>
                            <input
                                type="text"
                                value={data.strategi}
                                onChange={(e) => setData('strategi', e.target.value)}
                                className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-neutral-700"
                                placeholder="Strategi penanganan"
                            />
                            {errors.strategi && <div className="mt-1 text-sm text-red-500">{errors.strategi}</div>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-1 block font-medium">Pengendalian Internal</label>
                            <select
                                value={data.pengendalian_internal}
                                onChange={(e) => setData('pengendalian_internal', e.target.value)}
                                className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-neutral-700"
                            >
                                <option value="">Pilih Jenis Pengendalian</option>
                                <option value="Preventif">Preventif</option>
                                <option value="Detektif">Detektif</option>
                                <option value="Korektif">Korektif</option>
                                <option value="Kompensatif">Kompensatif</option>
                            </select>
                            {errors.pengendalian_internal && <div className="mt-1 text-sm text-red-500">{errors.pengendalian_internal}</div>}
                        </div>

                        <div>
                            <label className="mb-1 block font-medium">Biaya Penanganan</label>
                            <input
                                type="number"
                                value={data.biaya_penangan}
                                onChange={(e) => setData('biaya_penangan', e.target.value)}
                                className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-neutral-700"
                                placeholder="Estimasi biaya"
                                min="0"
                                step="0.01"
                            />
                            {errors.biaya_penangan && <div className="mt-1 text-sm text-red-500">{errors.biaya_penangan}</div>}
                        </div>
                    </div>

                    {/* Penanganan Risiko - Dynamic Fields */}
                    <div>
                        <label className="mb-2 block font-medium">Penanganan Risiko</label>
                        {data.penanganan_risiko.map((item, index) => (
                            <div key={index} className="mb-2 flex gap-2">
                                <input
                                    type="text"
                                    value={item.description}
                                    onChange={(e) => handlePenangananRisikoChange(index, e.target.value)}
                                    className="flex-1 rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-neutral-700"
                                    placeholder={`Penanganan risiko ${index + 1}`}
                                />
                                {data.penanganan_risiko.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removePenangananRisiko(index)}
                                        className="rounded-md bg-red-500 px-3 py-2 text-white transition hover:bg-red-600"
                                    >
                                        Hapus
                                    </button>
                                )}
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={addPenangananRisiko}
                            className="rounded-md bg-blue-500 px-4 py-2 text-white transition hover:bg-blue-600"
                        >
                            + Tambah Penanganan Risiko
                        </button>
                        {errors.penanganan_risiko && <div className="mt-1 text-sm text-red-500">{errors.penanganan_risiko}</div>}
                    </div>

                    {/* Status */}
                    <div>
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={data.status}
                                onChange={(e) => setData('status', e.target.checked)}
                                className="form-check-input"
                            />
                            <span className="font-medium">Status Aktif</span>
                        </label>
                        <small className="text-gray-500 dark:text-gray-400">Centang jika risiko ini masih aktif dipantau</small>
                    </div>

                    {/* Submit Buttons */}
                    <div className="mt-6 flex justify-between">
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-md border border-green-600 px-6 py-2 text-green-600 transition hover:bg-green-600 hover:text-white disabled:opacity-50"
                        >
                            {processing ? 'Menyimpan...' : 'Simpan'}
                        </button>
                        <Link
                            href="/identity-risk"
                            className="rounded-md border border-red-500 px-6 py-2 text-red-500 transition hover:bg-red-500 hover:text-white"
                        >
                            Batal
                        </Link>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

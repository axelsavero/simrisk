// resources/js/pages/identifyrisk/form.tsx (FULL CODE WITH BUKTI UPLOAD)

import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, IdentifyRisk } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Hourglass, Lightbulb, Paperclip, Save, SquarePen, X } from 'lucide-react';
import React from 'react';

interface FormProps {
    identifyRisk?: IdentifyRisk | null;
}

interface FormData {
    [key: string]: any;
    id_identify: string;
    is_active: boolean;
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
    // 🔥 TAMBAHAN: Bukti risiko fields
    bukti_risiko_nama: string;
    bukti_risiko_file: File | null;
}

export default function Form({ identifyRisk = null }: FormProps) {
    const { data, setData, post, put, processing, errors } = useForm<FormData>({
        // Existing fields
        id_identify: identifyRisk?.id_identify || '',
        is_active: identifyRisk?.is_active ?? true,
        risk_category: identifyRisk?.risk_category || '',
        identification_date_start: identifyRisk?.identification_date_start || new Date().toISOString().split('T')[0],
        identification_date_end: identifyRisk?.identification_date_end || new Date().toISOString().split('T')[0],
        description: identifyRisk?.description || '',
        nama_risiko: identifyRisk?.nama_risiko || '',
        jabatan_risiko: identifyRisk?.jabatan_risiko || '',
        no_kontak: identifyRisk?.no_kontak || '',
        strategi: identifyRisk?.strategi || '',
        pengendalian_internal: identifyRisk?.pengendalian_internal || '',
        biaya_penangan: identifyRisk?.biaya_penangan?.toString() || '',
        probability: identifyRisk?.probability || 1,
        impact: identifyRisk?.impact || 1,
        penyebab: identifyRisk?.penyebab || [{ description: '' }],
        dampak_kualitatif: identifyRisk?.dampak_kualitatif || [{ description: '' }],
        penanganan_risiko: identifyRisk?.penanganan_risiko || [{ description: '' }],

        // 🔥 TAMBAHAN: Bukti risiko fields
        bukti_risiko_nama: '',
        bukti_risiko_file: null,
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

    // 🔥 UPDATED: Submit function dengan file upload support
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

        if (identifyRisk) {
            put(route('identify-risk.update', identifyRisk.id), {
                ...submitData,
                forceFormData: true,
            });
        } else {
            post(route('identify-risk.store'), {
                ...submitData,
                forceFormData: true,
            });
        }
    }

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Manajemen Risiko', href: route('identify-risk.index') },
        { title: identifyRisk ? 'Edit Risiko' : 'Tambah Risiko', href: '#' },
    ];

    // Calculate risk level
    const riskLevel = data.probability * data.impact;
    const getRiskLevelText = (level: number) => {
        if (level >= 20) return 'Tinggi';
        if (level >= 9) return 'Sedang';
        if (level >= 3) return 'Rendah';
        return 'Sangat Rendah';
    };

    const getRiskLevelColor = (level: number) => {
        if (level >= 20) return 'text-red-600 bg-red-100';
        if (level >= 9) return 'text-orange-600 bg-orange-100';
        if (level >= 3) return 'text-yellow-600 bg-yellow-100';
        return 'text-green-600 bg-green-100';
    };

    // Check if editing draft
    const isEditingDraft = identifyRisk && identifyRisk.validation_status === 'draft';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={identifyRisk ? 'Edit Identifikasi Risiko' : 'Tambah Identifikasi Risiko Baru'} />
            <div className="w-full px-6 py-8">
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-2xl font-semibold">{identifyRisk ? 'Edit Identifikasi Risiko' : 'Tambah Identifikasi Risiko Baru'}</h2>

                    {/* Draft status indicator */}
                    {isEditingDraft && (
                        <div className="flex items-center gap-2 rounded-lg bg-blue-100 px-4 py-2 text-blue-800">
                            <span className="text-lg"><SquarePen /></span>
                            <span className="font-medium">Mode Draft</span>
                        </div>
                    )}
                </div>

                {/* Info banner untuk draft workflow */}
                {!identifyRisk && (
                    <div className="mb-6 rounded-lg border-l-4 border-yellow-400 bg-yellow-50 p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <Lightbulb size={20} className="text-yellow-600" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-yellow-700">
                                    <strong>Info:</strong> Risiko yang Anda buat akan disimpan sebagai draft. Gunakan tombol "Kirim" di halaman daftar
                                    untuk mengirimkannya ke validator.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <form
                    onSubmit={submit}
                    className="w-full space-y-6 rounded-xl border-2 border-gray-300 bg-white p-6 shadow-md"
                    encType="multipart/form-data" // 🔥 TAMBAHAN: Support file upload
                >
                    {/* ID Identify */}
                    <div>
                        <label className="mb-1 block font-medium">Kode Risiko</label>
                        <input
                            type="text"
                            value={data.id_identify}
                            onChange={(e) => setData('id_identify', e.target.value)}
                            className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder="Masukkan kode risiko"
                            required
                        />
                        {errors.id_identify && <div className="mt-1 text-sm text-red-500">{errors.id_identify}</div>}
                    </div>

                    {/* Risk Category */}
                    <div>
                        <label className="mb-1 block font-medium">Kategori Risiko</label>
                        <select
                            value={data.risk_category}
                            onChange={(e) => setData('risk_category', e.target.value)}
                            className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            required
                        >
                            <option value="">Pilih Kategori</option>
                            <option value="Operasional">Operasional</option>
                            <option value="Finansial">Finansial</option>
                            <option value="Kepatuhan">Kepatuhan</option>
                            <option value="Strategis">Strategis</option>
                            <option value="Reputasi">Kecurangan</option>
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
                                className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
                                className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
                            className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
                                    className="flex-1 rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
                                    className="flex-1 rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
                                className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
                                className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
                                className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
                                className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
                                className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
                                className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
                                className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
                                className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
                                    className="flex-1 rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
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

                    {/* 🔥 TAMBAHAN: BUKTI RISIKO SECTION */}
                    <div className="border-t-2 pt-6">
                        <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-6">
                            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-700">
                                <Paperclip size={28} />
                                Bukti Risiko (Opsional)
                            </h3>
                            <p className="mb-4 text-sm text-gray-600">
                                Upload dokumen pendukung sebagai bukti risiko (PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, JPG, PNG)
                            </p>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">Nama Bukti</label>
                                    <input
                                        type="text"
                                        value={data.bukti_risiko_nama}
                                        onChange={(e) => setData('bukti_risiko_nama', e.target.value)}
                                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                                        placeholder="Nama dokumen bukti (akan menggunakan nama file jika kosong)"
                                    />
                                    {errors.bukti_risiko_nama && <p className="mt-1 text-sm text-red-600">{errors.bukti_risiko_nama}</p>}
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">Upload File Bukti</label>
                                    <input
                                        type="file"
                                        onChange={(e) => setData('bukti_risiko_file', e.target.files?.[0] || null)}
                                        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png"
                                        className="w-full rounded-md border border-gray-300 px-3 py-2 file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                                    />
                                    {errors.bukti_risiko_file && <p className="mt-1 text-sm text-red-600">{errors.bukti_risiko_file}</p>}
                                    <p className="mt-1 text-xs text-gray-500">
                                        Format: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, JPG, JPEG, PNG (Maksimal: 10MB)
                                    </p>
                                </div>
                            </div>

                            {/* File preview jika ada file yang dipilih */}
                            {data.bukti_risiko_file && (
                                <div className="mt-4 rounded-md border border-blue-200 bg-blue-50 p-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-blue-600">📄</span>
                                        <span className="text-sm font-medium text-blue-800">File dipilih: {data.bukti_risiko_file.name}</span>
                                        <span className="text-xs text-blue-600">({Math.round(data.bukti_risiko_file.size / 1024)} KB)</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Status */}
                    <div>
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={data.is_active}
                                onChange={(e) => setData('is_active', e.target.checked)}
                                className="form-check-input rounded"
                            />
                            <span className="font-medium">Status Aktif</span>
                        </label>
                        <small className="text-gray-500">Centang jika risiko ini masih aktif dipantau</small>
                    </div>

                    {/* Submit Buttons */}
                    <div className="mt-8 flex justify-between border-t pt-4">
                        <button
                            type="submit"
                            disabled={processing}
                            className="flex items-center gap-2 rounded-md bg-green-600 px-8 py-3 font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {processing ? (
                                <>
                                    <Hourglass className="animate-spin" />
                                    Menyimpan...
                                </>
                            ) : (
                                <>
                                    <Save />
                                    {identifyRisk ? 'Update Risiko' : 'Simpan Risiko'}
                                </>
                            )}
                        </button>

                        <Link
                            href={route('identify-risk.index')}
                            className="flex items-center gap-2 rounded-md border border-gray-300 bg-red-600 px-8 py-3 font-medium text-white transition hover:bg-red-700"
                        >
                            <X />
                            Batal
                        </Link>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

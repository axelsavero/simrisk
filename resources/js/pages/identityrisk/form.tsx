// resources/js/pages/identityrisk/form.tsx

import AppLayout from '@/layouts/app-layout'; // <-- 1. IMPORT AppLayout
import { IdentityRisk } from '@/types'; // Pastikan PageProps dan IdentityRisk diimpor dari types
import { Link, useForm } from '@inertiajs/react'; // usePage mungkin tidak perlu di sini jika tidak ada props global lain yg dipakai langsung
import React from 'react';

// Interface FormProps bisa disederhanakan jika PageProps sudah mencakup identityRisk
interface FormProps {
    // Anda bisa juga menggunakan extends PageProps
    identityRisk?: IdentityRisk | null;
    // allRoles tidak lagi diperlukan di sini karena form ini untuk IdentityRisk, bukan User
}

interface FormData {
    id_identity: string;
    status: boolean;
    risk_category: string;
    identification_date_start: string;
    identification_date_end: string;
    description: string;
    probability: string;
    impact: string;
}

export default function Form({ identityRisk = null }: FormProps) {
    // Nama komponen adalah 'Form'
    const { data, setData, post, put, processing, errors, reset } = useForm<FormData>({
        id_identity: identityRisk?.id_identity || '',
        status: identityRisk ? identityRisk.status : true,
        risk_category: identityRisk?.risk_category || '',
        identification_date_start: identityRisk?.identification_date_start || new Date().toISOString().split('T')[0],
        identification_date_end: identityRisk?.identification_date_end || new Date().toISOString().split('T')[0],
        description: identityRisk?.description || '',
        probability: identityRisk?.probability?.toString() || '1',
        impact: identityRisk?.impact?.toString() || '1',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        if (identityRisk) {
            put(route('identity-risk.update', identityRisk.id), {
                onError: (formErrors) => console.log(formErrors), // Ganti errors dengan formErrors agar tidak konflik
            });
        } else {
            post(route('identity-risk.store'), {
                onError: (formErrors) => console.log(formErrors), // Ganti errors dengan formErrors
            });
        }
    }

    // Judul halaman dinamis berdasarkan mode create atau edit
    const pageTitle = identityRisk ? `Edit Risiko: ${identityRisk.id_identity}` : 'Tambah Identifikasi Risiko';

    return (
        <>
            {/* <Head title={pageTitle} /> Komponen Head sudah dihandle oleh AppLayout */}

            {/* Konten form Anda akan dimulai di sini */}
            <div className="container py-4">
                {' '}
                {/* Ini bisa jadi bagian dari children di AppLayout */}
                <div className="row justify-content-center">
                    <div className="col-md-8">
                        <div className="card">
                            <div className="card-header">
                                <h1>
                                    {identityRisk
                                        ? `Edit Identifikasi Risiko: ${data.id_identity || identityRisk.id_identity}`
                                        : 'Tambah Identifikasi Risiko Baru'}
                                </h1>
                            </div>
                            <div className="card-body">
                                <form onSubmit={submit}>
                                    {/* ID Unik Risiko */}
                                    <div className="mb-3">
                                        <label htmlFor="id_identity" className="form-label">
                                            ID Unik Risiko
                                        </label>
                                        <input
                                            type="text"
                                            id="id_identity"
                                            className={`form-control ${errors.id_identity ? 'is-invalid' : ''}`}
                                            value={data.id_identity}
                                            onChange={(e) => setData('id_identity', e.target.value)}
                                        />
                                        {errors.id_identity && <div className="invalid-feedback">{errors.id_identity}</div>}
                                    </div>

                                    {/* Kategori Risiko */}
                                    <div className="mb-3">
                                        <label htmlFor="risk_category" className="form-label">
                                            Kategori Risiko
                                        </label>
                                        <input
                                            type="text"
                                            id="risk_category"
                                            className={`form-control ${errors.risk_category ? 'is-invalid' : ''}`}
                                            value={data.risk_category}
                                            onChange={(e) => setData('risk_category', e.target.value)}
                                        />
                                        {errors.risk_category && <div className="invalid-feedback">{errors.risk_category}</div>}
                                    </div>

                                    {/* Tanggal Mulai dan Selesai */}
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label htmlFor="identification_date_start" className="form-label">
                                                Tanggal Mulai Identifikasi
                                            </label>
                                            <input
                                                type="date"
                                                id="identification_date_start"
                                                className={`form-control ${errors.identification_date_start ? 'is-invalid' : ''}`}
                                                value={data.identification_date_start}
                                                onChange={(e) => setData('identification_date_start', e.target.value)}
                                            />
                                            {errors.identification_date_start && (
                                                <div className="invalid-feedback">{errors.identification_date_start}</div>
                                            )}
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label htmlFor="identification_date_end" className="form-label">
                                                Tanggal Selesai Identifikasi
                                            </label>
                                            <input
                                                type="date"
                                                id="identification_date_end"
                                                className={`form-control ${errors.identification_date_end ? 'is-invalid' : ''}`}
                                                value={data.identification_date_end}
                                                onChange={(e) => setData('identification_date_end', e.target.value)}
                                            />
                                            {errors.identification_date_end && (
                                                <div className="invalid-feedback">{errors.identification_date_end}</div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Deskripsi Risiko */}
                                    <div className="mb-3">
                                        <label htmlFor="description" className="form-label">
                                            Deskripsi Risiko
                                        </label>
                                        <textarea
                                            id="description"
                                            className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            rows={3}
                                        ></textarea>
                                        {errors.description && <div className="invalid-feedback">{errors.description}</div>}
                                    </div>

                                    {/* Probabilitas dan Impact */}
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label htmlFor="probability" className="form-label">
                                                Probabilitas (1-5)
                                            </label>
                                            <input
                                                type="number"
                                                id="probability"
                                                className={`form-control ${errors.probability ? 'is-invalid' : ''}`}
                                                min="1"
                                                max="5"
                                                value={data.probability}
                                                onChange={(e) => setData('probability', e.target.value)}
                                            />
                                            {errors.probability && <div className="invalid-feedback">{errors.probability}</div>}
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label htmlFor="impact" className="form-label">
                                                Impact (1-5)
                                            </label>
                                            <input
                                                type="number"
                                                id="impact"
                                                className={`form-control ${errors.impact ? 'is-invalid' : ''}`}
                                                min="1"
                                                max="5"
                                                value={data.impact}
                                                onChange={(e) => setData('impact', e.target.value)}
                                            />
                                            {errors.impact && <div className="invalid-feedback">{errors.impact}</div>}
                                        </div>
                                    </div>

                                    {/* Status Aktif */}
                                    <div className="form-check mb-3">
                                        <input
                                            type="checkbox"
                                            id="status"
                                            className="form-check-input"
                                            checked={data.status}
                                            onChange={(e) => setData('status', e.target.checked)}
                                        />
                                        <label htmlFor="status" className="form-check-label">
                                            Status Aktif
                                        </label>
                                    </div>

                                    {/* Tombol Aksi */}
                                    <div className="d-flex mt-4 gap-2">
                                        <button type="submit" className="btn btn-primary" disabled={processing}>
                                            {processing
                                                ? identityRisk
                                                    ? 'Memperbarui...'
                                                    : 'Menyimpan...'
                                                : identityRisk
                                                  ? 'Simpan Perubahan'
                                                  : 'Buat Identifikasi'}
                                        </button>
                                        <Link href={route('identity-risk.index')} className="btn btn-secondary">
                                            Batal
                                        </Link>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

// ---> 2. TETAPKAN LAYOUT UNTUK HALAMAN FORM INI <---
Form.layout = (page: React.ReactNode) => {
    // Anda bisa mengambil props dari page untuk membuat judul lebih dinamis jika perlu
    // Contoh: const pageProps = (page as any).props as FormProps;
    // const title = pageProps.identityRisk ? `Edit Risiko: ${pageProps.identityRisk.id_identity}` : 'Tambah Identifikasi Risiko';
    // return <AppLayout children={page} title={title} />;

    // Atau judul statis untuk form
    return <AppLayout children={page} title="Form Identifikasi Risiko" />;
};

// resources/js/pages/identifyrisk/show.tsx (FULL CODE)

import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, IdentifyRisk } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Bomb, ChartColumn, CheckCircle2, CircleHelp, CornerDownLeft, FileText, Hourglass, Info, Pencil, ShieldCheck, TriangleAlert, X } from 'lucide-react';

interface ShowProps {
    identifyRisk: IdentifyRisk & {
        bukti_files?: Array<{
            nama_bukti: string;
            file_name: string;
            file_path: string;
            file_size: number;
            file_extension: string;
            uploaded_by: string;
            uploaded_at: string;
        }>;
        penyebab: Array<{ id: number; description: string }>;
        dampak_kualitatif: Array<{ id: number; description: string }>;
        penanganan_risiko: Array<{ id: number; description: string }>;
        validation_processor?: { name: string };
    };
}

export default function Show() {
    const { identifyRisk } = usePage<ShowProps>().props;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Manajemen Risiko', href: route('identify-risk.index') },
        { title: `Detail Risiko ${identifyRisk.id_identify}`, href: '#' },
    ];

    // Calculate risk level info
    const riskLevel = identifyRisk.probability * identifyRisk.impact;
    const getRiskLevelInfo = (level: number) => {
        if (level >= 20) return { text: 'Sangat Tinggi', color: 'bg-red-100 text-red-800', icon: '🔴' };
        if (level >= 15) return { text: 'Tinggi', color: 'bg-orange-100 text-orange-800', icon: '🟠' };
        if (level >= 8) return { text: 'Sedang', color: 'bg-yellow-100 text-yellow-800', icon: '🟡' };
        return { text: 'Rendah', color: 'bg-green-100 text-green-800', icon: '🟢' };
    };

    const riskInfo = getRiskLevelInfo(riskLevel);

    // Validation status info
    const getValidationStatusInfo = (status: string) => {
        switch (status) {
            case 'draft':
                return { label: 'Draft', color: 'bg-gray-100 text-gray-800', icon: <FileText/> };
            case 'submitted':
            case 'pending':
                return { label: 'Menunggu Validasi', color: 'bg-yellow-100 text-yellow-800', icon: <Hourglass/> };
            case 'approved':
                return { label: 'Disetujui', color: 'bg-green-100 text-green-800', icon: <CheckCircle2/> };
            case 'rejected':
                return { label: 'Ditolak', color: 'bg-red-100 text-red-800', icon: <X/> };
            default:
                return { label: 'Unknown', color: 'bg-gray-100 text-gray-800', icon: <CircleHelp /> };
        }
    };

    const validationInfo = getValidationStatusInfo(identifyRisk.validation_status);

    // File size formatter
    const formatFileSize = (bytes: number): string => {
        const units = ['B', 'KB', 'MB', 'GB'];
        let size = bytes;
        let unitIndex = 0;

        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }

        return `${Math.round(size * 100) / 100} ${units[unitIndex]}`;
    };

    // File icon based on extension
    const getFileIcon = (extension: string): string => {
        switch (extension.toLowerCase()) {
            case 'pdf':
                return '📄';
            case 'doc':
            case 'docx':
                return '📝';
            case 'xls':
            case 'xlsx':
                return '📊';
            case 'ppt':
            case 'pptx':
                return '📋';
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
                return '🖼️';
            default:
                return '📎';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Detail Risiko ${identifyRisk.id_identify}`} />

            <div className="mx-auto max-w-6xl px-6 py-8 w-screen">
                {/* Header Section */}
                <div className="mb-6 rounded-lg bg-white p-6 shadow-md">
                    <div className="mb-4 flex items-start justify-between">
                        <div>
                            <h1 className="mb-2 text-3xl font-bold text-gray-900">{identifyRisk.id_identify}</h1>
                            <p className="text-lg text-gray-600">{identifyRisk.risk_category}</p>
                        </div>
                        <div className="flex gap-3">
                            <span className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium ${validationInfo.color}`}>
                                {validationInfo.icon} {validationInfo.label}
                            </span>
                            <span className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium ${riskInfo.color}`}>
                                {riskInfo.icon} {riskInfo.text} ({riskLevel}/25)
                            </span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 border-t pt-4">
                        <Link
                            href={route('identify-risk.edit', identifyRisk.id)}
                            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
                        >
                            <Pencil/>
                            Edit
                        </Link>
                        <button
                            onClick={() => router.post(route('identify-risk.submit', identifyRisk.id))}
                            className="inline-flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700"
                        >
                            <CheckCircle2/>
                            Submit
                        </button>
                        <Link
                            href={route('identify-risk.index')}
                            className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50"
                        >
                            <CornerDownLeft /> Kembali
                        </Link>
                    </div>
                </div>

                {/* Basic Information */}
                <div className="mb-6 rounded-lg bg-white p-6 shadow-md">
                    <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
                        <Info />
                        Informasi Dasar
                    </h2>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Periode Identifikasi</label>
                            <p className="text-gray-900">
                                {new Date(identifyRisk.identification_date_start).toLocaleDateString('id-ID')} -{' '}
                                {new Date(identifyRisk.identification_date_end).toLocaleDateString('id-ID')}
                            </p>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Status</label>
                            <p className="text-gray-900">{identifyRisk.status ? 'Aktif' : 'Non-Aktif'}</p>
                        </div>

                        {identifyRisk.nama_risiko && (
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Penanggung Jawab</label>
                                <p className="text-gray-900">{identifyRisk.nama_risiko}</p>
                                {identifyRisk.jabatan_risiko && <p className="text-sm text-gray-500">{identifyRisk.jabatan_risiko}</p>}
                            </div>
                        )}

                        {identifyRisk.no_kontak && (
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Kontak</label>
                                <p className="text-gray-900">{identifyRisk.no_kontak}</p>
                            </div>
                        )}
                    </div>

                    <div className="mt-6">
                        <label className="mb-2 block text-sm font-medium text-gray-700">Deskripsi Risiko</label>
                        <div className="rounded-lg bg-gray-50 p-4">
                            <p className="whitespace-pre-wrap text-gray-900">{identifyRisk.description}</p>
                        </div>
                    </div>
                </div>

                {/* Risk Assessment */}
                <div className="mb-6 rounded-lg bg-white p-6 shadow-md">
                    <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
                        <ChartColumn />
                        Assessment Risiko
                    </h2>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        <div className="rounded-lg bg-blue-50 p-4 text-center">
                            <div className="text-2xl font-bold text-blue-600">{identifyRisk.probability}</div>
                            <div className="text-sm font-medium text-blue-600">Probabilitas</div>
                            <div className="mt-1 text-xs text-gray-500">Skala 1-5</div>
                        </div>

                        <div className="rounded-lg bg-purple-50 p-4 text-center">
                            <div className="text-2xl font-bold text-purple-600">{identifyRisk.impact}</div>
                            <div className="text-sm font-medium text-purple-600">Dampak</div>
                            <div className="mt-1 text-xs text-gray-500">Skala 1-5</div>
                        </div>

                        <div className={`rounded-lg p-4 text-center ${riskInfo.color.replace('text-', 'text-').replace('bg-', 'bg-')}`}>
                            <div className="text-2xl font-bold">{riskLevel}</div>
                            <div className="text-sm font-medium">Level Risiko</div>
                            <div className="mt-1 text-xs">{riskInfo.text}</div>
                        </div>
                    </div>

                    {/* Additional Risk Info */}
                    {(identifyRisk.strategi || identifyRisk.pengendalian_internal || identifyRisk.biaya_penangan) && (
                        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
                            {identifyRisk.strategi && (
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">Strategi</label>
                                    <p className="text-gray-900">{identifyRisk.strategi}</p>
                                </div>
                            )}

                            {identifyRisk.pengendalian_internal && (
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">Pengendalian Internal</label>
                                    <p className="text-gray-900">{identifyRisk.pengendalian_internal}</p>
                                </div>
                            )}

                            {identifyRisk.biaya_penangan && (
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">Biaya Penanganan</label>
                                    <p className="text-gray-900">Rp {Number(identifyRisk.biaya_penangan).toLocaleString('id-ID')}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Penyebab Risiko */}
                {identifyRisk.penyebab && identifyRisk.penyebab.length > 0 && (
                    <div className="mb-6 rounded-lg bg-white p-6 shadow-md">
                        <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
                            <TriangleAlert />
                            Penyebab Risiko
                        </h2>
                        <div className="space-y-3">
                            {identifyRisk.penyebab.map((item, index) => (
                                <div key={item.id} className="flex items-start gap-3 rounded-lg bg-gray-50 p-3">
                                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-red-100 text-sm font-medium text-red-600">
                                        {index + 1}
                                    </span>
                                    <p className="text-gray-900">{item.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Dampak Kualitatif */}
                {identifyRisk.dampak_kualitatif && identifyRisk.dampak_kualitatif.length > 0 && (
                    <div className="mb-6 rounded-lg bg-white p-6 shadow-md">
                        <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
                            <Bomb />
                            Dampak Kualitatif
                        </h2>
                        <div className="space-y-3">
                            {identifyRisk.dampak_kualitatif.map((item, index) => (
                                <div key={item.id} className="flex items-start gap-3 rounded-lg bg-gray-50 p-3">
                                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-medium text-orange-600">
                                        {index + 1}
                                    </span>
                                    <p className="text-gray-900">{item.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Penanganan Risiko */}
                {identifyRisk.penanganan_risiko && identifyRisk.penanganan_risiko.length > 0 && (
                    <div className="mb-6 rounded-lg bg-white p-6 shadow-md">
                        <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
                            <ShieldCheck />
                            Penanganan Risiko
                        </h2>
                        <div className="space-y-3">
                            {identifyRisk.penanganan_risiko.map((item, index) => (
                                <div key={item.id} className="flex items-start gap-3 rounded-lg bg-gray-50 p-3">
                                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-100 text-sm font-medium text-green-600">
                                        {index + 1}
                                    </span>
                                    <p className="text-gray-900">{item.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 🔥 BUKTI RISIKO SECTION */}
                {identifyRisk.bukti_files && identifyRisk.bukti_files.length > 0 && (
                    <div className="mb-6 rounded-lg bg-white p-6 shadow-md">
                        <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
                            <span>📎</span>
                            Bukti Risiko ({identifyRisk.bukti_files.length})
                        </h2>

                        <div className="grid grid-cols-1 gap-4">
                            {identifyRisk.bukti_files.map((bukti, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50"
                                >
                                    <div className="flex items-center space-x-4">
                                        <span className="text-3xl">{getFileIcon(bukti.file_extension)}</span>
                                        <div>
                                            <h4 className="font-medium text-gray-900">{bukti.nama_bukti}</h4>
                                            <p className="text-sm text-gray-500">
                                                {bukti.file_name} • {formatFileSize(bukti.file_size)}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                Diunggah oleh {bukti.uploaded_by} •{' '}
                                                {new Date(bukti.uploaded_at).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex space-x-2">
                                        <a
                                            href={route('identify-risk.download-bukti', identifyRisk.id)}
                                            className="inline-flex items-center gap-2 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-100"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            📥 Download
                                        </a>
                                        <a
                                            href={`/storage/${bukti.file_path}`}
                                            className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            👁️ Preview
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Validation Info */}
                {(identifyRisk.validation_processed_at || identifyRisk.rejection_reason) && (
                    <div className="rounded-lg bg-white p-6 shadow-md">
                        <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
                            <span>🔍</span>
                            Informasi Validasi
                        </h2>

                        <div className="space-y-4">
                            {identifyRisk.validation_processed_at && (
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">Tanggal Diproses</label>
                                    <p className="text-gray-900">
                                        {new Date(identifyRisk.validation_processed_at).toLocaleDateString('id-ID', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </p>
                                </div>
                            )}

                            {identifyRisk.validation_processor && (
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">Diproses oleh</label>
                                    <p className="text-gray-900">{identifyRisk.validation_processor.name}</p>
                                </div>
                            )}

                            {identifyRisk.rejection_reason && (
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">Alasan Penolakan</label>
                                    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                                        <p className="text-red-800">{identifyRisk.rejection_reason}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

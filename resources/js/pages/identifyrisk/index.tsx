import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, IdentifyRisk } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import { CheckCircle2, CirclePlus, Eye, ShieldAlert, X } from 'lucide-react';
import React from 'react';
import Swal from 'sweetalert2';
import '../../../css/IdentifyRiskIndex.css';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Validasi Input Risiko', href: route('identify-risk.index') },
];

// Define PageProps type according to your props structure
type PageProps = {
    identifyRisks: {
        data: IdentifyRisk[];
        links?: Array<{ url: string | null; label: string; active: boolean }>;
    };
    flash?: any;
    auth?: any;
    permissions?: {
        canCreate?: boolean;
        canEdit?: boolean;
        canDelete?: boolean;
        canSubmit?: boolean;
        canValidate?: boolean;
        canApprove?: boolean;
        canReject?: boolean;
    };
};

const Pagination = ({ links }: { links: Array<{ url: string | null; label: string; active: boolean }> }) => {
    if (!links || links.length <= 3) {
        return null;
    }
    return (
        <nav aria-label="Page navigation" className="pagination-wrapper">
            <ul className="pagination">
                {links.map((link, index) => (
                    <li key={index} className={`page-item ${link.active ? 'active' : ''} ${!link.url ? 'disabled' : ''}`}>
                        {link.url ? (
                            <Link className="page-link" href={link.url} dangerouslySetInnerHTML={{ __html: link.label }} preserveScroll />
                        ) : (
                            <span className="page-link" dangerouslySetInnerHTML={{ __html: link.label }} />
                        )}
                    </li>
                ))}
            </ul>
        </nav>
    );
};

import { useState } from 'react';

export default function Index() {
    const { identifyRisks, permissions, auth } = usePage<PageProps>().props;

    // Cek role user
    const userRole = auth?.user?.roles?.[0]?.name || '';

    // State to track approval/rejection status per risk id (for instant UI only)
    const [actionStatus, setActionStatus] = useState<Record<string, 'Accepted' | 'Rejected' | undefined>>({});

    const handleApprove = (item: IdentifyRisk) => {
        Swal.fire({
            icon: 'success',
            title: 'Risiko disetujui',
            text: 'Risiko telah disetujui.',
            confirmButtonText: 'OK',
        }).then(() => {
            router.post(
                route('identify-risk.approve', item.id),
                {},
                {
                    onSuccess: () => {
                        Swal.fire('Berhasil', 'Risiko telah disetujui.', 'success');
                    },
                },
            );
        });
    };

    const handleReject = (item: IdentifyRisk) => {
        Swal.fire({
            title: 'Tolak Risiko',
            // ... (form alasan)
            preConfirm: () => {
                const alasan = (document.getElementById('alasan-tolak') as HTMLTextAreaElement)?.value;
                if (!alasan) {
                    Swal.showValidationMessage('Alasan wajib diisi');
                }
                return alasan;
            },
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(
                    route('identify-risk.reject', item.id),
                    { rejection_reason: result.value },
                    {
                        onSuccess: () => {
                            Swal.fire('Ditolak!', 'Risiko telah ditolak.', 'success');
                        },
                    },
                );
            }
        });
    };

    if (userRole === 'owner-risk') {
        return (
            <div className="risk-index-container w-full px-2 md:px-6">
                <div className="page-header rounded-t bg-gray-200 p-2">
                    <div className="header-content flex items-center justify-between">
                        <h1 className="page-title text-lg font-semibold">Identifikasi Risiko</h1>
                        <div className="flex items-center gap-2">
                            {permissions?.canCreate && (
                                <Link href={route('identify-risk.create')} className="btn btn-primary btn-create flex items-center gap-1">
                                    <span className="hidden sm:inline">Tambah</span> <CirclePlus size={20} />
                                </Link>
                            )}
                            <input type="text" className="rounded border px-2 py-1" placeholder="Cari . . ." />
                        </div>
                    </div>
                </div>
                <div className="overflow-x-auto rounded-b border border-gray-400 bg-white">
                    <table className="min-w-full table-fixed border-collapse border border-black text-xs">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border border-black px-2 py-1 text-center align-middle font-bold">No</th>
                                <th className="border border-black px-2 py-1 text-center align-middle font-bold">Kode Risiko</th>
                                <th className="border border-black px-2 py-1 text-center align-middle font-bold">Unit Kerja</th>
                                <th className="border border-black px-2 py-1 text-center align-middle font-bold">Deskripsi</th>
                                <th className="border border-black px-2 py-1 text-center align-middle font-bold">Penyebab</th>
                                <th className="border border-black px-2 py-1 text-center align-middle font-bold">Probabilitas Inherent</th>
                                <th className="border border-black px-2 py-1 text-center align-middle font-bold">Impact Inherent</th>
                                <th className="border border-black px-2 py-1 text-center align-middle font-bold">Tingkat Risiko Inherent</th>
                                <th className="border border-black px-2 py-1 text-center align-middle font-bold">Status</th>
                                <th className="border border-black px-2 py-1 text-center align-middle font-bold">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {identifyRisks?.data && identifyRisks.data.length > 0 ? (
                                identifyRisks.data
                                    .filter(item => item.validation_status !== 'approved') // hide if approved
                                    .map((item: IdentifyRisk, idx: number) => {
                                        // Status logic
                                        let statusLabel = '';
                                        if (item.validation_status === 'draft') {
                                            statusLabel = 'Pending';
                                        } else if (item.validation_status === 'pending' || item.validation_status === 'submitted') {
                                            statusLabel = 'Proses';
                                        } else if (item.validation_status === 'rejected') {
                                            statusLabel = 'Ditolak';
                                        }
                                        // Risk level logic
                                        const riskScore = item.probability * item.impact;
                                        let riskLabel = '';
                                        let riskColor = '';
                                        if (riskScore >= 20) {
                                            riskLabel = 'Tinggi';
                                            riskColor = 'text-red-600 font-bold';
                                        } else if (riskScore >= 3) {
                                            riskLabel = 'Sedang';
                                            riskColor = 'text-orange-500 font-semibold';
                                        } else {
                                            riskLabel = 'Rendah';
                                            riskColor = 'text-green-600 font-semibold';
                                        }
                                        return (
                                            <tr key={item.id} className="hover:bg-gray-50">
                                                <td className="border border-black px-2 py-1 text-center align-middle">{idx + 1}</td>
                                                <td className="border border-black px-2 py-1 text-center align-middle">{item.id_identify}</td>
                                                <td className="border border-black px-2 py-1 text-center align-middle">{item.unit_kerja || ''}</td>
                                                <td className="border border-black px-2 py-1 align-middle break-words">{item.description}</td>
                                                <td className="border border-black px-2 py-1 align-middle break-words">
                                                    {Array.isArray(item.penyebab)
                                                        ? item.penyebab.map((p: any, i: number) => (
                                                            <div key={i}>{typeof p === 'string' ? p : p.description}</div>
                                                        ))
                                                        : item.penyebab || ''}
                                                </td>
                                                <td className="border border-black px-2 py-1 text-center align-middle">{item.probability}</td>
                                                <td className="border border-black px-2 py-1 text-center align-middle">{item.impact}</td>
                                                <td className={`border border-black px-2 py-1 text-center align-middle ${riskColor}`}>{riskLabel}</td>
                                                <td className="border border-black px-2 py-1 text-center align-middle">{statusLabel}</td>
                                                <td className="border border-black px-2 py-1 text-center align-middle">
                                                    <div className="flex items-center gap-1 justify-center">
                                                        <Link
                                                            href={route('identify-risk.show', item.id)}
                                                            title="Detail"
                                                            className="inline-flex items-center justify-center"
                                                        >
                                                            <Eye />
                                                        </Link>
                                                        {(item.validation_status === 'draft' || item.validation_status === 'rejected') && (
                                                            <Link
                                                                href={route('identify-risk.edit', item.id)}
                                                                title="Edit"
                                                                className="inline-flex items-center justify-center"
                                                            >
                                                                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                                    <path d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-2.828 0L9 13zm-6 6h18" />
                                                                </svg>
                                                            </Link>
                                                        )}
                                                        {item.validation_status === 'draft' && (
                                                            <button
                                                                title="Kirim ke Validator"
                                                                className="inline-flex items-center justify-center text-blue-600"
                                                                onClick={() => {
                                                                    router.post(route('identify-risk.submit', item.id));
                                                                }}
                                                            >
                                                                Kirim
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                            ) : (
                                <tr>
                                    <td colSpan={10} className="py-8 text-center text-gray-500">
                                        Tidak ada data risiko.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    // Tabel default (admin)
    return (
        <div className="risk-index-container w-full px-2 md:px-6">
            {/* Header Section (tetap) */}
            <div className="page-header">
                <div className="header-content">
                    <div className="header-info">
                        <h1 className="page-title">
                            <ShieldAlert size={40} className="title-icon" />
                            Validasi Input Risiko
                        </h1>
                    </div>
                    {permissions?.canCreate && (
                        <Link href={route('identify-risk.create')} className="btn btn-primary btn-create flex items-center gap-1">
                            Tambah <CirclePlus size={20} />
                        </Link>
                    )}
                </div>
            </div>

            <div className="mt-6 overflow-x-auto">
                <table className="min-w-full rounded-lg border border-gray-300 bg-white shadow-sm">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="border px-3 py-2 text-center">No</th>
                            <th className="border px-3 py-2 text-center">Kode Risiko</th>
                            <th className="border px-3 py-2 text-center">Unit Kerja</th>
                            <th className="border px-3 py-2 text-center">Deskripsi</th>
                            <th className="border px-3 py-2 text-center">Tingkat Risiko</th>
                            <th className="border px-3 py-2 text-center">Dokumen</th>
                            <th className="border px-3 py-2 text-center">Detail</th>
                            <th className="border px-3 py-2 text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {identifyRisks?.data && identifyRisks.data.length > 0 ? (
                            identifyRisks.data.map((item: IdentifyRisk, idx: number) => {
                                // Risk level logic (simple)
                                const riskScore = item.probability * item.impact;
                                let riskLabel = '';
                                let riskColor = '';
                                if (riskScore >= 20) {
                                    riskLabel = 'Tinggi';
                                    riskColor = 'text-red-600 font-bold';
                                } else if (riskScore >= 3) {
                                    riskLabel = 'Sedang';
                                    riskColor = 'text-orange-500 font-semibold';
                                } else {
                                    riskLabel = 'Rendah';
                                    riskColor = 'text-green-600 font-semibold';
                                }

                                return (
                                    <tr key={item.id} className="hover:bg-gray-50">
                                        <td className="border px-3 py-2 text-center">{idx + 1}</td>
                                        <td className="border px-3 py-2 text-center">{item.id_identify}</td>
                                        <td className="border px-3 py-2 text-center">{item.unit_kerja || '-'}</td>
                                        <td className="border px-3 py-2">{item.description}</td>
                                        <td className={`border px-3 py-2 text-center ${riskColor}`}>{riskLabel}</td>
                                        <td className="border px-3 py-2 text-center">-</td>
                                        <td className="border px-3 py-2 text-center">
                                            <Link
                                                href={route('identify-risk.show', item.id)}
                                                title="Detail"
                                                className="inline-flex items-center justify-center"
                                            >
                                                <Eye />
                                            </Link>
                                        </td>
                                        <td className="border px-3 py-2 text-center">
                                            {item.validation_status === 'approved' ? (
                                                <span className="font-semibold text-green-600">Accepted</span>
                                            ) : item.validation_status === 'rejected' ? (
                                                <span className="font-semibold text-red-600">Rejected</span>
                                            ) : (
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        title="Setujui"
                                                        className="rounded border border-gray-400 p-1 hover:bg-green-100"
                                                        onClick={() => handleApprove(item)}
                                                    >
                                                        <CheckCircle2 />
                                                    </button>
                                                    <button
                                                        title="Tolak"
                                                        className="rounded border border-gray-400 p-1 hover:bg-red-100"
                                                        onClick={() => handleReject(item)}
                                                    >
                                                        <X />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={8} className="py-8 text-center text-gray-500">
                                    Tidak ada data risiko.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

Index.layout = (page: React.ReactNode) => {
    return <AppLayout breadcrumbs={breadcrumbs} children={page} />;
};
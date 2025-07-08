// resources/js/pages/identifyrisk/index.tsx (FULL CODE WITH DETAIL BUTTON)

import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, IdentifyRisk } from '@/types';
import { Link, usePage } from '@inertiajs/react';
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

    // Handler aksi
    const handleReject = (item: IdentifyRisk) => {
        Swal.fire({
            title: 'Tolak Risiko',
            html: `
                <div style='text-align:left'>
                    <div style='margin-bottom:8px'><b>Kode Risiko</b> : ${item.id_identify}</div>
                    <div style='margin-bottom:8px'><b>Deskripsi Risiko</b> : ${item.description}</div>
                    <div style='margin-bottom:8px'><b>Penyebab Risiko</b> : ${Array.isArray(item.penyebab) ? item.penyebab.map((p: any) => (typeof p === 'string' ? p : p.description)).join(', ') : item.penyebab || ''}</div>
                    <div style='margin-bottom:8px'><b>Alasan</b> : </div>
                    <textarea id='alasan-tolak' class='swal2-textarea' style='width:80%;height:60px'></textarea>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'Tolak',
            cancelButtonText: 'Batal',
            focusConfirm: false,
            preConfirm: () => {
                const alasan = (document.getElementById('alasan-tolak') as HTMLTextAreaElement)?.value;
                if (!alasan) {
                    Swal.showValidationMessage('Alasan wajib diisi');
                }
                return alasan;
            },
        }).then((result) => {
            if (result.isConfirmed) {
                // TODO: Kirim alasan penolakan ke backend
                setActionStatus((prev) => ({ ...prev, [item.id]: 'Rejected' }));
                Swal.fire('Ditolak!', 'Risiko telah ditolak.', 'success');
            }
        });
    };

    const handleApprove = (item: IdentifyRisk) => {
        Swal.fire({
            icon: 'success',
            title: 'Risiko disetujui',
            text: 'Risiko telah disetujui.',
            confirmButtonText: 'OK',
        }).then(() => {
            setActionStatus((prev) => ({ ...prev, [item.id]: 'Accepted' }));
        });
        // TODO: Kirim status persetujuan ke backend
    };

    if (userRole === 'owner-risk') {
        return (
            <div className="risk-index-container w-full px-2 md:px-6">
                <div className="page-header">
                    <div className="header-content">
                        <div className="header-info">
                            <h1 className="page-title">
                                <ShieldAlert size={40} className="title-icon" />
                                Identifikasi Risiko
                            </h1>
                        </div>
                        {permissions?.canCreate && (
                            <Link href={route('identify-risk.create')} className="btn btn-primary btn-create flex items-center gap-1">
                                Tambah <CirclePlus size={20} />
                            </Link>
                        )}
                        {/* Tombol cari dummy */}
                        <div className="ml-2">
                            <input type="text" className="rounded border px-2 py-1" placeholder="Cari . . ." />
                        </div>
                    </div>
                </div>
                <div className="mt-6 overflow-x-auto">
                    <table className="min-w-full rounded-lg border border-gray-800 bg-white shadow-sm">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="border px-2 py-1 text-center">No</th>
                                <th className="border px-2 py-1 text-center">Kode Risiko</th>
                                <th className="border px-2 py-1 text-center">Unit Kerja</th>
                                <th className="border px-2 py-1 text-center">Deskripsi</th>
                                <th className="border px-2 py-1 text-center">Penyebab</th>
                                <th className="border px-2 py-1 text-center">Probabilitas Inherent</th>
                                <th className="border px-2 py-1 text-center">Impact Inherent</th>
                                <th className="border px-2 py-1 text-center">Tingkat Risiko Inherent</th>
                                <th className="border px-2 py-1 text-center">Status</th>
                                <th className="border px-2 py-1 text-center">Aksi</th>
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
                                            <td className="border px-2 py-1 text-center">{idx + 1}</td>
                                            <td className="border px-2 py-1 text-center">{item.id_identify}</td>
                                            <td className="border px-2 py-1 text-center">{item.unit_kerja || '-'}</td>
                                            <td className="border px-2 py-1">{item.description}</td>
                                            <td className="border px-2 py-1">
                                                {Array.isArray(item.penyebab)
                                                    ? item.penyebab.map((p: any, i: number) => (
                                                          <div key={i}>{typeof p === 'string' ? p : p.description}</div>
                                                      ))
                                                    : item.penyebab || ''}
                                            </td>
                                            <td className="border px-2 py-1 text-center">{item.probability}</td>
                                            <td className="border px-2 py-1 text-center">{item.impact}</td>
                                            <td className={`border px-2 py-1 text-center ${riskColor}`}>{riskLabel}</td>
                                            <td className="border px-2 py-1 text-center">
                                                {/* Status: contoh icon, bisa diganti sesuai kebutuhan */}
                                                <img src="/status-icon.png" alt="status" className="mx-auto h-6 w-6 rounded-full" />
                                            </td>
                                            <td className="border px-2 py-1 text-center">
                                                {String(item.status) === 'Accepted' || actionStatus[item.id] === 'Accepted' ? (
                                                    <span className="font-semibold text-green-600">Accepted</span>
                                                ) : String(item.status) === 'Rejected' || actionStatus[item.id] === 'Rejected' ? (
                                                    <span className="font-semibold text-red-600">Rejected</span>
                                                ) : (
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button title="Setujui" className="text-black" onClick={() => handleApprove(item)}>
                                                            <CheckCircle2 />
                                                        </button>
                                                        <button title="Tolak" className="text-black" onClick={() => handleReject(item)}>
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
                                            {String(item.status) === 'Accepted' || actionStatus[item.id] === 'Accepted' ? (
                                                <span className="font-semibold text-green-600">Accepted</span>
                                            ) : String(item.status) === 'Rejected' || actionStatus[item.id] === 'Rejected' ? (
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

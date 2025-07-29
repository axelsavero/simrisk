// resources/js/pages/identifyrisk/index.tsx (FULL CODE WITH DETAIL BUTTON)

import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, IdentifyRisk } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import {
    Calendar,
    ChartColumnIncreasing,
    CheckCircle2,
    CircleCheck,
    CircleHelp,
    CirclePlus,
    ClipboardX,
    Eye,
    FilePlus,
    Hourglass,
    IdCard,
    Pencil,
    Search,
    ShieldAlert,
    SquarePen,
    Trash2,
    Upload,
    X,
} from 'lucide-react';
import React, { useState } from 'react';
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

export default function Index() {
    const { identifyRisks, flash, auth, permissions } = usePage<PageProps>().props;
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState<string>('');

    console.log('Data identifyRisks diterima di Index.tsx:', identifyRisks);
    console.log('Permissions:', permissions);

    if (!identifyRisks) {
        return (
            <div className="empty-state">
                <ChartColumnIncreasing size={28} className="empty-icon" />
                <h3>Data Tidak Tersedia</h3>
                <p>Data identifikasi risiko tidak tersedia saat ini.</p>
            </div>
        );
    }

    function deleteItem(item: IdentifyRisk) {
        Swal.fire({
            title: 'Hapus Risiko?',
            text: `Yakin ingin menghapus identifikasi risiko "${item.id_identify}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#aaa',
            confirmButtonText: 'Hapus',
            cancelButtonText: 'Batal',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('identify-risk.destroy', item.id), {
                    preserveScroll: true,
                });
            }
        });
    }

    function approveItem(item: IdentifyRisk) {
        Swal.fire({
            title: 'Setujui Risiko?',
            text: `Yakin ingin menyetujui risiko "${item.id_identify}"?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#16a34a',
            cancelButtonColor: '#aaa',
            confirmButtonText: 'Setujui',
            cancelButtonText: 'Batal',
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(route('identify-risk.approve', item.id), {}, { preserveScroll: true });
            }
        });
    }

    function submitItem(item: IdentifyRisk) {
        Swal.fire({
            title: 'Kirim Risiko?',
            text: `Yakin ingin mengirim risiko "${item.id_identify}" untuk validasi?`,
            icon: 'info',
            showCancelButton: true,
            confirmButtonColor: '#2563eb',
            cancelButtonColor: '#aaa',
            confirmButtonText: 'Kirim',
            cancelButtonText: 'Batal',
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(route('identify-risk.submit', item.id), {}, { preserveScroll: true });
            }
        });
    }

    function rejectItem(item: IdentifyRisk) {
        Swal.fire({
            title: 'Tolak Risiko',
            html: `
            <div style="text-align:left;max-width:420px">
                <div style="margin-bottom:8px;word-break:break-word;">
                <strong>Kode Risiko</strong> : ${item.id_identify}
                </div>
                <div style="margin-bottom:8px;word-break:break-word;">
                <strong>Deskripsi Risiko</strong> : ${item.description}
                </div>
                <div style="margin-bottom:8px;word-break:break-word;">
                <strong>Penyebab Risiko</strong> : ${item.penyebab && Array.isArray(item.penyebab) ? item.penyebab.map((p: any) => p.description).join(', ') : ''}
                </div>
                <div style="margin-bottom:8px">
                <strong>Alasan</strong> :
                </div>
                <textarea id="swal-reject-reason" class="swal2-textarea" placeholder="Tuliskan alasan penolakan..." style="width:100%;min-width:0;max-width:95%;min-height:100px;resize:vertical;box-sizing:border-box;overflow-x:hidden"></textarea>
            </div>
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#aaa',
            confirmButtonText: 'Tolak',
            cancelButtonText: 'Batal',
            preConfirm: () => {
                const reason = (document.getElementById('swal-reject-reason') as HTMLTextAreaElement)?.value;
                if (!reason || reason.trim() === '') {
                    Swal.showValidationMessage('Alasan penolakan harus diisi');
                }
                return reason;
            },
        }).then((result) => {
            if (result.isConfirmed && result.value) {
                router.post(route('identify-risk.reject', item.id), { rejection_reason: result.value }, { preserveScroll: true });
            }
        });
    }

    const showEditDeleteActions = permissions?.canEdit || permissions?.canDelete;
    const showValidationActions = permissions?.canValidate;

    // Helper untuk cek apakah tombol edit/submit boleh muncul
    const canShowEdit = (item: IdentifyRisk) => {
        // Hanya muncul jika status draft atau rejected
        // Untuk super-admin, jika sudah divalidasi (approved/rejected), tidak boleh muncul
        if (auth?.user?.roles?.includes('super-admin')) {
            return item.validation_status === 'draft' || item.validation_status === 'rejected';
        }
        return item.validation_status === 'draft' || item.validation_status === 'rejected';
    };

    const canShowSubmit = (item: IdentifyRisk) => {
        // Hanya muncul jika status draft
        // Untuk super-admin, jika sudah divalidasi, tidak boleh muncul
        if (auth?.user?.roles?.includes('super-admin')) {
            return item.validation_status === 'draft';
        }
        return item.validation_status === 'draft';
    };

    const getRiskLevelInfo = (probability: number, impact: number) => {
        const risk = probability * impact;
        if (risk >= 20) return { level: 'Tinggi', color: 'high', icon: '🔴' };
        if (risk >= 9) return { level: 'Sedang', color: 'medium', icon: '🟠' };
        if (risk >= 3) return { level: 'Rendah', color: 'low', icon: '🟡' };
        return { level: 'Sangat Rendah', color: 'Very low', icon: '🟢' };
    };

    // 🔥 OPSI 2: Update function untuk handle 'submitted' sebagai 'pending'
    const getValidationStatusInfo = (status: string) => {
        switch (status) {
            case 'draft':
                return { label: 'Draft', color: 'draft', icon: <SquarePen /> };
            case 'submitted': // TREAT submitted sebagai pending
            case 'pending':
                return { label: 'Menunggu Validasi', color: 'warning', icon: <Hourglass /> };
            case 'approved':
                return { label: 'Disetujui', color: 'success', icon: <CheckCircle2 /> };
            case 'rejected':
                return { label: 'Ditolak', color: 'danger', icon: <X /> };
            default:
                return { label: 'Unknown', color: 'secondary', icon: <CircleHelp /> };
        }
    };

    // 🔥 OPSI 2: Update filter logic untuk include both submitted dan pending
    const filteredRisks = identifyRisks.data.filter((item: IdentifyRisk) => {
        const matchesSearch =
            item.id_identify.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.risk_category.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.description.toLowerCase().includes(searchTerm.toLowerCase());

        // Handle pending filter to include both 'pending' and 'submitted'
        const matchesFilter =
            filterStatus === 'all' ||
            (filterStatus === 'pending' && (item.validation_status === 'pending' || item.validation_status === 'submitted')) ||
            (filterStatus !== 'pending' && item.validation_status === filterStatus);

        return matchesSearch && matchesFilter;
    });

    return (
        <div className="risk-index-container w-full px-2 md:px-6">
            {/* Header Section */}
            <div className="page-header">
                <div className="header-content">
                    <div className="header-info">
                        <h1 className="page-title">
                            <ShieldAlert size={40} className="title-icon" />
                            Manajemen Risiko
                        </h1>
                        <p className="page-subtitle">Kelola dan pantau identifikasi risiko organisasi Anda</p>
                    </div>
                    {permissions?.canCreate && (
                        <Link href={route('identify-risk.create')} className="btn btn-primary btn-create">
                            <CirclePlus size={28} className="btn-icon" />
                            Tambah Risiko Baru
                        </Link>
                    )}
                </div>
            </div>

            {/* 🔥 OPSI 2: Stats Cards dengan logic submitted = pending */}
            <div className="stats-grid">
                <div className="stat-card stat-total">
                    <ChartColumnIncreasing size={40} className="stat-icon text-blue-600" />
                    <div className="stat-content">
                        <span className="stat-number">{identifyRisks.data.length}</span>
                        <span className="stat-label">Total Risiko</span>
                    </div>
                </div>
                <div className="stat-card stat-draft">
                    <SquarePen size={40} className="stat-icon" />
                    <div className="stat-content">
                        <span className="stat-number">
                            {identifyRisks.data.filter((item: IdentifyRisk) => item.validation_status === 'draft').length}
                        </span>
                        <span className="stat-label">Draft</span>
                    </div>
                </div>
                {/* Include both submitted and pending as "Pending" */}
                <div className="stat-card stat-pending">
                    <Hourglass size={40} className="stat-icon text-yellow-500" />
                    <div className="stat-content">
                        <span className="stat-number">
                            {
                                identifyRisks.data.filter(
                                    (item: IdentifyRisk) => item.validation_status === 'pending' || item.validation_status === 'submitted',
                                ).length
                            }
                        </span>
                        <span className="stat-label">Pending</span>
                    </div>
                </div>
                <div className="stat-card stat-approved">
                    <CircleCheck size={40} className="stat-icon text-green-600" />
                    <div className="stat-content">
                        <span className="stat-number">
                            {identifyRisks.data.filter((item: IdentifyRisk) => item.validation_status === 'approved').length}
                        </span>
                        <span className="stat-label">Disetujui</span>
                    </div>
                </div>
                <div className="stat-card stat-rejected">
                    <ClipboardX size={40} className="stat-icon text-red-600" />
                    <div className="stat-content">
                        <span className="stat-number">
                            {identifyRisks.data.filter((item: IdentifyRisk) => item.validation_status === 'rejected').length}
                        </span>
                        <span className="stat-label">Ditolak</span>
                    </div>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="controls-section">
                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Cari berdasarkan ID, kategori, atau deskripsi..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                    <Search size={20} className="search-icon" />
                </div>
                <div className="filter-tabs">
                    <button className={`filter-tab ${filterStatus === 'all' ? 'active' : ''}`} onClick={() => setFilterStatus('all')}>
                        Semua
                    </button>
                    <button className={`filter-tab ${filterStatus === 'draft' ? 'active' : ''}`} onClick={() => setFilterStatus('draft')}>
                        Draft
                    </button>
                    <button className={`filter-tab ${filterStatus === 'pending' ? 'active' : ''}`} onClick={() => setFilterStatus('pending')}>
                        Pending
                    </button>
                    <button className={`filter-tab ${filterStatus === 'approved' ? 'active' : ''}`} onClick={() => setFilterStatus('approved')}>
                        Disetujui
                    </button>
                    <button className={`filter-tab ${filterStatus === 'rejected' ? 'active' : ''}`} onClick={() => setFilterStatus('rejected')}>
                        Ditolak
                    </button>
                </div>
            </div>

            {/* Risk Cards Grid */}
            <div className="risk-cards-grid">
                {filteredRisks.length > 0 ? (
                    filteredRisks.map((item: IdentifyRisk) => {
                        const riskInfo = getRiskLevelInfo(item.probability, item.impact);
                        const validationInfo = getValidationStatusInfo(item.validation_status);

                        return (
                            <div
                                key={item.id}
                                className={`risk-card validation-${item.validation_status} ${item.validation_status === 'draft' ? 'draft-mode' : ''}`}
                            >
                                {/* Card Header */}
                                <div className="card-header">
                                    <div className="risk-id">
                                        <IdCard className="id-icon" />
                                        {item.id_identify}
                                        {item.validation_status === 'draft' && <span className="draft-badge"></span>}
                                    </div>
                                    <div className={`validation-badge ${validationInfo.color}`}>
                                        {validationInfo.icon} {validationInfo.label}
                                    </div>
                                </div>

                                {/* Card Content */}
                                <div className="card-content">
                                    <h3 className="risk-category">{item.risk_category}</h3>
                                    <p className="risk-description">
                                        {item.description.length > 120 ? `${item.description.substring(0, 120)}...` : item.description}
                                    </p>

                                    {/* Risk Metrics */}
                                    <div className="risk-metrics">
                                        <div className="metric">
                                            <span className="metric-label">Probabilitas</span>
                                            <span className="metric-value">{item.probability}/5</span>
                                        </div>
                                        <div className="metric">
                                            <span className="metric-label">Dampak</span>
                                            <span className="metric-value">{item.impact}/5</span>
                                        </div>
                                        <div className={`risk-level ${riskInfo.color}`}>
                                            {riskInfo.icon} {riskInfo.level}
                                            <span className="risk-score">({item.probability * item.impact}/25)</span>
                                        </div>
                                    </div>

                                    {/* Dates */}
                                    <div className="risk-dates">
                                        <div className="date-range justify-center" style={{ display: 'flex', alignItems: 'center', gap: '0.4em' }}>
                                            <Calendar />
                                            <span>
                                                {new Date(item.identification_date_start).toLocaleDateString('id-ID')} -{' '}
                                                {new Date(item.identification_date_end).toLocaleDateString('id-ID')}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Rejection Reason */}
                                    {item.rejection_reason && item.validation_status === 'rejected' && (
                                        <div className="rejection-reason">
                                            <strong>Alasan Penolakan:</strong>
                                            <p>{item.rejection_reason}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Card Actions */}
                                <div className="card-actions">
                                    {/* 🔥 TAMBAHAN: Tombol Detail (sesuai memory entry [3] - antarmuka ramah pengguna) */}
                                    <Link href={route('identify-risk.show', item.id)} className="action-btn detail-btn" title="Lihat Detail Risiko">
                                        <Eye /> Detail
                                    </Link>

                                    {/* Submit Action untuk draft, hanya jika boleh tampil */}
                                    {permissions?.canSubmit && canShowSubmit(item) && (
                                        <button onClick={() => submitItem(item)} className="action-btn submit-btn" title="Kirim untuk Validasi">
                                            <Upload /> Kirim
                                        </button>
                                    )}

                                    {/* Edit Actions, hanya jika boleh tampil */}
                                    {permissions?.canEdit && canShowEdit(item) && (
                                        <Link href={route('identify-risk.edit', item.id)} className="action-btn edit-btn" title="Edit">
                                            <Pencil />
                                            Edit
                                        </Link>
                                    )}

                                    {/* Delete Actions - hanya untuk draft */}
                                    {permissions?.canDelete && item.validation_status === 'draft' && (
                                        <button onClick={() => deleteItem(item)} className="action-btn delete-btn" title="Hapus">
                                            <Trash2 />
                                            Hapus
                                        </button>
                                    )}

                                    {/* Validation Actions - untuk submitted dan pending */}
                                    {showValidationActions && (item.validation_status === 'submitted' || item.validation_status === 'pending') && (
                                        <>
                                            {permissions?.canApprove && (
                                                <button onClick={() => approveItem(item)} className="action-btn approve-btn" title="Setujui">
                                                    <CircleCheck /> Setujui
                                                </button>
                                            )}
                                            {permissions?.canReject && (
                                                <button
                                                    onClick={() => rejectItem(item)}
                                                    className="action-btn bg-red-600 text-white hover:bg-red-700"
                                                    title="Tolak"
                                                >
                                                    <X /> Tolak
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="empty-state">
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <Search size={40} className="empty-icon" />
                            <h3>Tidak Ada Risiko Ditemukan</h3>
                        </div>
                        <p>
                            {searchTerm || filterStatus !== 'all'
                                ? 'Tidak ada risiko yang sesuai dengan filter atau pencarian Anda.'
                                : 'Belum ada risiko yang dibuat. Mulai dengan menambah risiko baru.'}
                        </p>
                        {!searchTerm && filterStatus === 'all' && permissions?.canCreate && (
                            <div className="flex justify-center">
                                <Link href={route('identify-risk.create')} className="btn btn-primary flex flex-row items-center gap-1">
                                    <FilePlus size={28} />
                                    Tambah Risiko Pertama
                                </Link>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Pagination */}
            {identifyRisks.links && <Pagination links={identifyRisks.links} />}
        </div>
    );
}

Index.layout = (page: React.ReactNode) => {
    return <AppLayout breadcrumbs={breadcrumbs} children={page} />;
};

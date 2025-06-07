// resources/js/pages/identityrisk/index.tsx

import AppLayout from '@/layouts/app-layout';
import { IdentityRisk, PageProps } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import React, { useState } from 'react';
import '../../../css/IdentityRiskIndex.css';

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
    const { identityRisks, flash, auth, canValidate } = usePage<PageProps>().props;
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState<string>('');

    console.log('Data identityRisks diterima di Index.tsx:', identityRisks);

    if (!identityRisks) {
        return (
            <div className="empty-state">
                <div className="empty-icon">📊</div>
                <h3>Data Tidak Tersedia</h3>
                <p>Data identifikasi risiko tidak tersedia saat ini.</p>
            </div>
        );
    }

    function deleteItem(item: IdentityRisk) {
        if (confirm(`Yakin ingin menghapus identifikasi risiko "${item.id_identity}"?`)) {
            router.delete(route('identity-risk.destroy', item.id), {
                preserveScroll: true,
            });
        }
    }

    function approveItem(item: IdentityRisk) {
        if (confirm(`Yakin ingin menyetujui risiko "${item.id_identity}"?`)) {
            router.post(
                route('identity-risk.approve', item.id),
                {},
                {
                    preserveScroll: true,
                },
            );
        }
    }

    function rejectItem(item: IdentityRisk) {
        const reason = prompt(`Masukkan alasan penolakan untuk risiko "${item.id_identity}":`);
        if (reason !== null) {
            router.post(
                route('identity-risk.reject', item.id),
                {
                    rejection_reason: reason,
                },
                {
                    preserveScroll: true,
                },
            );
        }
    }

    const showAdminActions = canValidate;

    const getRiskLevelInfo = (probability: number, impact: number) => {
        const risk = probability * impact;
        if (risk >= 20) return { level: 'Kritis', color: 'critical', icon: '🔴' };
        if (risk >= 15) return { level: 'Tinggi', color: 'high', icon: '🟠' };
        if (risk >= 8) return { level: 'Sedang', color: 'medium', icon: '🟡' };
        return { level: 'Rendah', color: 'low', icon: '🟢' };
    };

    const getValidationStatusInfo = (status: string) => {
        switch (status) {
            case 'approved':
                return { label: 'Disetujui', color: 'success', icon: '✅' };
            case 'pending':
                return { label: 'Pending', color: 'warning', icon: '⏳' };
            case 'rejected':
                return { label: 'Ditolak', color: 'danger', icon: '❌' };
            default:
                return { label: 'Unknown', color: 'secondary', icon: '❓' };
        }
    };

    // Filter dan search logic
    const filteredRisks = identityRisks.data.filter((item: IdentityRisk) => {
        const matchesSearch =
            item.id_identity.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.risk_category.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.description.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesFilter = filterStatus === 'all' || item.validation_status === filterStatus;

        return matchesSearch && matchesFilter;
    });

    return (
        <div className="risk-index-container">
            {/* Header Section */}
            <div className="page-header">
                <div className="header-content">
                    <div className="header-info">
                        <h1 className="page-title">
                            <span className="title-icon">🛡️</span>
                            Manajemen Risiko
                        </h1>
                        <p className="page-subtitle">Kelola dan pantau identifikasi risiko organisasi Anda</p>
                    </div>
                    <Link href={route('identity-risk.create')} className="btn btn-primary btn-create">
                        <span className="btn-icon">➕</span>
                        Tambah Risiko Baru
                    </Link>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card stat-total">
                    <div className="stat-icon">📊</div>
                    <div className="stat-content">
                        <span className="stat-number">{identityRisks.data.length}</span>
                        <span className="stat-label">Total Risiko</span>
                    </div>
                </div>
                <div className="stat-card stat-pending">
                    <div className="stat-icon">⏳</div>
                    <div className="stat-content">
                        <span className="stat-number">
                            {identityRisks.data.filter((item: IdentityRisk) => item.validation_status === 'pending').length}
                        </span>
                        <span className="stat-label">Pending</span>
                    </div>
                </div>
                <div className="stat-card stat-approved">
                    <div className="stat-icon">✅</div>
                    <div className="stat-content">
                        <span className="stat-number">
                            {identityRisks.data.filter((item: IdentityRisk) => item.validation_status === 'approved').length}
                        </span>
                        <span className="stat-label">Disetujui</span>
                    </div>
                </div>
                <div className="stat-card stat-rejected">
                    <div className="stat-icon">❌</div>
                    <div className="stat-content">
                        <span className="stat-number">
                            {identityRisks.data.filter((item: IdentityRisk) => item.validation_status === 'rejected').length}
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
                    <span className="search-icon">🔍</span>
                </div>
                <div className="filter-tabs">
                    <button className={`filter-tab ${filterStatus === 'all' ? 'active' : ''}`} onClick={() => setFilterStatus('all')}>
                        Semua
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
                    filteredRisks.map((item: IdentityRisk) => {
                        const riskInfo = getRiskLevelInfo(item.probability, item.impact);
                        const validationInfo = getValidationStatusInfo(item.validation_status);

                        return (
                            <div key={item.id} className={`risk-card validation-${item.validation_status}`}>
                                {/* Card Header */}
                                <div className="card-header">
                                    <div className="risk-id">
                                        <span className="id-icon">🆔</span>
                                        {item.id_identity}
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
                                        <div className="date-range">
                                            📅 {new Date(item.identification_date_start).toLocaleDateString('id-ID')} -{' '}
                                            {new Date(item.identification_date_end).toLocaleDateString('id-ID')}
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
                                {showAdminActions && (
                                    <div className="card-actions">
                                        <Link href={route('identity-risk.edit', item.id)} className="action-btn edit-btn" title="Edit">
                                            ✏️ Edit
                                        </Link>
                                        <button onClick={() => deleteItem(item)} className="action-btn delete-btn" title="Hapus">
                                            🗑️ Hapus
                                        </button>
                                        {item.validation_status === 'pending' && (
                                            <>
                                                <button onClick={() => approveItem(item)} className="action-btn approve-btn" title="Setujui">
                                                    ✅ Setujui
                                                </button>
                                                <button onClick={() => rejectItem(item)} className="action-btn reject-btn" title="Tolak">
                                                    ❌ Tolak
                                                </button>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <div className="empty-state">
                        <div className="empty-icon">🔍</div>
                        <h3>Tidak Ada Risiko Ditemukan</h3>
                        <p>
                            {searchTerm || filterStatus !== 'all'
                                ? 'Tidak ada risiko yang sesuai dengan filter atau pencarian Anda.'
                                : 'Belum ada risiko yang dibuat. Mulai dengan menambah risiko baru.'}
                        </p>
                        {!searchTerm && filterStatus === 'all' && (
                            <Link href={route('identity-risk.create')} className="btn btn-primary">
                                ➕ Tambah Risiko Pertama
                            </Link>
                        )}
                    </div>
                )}
            </div>

            {/* Pagination */}
            {identityRisks.links && <Pagination links={identityRisks.links} />}
        </div>
    );
}

Index.layout = (page: React.ReactNode) => {
    return <AppLayout children={page} title="Daftar Identifikasi Risiko" />;
};

import React from 'react';

interface MitigasiData {
  id: number;
  judul_mitigasi: string;
  deskripsi_mitigasi: string;
  pic_mitigasi: string;
  target_selesai: string;
  status_mitigasi: string;
  progress_percentage: number;
}

interface MitigationSubmittedEmailProps {
  mitigasi: MitigasiData;
  baseUrl: string;
}

export const MitigationSubmittedEmail: React.FC<MitigationSubmittedEmailProps> = ({
  mitigasi,
  baseUrl,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div style={{
      fontFamily: 'Arial, sans-serif',
      lineHeight: 1.6,
      color: '#333',
      maxWidth: '600px',
      margin: '0 auto',
      padding: '20px',
    }}>
      <div style={{
        backgroundColor: '#f8f9fa',
        padding: '20px',
        borderRadius: '5px',
        marginBottom: '20px',
      }}>
        <h2 style={{ margin: 0 }}>Mitigasi Baru Menunggu Persetujuan</h2>
      </div>

      <div style={{
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '5px',
        border: '1px solid #ddd',
      }}>
        <p>Halo,</p>
        <p>Ada mitigasi baru yang membutuhkan persetujuan Anda.</p>

        <div style={{ marginBottom: '10px' }}>
          <span style={{ fontWeight: 'bold', color: '#555' }}>Judul Mitigasi: </span>
          <span>{mitigasi.judul_mitigasi}</span>
        </div>

        <div style={{ marginBottom: '10px' }}>
          <span style={{ fontWeight: 'bold', color: '#555' }}>Deskripsi: </span>
          <span>{mitigasi.deskripsi_mitigasi}</span>
        </div>

        <div style={{ marginBottom: '10px' }}>
          <span style={{ fontWeight: 'bold', color: '#555' }}>PIC: </span>
          <span>{mitigasi.pic_mitigasi}</span>
        </div>

        <div style={{ marginBottom: '10px' }}>
          <span style={{ fontWeight: 'bold', color: '#555' }}>Target Selesai: </span>
          <span>{formatDate(mitigasi.target_selesai)}</span>
        </div>

        <div style={{ marginBottom: '10px' }}>
          <span style={{ fontWeight: 'bold', color: '#555' }}>Status: </span>
          <span>{mitigasi.status_mitigasi}</span>
        </div>

        <div style={{ marginBottom: '10px' }}>
          <span style={{ fontWeight: 'bold', color: '#555' }}>Progress: </span>
          <span>{mitigasi.progress_percentage}%</span>
        </div>

        <a
          href={`${baseUrl}/mitigasi/${mitigasi.id}`}
          style={{
            display: 'inline-block',
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: '#fff',
            textDecoration: 'none',
            borderRadius: '5px',
            marginTop: '20px',
          }}
        >
          Lihat Detail Mitigasi
        </a>
      </div>

      <div style={{
        marginTop: '20px',
        fontSize: '12px',
        color: '#666',
      }}>
        <p>Email ini dikirim secara otomatis. Mohon tidak membalas email ini.</p>
      </div>
    </div>
  );
};

export default MitigationSubmittedEmail;

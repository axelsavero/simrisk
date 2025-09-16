import React from 'react';
import { renderToString } from 'react-dom/server';
import MitigationSubmittedEmail from './MitigationSubmittedEmail';

interface RenderEmailProps {
  mitigasi: {
    id: number;
    judul_mitigasi: string;
    deskripsi_mitigasi: string;
    pic_mitigasi: string;
    target_selesai: string;
    status_mitigasi: string;
    progress_percentage: number;
  };
  baseUrl: string;
}

export const renderMitigationSubmittedEmail = ({ mitigasi, baseUrl }: RenderEmailProps): string => {
  const emailHtml = renderToString(
    <MitigationSubmittedEmail mitigasi={mitigasi} baseUrl={baseUrl} />
  );

  return `<!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Mitigasi Baru Menunggu Persetujuan</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif;">
        ${emailHtml}
      </body>
    </html>`;
};

export default renderMitigationSubmittedEmail;

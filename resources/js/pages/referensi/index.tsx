import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';


export default function ReferensiPage() {
    return (
        <AppLayout>
            <Head title="Referensi Risiko" />

            <div className="bg-white shadow rounded-lg p-6 space-y-8">
                {/* Kategori Risiko */}
                <section>
                    <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">Kategori Risiko</h2>
                    <ul className="space-y-3 text-gray-700">
                        <li>
                            <strong>• Risiko Strategis :</strong><br />
                            Risiko yang disebabkan oleh perubahan kebijakan, tujuan organisasi, atau lingkungan kerja yang memengaruhi arah strategis institusi.
                        </li>
                        <li>
                            <strong>• Risiko Operasional :</strong><br />
                            Risiko yang muncul dari aktivitas operasional sehari-hari, seperti kegagalan sistem, proses, atau human error.
                        </li>
                        <li>
                            <strong>• Risiko Keuangan :</strong><br />
                            Risiko yang berkaitan dengan kerugian finansial akibat ketidaktepatan pengelolaan dana, anggaran, atau investasi.
                        </li>
                        <li>
                            <strong>• Risiko Kepatuhan :</strong><br />
                            Risiko akibat tidak terpenuhinya peraturan, perundang-undangan, atau kebijakan internal yang berlaku.
                        </li>
                        <li>
                            <strong>• Risiko Kecurangan :</strong><br />
                            Risiko dari tindakan penipuan, korupsi, atau penyalahgunaan wewenang yang merugikan organisasi.
                        </li>
                    </ul>
                </section>

                {/* Kriteria Risiko */}
                <section>
                    <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">Kriteria Risiko</h2>
                    <ul className="space-y-3 text-gray-700">
                        <li>
                            <strong>• Kriteria Kemungkinan :</strong><br />
                            Menilai seberapa besar peluang atau frekuensi terjadinya suatu risiko. Biasanya menggunakan skala: Sangat Rendah, Rendah, Sedang, Tinggi, Sangat Tinggi.
                        </li>
                        <li>
                            <strong>• Kriteria Dampak :</strong><br />
                            Mengukur seberapa besar konsekuensi atau pengaruh risiko terhadap pencapaian tujuan, baik dari aspek keuangan, reputasi, hukum, maupun pelayanan.
                        </li>
                    </ul>
                </section>
            </div>
        </AppLayout>
    );
}

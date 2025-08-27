import { SasaranUnit, SasaranUniv } from '@/types';
import Form from './form';

interface Props {
    sasaranUnit: SasaranUnit;
    sasaranUnivs: Pick<SasaranUniv, 'id_sasaran_univ' | 'kategori' | 'nama_dokumen'>[];
}

export default function Edit({ sasaranUnit, sasaranUnivs }: Props) {
    return <Form sasaranUnit={sasaranUnit} sasaranUnivs={sasaranUnivs} />;
}

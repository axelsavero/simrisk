import { SasaranUniv } from '@/types';
import Form from './form';

interface Props {
    sasaranUnivs: Pick<SasaranUniv, 'id_sasaran_univ' | 'kategori' | 'nama_dokumen'>[];
}

export default function Create({ sasaranUnivs }: Props) {
    return <Form sasaranUnivs={sasaranUnivs} />;
}

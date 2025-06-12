import { SasaranUniv } from '@/types';
import Form from './form';

interface Props {
    sasaranUniv: SasaranUniv;
}

export default function Edit({ sasaranUniv }: Props) {
    return <Form sasaranUniv={sasaranUniv} />;
}

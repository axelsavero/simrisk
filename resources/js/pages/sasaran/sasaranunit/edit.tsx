import { SasaranUnit } from '@/types';
import Form from './form';

interface Props {
    sasaranUnit: SasaranUnit;
}

export default function Edit({ sasaranUnit }: Props) {
    return <Form sasaranUnit={sasaranUnit} />;
}

import { motion } from 'framer-motion';

interface BrandingProps {
    layoutIdPrefix: string;
}

export default function Branding({ layoutIdPrefix }: BrandingProps) {
    return (
        <div className="flex flex-col items-center">
            <motion.img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Lambang_baru_UNJ.png/500px-Lambang_baru_UNJ.png"
                alt="Logo UNJ"
                className="mb-6 h-32 w-32"
                layoutId={`${layoutIdPrefix}-logo`}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
            />
            <motion.span
                className="mb-4 text-center text-3xl font-extrabold text-white"
                layoutId={`${layoutIdPrefix}-university`}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
            >
                Universitas Negeri Jakarta
            </motion.span>
            <motion.h1
                className="text-center text-5xl leading-tight font-extrabold text-white"
                layoutId={`${layoutIdPrefix}-title`}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
            >
                SISTEM INFORMASI MANAJEMEN RISIKO (SIMRISK)
            </motion.h1>
        </div>
    );
}

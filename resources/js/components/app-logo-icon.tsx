import { ImgHTMLAttributes } from 'react';

export default function AppLogoIcon(props: ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <img {...props} src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Lambang_baru_UNJ.png/500px-Lambang_baru_UNJ.png" alt="" />
    );
}

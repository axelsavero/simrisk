import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    return (
        <>
        <div className="flex items-center w-auto max-w-full">
            <div className="text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-md">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Lambang_baru_UNJ.png/500px-Lambang_baru_UNJ.png" alt="" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm text-white">
                <span className="mb-0.5 truncate leading-none font-semibold">
                    SISTEM INFORMASI <br />
                    MANAJEMEN RISIKO
                </span>
                <span className="mb-0.5 truncate leading-none font-semibold">
                    Universitas Negeri Jakarta
                </span>
            </div>
        </div>
        </>
    );
}

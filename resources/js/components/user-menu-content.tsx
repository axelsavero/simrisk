import {
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import { UserInfo } from '@/components/user-info';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { type User } from '@/types';
import { Link, router } from '@inertiajs/react';
import { LogOut, Settings, UserCog } from 'lucide-react';

interface UserMenuContentProps {
    user: User;
}

function formatRoleLabel(role: string) {
    return role === 'owner-risk' ? 'operator' : role;
}

function toRoleNames(rawRoles: unknown): string[] {
    if (!rawRoles) return [];
    const list = Array.isArray(rawRoles) ? rawRoles : [rawRoles];
    return list.map((r: any) => (typeof r === 'string' ? r : r?.name)).filter(Boolean);
}

export function UserMenuContent({ user }: UserMenuContentProps) {
    const cleanup = useMobileNavigation();
    const roleNames = toRoleNames(user.roles);
    const activeRole = (user as any).active_role as string | undefined;

    const handleLogout = () => {
        cleanup();
        router.flushAll();
    };

    function switchActiveRole(role: string) {
        if (role === activeRole) return;
        router.post(
            route('active-role.update'),
            { role },
            { preserveScroll: true },
        );
    }

    return (
        <>
            <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <UserInfo user={user} showEmail={true} />
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {roleNames.length > 1 && (
                <>
                    <DropdownMenuGroup>
                        <DropdownMenuSub>
                            <DropdownMenuSubTrigger>
                                <UserCog className="mr-2" />
                                Ganti Role ({formatRoleLabel(activeRole || roleNames[0])})
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent>
                                <DropdownMenuRadioGroup value={activeRole} onValueChange={switchActiveRole}>
                                    {roleNames.map((role) => (
                                        <DropdownMenuRadioItem key={role} value={role}>
                                            {formatRoleLabel(role)}
                                        </DropdownMenuRadioItem>
                                    ))}
                                </DropdownMenuRadioGroup>
                            </DropdownMenuSubContent>
                        </DropdownMenuSub>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                </>
            )}
            <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                    <Link className="block w-full" href={route('profile.edit')} as="button" prefetch onClick={cleanup}>
                        <Settings className="mr-2" />
                        Settings
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
                <Link className="block w-full" method="post" href={route('logout')} as="button" onClick={handleLogout}>
                    <LogOut className="mr-2" />
                    Log out
                </Link>
            </DropdownMenuItem>
        </>
    );
}

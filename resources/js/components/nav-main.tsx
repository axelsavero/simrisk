import { NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';

export function NavMain({ items }: { items: NavItem[] }) {
    const [expandedItems, setExpandedItems] = useState<string[]>([]);

    const toggleItem = (title: string) => {
        setExpandedItems((prev) => (prev.includes(title) ? prev.filter((item) => item !== title) : [...prev, title]));
    };

    return (
        <nav className="space-y-1">
            {items.map((item) => (
                <div key={item.title}>
                    {item.children ? (
                        <>
                            <button onClick={() => toggleItem(item.title)} className="flex w-full items-center rounded-md p-2 hover:bg-gray-100">
                                {item.icon && <item.icon className="mr-2 h-5 w-5" />}
                                <span>{item.title}</span>
                                {expandedItems.includes(item.title) ? (
                                    <ChevronDown className="ml-auto h-4 w-4" />
                                ) : (
                                    <ChevronRight className="ml-auto h-4 w-4" />
                                )}
                            </button>
                            {expandedItems.includes(item.title) && (
                                <div className="mt-1 ml-6 space-y-1">
                                    {item.children.map((child) => (
                                        <Link key={child.href} href={child.href} className="block rounded-md p-2 hover:bg-gray-100">
                                            {child.title}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <Link href={item.href} className="flex items-center rounded-md p-2 hover:bg-gray-100">
                            {item.icon && <item.icon className="mr-2 h-5 w-5" />}
                            <span>{item.title}</span>
                        </Link>
                    )}
                </div>
            ))}
        </nav>
    );
}

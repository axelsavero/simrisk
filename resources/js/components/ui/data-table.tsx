import React from 'react';
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getPaginationRowModel,
    getSortedRowModel,
    SortingState,
    getFilteredRowModel,
    ColumnFiltersState,
} from '@tanstack/react-table';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    searchKey?: string;
    searchPlaceholder?: string;
    pagination?: boolean;
    pageSize?: number;
    className?: string;
}

export function DataTable<TData, TValue>({
    columns,
    data,
    searchKey,
    searchPlaceholder = 'Cari...',
    pagination = false,
    pageSize = 10,
    className,
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: pagination ? getPaginationRowModel() : undefined,
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        state: {
            sorting,
            columnFilters,
        },
        initialState: {
            pagination: {
                pageSize: pageSize,
            },
        },
    });

    return (
        <div className="w-full space-y-4">
            {searchKey && (
                <div className="flex items-center py-2">
                    <input
                        placeholder={searchPlaceholder}
                        value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ''}
                        onChange={(event) => table.getColumn(searchKey)?.setFilterValue(event.target.value)}
                        className="max-w-sm rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#006d77] focus:ring-[#006d77] focus:outline-none"
                    />
                </div>
            )}
            <div className={`w-full overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm ${className || ''}`}>
                <Table className="w-full text-left text-sm border-collapse">
                    <TableHeader className="bg-gray-50/90 border-b border-gray-200">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="border-b border-gray-200">
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id} className="border-r border-gray-200 last:border-r-0 px-3 py-3 font-semibold text-gray-700">
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                      header.column.columnDef.header,
                                                      header.getContext()
                                                  )}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && 'selected'}
                                    className="hover:bg-gray-50/70 border-b border-gray-200 transition-colors"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="border-r border-gray-200 last:border-r-0 px-3 py-3">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-28 text-center text-gray-500">
                                    Tidak ada data.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            {pagination && table.getPageCount() > 1 && (
                <div className="flex items-center justify-end space-x-2 py-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Sebelumnya
                    </Button>
                    <span className="text-xs text-gray-600">
                        Halaman {table.getState().pagination.pageIndex + 1} dari {table.getPageCount()}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Selanjutnya
                    </Button>
                </div>
            )}
        </div>
    );
}

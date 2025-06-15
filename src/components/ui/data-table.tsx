import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  SortingState,
  getSortedRowModel
} from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */
export type DataTableProps<T> = {
  columns: ColumnDef<T>[]
  loading: boolean
  emptyText?: string
  data?: T[]
  renderActions: (row: T) => React.ReactNode
  hideHeader?: boolean;
}

/* -------------------------------------------------------------------------- */
/*                               GENERIC TABLE                                */
/* -------------------------------------------------------------------------- */

export function DataTable<T extends { id?: string }>({
  columns,
  data = [],
  loading,
  hideHeader = false,
  emptyText = 'No data',
  renderActions,
}: DataTableProps<T>) {
  /* -------------------------------- Actions col -------------------------- */
  const actionsColumn = React.useMemo<ColumnDef<T>>(
    () => ({
      id: "actions",
      header: () => null,
      enableHiding: false,
      cell: ({ row }) => {
        const item = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {renderActions(item)}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    }),
    [renderActions],
  );

  const [sorting, setSorting] = React.useState<SortingState>([]);

  /* Merge user columns with the extra actions column */
  const table = useReactTable({
    data,
    columns: React.useMemo(
      () => [...columns, actionsColumn],
      [columns, actionsColumn],
    ),
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  });


  const colCount = table.getAllColumns().length;
  const skeletonRows = 5; // how many placeholder rows to show while loading

  /* ---------------------------------------------------------------------- */
  /*                                 render                                 */
  /* ---------------------------------------------------------------------- */
  return (
    <div className="w-full rounded-md border overflow-x-auto">
      <Table>
        {!hideHeader &&
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
        }
        {/* ------------------------------- Body -------------------------------- */}
        <TableBody>
          {loading ? (
            /* ❶  Skeleton rows ------------------------------------------------ */
            Array.from({ length: skeletonRows }).map((_, rIdx) => (
              <TableRow key={`skeleton-${rIdx}`}>
                {Array.from({ length: colCount }).map((_, cIdx) => (
                  <TableCell key={`skeleton-${rIdx}-${cIdx}`}>
                    <Skeleton className="h-10 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : table.getRowModel().rows.length ? (
            /* ❷  Real data rows ---------------------------------------------- */
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext(),
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            /* ❸  Empty state --------------------------------------------------- */
            <TableRow>
              <TableCell
                colSpan={colCount}
                className="h-24 text-center"
              >
                {emptyText}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

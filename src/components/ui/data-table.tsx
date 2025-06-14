"use client"

import * as React from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

export interface DataTableProps<T> {
  /** Column definitions passed directly to TanStack table */
  columns: ColumnDef<T>[]
  /** Array of data items to render */
  data: T[]
  /**
   * Render function for the row-level actions dropdown.
   */
  renderActions: (row: T) => React.ReactNode
}

/* -------------------------------------------------------------------------- */
/*                               GENERIC TABLE                                */
/* -------------------------------------------------------------------------- */

export function DataTable<T extends { id?: string }>({
  columns,
  data,
  renderActions,
}: DataTableProps<T>) {
  /* ---------------------------------------------------------------------- */
  /*                       build an extra “actions” column                  */
  /* ---------------------------------------------------------------------- */
  const actionsColumn = React.useMemo<ColumnDef<T>>(
    () => ({
      id: "actions",
      header: () => null,
      enableHiding: false,
      cell: ({ row }) => {
        const item = row.original

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
        )
      },
    }),
    [renderActions]
  )

  /* merge user columns with the extra actions column */
  const table = useReactTable({
    data,
    columns: React.useMemo(() => [...columns, actionsColumn], [columns, actionsColumn]),
    getCoreRowModel: getCoreRowModel(),
  })

  /* ---------------------------------------------------------------------- */
  /*                                 render                                 */
  /* ---------------------------------------------------------------------- */
  return (
    <div className="w-full rounded-md border overflow-x-auto">
      <Table>
        {/* ------------------------------- Header ------------------------------ */}
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>

        {/* ------------------------------- Body -------------------------------- */}
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={table.getAllColumns().length}
                className="h-24 text-center"
              >
                No data.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}

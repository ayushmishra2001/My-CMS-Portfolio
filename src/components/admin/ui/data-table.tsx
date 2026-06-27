"use client";
import { useState, useMemo } from "react";
import { Search, ChevronLeft, ChevronRight, GripVertical } from "lucide-react";
import { Input } from "@/components/shared/form-elements";
import { Button } from "@/components/shared/button";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: keyof T | string;
  header: string;
  cell?: (row: T) => React.ReactNode;
  className?: string;
  sortable?: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchKeys?: (keyof T)[];
  pageSize?: number;
  emptyMessage?: string;
  loading?: boolean;
  onReorder?: (draggedId: string, targetId: string) => void;
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  searchKeys = [],
  pageSize = 10,
  emptyMessage = "No records found.",
  loading = false,
  onReorder,
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter((row) =>
      searchKeys.some((key) => {
        const val = row[key];
        return typeof val === "string" && val.toLowerCase().includes(q);
      })
    );
  }, [data, search, searchKeys]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      const aVal = (a as Record<string, unknown>)[sortKey];
      const bVal = (b as Record<string, unknown>)[sortKey];
      const cmp = String(aVal ?? "").localeCompare(String(bVal ?? ""));
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  };

  const handleSearch = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          placeholder="Search..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-8 h-8 text-sm"
        />
      </div>

      {/* Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                {onReorder && <th className="w-10 px-4 py-2.5"></th>}
                {columns.map((col) => (
                  <th
                    key={String(col.key)}
                    className={cn(
                      "text-left px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider",
                      col.sortable && "cursor-pointer hover:text-foreground select-none",
                      col.className
                    )}
                    onClick={() => col.sortable && handleSort(String(col.key))}
                  >
                    <span className="flex items-center gap-1">
                      {col.header}
                      {col.sortable && sortKey === String(col.key) && (
                        <span className="text-primary">{sortDir === "asc" ? "↑" : "↓"}</span>
                      )}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {onReorder && <td className="w-10 px-4 py-3"></td>}
                    {columns.map((col) => (
                      <td key={String(col.key)} className="px-4 py-3">
                        <div className="h-4 bg-muted rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + (onReorder ? 1 : 0)} className="text-center py-10 text-muted-foreground text-sm">
                    {search ? `No results for "${search}"` : emptyMessage}
                  </td>
                </tr>
              ) : (
                paginated.map((row) => (
                  <tr
                    key={row.id}
                    draggable={!!onReorder}
                    onDragStart={(e) => {
                      e.dataTransfer.setData("text/plain", row.id);
                    }}
                    onDragOver={(e) => {
                      if (onReorder) {
                        e.preventDefault();
                        if (dragOverId !== row.id) setDragOverId(row.id);
                      }
                    }}
                    onDragLeave={() => {
                      if (onReorder) setDragOverId(null);
                    }}
                    onDrop={(e) => {
                      if (onReorder) {
                        e.preventDefault();
                        setDragOverId(null);
                        const draggedId = e.dataTransfer.getData("text/plain");
                        if (draggedId && draggedId !== row.id) {
                          onReorder(draggedId, row.id);
                        }
                      }
                    }}
                    className={cn(
                      "hover:bg-muted/30 transition-colors",
                      dragOverId === row.id && "border-t-2 border-primary bg-primary/5"
                    )}
                  >
                    {onReorder && (
                      <td className="w-10 px-4 py-3 cursor-grab active:cursor-grabbing text-muted-foreground select-none">
                        <GripVertical className="h-4 w-4" />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td key={String(col.key)} className={cn("px-4 py-3", col.className)}>
                        {col.cell
                          ? col.cell(row)
                          : String((row as Record<string, unknown>)[String(col.key)] ?? "")}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {sorted.length === 0
            ? "0 results"
            : `${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, sorted.length)} of ${sorted.length}`}
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="h-3 w-3" />
          </Button>
          <span className="px-2">{page} / {totalPages}</span>
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            <ChevronRight className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}

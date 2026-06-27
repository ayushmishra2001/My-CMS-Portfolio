export default function AdminLoading() {
  return (
    <div className="flex flex-col flex-1 overflow-hidden animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between h-16 px-4 md:px-6 border-b border-border bg-background shrink-0">
        <div className="space-y-2">
          <div className="h-4 w-28 bg-muted rounded" />
          <div className="h-3 w-48 bg-muted rounded" />
        </div>
        <div className="h-8 w-8 bg-muted rounded-full" />
      </div>

      {/* Main Content Area Skeleton */}
      <div className="p-6 space-y-6 flex-1 overflow-auto">
        {/* Upper Form Card Skeleton */}
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="h-10 px-6 border-b border-border bg-muted/20 flex items-center">
            <div className="h-3.5 w-36 bg-muted rounded" />
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-3 w-16 bg-muted rounded" />
                  <div className="h-9 w-full bg-muted rounded" />
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <div className="h-8 w-24 bg-muted rounded" />
            </div>
          </div>
        </div>

        {/* Bottom Table Card Skeleton */}
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="h-10 px-6 border-b border-border bg-muted/20 flex items-center">
            <div className="h-3.5 w-24 bg-muted rounded" />
          </div>
          <div className="p-0">
            <div className="p-4 border-b border-border bg-muted/10 flex items-center justify-between">
              <div className="h-8 w-44 bg-muted rounded" />
            </div>
            <div className="divide-y divide-border">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="p-4 flex items-center justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="h-3.5 w-1/3 bg-muted rounded" />
                    <div className="h-3 w-1/4 bg-muted rounded" />
                  </div>
                  <div className="h-4 w-12 bg-muted rounded" />
                  <div className="h-4 w-12 bg-muted rounded" />
                  <div className="h-6 w-14 bg-muted rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

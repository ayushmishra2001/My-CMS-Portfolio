export function PortfolioFooter({ name }: { name: string }) {
  return (
    <footer className="border-t border-border/20 py-8 mt-24">
      <div className="max-w-[1300px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 font-mono text-[11px] uppercase tracking-mono-tight text-muted-foreground">
        <p>© {new Date().getFullYear()} {name}</p>
        <p className="hover:text-verge-link transition-colors cursor-pointer">Nothing is true, everything is permitted.</p>
      </div>
    </footer>
  );
}

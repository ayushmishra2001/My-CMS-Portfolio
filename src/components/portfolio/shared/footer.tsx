export function PortfolioFooter({ name }: { name: string }) {
  return (
    <footer className="border-t-2 border-border/60 py-8 mt-4">
      <div className="max-w-[1300px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 font-mono text-xs md:text-sm uppercase tracking-mono-wide text-foreground font-bold">
        <p>© {new Date().getFullYear()} {name}</p>
        <p className="hover:text-primary transition-colors cursor-pointer">Nothing is true, everything is permitted.</p>
      </div>
    </footer>
  );
}

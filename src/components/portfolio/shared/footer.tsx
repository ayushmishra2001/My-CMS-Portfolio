export function PortfolioFooter({ name }: { name: string }) {
  return (
    <footer className="border-t border-border py-8 mt-24">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} {name}</p>
        <p>Nothing is true, everything is permitted.</p>
      </div>
    </footer>
  );
}

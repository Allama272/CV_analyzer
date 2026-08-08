const APP_NAME = import.meta.env.VITE_APP_TITLE || "Cv Analyzer";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card py-8 mb-0">
      <div className="mx-auto flex max-w-screen flex-col items-center justify-between gap-4 px-6 md:flex-row">
        <div className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} {APP_NAME}. Built for professionals.
        </div>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <a href="#" className="transition-colors hover:text-foreground hover:underline">
            Privacy Policy
          </a>
          <a href="#" className="transition-colors hover:text-foreground hover:underline">
            Terms of Service
          </a>
          <a href="#" className="transition-colors hover:text-foreground hover:underline">
            Help Center
          </a>
        </div>
      </div>
    </footer>
  );
}
import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Council. Four Minds, One Verifiable Answer.
          </div>
          <div className="flex gap-6 text-sm">
            <Link href="/terms" data-testid="link-terms">
              <span className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                Terms
              </span>
            </Link>
            <Link href="/privacy" data-testid="link-privacy">
              <span className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                Privacy
              </span>
            </Link>
            <Link href="/contact" data-testid="link-contact">
              <span className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                Contact
              </span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

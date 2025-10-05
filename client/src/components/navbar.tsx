import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { BarChart3, History, Settings, CreditCard, LogOut, Languages } from "lucide-react";

export function Navbar() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [location] = useLocation();

  const getInitials = (user: any) => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return "U";
  };

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" data-testid="link-home">
            <div className="hover:opacity-80 transition-opacity cursor-pointer">
              <img 
                src="/aime-council-logo.png" 
                alt="AI-ME COUNCIL" 
                className="h-10 w-auto"
                data-testid="logo-navbar"
              />
            </div>
          </Link>
          
          {isAuthenticated && (
            <div className="hidden md:flex items-center gap-4">
              <Link href="/" data-testid="link-ask">
                <Button variant={location === "/" ? "default" : "ghost"} size="sm">
                  {t.nav.ask}
                </Button>
              </Link>
              <Link href="/history" data-testid="link-history">
                <Button variant={location === "/history" ? "default" : "ghost"} size="sm">
                  <History className="h-4 w-4 mr-2" />
                  {t.nav.history}
                </Button>
              </Link>
              <Link href="/dashboard" data-testid="link-dashboard">
                <Button variant={location === "/dashboard" ? "default" : "ghost"} size="sm">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  {t.nav.dashboard}
                </Button>
              </Link>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLanguage(language === "en" ? "el" : "en")}
            data-testid="button-language-toggle"
            className="gap-2"
          >
            <Languages className="h-4 w-4" />
            <span className="hidden sm:inline">{language === "en" ? "EL" : "EN"}</span>
          </Button>

          {isLoading ? (
            <div className="h-9 w-24 bg-muted animate-pulse rounded-md" />
          ) : isAuthenticated && user ? (
            <>
              {user.quotaRemaining !== undefined && (
                <Badge variant={user.quotaRemaining > 1 ? "default" : "destructive"} data-testid="badge-quota">
                  {user.quotaRemaining} {t.nav.queriesLeft}
                </Badge>
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full" data-testid="button-user-menu">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user.profileImageUrl || undefined} alt={user.email || "User"} />
                      <AvatarFallback>{getInitials(user)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      {user.email && (
                        <p className="text-sm font-medium" data-testid="text-user-email">{user.email}</p>
                      )}
                      <p className="text-xs text-muted-foreground capitalize">
                        {user.planTier || "free"} {t.nav.plan}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/preferences" data-testid="link-preferences">
                      <Settings className="mr-2 h-4 w-4" />
                      {t.nav.preferences}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/upgrade" data-testid="link-upgrade">
                      <CreditCard className="mr-2 h-4 w-4" />
                      {t.nav.upgrade}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <a href="/api/logout" data-testid="button-logout">
                      <LogOut className="mr-2 h-4 w-4" />
                      {t.nav.logout}
                    </a>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button asChild data-testid="button-login">
              <a href="/api/login">{t.nav.login}</a>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}

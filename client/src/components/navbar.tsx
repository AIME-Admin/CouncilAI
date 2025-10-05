import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
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
import { BarChart3, History, Settings, CreditCard, LogOut, Sparkles } from "lucide-react";

export function Navbar() {
  const { user, isAuthenticated, isLoading } = useAuth();
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
            <div className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer">
              <Sparkles className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">Council</span>
            </div>
          </Link>
          
          {isAuthenticated && (
            <div className="hidden md:flex items-center gap-4">
              <Link href="/" data-testid="link-ask">
                <Button variant={location === "/" ? "default" : "ghost"} size="sm">
                  Ask
                </Button>
              </Link>
              <Link href="/history" data-testid="link-history">
                <Button variant={location === "/history" ? "default" : "ghost"} size="sm">
                  <History className="h-4 w-4 mr-2" />
                  History
                </Button>
              </Link>
              <Link href="/dashboard" data-testid="link-dashboard">
                <Button variant={location === "/dashboard" ? "default" : "ghost"} size="sm">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          {isLoading ? (
            <div className="h-9 w-24 bg-muted animate-pulse rounded-md" />
          ) : isAuthenticated && user ? (
            <>
              {user.quotaRemaining !== undefined && (
                <Badge variant={user.quotaRemaining > 5 ? "default" : "destructive"} data-testid="badge-quota">
                  {user.quotaRemaining} queries left
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
                        {user.planTier || "free"} Plan
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/preferences" data-testid="link-preferences">
                      <Settings className="mr-2 h-4 w-4" />
                      Preferences
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/upgrade" data-testid="link-upgrade">
                      <CreditCard className="mr-2 h-4 w-4" />
                      Upgrade Plan
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <a href="/api/logout" data-testid="button-logout">
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </a>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button asChild data-testid="button-login">
              <a href="/api/login">Log In</a>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}

import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowRightLeft, Search, Bell, ChevronDown, Menu } from "lucide-react";

export default function Navigation() {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  if (!user) return null;

  return (
    <header className="bg-white shadow-sm border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-skill-secondary to-skill-accent rounded-lg flex items-center justify-center">
                <ArrowRightLeft className="text-white w-4 h-4" />
              </div>
              <span className="text-xl font-bold text-skill-primary">SkillSwap</span>
            </Link>
            
            <nav className="hidden md:flex space-x-6">
              <Link href="/">
                <span className={`font-medium transition-colors hover:text-skill-primary ${
                  location === "/" ? "text-skill-primary" : "text-skill-gray"
                }`}>
                  Browse
                </span>
              </Link>
              <Link href="/swaps">
                <span className={`font-medium transition-colors hover:text-skill-primary ${
                  location === "/swaps" ? "text-skill-primary" : "text-skill-gray"
                }`}>
                  My Swaps
                </span>
              </Link>
              {user.isAdmin && (
                <Link href="/admin">
                  <span className={`font-medium transition-colors hover:text-skill-primary ${
                    location === "/admin" ? "text-skill-primary" : "text-skill-gray"
                  }`}>
                    Admin
                  </span>
                </Link>
              )}
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative hidden md:block">
              <Input
                type="text"
                placeholder="Search skills..."
                className="pl-10 w-64"
              />
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            </div>
            
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-3 w-3 p-0 bg-skill-secondary" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.profilePhoto || ""} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span className="hidden md:block font-medium">{user.name}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}

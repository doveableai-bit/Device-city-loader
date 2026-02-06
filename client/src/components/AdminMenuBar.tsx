import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, LogOut, Settings, Home } from "lucide-react";

export function AdminMenuBar() {
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const [, setLocation] = useLocation();

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  const handleGoHome = () => {
    setLocation("/");
  };

  return (
    <div className="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-blue-500/20 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Settings className="w-4 h-4 text-blue-400" />
            Admin Portal
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-slate-700/50"
              >
                <Menu className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
              <DropdownMenuItem
                onClick={handleGoHome}
                className="text-slate-300 cursor-pointer hover:bg-slate-700 hover:text-white flex items-center gap-2"
              >
                <Home className="w-4 h-4" />
                Home
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-slate-700" />

              <DropdownMenuItem
                onClick={handleLogout}
                className="text-red-400 cursor-pointer hover:bg-red-500/20 hover:text-red-300 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}

import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Home, BarChart3 } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

export default function Navigation() {
  const [location] = useLocation();

  const navItems = [
    {
      path: "/",
      label: "Generator",
      icon: Home,
      testId: "nav-home"
    }
    // Analytics removed from public navigation - access via direct URL only
  ];

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-6">
            <Link href="/" className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-primary" data-testid="nav-title">
                Icebreaker Generator
              </h1>
            </Link>
            
            <div className="flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.path;
                
                return (
                  <Button
                    key={item.path}
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    asChild
                    data-testid={item.testId}
                  >
                    <Link href={item.path} className="flex items-center space-x-2">
                      <Icon className="h-4 w-4" />
                      <span className="hidden sm:inline">{item.label}</span>
                    </Link>
                  </Button>
                );
              })}
            </div>
          </div>
          
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
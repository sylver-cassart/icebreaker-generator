import ThemeToggle from "@/components/ThemeToggle";

export default function Navigation() {

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-6">
            {/* Clean navbar without title */}
            
            {/* Navigation items removed for clean interface */}
          </div>
          
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
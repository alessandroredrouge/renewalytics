
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ChevronLeft, Battery } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20">
      <div className="text-center max-w-md px-4">
        <div className="flex justify-center mb-6">
          <div className="bg-energy-blue/10 p-4 rounded-full">
            <Battery size={48} className="text-energy-blue" />
          </div>
        </div>
        <h1 className="text-4xl font-bold mb-4 text-energy-blue">Page Not Found</h1>
        <p className="text-lg text-muted-foreground mb-6">
          The page you're looking for doesn't exist or is still under construction.
        </p>
        <Button asChild>
          <Link to="/" className="gap-2">
            <ChevronLeft size={16} />
            <span>Return to Dashboard</span>
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;

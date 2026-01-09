import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <Layout
      seo={{
        title: "Page Not Found",
        description: "The page you are looking for does not exist.",
        noIndex: true,
      }}
    >
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center px-4">
          <h1 className="text-8xl font-bold text-primary mb-4">404</h1>
          <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Sorry, the page you are looking for doesn't exist or has been moved.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/">
              <Button size="lg" className="rounded-full">
                <Home className="mr-2 h-4 w-4" />
                Go to Homepage
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default NotFound;

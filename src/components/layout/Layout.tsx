
import { Link } from "react-router-dom";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
      
      {/* Admin Portal Link */}
      <div className="fixed bottom-6 right-6">
        <Link to="/admin">
          <Button 
            variant="outline" 
            size="icon" 
            className="h-10 w-10 rounded-full shadow-md hover:shadow-lg bg-white"
          >
            <Settings className="h-5 w-5" />
            <span className="sr-only">Admin Portal</span>
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Layout;

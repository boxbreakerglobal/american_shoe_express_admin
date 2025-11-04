import { useState } from "react";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Boxes,
  MessageSquare,
  LogOut,
  Image
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
// import logo from ".././"
import logo from "../../public/American Shoe Logo (3).png"


interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const navItems = [
    { name: "Revenue", icon: <LayoutDashboard className="w-5 h-5" />, path: "/" },
    { name: "Orders", icon: <Package className="w-5 h-5" />, path: "/orders" },
    { name: "Add Item", icon: <ShoppingCart className="w-5 h-5" />, path: "/add-item" },
    { name: "All Items", icon: <Boxes className="w-5 h-5" />, path: "/all-items" },
    { name: "Messages", icon: <MessageSquare className="w-5 h-5" />, path: "/messages" },
    { name: "Hero Image", icon: <Image className="w-5 h-5" />, path: "/hero" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    toast({
      title: "Logged out",
      description: "You've been successfully logged out.",
    });
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen overflow-hidden">
      {/* Mobile Navbar */}
      <div className="md:hidden fixed top-0 left-0 w-full p-3 flex justify-between items-center bg-[#0f2942] text-white z-50">
        <h1 className="font-bold text-lg">American Shoe Express</h1>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-md hover:bg-[#1b3a5b] focus:outline-none"
        >
          {isOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen w-64 bg-[#0f2942] text-white flex flex-col z-40 transform transition-transform duration-300
        ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <div className="p-5 border-b border-[#0f2942] text-white bg-[#0f2942]">
          <img src={logo}/>
        </div>

        <nav className="flex-1 flex flex-col p-3 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-white text-[#0f2942] font-semibold"
                    : "text-gray-300 hover:bg-[#1b3a5b] hover:text-white"
                }`
              }
              onClick={() => setIsOpen(false)} // close menu on mobile
            >
              {item.icon}
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-[#1b3a5b]">
          <Button
            variant="ghost"
            className="w-full justify-start text-white hover:bg-[#1b3a5b]"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            <span>Logout</span>
          </Button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 bg-gray-50 min-h-screen overflow-y-auto p-6 md:ml-64 mt-12 md:mt-0">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;

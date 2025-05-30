import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Mail, Menu, X } from "lucide-react";

export default function Navigation() {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location === path;

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/">
            <div className="flex items-center cursor-pointer">
              <Mail className="text-ukrainian-blue h-8 w-8 mr-2" />
              <span className="font-playfair font-bold text-xl text-gray-900">Odesa Holiday</span>
            </div>
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/#templates">
              <a className="text-gray-600 hover:text-ukrainian-blue transition-colors">Templates</a>
            </Link>
            <Link href="/#pricing">
              <a className="text-gray-600 hover:text-ukrainian-blue transition-colors">Pricing</a>
            </Link>
            <Link href="/#gallery">
              <a className="text-gray-600 hover:text-ukrainian-blue transition-colors">Gallery</a>
            </Link>
            <Link href="/events">
              <a className="text-gray-600 hover:text-ukrainian-blue transition-colors">Events</a>
            </Link>
            <Link href="/locations">
              <a className="text-gray-600 hover:text-ukrainian-blue transition-colors">Locations</a>
            </Link>
            <Link href="/dashboard">
              <a className="text-gray-600 hover:text-ukrainian-blue transition-colors">Dashboard</a>
            </Link>
            <Link href="/creator">
              <Button className="bg-ukrainian-blue hover:bg-blue-700">
                Start Creating
              </Button>
            </Link>
          </div>
          
          <button 
            className="md:hidden text-gray-600"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
        
        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
              <Link href="/#templates">
                <a className="block px-3 py-2 text-gray-600 hover:text-ukrainian-blue transition-colors">Templates</a>
              </Link>
              <Link href="/#pricing">
                <a className="block px-3 py-2 text-gray-600 hover:text-ukrainian-blue transition-colors">Pricing</a>
              </Link>
              <Link href="/#gallery">
                <a className="block px-3 py-2 text-gray-600 hover:text-ukrainian-blue transition-colors">Gallery</a>
              </Link>
              <Link href="/events">
                <a className="block px-3 py-2 text-gray-600 hover:text-ukrainian-blue transition-colors">Events</a>
              </Link>
              <Link href="/locations">
                <a className="block px-3 py-2 text-gray-600 hover:text-ukrainian-blue transition-colors">Locations</a>
              </Link>
              <Link href="/dashboard">
                <a className="block px-3 py-2 text-gray-600 hover:text-ukrainian-blue transition-colors">Dashboard</a>
              </Link>
              <div className="px-3 py-2">
                <Link href="/creator">
                  <Button className="w-full bg-ukrainian-blue hover:bg-blue-700">
                    Start Creating
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

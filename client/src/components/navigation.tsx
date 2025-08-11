import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/lib/i18n";
import LanguageSwitcher from "@/components/language-switcher";
import { Mail, Menu, X, User, LogOut, Crown } from "lucide-react";

export default function Navigation() {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { t } = useLanguage();

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
            <a href="/#templates" className="text-gray-600 hover:text-ukrainian-blue transition-colors cursor-pointer">
              {t('landing.features.templates.title')}
            </a>
            <a href="/#pricing" className="text-gray-600 hover:text-ukrainian-blue transition-colors cursor-pointer">
              {t('subscription.title')}
            </a>
            <a href="/#gallery" className="text-gray-600 hover:text-ukrainian-blue transition-colors cursor-pointer">
              Gallery
            </a>
            <Link href="/events">
              <span className="text-gray-600 hover:text-ukrainian-blue transition-colors cursor-pointer">{t('nav.events')}</span>
            </Link>
            <Link href="/locations">
              <span className="text-gray-600 hover:text-ukrainian-blue transition-colors cursor-pointer">{t('nav.locations')}</span>
            </Link>
            {isAuthenticated && (
              <Link href="/dashboard">
                <span className="text-gray-600 hover:text-ukrainian-blue transition-colors cursor-pointer">{t('nav.dashboard')}</span>
              </Link>
            )}
            {isAuthenticated && user?.email === "admin@odesa.holiday" && (
              <Link href="/admin">
                <span className="text-gray-600 hover:text-ukrainian-blue transition-colors cursor-pointer">{t('nav.admin')}</span>
              </Link>
            )}
            
            {/* Language Switcher */}
            <LanguageSwitcher />
            
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-600" />
                  <span className="text-sm text-gray-600">{user?.email}</span>
                </div>
                <Link href="/subscription">
                  <Button variant="outline" size="sm" className="text-yellow-600 border-yellow-400 hover:bg-yellow-50">
                    <Crown className="h-4 w-4 mr-2" />
                    {t('subscription.subscribe')}
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={logout}
                  className="text-gray-600 hover:text-red-600"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {t('nav.logout')}
                </Button>
                <Link href="/creator">
                  <Button className="bg-ukrainian-blue hover:bg-blue-700">
                    {t('nav.creator')}
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/login">
                  <Button variant="outline" size="sm">
                    {t('nav.login')}
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-ukrainian-blue hover:bg-blue-700">
                    {t('nav.register')}
                  </Button>
                </Link>
              </div>
            )}
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
              <a href="/#templates" className="block px-3 py-2 text-gray-600 hover:text-ukrainian-blue transition-colors cursor-pointer">
                Templates
              </a>
              <a href="/#pricing" className="block px-3 py-2 text-gray-600 hover:text-ukrainian-blue transition-colors cursor-pointer">
                Pricing
              </a>
              <a href="/#gallery" className="block px-3 py-2 text-gray-600 hover:text-ukrainian-blue transition-colors cursor-pointer">
                Gallery
              </a>
              <Link href="/events">
                <span className="block px-3 py-2 text-gray-600 hover:text-ukrainian-blue transition-colors cursor-pointer">Events</span>
              </Link>
              <Link href="/locations">
                <span className="block px-3 py-2 text-gray-600 hover:text-ukrainian-blue transition-colors cursor-pointer">Locations</span>
              </Link>
              {isAuthenticated && (
                <Link href="/dashboard">
                  <span className="block px-3 py-2 text-gray-600 hover:text-ukrainian-blue transition-colors cursor-pointer">Dashboard</span>
                </Link>
              )}
              {isAuthenticated && (user?.email?.includes("admin") || user?._id === "6839cd39c5de6bc3b492e772") && (
                <Link href="/admin">
                  <span className="block px-3 py-2 text-gray-600 hover:text-ukrainian-blue transition-colors cursor-pointer">Admin</span>
                </Link>
              )}
              
              {isAuthenticated ? (
                <div className="px-3 py-2 space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <User className="h-4 w-4" />
                    <span>{user?.email}</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={logout}
                    className="w-full text-gray-600 hover:text-red-600"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                  <Link href="/creator">
                    <Button className="w-full bg-ukrainian-blue hover:bg-blue-700">
                      Start Creating
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="px-3 py-2 space-y-2">
                  <Link href="/login">
                    <Button variant="outline" size="sm" className="w-full">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button className="w-full bg-ukrainian-blue hover:bg-blue-700">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

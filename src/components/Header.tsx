"use client";

import { ReactNode, memo, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

const Header = memo(({ children }: { children?: ReactNode }) => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = useMemo(() => [
    { href: "/", label: "Dashboard", icon: "🏠" },
    { href: "/add-customer", label: "Add Customer", icon: "👤" },
    { href: "/pipeline", label: "Sales Pipeline", icon: "📊" },
    { href: "/analytics", label: "Analytics", icon: "📈" },
    { href: "/documents", label: "Documents", icon: "📄" },
    { href: "/automation", label: "Automation", icon: "🤖" },
  ], []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="bg-[var(--color-header-bg)] border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[var(--color-primary)] rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
              <span className="text-white font-extrabold text-lg sm:text-xl tracking-tight">AI</span>
            </div>
            <span className="text-lg sm:text-xl lg:text-2xl font-extrabold tracking-tight text-[var(--color-primary)] select-none">
              <span className="hidden sm:inline">CRM Assistant</span>
              <span className="sm:hidden">CRM</span>
            </span>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3 lg:px-4 py-2 lg:py-3 rounded-xl font-medium transition-all duration-200 border border-transparent focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 hover:scale-105 hover:shadow-md
                  ${
                    pathname === item.href
                      ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-md"
                      : "text-[var(--color-text)] hover:bg-[var(--color-accent)] hover:text-white hover:border-[var(--color-accent)]"
                  }
                `}
              >
                <span className="text-base lg:text-lg">{item.icon}</span>
                <span className="hidden lg:inline">{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-4">
            {children && (
              <div className="flex items-center gap-2">
                {children}
              </div>
            )}
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Desktop children */}
          {children && (
            <div className="hidden md:flex items-center gap-4">
              {children}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <nav className="px-4 py-2 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 border border-transparent focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2
                  ${
                    pathname === item.href
                      ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-md"
                      : "text-[var(--color-text)] hover:bg-[var(--color-accent)] hover:text-white hover:border-[var(--color-accent)]"
                  }
                `}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
});

Header.displayName = 'Header';

export default Header; 
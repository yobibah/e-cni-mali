import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  FileText,
  Search,
  Building2,
  HelpCircle,
  Menu,
  X,
  User,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Cookies from "js-cookie";
import getToken from "../../hooks/token";

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [token, setToken] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const t = getToken();
    setToken(t || null);
  }, [location.pathname]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProfileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    Cookies.remove("token", { path: "/" });
    setToken(null);
    navigate("/connexion");
  };

const navLinks = [
  ...(token
    ? []
    : [{ name: "Accueil", path: "/", icon: Home }]),
  { name: "Faire une demande", path: "/demande", icon: FileText },
  { name: "Suivre ma demande", path: "/suivre-demande", icon: Search },
  { name: "Centres", path: "/centres", icon: Building2 },
  { name: "Aide", path: "/aides", icon: HelpCircle },
];

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <header className="bg-white sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center gap-3 shrink-0 group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-green-50 to-gray-50 shadow-sm border border-gray-100 flex items-center justify-center group-hover:shadow-md transition-all duration-300">
              <img
                src="/oni.jpg"
                alt="Logo ONI"
                className="w-9 h-9 rounded-lg object-cover"
              />
            </div>

            <div className="leading-tight">
              <p className="text-sm font-bold text-gray-800 tracking-tight">
                Direction Nationale de l'
                <span className="text-[#14B53A]">État Civil</span>
              </p>
              <p className="text-[11px] text-gray-500 mt-0.5 font-medium">
                DNEC · Republique du Mali
              </p>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);

              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`relative flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    active
                      ? "text-green-700 bg-green-50"
                      : "text-gray-600 hover:text-[#14B53A] hover:bg-gray-50"
                  }`}
                >
                  <Icon
                    size={16}
                    className={active ? "text-[#14B53A]" : "text-gray-400"}
                  />

                  {link.name}

                  {active && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-green-500 to-[#14B53A] rounded-full"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {token ? (
            <div className="hidden lg:flex items-center gap-4 shrink-0">
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-all duration-200"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-[#14B53A] flex items-center justify-center">
                    <User size={16} className="text-white" />
                  </div>

                  <span className="text-sm font-medium text-gray-700">
                    Mon compte
                  </span>

                  <ChevronDown size={14} className="text-gray-400" />
                </button>

                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50"
                    >
                      <Link
                        to="/profil"
                        className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-green-50 hover:text-[#14B53A] transition-colors"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <User size={16} />
                        Mon profil
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100"
                      >
                        <LogOut size={16} />
                        Déconnexion
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          ) : (
            <div className="hidden lg:flex items-center gap-3 shrink-0">
              <Link
                to="/connexion"
                className="px-5 py-2.5 rounded-lg text-sm font-semibold text-gray-600 hover:text-[#14B53A] hover:bg-gray-50 transition-all duration-200"
              >
                Connexion
              </Link>

              <Link
                to="/Inscription"
                className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-[#14B53A] to-green-500 hover:from-green-700 hover:to-[#14B53A] shadow-sm hover:shadow-md transition-all duration-200"
              >
                Inscription
              </Link>
            </div>
          )}

          <button
            onClick={() => setIsMobileMenuOpen((v) => !v)}
            className="lg:hidden p-2.5 rounded-lg bg-gradient-to-r from-[#14B53A] to-green-500 text-white shadow-md transition-transform active:scale-95"
            aria-label="Menu"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={isMobileMenuOpen ? "close" : "open"}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="block"
              >
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </motion.span>
            </AnimatePresence>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
            className="lg:hidden bg-white border-t border-gray-100 overflow-hidden shadow-lg"
          >
            <div className="px-4 py-4 space-y-2">
              {navLinks.map((link, index) => {
                const Icon = link.icon;
                const active = isActive(link.path);

                return (
                  <motion.div
                    key={link.name}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -20, opacity: 0 }}
                    transition={{
                      delay: index * 0.05,
                      duration: 0.2,
                      ease: "easeOut",
                    }}
                  >
                    <Link
                      to={link.path}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                        active
                          ? "text-green-700 bg-green-50"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Icon
                        size={18}
                        className={
                          active ? "text-[#14B53A]" : "text-gray-400"
                        }
                      />

                      {link.name}

                      {active && (
                        <span className="ml-auto w-2 h-2 rounded-full bg-green-500" />
                      )}
                    </Link>
                  </motion.div>
                );
              })}

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: navLinks.length * 0.05 + 0.1 }}
                className="border-t border-gray-100 pt-4 mt-2 space-y-2"
              >
                {token ? (
                  <>
                    <Link
                      to="/profil"
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-green-50 hover:text-[#14B53A] transition-all duration-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <User size={18} className="text-gray-400" />
                      Mon profil
                    </Link>

                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all duration-200"
                    >
                      <LogOut size={18} />
                      Déconnexion
                    </button>
                  </>
                ) : (
                  <div className="space-y-2">
                    <Link
                      to="/connexion"
                      className="flex items-center justify-center px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 border border-gray-200 hover:border-green-500 hover:text-[#14B53A] transition-all duration-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Connexion
                    </Link>

                    <Link
                      to="/Inscription"
                      className="flex items-center justify-center px-4 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#14B53A] to-green-500 hover:from-green-700 hover:to-[#14B53A] transition-all duration-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Inscription
                    </Link>
                  </div>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

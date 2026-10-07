import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Banknote,
  UserCheck,
  FileText,
  Settings,
  LogOut,
  X,
  Building2,
  Moon,
  Sun,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import LogOutModal from "./modal/LogoutModal";

export function NavBar({ isOpen, onClose }) {
  const location = useLocation();

  const [logModal,setLogModal] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme) {
      return savedTheme === "dark";
    }

    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const navLinks = [
    {
      name: "Tableau de bord",
      path: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Utilisateurs",
      path: "/admin/demandeur",
      icon: UserCheck,
    },
    {
      name: "Demandes",
      path: "/admin/utilisateur/demande",
      icon: FileText,
    },
    {
      name: "Paiements",
      path: "/admin/paiement",
      icon: Banknote,
    },
    {
      name: "Centres",
      path: "/admin/centres",
      icon: Building2,
    },
  ];

  const isActive = (path) => {
    if (path === "/admin/dashboard") {
      return location.pathname === path;
    }

    return location.pathname.startsWith(path);
  };

  const sidebarContent = (
    <nav className="flex flex-col w-64 h-full bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 px-4 py-5 shadow">
      {/* Logo */}
      <div className="flex items-center justify-between mb-7 px-1">
        <Link
          to="/"
          className="flex items-center gap-3"
          onClick={onClose}
        >
          <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 flex items-center justify-center">
            <img
              src="/oni.jpg"
              alt="Logo ONI"
              className="w-8 h-8 rounded-lg object-cover"
            />
          </div>

          <div className="leading-tight">
            <p className="text-[12.5px] font-bold text-gray-800 dark:text-white">
              Office National{" "}
              <span className="text-[#14B53A]">
                d'Identification
              </span>
            </p>

            <p className="text-[10.5px] text-gray-400 dark:text-gray-500">
              ONI · Republique du Mali
            </p>
          </div>
        </Link>

        <button
          onClick={onClose}
          className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <X size={18} />
        </button>
      </div>

      {/* Liens */}
      <div className="flex flex-col gap-1 flex-1">
        <p className="text-[10px] font-semibold text-gray-400 uppercase px-3 mb-1">
          Menu principal
        </p>

        {navLinks.map((link) => {
          const Icon = link.icon;
          const active = isActive(link.path);

          return (
            <Link
              key={link.name}
              to={link.path}
              onClick={onClose}
              className={`relative flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13.5px] font-medium transition ${
                active
                  ? "text-green-700 dark:text-green-400"
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-800 dark:hover:text-white"
              }`}
            >
              {active && (
                <>
                  <motion.div
                    layoutId="bg"
                    className="absolute inset-0 bg-green-50 dark:bg-green-900/20 rounded-xl -z-10"
                  />

                  <motion.div
                    layoutId="bar"
                    className="absolute left-0 top-2 bottom-2 w-[3px] bg-[#14B53A] rounded-r-full"
                  />
                </>
              )}

              <Icon
                size={17}
                className={
                  active
                    ? "text-[#14B53A]"
                    : "text-gray-400 dark:text-gray-500"
                }
              />

              <span className={active ? "font-semibold" : ""}>
                {link.name}
              </span>
            </Link>
          );
        })}
      </div>

      <div className="border-t border-gray-100 dark:border-gray-800 my-3" />

      {/* Paramètres */}
      <div className="flex flex-col gap-1">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="flex items-center justify-between px-3 py-2.5 rounded-xl text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
        >
          <div className="flex items-center gap-2.5">
            {darkMode ? <Sun size={17} /> : <Moon size={17} />}
            <span>
              {darkMode ? "Mode clair" : "Mode sombre"}
            </span>
          </div>

          <div
            className={`relative w-10 h-5 rounded-full transition ${
              darkMode
                ? "bg-[#14B53A]"
                : "bg-gray-300 dark:bg-gray-700"
            }`}
          >
            <div
              className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${
                darkMode ? "left-5" : "left-0.5"
              }`}
            />
          </div>
        </button>

        {/* <Link
          to="/admin/parametres"
          onClick={onClose}
          className="flex items-center gap-2.5 px-3 py-2.5 text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition"
        >
          <Settings size={17} />
          Paramètres
        </Link> */}

        <button
        onClick={()=>setLogModal((prev)=>!prev)}
         className="flex items-center gap-2.5 px-3 py-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition">
          <LogOut size={17} />
          Déconnexion
        </button>
      </div>
    </nav>
  );

  return (
    <>
      {/* Desktop */}
      <div className="hidden lg:flex lg:fixed lg:top-0 lg:left-0 lg:h-screen lg:z-30">
        {sidebarContent}
      </div>

      <div className="hidden lg:block w-64 shrink-0" />

      {/* Mobile */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40 lg:hidden"
              onClick={onClose}
            />

            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
              }}
              className="fixed top-0 left-0 h-full z-50 lg:hidden"
            >
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {logModal && (
        <LogOutModal setOpen={setLogModal}/>
      )
      }
    </>
  );
}
import { useState } from "react";
import {
  Mail, Lock, Eye, EyeOff,
  Shield, Loader2, UserCog
} from "lucide-react";
import bgImage from "../../../assets/im1.png";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import Cookies from 'js-cookie';
import handleLoginAdmin from "../../../api/admin/AdminLogin";
// import handleAdminLogin from "../../../api/auth/adminLogin";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [eyes, setEyes] = useState(false);
  const [active, setActive] = useState("");
  const navigation = useNavigate();

  const LoginMutation = useMutation({
    mutationFn: ({ email, pwd }) => handleLoginAdmin(email, pwd),
    onSuccess: (data) => {
      Cookies.set('AdminToken', data.token, { 
        expires: 1,
        path: '/',
        secure: window.location.protocol === 'https:', 
        sameSite: 'strict'
      });
      
      if (data.admin) {
        localStorage.setItem('adminInfo', JSON.stringify(data.admin));
      }
      
      toast.success("Connexion administrateur réussie !");
      navigation("/admin/dashboard", { replace: true });
    },
    onError: (error) => {
      const message =
        error.status === 404
          ? "Aucun administrateur trouvé avec cet email"
          : error.status === 401
          ? "Mot de passe incorrect"
          : error.response?.data?.error || "Erreur de connexion";
      toast.error(message);
    },
  });

  const handleLog = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.warning("Veuillez saisir votre adresse email.");
      return;
    }
    if (pwd.length < 8) {
      toast.warning("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    LoginMutation.mutate({ email, pwd });
  };

  const inputClass = (field) =>
    `block w-full pl-10 pr-3 py-2.5 border rounded-md text-sm outline-none transition ${
      active === field
        ? "border-green-500 ring-1 ring-green-500 bg-white"
        : "border-gray-300 bg-white"
    }`;

  return (
    <div className="min-h-screen bg-grid-light from-green-50 via-white to-emerald-50 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="w-full max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex flex-col lg:flex-row w-full shadow-lg rounded-xl overflow-hidden border border-gray-200"
        >
          {/* Partie gauche - Informations Admin */}
          {/* <div
            className="text-white p-6 lg:w-72 shrink-0 flex flex-col gap-4 bg-cover bg-center relative"
            style={{ backgroundImage: `url(${bgImage})` }}
          >
            <div className="absolute inset-0 bg-green-900/70 rounded-lg"></div>
            <div className="relative z-10 flex flex-col gap-4">
              <div className="flex items-center gap-2 bg-green-400 text-green-900 rounded-lg px-3 py-2 w-fit">
                <UserCog size={14} className="text-green-900" />
                <p className="text-sm font-semibold">Administration</p>
              </div>
              <p className="text-green-100 text-sm leading-relaxed">
                Gérez les utilisateurs, les demandes et les paramètres de la plateforme.
              </p>
              <ul className="space-y-3 text-sm text-green-50">
                {[
                  "Gestion des utilisateurs et des rôles",
                  "Suivi des demandes en temps réel",
                  "Administration des concours et inscriptions",
                  "Statistiques et rapports",
                ].map((item) => (
                  <li key={item} className="flex gap-2 items-start">
                    <span className="mt-0.5 w-4 h-4 rounded-full bg-green-400 text-green-900 flex items-center justify-center shrink-0 text-[10px] font-bold">
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div> */}

          {/* Partie droite - Formulaire */}
          <form onSubmit={handleLog} className="bg-white flex-1 p-6 sm:p-8 space-y-5">
            {/* Titre du formulaire */}
            <div className="text-center mb-4">
              <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-3">
                <Shield className="w-8 h-8 text-[#14B53A]" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Espace Administrateur</h2>
              <p className="text-sm text-gray-500 mt-1">Connectez-vous à votre espace d'administration</p>
            </div>

            <div className="mb-2">
              <div className="flex items-center gap-2 mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Adresse email
                </label>
                <span className="text-red-500 text-xs font-bold">*</span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setActive("email")}
                  onBlur={() => setActive("")}
                  className={inputClass("email")}
                  placeholder="admin@DNEC.gov.ml"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type={eyes ? "text" : "password"}
                  value={pwd}
                  onChange={(e) => setPwd(e.target.value)}
                  onFocus={() => setActive("pwd")}
                  onBlur={() => setActive("")}
                  className={`block w-full pl-10 pr-10 py-2.5 border rounded-md text-sm outline-none transition ${
                    active === "pwd"
                      ? "border-green-500 ring-1 ring-green-500 bg-white"
                      : "border-gray-300 bg-white"
                  }`}
                  placeholder="Mot de passe administrateur"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setEyes(!eyes)}
                  className="absolute inset-y-0 right-2 flex items-center cursor-pointer text-gray-400 hover:text-gray-600"
                >
                  {eyes ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {pwd.length > 0 && pwd.length < 8 && (
                  <span className="text-red-500">Minimum 8 caractères</span>
                )}
                {pwd.length >= 8 && (
                  <span className="text-green-500">✓ Mot de passe valide</span>
                )}
              </div>
            </div>

            {/* <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="accent-[#14B53A]" />
                <span className="text-gray-600">Se souvenir de moi</span>
              </label>
              <button
                type="button"
                className="text-[#14B53A] font-medium hover:text-green-700 cursor-pointer"
                onClick={() => navigation('/admin/forgot-password')}
              >
                Mot de passe oublié ?
              </button>
            </div> */}

            {/* UNIQUEMENT LE BOUTON SE CONNECTER */}
            <button
              type="submit"
              disabled={LoginMutation.isPending || pwd.length < 8}
              className={`flex gap-2 w-full rounded-lg text-white font-semibold text-base py-3 justify-center items-center transition ${
                LoginMutation.isPending || pwd.length < 8
                  ? "bg-green-300 cursor-not-allowed"
                  : "bg-[#14B53A] hover:bg-green-700 cursor-pointer"
              }`}
            >
              {LoginMutation.isPending ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Shield size={18} />
              )}
              {LoginMutation.isPending ? "Connexion en cours..." : "Se connecter"}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
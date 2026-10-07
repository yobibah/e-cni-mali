import { useState, useEffect } from "react";
import { Header } from "../../components/ui/header";
import {
  Phone, Lock, Eye, EyeOff, SquareArrowRight,
  Star, Loader2,
} from "lucide-react";
import { Footer } from "../../components/ui/footer";
import bgImage from "../../assets/im1.png";
import handleLogin from "../../api/auth/login";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import Cookies from 'js-cookie';

export default function Login() {
  const [telephone, setTelephone] = useState("");
  const [pwd, setPwd] = useState("");
  const [eyes, setEyes] = useState(false);
  const [active, setActive] = useState("");
  const navigation = useNavigate();

  const LoginMutation = useMutation({
    mutationFn: ({ telephone, pwd }) => handleLogin(telephone, pwd),
    onSuccess: (data) => {
      // Utilisation de js-cookie pour créer un cookie qui expire en 24h
      Cookies.set('token', data.token, { 
        expires: 1, // 1 jour = 24 heures
        path: '/',
        secure: window.location.protocol === 'https:', 
        sameSite: 'strict'
      });
      toast.success("Connexion réussie !");
      navigation("/Home", { replace: true });
    },
    onError: (error) => {
      const message =
        error.status === 404
          ? "Numéro introuvable"
          : error.status === 401
          ? "Mot de passe incorrect"
          : error.message || "Erreur de connexion";
      toast.error(message);
    },
  });

  const handleLog = async (e) => {
    e.preventDefault();
    if (!telephone) {
      toast.warning("Veuillez saisir votre numéro de téléphone.");
      return;
    }
    LoginMutation.mutate({ telephone, pwd });
  };

  const inputClass = (field) =>
    `block w-full pl-10 pr-3 py-2.5 border rounded-md text-sm outline-none transition ${
      active === field
        ? "border-green-500 ring-1 ring-green-500 bg-white"
        : "border-gray-300 bg-white"
    }`;

  return (
    <>
      <Header />

      <div className="min-h-screen bg-grid-light px-4 sm:px-6 lg:px-8 pb-12">
        <div className="flex flex-col items-center justify-center mt-10">
          <div className="flex flex-col items-center text-center mb-8 px-2">
            <div className="w-20 h-20 sm:w-24 sm:h-24 ring-4 ring-green-100 rounded-full">
              <img
                src="/oni.jpg"
                alt="logo oni"
                className="w-full h-full object-contain rounded-full"
              />
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 mt-3">
              Connexion à votre Espace
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Plateforme Nationale d'Identification Unique
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex flex-col lg:flex-row w-full max-w-3xl gap-0 shadow-md rounded-xl overflow-hidden border border-gray-200"
          >
            <div
              className="text-white p-6 lg:w-72 shrink-0 flex flex-col gap-4 bg-cover bg-center relative"
              style={{ backgroundImage: `url(${bgImage})` }}
            >
              <div className="absolute inset-0 bg-black/50 rounded-lg"></div>
              <div className="relative z-10 flex flex-col gap-4">
                <div className="flex items-center gap-2 bg-yellow-400 text-yellow-900 rounded-lg px-3 py-2 w-fit">
                  <Star size={14} className="fill-yellow-700 text-yellow-700" />
                  <p className="text-sm font-semibold">Espace Demandeur</p>
                </div>
                <p className="text-green-100 text-sm leading-relaxed">
                  Accédez à vos inscriptions, concours et services en toute sécurité.
                </p>
                <ul className="space-y-3 text-sm text-green-50">
                  {[
                    "Gestion des inscriptions aux concours",
                    "Suivi de vos candidatures en temps réel",
                    "Accès sécurisé à votre dossier",
                  ].map((item) => (
                    <li key={item} className="flex gap-2 items-start">
                      <span className="mt-0.5 w-4 h-4 rounded-full bg-yellow-400 text-yellow-900 flex items-center justify-center shrink-0 text-[10px] font-bold">
                        ✓
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <form onSubmit={handleLog} className="bg-white flex-1 p-6 sm:p-8 space-y-5">
              <div>
                <div className="flex flex-row items-center gap-3 mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Numéro de téléphone
                  </label>
                  <p className="text-red-500 text-xs font-bold">(sans le 223)</p>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={telephone}
                    onChange={(e) => setTelephone(e.target.value)}
                    onFocus={() => setActive("tel")}
                    onBlur={() => setActive("")}
                    className={inputClass("tel")}
                    placeholder="Ex: 70 00 00 00"
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
                    placeholder="Mot de passe"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setEyes(!eyes)}
                    className="absolute inset-y-0 right-2 flex items-center cursor-pointer text-gray-400 hover:text-gray-600"
                  >
                    {eyes ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:justify-between gap-2 sm:items-center text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="accent-[#14B53A]" />
                  <span className="text-gray-600">Se souvenir de moi</span>
                </label>
                <button
                  type="button"
                  className="text-[#14B53A] font-medium hover:text-green-700 text-left sm:text-right cursor-pointer"
                  onClick={()=>navigation('/forgot-password')}
                >
                  Mot de passe oublié ?
                </button>
              </div>

              <button
                type="submit"
                disabled={pwd.length < 8}
                className={`flex gap-2 w-full rounded-lg text-white font-semibold text-base py-2.5 justify-center items-center transition ${
                  pwd.length < 8
                    ? "bg-green-300 cursor-not-allowed"
                    : "bg-[#14B53A] hover:bg-green-700 cursor-pointer"
                }`}
              >
                {LoginMutation.isPending ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Lock size={16} />
                )}
                Se connecter
              </button>

              <div className="flex items-center gap-3">
                <div className="flex-1 border-b border-gray-200" />
                <p className="text-xs text-gray-400 whitespace-nowrap">
                  Nouveau sur la plateforme ?
                </p>
                <div className="flex-1 border-b border-gray-200" />
              </div>

              <button
                type="button"
                className="relative w-full flex justify-center items-center gap-2 py-2.5 border border-green-200 overflow-hidden group rounded-lg cursor-pointer text-green-700 hover:text-white transition-colors duration-300"
                onClick={() => navigation("/Inscription")}
              >
                <span className="absolute inset-0 bg-[#14B53A] scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-300" />
                <SquareArrowRight size={18} className="relative z-10" />
                <span className="relative z-10 font-medium text-sm">Créer un compte</span>
              </button>
            </form>
          </motion.div>
        </div>
      </div>

      <Footer />
    </>
  );
}


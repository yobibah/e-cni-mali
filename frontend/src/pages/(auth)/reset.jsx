import { useState } from "react";
import { motion } from "framer-motion";
import { Header } from "../../components/ui/header";
import { 
  Lock, SquareArrowRight, Star, ArrowLeft, 
  KeyRound, Eye, EyeOff, ShieldCheck 
} from "lucide-react";
import { Footer } from "../../components/ui/footer";
import bgImage from "../../assets/im1.png";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import changePassword from "../../api/auth/changePassword";

const Reset = () => {
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [active, setActive] = useState("");
  const navigation = useNavigate();

  const ResetMutation = useMutation({
    mutationFn: ({  mdp, otp }) => changePassword(mdp, otp),
    onSuccess: () => {
      toast.success("Votre mot de passe a été mis à jour avec succès");
      localStorage.clear()
      setTimeout(() => navigation("/connexion"), 2000);
    },
    onError: (error) => {
      toast.error(
        error.message || "Le traitement de votre demande n’a pas pu aboutir. Veuillez réessayer ultérieurement. lors de la mise à jour du mot de passe"
      );
    },
  });

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (!otp || otp.length !== 6) {
      return toast.error("Veuillez entrer un code OTP valide à 8 chiffres");
    }
    
    if (!password || !password2) {
      return toast.error("Tous les champs doivent être remplis");
    }
    
    if (password !== password2) {
      return toast.error("Les mots de passe ne correspondent pas");
    }
    
    if (password.length < 8) {
      return toast.error("Le mot de passe doit contenir au moins 6 caractères");
    }
    // console.log(password)
    const mdp = password;
    ResetMutation.mutate({ mdp, otp });
  };

  const inputClass = (field) =>
    `block w-full pl-10 pr-3 py-2.5 border rounded-md text-sm outline-none transition ${
      active === field
        ? "border-green-500 ring-1 ring-green-500 bg-white"
        : "border-gray-300 bg-white"
    }`;

  
  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, ""); 
    if (value.length <= 6) {
      setOtp(value);
    }
  };

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
              Réinitialiser Votre{" "}
              <span className="text-[#14B53A] font-black"> Mot de Passe </span>
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Plateforme Nationale d'Identification Unique
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex flex-col lg:flex-row w-full max-w-3xl mx-auto gap-0 shadow-md rounded-xl overflow-hidden border border-gray-200"
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
                  Accédez à vos inscriptions, concours et services en toute
                  sécurité.
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

            <form
              onSubmit={handleResetPassword}
              className="bg-white flex-1 p-6 sm:p-8 space-y-5"
            >
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Nouveau Mot de Passe
                </h2>
                <p className="text-sm text-gray-600">
                  Entrez le code de vérification et votre nouveau mot de passe
                </p>
              </div>

              {/* Champ OTP */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Code de vérification (OTP)
                  </label>
                  <ShieldCheck size={14} className="text-[#14B53A]" />
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <KeyRound className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={otp}
                    onChange={handleOtpChange}
                    onFocus={() => setActive("otp")}
                    onBlur={() => setActive("")}
                    className={inputClass("otp")}
                    placeholder="Entrez le code à 6 chiffres"
                    maxLength={6}
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Un code à 6 chiffres a été envoyé sur votre téléphone
                </p>
              </div>

              {/* Champ Nouveau mot de passe */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nouveau mot de passe
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setActive("password")}
                    onBlur={() => setActive("")}
                    className={inputClass("password")}
                    placeholder="Entrez votre nouveau mot de passe"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Champ Confirmation mot de passe */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type={showPassword2 ? "text" : "password"}
                    value={password2}
                    onChange={(e) => setPassword2(e.target.value)}
                    onFocus={() => setActive("password2")}
                    onBlur={() => setActive("")}
                    className={inputClass("password2")}
                    placeholder="Confirmez votre nouveau mot de passe"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword2(!showPassword2)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword2 ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Message d'information */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-xs text-yellow-800 text-center">
                   Le mot de passe doit contenir au moins 8 caractères
                </p>
              </div>

              <button
                type="submit"
                disabled={ResetMutation.isPending}
                className={`flex gap-2 w-full rounded-lg text-white font-semibold text-base py-2.5 justify-center items-center transition 
                ${
                  ResetMutation.isPending
                    ? "bg-green-400 cursor-not-allowed"
                    : "bg-[#14B53A] hover:bg-green-700 cursor-pointer"
                }`}
              >
                {ResetMutation.isPending ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <Lock size={16} />
                )}
                {ResetMutation.isPending
                  ? "Mise à jour en cours..."
                  : "Réinitialiser le mot de passe"}
              </button>

              <button
                type="button"
                className="relative w-full flex justify-center items-center gap-2 py-2.5 border border-green-200 overflow-hidden group rounded-lg cursor-pointer text-green-700 hover:text-white transition-colors duration-300"
                onClick={() => navigation("/connexion")}
              >
                <span className="absolute inset-0 bg-[#14B53A] scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-300" />
                <SquareArrowRight size={18} className="relative z-10" />
                <span className="relative z-10 font-medium text-sm">
                  Se Connecter
                </span>
              </button>
            </form>
          </motion.div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Reset;
import { useEffect, useState } from "react";
import { Header } from "../../components/ui/header";
import { Footer } from "../../components/ui/footer";
import {
  PersonStanding, User, Phone, ArrowLeftCircle, ArrowRightCircle,
  Mail, MapPin, Info, Star, Check, Lock, Eye, EyeOff,
} from "lucide-react";
import bgImage from "../../assets/im1.png";
import { useMutation } from "@tanstack/react-query";
import { step1, step2, step3 } from "../../api/auth/register";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import resendCodeOtp from "../../api/auth/resendOtp";

const stepLabels = ["Identité", "État Civil", "Vérification"];

const Inscription = () => {
  const [active, setActive] = useState("");
  const inputClass = (field) =>
    `block w-full pl-10 pr-3 py-2.5 border rounded-md text-sm outline-none transition-all duration-200 ${
      active === field
        ? "border-green-500 ring-2 ring-green-100 bg-white shadow-sm"
        : "border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-white"
    }`;
  const navigation = useNavigate();

  const [token, setToken] = useState(null);
  const [eyes1, setEyes1] = useState(false);
  const [eyes2, setEyes2] = useState(false);

  const [step, setStep] = useState(1);
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [genre, setGenre] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [date_naissance, setDatenaissance] = useState();
  const [mot_de_passe1, setMdp1] = useState("");
  const [mot_de_passe2, setMdp2] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [lieux_naissance, setlieux_naissance] = useState("");
  const [prenom_pere, setPrenom_pere] = useState("");
  const [prenom_mere, setPrenom_mere] = useState("");
  const [numero_acte, setNumero_acte] = useState("");
  const [commune_acte, setCommune_acte] = useState("");
  const [numero_certificat, setNumero_certificat] = useState("");
  const [profession, setProfession] = useState("");
  const [adres_residence, SetAdres_residence] = useState("");
  const [ville_province, setVille_province] = useState("");
  const [ageError, setAgeError] = useState(false);
  const [otp, setOtp] = useState("");





  useEffect(() => {
    const user_id = localStorage.getItem("user_id");
    const token = localStorage.getItem("refreshtoken");
    if (user_id) setStep(2);
    if (token) {
      setToken(token);
      setStep(3);
    }



  }, [token]);

const [timeLeft, setTimeLeft] = useState(0); 
const [startTimer, setStartTimer] = useState(false);

useEffect(() => {
  
  if (!startTimer) return;

  const interval = setInterval(() => {
    setTimeLeft((prev) => {
      if (prev <= 1) {
        clearInterval(interval);
        return 0;
      }

      return prev - 1;
    });
  }, 1000);

  return () => clearInterval(interval);
}, [startTimer]);


  useEffect(() => {
    if (!ageError) return;
    const timer = setTimeout(() => setAgeError(false), 3000);
    return () => clearTimeout(timer);
  }, [ageError]);

  const step1Mutation = useMutation({
    mutationFn: (data) => step1(data),
    onSuccess: (response) => {
      const utilisateurId = response.data.data.utilisateur_id;
      localStorage.setItem("user_id", utilisateurId);
      localStorage.setItem("tel", telephone);
      toast.success("Première étape validée avec succès !");
      setStep((prev) => prev + 1);
    },
    onError: (error) => {
      const message =
        error.status === 500 ? "Le traitement de votre demande n’a pas pu aboutir. Veuillez réessayer ultérieurement."
        : error.status === 401 ? "Autorisation requise"
        : error.error || "Erreur";
      toast.error(message);
    },
  });

  const step2Mutation = useMutation({
    mutationFn: (params) => step2(params),
    onSuccess: (response) => {
      const token = response.data.data.token;
      localStorage.setItem("refreshtoken", token);
      setToken(token);

          setTimeLeft(300); 
    setStartTimer(true);
      toast.success("Un code OTP a été envoyé sur votre numéro de téléphone.");
      setStep((prev) => prev + 1);
    },
    onError: (error) => {
      const message =
        error.status === 500 ? "Le traitement de votre demande n’a pas pu aboutir. Veuillez réessayer ultérieurement."
        : error.status === 401 ? "Autorisation requise"
        : error.error || "Erreur";
      toast.error(message);
    },
  });

  const step3Mutation = useMutation({
    mutationFn: ({ otp, token }) => step3(otp, token),
    onSuccess: () => {
      setToken("");
      localStorage.removeItem("refreshtoken");
      localStorage.removeItem("user_id");
      toast.success("Inscription réussie ! Redirection vers la connexion...");
      navigation("/connexion");
    },
    onError: () => {
      toast.error("Code OTP incorrect ou expiré. Veuillez réessayer.");
    },
  });

  const ResendOtp = useMutation({
    mutationFn: ({telephone}) => resendCodeOtp(telephone),
    onSuccess : () =>{
        
          toast.success("Code Otp renvoyer avec succes");
                    setTimeLeft(300);
              setStartTimer(true);
    },
    onError : (error)=>{
      toast.error(error.message || "Code OTP non envoyer. Veuillez réessayer.");
    }
    
  });

  const handleSendOtp = () =>{
   
    const telephone = localStorage.getItem('tel');
    console.log('telephone', telephone)

    if(!telephone){
         toast.warning("Numero de telephone requis");
      return ;
    }
    ResendOtp.mutate({telephone})
  } ;

  const handleStep1 = (e) => {
    e.preventDefault();
    if (!nom || !prenom || !genre || !email || !telephone || !date_naissance || !mot_de_passe1 || !mot_de_passe2) {
      toast.warning("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    if (mot_de_passe1 !== mot_de_passe2) {
      setPasswordError("Les mots de passe ne correspondent pas");
      toast.error("Les mots de passe ne correspondent pas.");
      return;
    }
    const isQuinzaine = (new Date().getFullYear() - new Date(date_naissance).getFullYear()) >= 15;
    // const maxAge = new Date().getFullYear()- new Date(date_naissance).getFullYear >=150;
    if (!isQuinzaine) {
      setAgeError(true);
      toast.error("Vous devez avoir au moins 15 ans pour vous inscrire.");
      return;
    }
    if (mot_de_passe1.length < 8) {
      setPasswordError("Le mot de passe doit contenir au moins 8 caractères");
      toast.error("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    setPasswordError("");
    const g = genre === "M" ? "HOMME" : "FEMME";
    step1Mutation.mutate({ nom, prenom, genre: g, email, telephone, date_naissance, mot_de_passe: mot_de_passe1 });
  };

  const handlestep2 = (e) => {
    e.preventDefault();
    if (!lieux_naissance || !prenom_pere || !prenom_mere || !numero_acte || !commune_acte || !numero_certificat || !profession || !adres_residence) {
      toast.warning("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    const user_id = localStorage.getItem("user_id");
    if (!user_id) {
      toast.error("Session expirée. Veuillez recommencer l'inscription.");
      return;
    }
    step2Mutation.mutate({ user_id, lieux_naissance, prenom_pere, prenom_mere, numero_acte, commune_acte, numero_certificat, profession, adres_residence, ville_province });
  };

  const handleStep3 = (e) => {
    e.preventDefault();
    if (!otp || otp.length < 6) {
      toast.warning("Veuillez saisir le code OTP à 6 chiffres.");
      return;
    }
    step3Mutation.mutate({ otp, token });
  };




  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        .inscription-root { font-family: 'Plus Jakarta Sans', sans-serif; }
        .form-card { animation: slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .step-bounce { animation: stepBounce 0.9s ease-in-out infinite; }
        @keyframes stepBounce {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-5px); }
        }
        .btn-primary {
          background: linear-gradient(135deg, #22c55e, #16a34a);
          color: #fff; font-weight: 600; padding: 0.65rem 1.5rem;
          border-radius: 0.75rem; border: none; cursor: pointer;
          display: flex; align-items: center; gap: 0.4rem;
          font-size: 0.9rem; transition: all 0.2s;
          box-shadow: 0 4px 14px rgba(34,197,94,0.3);
        }
        .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(22,163,74,0.4); }
        .btn-primary:active { transform: translateY(0); }
        .btn-secondary {
          background: #f1f5f9; color: #475569; font-weight: 600;
          padding: 0.65rem 1.5rem; border-radius: 0.75rem;
          border: 1.5px solid #e2e8f0; cursor: pointer;
          display: flex; align-items: center; gap: 0.4rem;
          font-size: 0.9rem; transition: all 0.2s;
        }
        .btn-secondary:hover { background: #e2e8f0; transform: translateY(-1px); }
        .step-connector {
          flex: 1; height: 2px; border-radius: 9999px;
          margin: 0 12px; transition: background 0.4s ease;
        }
        .error-text { color: #dc2626; font-size: 0.7rem; margin-top: 0.25rem; margin-left: 0.5rem; }
      `}</style>

      <div className="inscription-root">
        <Header />

        <div className="min-h-screen bg-grid-light px-4 sm:px-6 lg:px-8 pb-12">
          <div className="flex flex-col items-center justify-center mt-10">
            <div className="flex flex-col items-center text-center mb-8 px-2">
              <div className="w-20 h-20 sm:w-24 sm:h-24 ring-4 ring-green-100 rounded-full">
                <img src="/oni.jpg" alt="logo oni" className="w-full h-full object-contain rounded-full" />
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 mt-3">Créer votre compte</h1>
              <p className="text-sm text-gray-500 mt-1">
                L'inscription se déroule en <strong className="text-[#14B53A]">trois étapes</strong>

   
              </p>
            </div>           

            <div className="flex flex-col lg:flex-row w-full max-w-3xl gap-0 shadow-md rounded-xl overflow-hidden border border-gray-200">
              <div
                className="text-white p-6 lg:w-72 shrink-0 flex flex-col gap-4 bg-cover bg-center relative"
                style={{ backgroundImage: `url(${bgImage})` }}
              >
                <div className="absolute inset-0 bg-black/50 rounded-lg"></div>
                <div className="relative z-10 flex flex-col gap-4">
                  <div className="flex items-center gap-2 bg-yellow-400 text-yellow-900 rounded-lg px-3 py-2 w-fit">
                    <Star size={14} className="fill-yellow-700 text-yellow-700" />
                    <p className="text-sm font-semibold">Nouvel Inscrit</p>
                  </div>
                  <p className="text-green-100 text-sm leading-relaxed">
                    Créez votre compte et accédez à tous nos services en toute sécurité.
                  </p>
                  <ul className="space-y-3 text-sm text-green-50">
                    {[
                      "Inscription aux concours en ligne",
                      "Suivi de vos candidatures en temps réel",
                      "Accès sécurisé à votre dossier personnel",
                    ].map((item) => (
                      <li key={item} className="flex gap-2 items-start">
                        <span className="mt-0.5 w-4 h-4 rounded-full bg-yellow-400 text-yellow-900 flex items-center justify-center shrink-0 text-[10px] font-bold">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="bg-white flex-1 p-6 sm:p-8">
                {/* Stepper */}
                <div className="max-w-2xl mx-auto mb-8">
                  <div style={{ display: "flex", alignItems: "center" }}>
                    {[1, 2, 3].map((s, i) => (
                      <div key={`step-wrapper-${s}`} style={{ display: "flex", alignItems: "center", flex: i < 2 ? 1 : "auto" }}>
                        <div
                          key={`step-${s}`}
                          style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}
                          className={step === s ? "step-bounce" : ""}
                        >
                          <div style={{
                            width: 42, height: 42, borderRadius: "50%",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontWeight: 800, fontSize: "0.95rem", transition: "all 0.3s",
                            background: step >= s ? "linear-gradient(135deg, #22c55e, #16a34a)" : "#e2e8f0",
                            color: step >= s ? "#fff" : "#94a3b8",
                            boxShadow: step >= s ? "0 4px 12px rgba(34,197,94,0.35)" : "none",
                          }}>
                            {s}
                          </div>
                          <span style={{ fontSize: "0.72rem", fontWeight: 600, color: step >= s ? "#16a34a" : "#94a3b8", transition: "color 0.3s", whiteSpace: "nowrap" }}>
                            {stepLabels[i]}
                          </span>
                        </div>
                        {i < 2 && (
                          <div key={`conn-${i}`} className="step-connector" style={{ background: step > s ? "linear-gradient(90deg, #22c55e, #86efac)" : "#e2e8f0" }} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="form-card">
                  {/* Étape 1 */}
                  {step == 1 && (
                    <form key="form-step1" onSubmit={handleStep1} className="space-y-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><User className="h-4 w-4 text-gray-400" /></div>
                            <input type="text" value={nom} onChange={(e) => setNom(e.target.value)} onFocus={() => setActive("nom")} onBlur={() => setActive("")} className={inputClass("nom")} placeholder="Ex: COULIBALY" required />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Prénom</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><User className="h-4 w-4 text-gray-400" /></div>
                            <input type="text" value={prenom} onChange={(e) => setPrenom(e.target.value)} onFocus={() => setActive("prenom")} onBlur={() => setActive("")} className={inputClass("prenom")} placeholder="Ex: Moussa" required />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Mail className="h-4 w-4 text-gray-400" /></div>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} onFocus={() => setActive("email")} onBlur={() => setActive("")} className={inputClass("email")} placeholder="Ex: moussa@email.com" required />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Téléphone <span className="text-red-400 text-xs">(sans 223)</span></label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Phone className="h-4 w-4 text-gray-400" /></div>
                            <input type="text" value={telephone} onChange={(e) => setTelephone(e.target.value)} onFocus={() => setActive("tel")} onBlur={() => setActive("")} className={inputClass("tel")} placeholder="Ex: 70000000" required />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Genre</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><PersonStanding className="h-4 w-4 text-gray-400" /></div>
                            <select value={genre} onChange={(e) => setGenre(e.target.value)} onFocus={() => setActive("genre")} onBlur={() => setActive("")} className={inputClass("genre")} required>
                              <option value="">Sélectionner</option>
                              <option value="M">Masculin</option>
                              <option value="F">Féminin</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Date de naissance</label>
                          <div className="relative">
                            <input type="date" value={date_naissance} onChange={(e) => setDatenaissance(e.target.value)} onFocus={() => setActive("ddn")} onBlur={() => setActive("")} className={inputClass("ddn")} required />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Mot de passe</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Lock className="h-4 w-4 text-gray-400" /></div>
                            <input type={eyes1 ? "text" : "password"} value={mot_de_passe1} onChange={(e) => setMdp1(e.target.value)} onFocus={() => setActive("pwd1")} onBlur={() => setActive("")} className={`block w-full pl-10 pr-10 py-2.5 border rounded-md text-sm outline-none transition ${active === "pwd1" ? "border-green-500 ring-1 ring-green-500 bg-white" : "border-gray-300 bg-white"}`} placeholder="Mot de passe" required />
                            <button type="button" onClick={() => setEyes1(!eyes1)} className="absolute inset-y-0 right-2 flex items-center cursor-pointer text-gray-400 hover:text-gray-600">
                              {eyes1 ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirmer mot de passe</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Lock className="h-4 w-4 text-gray-400" /></div>
                            <input type={eyes2 ? "text" : "password"} value={mot_de_passe2} onChange={(e) => setMdp2(e.target.value)} onFocus={() => setActive("pwd2")} onBlur={() => setActive("")} className={`block w-full pl-10 pr-10 py-2.5 border rounded-md text-sm outline-none transition ${active === "pwd2" ? "border-green-500 ring-1 ring-green-500 bg-white" : "border-gray-300 bg-white"}`} placeholder="Confirmer mot de passe" required />
                            <button type="button" onClick={() => setEyes2(!eyes2)} className="absolute inset-y-0 right-2 flex items-center cursor-pointer text-gray-400 hover:text-gray-600">
                              {eyes2 ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* {passwordError && <p className="error-text">{passwordError}</p>} */}

                      {/* {ageError && (
                        <div className="flex items-start gap-3 px-4 py-3 bg-red-50 border border-red-200 border-l-4 border-l-red-500 rounded-xl">
                          <svg className="w-[18px] h-[18px] mt-0.5 shrink-0 text-red-500" viewBox="0 0 20 20" fill="none">
                            <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5"/>
                            <path d="M10 6v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                            <circle cx="10" cy="14.5" r="0.75" fill="currentColor"/>
                          </svg>
                          <div>
                            <p className="text-sm font-medium text-red-700 mb-0.5">Âge insuffisant</p>
                            <p className="text-sm text-red-600 leading-relaxed">Vous devez avoir au moins 15 ans pour effectuer une demande de CNI.</p>
                          </div>
                        </div>
                      )} */}

                      <div className="flex justify-end mt-7">
                        <button type="submit" className="btn-primary" disabled={step1Mutation.isPending}>
                          {step1Mutation.isPending ? "Chargement..." : "Continuer"}
                          <ArrowRightCircle size={18} />
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Étape 2 */}
                  {step == 2 && (
                    <form key="form-step2" onSubmit={handlestep2} className="space-y-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Lieux de naissance</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><MapPin className="h-4 w-4 text-gray-400" /></div>
                            <input type="text" value={lieux_naissance} onChange={(e) => setlieux_naissance(e.target.value)} onFocus={() => setActive("lieux_naissance")} onBlur={() => setActive("")} className={inputClass("lieux_naissance")} placeholder="Ex: Commune I" required />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom du père</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><User className="h-4 w-4 text-gray-400" /></div>
                            <input type="text" value={prenom_pere} onChange={(e) => setPrenom_pere(e.target.value)} onFocus={() => setActive("prenom_pere")} onBlur={() => setActive("")} className={inputClass("prenom_pere")} placeholder="Ex: Zerbo" required />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom de la mère</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><User className="h-4 w-4 text-gray-400" /></div>
                            <input type="text" value={prenom_mere} onChange={(e) => setPrenom_mere(e.target.value)} onFocus={() => setActive("prenom_mere")} onBlur={() => setActive("")} className={inputClass("prenom_mere")} placeholder="Ex: Zoure" required />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Numéro acte de naissance</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Info className="h-4 w-4 text-gray-400" /></div>
                            <input type="text" value={numero_acte} onChange={(e) => setNumero_acte(e.target.value)} onFocus={() => setActive("numero_acte")} onBlur={() => setActive("")} className={inputClass("numero_acte")} placeholder="Ex: N 863 du 02 septembre 1998" required />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Commune acte de naissance</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Info className="h-4 w-4 text-gray-400" /></div>
                            <input value={commune_acte} onChange={(e) => setCommune_acte(e.target.value)} onFocus={() => setActive("commune_acte")} onBlur={() => setActive("")} className={inputClass("commune_acte")} placeholder="Ex: Commune I" required />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Numéro certificat de nationalité</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Info className="h-4 w-4 text-gray-400" /></div>
                            <input type="text" value={numero_certificat} onChange={(e) => setNumero_certificat(e.target.value)} onFocus={() => setActive("numero_certificat")} onBlur={() => setActive("")} className={inputClass("numero_certificat")} placeholder="Ex: 020/2022" required />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Profession</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Info className="h-4 w-4 text-gray-400" /></div>
                            <input type="text" value={profession} onChange={(e) => setProfession(e.target.value)} onFocus={() => setActive("profession")} onBlur={() => setActive("")} className={inputClass("profession")} placeholder="Ex: Etudiant" required />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Adresse de résidence</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Info className="h-4 w-4 text-gray-400" /></div>
                            <input type="text" value={adres_residence} onChange={(e) => SetAdres_residence(e.target.value)} onFocus={() => setActive("adres_residence")} onBlur={() => setActive("")} className={inputClass("adres_residence")} placeholder="Ex: Ouaga karpala" required />
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between mt-7">
                        <button type="button" onClick={() => setStep((prev) => prev - 1)} className="btn-secondary">
                          <ArrowLeftCircle size={18} /> Revenir en arrière
                        </button>
                        <button type="submit" className="btn-primary" disabled={step2Mutation.isPending}>
                          {step2Mutation.isPending ? "Chargement..." : "Continuer"}
                          <ArrowRightCircle size={18} />
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Étape 3 */}
                  {step == 3 && (
                    <form key="form-step3" onSubmit={handleStep3} className="space-y-5">
                      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg, #dcfce7, #bbf7d0)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem", fontSize: "1.8rem" }}>
                          <Phone className="h-8 w-8 text-[#14B53A]" />
                        </div>
                        <h3 style={{ fontWeight: 700, fontSize: "1.1rem", color: "#0f172a", marginBottom: 6 }}>Vérification par code</h3>
                        <p style={{ color: "#64748b", fontSize: "0.88rem", lineHeight: 1.5 }}>
                          Un code à 6 chiffres a été envoyé à votre numéro de téléphone.<br />Veuillez le saisir ci-dessous.
                        </p>
                      </div>

                      <div style={{ display: "flex", gap: "0.6rem", justifyContent: "center", marginBottom: "2rem" }}>
                        {Array.from({ length: 6 }).map((_, idx) => (
                          <input
                            key={idx}
                            id={`otp-${idx}`}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={otp[idx] || ""}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\D/, "");
                              const otpArr = otp.split("");
                              otpArr[idx] = val;
                              setOtp(otpArr.join(""));
                              if (val && idx < 5) document.getElementById(`otp-${idx + 1}`)?.focus();
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Backspace" && !otp[idx] && idx > 0) document.getElementById(`otp-${idx - 1}`)?.focus();
                            }}
                            onFocus={() => setActive(`otp-${idx}`)}
                            onBlur={() => setActive("")}
                            style={{
                              width: 52, height: 60, textAlign: "center",
                              fontSize: "1.4rem", fontWeight: 700,
                              border: active === `otp-${idx}` ? "2px solid #22c55e" : "2px solid #e2e8f0",
                              borderRadius: "0.75rem", outline: "none",
                              background: active === `otp-${idx}` ? "#f0fdf4" : "#f8fafc",
                              color: "#0f172a",
                              boxShadow: active === `otp-${idx}` ? "0 0 0 3px rgba(34,197,94,0.15)" : "none",
                              transition: "all 0.2s",
                            }}
                          />
                        ))}
                      </div>

                      <div className="flex flex-row gap-3 justify-center items-center">
                        
                        <p> le code expirera dans  <span className={`font-bold ml-2 ${timeLeft <= 60 ? 'text-red-500 animate-pulse' : ''}  `}> {formatTime(timeLeft)} </span>  </p>

                        {timeLeft == 0 && (
                          <button className="bg-yellow-100 p-2 border border-yellow-200 rounded-xl cursor-pointer text-sm font-bold text-yellow-600 hover:animate-pulse" 
                           onClick={()=>handleSendOtp()}
                          >
                            Renvoyer OTP
                          </button>
                        )}
                      </div>
                      <div className="flex justify-between">
                        <button type="button" onClick={() => setStep((prev) => prev - 1)} className="btn-secondary">
                          <ArrowLeftCircle size={18} /> Revenir en arrière
                        </button>
                        <button type="submit" className="btn-primary" disabled={otp.length < 6 || step3Mutation.isPending} style={{ opacity: otp.length < 6 ? 0.5 : 1, cursor: otp.length < 6 ? "not-allowed" : "pointer" }}>
                          {step3Mutation.isPending ? "Chargement..." : "Valider"}
                          <Check size={18} />
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default Inscription;
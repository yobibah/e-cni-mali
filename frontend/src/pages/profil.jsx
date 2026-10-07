import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Footer } from "../components/ui/footer";
import { Header } from "../components/ui/header";
import HandleProfile from "../api/demandeur/profil";
import GetDemande from "../api/demandeur/getDemande";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Bell,
  Edit3,
  Camera,
  Lock,
  Eye,
  EyeOff,
  Save,
  FileText,
  ChevronRight,
  Clock,
  CheckCircle,
  AlertCircle,
  X,
  Download,
  Trash2,
  CreditCard,
  Wallet,
  Calendar as CalendarIcon,
} from "lucide-react";
import { Loader2 } from "lucide-react";
import updateProfil from "../api/demandeur/updateProfil";
import AnnulerDemande from "../api/demandeur/annulerDemande";
import TelechargerRecipisse from "../api/demandeur/telechargerRecipisse";
import PayerDemande from "../api/demandeur/payerDemande";
import { Link } from "react-router-dom";
import UpdatePassword from "../api/auth/updatePassword";
import initPayment from "../api/payement/init";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const Profile = () => {
  const { data: profileData, isLoading: profileLoading, error: profileError, refetch: refetchProfile } = useQuery({
    queryKey: ["Getprofil"],
    queryFn: HandleProfile,
  });

  const {
    data: demandesData,
    isLoading: demandesLoading,
    refetch: refetchDemandes,
  } = useQuery({
    queryKey: ["fetchDemande"],
    queryFn: GetDemande,
  });

  const [activeTab, setActiveTab] = useState("infos");
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedDemande, setSelectedDemande] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isPaiementModalOpen, setIsPaiementModalOpen] = useState(false);
  const [pw1, setPw1] = useState("");
  const [pw2, setPw2] = useState("");
  const [ancien, setAncien] = useState("");

  // États pour les champs modifiables
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");
  const [adresse, setAdresse] = useState("");

  // Initialiser les états quand les données sont chargées
  useEffect(() => {
    // if (profileData) {
      setNom(profileData?.nom || "");
      setPrenom(profileData?.prenom || "");
      setEmail(profileData?.email || "");
      const adresseValue = profileData?.adresse;
      if (typeof adresseValue === "object" && adresseValue !== null) {
        setAdresse(
          adresseValue.adres_residence || JSON.stringify(adresseValue)
        );
      } else {
        setAdresse(adresseValue || "");
      }
    // }
  }, [profileData]);

  const initials = (nom?.[0] || "") + (prenom?.[0] || "");

  const UpdateMutation = useMutation({
    mutationKey: ["updateProfile"],
    mutationFn: (params) => updateProfil(params),
    onSuccess: () => {
      toast.success("Mise à jour du profil", {
        description: "Votre profil a été mis à jour avec succès",
        duration: 4000,
      });
      setIsEditing(false);
      refetchProfile();
    },
    onError: (error) => {
      toast.error("Erreur de mise à jour", {
        description:
          error.message || "Le traitement de votre demande n’a pas pu aboutir. Veuillez réessayer ultérieurement. lors de la modification",
        duration: 4000,
      });
    },
  });

  // Mutation pour annuler la demande
  const annulerMutation = useMutation({
    mutationFn: (demandeId) => AnnulerDemande({ demande_id: demandeId }),
    onSuccess: () => {
      refetchDemandes();
      setIsModalOpen(false);
      setIsConfirmModalOpen(false);
      setSelectedDemande(null);
      toast.success("Demande annulée avec succès", {
        description: "Votre demande a été annulée.",
        duration: 4000,
      });
    },
    onError: (error) => {
      console.error("Erreur lors de l'annulation:", error.message);
      toast.error("Erreur lors de l'annulation", {
        description: "Le traitement de votre demande n’a pas pu aboutir. Veuillez réessayer ultérieurement.. Veuillez réessayer.",
        duration: 4000,
      });
    },
  });

  // Mutation pour télécharger le récépissé
  const telechargerMutation = useMutation({
    mutationFn: (demandeId) => TelechargerRecipisse({ demande_id: demandeId }),
    onSuccess: async (response) => {
      // Vérifier si la réponse est OK
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      // Récupérer le blob depuis la réponse
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `recipisse_demande_${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Téléchargement démarré", {
        description: "Le récépissé est en cours de téléchargement.",
        duration: 3000,
      });
    },
    onError: (error) => {
      console.error("Erreur lors du téléchargement:", error.message);
      toast.error("Erreur de téléchargement", {
        description: "Impossible de télécharger le récépissé. Veuillez réessayer.",
        duration: 4000,
      });
    },
  });

  const queryClient = useQueryClient();
  // Mutation pour payer la demande
  const payerMutation = useMutation({
    mutationFn: (demandeId) => initPayment({ demande_id: demandeId }),
    onSuccess: (response) => {
      queryClient.invalidateQueries(["fetchDemande"]);
      setIsPaiementModalOpen(false);
      setSelectedDemande(null);

      toast.info("Paiement initié !", {
        description: "Vous allez être redirigé vers la page de paiement.",
        duration: 5000,
      });

      if (response?.data?.url) {
        window.open(response.data.url, "_blank");
      }
    },
    onError: (error) => {
      console.error("Erreur lors du paiement:", error.message);
      toast.error("Erreur lors du paiement", {
        description:
          error.response?.data?.message ||
          "Le traitement de votre demande n’a pas pu aboutir. Veuillez réessayer ultérieurement.. Veuillez réessayer.",
        duration: 4000,
      });
    },
  });

  const PasswordMutataion = useMutation({
    mutationFn: ({ ancienMdp, nouveauMdp }) =>
      UpdatePassword({ ancienMdp, nouveauMdp }),

    onSuccess: () => {
      setAncien("");
      setPw1("");
      setPw2("");
      toast.success("Mot de passe modifié avec succès !");
    },

    onError: (error) => {
      toast.error(error.message || "Erreur lors de la mise à jour");
    },
  });

  const handleSave = () => {
    if (!nom || !prenom || !adresse || !email) {
      return toast.error("Tous les champs sont requis");
    }
    const params = {
      nom: nom,
      prenom: prenom,
      adresse: adresse,
      email: email,
    };
    UpdateMutation.mutate(params);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Date inconnue";
    try {
      return new Date(dateString).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch (error) {
      return "Date invalide";
    }
  };

  const getStatusLabel = (statut) => {
    const statusMap = {
      EN_ATTENTE: "En attente",
      EN_COURS: "En cours",
      APPROUVEE: "Approuvée",
      REJETEE: "Rejetée",
      TERMINEE: "Terminée",
      CONFIRME: "Confirmé",
      VALIDE: "Validé",
    };
    return statusMap[statut] || statut || "En traitement";
  };

  const getStatusBadgeClass = (statut) => {
    const statusMap = {
      EN_ATTENTE: "bg-amber-100 text-amber-700",
      EN_COURS: "bg-green-100 text-green-700",
      APPROUVEE: "bg-green-100 text-green-700",
      REJETEE: "bg-red-100 text-red-700",
      TERMINEE: "bg-gray-100 text-gray-700",
      CONFIRME: "bg-green-100 text-green-700",
      VALIDE: "bg-green-100 text-green-700",
    };
    return statusMap[statut] || "bg-gray-100 text-gray-600";
  };

  const handleViewDetails = (demande) => {
    setSelectedDemande({
      ...demande,
      paiement_effectue: demande.paiement_effectue || false,
    });
    setIsModalOpen(true);
  };

  const handleAnnulerDemande = () => {
    setIsConfirmModalOpen(true);
  };

  const confirmAnnulation = () => {
    annulerMutation.mutate(selectedDemande.id);
  };

  const handleTelechargerRecipisse = () => {
    telechargerMutation.mutate(selectedDemande.id);
  };

  const handlePayerDemande = () => {
    setIsPaiementModalOpen(true);
  };

  const confirmPaiement = () => {
    payerMutation.mutate(selectedDemande.id);
  };

  const HandleUpdatePass = () => {
    if (pw1 !== pw2) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    if (ancien.length <= 0) {
      toast.error("Le champ doit être rempli");
      return;
    }
    
    if (pw1.length < 8) {
      toast.error("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }

    PasswordMutataion.mutate({
      ancienMdp: ancien,
      nouveauMdp: pw1,
    });
  };

  const getStats = () => {
    if (!demandesData || !Array.isArray(demandesData) || demandesData.length === 0) {
      return { enCours: 0, approuvees: 0, enAttente: 0 };
    }

    const enCours = demandesData.filter(
      (item) => item.statut === "EN_ATTENTE" || item.statut === "EN_COURS"
    ).length;

    const approuvees = demandesData.filter(
      (item) => item.statut === "APPROUVEE" || item.statut === "TERMINEE"
    ).length;

    const enAttente = demandesData.filter(
      (item) => item.statut === "EN_ATTENTE"
    ).length;

    return { enCours, approuvees, enAttente };
  };

  const stats = getStats();

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <img
              src="/oni_loade.svg"
              alt="Loading..."
              className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-32 lg:h-32 mx-auto object-contain rounded-full"
            />
            <p className="text-gray-600 mt-4 text-sm animate-pulse">
              Chargement de votre profil...
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center px-4">
            <img
              src="/oni_404.svg"
              alt="error..."
              className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 mx-auto object-contain animate-pulse"
            />
            <p className="text-gray-600 mt-4 text-sm md:text-base">
              Le traitement de votre demande n’a pas pu aboutir. Veuillez réessayer ultérieurement. lors du chargement des données.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2 bg-[#14B53A] text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Réessayer
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-grid-light from-gray-50 to-gray-100">
        <Header />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8"
          >
            <div className="h-32 bg-gradient-to-r from-[#009639] to-green-700 relative">
              <div className="absolute inset-0 opacity-20">
                <svg
                  className="h-full w-full"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <pattern
                      id="dots"
                      x="0"
                      y="0"
                      width="20"
                      height="20"
                      patternUnits="userSpaceOnUse"
                    >
                      <circle cx="10" cy="10" r="1.5" fill="white" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#dots)" />
                </svg>
              </div>
            </div>

            <div className="px-6 pb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-end -mt-12 space-y-4 sm:space-y-0 sm:space-x-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-white border-4 border-white shadow-lg flex items-center justify-center">
                    <span className="text-3xl font-bold text-[#009639]">
                      {initials.toUpperCase() || <User size={36} />}
                    </span>
                  </div>
                </div>

                <div className="flex-grow">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {nom} {prenom}
                  </h1>
                  <p className="text-gray-500 text-sm">{email || ""}</p>
                </div>

                <div>
                  {isEditing ? (
                    <button
                      onClick={handleSave}
                      disabled={UpdateMutation.isPending}
                      className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium text-white bg-[#009639] hover:bg-green-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {UpdateMutation.isPending ? (
                        <Loader2 size={16} className="mr-2 animate-spin" />
                      ) : (
                        <Save size={16} className="mr-2" />
                      )}
                      {UpdateMutation.isPending
                        ? "Enregistrement..."
                        : "Enregistrer"}
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors shadow-sm"
                    >
                      <Edit3 size={16} className="mr-2" /> Modifier
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
          >
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <div className="bg-amber-100 p-2 rounded-lg">
                  <Clock size={20} className="text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Demandes en cours</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {stats.enCours}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-lg">
                  <CheckCircle size={20} className="text-[#14B53A]" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Demandes approuvées</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {stats.approuvees}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-lg">
                  <AlertCircle size={20} className="text-[#14B53A]" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Demandes en attente</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {stats.enAttente}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px px-6 overflow-x-auto">
                {[
                  { id: "infos", label: "Informations", icon: User },
                  { id: "securite", label: "Sécurité", icon: Shield },
                  { id: "demandes", label: "Mes demandes", icon: FileText },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center py-4 px-4 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                      activeTab === tab.id
                        ? "border-[#009639] text-[#009639]"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <tab.icon size={16} className="mr-2" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {activeTab === "infos" && (
              <motion.div
                variants={itemVariants}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              >
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                    <User size={20} className="mr-2 text-gray-400" /> Identité
                  </h3>
                  <div className="space-y-5">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                        Nom
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={nom}
                          onChange={(e) => setNom(e.target.value)}
                          className="w-full rounded-md border border-gray-300 p-2.5 focus:border-[#009639] focus:outline-none text-sm"
                        />
                      ) : (
                        <p className="text-sm font-bold text-gray-900">{nom}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                        Prénom(s)
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={prenom}
                          onChange={(e) => setPrenom(e.target.value)}
                          className="w-full rounded-md border border-gray-300 p-2.5 focus:border-[#009639] focus:outline-none text-sm"
                        />
                      ) : (
                        <p className="text-sm font-bold text-gray-900">
                          {prenom}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                        Date de naissance
                      </label>
                      <p className="text-sm font-medium text-gray-700 flex items-center">
                        <Calendar size={14} className="mr-2 text-gray-400" />{" "}
                        {profileData?.date_naissance || "—"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                        Sexe
                      </label>
                      <p className="text-sm font-medium text-gray-700">
                        {profileData?.genre || "—"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                    <MapPin size={20} className="mr-2 text-gray-400" /> Contact
                    & Adresse
                  </h3>
                  <div className="space-y-5">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                        Email
                      </label>
                      {isEditing ? (
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full rounded-md border border-gray-300 p-2.5 focus:border-[#009639] focus:outline-none text-sm"
                        />
                      ) : (
                        <p className="text-sm font-medium text-gray-700 flex items-center">
                          <Mail size={14} className="mr-2 text-gray-400" />{" "}
                          {email || "—"}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                        Téléphone
                      </label>
                      <p className="text-sm font-medium text-gray-700 flex items-center">
                        <Phone size={14} className="mr-2 text-gray-400" />{" "}
                        {profileData?.telephone || "—"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                        Adresse
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={adresse}
                          onChange={(e) => setAdresse(e.target.value)}
                          className="w-full rounded-md border border-gray-300 p-2.5 focus:border-[#009639] focus:outline-none text-sm"
                        />
                      ) : (
                        <p className="text-sm font-medium text-gray-700 flex items-center">
                          <MapPin size={14} className="mr-2 text-gray-400" />{" "}
                          {adresse || "—"}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "securite" && (
              <motion.div
                variants={itemVariants}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-w-2xl"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <Shield size={20} className="mr-2 text-gray-400" /> Sécurité
                  du compte
                </h3>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mot de passe actuel
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={ancien}
                        required
                        onChange={(e) => setAncien(e.target.value)}
                        className="w-full rounded-md border border-gray-300 p-2.5 pr-10 focus:border-[#009639] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nouveau mot de passe
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={pw1}
                      required
                      onChange={(e) => setPw1(e.target.value)}
                      className="w-full rounded-md border border-gray-300 p-2.5 focus:border-[#009639] focus:outline-none"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Minimum 8 caractères, avec au moins une majuscule et un
                      chiffre.
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirmer le mot de passe
                    </label>
                    <input
                      type="password"
                      value={pw2}
                      onChange={(e) => setPw2(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full rounded-md border border-gray-300 p-2.5 focus:border-[#009639] focus:outline-none"
                    />
                  </div>
                  <button
                    onClick={HandleUpdatePass}
                    disabled={PasswordMutataion.isPending}
                    className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium text-white bg-[#009639] hover:bg-green-700 transition-colors shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {PasswordMutataion.isPending ? (
                      <Loader2 size={16} className="mr-2 animate-spin" />
                    ) : (
                      <Lock size={16} className="mr-2" />
                    )}
                    Changer le mot de passe
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === "demandes" && (
              <motion.div
                variants={itemVariants}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
              >
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                  <h3 className="text-base font-semibold text-gray-900">
                    Historique de vos demandes
                  </h3>
                  <Link
                    to="/suivre-demande"
                    className="text-sm text-[#009639] hover:text-green-700 font-medium flex items-center gap-1"
                  >
                    Voir toutes <ChevronRight size={14} />
                  </Link>
                </div>
                <div className="divide-y divide-gray-100">
                  {demandesLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2
                        size={24}
                        className="animate-spin text-[#009639]"
                      />
                    </div>
                  ) : demandesData &&
                    Array.isArray(demandesData) &&
                    demandesData.length > 0 ? (
                    demandesData.slice(0, 5).map((d) => (
                      <div
                        key={d.id}
                        className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => handleViewDetails(d)}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="p-2 bg-gray-100 rounded-md">
                            <FileText size={18} className="text-gray-500" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">
                              CNI #{d.id?.slice(0, 8)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {d.type_demande === "NOUVELLE"
                                ? "Première demande"
                                : d.type_demande === "RENOUVELLEMENT"
                                  ? "Renouvellement"
                                  : "Perte / Vol"}
                              {" • "} {formatDate(d.date_creation)}
                            </p>
                            {d.rendezvous && (
                              <p className="text-xs text-gray-400 mt-1 flex items-center">
                                <CalendarIcon size={10} className="mr-1" />
                                RDV: {d.rendezvous.date} à {d.rendezvous.heure}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="flex flex-col items-end">
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(d.statut)}`}
                            >
                              {getStatusLabel(d.statut)}
                            </span>
                            {d.paiement_effectue ? (
                              <span className="text-xs text-[#14B53A] mt-1">
                                Payé
                              </span>
                            ) : (
                              <span className="text-xs text-amber-600 mt-1">
                                Non payé
                              </span>
                            )}
                          </div>
                          <ChevronRight size={16} className="text-gray-400" />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10">
                      <FileText
                        size={48}
                        className="text-gray-300 mx-auto mb-3"
                      />
                      <p className="text-gray-500">
                        Aucune demande pour le moment
                      </p>
                      <Link
                        to="/demande"
                        className="mt-4 inline-flex items-center text-sm text-[#009639] hover:text-green-700 font-medium"
                      >
                        Créer votre première demande
                      </Link>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && selectedDemande && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    Détails de la demande
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    CNI #{selectedDemande.id?.slice(0, 8)}
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 mb-1">
                      Statut de la demande
                    </p>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(selectedDemande.statut)}`}
                    >
                      {getStatusLabel(selectedDemande.statut)}
                    </span>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 mb-1">
                      Statut de paiement
                    </p>
                    <div className="flex items-center gap-2">
                      <CreditCard
                        size={16}
                        className={
                          selectedDemande.paiement_effectue
                            ? "text-[#14B53A]"
                            : "text-red-500"
                        }
                      />
                      <span
                        className={`font-semibold ${selectedDemande.paiement_effectue ? "text-[#14B53A]" : "text-red-500"}`}
                      >
                        {selectedDemande.paiement_effectue
                          ? "Payé"
                          : "Non payé"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-800 border-b border-gray-100 pb-2">
                    Informations générales
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Type de demande</p>
                      <p className="text-sm font-medium text-gray-800">
                        {selectedDemande.type_demande === "NOUVELLE"
                          ? "Première demande"
                          : selectedDemande.type_demande === "RENOUVELLEMENT"
                            ? "Renouvellement"
                            : "Perte / Vol"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Date de création</p>
                      <p className="text-sm font-medium text-gray-800">
                        {formatDate(selectedDemande.date_creation)}
                      </p>
                    </div>
                  </div>
                </div>

                {selectedDemande.rendezvous && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-800 border-b border-gray-100 pb-2">
                      Rendez-vous
                    </h3>
                    <div className="bg-green-50 rounded-xl p-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-[#14B53A]">Centre</p>
                          <p className="text-sm font-medium text-gray-800">
                            {selectedDemande.rendezvous.centre?.nom ||
                              "Non défini"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-[#14B53A]">Date</p>
                          <p className="text-sm font-medium text-gray-800">
                            {formatDate(selectedDemande.rendezvous.date)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-[#14B53A]">Heure</p>
                          <p className="text-sm font-medium text-gray-800">
                            {selectedDemande.rendezvous.heure || "Non défini"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-[#14B53A]">Statut RDV</p>
                          <p className="text-sm font-medium text-gray-800">
                            {selectedDemande.rendezvous.statut || "Confirmé"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {!selectedDemande.paiement_effectue && (
                  <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-semibold text-amber-800">
                          Montant à payer
                        </p>
                        <p className="text-xs text-amber-600">
                          Frais de traitement CNI
                        </p>
                      </div>
                      <p className="text-2xl font-black text-amber-700">
                        {selectedDemande.montant || 2500} FCFA
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex flex-col sm:flex-row gap-3">
                {!selectedDemande.paiement_effectue && (
                  <button
                    onClick={handlePayerDemande}
                    disabled={payerMutation.isPending}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#14B53A] hover:bg-green-700 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Wallet size={18} />
                    {payerMutation.isPending
                      ? "Traitement..."
                      : "Payer maintenant"}
                  </button>
                )}

                {selectedDemande.paiement_effectue && (
                  <button
                    onClick={handleTelechargerRecipisse}
                    disabled={telechargerMutation.isPending}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#14B53A] hover:bg-green-700 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Download size={18} />
                    {telechargerMutation.isPending
                      ? "Téléchargement..."
                      : "Télécharger le récépissé"}
                  </button>
                )}

                {selectedDemande.statut === "EN_ATTENTE" && (
                  <button
                    onClick={handleAnnulerDemande}
                    disabled={annulerMutation.isPending}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 size={18} />
                    {annulerMutation.isPending
                      ? "Annulation..."
                      : "Annuler la demande"}
                  </button>
                )}

                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-200"
                >
                  Fermer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isConfirmModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
            onClick={() => setIsConfirmModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 text-center">
                <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <Trash2 size={32} className="text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Annuler la demande
                </h3>
                <p className="text-gray-600 mb-6">
                  Êtes-vous sûr de vouloir annuler cette demande ? Cette action
                  est irréversible.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setIsConfirmModalOpen(false)}
                    className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50"
                  >
                    Non, garder
                  </button>
                  <button
                    onClick={confirmAnnulation}
                    disabled={annulerMutation.isPending}
                    className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl disabled:opacity-50"
                  >
                    {annulerMutation.isPending
                      ? "Annulation..."
                      : "Oui, annuler"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isPaiementModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
            onClick={() => setIsPaiementModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 text-center">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <Wallet size={32} className="text-[#14B53A]" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Confirmer le paiement
                </h3>
                <p className="text-gray-600 mb-4">
                  Vous allez payer{" "}
                  <span className="font-bold text-[#14B53A]">
                    {selectedDemande?.montant || 2500} FCFA
                  </span>{" "}
                  pour votre demande CNI.
                </p>
                <p className="text-sm text-gray-500 mb-6">
                  Une fois le paiement effectué, vous pourrez télécharger votre
                  récépissé.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setIsPaiementModalOpen(false)}
                    className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={confirmPaiement}
                    disabled={payerMutation.isPending}
                    className="flex-1 px-4 py-2.5 bg-[#14B53A] hover:bg-green-700 text-white font-semibold rounded-xl disabled:opacity-50"
                  >
                    {payerMutation.isPending
                      ? "Traitement..."
                      : "Confirmer le paiement"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </>
  );
};

export default Profile;
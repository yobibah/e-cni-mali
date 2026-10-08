import {
  Clock,
  Plus,
  FileText,
  CheckCircle,
  AlertCircle,
  X,
  Download,
  Trash2,
  CreditCard,
  Wallet,
  Calendar1,
} from "lucide-react";
import { Header } from "../components/ui/header";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Footer } from "../components/ui/footer";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import GetDemande from "../api/demandeur/getDemande";
import AnnulerDemande from "../api/demandeur/annulerDemande";
import TelechargerRecipisse from "../api/demandeur/telechargerRecipisse";
import PayerDemande from "../api/demandeur/payerDemande";
import initPayment from "../api/payement/init";
import HandleProfile from "../api/demandeur/profil";
// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const SuivreDemande = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["fetchDemande"],
    queryFn: GetDemande,
  });

  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [selectedDemande, setSelectedDemande] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isPaiementModalOpen, setIsPaiementModalOpen] = useState(false);

  const {
    data: profileData,
    isLoading: profileLoading,
    error: profileError,
    refetch: refetchProfile,
  } = useQuery({
    queryKey: ["Getprofil"],
    queryFn: HandleProfile,
  });

  useEffect(() => {
    // if (profileData) {
    setNom(profileData?.nom || "");
    setPrenom(profileData?.prenom || "");

    // }
  }, [profileData]);

  // Mutation pour annuler la demande
  const annulerMutation = useMutation({
    mutationFn: (demandeId) => AnnulerDemande({ demande_id: demandeId }),
    onSuccess: () => {
      queryClient.invalidateQueries(["fetchDemande"]);
      setIsModalOpen(false);
      setIsConfirmModalOpen(false);
      setSelectedDemande(null);
      localStorage.clear();
      toast.success("Demande annulée avec succès", {
        description: "Votre demande a été annulée.",
        duration: 4000,
      });
    },
    onError: (error) => {
      console.error("Erreur lors de l'annulation:", error.message);
      toast.error("Erreur lors de l'annulation", {
        description:
          "Le traitement de votre demande n’a pas pu aboutir. Veuillez réessayer ultérieurement.. Veuillez réessayer.",
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
        description:
          "Impossible de télécharger le récépissé. Veuillez réessayer.",
        duration: 4000,
      });
    },
  });

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

      // console.log(response)
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

  const getStats = () => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return [
        {
          title: "Demandes en rejetee",
          count: 0,
          icon: Clock,
          color: "bg-amber-100",
          textColor: "text-red-600",
        },
        {
          title: "Demandes approuvées",
          count: 0,
          icon: CheckCircle,
          color: "bg-green-100",
          textColor: "text-[#14B53A]",
        },
        {
          title: "Demandes en attente",
          count: 0,
          icon: AlertCircle,
          color: "bg-green-100",
          textColor: "text-[#14B53A]",
        },
      ];
    }

    const enCours = data.filter((item) => item.statut === "REJETEE").length;

    const approuvees = data.filter(
      (item) => item.statut === "APPROUVEE" || item.statut === "TERMINEE",
    ).length;

    const enAttente = data.filter(
      (item) => item.statut === "EN_ATTENTE",
    ).length;

    return [
      {
        title: "Demandes en rejetée",
        count: enCours,
        icon: Clock,
        color: "bg-red-100",
        textColor: "text-red-600",
      },
      {
        title: "Demandes approuvées",
        count: approuvees,
        icon: CheckCircle,
        color: "bg-green-100",
        textColor: "text-[#14B53A]",
      },
      {
        title: "Demandes en attente",
        count: enAttente,
        icon: AlertCircle,
        color: "bg-amber-100",
        textColor: "text-amber-600",
      },
    ];
  };

  const stats = getStats();

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-grid-light from-gray-50 to-gray-100 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <img
              src="/oni_loade.svg"
              alt="Loading..."
              className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-32 lg:h-32 mx-auto object-contain rounded-full"
            />
            <p className="text-gray-600 mt-4 text-sm animate-pulse">
              Chargement de vos demandes...
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-grid-light from-gray-50 to-gray-100 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center px-4">
            <img
              src="/oni_404.svg"
              alt="error..."
              className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 mx-auto object-contain animate-pulse"
            />
            <p className="text-gray-600 mt-4 text-sm md:text-base">
              Le traitement de votre demande n’a pas pu aboutir. Veuillez
              réessayer ultérieurement. lors du chargement des données.
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="container mx-auto px-4 py-8"
        >
          <div className="mb-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-300">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 sm:h-10 sm:w-10 md:h-14 md:w-14 flex-shrink-0 flex items-center justify-center rounded-full bg-[#14B53A] text-white font-bold lg:text-lg shadow-sm">
                    <p>
                      {nom?.trim()?.[0]?.toUpperCase()}
                      {prenom?.trim()?.[0]?.toUpperCase()}
                    </p>
                  </div>

                  <div>
                    <h2 className=" sm:text-xl md:text-xl lg:text-2xl  font-bold text-gray-800">
                      Bonjour,{" "}
                      <span className="text-[#14B53A]">
                        {nom || "Citoyen"} {prenom || ""}
                      </span>
                    </h2>

                    <p className="sm:text-sm md:text-md lg:text-lg text-gray-600 mt-1">
                      Bienvenue sur votre espace citoyen. Suivez vos demandes de
                      CNI en temps réel.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => navigate("/demande")}
                  className="flex sm:text-sm md:text-md lg:text-lg items-center justify-center gap-2 rounded-xl bg-[#14B53A] px-5 py-2.5 font-semibold text-white shadow-md transition-all duration-200 hover:bg-green-700 hover:shadow-lg active:scale-95"
                >
                  <Plus  />
                  <span>Nouvelle demande</span>
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300 hover:translate-y-[-2px]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`${stat.color} p-3 rounded-xl`}>
                      <stat.icon className={`${stat.textColor} w-6 h-6`} />
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm font-medium">
                        {stat.title}
                      </p>
                      <p className="text-3xl font-bold text-gray-800 mt-1">
                        {stat.count}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-lg font-semibold text-gray-800">
                Vos demandes récentes
              </h3>
            </div>

            <div className="divide-y divide-gray-100">
              {data && Array.isArray(data) && data.length > 0 ? (
                data.map((item, index) => (
                  <motion.div
                    key={item.id || index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="px-6 py-4 hover:bg-gray-50 transition-colors duration-200"
                  >
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                      <div>
                        <p className="font-medium text-gray-800">
                          Demande CNI #{item.id?.slice(0, 8) || index + 1}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Déposée le {formatDate(item.date_creation)}
                        </p>
                        {item.type_demande && (
                          <p className="text-xs text-gray-400 mt-1">
                            Type :{" "}
                            {item.type_demande === "NOUVELLE"
                              ? "Première demande"
                              : item.type_demande === "RENOUVELLEMENT"
                                ? "Renouvellement"
                                : "Perte / Vol"}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(
                            item.statut,
                          )}`}
                        >
                          {getStatusLabel(item.statut)}
                        </span>
                        <button
                          onClick={() => handleViewDetails(item)}
                          className="text-[#14B53A] hover:text-green-700 text-sm font-medium transition-colors hover:underline"
                        >
                          Voir détails →
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Aucune demande trouvée</p>
                  <button
                    onClick={() => navigate("/demande")}
                    className="mt-4 text-[#14B53A] hover:text-green-700 font-medium transition-colors hover:underline"
                  >
                    Créer votre première demande
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Modal Détails de la demande */}
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
                    #{selectedDemande.id?.slice(0, 8)}
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
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(
                        selectedDemande.statut,
                      )}`}
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
                        className={`font-semibold ${
                          selectedDemande.paiement_effectue
                            ? "text-[#14B53A]"
                            : "text-red-500"
                        }`}
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

                {!selectedDemande.isRdv && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-800 border-b border-gray-100 pb-2">
                      Rendez-vous
                    </h3>
                    <button className="border border-green-50 p-2 rounded-md flex items-center justify-center gap-1.5 text-[#14B53A] bg-green-100 cursor-pointer animate-pulse antialiased">
                      <Calendar1 />
                      <p>Cliquez ici pour ajouter un rendezvous a la demande</p>
                    </button>
                  </div>
                )}

                {/* Montant à payer si non payé */}
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
                {/* Bouton Payer - visible seulement si non payé */}
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

                {/* Bouton Télécharger - visible seulement si payé */}
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

                {/* Bouton Annuler - visible seulement si en attente */}
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

      {/* Modal de confirmation d'annulation */}
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
                  est irréversible et vous perdrez toutes les informations
                  saisies.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setIsConfirmModalOpen(false)}
                    className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-200"
                  >
                    Non, garder
                  </button>
                  <button
                    onClick={confirmAnnulation}
                    disabled={annulerMutation.isPending}
                    className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* Modal de confirmation de paiement */}
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
                  pour votre demande CNI
                </p>
                <p className="text-sm text-gray-500 mb-6">
                  Une fois le paiement effectué, vous pourrez télécharger votre
                  récépissé.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setIsPaiementModalOpen(false)}
                    className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-200"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={confirmPaiement}
                    disabled={payerMutation.isPending}
                    className="flex-1 px-4 py-2.5 bg-[#14B53A] hover:bg-green-700 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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

export default SuivreDemande;

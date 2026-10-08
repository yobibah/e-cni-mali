import { useEffect, useState } from "react";
import { Header } from "../components/ui/header";
import { useMutation, useQuery } from "@tanstack/react-query";
import HandleProfile from "../api/demandeur/profil";
import { motion } from "framer-motion";
import InitDemande from "../api/demandeur/initDemande";
import UploadDocs from "../api/demandeur/uploadDocs";
import GetCentres from "../api/demandeur/getCentres";
import GetCreneaux from "../api/demandeur/getCreneaux";
import PrendreRdv from "../api/demandeur/prendreRdv";
import GetRecap from "../api/demandeur/getRecap";
import { Clock9Icon, HandCoins, X } from "lucide-react";
import { Footer } from "../components/ui/footer";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import initPayment from "../api/payement/init";

const LABELS_DOCUMENTS = {
  acte_naissance: "Acte de naissance",
  certificat_nationalite: "Certificat de nationalité",
  photo_identite: "Photo d'identité",
  ancienne_cnib: "Ancienne CNIB",
  declaration_perte: "Déclaration de perte / vol",
};

const DOCUMENTS_REQUIS = {
  NOUVELLE: ["acte_naissance", "certificat_nationalite", "photo_identite"],
  RENOUVELLEMENT: ["ancienne_cnib", "photo_identite"],
  PERTE: ["declaration_perte", "certificat_nationalite", "photo_identite"],
};

export default function Demande() {
  const { isLoading, isError, data, error } = useQuery({
    queryKey: ["fetchUser"],
    queryFn: HandleProfile,
  });

  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [date_naissance, setDateNaissance] = useState("");
  const [lieux_naissance, setLieuxNaissance] = useState("");
  const [genre, setGenre] = useState("");
  const [tel, setTel] = useState("");

  const [step, setStep] = useState(
    () => Number(localStorage.getItem("step")) || 1,
  );
  const [typeDemande, setTypeDemande] = useState(
    () => localStorage.getItem("type_demande") || "NOUVELLE",
  );
  const [demandeId, setDemandeId] = useState(
    () => localStorage.getItem("demande_id") || null,
  );
  const [files, setFiles] = useState({});

  const navigation = useNavigate();
  const goToStep = (n) => {
    localStorage.setItem("step", n);
    setStep(n);
  };

  useEffect(() => {
    if (data) {
      setNom(data.nom);
      setPrenom(data.prenom);
      setDateNaissance(data.date_naissance);
      setLieuxNaissance(data.lieux_naissance);
      setGenre(data.genre);
      setTel(data.telephone);
      localStorage.setItem("nom", data.nom);
      localStorage.setItem("prenom", data.prenom);
    }
  }, [data]);
  const payerMutation = useMutation({
    mutationFn: (demandeId) => initPayment({ demande_id: demandeId }),
    onSuccess: (response) => {
      // setIsPaiementModalOpen(false);
      // setSelectedDemande(null);

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

  // Mutation étape 2
  const mutationStep2 = useMutation({
    mutationFn: (type) => InitDemande({ type }),
    onSuccess: (response) => {
      const id = response.data?.id || response.id_demande;
      localStorage.setItem("demande_id", id);
      setDemandeId(id);
      // ajouter le type de demande en localstorage ...
      toast.success("Type de demande enregistré avec succès !");
      goToStep(3);
    },
    onError: (error) => {
      toast.error(
        `Erreur : ${error.message || "Le traitement de votre demande n’a pas pu aboutir. Veuillez réessayer ultérieurement."}`,
      );
    },
  });

  const handleStep2 = () => {
    if (!typeDemande) {
      toast.warning("Veuillez sélectionner un type de demande.");
      return;
    }
    // mettre en localstorage
    localStorage.setItem("type_demande", typeDemande);
    mutationStep2.mutate(typeDemande);
  };

  // Mutation étape 3
  const mutationStep3 = useMutation({
    mutationFn: () => {
      const formData = new FormData();
      formData.append("demande_id", demandeId);
      DOCUMENTS_REQUIS[typeDemande].forEach((field) => {
        if (files[field]) {
          formData.append(field, files[field]);
        }
      });
      return UploadDocs(formData);
    },
    onSuccess: () => {
      toast.success("Documents uploadés avec succès !");
      goToStep(4);
    },
    onError: (error) => {
      localStorage.clear();
      navigation("/demande");
      toast.error(
        `Erreur upload : ${error.message || "Le traitement de votre demande n’a pas pu aboutir. Veuillez réessayer ultérieurement."}`,
      );
    },
  });

  const handleStep3 = () => {
    if (!demandeId) {
      toast.error("Aucune demande en cours. Veuillez recommencer.");
      return;
    }
    const required = DOCUMENTS_REQUIS[typeDemande];
    const missing = required.filter((k) => !files[k]);
    if (missing.length > 0) {
      toast.warning(
        `Documents manquants : ${missing.map((m) => LABELS_DOCUMENTS[m]).join(", ")}`,
      );
      return;
    }
    mutationStep3.mutate();
  };

  const [centreId, setCentreId] = useState(null);
  const [creneauId, setCreneauId] = useState(null);
  const [creneaux, setCreneaux] = useState([]);

  const { data: dataCentres } = useQuery({
    queryKey: ["centres"],
    queryFn: GetCentres,
    enabled: step === 4,
  });

  const {
    data: recap,
    isLoading: recapLoading,
    isError: recapError,
  } = useQuery({
    queryKey: ["recap", demandeId],
    queryFn: () => GetRecap(demandeId),
    enabled: step === 5 && !!demandeId,
  });

  const mutationCreneaux = useMutation({
    mutationFn: (centre_id) =>
      GetCreneaux({ centre_id, demande_id: demandeId }),
    onSuccess: (data) => {
      setCreneaux(data.creneaux || []);
      if ((data.creneaux || []).length === 0) {
        toast.info("Aucun créneau disponible pour ce centre.");
      } else {
        toast.success("Créneaux chargés avec succès !");
      }
    },
    onError: (error) => {
      toast.error(
        `Erreur créneaux : ${error.message || "Le traitement de votre demande n’a pas pu aboutir. Veuillez réessayer ultérieurement."}`,
      );
    },
  });

  // Mutation RDV
  const mutationRdv = useMutation({
    mutationFn: () =>
      PrendreRdv({ demande_id: demandeId, creneau_id: creneauId }),
    onSuccess: () => {
      toast.success("Rendez-vous confirmé ! Passez au récapitulatif.");
      goToStep(5);
    },
    onError: (error) => {
      toast.error(
        `Erreur RDV : ${error.message || "Le traitement de votre demande n’a pas pu aboutir. Veuillez réessayer ultérieurement."}`,
      );
    },
  });

  const handleStep4 = () => {
    if (!demandeId) {
      toast.error("Aucune demande en cours. Veuillez recommencer.");
      return;
    }
    if (!centreId) {
      toast.warning("Veuillez sélectionner un centre de traitement.");
      return;
    }
    if (!creneauId) {
      toast.warning("Veuillez choisir un créneau disponible.");
      return;
    }
    mutationRdv.mutate();
  };

  const clearDemande = () => {
    localStorage.removeItem("step");
    localStorage.removeItem("demande_id");
    localStorage.removeItem("type_demande");
    localStorage.removeItem("nom");
    localStorage.removeItem("prenom");
  };

  const handlePaiement = () => {
    // toast.success("Redirection vers le paiement...");
    // clearDemande();
    if (!demandeId) {
      toast.error(
        "La reference de paiement est indisponible. Veuillez ressayer dans la page suivre mes demandes.",
      );
    }
    payerMutation.mutate(demandeId);
  };

  const handlePaiementDiffere = () => {
    toast.info(
      "Votre demande est enregistrée. Vous pouvez payer plus tard depuis votre espace.",
    );
    clearDemande();
    navigation("/suivre-demande");
  };

  if (isLoading) {
    return (
      <>
        <div className="min-h-screen bg-grid-light from-gray-50 to-gray-100 flex flex-col">
          <Header />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <img
                src="/oni_loade.svg"
                alt="Loading..."
                className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-32 lg:h-32 mx-auto object-contain rounded-full"
              />
              <p className="text-gray-600 mt-4  text-sm animate-pulse">
                Chargement de vos demandes...
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
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
                Pas de données trouvées...
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }
  const totalSteps = 5;

  // const [demandeId,setDemandeId] = useState(null);

  // const  handlePaye = () =>{
  //   payerMutation.mutate(demandeId);
  // };

  return (
    <>
      <div className="flex flex-col min-h-screen bg-grid-light">
        <Header />

        <div className="flex items-center flex-col py-4 px-4 text-center">
          <h1 className="text-2xl md:text-3xl font-black">Demande de la Carte National Malien</h1>
          <p className="text-gray-500 text-sm md:text-base">
            Veuillez remplir les informations ci-dessous pour votre demande.
          </p>
        </div>

        <div className=" flex flex-col flex-1">
          <div className="flex items-center justify-center">
            <div className="px-4 md:px-10 py-4 flex flex-row items-center justify-center">
              {[1, 2, 3, 4, 5].map((s, i) => (
                <div key={s} className="flex items-center">
                  <div
                    className={`border-2 rounded-full w-8 h-8 md:w-10 md:h-10 flex items-center justify-center shrink-0 ${
                      step >= s
                        ? "border-green-400 bg-green-50"
                        : "border-gray-300"
                    }`}
                  >
                    <p
                      className={`font-black text-sm md:text-base ${
                        step >= s ? "text-green-500" : "text-gray-400"
                      }`}
                    >
                      {s}
                    </p>
                  </div>
                  {i < totalSteps - 1 && (
                    <div
                      className={`border-b-2 w-8 sm:w-12 md:w-20 lg:w-28 transition-colors duration-300 ${
                        step > s ? "border-green-400" : "border-gray-300"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="px-4 md:px-10 pb-10 ">
            {/* <button 
            onClick={()=>{
                  localStorage.removeItem("step");
    localStorage.removeItem("demande_id");
    localStorage.removeItem("type_demande");
    localStorage.removeItem("nom");
    localStorage.removeItem("prenom");
  
            }}
            className=" p-2 absolute right-10  mt-6 flex justify-center items-center gap-3 cursor-pointer rounded-s  border-b border-s border-t border-gray-200 ">
              <X size={16} className="text-gray-600"/>
              <p className="text-gray-600 text-md ">Annuler</p>
              
            </button> */}

            {/* Étape 1 */}
            {step === 1 && (
              <motion.form
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-md shadow-md p-4 md:p-6"
              >
                <h2 className="py-3 text-xl md:text-2xl font-black">
                  Informations Personnelles
                </h2>
                <div className="border-b border-gray-300 w-full mb-4"></div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex flex-col gap-1">
                    <label htmlFor="nom" className="font-semibold text-sm">
                      Nom
                    </label>
                    <input
                      type="text"
                      id="nom"
                      value={nom}
                      disabled
                      className="border border-gray-400 p-2 rounded-md bg-gray-50 text-sm"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label htmlFor="prenom" className="font-semibold text-sm">
                      Prénom
                    </label>
                    <input
                      type="text"
                      id="prenom"
                      value={prenom}
                      disabled
                      className="border border-gray-400 p-2 rounded-md bg-gray-50 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex flex-col gap-1">
                    <label
                      htmlFor="date_naissance"
                      className="font-semibold text-sm"
                    >
                      Date de naissance
                    </label>
                    <input
                      type="text"
                      id="date_naissance"
                      value={date_naissance}
                      disabled
                      className="border border-gray-400 p-2 rounded-md bg-gray-50 text-sm"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label
                      htmlFor="lieux_naissance"
                      className="font-semibold text-sm"
                    >
                      Lieu de naissance
                    </label>
                    <input
                      type="text"
                      id="lieux_naissance"
                      value={lieux_naissance}
                      disabled
                      className="border border-gray-400 p-2 rounded-md bg-gray-50 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="flex flex-col gap-1">
                    <label htmlFor="genre" className="font-semibold text-sm">
                      Genre
                    </label>
                    <input
                      type="text"
                      id="genre"
                      value={genre}
                      disabled
                      className="border border-gray-400 p-2 rounded-md bg-gray-50 text-sm"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label htmlFor="tel" className="font-semibold text-sm">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      id="tel"
                      value={tel}
                      disabled
                      className="border border-gray-400 p-2 rounded-md bg-gray-50 text-sm"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      toast.success("Informations personnelles confirmées !");
                      setStep((prev) => prev + 1);
                    }}
                    className="bg-[#14B53A] hover:bg-green-500 text-white font-bold rounded-lg px-6 py-2 cursor-pointer text-sm"
                  >
                    Suivant →
                  </button>
                </div>
              </motion.form>
            )}

            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-md shadow-md p-4 md:p-6"
              >
                <h2 className="text-xl md:text-2xl font-black border-b pb-3 mb-4">
                  Type de demande
                </h2>

                <div className="space-y-3">
                  {[
                    {
                      value: "NOUVELLE",
                      label: "Première demande",
                      description: "Je n'ai jamais eu de CNIB auparavant.",
                    },
                    {
                      value: "RENOUVELLEMENT",
                      label: "Renouvellement",
                      description:
                        "Ma carte est expirée ou les informations ont changé.",
                    },
                    {
                      value: "PERTE",
                      label: "Déclaration de perte / vol",
                      description: "J'ai perdu ma carte ou elle a été volée.",
                    },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-start p-4 border rounded-lg cursor-pointer transition-colors ${typeDemande === option.value ? "border-green-500 bg-green-50" : "border-gray-200 hover:bg-gray-50"}`}
                    >
                      <input
                        type="radio"
                        name="typeDemande"
                        value={option.value}
                        checked={typeDemande === option.value}
                        onChange={(e) => setTypeDemande(e.target.value)}
                        className="mt-1 h-4 w-4 accent-[#14B53A]"
                      />
                      <div className="ml-3">
                        <span className="block text-sm font-semibold text-gray-900">
                          {option.label}
                        </span>
                        <span className="block text-sm text-gray-500">
                          {option.description}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>

                <div className="flex justify-between mt-6">
                  <button
                    type="button"
                    onClick={() => setStep((prev) => prev - 1)}
                    className="border border-gray-400 text-gray-600 font-bold rounded-lg px-6 py-2 hover:bg-gray-100 text-sm"
                  >
                    ← Précédent
                  </button>
                  <button
                    type="button"
                    onClick={handleStep2}
                    disabled={mutationStep2.isPending}
                    className="bg-[#14B53A] hover:bg-green-500 text-white font-bold rounded-lg px-6 py-2 text-sm disabled:opacity-50"
                  >
                    {mutationStep2.isPending ? "Envoi..." : "Suivant →"}
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-md shadow-md p-4 md:p-6"
              >
                <h2 className="text-xl md:text-2xl font-black border-b pb-3 mb-4">
                  Documents requis
                </h2>

                <div className="space-y-4">
                  {DOCUMENTS_REQUIS[typeDemande].map((field) => (
                    <div key={field} className="flex flex-col gap-1">
                      <label className="font-semibold text-sm">
                        {LABELS_DOCUMENTS[field]}
                      </label>
                      <div
                        className={`border-2 border-dashed rounded-lg p-4 flex flex-col items-center gap-2 transition-colors ${files[field] ? "border-green-400 bg-green-50" : "border-gray-300 hover:border-gray-400"}`}
                      >
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              setFiles((prev) => ({ ...prev, [field]: file }));
                              toast.info(
                                `"${LABELS_DOCUMENTS[field]}" ajouté.`,
                              );
                            }
                          }}
                          className="hidden"
                          id={field}
                        />
                        <label
                          htmlFor={field}
                          className="cursor-pointer text-center w-full"
                        >
                          {files[field] ? (
                            <span className="text-[#14B53A] font-semibold text-sm">
                              ✓ {files[field].name}
                            </span>
                          ) : (
                            <span className="text-gray-500 text-sm">
                              Cliquez pour choisir un fichier (PDF ou image)
                            </span>
                          )}
                        </label>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between mt-6">
                  <button
                    type="button"
                    onClick={() => setStep((prev) => prev - 1)}
                    className="border border-gray-400 text-gray-600 font-bold rounded-lg px-6 py-2 hover:bg-gray-100 text-sm"
                  >
                    ← Précédent
                  </button>
                  <button
                    type="button"
                    onClick={handleStep3}
                    disabled={mutationStep3.isPending}
                    className="bg-[#14B53A] hover:bg-green-500 text-white font-bold rounded-lg px-6 py-2 text-sm disabled:opacity-50"
                  >
                    {mutationStep3.isPending ? "Envoi..." : "Suivant →"}
                  </button>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-md shadow-md p-4 md:p-6"
              >
                <h2 className="text-xl md:text-2xl font-black border-b pb-3 mb-4">
                  Choisir un centre et un créneau
                </h2>

                <div className="mb-6">
                  <label className="font-semibold text-sm block mb-2">
                    Centre de traitement
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {dataCentres?.centres?.map((centre) => (
                      <label
                        key={centre.id}
                        className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${centreId === centre.id ? "border-green-500 bg-green-50" : "border-gray-200 hover:bg-gray-50"}`}
                      >
                        <input
                          type="radio"
                          name="centre"
                          value={centre.id}
                          checked={centreId === centre.id}
                          onChange={() => {
                            setCentreId(centre.id);
                            setCreneauId(null);
                            setCreneaux([]);
                            mutationCreneaux.mutate(centre.id);
                          }}
                          className="h-4 w-4 accent-[#14B53A]"
                        />
                        <div className="ml-3">
                          <span className="block text-sm font-semibold text-gray-900">
                            {centre.nom}
                          </span>
                          <span className="block text-xs text-gray-500">
                            Capacité : {centre.capacite_journaliere} / jour
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {mutationCreneaux.isPending && (
                  <p className="text-sm text-gray-500 text-center mb-4">
                    Chargement des créneaux...
                  </p>
                )}

                {creneaux.length > 0 && (
                  <div className="mb-6">
                    <label className="font-semibold text-sm block mb-2">
                      Créneau disponible
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {creneaux.map((c) => (
                        <label
                          key={c.id}
                          className={`flex flex-col items-center p-3 border rounded-lg cursor-pointer transition-colors text-center ${creneauId === c.id ? "border-green-500 bg-green-50" : "border-gray-200 hover:bg-gray-50"}`}
                        >
                          <input
                            type="radio"
                            name="creneau"
                            value={c.id}
                            checked={creneauId === c.id}
                            onChange={() => {
                              setCreneauId(c.id);
                              toast.info("Créneau sélectionné.");
                            }}
                            className="hidden"
                          />
                          <span className="text-sm font-semibold text-gray-900">
                            {new Date(c.date).toLocaleDateString("fr-FR", {
                              weekday: "short",
                              day: "numeric",
                              month: "short",
                            })}
                          </span>
                          <span className="text-sm text-gray-600">
                            {c.heure}
                          </span>
                          <span className="text-xs text-gray-400 mt-1">
                            {c.places_disponibles} place(s)
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-between mt-6">
                  <button
                    type="button"
                    onClick={() => setStep((prev) => prev - 1)}
                    className="border border-gray-400 text-gray-600 font-bold rounded-lg px-6 py-2 hover:bg-gray-100 text-sm"
                  >
                    ← Précédent
                  </button>
                  <button
                    type="button"
                    onClick={handleStep4}
                    disabled={mutationRdv.isPending || !creneauId}
                    className="bg-[#14B53A] hover:bg-green-500 text-white font-bold rounded-lg px-6 py-2 text-sm disabled:opacity-50"
                  >
                    {mutationRdv.isPending
                      ? "Confirmation..."
                      : "Confirmer le RDV →"}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Étape 5 */}
            {step === 5 && (
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-md shadow-md p-4 md:p-6"
              >
                <h2 className="text-xl md:text-2xl font-black border-b pb-3 mb-6">
                  Récapitulatif & Paiement
                </h2>

                {recapLoading ? (
                  <p className="text-center text-gray-500 text-sm py-6">
                    Chargement...
                  </p>
                ) : recapError ? (
                  <p className="text-center text-red-500 text-sm py-6">
                    {recapError.message ||
                      "Le traitement de votre demande n’a pas pu aboutir. Veuillez réessayer ultérieurement."}
                  </p>
                ) : (
                  <>
                    <div className="mb-5">
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">
                        Informations personnelles
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {[
                          {
                            label: "Nom",
                            value: recap?.data?.utilisateur?.nom,
                          },
                          {
                            label: "Prénom",
                            value: recap?.data?.utilisateur?.prenom,
                          },
                          {
                            label: "Date de naissance",
                            value: recap?.data?.utilisateur?.date_naissance
                              ? new Date(
                                  recap.data.utilisateur.date_naissance,
                                ).toLocaleDateString("fr-FR")
                              : "—",
                          },
                          {
                            label: "Lieu de naissance",
                            value: recap?.data?.utilisateur?.lieux_naissance,
                          },
                          {
                            label: "Genre",
                            value: recap?.data?.utilisateur?.genre,
                          },
                          {
                            label: "Téléphone",
                            value: recap?.data?.utilisateur?.telephone,
                          },
                        ].map((item) => (
                          <div
                            key={item.label}
                            className="flex flex-col bg-gray-50 rounded-lg p-3"
                          >
                            <span className="text-xs text-gray-400">
                              {item.label}
                            </span>
                            <span className="text-sm font-semibold text-gray-800">
                              {item.value || "—"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-gray-100 my-4" />

                    <div className="mb-5">
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">
                        Demande
                      </h3>
                      <div className="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
                        <span
                          className={`text-xs font-bold px-3 py-1 rounded-full ${recap?.data?.type_demande === "NOUVELLE" ? "bg-green-100 text-[#14B53A]" : recap?.data?.type_demande === "RENOUVELLEMENT" ? "bg-yellow-100 text-yellow-600" : "bg-red-100 text-red-600"}`}
                        >
                          {recap?.data?.type_demande === "NOUVELLE"
                            ? "Première demande"
                            : recap?.data?.type_demande === "RENOUVELLEMENT"
                              ? "Renouvellement"
                              : "Perte / Vol"}
                        </span>
                        <span className="text-xs text-gray-400">
                          Réf :{" "}
                          {recap?.data?.demande_id?.slice(0, 8).toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-gray-100 my-4" />

                    <div className="mb-5">
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">
                        Documents uploadés
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {recap?.data?.documents?.map((doc) => (
                          <div
                            key={doc.type_document}
                            className="flex items-center gap-3 bg-gray-50 rounded-lg p-3"
                          >
                            <span className="text-green-500 text-lg">✓</span>
                            <div className="flex flex-col">
                              <span className="text-sm font-semibold text-gray-800">
                                {LABELS_DOCUMENTS[doc.type_document] ||
                                  doc.type_document}
                              </span>
                              <span className="text-xs text-gray-400">
                                Uploadé le{" "}
                                {new Date(doc.date_upload).toLocaleDateString(
                                  "fr-FR",
                                )}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-gray-100 my-4" />

                    <div className="mb-5">
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">
                        Rendez-vous
                      </h3>
                      <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-400">Centre</span>
                          <span className="text-sm font-semibold text-gray-800">
                            {recap?.data?.rendezvous?.centre?.nom || "—"}
                          </span>
                          <span className="text-xs text-gray-400 mt-1">
                            {recap?.data?.rendezvous?.centre?.commune},{" "}
                            {recap?.data?.rendezvous?.centre?.province}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-400">Date</span>
                          <span className="text-sm font-semibold text-gray-800">
                            {recap?.data?.rendezvous?.date
                              ? new Date(
                                  recap.data.rendezvous.date,
                                ).toLocaleDateString("fr-FR", {
                                  weekday: "long",
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                })
                              : "—"}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-400">Heure</span>
                          <span className="text-sm font-semibold text-gray-800">
                            {recap?.data?.rendezvous?.heure || "—"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-gray-100 my-4" />

                    <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex justify-between items-center">
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-700">
                          Montant à payer
                        </span>
                        <span className="text-xs text-gray-400">
                          Frais de traitement CNIB
                        </span>
                      </div>
                      <span className="text-2xl font-black text-[#14B53A]">
                        2 500 FCFA
                      </span>
                    </div>

                    <div className="flex flex-col md:flex-row gap-3">
                      <button
                        type="button"
                        onClick={handlePaiement}
                        className="flex-1 bg-[#14B53A] hover:bg-green-500 text-white font-bold rounded-lg px-6 py-3 text-sm transition-colors flex flex-row gap-2 items-center justify-center"
                      >
                        <HandCoins />
                        Payer maintenant
                      </button>
                      <button
                        type="button"
                        onClick={handlePaiementDiffere}
                        className="flex-1 border border-gray-400 text-gray-600 font-bold rounded-lg px-6 py-3 hover:bg-gray-100 text-sm transition-colors flex flex-row gap-2 items-center justify-center"
                      >
                        <Clock9Icon />
                        Payer plus tard
                      </button>
                    </div>
                  </>
                )}

                <div className="flex justify-start mt-6">
                  <button
                    type="button"
                    onClick={() => setStep((prev) => prev - 1)}
                    className="border border-gray-400 text-gray-600 font-bold rounded-lg px-6 py-2 hover:bg-gray-100 text-sm"
                  >
                    ← Précédent
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

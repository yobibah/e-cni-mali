import { X, Save, XCircle, Loader2 } from "lucide-react";
import Modal from "../Modal";
import { motion } from "framer-motion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import GetAdemande from "../../../api/admin/getAdemande";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import UpdateDemande from "../../../api/admin/updateDemande";

const TYPE_DEMANDE_OPTIONS = [
  { value: "NOUVELLE", label: "Nouvelle" },
  { value: "RENOUVELLEMENT", label: "Renouvellement" },
  { value: "PERTE", label: "Perte" },
  { value: "CARTE_DETERIORER", label: "Carte détériorée" },
  { value: "CHANGEMENT_DONNEES", label: "Changement de données" },
];

const STATUT_DEMANDE_OPTIONS = [
  { value: "EN_ATTENTE", label: "En attente" },
  { value: "EN_COURS", label: "En cours" },
  { value: "APPROUVEE", label: "Approuvée" },
  { value: "REJETEE", label: "Rejetée" },
  { value: "TERMINEE", label: "Terminée" },
];

const STATUT_PAIEMENT_OPTIONS = [
  { value: "REUSSI", label: "Réussi" },
  { value: "EN_ATTENTE", label: "En attente" },
  { value: "ECHOUE", label: "Échoué" },
];

const STATUT_RDV_OPTIONS = [
  { value: "CONFIRME", label: "Confirmé" },
  { value: "ANNULE", label: "Annulé" },
  { value: "EN_ATTENTE", label: "En attente" },
];

const demandeStatusStyle = (status) => {
  switch (status) {
    case "APPROUVEE":
      return {
        bg: "bg-green-100 dark:bg-green-900/30",
        color: "text-green-700 dark:text-green-400",
        dot: "bg-green-500 dark:bg-green-400",
      };
    case "EN_ATTENTE":
      return {
        bg: "bg-amber-100 dark:bg-amber-900/30",
        color: "text-amber-700 dark:text-amber-400",
        dot: "bg-amber-500 dark:bg-amber-400",
      };
    case "REJETEE":
      return { bg: "bg-red-100 dark:bg-red-900/30", color: "text-red-700 dark:text-red-400", dot: "bg-red-500 dark:bg-red-400" };
    case "EN_COURS":
      return { bg: "bg-green-100 dark:bg-green-900/30", color: "text-green-700 dark:text-green-400", dot: "bg-green-500 dark:bg-green-400" };
    case "TERMINEE":
      return {
        bg: "bg-green-100 dark:bg-green-900/30",
        color: "text-green-700 dark:text-green-400",
        dot: "bg-green-500 dark:bg-green-400",
      };
    default:
      return { bg: "bg-gray-100 dark:bg-gray-800", color: "text-gray-700 dark:text-gray-400", dot: "bg-gray-400 dark:bg-gray-500" };
  }
};

const paiementStatusStyle = (status) => {
  switch (status) {
    case "REUSSI":
      return { bg: "bg-green-100 dark:bg-green-900/30", color: "text-green-700 dark:text-green-400" };
    case "EN_ATTENTE":
      return { bg: "bg-amber-100 dark:bg-amber-900/30", color: "text-amber-700 dark:text-amber-400" };
    case "ECHOUE":
      return { bg: "bg-red-100 dark:bg-red-900/30", color: "text-red-700 dark:text-red-400" };
    default:
      return { bg: "bg-gray-100 dark:bg-gray-800", color: "text-gray-700 dark:text-gray-400" };
  }
};

const SelectField = ({ label, value, onChange, options, colorFn }) => {
  const style = colorFn ? colorFn(value) : {};
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
        {label}
      </label>
      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className={`
          w-full rounded-lg border px-3 py-2 text-sm font-medium cursor-pointer
          focus:outline-none focus:ring-2 focus:ring-green-300 dark:focus:ring-green-700 transition-all
          ${style.bg || "bg-white dark:bg-gray-800"} ${style.color || "text-gray-800 dark:text-gray-200"}
          border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600
        `}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

const DemandeurAdminModal = ({ setOpen, id }) => {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["getAdemande", id],
    queryFn: () => GetAdemande(id),
    enabled: !!id,
  });

  const queryClient = useQueryClient();
  const [statutDemande, setStatutDemande] = useState("");
  const [statutPaiement, setStatutPaiement] = useState("");
  const [typeDemande, setTypeDemande] = useState("");
  const [statutRdv, setStatutRdv] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  const [centre, setCentre] = useState([]);
  const [centreVa, setCentreVa] = useState();

  useEffect(() => {
    refetch();
    if (data) {
      console.log(data);
      setCentre(data.centre);
      setCentreVa(data?.rendezvous?.centre?.nom);
      setStatutDemande(data.statut || "");
      setStatutPaiement(data.paiement?.statut || "");
      setTypeDemande(data.type_demande || "");
      setStatutRdv(data.rendezvous?.statut || "");
    }
  }, [data]);

  const markDirty = (setter) => (val) => {
    setter(val);
    setIsDirty(true);
  };

  const UpdateMutation = useMutation({
    mutationKey: ['UpdateDemande'],
    mutationFn: ({ id, statutDemande, statutPaiement, typeDemande, statutRdv, centreVa }) => 
      UpdateDemande(id, statutDemande, statutPaiement, typeDemande, statutRdv, centreVa),

    onSuccess() {
      toast.success("Demande mise à jour avec succès");
      queryClient.invalidateQueries({
        queryKey: ['getDemande']
      });
      queryClient.invalidateQueries({
        queryKey: ['GetDash']
      });
      setOpen(false);
    },

    onError() {
      toast.error('Le traitement de votre demande n’a pas pu aboutir. Veuillez réessayer ultérieurement. lors de la mise à jour');
    }
  });

  const handlePayDemande = () => {

  };

  const handleSave = () => {
    if (!data?.isPaiement) {
      toast.info("Vous devez d'abord initier un paiement avant de continuer la modification");
      return;
    }
    UpdateMutation.mutate({ 
      id, 
      statutDemande, 
      statutPaiement, 
      typeDemande, 
      statutRdv, 
      centreVa 
    });
  };

  const handleCancel = () => {
    if (data) {
      setStatutDemande(data.statut || "");
      setStatutPaiement(data.paiement?.statut || "");
      setTypeDemande(data.type_demande || "");
      setStatutRdv(data.rendezvous?.statut || "");
    }
    setIsDirty(false);
  };

  const demandeStyle = demandeStatusStyle(statutDemande);
  const paiementStyle = paiementStatusStyle(statutPaiement);

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <Modal>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        layout
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4">
          <div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Détails de la demande
            </h1>
            {data?.id && (
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate max-w-xs">
                {data.id}
              </p>
            )}
          </div>
          <button
            onClick={() => setOpen(false)}
            className="cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full h-9 w-9 flex justify-center items-center transition-colors shadow"
          >
            <X size={18} className="text-red-500 dark:text-red-400" />
          </button>
        </div>

        <div className="border-t border-gray-100 dark:border-gray-800" />

        {isLoading ? (
          <div className="flex items-center justify-center h-40 text-gray-400 dark:text-gray-500 text-sm">
            Chargement...
          </div>
        ) : (
          <>
            {/* Statuts */}
            <div className="px-6 py-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700 space-y-3">
                <SelectField
                  label="Statut de la demande"
                  value={statutDemande}
                  onChange={markDirty(setStatutDemande)}
                  options={STATUT_DEMANDE_OPTIONS}
                  colorFn={demandeStatusStyle}
                />
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2 w-2 rounded-full ${demandeStyle.dot}`}
                  />
                  <span className={`text-xs font-medium ${demandeStyle.color}`}>
                    {STATUT_DEMANDE_OPTIONS.find(
                      (o) => o.value === statutDemande,
                    )?.label || "-"}
                  </span>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700 space-y-3 flex flex-col justify-center">
                {data?.isPaiement ? (
                  <>
                    <SelectField
                      label="Statut de paiement"
                      value={statutPaiement}
                      onChange={markDirty(setStatutPaiement)}
                      options={STATUT_PAIEMENT_OPTIONS}
                      colorFn={paiementStatusStyle}
                    />

                    {data?.paiement?.montant && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Montant :{" "}
                        <span className="font-semibold text-gray-700 dark:text-gray-300">
                          {data.paiement.montant} FCFA
                        </span>
                        {data.paiement.date_paiement && (
                          <> · {formatDate(data.paiement.date_paiement)}</>
                        )}
                      </p>
                    )}
                  </>
                ) : (
                  <button
                    onClick={handlePayDemande}
                    className="
                  flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold w-full
                  bg-[#14B53A] text-white shadow-sm
                  hover:bg-green-700 active:scale-95 transition-all
                  disabled:opacity-40 disabled:cursor-not-allowed
                   justify-center cursor-pointer
                "
                  >
                    <Save size={15} />
                    Payer Cette demande
                  </button>
                )}
              </div>
            </div>

            {/* Infos générales */}
            <div className="px-6 pb-1">
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                Informations générales
              </p>
            </div>
            <div className="border-t border-gray-100 dark:border-gray-800 mx-6" />

            <div className="px-6 py-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SelectField
                label="Type de demande"
                value={typeDemande}
                onChange={markDirty(setTypeDemande)}
                options={TYPE_DEMANDE_OPTIONS}
              />
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Date de création
                </label>
                <p className="text-sm text-gray-800 dark:text-gray-200 px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  {formatDate(data?.date_creation)}
                </p>
              </div>
            </div>

            {/* Rendez-vous */}
            <div className="px-6 pb-1">
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                Rendez-vous
              </p>
            </div>
            <div className="border-t border-gray-100 dark:border-gray-800 mx-6" />

            <div className="mx-6 my-4 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-xl p-4 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-green-500 dark:text-green-400 font-medium mb-0.5">
                    Centre
                  </p>
                  <SelectField
                    label="Centre DNEC"
                    value={centreVa}
                    onChange={markDirty(setCentreVa)}
                    options={centre.map((item) => ({
                      value: item.id,
                      label: item.nom,
                    }))}
                  />
                  {data?.rendezvous?.centre?.commune && (
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {data.rendezvous.centre.commune}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-green-500 dark:text-green-400 font-medium mb-0.5">
                    Date du RDV
                  </p>
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                    {formatDate(data?.rendezvous?.date)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-green-500 dark:text-green-400 font-medium mb-0.5">
                    Heure
                  </p>
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                    {data?.rendezvous?.heure || "-"}
                  </p>
                </div>
                <div className="sm:col-span-1">
                  <SelectField
                    label="Statut RDV"
                    value={statutRdv}
                    onChange={markDirty(setStatutRdv)}
                    options={STATUT_RDV_OPTIONS}
                  />
                </div>
              </div>
            </div>

            {/* ===== SECTION DOCUMENTS ===== */}
            <div className="px-6 pb-1">
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                Documents joints
              </p>
            </div>
            <div className="border-t border-gray-100 dark:border-gray-800 mx-6" />

            <div className="px-6 py-4">
              {data?.documents && data.documents.length > 0 ? (
                <div className=" items-center grid  sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full ">
                  {data.documents.map((doc) => {
                    const isImage = /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(doc.fichier);
                    const isPDF = /\.pdf$/i.test(doc.fichier);
                    const fileName = doc.fichier.split('/').pop() || doc.fichier;
                    
                    return (
                      <div
                        key={doc.id}
                        className="group relative bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-all"
                      >
                        {/* Aperçu du document */}
                        <div className="aspect-square w-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center relative">
                          {isImage ? (
                            <img
                              src={doc.url}
                              alt={fileName}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '';
                                e.target.className = 'hidden';
                                e.target.parentElement.innerHTML = `
                                  <div class="flex flex-col items-center justify-center w-full h-full text-gray-400 dark:text-gray-500">
                                    <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span class="text-xs mt-1">Image non disponible</span>
                                  </div>
                                `;
                              }}
                            />
                          ) : isPDF ? (
                            <div className="flex flex-col items-center justify-center w-full h-full">
                              <svg className="w-16 h-16 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 17h10" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 13h6" />
                              </svg>
                              <span className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-1">PDF</span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center w-full h-full text-gray-400 dark:text-gray-500">
                              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <span className="text-xs mt-1">Fichier</span>
                            </div>
                          )}
                          
                          {/* Overlay au survol */}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <a
                              href={doc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-white/90 hover:bg-white text-gray-800 rounded-full p-2 transition-all hover:scale-110"
                              title="Ouvrir dans un nouvel onglet"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                            <button
                              onClick={() => {
                                const link = document.createElement('a');
                                link.href = doc.url;
                                link.download = fileName;
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                              }}
                              className="bg-white/90 hover:bg-white text-gray-800 rounded-full p-2 transition-all hover:scale-110"
                              title="Télécharger"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        
                        {/* Nom du fichier */}
                        <div className="p-2">
                          <p className="text-xs text-gray-600 dark:text-gray-400 truncate" title={fileName}>
                            {fileName}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400 dark:text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-sm">Aucun document joint</p>
                </div>
              )}
            </div>
            {/* ===== FIN SECTION DOCUMENTS ===== */}

            {/* Actions */}
            <div className="border-t border-gray-100 dark:border-gray-800 mx-6" />
            <div className="px-6 py-4 flex justify-end gap-3">
              <button
                onClick={handleCancel}
                disabled={!isDirty}
                className="
                  flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                  border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800
                  hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all
                  disabled:opacity-40 disabled:cursor-not-allowed
                "
              >
                <XCircle size={15} />
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={!isDirty}
                className="
                  flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold
                  bg-[#14B53A] text-white shadow-sm
                  hover:bg-green-700 active:scale-95 transition-all
                  disabled:opacity-40 disabled:cursor-not-allowed
                "
              >
                {UpdateMutation.isPending ? (
                  <div className="flex gap-2">
                    <Loader2 size={16} className="animate-spin text-white" />
                    En cours de sauvegarde
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Save size={15} className="text-white" />
                    Sauvegarder
                  </div>
                )}
              </button>
            </div>
          </>
        )}
      </motion.div>
    </Modal>
  );
};

export default DemandeurAdminModal;
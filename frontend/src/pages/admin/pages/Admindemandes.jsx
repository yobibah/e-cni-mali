import { useEffect, useState } from "react";
import { NavBar } from "../../../components/ui/nav";
import {
  CheckIcon,
  Clock,
  Download,
  Loader2,
  PenBox,
  Plus,
  RefreshCcw,
  Search,
  Trash,
  Trash2,
  X,
} from "lucide-react";
import { AppHeader } from "../../../components/ui/AppHeader";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import DemandeLis from "../../../api/admin/demandeLis";
import DemandeurAdminModal from "../../../components/ui/modal/DemandeurAdminModal";
import DemandeAdminDelModal from "../../../components/ui/modal/DemandeAdminDelModal";
import { toast } from "sonner";
import recoverDemande from "../../../api/admin/recoverDemande";
import DemanCard from "../../../components/ui/card/DemCard";
import exportDemande from "../../../api/admin/exportDemande";

const STATUS_FILTERS = [
  "Tous",
  "Rejetee",
  "En_attente",
  "Approuvee",
  "En_cours",
  "Terminee",
];

function CheckStatus(status) {
  switch (status?.toLowerCase()) {
    case "approuvee":
      return {
        color: "text-lime-600 dark:text-lime-400",
        bgcol: "bg-lime-50 dark:bg-lime-900/30",
        dotcol: "bg-lime-500 dark:bg-lime-400",
        name: "Approuvée",
      };
    case "en_cours":
      return {
        color: "text-[#14B53A] dark:text-green-400",
        bgcol: "bg-green-50 dark:bg-green-900/30",
        dotcol: "bg-green-500 dark:bg-green-400",
        name: "En cours",
      };
    case "rejetee":
      return {
        color: "text-red-600 dark:text-red-400",
        bgcol: "bg-red-50 dark:bg-red-900/30",
        dotcol: "bg-red-500 dark:bg-red-400",
        name: "Rejetée",
      };
    case "en_attente":
      return {
        color: "text-amber-600 dark:text-amber-400",
        bgcol: "bg-amber-50 dark:bg-amber-900/30",
        dotcol: "bg-amber-500 dark:bg-amber-400",
        name: "En attente",
      };
    case "terminee":
      return {
        color: "text-[#14B53A] dark:text-green-400",
        bgcol: "bg-green-50 dark:bg-green-900/30",
        dotcol: "bg-green-500 dark:bg-green-400",
        name: "Terminée",
      };
    default:
      return {
        color: "text-gray-600 dark:text-gray-400",
        bgcol: "bg-gray-50 dark:bg-gray-800",
        dotcol: "bg-gray-400 dark:bg-gray-500",
        name: status ?? "-",
      };
  }
}

const AdminDemande = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [page, setPage] = useState(1);
  const [updateModal, setUpdateModal] = useState(false);
  const [demId, setdemId] = useState("");
  const [deleteModal, setDeleteModal] = useState(false);

  const [refuse, setRefuse] = useState(0);
  const [approuvee, setApprouvee] = useState(0);
  const [terminee, setTerminee] = useState(0);
  const [attente, setAttente] = useState(0);
  const [encours, setEncours] = useState(0);

  const { data, isLoading, error } = useQuery({
    queryKey: ["getDemande", page],
    queryFn: () => DemandeLis(page),
  });

  const demande = data?.demande ?? [];
  const totalPage = data?.totalPages ?? 1;
  const totdem = data?.totalDemande ?? 0;

  useEffect(() => {
    setRefuse(demande.filter((f) => f.statut === "REJETEE").length);
    setApprouvee(demande.filter((f) => f.statut === "APPROUVEE").length);
    setEncours(demande.filter((f) => f.statut === "EN_COURS").length);
    setAttente(demande.filter((f) => f.statut === "EN_ATTENTE").length);
    setTerminee(demande.filter((f) => f.statut === "TERMINEE").length);
  }, [demande]);
  const filtered =
    active === 0
      ? demande
      : demande.filter(
          (d) =>
            d.statut?.toLowerCase() === STATUS_FILTERS[active].toLowerCase(),
        );

  const queryClient = useQueryClient();
  const RecoverMutation = useMutation({
    mutationFn: (id) => recoverDemande(id),

    onSuccess: () => {
      toast.success("La demande numero a ete recuperer avec succes");
      queryClient.invalidateQueries({
        queryKey: ["getDemande"],
      });
    },

    onError: (error) => {
      toast.error(
        error.message || "Le traitement de votre demande n’a pas pu aboutir. Veuillez réessayer ultérieurement. lors de la suppression",
      );
    },
  });

  const handleRecoverDemande = (id) => {
    if (!id) {
      toast.error("Identifiant invalide. Ressayer plus tard");
      return;
    }

    RecoverMutation.mutate(id);
  };

  const exportMutation = useMutation({
    mutationFn: exportDemande,
    onSuccess: (blob) => {
      toast.success("Les données ont été exportées avec succès");

      // Créer un lien de téléchargement avec le blob
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `listes des demandes.${new Date()}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 1000);
    },
    onError: (error) => {
      console.error(error);
      toast.error(error.message || "Le traitement de votre demande n’a pas pu aboutir. Veuillez réessayer ultérieurement. lors de l'export");
    },
  });
  const handleExport = () => {
    exportMutation.mutate();
  };

  const items = [
    {
      titre: "Total demandes Rejetees",
      value: refuse,
      icon: X,
      color: "text-red-500",
      bg: "bg-red-100",
    },
    {
      titre: "Demandes approuvee",
      value: approuvee,
      icon: CheckIcon,
      color: "text-lime-500",
      bg: "bg-lime-100",
    },
    {
      titre: "Demande Terminees",
      value: terminee,
      icon: Plus,
      color: "text-green-500",
      bg: "bg-green-100",
    },
    {
      titre: "Demandes en attente ",
      value: attente,
      icon: Clock,
      color: "text-yellow-500",
      bg: "bg-yellow-100",
    },
  ];

  const enc = {
    titre: "Demandes en cours de traitement ",
    value: encours,
    icon: Clock,
    color: "text-green-500",
    bg: "bg-green-100",
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-grid-light dark:bg-grid-dark  dark:from-gray-600 from-gray-50  dark:to-gray-700  to-gray-100 flex flex-col">
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
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-grid-light from-gray-50 dark:bg-gray-950  to-gray-100 flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center px-4">
            <img
              src="/oni_404.svg"
              alt="error..."
              className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 mx-auto object-contain animate-pulse"
            />
            <p className="text-gray-600  dark:text-gray-50 mt-4 text-sm md:text-base">
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
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-grid-light from-gray-50 to-gray-100 flex flex-col">
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
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-grid-light from-gray-50 dark:bg-gray-950  to-gray-100 flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center px-4">
            <img
              src="/404.svg"
              alt="error..."
              className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 mx-auto object-contain animate-pulse"
            />
            <p className="text-gray-600  dark:text-gray-50 mt-4 text-sm md:text-base">
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
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <NavBar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <AppHeader onOpenSidebar={() => setSidebarOpen(true)} />

        <main className="flex-1 p-4 md:p-6 overflow-y-auto space-y-6 mt-14">
          <div className="flex justify-between ">
            <div>
              <h1 className="text-2xl font-bold dark:text-gray-100">
                Demandes
              </h1>
              <p className="font-medium text-sm text-gray-500 dark:text-gray-400">
                Suivi de toutes les demandes de documents d'identité.
              </p>
            </div>

            <div className="flex sm:flex-col md:flex-row lg:flex-row gap-4 justify-center items-center">
              <button
                onClick={handleExport}
                disabled={exportMutation.isPending}
                className="bg-gray-50 dark:bg-gray-800 flex flex-row gap-1 p-2 rounded-lg cursor-pointer justify-center items-center border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {exportMutation.isPending ? (
                  <div className="flex flex-row gap-1 items-center">
                    <Loader2
                      size={20}
                      className="text-gray-500 dark:text-gray-400 animate-spin"
                    />
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-bold hover:text-gray-600 dark:hover:text-gray-300">
                      En cours d'exportation
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-row gap-1 items-center">
                    <Download
                      size={20}
                      className="text-gray-500 dark:text-gray-400"
                    />
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-bold hover:text-gray-600 dark:hover:text-gray-300">
                      Exporter
                    </p>
                  </div>
                )}
              </button>

              {/* <button className="bg-[#14B53A] dark:bg-green-700 flex flex-row gap-1 p-2 rounded-lg cursor-pointer justify-center items-center hover:bg-green-500 dark:hover:bg-green-800">
                <Plus color="#fff" size={20} />
                <p className="text-sm text-white font-bold">Nouveau</p>
              </button> */}
            </div>
          </div>
          <div className="">
            <DemanCard item={enc} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {items.map((t, index) => (
              <DemanCard key={index} item={t} />
            ))}
          </div>

          <div className="shadow rounded p-4 dark:bg-gray-900 dark:border dark:border-gray-800">
            <div className="flex items-center gap-2 border border-gray-300 dark:border-gray-700 rounded-full px-3 py-2">
              <Search size={18} className="text-gray-400 dark:text-gray-500" />
              <input
                type="search"
                placeholder="Rechercher..."
                className="flex-1 outline-none bg-transparent text-sm dark:text-gray-200 dark:placeholder-gray-500"
              />
            </div>

            <div className="border-b border-gray-200 dark:border-gray-800 m-4" />

            <div className="space-x-2">
              {STATUS_FILTERS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className={`border rounded-full text-sm font-semibold px-3 py-1 cursor-pointer ${
                    active === i
                      ? "border-[#14B53A] dark:border-green-500 bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300"
                      : "border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
                <tr>
                  {[
                    "Référence",
                    "Demandeur",
                    "Type",
                    "Centre",
                    "Montant",
                    "Statut",
                    "Supprimer",
                    "Date",
                    "Action",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-left text-xs text-gray-400 dark:text-gray-500 uppercase"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {filtered.length > 0 ? (
                  filtered.map((d, i) => {
                    const { bgcol, color, dotcol, name } = CheckStatus(
                      d.statut,
                    );
                    const dateObj = new Date(d.date_creation);
                    const date = dateObj.toLocaleDateString("fr-FR");
                    const heure = dateObj.getHours();
                    const min = String(dateObj.getMinutes()).padStart(2, "0");

                    return (
                      <tr
                        key={i}
                        className="cursor-pointer odd:bg-white dark:odd:bg-gray-900 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <td className="px-5 py-3  text-xs text-gray-500 dark:text-gray-400">
                          {d.utilisateur_id}
                        </td>
                        <td className="px-5 py-3 text-sm dark:text-gray-300">
                          <span className="font-semibold dark:text-gray-200">
                            {d.utilisateur?.nom?.toUpperCase()}{" "}
                          </span>
                          {d.utilisateur?.prenom}
                        </td>
                        <td className="px-5 py-3 dark:text-gray-300">
                          {d.type_demande?.toLowerCase()}
                        </td>
                        <td className="px-5 py-3 dark:text-gray-300">
                          {d?.rendezvous?.creneau?.centre?.nom ?? "—"}
                        </td>
                        <td className="px-5 py-3 dark:text-gray-300">
                          2 500 FCFA
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className={`${bgcol} ${color} inline-flex items-center gap-2 px-3 py-1 rounded-full`}
                          >
                            <span
                              className={`${dotcol} w-2 h-2 rounded-full`}
                            />
                            {name}
                          </span>
                        </td>

                        <td className="px-5 py-3.5 text-gray-500 lowercase">
                          {d.delelet_at ? (
                            <span className="inline-flex bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 h-10 w-10 items-center justify-center rounded-full text-red-600 dark:text-red-400 uppercase font-bold text-[10px]">
                              {" "}
                              Oui
                            </span>
                          ) : (
                            <span className="inline-flex bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 h-10 w-10 items-center justify-center rounded-full text-gray-600 dark:text-gray-400 uppercase font-bold text-[10px]">
                              {" "}
                              Non
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-3 dark:text-gray-300">
                          {date} à {heure}h{min}
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                (setUpdateModal(true), setdemId(d.id));
                              }}
                            >
                              <PenBox
                                className="text-[#14B53A] dark:text-green-400"
                                size={18}
                              />
                            </button>
                            {d.delelet_at ? (
                              <button
                                onClick={() => {
                                  handleRecoverDemande(d.id);
                                }}
                              >
                                <RefreshCcw
                                  className="text-orange-500 dark:text-orange-400"
                                  size={18}
                                />
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  (setDeleteModal(true), setdemId(d.id));
                                }}
                              >
                                <Trash
                                  className="text-red-500 dark:text-red-400"
                                  size={18}
                                />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={8}
                      className="text-center py-6 text-gray-400 dark:text-gray-500"
                    >
                      Aucune demande trouvée
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400">
            Total des demandes : {totdem}
          </p>

          {updateModal && (
            <DemandeurAdminModal setOpen={setUpdateModal} id={demId} />
          )}

          {deleteModal && (
            <DemandeAdminDelModal setOpen={setDeleteModal} id={demId} />
          )}
        </main>

        {/* Pagination */}
        <div className="w-full flex justify-between items-center text-sm px-10 py-4 dark:text-gray-300">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="bg-gray-200 dark:bg-gray-800 px-4 py-2 border rounded-lg disabled:opacity-50 cursor-pointer dark:border-gray-700 dark:text-gray-300"
          >
            Précédent
          </button>
          <span>
            Page {page} sur {totalPage}
          </span>
          <button
            disabled={page === totalPage}
            onClick={() => setPage((p) => p + 1)}
            className="bg-[#14B53A] dark:bg-green-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 cursor-pointer hover:bg-green-700 dark:hover:bg-green-800"
          >
            Suivant
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDemande;

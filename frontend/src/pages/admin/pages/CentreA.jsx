import { useState } from "react";
import { NavBar } from "../../../components/ui/nav";
import {
  FileTextIcon,
  MapPinCheckInsideIcon,
  Building2,
  Plus,
  PenBox,
  Trash,
  CirclePower,
  CircleFadingPlusIcon,
  ToggleRight,
  ToggleLeft,
} from "lucide-react";
import { AppHeader } from "../../../components/ui/AppHeader";
import { motion } from "framer-motion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Getcentre from "../../../api/centres/centre";
import { toast } from "sonner";
import DeleteCentreModal from "../../../components/ui/modal/DeleteCentreModal";
import Addcentre from "../../../components/ui/modal/AddCentre";
import updateCentreStatus from "../../../api/admin/updateCentreStatus";
import UpdateCentreModal from "../../../components/ui/modal/UpdateCentreModal";

// Composant pour une carte centre
function CentreCard({ centre, onDelete, onUpdateStatus, onEdit }) {
  const isOperational = centre.statut === true;
  const address = [centre.commune, centre.province, centre.region]
    .filter(Boolean)
    .join(", ");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="group relative bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
    >
      <div className="px-5 pt-4 pb-3 flex items-start justify-between gap-3">
        <div className="flex gap-3 items-start min-w-0">
          <div className="mt-0.5 flex-shrink-0 h-9 w-9 rounded-xl flex items-center justify-center bg-gray-100 dark:bg-gray-800">
            <Building2 size={17} className="text-gray-600 dark:text-gray-400" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-gray-900 dark:text-gray-100 leading-tight truncate">
              {centre.nom}
            </h1>
            <div className="flex items-center gap-1 mt-1">
              <MapPinCheckInsideIcon
                size={12}
                className="text-gray-400 dark:text-gray-500 flex-shrink-0"
              />
              <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                {address}
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-0.5 items-center justify-center">
          <button
            onClick={() => onEdit(centre.id)}
            className="flex-shrink-0 h-7 w-7 rounded-lg flex items-center justify-center text-green-400 dark:text-green-500 hover:text-[#14B53A] dark:hover:text-green-300 hover:bg-green-100 dark:hover:bg-green-800 transition-colors cursor-pointer"
          >
            <PenBox size={16} />
          </button>

          <button
            onClick={() => onUpdateStatus(centre.id)}
            className={`flex-shrink-0 h-7 w-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
              centre.statut
                ? "text-green-400 dark:text-green-500 hover:text-[#14B53A] dark:hover:text-green-300 hover:bg-green-100 dark:hover:bg-green-800"
                : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            {centre.statut ? (
              <ToggleRight size={16} />
            ) : (
              <ToggleLeft size={16} />
            )}
          </button>

          <button
            onClick={() => onDelete(centre.id)}
            className="flex-shrink-0 h-7 w-7 rounded-lg flex items-center justify-center text-red-400 dark:text-red-500 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-100 dark:hover:bg-red-800 transition-colors cursor-pointer"
          >
            <Trash size={16} />
          </button>
        </div>
      </div>

      <div className="mx-5 border-t border-gray-100 dark:border-gray-800" />

      <div className="px-5 py-4 grid grid-cols-2 gap-3">
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl px-3 py-3">
          <div className="flex items-center gap-1.5 mb-2">
            <FileTextIcon
              size={13}
              className="text-gray-400 dark:text-gray-500"
            />
            <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">
              Capacité
            </p>
          </div>
          <p className="text-xl font-bold text-gray-800 dark:text-gray-200 tabular-nums">
            {centre.capacite_journaliere.toLocaleString("fr-FR")}
          </p>
        </div>
      </div>

      <div className="px-5 pb-4">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              isOperational ? "bg-green-500" : "bg-red-500"
            }`}
          />
          {isOperational ? "Opérationnel" : "Hors service"}
        </span>
      </div>
    </motion.div>
  );
}

const CentreA = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 6;

  // États des modales
  const [openDelete, setOpenDelete] = useState(false);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [selectedCentreId, setSelectedCentreId] = useState(null);

  // Requête pour récupérer les centres
  const { data, isLoading, error } = useQuery({
    queryKey: ["centres", page],
    queryFn: () => Getcentre(page, limit),
    keepPreviousData: true,
  });

  const centres = data?.centres || [];
  const totalPages = data?.totalPages || 1;
  const totalItems = data?.total || 0;

  const horsLigne = centres.filter((c) => c.statut === false).length;
  const operational = centres.filter((c) => c.statut === true).length;

  // Gestion de l'ouverture des modales
  const handleDeleteClick = (id) => {
    setSelectedCentreId(id);
    setOpenDelete(true);
  };

  const handleEditClick = (id) => {
    setSelectedCentreId(id);
    setOpenUpdate(true);
  };

  // Fermeture des modales
  const handleCloseDelete = () => {
    setOpenDelete(false);
    setSelectedCentreId(null);
  };

  const handleCloseUpdate = () => {
    setOpenUpdate(false);
    setSelectedCentreId(null);
  };

  const handleCloseAdd = () => {
    setOpenAdd(false);
  };

  const queryClient = useQueryClient();

  // Mutation pour le statut
  const updateStatusMutation = useMutation({
    mutationFn: (id_centre) => updateCentreStatus(id_centre),
    onSuccess: () => {
      toast.success("Statut du centre modifié avec succès");
      queryClient.invalidateQueries({ queryKey: ["centres"] });
    },
    onError: (error) => {
      toast.error(
        error.message ||
          "Le traitement de votre demande n’a pas pu aboutir. Veuillez réessayer ultérieurement. lors de la modification du statut"
      );
    },
  });

  const handleUpdateCentreStatus = (id) => {
    if (!id) {
      toast.error("Les références du centre sont requises");
      return;
    }
    updateStatusMutation.mutate(id);
  };

  // if (isLoading) {
  //   return (
  //     <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
  //       <NavBar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
  //       <div className="flex-1 flex items-center justify-center">
  //         <p className="text-gray-500 dark:text-gray-400">Chargement...</p>
  //       </div>
  //     </div>
  //   );
  // }

  // if (error) {
  //   return (
  //     <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
  //       <NavBar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
  //       <div className="flex-1 flex items-center justify-center">
  //         <p className="text-red-500">Erreur de chargement des centres</p>
  //       </div>
  //     </div>
  //   );
  // }

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

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <NavBar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <AppHeader onOpenSidebar={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto mt-14">
             <div className="px-6 pt-6 pb-2">
            {/* Page title */}
            <div className="flex justify-between">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Centres DNEC
                </h2>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">
                  {totalItems} centres enregistrés
                </p>
              </div>

              <div className="">
                <button
                  onClick={() => setOpenAdd(true)}
                  className="bg-green-700 p-2 rounded flex gap-2 items-center justify-center cursor-pointer hover:shadow-md transition-all duration-300 translate-y-0.5"
                >
                  <Plus size={16} className="text-white" />
                  <p className="text-white text-sm">Ajouter</p>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                {
                  label: "Centres (page)",
                  value: centres.length,
                  color: "text-gray-800 dark:text-gray-200",
                },
                {
                  label: "Opérationnels",
                  value: operational,
                  color: "text-[#14B53A] dark:text-green-400",
                },
                {
                  label: "Hors ligne",
                  value: horsLigne,
                  color: "text-red-600 dark:text-red-400",
                },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.3 }}
                  className="bg-white dark:bg-gray-900 rounded-xl px-4 py-3 border border-gray-100 dark:border-gray-800 shadow-sm"
                >
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">
                    {stat.label}
                  </p>
                  <p
                    className={`text-2xl font-bold tabular-nums ${stat.color}`}
                  >
                    {stat.value}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="px-6 pb-4 grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {centres.map((c) => (
              <CentreCard
                key={c.id}
                centre={c}
                onDelete={handleDeleteClick}
                onUpdateStatus={handleUpdateCentreStatus}
                onEdit={handleEditClick}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="w-full flex justify-between items-center text-sm px-10 py-4 dark:text-gray-300">
              <button
                type="button"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="bg-gray-200 dark:bg-gray-800 px-4 py-2 border rounded-lg disabled:opacity-50 cursor-pointer dark:border-gray-700"
              >
                Précédent
              </button>
              <span>
                Page {page} sur {totalPages}
              </span>
              <button
                type="button"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="bg-[#14B53A] dark:bg-green-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 cursor-pointer hover:bg-green-700 dark:hover:bg-green-800"
              >
                Suivant
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Modales */}
      {openDelete && (
        <DeleteCentreModal id={selectedCentreId} setOpen={handleCloseDelete} />
      )}
      {openAdd && <Addcentre setOpen={handleCloseAdd} />}
      {openUpdate && (
        <UpdateCentreModal id={selectedCentreId} setOpen={handleCloseUpdate} />
      )}
    </div>
  );
};

export default CentreA;
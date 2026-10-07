import { useMutation, useQueryClient } from "@tanstack/react-query";
import Modal from "../Modal";
import { AlertTriangleIcon, Trash, X, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import deleteDemande from "../../../api/admin/deleteDemande";
import { toast } from "sonner";

const DemandeAdminDelModal = ({ setOpen, id }) => {
  const queryClient = useQueryClient();

  const DelMutation = useMutation({
    mutationFn: (id) => deleteDemande(id),

    onSuccess: () => {
      toast.success("La demande numero " + id + " a ete supprimer avec succes");
      queryClient.invalidateQueries({
        queryKey: ["getDemande"],
      });
      setOpen(false);
    },

    onError: (error) => {
      toast.error(
        error.message || "Le traitement de votre demande n’a pas pu aboutir. Veuillez réessayer ultérieurement. lors de la suppression"
      );
    },
  });

  const handleDeleteDemande = () => {
    if (!id) {
      toast.error("Identifiant invalide. Ressayer plus tard");
      return;
    }

    DelMutation.mutate(id);
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
        <div className="flex justify-between items-start p-6">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              Supprimer la demande
            </h1>

            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Référence : <span className="font-medium">{id}</span>
            </p>
          </div>

          <button
            onClick={() => setOpen(false)}
            className="cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/20 rounded-full h-9 w-9 flex justify-center items-center transition-colors shadow"
          >
            <X size={18} className="text-red-500" />
          </button>
        </div>

        <div className="border-t border-gray-100 dark:border-gray-700" />

        <div className="px-6 py-8">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="h-14 w-14 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <AlertTriangleIcon size={26} className="text-red-600" />
            </div>

            <div>
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                Confirmer la suppression
              </h2>

              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Cette demande sera supprimée définitivement. Cette action est irréversible.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 dark:border-gray-700 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={() => setOpen(false)}
            className="flex gap-2 justify-center items-center border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          >
            <XCircle size={18} className="text-gray-500 dark:text-gray-300" />
            <p className="text-gray-600 dark:text-gray-300">Annuler</p>
          </button>

          <button
            onClick={handleDeleteDemande}
            className="flex gap-2 justify-center items-center bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-2.5 cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/30 transition"
          >
            <Trash size={18} className="text-red-500" />
            <p className="text-red-500 font-medium">Supprimer</p>
          </button>
        </div>
      </motion.div>
    </Modal>
  );
};

export default DemandeAdminDelModal;
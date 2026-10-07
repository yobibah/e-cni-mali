import { useMutation, useQueryClient } from "@tanstack/react-query";
import Modal from "../Modal";
import { AlertTriangleIcon, Trash, X, XCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import deleteCentre from "../../../api/admin/deleteCentre";

const DeleteCentreModal = ({ setOpen, id }) => {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationKey: ["SupprimerCentre", id],
    mutationFn: () => deleteCentre(id), // on passe id directement

    onSuccess: () => {
      toast.success("Centre supprimé avec succès");
      queryClient.invalidateQueries({ queryKey: ["centres"] });
      setOpen(false);
    },
    onError: (error) => {
      toast.error(error.message || "Le traitement de votre demande n’a pas pu aboutir. Veuillez réessayer ultérieurement. lors de la suppression");
      // On laisse la modale ouverte pour permettre un réessai
    },
  });

  const handleDelete = () => {
    if (!id) {
      toast.error("Les références du centre sont manquantes");
      return;
    }
    deleteMutation.mutate();
  };

  const isLoading = deleteMutation.isPending;

  return (
    <Modal>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto "
      >
        <div className="flex justify-between items-start p-6">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Supprimer le centre
            </h1>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Référence : <span className="font-medium dark:text-gray-300">{id}</span>
            </p>
          </div>
          <button
            onClick={() => setOpen(false)}
            disabled={isLoading}
            className="cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full h-9 w-9 flex justify-center items-center transition-colors shadow disabled:opacity-50"
          >
            <X size={18} className="text-red-500 dark:text-red-400" />
          </button>
        </div>

        <div className="border-t border-gray-100 dark:border-gray-800" />

        <div className="px-6 py-8">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="h-14 w-14 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <AlertTriangleIcon size={26} className="text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Confirmer la suppression
              </h2>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Ce centre sera définitivement supprimé. Cette action est irréversible.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 dark:border-gray-800 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={() => setOpen(false)}
            disabled={isLoading}
            className="flex gap-2 justify-center items-center border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition disabled:opacity-50"
          >
            <XCircle size={18} className="text-gray-500 dark:text-gray-400" />
            <p className="text-gray-600 dark:text-gray-400">Annuler</p>
          </button>

          <button
            onClick={handleDelete}
            disabled={isLoading}
            className="flex gap-2 justify-center items-center bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-2.5 cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/40 transition disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 size={18} className="animate-spin text-red-500 dark:text-red-400" />
            ) : (
              <Trash size={18} className="text-red-500 dark:text-red-400" />
            )}
            <p className="text-red-500 dark:text-red-400 font-medium">
              {isLoading ? "Suppression..." : "Supprimer"}
            </p>
          </button>
        </div>
      </motion.div>
    </Modal>
  );
};

export default DeleteCentreModal;
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Modal from "../Modal";
import { LogOut, X, XCircle, AlertTriangleIcon } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
// import { logoutUser } from "../../../api/auth/logout"; // Votre API de déconnexion
import getToken from "../../../hooks/adminToken";
import Cookies from 'js-cookie';
import { useState } from "react";

const LogOutModal = ({ setOpen }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const token =  getToken();
  const[Loading,setLoading] =useState(false);

//   const LogoutMutation = useMutation({
//     mutationFn: () => logoutUser(),

//     onSuccess: () => {
//       toast.success("Déconnexion réussie");
      
//       // Supprimer toutes les données du cache
//       queryClient.clear();
      
//       // Rediriger vers la page de connexion
//       navigate("/login", { replace: true });
      
//       setOpen(false);
//     },

//     onError: (error) => {
//       toast.error(
//         error?.response?.data?.message || 
//         error?.message || 
//         "Le traitement de votre demande n’a pas pu aboutir. Veuillez réessayer ultérieurement. lors de la déconnexion"
//       );
//     },
//   });

  const handleLogout = () => {
    toast.success('Deconnexion reussi');
    queryClient.clear();
    setLoading(true)
    
    setTimeout(() => {
         setLoading(false)
        Cookies.remove(token);
         
        navigate("/admin/login", { replace: true });
    }, 2000);
  };

  return (
    <Modal>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        layout
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-4 "
      >
        <div className="flex justify-between items-start p-6">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              Déconnexion
            </h1>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Voulez-vous vraiment vous déconnecter ?
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
            <div className="h-14 w-14 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
              <AlertTriangleIcon size={26} className="text-yellow-600" />
            </div>

            <div>
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                Confirmer la déconnexion
              </h2>

              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Vous serez redirigé vers la page de connexion. 
                Toutes vos sessions seront fermées.
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
            onClick={handleLogout}
            disabled={Loading}
            className="flex gap-2 justify-center items-center bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-2.5 cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LogOut size={18} className="text-red-500" />
            <p className="text-red-500 font-medium">
              {Loading ? "Déconnexion..." : "Se déconnecter"}
            </p>
          </button>
        </div>
      </motion.div>
    </Modal>
  );
};

export default LogOutModal;
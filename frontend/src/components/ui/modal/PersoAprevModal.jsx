import { useEffect, useState } from "react";
import Modal from "../Modal";
import { motion } from "framer-motion";
import {toast} from 'sonner'
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Phone, Save, User, X } from "lucide-react";
import persoA from "../../../api/demandeur/persoA";

const PersoAprevModal = ({ setOpenPa, id, onSuccess }) => {
  const queryClient = useQueryClient();
  const [user_id, setUserId] = useState();
  const [nom, setNom] = useState();
  const [prenom, setPrenom] = useState();
  const [telephone, setTelephone] = useState();

  useEffect(() => {
    setUserId(id);
  }, [id]);

  const persoMutation = useMutation({
    mutationKey: ["postPersoA"],
    mutationFn: ({ user_id, nom, prenom, telephone }) => persoA(user_id, nom, prenom, telephone),
    onSuccess: () => {
      toast.success("Personne a prevenir ajoute avec success");
      queryClient.invalidateQueries({ queryKey: ["getDemandeur"] });
      queryClient.invalidateQueries({ queryKey: ["demandeurDetail", id] });
      if (onSuccess) {
        onSuccess();
      }
      setOpenPa(false);
    },
    onError: (error) => {
      toast.error(error.message || 'Le traitement de votre demande n’a pas pu aboutir. Veuillez réessayer ultérieurement. lors de l\'ajout de la personne a prevenir');
    }
  });

  const HandlePersoA = () => {
    if (!user_id || !nom || !prenom || !telephone) {
      toast.error("Tous les champs doivent etre remplis");
      return;
    }
    persoMutation.mutate({ user_id, nom, prenom, telephone });
  };
  
  return (
    <Modal>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.1, ease: "easeOut" }}
        layout
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-4 "
      >
        <div className="flex flex-row justify-between items-center m-2">
          <h2 className="text-sm font-black dark:text-gray-100">
            Ajouter une personne a prevenir
          </h2>
          <div className="h-10 w-10 flex items-center justify-center rounded-full shadow hover:bg-amber-50 dark:hover:bg-amber-950">
            <X
              className="text-red-500 dark:text-red-400 cursor-pointer hover:text-red-600 dark:hover:text-red-300"
              onClick={() => setOpenPa(false)}
            />
          </div>
        </div>

        <div className="items-center grid sm:grid-cols-2 gap-1">
          <div className="flex flex-col">
            <label htmlFor="" className="p-1 dark:text-gray-300">Nom</label>
            <div className="flex items-center gap-1 border rounded border-gray-200 dark:border-gray-700">
              <User className="ml-2 text-gray-500 dark:text-gray-400" />
              <div className="border-r-2 border-gray-200 dark:border-gray-700 h-10 ml-2"></div>
              <input
                type="text"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                placeholder="Ex : Kabore"
                className="p-2 w-full bg-white dark:bg-gray-800 dark:text-gray-200 dark:placeholder-gray-500"
              />
            </div>
          </div>

          <div className="flex flex-col">
            <label htmlFor="" className="p-1 dark:text-gray-300">Prenom</label>
            <div className="flex items-center gap-1 border rounded border-gray-200 dark:border-gray-700">
              <User className="ml-2 text-gray-500 dark:text-gray-400" />
              <div className="border-r-2 border-gray-200 dark:border-gray-700 h-10 ml-2"></div>
              <input
                type="text"
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
                placeholder="Ex : Ousmane"
                className="p-2 w-full bg-white dark:bg-gray-800 dark:text-gray-200 dark:placeholder-gray-500"
              />
            </div>
          </div>
        </div>

        <div className="mt-2">
          <label htmlFor="" className="p-1 dark:text-gray-300">Numero de telephone <span className="text-sm text-red-600 dark:text-red-400"> (sans 223)</span></label>
          <div className="flex items-center gap-1 border rounded border-gray-200 dark:border-gray-700 m-1">
            <Phone className="ml-2 text-gray-500 dark:text-gray-400" />
            <div className="border-r-2 border-gray-200 dark:border-gray-700 h-10 ml-2"></div>
            <input
              type="text"
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
              placeholder="Ex : 78900909"
              className="p-2 w-full bg-white dark:bg-gray-800 dark:text-gray-200 dark:placeholder-gray-500"
            />
          </div>
        </div>

        <div className="items-center grid sm:grid-cols-2 gap-4 mt-10">
          <button
            className="flex border justify-center items-center p-2 border-gray-300 dark:border-gray-600 rounded cursor-pointer bg-gray-100 dark:bg-gray-800"
            onClick={() => setOpenPa(false)}
          >
            <p className="tex-sm text-gray-500 dark:text-gray-400 font-black">Annuler</p>
          </button>

          <button
            onClick={HandlePersoA}
            disabled={persoMutation.isPending}
            className="flex border justify-center items-center p-2 border-white rounded cursor-pointer bg-[#14B53A] dark:bg-green-700 gap-2 disabled:opacity-50"
          >
            <Save size={18} className="text-white" />
            <p className="text-sm font-black text-white">
              {persoMutation.isPending ? "Enregistrement..." : "Enregistrer"}
            </p>
          </button>
        </div>
      </motion.div>
    </Modal>
  );
};

export default PersoAprevModal;
import { motion } from "framer-motion";
import Modal from "../Modal";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Save, X } from "lucide-react"; // ou tout autre icône
import detailCentre from "../../../api/admin/detailCentre";
import updateCentre from "../../../api/admin/updateCentre";
import { toast } from "sonner";
const UpdateCentreModal = ({ id, setOpen }) => {
  const queryClient = useQueryClient();


  const { data, isLoading, error } = useQuery({
    queryKey: ["centre", id],
    queryFn: () => detailCentre(id),
    enabled: !!id,
  });


  const [formData, setFormData] = useState({
    nom: "",
    region: "",
    province: "",
    commune: "",
    capacite_journaliere: 0,
    statut: true,
  });


  useEffect(() => {
    if (data?.data) {
      setFormData({
        nom: data.data.nom || "",
        region: data.data.region || "",
        province: data.data.province || "",
        commune: data.data.commune || "",
        capacite_journaliere: data.data.capacite_journaliere || 0,
        statut: data.data.statut !== undefined ? data.data.statut : true,
      });
    }
  }, [data]);

  // Mutation de mise à jour
  const mutation = useMutation({
 mutationFn: (updatedData) => updateCentre(id, updatedData),
    onSuccess: () => {
      queryClient.invalidateQueries(["centres"]);
      queryClient.invalidateQueries(["centre", id]);
      toast.success('Centre modifier avec succes')
      setOpen(false);
    },
    onError: (err) => {
      console.log("Erreur lors de la mise à jour :", err);
      toast.error("Le traitement de votre demande n’a pas pu aboutir. Veuillez réessayer ultérieurement.. Veuillez réessayer.");
    },
  });


  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };


  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

//   if (isLoading) {
//     return (
//       <Modal>
//         <div className="p-6 text-center">Chargement des données...</div>
//       </Modal>
//     );
//   }

//   if (error) {
//     return (
//       <Modal>
//         <div className="p-6 text-center text-red-500">
//           Erreur : {error.message}
//         </div>
//       </Modal>
//     );
//   }

  return (
    <Modal>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        layout
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        {/* En-tête */}
        <div className="flex justify-between items-start p-6">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Modifier le Centre
            </h1>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              ID : <span className="font-medium dark:text-gray-300">{id}</span>
            </p>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full h-9 w-9 flex justify-center items-center transition-colors shadow"
          >
            <X size={18} className="text-red-500 dark:text-red-400" />
          </button>
        </div>

        <div className="border-t border-gray-100 dark:border-gray-800" />


        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Nom *
              </label>
              <input
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
            
                required
                className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 dark:text-white text-black"
              />
            </div>


            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Région *
              </label>
              <input
                type="text"
                name="region"
                value={formData.region}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500  dark:text-white text-black"
              />
            </div>


            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Province *
              </label>
              <input
                type="text"
                name="province"
                value={formData.province}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 dark:text-white text-black"
              />
            </div>


            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Commune *
              </label>
              <input
                type="text"
                name="commune"
                value={formData.commune}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 dark:text-white text-black"
              />
            </div>


            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Capacité journalière *
              </label>
              <input
                type="number"
                name="capacite_journaliere"
                value={formData.capacite_journaliere}
                onChange={handleChange}
                required
                min="0"
                className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 dark:text-white text-black"
              />
            </div>


            <div className="flex items-center space-x-3 pt-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Statut
              </label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="statut"
                  checked={formData.statut}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#14B53A]"></div>
                <span className="ml-3 text-sm text-gray-500 dark:text-gray-400">
                  {formData.statut ? "Actif" : "Inactif"}
                </span>
              </label>
            </div>
          </div>


          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition flex  items-center gap-1.5 cursor-pointer"
            >
            <X size={16}/>
              <p>Annuler</p>
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-[#14B53A] rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {mutation.isPending ? 
            ( 
                <div className="flex gap-1.5 items-center"> 
                   <Loader2 size={16} className="animate-spin"/>
                   <p>Mise à jour...</p>
                </div>
                 
                ) : 
             ( 
                  <div className="flex gap-1.5 items-center"> 
                   <Save size={16} className=""/>
                   <p>Mettre a jour</p>
                </div>
             ) }
            </button>
          </div>
        </form>
      </motion.div>
    </Modal>
  );
};

export default UpdateCentreModal;
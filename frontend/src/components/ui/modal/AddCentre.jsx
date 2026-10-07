import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Modal from "../Modal";
import { X, Loader2, Building2, MapPin, Users, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import createCentre from "../../../api/admin/createCentre"; // à adapter selon votre fichier

const Addcentre = ({ setOpen }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    nom: "",
    region: "",
    province: "",
    commune: "",
    capacite_journaliere: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Effacer l'erreur du champ quand l'utilisateur modifie
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.nom.trim()) newErrors.nom = "Le nom est requis";
    if (!formData.region.trim()) newErrors.region = "La région est requise";
    if (!formData.province.trim()) newErrors.province = "La province est requise";
    if (!formData.commune.trim()) newErrors.commune = "La commune est requise";
    if (!formData.capacite_journaliere) {
      newErrors.capacite_journaliere = "La capacité journalière est requise";
    } else if (isNaN(formData.capacite_journaliere) || parseInt(formData.capacite_journaliere) <= 0) {
      newErrors.capacite_journaliere = "Veuillez entrer un nombre valide (supérieur à 0)";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const createMutation = useMutation({
    mutationKey: ["createCentre"],
    mutationFn: (data) => createCentre(data),
    onSuccess: () => {
      toast.success("Centre créé avec succès");
      queryClient.invalidateQueries({ queryKey: ["centres"] });
      setOpen(false);
    },
    onError: (error) => {
      toast.error(error.message || "Le traitement de votre demande n’a pas pu aboutir. Veuillez réessayer ultérieurement. lors de la création");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    // Convertir la capacité en nombre
    const payload = {
      ...formData,
      capacite_journaliere: parseInt(formData.capacite_journaliere),
    };
    createMutation.mutate(payload);
  };

  const isLoading = createMutation.isPending;

  return (
    <Modal>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto "
      >
        {/* En-tête */}
        <div className="flex justify-between items-start p-6">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Ajouter un centre
            </h1>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Remplissez les informations du nouveau centre
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

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Nom */}
          <div>
            <label htmlFor="nom" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nom du centre <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Building2 size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              <input
                id="nom"
                name="nom"
                type="text"
                value={formData.nom}
                onChange={handleChange}
                placeholder="Ex: Centre DNEC de Bamako"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border ${errors.nom ? "border-red-500" : "border-gray-200 dark:border-gray-700"} bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition`}
                disabled={isLoading}
              />
            </div>
            {errors.nom && <p className="mt-1 text-xs text-red-500">{errors.nom}</p>}
          </div>

          {/* Région, Province, Commune (3 colonnes) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="region" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Région <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                <input
                  id="region"
                  name="region"
                  type="text"
                  value={formData.region}
                  onChange={handleChange}
                  placeholder="Ex: Centre"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border ${errors.region ? "border-red-500" : "border-gray-200 dark:border-gray-700"} bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition`}
                  disabled={isLoading}
                />
              </div>
              {errors.region && <p className="mt-1 text-xs text-red-500">{errors.region}</p>}
            </div>

            <div>
              <label htmlFor="province" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Province <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                <input
                  id="province"
                  name="province"
                  type="text"
                  value={formData.province}
                  onChange={handleChange}
                  placeholder="Ex: Kadiogo"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border ${errors.province ? "border-red-500" : "border-gray-200 dark:border-gray-700"} bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition`}
                  disabled={isLoading}
                />
              </div>
              {errors.province && <p className="mt-1 text-xs text-red-500">{errors.province}</p>}
            </div>

            <div>
              <label htmlFor="commune" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Commune <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                <input
                  id="commune"
                  name="commune"
                  type="text"
                  value={formData.commune}
                  onChange={handleChange}
                  placeholder="Ex: Bamako"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border ${errors.commune ? "border-red-500" : "border-gray-200 dark:border-gray-700"} bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition`}
                  disabled={isLoading}
                />
              </div>
              {errors.commune && <p className="mt-1 text-xs text-red-500">{errors.commune}</p>}
            </div>
          </div>

          {/* Capacité journalière */}
          <div>
            <label htmlFor="capacite_journaliere" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Capacité journalière <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Users size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              <input
                id="capacite_journaliere"
                name="capacite_journaliere"
                type="number"
                min="1"
                value={formData.capacite_journaliere}
                onChange={handleChange}
                placeholder="Ex: 100"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border ${errors.capacite_journaliere ? "border-red-500" : "border-gray-200 dark:border-gray-700"} bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition`}
                disabled={isLoading}
              />
            </div>
            {errors.capacite_journaliere && <p className="mt-1 text-xs text-red-500">{errors.capacite_journaliere}</p>}
          </div>

          {/* Boutons */}
          <div className="border-t border-gray-100 dark:border-gray-800 pt-5 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setOpen(false)}
              disabled={isLoading}
              className="flex gap-2 justify-center items-center border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition disabled:opacity-50"
            >
              <X size={18} className="text-gray-500 dark:text-gray-400" />
              <p className="text-gray-600 dark:text-gray-400">Annuler</p>
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="flex gap-2 justify-center items-center bg-[#14B53A] dark:bg-green-700 border border-[#14B53A] dark:border-green-700 rounded-xl px-6 py-2.5 cursor-pointer hover:bg-green-700 dark:hover:bg-green-800 transition disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 size={18} className="animate-spin text-white" />
              ) : (
                <Building2 size={18} className="text-white" />
              )}
              <p className="text-white font-medium">
                {isLoading ? "Création..." : "Ajouter"}
              </p>
            </button>
          </div>
        </form>
      </motion.div>
    </Modal>
  );
};

export default Addcentre;
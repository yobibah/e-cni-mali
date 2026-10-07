import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Modal from "../Modal";
import { motion } from "framer-motion";
import GetRole from "../../../api/admin/getRole";
import { useState } from "react";
import { Save, X } from "lucide-react";
import { toast } from "sonner";
import createUser from "../../../api/admin/createUser";

const statutCompte = ["ACTIF", "INACTIF", "SUSPENDU"];
const genres = ["MASCULIN", "FEMININ"];

const inp = (active, name) =>
  `w-full px-3 py-2 text-sm border rounded-md outline-none transition-all ${
    active === name
      ? "border-[#14B53A] ring-1 ring-green-200 bg-white dark:bg-gray-700 dark:ring-green-800 dark:border-green-500"
      : "border-gray-200 bg-gray-50 hover:border-gray-300 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 dark:hover:border-gray-500"
  }`;



const AddUser = ({ setOpen }) => {
  const [active, setActive] = useState("");
  const [form, setForm] = useState({
    nom: "", prenom: "", email: "",
    telephone: "", mot_de_passe: "", date_naissance: "",
    lieux_naissance: "", prenom_pere: "", prenom_mere: "",
    profession: "", genre: "", statut: "INACTIF",
    role: "", numero_act: "", commune_acte: "", date_acte: "",
    numero_certificat: "", tribunal: "", ville: "", secteur: "",
  });

    const queryClient = useQueryClient();

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));
  const f = (name) => ({ value: form[name], onChange: set(name), onFocus: () => setActive(name), onBlur: () => setActive(""), className: inp(active, name) });

  const roles = useQuery({ queryKey: ["getRoles"], queryFn: GetRole });

  const addMutation = useMutation({
    mutationKey:['AddUser'],
    mutationFn: (form)=> createUser(form),
    onSuccess : () =>{
      toast.success('Utilisateur ajouter avec success');
       queryClient.invalidateQueries({ queryKey: ["getDemandeur"] });
    },
    onError : () =>{
      toast.error('Le traitement de votre demande n’a pas pu aboutir. Veuillez réessayer ultérieurement. lors de la creation ')
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // const now = new Date().getFullYear();
    
    if(!form){
      toast.error('Les donnees sont invalides');
      return;
    }

    // if((now - (new Date(form.date_naissance).getFullYear()))<15){
    //       toast.info("L'age minimale pour demander une carte national est de 15 ans");
    // }

    // console.log(form)

    addMutation.mutate(form);
   
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
        <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <h1 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Nouvel utilisateur</h1>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
          >
            <X size={15} className="text-red-400 dark:text-red-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">

          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#14B53A] dark:text-green-400 mb-3">Identité</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input placeholder="Nom*" {...f("nom")} required />
              <input placeholder="Prénom(s)*" {...f("prenom")} required />
              <select {...f("genre")} required>
                <option value="">Genre</option>
                {genres.map((g) => <option key={g}>{g}</option>)}
              </select>
              <input type="date" placeholder="Date de naissance*" required {...f("date_naissance")} />
              <input placeholder="Lieu de naissance*" {...f("lieux_naissance")} required />
              <input placeholder="Prénom du père*" {...f("prenom_pere")} required />
              <input placeholder="Prénom de la mère*" {...f("prenom_mere")} required />
              <input placeholder="Profession* " {...f("profession")} required className={`${inp(active, "profession")} sm:col-span-2`} onFocus={() => setActive("profession")} onBlur={() => setActive("")} onChange={set("profession")} value={form.profession} />
            </div>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#14B53A] dark:text-green-400 mb-3">Documents</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input placeholder="N° acte de naissance*" required {...f("numero_act")} />
              <input placeholder="Commune*" {...f("commune_acte")} required />
              <input type="date" {...f("date_acte")} />
              <input placeholder="N° certificat nationalité" {...f("numero_certificat")} />
              <input placeholder="Tribunal" {...f("tribunal")} className={`${inp(active, "tribunal")} sm:col-span-2`} onFocus={() => setActive("tribunal")} onBlur={() => setActive("")} onChange={set("tribunal")} value={form.tribunal} />
            </div>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#14B53A] dark:text-green-400 mb-3">Adresse</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input placeholder="Ville*" {...f("ville")} required />
              <input placeholder="Secteur / Quartier" {...f("secteur")} />
            </div>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#14B53A] dark:text-green-400 mb-3">Compte</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input type="email" placeholder="Email" {...f("email")} />
              <input type="tel" placeholder="Téléphone*" {...f("telephone")} required />
              <input type="password" placeholder="Mot de passe" {...f("mot_de_passe")} />
              <select {...f("role")}>
                <option value="">Rôle</option>
                {roles.data?.data.map((r) => <option key={r.id} value={r.id}>{r.libelle.toLowerCase()}</option>)}
              </select>
              <select {...f("statut")} className={`${inp(active, "statut")} sm:col-span-2`} onFocus={() => setActive("statut")} onBlur={() => setActive("")}>
                {statutCompte.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="flex justify-between gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-4 py-2 text-sm text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-colors flex gap-2 bg-red-50 dark:bg-red-950 items-center justify-center border border-red-200 dark:border-red-800 rounded w-full cursor-pointer"
            >
                <X size={16}/>
             <p className=""> Annuler</p>
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-semibold text-white bg-[#14B53A] hover:bg-green-800 dark:bg-green-700 dark:hover:bg-green-900 rounded transition-colors w-full flex justify-center items-center gap-2 cursor-pointer"
            >
                <Save size={16} />
              <p>Sauvegarder</p>
            </button>
          </div>

        </form>
      </motion.div>
    </Modal>
  );
};

export default AddUser;
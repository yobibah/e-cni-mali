import { useState, useEffect } from "react";
import {
  X,
  Save,
  User,
  BadgeInfoIcon,
  ShieldCheck,
  FileText,
  ArrowDownUp,
  Plus,
  PenBoxIcon,
  Trash2,
  ChevronDown,
  ChevronUp,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import Modal from "../Modal";
import { easeIn, motion } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import PersoAprevModal from "./PersoAprevModal";
// import setStatus from "../../../api/admin/seStatus";
import UpdateStatus from "../../../api/admin/UpdateStatus";
import { toast } from "sonner";
import DemandeurDetail from "../../../api/admin/demandeurDetail";
import DemandeurDems from "../../../api/admin/demandeDemandeur";
import UpdatePassword from "../../../api/admin/UpdatePassword"; // À créer
import UpdateUerProfil from "../../../api/admin/updateUserProfil";
import updateUserAdresse from "../../../api/admin/updateUserAdresse";

const UpdateModal = ({ id_deman, setOpen, onUpdate }) => {
  const queryClient = useQueryClient();
  const [forma, setForma] = useState(null);
  const [active, setActive] = useState("profil");
  const [persoA, setOpenPa] = useState(false);
  const [openDemande, setOpenDemande] = useState(null);
  const [demData, setDemdata] = useState();
  
  // États pour la gestion du mot de passe
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
    showNewPassword: false,
    showConfirmPassword: false,
  });
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    message: "",
    color: "",
  });

  const ModifMutation = useMutation({
    mutationKey: ["ModificationUti"],
    mutationFn: DemandeurDetail,
    onSuccess: (response) => {
      setForma({
        ...response,
        date_naissance: response?.date_naissance?.split("T")[0] || "",
        date_acte: response?.date_acte?.split("T")[0] || "",
        roles: response?.roles?.map((r) => r.role.libelle) || [],
        personnesAprev: response?.personnesPrevenir || [],
      });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  ///
  // console.log(forma)
  ///

  const handleModifModal = () => {
    if (!id_deman) {
      toast.error("Les références de l'utilisateur sont manquantes");
      return;
    }
    ModifMutation.mutate(id_deman);
  };

  useEffect(() => {
    handleModifModal();
  }, [id_deman]);

  const isdemandeur = forma?.roles?.includes("DEMANDEUR") || false;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForma((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Gestion des changements de mot de passe
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "newPassword") {
      evaluatePasswordStrength(value);
    }
  };

  // Évaluation de la force du mot de passe
  const evaluatePasswordStrength = (password) => {
    let score = 0;
    let message = "";
    let color = "";

    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    if (score <= 2) {
      message = "Faible";
      color = "text-red-500";
    } else if (score <= 4) {
      message = "Moyen";
      color = "text-orange-500";
    } else {
      message = "Fort";
      color = "text-green-500";
    }

    setPasswordStrength({ score, message, color });
  };

  const togglePasswordVisibility = (field) => {
    setPasswordData((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  // Mutation pour la mise à jour du mot de passe
  const passwordMutation = useMutation({
    mutationKey: ["updatePassword"],
    mutationFn: UpdatePassword,
    onSuccess: () => {
      toast.success(`Le mot de passe de ${forma?.nom} a été mis à jour avec succès`);
      setPasswordData({
        newPassword: "",
        confirmPassword: "",
        showNewPassword: false,
        showConfirmPassword: false,
      });
      setPasswordStrength({ score: 0, message: "", color: "" });
    },
    onError: (error) => {
      toast.error(error.message || "Erreur lors de la mise à jour du mot de passe");
    },
  });

  const handlePasswordUpdate = () => {
    // Validation
    if (!passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }

    const data = {   userId:id_deman.toLowerCase(), newPassword: passwordData.newPassword,}
  
    passwordMutation.mutate(
  data
    );
  };

  // const updateMutation = useMutation({
  //   mutationKey: ["updateDemandeur"],
  //   mutationFn: updateDemandeur,
  //   onSuccess: () => {
  //     toast.success(`Les informations de ${forma?.nom} ont été mises à jour`);
  //     queryClient.invalidateQueries({ queryKey: ["getDemandeur"] });
  //     queryClient.invalidateQueries({ queryKey: ["demandeurDetail", id_deman] });
  //     if (onUpdate) {
  //       onUpdate();
  //     }
  //     setOpen(false);
  //   },
  //   onError: (error) => {
  //     toast.error(error.message || "Erreur lors de la mise à jour");
  //   },
  // });

  const handleSave = () => {
    if (!forma) return;
    // updateMutation.mutate(forma);
    // console.table(forma);
  };

  const statutMutate = useMutation({
    mutationKey: ["switchStatus"],
    mutationFn: ({ demandeur_id }) => UpdateStatus(demandeur_id),
    onSuccess: () => {
      toast.success(`Le statut de ${forma?.nom} a été modifié`);
      queryClient.invalidateQueries({ queryKey: ["getDemandeur"] });
      queryClient.invalidateQueries({ queryKey: ["demandeurDetail", id_deman] });
      ModifMutation.mutate(id_deman);
      if (onUpdate) {
        onUpdate();
      }
    },
    onError: () => {
      toast.error(`Le statut de ${forma?.nom} n'a pas été mis à jour`);
    },
  });

  const handleModifStatus = () => {
    if (!forma?.id) {
      toast.error("Utilisateur introuvable");
      return;
    }
    statutMutate.mutate({
      demandeur_id: forma.id,
    });
  };

  const handleDeletePersonne = (personneId) => {
    // Appel API pour supprimer la personne
    queryClient.invalidateQueries({ queryKey: ["getDemandeur"] });
    queryClient.invalidateQueries({ queryKey: ["demandeurDetail", id_deman] });
    queryClient.invalidateQueries({queryKey:['ModificationUti']});
    ModifMutation.mutate(id_deman);
    toast.success("Personne supprimée avec succès");
  };

  const demandedem = useMutation({
    mutationKey: ['demande'],
    mutationFn: DemandeurDems,
    onSuccess: (response) => {
      // setDemdata(response);
      // console.log('la reponse '+response)
    }
  });

  const handleDemande = () => {
    const demandeur_id = forma?.id;
    demandedem.mutate(demandeur_id);
  };

  // console.log(demData);

  // metttre a jour le profile , les infos liees a l'adress et le mots de passes

  const ProfileMutattion =  useMutation({
    mutationKey:['profileUpdate'],
    mutationFn: (data)=>UpdateUerProfil(data),
    onSuccess :()=>{
      toast.success('Profile mise jour');
       queryClient.invalidateQueries({ queryKey: ["getDemandeur"] });
    queryClient.invalidateQueries({ queryKey: ["demandeurDetail", id_deman] });
    },
    onError : () =>{
      toast.error('Profile pas mise a jour')
    }

  });

  const handleSubmitProfil =  () =>{
    const data = {
      id: id_deman.toLowerCase(),
      nom : forma.nom ,prenom:forma.prenom,date_naissance:forma.date_naissance,lieux_naissance:forma.lieux_naissance,genre:forma.genre,profession:forma.profession,prenom_pere:forma.prenom_pere,prenom_mere:forma.prenom_mere,
      roles: forma.roles
    }

    // console.log(data)

    ProfileMutattion.mutate(data);

  };

  // Mutation pour la mise à jour de l'adresse et des contacts
  const AdresseMutattion = useMutation({
    mutationKey: ['adresseUpdate'],
    mutationFn: (data) => updateUserAdresse(data),
    onSuccess: () => {
      toast.success('Adresse et contacts mis à jour');
      queryClient.invalidateQueries({ queryKey: ["getDemandeur"] });
      queryClient.invalidateQueries({ queryKey: ["demandeurDetail", id_deman] });
    },
    onError: () => {
      toast.error('Adresse et contacts non mis à jour');
    }
  });

  const handleSubmitAdresse = () => {
    const data = {
      id: id_deman.toLowerCase(),
      telephone: forma.telephone,
      email: forma.email,
      commune_acte: forma.commune_acte,
      numero_acte: forma.numero_acte,
      tribunal: forma.tribunal,
      numero_certificat: forma.numero_certificat
    };

     console.log(data)

    AdresseMutattion.mutate(data);
  };

  // const MotdePasseMutattion =  useMutation({

  // });

  // const handleSubmitmdp =  () =>{

  // };

  // États pour la gestion des rôles
const [selectedRole, setSelectedRole] = useState("");
const [availableRoles, setAvailableRoles] = useState(["DEMANDEUR", "ADMIN", "AGENT"]);

// Fonction pour ajouter un rôle
const handleAddRole = () => {
  if (!selectedRole) return;
  
  // Vérifier si le rôle existe déjà
  if (forma.roles && forma.roles.includes(selectedRole)) {
    toast.warning("Ce rôle est déjà assigné à l'utilisateur");
    return;
  }
  
  // Ajouter le rôle
  setForma({
    ...forma,
    roles: [...(forma.roles || []), selectedRole]
  });
  
  // Réinitialiser la sélection
  setSelectedRole("");
};

// Fonction pour supprimer un rôle
const handleRemoveRole = (index) => {
  const updatedRoles = forma.roles.filter((_, i) => i !== index);
  setForma({
    ...forma,
    roles: updatedRoles
  });
};
  return (
    <Modal>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.30, ease: "easeOut" }}
        // exit={{
        //   opacity:0,
        //   scale:3
        //  }}
        layout
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-4 "
      >
        <div className="flex flex-row items-center justify-between mr-2">
          <div className="flex flex-row justify-center items-center gap-2">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex justify-center items-center">
              <p className="text-2xl font-black text-green-900 dark:text-green-400">
                {forma?.nom?.[0]?.toUpperCase()}
                {forma?.prenom?.[0]?.toUpperCase()}
              </p>
            </div>

            <div>
              <p className="text-lg font-black dark:text-gray-100">
                {forma?.nom} {forma?.prenom}
              </p>

              <div className="flex flex-row gap-2 p-1">
                {Array.isArray(forma?.roles) &&
                  forma.roles.map((r, i) => (
                    <div
                      key={i}
                      className="flex bg-green-100 dark:bg-green-900/30 border border-green-800 dark:border-green-700 rounded-xl items-center justify-center gap-1 p-0.5"
                    >
                      <p className="text-[11.5px] p-1 font-black text-green-800 dark:text-green-400">
                        {r.toLowerCase()}
                      </p>
                    </div>
                  ))}

                <div
                  className={`flex ${
                    forma?.statut === "ACTIF"
                      ? "bg-green-100 dark:bg-green-900/30 border border-green-800 dark:border-green-700"
                      : "bg-red-100 dark:bg-red-900/30 border border-red-800 dark:border-red-700"
                  } rounded-xl items-center justify-center p-0.5`}
                >
                  <div
                    className={`h-2 w-2 ml-1 ${
                      forma?.statut === "ACTIF"
                        ? "bg-[#14B53A] dark:bg-green-400"
                        : "bg-red-600 dark:bg-red-400"
                    } rounded-full animate-pulse`}
                  ></div>

                  <p
                    className={`text-[11.5px] p-1 mr-1 font-black ${
                      forma?.statut === "ACTIF"
                        ? "text-[#14B53A] dark:text-green-400"
                        : "text-red-400 dark:text-red-400"
                    }`}
                  >
                    {forma?.statut?.toLowerCase()}
                  </p>
                </div>
              </div>

              <p className="text-[11px]  dark:text-gray-400">Reference : {forma?.id}</p>
            </div>
          </div>

          <div className="h-10 w-10 flex items-center justify-center rounded-full shadow hover:bg-amber-50 dark:hover:bg-amber-950">
            <X
              className="text-red-500 dark:text-red-400 cursor-pointer hover:text-red-600 dark:hover:text-red-300"
              onClick={() => setOpen(false)}
            />
          </div>
        </div>

        <div className="border-b border-gray-200 dark:border-gray-800 mt-3"></div>

        <div className="grid grid-cols-4 mt-2 items-center place-content-center">
          <button
            className="flex flex-col items-center gap-1 cursor-pointer"
            onClick={() => setActive("profil")}
          >
            <User
              className={active === "profil" ? "text-[#14B53A] dark:text-green-400" : "text-gray-500 dark:text-gray-400"}
              size={20}
            />
            <p
              className={`text-[12px] font-black ${
                active === "profil" ? "text-[#14B53A] dark:text-green-400" : "text-gray-500 dark:text-gray-400"
              }`}
            >
              Profil
            </p>
            {active === "profil" && (
              <div className="border w-24 border-green-500 dark:border-green-400"></div>
            )}
          </button>

          <button
            className="flex flex-col items-center gap-1 cursor-pointer"
            onClick={() => setActive("adresse")}
          >
            <BadgeInfoIcon
              className={active === "adresse" ? "text-[#14B53A] dark:text-green-400" : "text-gray-500 dark:text-gray-400"}
              size={20}
            />
            <p
              className={`text-[12px] font-black ${
                active === "adresse" ? "text-[#14B53A] dark:text-green-400" : "text-gray-500 dark:text-gray-400"
              }`}
            >
              Adresse & Contact
            </p>
            {active === "adresse" && (
              <div className="border w-24 border-green-500 dark:border-green-400"></div>
            )}
          </button>

          {isdemandeur && (
            <button
              className="flex flex-col items-center gap-1 cursor-pointer"
              onClick={() => { setActive("demande"); handleDemande(); }}
            >
              <FileText
                className={active === "demande" ? "text-[#14B53A] dark:text-green-400" : "text-gray-500 dark:text-gray-400"}
                size={20}
              />
              <p
                className={`text-[12px] font-black ${
                  active === "demande" ? "text-[#14B53A] dark:text-green-400" : "text-gray-500 dark:text-gray-400"
                }`}
              >
                Demande({demData?.length ?? 0})
              </p>
              {active === "demande" && (
                <div className="border w-24 border-green-500 dark:border-green-400"></div>
              )}
            </button>
          )}

          <button
            className="flex flex-col items-center gap-1 cursor-pointer"
            onClick={() => setActive("securite")}
          >
            <ShieldCheck
              className={active === "securite" ? "text-[#14B53A] dark:text-green-400" : "text-gray-500 dark:text-gray-400"}
              size={20}
            />
            <p
              className={`text-[12px] font-black ${
                active === "securite" ? "text-[#14B53A] dark:text-green-400" : "text-gray-500 dark:text-gray-400"
              }`}
            >
              securite
            </p>
            {active === "securite" && (
              <>
              <div className="border w-24 border-green-500 dark:border-green-400"></div>

                 <div className="flex w-full"></div>
                  </>
            )}
          </button>
        </div>

        <div className="border-b border-gray-200 dark:border-gray-800"></div>

        <div className="flex flex-col items-center">
         {active === "profil" && forma && (
  <>   
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 m-5 w-full max-w-2xl">
      <div className="flex flex-col">
        <label className="text-sm font-black dark:text-gray-300">Nom</label>
        <input
          type="text"
          name="nom"
          value={forma.nom || ""}
          onChange={handleChange}
          className="border p-2 rounded border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
        />
      </div>

      <div className="flex flex-col">
        <label className="text-sm font-black dark:text-gray-300">Prenom</label>
        <input
          type="text"
          name="prenom"
          value={forma.prenom || ""}
          onChange={handleChange}
          className="border p-2 rounded border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
        />
      </div>

      <div className="flex flex-col">
        <label className="text-sm font-black dark:text-gray-300">Date de naissance</label>
        <input
          type="date"
          name="date_naissance"
          value={forma.date_naissance || ""}
          onChange={handleChange}
          className="border p-2 rounded border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
        />
      </div>

      <div className="flex flex-col">
        <label className="text-sm font-black dark:text-gray-300">Lieu de naissance</label>
        <input
          type="text"
          name="lieux_naissance"
          value={forma.lieux_naissance || ""}
          onChange={handleChange}
          className="border p-2 rounded border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
        />
      </div>

      <div className="flex flex-col">
        <label className="text-sm font-black dark:text-gray-300">Genre</label>
        <select
          name="genre"
          value={forma.genre || "HOMME"}
          onChange={handleChange}
          className="border p-2 rounded border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
        >
          <option value="HOMME">Homme</option>
          <option value="FEMME">Femme</option>
        </select>
      </div>

      <div className="flex flex-col">
        <label className="text-sm font-black dark:text-gray-300">Profession</label>
        <input
          type="text"
          name="profession"
          value={forma.profession || ""}
          onChange={handleChange}
          className="border p-2 rounded border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
        />
      </div>

      <div className="flex flex-col">
        <label className="text-sm font-black dark:text-gray-300">Nom du pere</label>
        <input
          type="text"
          name="prenom_pere"
          value={forma.prenom_pere || ""}
          onChange={handleChange}
          className="border p-2 rounded border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
        />
      </div>

      <div className="flex flex-col">
        <label className="text-sm font-black dark:text-gray-300">Nom de la mere</label>
        <input
          type="text"
          name="prenom_mere"
          value={forma.prenom_mere || ""}
          onChange={handleChange}
          className="border p-2 rounded border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
        />
      </div>

      {/* RÔLES MODIFIABLES AVEC SELECT */}
      <div className="flex flex-col md:col-span-2">
        <label className="text-sm font-black dark:text-gray-300">Rôles</label>
        <div className="flex flex-wrap gap-2 p-2 border rounded border-gray-200 dark:border-gray-700 dark:bg-gray-800 min-h-[42px]">
          {forma.roles && Array.isArray(forma.roles) && forma.roles.length > 0 ? (
            <div className="flex flex-wrap gap-2 w-full">
              {forma.roles.map((role, index) => (
                <div key={index} className="flex items-center gap-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full px-3 py-1">
                  <span className="text-sm font-medium">{role}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveRole(index)}
                    className="ml-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-lg leading-none"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <span className="text-gray-500 dark:text-gray-400">Aucun rôle assigné</span>
          )}
        </div>
        
        {/* Select pour ajouter un rôle */}
        <div className="flex gap-2 mt-2">
          <select
            value={selectedRole || ""}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="flex-1 border p-2 rounded border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
          >
            <option value="">Sélectionner un rôle</option>
            {availableRoles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleAddRole}
            disabled={!selectedRole}
            className="px-4 py-2 bg-green-500 dark:bg-[#14B53A] text-white rounded hover:bg-[#14B53A] dark:hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Ajouter
          </button>
        </div>
      </div>

      {/* Affichage du statut */}
      <div className="flex flex-col">
        <label className="text-sm font-black dark:text-gray-300">Statut</label>
        <div className="border p-2 rounded border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            forma.statut === "ACTIF" 
              ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200" 
              : forma.statut === "SUSPENDU"
              ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200"
              : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
          }`}>
            {forma.statut || "NON DEFINI"}
          </span>
        </div>
      </div>

      {/* Affichage du NUD */}
      <div className="flex flex-col">
        <label className="text-sm font-black dark:text-gray-300">NUD</label>
        <div className="border p-2 rounded border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200">
          {forma.nud || "Non défini"}
        </div>
      </div>
    </div>

    <div
      className={`items-center grid md:grid-cols-1 ${
        forma.statut !== "ACTIF" ? "lg:grid-cols-3" : "lg:grid-cols-2"
      } gap-3 p-3 dark:border-gray-800 w-full`}
    >
      <button
        onClick={() => setOpen(false)}
        className="px-4 py-2 rounded-xl bg-red-500 dark:bg-red-600 text-white cursor-pointer hover:bg-red-600 dark:hover:bg-red-700 transition-all"
      >
        Annuler
      </button>

      <button
        onClick={handleSubmitProfil}
        disabled={ProfileMutattion.isPending}
        className="px-4 py-2 bg-[#14B53A] dark:bg-green-700 text-white rounded-xl flex items-center justify-center gap-2 cursor-pointer hover:bg-green-700 dark:hover:bg-green-800 transition-all"
      >
        <Save size={16} />
        Sauvegarder
      </button>
    </div>
  </>
)}

          {active === "adresse" && forma && (
            <>
            <div className="flex flex-col w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 m-5">
                <div className="flex flex-col">
                  <label className="text-sm font-black dark:text-gray-300">Numero de telephone</label>
                  <input
                    type="text"
                    name="telephone"
                    value={forma.telephone || ""}
                    onChange={handleChange}
                    className="border p-2 rounded border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-sm font-black dark:text-gray-300">Adresse mail</label>
                  <input
                    type="email"
                    name="email"
                    value={forma.email || ""}
                    onChange={handleChange}
                    className="border p-2 rounded border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-sm font-black dark:text-gray-300">Commune acte</label>
                  <input
                    type="text"
                    name="commune_acte"
                    value={forma.commune_acte || ""}
                    onChange={handleChange}
                    className="border p-2 rounded border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-sm font-black dark:text-gray-300">Numéro acte</label>
                  <input
                    type="text"
                    name="numero_acte"
                    value={forma.numero_acte || ""}
                    onChange={handleChange}
                    className="border p-2 rounded border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-sm font-black dark:text-gray-300">Tribunal</label>
                  <input
                    type="text"
                    name="tribunal"
                    value={forma.tribunal || ""}
                    onChange={handleChange}
                    className="border p-2 rounded border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-sm font-black dark:text-gray-300">Certificat</label>
                  <input
                    type="text"
                    name="numero_certificat"
                    value={forma.numero_certificat || ""}
                    onChange={handleChange}
                    className="border p-2 rounded border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                  />
                </div>
              </div>

              <div className="border-b border-gray-200 dark:border-gray-800"></div>
              <div className="flex flex-col m-4">
                <h2 className="self-center dark:text-gray-200">Personne a prevenir</h2>

                {forma.personnesAprev?.length > 0 ? (
                  <div className="shadow">
                    {forma.personnesAprev.map((p, index) => (
                      <div key={index}>
                        <div className="border-b border-gray-200 dark:border-gray-800 mt-3"></div>
                        <div className="p-2 flex gap-2 justify-between items-center">
                          <div className="flex gap-2">
                            <div className="flex w-10 h-10 bg-green-100 dark:bg-green-900/50 items-center justify-center rounded-full">
                              <p className="text-lg font-black text-green-700 dark:text-green-400">
                                {p.nom?.[0]}
                                {p.prenom?.[0]}
                              </p>
                            </div>
                            <div className="">
                              <h2 className="text-md font-black dark:text-gray-200">
                                {p.nom} {p.prenom}
                              </h2>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {p.telephone}
                              </p>
                            </div>
                          </div>

                          <div className="grid sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-3 mr-6">
                            <button
                              onClick={() => handleDeletePersonne(p.id)}
                              className="cursor-pointer"
                            >
                              <Trash2 className="text-red-600 dark:text-red-400 hover:text-red-500" />
                            </button>
                          </div>
                        </div>
                        <div className="border-b border-gray-200 dark:border-gray-800 mb-3"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="self-center text-sm text-gray-500 dark:text-gray-400 font-light">
                    Vous n'avez pas de personne a prevenir
                  </p>
                )}

                <button
                  onClick={() => setOpenPa(true)}
                  className="flex gap-2 items-center justify-center p-2 mb-2 border border-gray-100 dark:border-gray-700 rounded bg-[#14B53A] hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 cursor-pointer"
                >
                  <Plus size={16} className="text-sm text-white font-black" />
                  <p className="text-sm text-white font-black">
                    Ajouter une personne a prevenir
                  </p>
                </button>
              </div>

              <div className="border-b border-gray-200 dark:border-gray-800"></div>
            </div>


                                  <div
            className={`items-center grid md:grid-cols-1 ${
              forma.statut !== "ACTIF" ? "lg:grid-cols-3" : "lg:grid-cols-2"
            } gap-3  p-3 dark:border-gray-800 w-full`}
          >
            {/* {forma.statut !== "ACTIF" && (
              <button
                onClick={handleModifStatus}
                disabled={statutMutate.isPending}
                className="px-4 py-2 border rounded-xl flex items-center justify-center gap-2 cursor-pointer border-gray-500 text-gray-500 dark:border-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 disabled:opacity-50 transition-all"
              >
                <ArrowDownUp size={16} />
                {statutMutate.isPending ? "Modification..." : "Modifier status"}
              </button>
            )} */}

            <button
              onClick={() => setOpen(false)}
              className="px-4 py-2 rounded-xl bg-red-500 dark:bg-red-600 text-white cursor-pointer hover:bg-red-600 dark:hover:bg-red-700 transition-all"
            >
              Annuler
            </button>

            <button
              onClick={handleSubmitAdresse}
              disabled={AdresseMutattion.isPending}
              className="px-4 py-2 bg-[#14B53A] dark:bg-green-700 text-white rounded-xl flex items-center justify-center gap-2 cursor-pointer hover:bg-green-700 dark:hover:bg-green-800 transition-all"
            >
              <Save size={16} />
              Sauvegarder
            </button>
          </div>
            </>
          )}

          {active === "demande" && (
            <div className="flex w-full">
              {Array.isArray(demData) && (
                <div className="grid sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-3 w-full p-3">
                  {demData.map((d) => {
                    const opened = openDemande === d.id;

                    return (
                      <div
                        key={d.id}
                        className="border border-gray-200 dark:border-gray-700 rounded-xl p-3 dark:bg-gray-800"
                      >
                        {/* Entête */}
                        <button
                          onClick={() =>
                            setOpenDemande(
                              opened ? null : d.id
                            )
                          }
                          className="w-full flex justify-between items-center cursor-pointer"
                        >
                          <div className="text-left">
                            <h1 className="font-black dark:text-gray-200">
                              {d.type_demande}
                            </h1>
                            <p
                              className={`text-sm ${
                                d.statut === "APPROUVEE"
                                  ? "text-[#14B53A] dark:text-green-400"
                                  : "text-orange-500 dark:text-orange-400"
                              }`}
                            >
                              {d.statut}
                            </p>
                          </div>
                          {opened ? (
                            <ChevronUp size={18} className="dark:text-gray-400" />
                          ) : (
                            <ChevronDown size={18} className="dark:text-gray-400" />
                          )}
                        </button>

                        {/* DETAILS */}
                        {opened && (
                          <div className="mt-3 space-y-2">
                            <div>
                              <p className="text-[13px] text-gray-400 dark:text-gray-500">
                                Date
                              </p>
                              <p className="font-black dark:text-gray-200">
                                {new Date(
                                  d.date_creation
                                ).toLocaleDateString("fr-FR")}
                              </p>
                            </div>

                            <div>
                              <p className="text-[13px] text-gray-400 dark:text-gray-500">
                                Paiement
                              </p>
                              <div className="flex justify-between">
                                <span className="dark:text-gray-300">
                                  {d.paiement?.montant}
                                  {" "}FCFA
                                </span>
                                <span
                                  className={`font-black ${
                                    d.paiement?.statut === "REUSSI"
                                      ? "text-[#14B53A] dark:text-green-400"
                                      : "text-red-500 dark:text-red-400"
                                  }`}
                                >
                                  {d.paiement?.statut}
                                </span>
                              </div>
                            </div>

                            <div>
                              <p className="text-[13px] text-gray-400 dark:text-gray-500">
                                Ville rendez-vous
                              </p>
                              <p className="font-black dark:text-gray-200">
                                {
                                  d?.rendezvous
                                    ?.creneau
                                    ?.centre
                                    ?.ville
                                    ?.nom ||
                                  "Non disponible"
                                }
                              </p>
                            </div>

                            <div className="grid grid-cols-2 gap-2 mt-3">
                              <button
                                className="bg-[#14B53A] text-white rounded p-2 hover:bg-green-700 cursor-pointer"
                                onClick={() => {
                                  // console.log("payer", d.id);
                                }}
                              >
                                Payer
                              </button>
                              <button
                                disabled={
                                  d.paiement?.statut === "REUSSI"
                                }
                                className={`rounded p-2 cursor-pointer ${
                                  d.paiement?.statut === "REUSSI"
                                    ? "bg-gray-300 dark:bg-gray-600 dark:text-gray-400"
                                    : "bg-[#14B53A] text-white hover:bg-green-700"
                                }`}
                                onClick={() => {
                                  // console.log("activer paiement", d.id);
                                }}
                              >
                                {d.paiement?.statut === "REUSSI"
                                  ? "Activé"
                                  : "Activer"}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}


          {active === "securite" && forma && (
            <div className="w-full max-w-2xl p-6">
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                    <KeyRound className="text-[#14B53A] dark:text-green-400" size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black dark:text-gray-200">Modification du mot de passe</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Changer le mot de passe de {forma?.nom} {forma?.prenom}
                    </p>
                  </div>
                </div>

                {/* Nouveau mot de passe */}
                <div className="mb-4">
                  <label className="block text-sm font-black dark:text-gray-300 mb-2">
                    Nouveau mot de passe
                  </label>
                  <div className="relative">
                    <input
                      type={passwordData.showNewPassword ? "text" : "password"}
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      placeholder="Entrez le nouveau mot de passe"
                      className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 p-3 pr-12 rounded-xl focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility("showNewPassword")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      {passwordData.showNewPassword ? (
                        <EyeOff size={20} />
                      ) : (
                        <Eye size={20} />
                      )}
                    </button>
                  </div>

                  {/* Indicateur de force du mot de passe */}
                  {passwordData.newPassword && (
                    <div className="mt-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${
                              passwordStrength.score <= 2
                                ? "bg-red-500"
                                : passwordStrength.score <= 4
                                ? "bg-orange-500"
                                : "bg-green-500"
                            }`}
                            style={{ width: `${(passwordStrength.score / 6) * 100}%` }}
                          ></div>
                        </div>
                        <span className={`text-sm font-black ${passwordStrength.color}`}>
                          {passwordStrength.message}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
                        <div className="flex items-center gap-1">
                          <CheckCircle
                            className={`${
                              passwordData.newPassword.length >= 8
                                ? "text-green-500"
                                : "text-gray-300 dark:text-gray-600"
                            }`}
                            size={14}
                          />
                          <span className="dark:text-gray-400">8 caractères</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CheckCircle
                            className={`${
                              /[A-Z]/.test(passwordData.newPassword) &&
                              /[a-z]/.test(passwordData.newPassword)
                                ? "text-green-500"
                                : "text-gray-300 dark:text-gray-600"
                            }`}
                            size={14}
                          />
                          <span className="dark:text-gray-400">Majuscule/minuscule</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CheckCircle
                            className={`${
                              /[0-9]/.test(passwordData.newPassword) &&
                              /[^a-zA-Z0-9]/.test(passwordData.newPassword)
                                ? "text-green-500"
                                : "text-gray-300 dark:text-gray-600"
                            }`}
                            size={14}
                          />
                          <span className="dark:text-gray-400">Chiffre & symbole</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirmation du mot de passe */}
                <div className="mb-6">
                  <label className="block text-sm font-black dark:text-gray-300 mb-2">
                    Confirmer le mot de passe
                  </label>
                  <div className="relative">
                    <input
                      type={passwordData.showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      placeholder="Confirmez le nouveau mot de passe"
                      className={`w-full border ${
                        passwordData.confirmPassword &&
                        passwordData.newPassword !== passwordData.confirmPassword
                          ? "border-red-500 dark:border-red-500"
                          : passwordData.confirmPassword &&
                            passwordData.newPassword === passwordData.confirmPassword
                          ? "border-green-500 dark:border-green-500"
                          : "border-gray-200 dark:border-gray-700"
                      } dark:bg-gray-800 dark:text-gray-200 p-3 pr-12 rounded-xl focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent outline-none transition-all`}
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility("showConfirmPassword")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      {passwordData.showConfirmPassword ? (
                        <EyeOff size={20} />
                      ) : (
                        <Eye size={20} />
                      )}
                    </button>
                  </div>
                  
                  {/* Messages de validation */}
                  {passwordData.confirmPassword && (
                    <div className="mt-2">
                      {passwordData.newPassword !== passwordData.confirmPassword ? (
                        <div className="flex items-center gap-2 text-red-500 dark:text-red-400">
                          <AlertCircle size={16} />
                          <span className="text-sm font-medium">
                            Les mots de passe ne correspondent pas
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-green-500 dark:text-green-400">
                          <CheckCircle size={16} />
                          <span className="text-sm font-medium">
                            Les mots de passe correspondent
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Boutons d'action */}
                <div className="flex gap-3">
                  <button
                    onClick={handlePasswordUpdate}
                    disabled={passwordMutation.isPending}
                    className="flex-1 px-4 py-3 bg-[#14B53A] dark:bg-green-700 text-white rounded-xl font-black flex items-center justify-center gap-2 cursor-pointer hover:bg-green-700 dark:hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {passwordMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        Mise à jour...
                      </>
                    ) : (
                      <>
                        <KeyRound size={18} />
                        Mettre à jour le mot de passe
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={() => {
                      setPasswordData({
                        newPassword: "",
                        confirmPassword: "",
                        showNewPassword: false,
                        showConfirmPassword: false,
                      });
                      setPasswordStrength({ score: 0, message: "", color: "" });
                    }}
                    className="px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-black hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                  >
                    Réinitialiser
                  </button>
                </div>

                {/* Informations de sécurité */}
                <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="text-[#14B53A] dark:text-green-400 mt-0.5" size={18} />
                    <div>
                      <p className="text-sm font-black text-green-800 dark:text-green-300">
                        Recommandations de sécurité
                      </p>
                      <ul className="text-xs text-green-700 dark:text-green-400 mt-1 space-y-1">
                        <li>• Utilisez au moins 8 caractères</li>
                        <li>• Combinez majuscules, minuscules, chiffres et symboles</li>
                        <li>• Évitez les mots courants ou les informations personnelles</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>


        {/* {forma && (
          <div
            className={`items-center grid md:grid-cols-1 ${
              forma.statut !== "ACTIF" ? "lg:grid-cols-3" : "lg:grid-cols-2"
            } gap-3 border-t p-3 border-gray-200 dark:border-gray-800`}
          >
            {forma.statut !== "ACTIF" && (
              <button
                onClick={handleModifStatus}
                disabled={statutMutate.isPending}
                className="px-4 py-2 border rounded-xl flex items-center justify-center gap-2 cursor-pointer border-gray-500 text-gray-500 dark:border-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 disabled:opacity-50 transition-all"
              >
                <ArrowDownUp size={16} />
                {statutMutate.isPending ? "Modification..." : "Modifier status"}
              </button>
            )}

            <button
              onClick={() => setOpen(false)}
              className="px-4 py-2 rounded-xl bg-red-500 dark:bg-red-600 text-white cursor-pointer hover:bg-red-600 dark:hover:bg-red-700 transition-all"
            >
              Annuler
            </button>

            <button
              onClick={handleSave}
              // disabled={updateMutation.isPending}
              className="px-4 py-2 bg-[#14B53A] dark:bg-green-700 text-white rounded-xl flex items-center justify-center gap-2 cursor-pointer hover:bg-green-700 dark:hover:bg-green-800 transition-all"
            >
              <Save size={16} />
              Sauvegarder
            </button>
          </div>
        )} */}

        {persoA && forma && (
          <PersoAprevModal
            setOpenPa={setOpenPa}
            id={forma.id}
            onSuccess={() => {
              queryClient.invalidateQueries({ queryKey: ["getDemandeur"] });
              queryClient.invalidateQueries({ queryKey: ["demandeurDetail", id_deman] });
              ModifMutation.mutate(id_deman);
            }}
          />
        )}
      </motion.div>
    </Modal>
  );
};

export default UpdateModal;
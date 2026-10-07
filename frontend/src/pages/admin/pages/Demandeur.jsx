import { NavBar } from "../../../components/ui/nav";
import { Menu, Bell, PenBoxIcon, RecycleIcon, RefreshCcw, Loader2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import DemandeurListe from "../../../api/admin/demandeur";
import { useEffect, useState, useMemo } from "react";

import { Plus } from "lucide-react";
import { Download } from "lucide-react";
import { icons } from "lucide-react";
import { UsersRound } from "lucide-react";
import { color } from "framer-motion";
import { UserCheck, Ellipsis, UserRoundX } from "lucide-react";
import { SquarePen, Trash, ArrowDownUp, X } from "lucide-react";
import { CloudSyncIcon } from "lucide-react";
import { Search } from "lucide-react";
import { TimerResetIcon } from "lucide-react";
import { SortAsc } from "lucide-react";
import { ShieldCheck } from "lucide-react";
import UserOptionModal from "../../../components/ui/modal/UserOptionModal";
import { toast } from "sonner";
import DeleteModale from "../../../components/ui/modal/DeleteModal";
import DemandeurDetail from "../../../api/admin/demandeurDetail";
import UpdateModal from "../../../components/ui/modal/UpdateModal";
import UpdateStatus from "../../../api/admin/UpdateStatus";
import { AppHeader } from "../../../components/ui/AppHeader";
import deleteUtilisateur from "../../../api/admin/deleteUtilisateur";
import recoverUtilisateur from "../../../api/admin/recoverUtilisateur";
import DemandeurDelModal from "../../../components/ui/modal/DemandeurDelModal";
import DemanCard from "../../../components/ui/card/DemCard";
import AddUser from "../../../components/ui/modal/AddUser";
import ExporterUtilisitateur from "../../../api/admin/exportUtilisateur";

const statusStyles = {
  ACTIF: "bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
  INACTIF: "bg-red-50 text-red-600 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
};

const roles = ["tous", "demandeur", "Agent", "Administrateur"];

const Demandeur = () => {
  const queryClient = useQueryClient();
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const [demandeur, setDemandeur] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeRole, setActiveRole] = useState(0);
  const [selectRole, setSelecRole] = useState("tous");
  const [nbUser, setNbuser] = useState(0);
  const [actif, setActif] = useState(0);
  const [inactif, setInactif] = useState(0);
  const [NewInscrit, setNewInscrit] = useState(0);
  const [open, setOpen] = useState();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("tous");
  const [periode, setPeriode] = useState("");
  const [tri, setTri] = useState("");
  const [addModal,setAddModal] = useState(false);
  const[deleteModal,setDeleteModal] = useState(false);

  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ["getDemandeur", page],
    queryFn: () => DemandeurListe(page),
  });

  // console.log(data);

  const [formdata, setForma] = useState();
  const [openD, setOpenD] = useState(false);

  const ModifMutation = useMutation({
    mutationKey: ["ModificationUti"],
    mutationFn: DemandeurDetail,
    onSuccess: (response) => {
      setForma(response);
      setOpenD(true);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const UpdateStatuMutation = useMutation({
    mutationKey: ["setUserStatus"],
    mutationFn: (demandeur_id) => UpdateStatus(demandeur_id),
    onSuccess: () => {
      toast.success("Statut de l'utilisateur modifie avec succes");
      queryClient.invalidateQueries({ queryKey: ["getDemandeur"] });
    },
    onError: (error) => {
      toast.error(error?.message ||
        "Une erreur lors de la modification du statut de l'utilisateur",
      );
    },
  });

  const handleUpdateStatut = (id) => {
    if (!id) {
      toast.error("Les références de l'utilisateur sont manquantes");
      return;
    }
    UpdateStatuMutation.mutate(id.toLowerCase());
  };

  const [uuid, setuuid] = useState("");

  const DeleteMutation = useMutation({
    mutationKey: ["SupprimerUtilisateur"],
    mutationFn: (id) => deleteUtilisateur(id),
    onSuccess: () => {
      // console.log('success')
      toast.success("Utilisateur supprime avec succes");
      queryClient.invalidateQueries({ queryKey: ["getDemandeur"] });
    },
    onError: (error) => {
      // console.log('errror')
      toast.error(error.message ||  "Le traitement de votre demande n’a pas pu aboutir. Veuillez réessayer ultérieurement. lors de la supression");
    },
  });

  const handleDeleteUser = (id) => {
    if (!id) {
      toast.error("Les références de l'utilisateur sont manquantes");
      return;
    }
    DeleteMutation.mutate(id);
  };

  // recover mutation pour recuperer les users supprimers
  const RecoverMutation = useMutation({
    mutationKey: ["RecoverUtilisateur"],
    mutationFn: (id) => recoverUtilisateur(id),
    onSuccess: () => {
      // console.log('success')
      toast.success("Utilisateur recuperer avec succes");
      queryClient.invalidateQueries({ queryKey: ["getDemandeur"] });
    },
    onError: () => {
      // console.log('errror')
      toast.error("Le traitement de votre demande n’a pas pu aboutir. Veuillez réessayer ultérieurement. lors de la recuperation ");
    },
  });

  const handleRecoverUser = (id) => {
    if (!id) {
      toast.error("Les références de l'utilisateur sont manquantes");
      return;
    }
    RecoverMutation.mutate(id);
  }

  const handleModifModal = (id) => {
    if (!id) {
      toast.error("Les références de l'utilisateur sont manquantes");
      return;
    }
    ModifMutation.mutate(id);
  };

  const handleUpdateSuccess = () => {
    refetch();
    queryClient.invalidateQueries({ queryKey: ["getDemandeur", page] });
  };

  const [dateN, setDateN] = useState();
  useEffect(() => {
    if (data) {
      setTotal(data.total || 0);
      setPage(data.page || 1);
      setDemandeur(data.data || []);
      setTotalPage(data.totalPages || 1);
      setNbuser(data.total || 0);
      setActif(
        data.data.filter((d) => d.statut === "ACTIF" && d.delete_at === false)
          .length,
      );
      setInactif(
        data.data.filter((d) => d.statut !== "ACTIF" || d.delete_at === true)
          .length,
      );
      setNewInscrit(data.newInsc || 0);
    }
  }, [data]);

  // Mutation pour l'export
// Mutation pour l'export
const exportMutation = useMutation({
  mutationFn: ExporterUtilisitateur,
  onSuccess: (blob) => {
    toast.success("Les données ont été exportées avec succès");
    
    // Créer un lien de téléchargement avec le blob
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `listes des utilisateurs.${new Date()}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
   
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
    }, 1000);
  },
  onError: (error) => {
    // console.error(error);
    toast.error(error.message || "Le traitement de votre demande n’a pas pu aboutir. Veuillez réessayer ultérieurement. lors de l'export");
  },
});
  const handleExport = () => {
    exportMutation.mutate();
  };

  const filtre = useMemo(() => {
    let resultat = [...demandeur];

    // Recherche
    if (search?.trim()) {
      resultat = resultat.filter((f) =>
        `${f.nom || ""} ${f.prenom || ""} ${f.telephone || ""} ${f.role || ""} ${f.genre || ""}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      );
    }

    if (status !== "tous") {
      resultat = resultat.filter((f) => f.statut?.toUpperCase() === status);
    }

    if (selectRole !== "tous") {
      resultat = resultat.filter(
        (f) => f.role?.toLowerCase() === selectRole.toLowerCase(),
      );
    }

    if (periode && periode !== "tous") {
      const now = new Date();

      const parseDate = (dateStr) => {
        if (!dateStr) return null;
        if (dateStr instanceof Date) return dateStr;
        if (dateStr.includes("/")) {
          const [day, month, year] = dateStr.split("/");
          return new Date(year, month - 1, day);
        }
        const date = new Date(dateStr);
        return isNaN(date.getTime()) ? null : date;
      };

      let startDate = null;
      let endDate = null;

      switch (periode) {
        case "week": {
          startDate = new Date(now);
          const dayOfWeek = now.getDay();
          startDate.setDate(now.getDate() - dayOfWeek);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(startDate);
          endDate.setDate(startDate.getDate() + 6);
          endDate.setHours(23, 59, 59, 999);
          break;
        }
        case "month": {
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          endDate.setHours(23, 59, 59, 999);
          break;
        }
        case "3months": {
          startDate = new Date(now);
          startDate.setMonth(now.getMonth() - 3);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(now);
          endDate.setHours(23, 59, 59, 999);
          break;
        }
        default:
          startDate = null;
          endDate = null;
      }

      if (startDate) {
        resultat = resultat.filter((f) => {
          if (!f.date_creation) return false;
          const date = parseDate(f.date_creation);
          if (!date) return false;
          if (endDate) {
            return date >= startDate && date <= endDate;
          } else {
            return date >= startDate;
          }
        });
      }
    }
    switch (tri) {
      case "nom":
        resultat.sort((a, b) => (a.nom || "").localeCompare(b.nom || ""));
        break;
      case "prenom":
        resultat.sort((a, b) => (a.prenom || "").localeCompare(b.prenom || ""));
        break;
      case "asc":
        resultat.sort((a, b) => a.id - b.id);
        break;
      case "desc":
        resultat.sort((a, b) => b.id - a.id);
        break;
    }

    return resultat;
  }, [demandeur, search, status, periode, tri, selectRole]);

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
  const items = [
    {
      titre: "Total utilisateurs",
      value: nbUser,
      icon: UsersRound,
      color: "text-green-500",
      bg: "bg-green-100",
    },
    {
      titre: "Comptes actifs",
      value: actif,
      icon: UserCheck,
      color: "text-green-500",
      bg: "bg-green-100",
    },
    {
      titre: "Nouvelles inscriptions",
      value: NewInscrit,
      icon: Plus,
      color: "text-yellow-500",
      bg: "bg-yellow-100",
    },
    {
      titre: "Compte Inactif",
      value: inactif,
      icon: UserRoundX,
      color: "text-red-500",
      bg: "bg-red-100",
    },
  ];

  const handleActions = (id) => {
    toast(
      <div className="p-4 rounded-2xl mr-6 min-w-[320px] border border-gray-200 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex justify-between items-center mb-5">
          <p className="font-semibold text-gray-700 dark:text-gray-300">
            Manipuler les utilisateurs
          </p>
          <button onClick={() => toast.dismiss()}>
            <X className="text-red-500 dark:text-red-400" />
          </button>
        </div>
        <div className="flex justify-center items-center gap-6">
          <button
            className="flex flex-col items-center gap-2"
            onClick={() => {
              setuuid(id);
              handleModifModal(id);
              toast.dismiss();
            }}
          >
            <SquarePen className="text-[#14B53A] dark:text-green-400" size={24} />
            <p className="text-sm dark:text-gray-300">Modifier</p>
          </button>
          <button
            className="flex flex-col items-center gap-2"
            onClick={() => {
              setDemandeur((prev) => prev.filter((d) => d.id !== id));
            }}
          >
            <Trash className="text-red-500 dark:text-red-400" size={24} />
            <p className="text-sm dark:text-gray-300">Supprimer</p>
          </button>
          <button className="flex flex-col items-center gap-2">
            <ArrowDownUp className="text-gray-500 dark:text-gray-400" size={24} />
            <p className="text-sm dark:text-gray-300">Statut</p>
          </button>
        </div>
      </div>,
      { duration: Infinity },
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <NavBar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <AppHeader onOpenSidebar={() => setSidebarOpen(true)} />

        <main className="flex-1 p-4 md:p-6 overflow-y-auto space-y-6 mt-14">
          <div className=" items-center justify-between grid sm:grid-cols-1 px-5 py-3 text-lg font-black">
            <p className="dark:text-gray-100 m-2">Liste des utilisateurs</p>

            <div className="grid sm:grid-cols-1 md:grid-cols-2 items-center gap-4  ">
              <button
                onClick={handleExport}
                disabled={exportMutation.isPending}
                className="bg-gray-50 dark:bg-gray-800 flex flex-row gap-1 p-2 rounded-lg cursor-pointer justify-center items-center border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed "
              >
                {exportMutation.isPending ? (
                  <div className="flex flex-row gap-1 items-center">
                    <Loader2 size={20} className="text-gray-500 dark:text-gray-400 animate-spin" />
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-bold hover:text-gray-600 dark:hover:text-gray-300">
                      En cours d'exportation
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-row gap-1 items-center">
                    <Download size={20} className="text-gray-500 dark:text-gray-400" />
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-bold hover:text-gray-600 dark:hover:text-gray-300">
                      Exporter
                    </p>
                  </div>
                )}
              </button>

              <button 
                onClick={()=>setAddModal(true)}
                className="bg-[#14B53A] dark:bg-green-700 flex flex-row gap-1 p-2 rounded-lg cursor-pointer justify-center items-center hover:bg-green-500 dark:hover:bg-green-800"
              >
                <Plus color="#fff" size={20} />
                <p className="text-sm text-white font-bold">Nouveau</p>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {items.map((t, index) => (
              <DemanCard key={index} item={t} />
            ))}
          </div>

          <div className="bg-white dark:bg-gray-900 shadow rounded-xl p-4">
            <div className="flex items-center gap-2 flex-1 max-w-md bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2">
              <svg
                className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
                />
              </svg>
              <input
                type="search"
                placeholder="Rechercher un demandeur, une demande..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500 outline-none flex-1 min-w-0"
              />
            </div>
            <div className="border-b border-gray-300 dark:border-gray-700 m-4"></div>

            <div className="flex flex-col md:flex-row gap-4 p-4 bg-white dark:bg-gray-900 shadow rounded-xl">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <UserCheck size={18} />
                  <p>Status</p>
                </div>
                <select
                  name="status"
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 text-sm outline-none dark:bg-gray-800 dark:text-gray-300"
                >
                  <option value="tous">Tous</option>
                  <option value="ACTIF">Actif</option>
                  <option value="INACTIF">Inactif</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <TimerResetIcon size={18} />
                  <p>Période</p>
                </div>
                <select
                  name="periode"
                  id="periode"
                  value={periode}
                  onChange={(e) => setPeriode(e.target.value)}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 text-sm outline-none dark:bg-gray-800 dark:text-gray-300"
                >
                  <option value="month">Ce mois</option>
                  <option value="week">Cette semaine</option>
                  <option value="3months">3 derniers mois</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <SortAsc size={18} />
                  <p>Tri</p>
                </div>
                <select
                  name="sort"
                  id="sort"
                  value={tri}
                  onChange={(e) => setTri(e.target.value)}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 text-sm outline-none dark:bg-gray-800 dark:text-gray-300"
                >
                  <option value="default">Défaut</option>
                  <option value="nom">Nom</option>
                  <option value="prenom">Prénom</option>
                  <option value="asc">Croissant</option>
                  <option value="desc">Décroissant</option>
                </select>
              </div>

              <div className="flex flex-col gap-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={18} />
                  <p>Status</p>
                </div>
                <div className="flex flex-row gap-2 flex-wrap">
                  {roles.map((r, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setActiveRole(i);
                        setSelecRole(r);
                      }}
                      className={`px-3 py-1 rounded-lg border text-sm transition ${
                        activeRole === i
                          ? "bg-[#14B53A] text-white border-[#14B53A] dark:bg-green-700"
                          : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end m-3"></div>
            </div>

            <div className="border-b border-gray-300 dark:border-gray-700 m-4"></div>
          </div>

          <div className="items-center">
            <div className="overflow-x-auto bg-white dark:bg-gray-900 rounded-xl shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
                  <tr>
                    <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                      Nom
                    </th>
                    <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      Prénom
                    </th>
                    <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                      Téléphone
                    </th>
                    <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                      Genre
                    </th>
                    <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                      Supprimer
                    </th>
                    <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {filtre.length > 0 ? (
                    filtre.map((d) => (
                      <tr
                        key={d.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                      >
                        <td className="px-5 py-3.5 text-xs text-gray-400 dark:text-gray-500">
                          {d.id}
                        </td>
                        <td className="px-5 py-3.5 font-medium text-gray-800 dark:text-gray-200">
                          {d.nom}
                        </td>
                        <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400 hidden md:table-cell">
                          {d.prenom}
                        </td>
                        <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400 hidden lg:table-cell">
                          {d.telephone}
                        </td>
                        <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400 lowercase">
                          {d.genre}
                        </td>
                        <td className="px-5 py-3.5 text-gray-500 lowercase">
                          {d.delete_at ? (
                            <span className="inline-flex bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 h-10 w-10 items-center justify-center rounded-full text-red-600 dark:text-red-400 uppercase font-bold text-[10px]">
                              Oui
                            </span>
                          ) : (
                            <span className="inline-flex bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 h-10 w-10 items-center justify-center rounded-full text-gray-600 dark:text-gray-400 uppercase font-bold text-[10px]">
                              Non
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[d.statut] || "bg-gray-100 text-gray-600 border dark:bg-gray-800 dark:text-gray-400"}`}
                          >
                            {d.statut}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400 lowercase">
                          <span>{d.role}</span>
                        </td>
                        <td className="px-5 py-3.5 text-gray-500 lowercase">
                          <div className="grid items-center sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-2">
                            <PenBoxIcon
                              size={18}
                              className="cursor-pointer text-[#14B53A] dark:text-green-400"
                              onClick={() => {
                                setuuid(d.id);
                                setOpen(true);
                                handleModifModal(d.id);
                              }}
                            />
                            {d.delete_at ? (
                              <RefreshCcw
                                size={18}
                                className="cursor-pointer text-orange-600 dark:text-orange-400"
                                onClick={()=>{
                                  handleRecoverUser(d.id)
                                }}
                              />
                            ) : (
                              <Trash
                                size={18}
                                className="cursor-pointer text-red-600 dark:text-red-400"
                                onClick={() => {
                                  setuuid(d.id),
                                  setDeleteModal(true)
                                }}
                              />
                            )}
                            <ArrowDownUp
                              size={18}
                              className="text-gray-500 dark:text-gray-400 cursor-pointer"
                              onClick={() => {
                                handleUpdateStatut(d.id);
                              }}
                            />
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={9}
                        className="text-center py-6 text-gray-400 dark:text-gray-500"
                      >
                        Aucun demandeur trouvé
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between mt-5 px-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((prev) => prev - 1)}
                className="px-4 py-2 rounded-lg border disabled:opacity-50 cursor-pointer dark:border-gray-700 dark:text-gray-300"
              >
                Precedent
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Page {page} sur {totalPage}
              </span>
              <button
                disabled={page === totalPage}
                onClick={() => setPage((prev) => prev + 1)}
                className="px-4 py-2 rounded-lg border disabled:opacity-50 cursor-pointer dark:border-gray-700 dark:text-gray-300"
              >
                Suivant
              </button>
            </div>
          </div>

          {addModal && (
            <AddUser setOpen={setAddModal}/>
          )}
          {openD && (
            <UpdateModal
              setOpen={setOpenD}
              id_deman={uuid}
              onUpdate={handleUpdateSuccess}
            />
          )}
          {deleteModal && (
            <DemandeurDelModal 
              setOpen={setDeleteModal}
              id={uuid}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default Demandeur;
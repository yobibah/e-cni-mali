import { useState, useMemo } from "react";
import { useQuery, keepPreviousData, useMutation } from "@tanstack/react-query";
import { NavBar } from "../../../components/ui/nav";
import {
  Menu,
  Bell,
  Banknote,
  BanknoteXIcon,
  BanknoteArrowUpIcon,
  Download,
  Plus,
  Eye,
  Search,
  Filter,
  Calendar,
  CreditCard,
  X,
  Loader2,
  PenBox,
} from "lucide-react";
import DemanCard from "../../../components/ui/card/DemCard";
import paiementListe from "../../../api/admin/paiementListe";
import { AppHeader } from "../../../components/ui/AppHeader";
import { toast } from "sonner";
import exportPaiement from "../../../api/admin/exportPaiement";

const statusStyles = {
  REUSSI:
    "bg-green-50 text-[#14B53A] border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
  EN_ATTENTE:
    "bg-yellow-50 text-yellow-600 border border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800",
  ECHEC:
    "bg-red-50 text-red-600 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
};

const Payement = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [page, setPage] = useState(1);

  // Filtres supplémentaires
  const [searchTerm, setSearchTerm] = useState("");
  const [statutFilter, setStatutFilter] = useState("Tous");
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading, isFetching ,error} = useQuery({
    queryKey: ["paiements", page],
    queryFn: () => paiementListe(page),
    placeholderData: keepPreviousData,
  });

  // console.table(data);
  const paiements = data?.data?.paiement ?? [];
  const total = data?.data?.total ?? 0;
  const totalPage = data?.data?.totalPages ?? 1;

  // Filtrage des paiements
  const paiementsFiltres = useMemo(() => {
    let resultat = [...paiements];

    // Recherche par nom du demandeur ou ID transaction
    if (searchTerm.trim()) {
      resultat = resultat.filter((p) =>
        `${p.demande?.utilisateur?.nom} ${p.demande?.utilisateur?.prenom} ${p.id}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase()),
      );
    }

    // Filtre par statut
    if (statutFilter !== "Tous") {
      resultat = resultat.filter((p) => p.statut === statutFilter);
    }

    return resultat;
  }, [paiements, searchTerm, statutFilter]);

  const transactionsValides = paiements.filter(
    (p) => p.statut === "REUSSI",
  ).length;
  const transactionsRefusees = paiements.filter(
    (p) => p.statut === "ECHEC",
  ).length;

  const items = [
    {
      titre: "Total Des transactions",
      value: total,
      icon: Banknote,
      color: "text-green-500",
      bg: "bg-green-100",
    },
    {
      titre: "Transaction valide",
      value: transactionsValides,
      icon: BanknoteArrowUpIcon,
      color: "text-green-500",
      bg: "bg-green-100",
    },
    {
      titre: "Transaction Refuse",
      value: transactionsRefusees,
      icon: BanknoteXIcon,
      color: "text-red-500",
      bg: "bg-red-100",
    },
  ];

  const payItems = [
    {
      titre: "Moov money",
      value: 1,
      color: "text-green-500",
      bg: "bg-green-100",
    },
    {
      titre: "Orange money",
      value: 10,
      color: "text-orange-500",
      bg: "bg-orange-100",
    },
    { titre: "Sank money", value: 30, color: "text-red-500", bg: "bg-red-100" },
    {
      titre: "Telecel money",
      value: 20,
      color: "text-purple-500",
      bg: "bg-purple-100",
    },
    {
      titre: "Coris money",
      value: 40,
      color: "text-sky-500",
      bg: "bg-sky-100",
    },
  ];

  const exportMutation = useMutation({
    mutationFn: exportPaiement,
    onSuccess: (blob) => {
      toast.success("Les données ont été exportées avec succès");

      // Créer un lien de téléchargement avec le blob
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `listes des Paiements.${new Date()}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 1000);
    },
    onError: (error) => {
      console.error(error);
      toast.error(error.message || "Le traitement de votre demande n’a pas pu aboutir. Veuillez réessayer ultérieurement. lors de l'export");
    },
  });
  const handleExport = () => {
    exportMutation.mutate();
  };


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
        <main className="flex-1 p-4 md:p-6 overflow-y-auto space-y-6 mt-14">
          <div className="px-5 py-3 text-lg font-black flex items-center justify-between">
            <p className="dark:text-gray-100">Liste des Paiements</p>

            <div className="flex items-center gap-10">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="bg-gray-50 dark:bg-gray-800 flex flex-row gap-1 p-2 rounded-lg cursor-pointer justify-center items-center border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Filter
                  size={20}
                  className="text-gray-500 dark:text-gray-400"
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 font-bold">
                  Filtres
                </p>
              </button>
              <button
                onClick={handleExport}
                disabled={exportMutation.isPending}
                className="bg-gray-50 dark:bg-gray-800 flex flex-row gap-1 p-2 rounded-lg cursor-pointer justify-center items-center border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {exportMutation.isPending ? (
                  <div className="flex flex-row gap-1 items-center">
                    <Loader2
                      size={20}
                      className="text-gray-500 dark:text-gray-400 animate-spin"
                    />
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-bold hover:text-gray-600 dark:hover:text-gray-300">
                      En cours d'exportation
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-row gap-1 items-center">
                    <Download
                      size={20}
                      className="text-gray-500 dark:text-gray-400"
                    />
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-bold hover:text-gray-600 dark:hover:text-gray-300">
                      Exporter
                    </p>
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* Barre de recherche et filtres */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-4">
            <div className="flex items-center gap-2 flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2">
              <Search
                size={18}
                className="text-gray-400 dark:text-gray-500 shrink-0"
              />
              <input
                type="search"
                placeholder="Rechercher par nom, prénom ou ID transaction..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500 outline-none flex-1 min-w-0"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm("")}>
                  <X
                    size={16}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  />
                </button>
              )}
            </div>

            {/* Panneau des filtres */}
            {showFilters && (
              <div className="mt-4 flex flex-wrap gap-4 items-end">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Statut
                  </label>
                  <select
                    value={statutFilter}
                    onChange={(e) => setStatutFilter(e.target.value)}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm outline-none dark:bg-gray-800 dark:text-gray-300"
                  >
                    <option value="Tous">Tous les statuts</option>
                    <option value="REUSSI">Réussi</option>
                    <option value="EN_ATTENTE">En attente</option>
                    <option value="ECHEC">Échec</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Méthode de paiement
                  </label>
                  <select className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm outline-none dark:bg-gray-800 dark:text-gray-300">
                    <option>Tous</option>
                    <option>Moov money</option>
                    <option>Orange money</option>
                    <option>Sank money</option>
                    <option>Telecel money</option>
                    <option>Coris money</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Date début
                  </label>
                  <input
                    type="date"
                    className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm outline-none dark:bg-gray-800 dark:text-gray-300"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Date fin
                  </label>
                  <input
                    type="date"
                    className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm outline-none dark:bg-gray-800 dark:text-gray-300"
                  />
                </div>

                <button className="px-4 py-2 bg-[#14B53A] text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors">
                  Appliquer
                </button>
              </div>
            )}
          </div>

          <div className="grid justify-center grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {items.map((t, index) => (
              <DemanCard key={index} item={t} />
            ))}
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5 flex flex-col gap-4">
            <p className="font-bold text-gray-700 dark:text-gray-300">
              Répartition par moyen de paiement
            </p>
            {payItems.map((p, index) => {
              const totalPay = payItems.reduce(
                (sum, item) => sum + item.value,
                0,
              );
              const percent = ((p.value / totalPay) * 100).toFixed(0);
              return (
                <div key={index} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {p.titre}
                    </p>
                    <p className={`text-sm font-bold ${p.color}`}>{p.value}</p>
                  </div>
                  <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${p.bg.replace("100", "500")} transition-all duration-500`}
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="m-8"></div>
          <div className="items-center">
            <div className="overflow-x-auto bg-white dark:bg-gray-900 rounded-xl shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
                  <tr>
                    <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                      ID Transaction
                    </th>
                    <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                      Demandeur
                    </th>
                    <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                      Date & Heure
                    </th>
                    <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                      Montant
                    </th>
                    <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      Méthode
                    </th>
                    <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {isLoading ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="text-center py-6 text-gray-400 dark:text-gray-500"
                      >
                        Chargement...
                      </td>
                    </tr>
                  ) : paiementsFiltres.length > 0 ? (
                    paiementsFiltres.map((d) => (
                      <tr
                        key={d.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                      >
                        <td className="px-5 py-3.5  text-xs text-gray-400 dark:text-gray-500">
                          {d.id}
                        </td>
                        <td className="px-5 py-3.5 font-medium text-gray-800 dark:text-gray-200">
                          {d.demande?.utilisateur?.nom}{" "}
                          {d.demande?.utilisateur?.prenom}
                        </td>
                        <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400 hidden lg:table-cell">
                          {new Date(d.date_paiement).toLocaleString("fr-FR", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </td>
                        <td className="px-5 py-3.5 font-medium text-gray-800 dark:text-gray-200">
                          {d.montant} FCFA
                        </td>
                        <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400 hidden md:table-cell capitalize">
                          {d.mode_paiement || "-"}
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[d.statut] || "bg-gray-100 text-gray-600 border dark:bg-gray-800 dark:text-gray-400"}`}
                          >
                            {d.statut}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            {/* <PenBox
                              size={18}
                              className="cursor-pointer text-[#14B53A] dark:green-green-400"
                              onClick={() => {
                                // voir détails
                              }}
                            />
                            <Download
                              size={18}
                              className="cursor-pointer text-[#14B53A] dark:text-green-400"
                              onClick={() => {}}
                            /> */}
                            <p className="text-red-400">No Action</p>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={7}
                        className="text-center py-6 text-gray-400 dark:text-gray-500"
                      >
                        Aucun paiement trouvé
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
                Page {page} sur {totalPage} {isFetching && "(maj...)"}
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
        </main>
      </div>
    </div>
  );
};

export default Payement;

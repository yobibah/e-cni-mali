import { useState, useEffect } from "react";
import { Search, Send, ChevronLeft, ChevronRight } from "lucide-react";
import { Footer } from "../components/ui/footer";
import { Header } from "../components/ui/header";
import { motion } from "framer-motion";
import Card from "../components/ui/card";
import { useQuery } from "@tanstack/react-query";
import Getcentre from "../api/centres/centre";

const Centre = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");

  const { isPending, error, data } = useQuery({
    queryKey: ["centresData", page],
    queryFn: () => Getcentre(page),
  });

  // useEffect(() => {
  //   console.log(data);
  // }, [data]);

  const centres = data?.centres || [];
  const totalPages = data?.totalPages || 1;
  const currentPage = data?.currentPage || 1;

  // Régions sans doublons
  const sansDoublons = centres.filter(
    (r, index, self) => index === self.findIndex((t) => t.region === r.region)
  );

  // Filtrer les centres par recherche et par région
  const filteredCentres = centres.filter(centre => {
    const matchSearch = centre.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       centre.ville?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       centre.region?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRegion = !selectedRegion || centre.region === selectedRegion;
    return matchSearch && matchRegion;
  });

  return (
    <>
      <div className="flex flex-col bg-grid-light from-gray-50 to-gray-100 min-h-screen">
        <Header />

        <div className="flex flex-col justify-center items-center mt-10 mb-8 px-4 text-center">
          <h1 className="font-black text-4xl text-gray-900">Centres d'enrôlement ONI</h1>
          <p className="text-gray-500 mt-2 max-w-xl text-sm">
            Trouvez le centre le plus proche de chez vous pour finaliser votre demande de CNI.
          </p>
        </div>

        <div className="px-4 sm:px-6 lg:px-8 max-w-6xl w-full mx-auto mb-4">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Rechercher un centre par nom, ville ou région..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-md shadow-sm bg-white text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all"
              />
              {searchTerm && (
                <div className="absolute inset-y-0 right-3 flex items-center cursor-pointer">
                  <button onClick={() => setSearchTerm("")} className="text-gray-400 hover:text-gray-600">
                    ✕
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Filtres par région */}
        <div className="px-4 max-w-6xl w-full mx-auto mb-6">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedRegion("")}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                selectedRegion === ""
                  ? "bg-[#14B53A] text-white border-[#14B53A]"
                  : "border-gray-200 bg-white text-gray-600 hover:border-green-400 hover:text-[#14B53A]"
              }`}
            >
              Toutes les régions
            </button>
            {sansDoublons.map((dat) => (
              <button
                key={dat.region}
                type="button"
                onClick={() => setSelectedRegion(dat.region)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                  selectedRegion === dat.region
                    ? "bg-[#14B53A] text-white border-[#14B53A]"
                    : "border-gray-200 bg-white text-gray-600 hover:border-green-400 hover:text-[#14B53A]"
                }`}
              >
                {dat.region}
              </button>
            ))}
          </div>
        </div>

        {/* Grille des centres */}
        <div className="flex-1 px-4 sm:px-6 lg:px-8 max-w-6xl w-full mx-auto">
          {isPending ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-center">
                {/* <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#14B53A]"></div> */}
                <img
             src="/oni_loade.svg"
  alt="Loading..."
  className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-32 lg:h-32 mx-auto object-contain rounded-full"
/>
              
                <p className="text-gray-400 text-sm mt-3">Chargement des centres...</p>
              </div>
            </div>
          ) : error ? (
               <div className="flex-1 flex items-center justify-center">
          <div className="text-center px-4">
            <img
              src="/404.svg"
              alt="error..."
              className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 mx-auto object-contain animate-pulse"
            />
            <p className="text-gray-600 mt-4 text-sm md:text-base">
              Pas de centres trouvés...
            </p>
          </div>
        </div>
          ) : filteredCentres.length === 0 ? (
            <div className="text-center py-12">

              <p className="text-gray-400 text-sm">Aucun centre ne correspond à votre recherche.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCentres.map((d) => (
                <motion.div
                  key={d.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card centre={d} />
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {!isPending && totalPages > 1 && filteredCentres.length > 0 && (
          <div className="flex items-center justify-center gap-2 my-8">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-3 py-2 text-sm font-medium border border-gray-200 rounded-md bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft size={15} />
              Précédent
            </button>

            <div className="flex gap-1">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setPage(pageNum)}
                    className={`w-9 h-9 rounded-md text-sm font-semibold border transition-all ${
                      pageNum === currentPage
                        ? "bg-[#14B53A] text-white border-[#14B53A]"
                        : "bg-white text-gray-600 border-gray-200 hover:border-green-400 hover:text-[#14B53A]"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 px-3 py-2 text-sm font-medium border border-gray-200 rounded-md bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Suivant
              <ChevronRight size={15} />
            </button>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default Centre;
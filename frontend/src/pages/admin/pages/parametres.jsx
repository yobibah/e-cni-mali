import { useState } from "react";
import { NavBar } from "../../../components/ui/nav";
import { AppHeader } from "../../../components/ui/AppHeader";
import {
  Activity,
  File,
  Icon,
  LucideLockKeyhole,
  Save,
  ShieldCheck,
  X,
} from "lucide-react";

const Parametres = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [disable, setDisable] = useState(true);
  const nav = [
    { name: "Informations personelles", icon: File },
    { name: "Securite", icon: LucideLockKeyhole },
    { name: "Gestion des roles", icon: ShieldCheck },
    { name: "Activite", icon: Activity },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <NavBar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <AppHeader onOpenSidebar={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 md:p-2 overflow-y-auto space-y-6 mt-14 ">
          <div className="bg-white dark:bg-gray-800 shadow  ">
            <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 justify-between gap-2 p-4 ">
              {nav.map((n, i) => {
                const Icon = n.icon;
                return (
                  <button
                    onClick={() => setActive(i)}
                    className={` flex items-center justify-center text-sm text-gray-500 dark:text-gray-300 cursor-pointer border dark:border-gray-600 border-gray-200   font-bold ${active === i ? "bg-[#14B53A] text-white " : ""} rounded-xl gap-2 p-1`}
                  >
                    <Icon size={16} />
                    <p className="">{n.name}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {active === 0 && (
            <div className="bg-white dark:bg-gray-800 shadow-sm p-4 rounded">
              <div className="flex justify-between items-center">
                <h1 className="text-lg dark:text-gray-300">
                  Informations personnelles de l'administrateur
                </h1>

                <button
                  onClick={() => setDisable((prev) => !prev)}
                  className="border border-gray-200 p-2 rounded dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer mb-2"
                >
                  <p>Modifier</p>
                </button>
              </div>

              <div className="border-b-2 p-0.5 mb-6 dark:border-gray-400 border-gray-200 rounded-2xl"></div>

              <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="text-sm dark:text-gray-300">Nom</label>
                  <input
                    type="text"
                    value={"BA"}
                    disabled={disable}
                    className={`border p-2 rounded dark:bg-gray-900 dark:text-white ${disable ? " dark:border-gray-900 border-gray-200" : ""}`}
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-sm dark:text-gray-300">Prénom</label>
                  <input
                    type="text"
                    value={"Moussa"}
                    disabled={disable}
                    className={`border p-2 rounded dark:bg-gray-900 dark:text-white ${disable ? " dark:border-gray-900 border-gray-200" : ""}`}
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-sm dark:text-gray-300">Email</label>
                  <input
                    type="email"
                    value={"admin@gmail.com"}
                    disabled={disable}
                    className={`border p-2 rounded dark:bg-gray-900 dark:text-white ${disable ? " dark:border-gray-900 border-gray-200" : ""}`}
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-sm dark:text-gray-300">
                    Téléphone
                  </label>
                  <input
                    type="text"
                    value={"+223 70 00 00 00"}
                    disabled={disable}
                    className={`border p-2 rounded dark:bg-gray-900 dark:text-white ${disable ? " dark:border-gray-900 border-gray-200" : ""}`}
                  />
                </div>

                <div className={`flex flex-col md:col-span-2 `}>
                  <label className="text-sm dark:text-gray-300">Genre</label>
                  <select
                    className={`border p-2 rounded dark:bg-gray-900 bg-gray-100 dark:text-white ${disable ? " dark:border-gray-900 border-gray-200" : ""}`}
                    disabled={disable}
                  >
                    <option value="HOMME">Homme</option>
                    <option value="FEMME">Femme</option>
                  </select>
                </div>
              </form>

              {!disable && (
                <div className="flex justify-between mt-4">
                  <button className="bg-red-500 text-white dark:bg-red-600 p-2 flex justify-center items-center gap-2 rounded hover:bg-red-400 dark:hover:bg-red-500 cursor-pointer">
                    <X size={16} />
                    <p>Annuler</p>
                  </button>

                  <button className="bg-green-500 text-white dark:bg-[#14B53A] p-2 flex justify-center items-center gap-2 rounded hover:bg-green-400 dark:hover:bg-green-500 cursor-pointer">
                    <Save size={16} />
                    <p>Sauvegarder</p>
                  </button>
                </div>
              )}
            </div>
          )}

          {active === 1 && (
            <div className=" bg-white dark:bg-gray-800 shadow ">
              <h1>Information Personnelle de l'Administrateur </h1>
            </div>
          )}

          {active === 2 && (
            <div className="bg-white dark:bg-gray-800 shadow "></div>
          )}

          {active === 3 && (
            <div className="bg-white dark:bg-gray-800 shadow "></div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Parametres;

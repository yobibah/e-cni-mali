import { Menu } from "lucide-react";

export function AppHeader({ onOpenSidebar }) {
  return (
    <header className="flex items-center justify-between gap-3 px-4 md:px-6 py-3.5 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 fixed w-full top-0 z-30  ">
      {/* Burger — mobile seulement */}
      <button
        onClick={onOpenSidebar}
        className="lg:hidden p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        <Menu size={20} />
      </button>

      {/* Recherche */}
      {/* <div className="flex items-center gap-2 flex-1 max-w-md bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2">
        <input
          type="search"
          placeholder="Rechercher..."
          className="bg-transparent text-sm outline-none flex-1 dark:text-gray-200 dark:placeholder-gray-500"
        />
      </div> */}
      <h1 className="dark:text-white sm:text-sm md:text-xl">Administration DNEC</h1>

           <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 flex items-center justify-center">
            <img
              src="/oni.jpg"
              alt="Logo ONI"
              className="w-8 h-8 rounded-lg object-cover"
            />
          </div>
    </header>
  );
}
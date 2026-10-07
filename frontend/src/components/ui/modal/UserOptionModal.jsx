import { SquarePen, Trash, ArrowDownUp, X } from "lucide-react";

const UserOptionModal = ({ setOpen }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-end bg-black/20 z-50">
      
      <div className="bg-white p-4 rounded-2xl shadow-xl mr-6 min-w-[320px]">
        

        <div className="flex justify-between items-center mb-5">
          <p className="font-semibold text-gray-700">
            Manipuler les utilisateurs
          </p>

          <button
            onClick={() => setOpen(false)}
            className="cursor-pointer"
          >
            <X className="text-red-500" />
          </button>
        </div>

        <div className="flex justify-center items-center gap-6">
          
          <button className="flex flex-col items-center gap-2 cursor-pointer hover:scale-105 transition">
            <SquarePen className="text-[#14B53A]" size={24} />
            <p className="text-gray-500 text-sm font-medium">
              Modifier
            </p>
          </button>

          <button className="flex flex-col items-center gap-2 cursor-pointer hover:scale-105 transition">
            <Trash className="text-red-500" size={24} />
            <p className="text-gray-500 text-sm font-medium">
              Supprimer
            </p>
          </button>

          <button className="flex flex-col items-center gap-2 cursor-pointer hover:scale-105 transition">
            <ArrowDownUp className="text-gray-500" size={24} />
            <p className="text-gray-500 text-sm font-medium text-center">
              Modifier statut
            </p>
          </button>

        </div>
      </div>
    </div>
  );
};

export default UserOptionModal;
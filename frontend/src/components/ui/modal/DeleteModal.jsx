import { toast } from "sonner";
import { SquarePen, Trash, X } from "lucide-react";

const DeleteModale = () => {
  toast(
    <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-xl mr-6 min-w-[320px] border border-gray-200 dark:border-gray-700">
      
      <div className="flex justify-between items-center mb-5">
        <p className="font-semibold text-gray-700 dark:text-gray-200">
          Suppression
        </p>

        <button onClick={() => toast.dismiss()}>
          <X className="text-red-500" />
        </button>
      </div>

      <h1 className="mb-4 text-gray-800 dark:text-gray-100">
        Voulez-vous supprimer cet utilisateur ?
      </h1>

      <div className="flex justify-center items-center gap-6">

        <button
          className="flex flex-col items-center gap-2 text-gray-700 dark:text-gray-200"
          onClick={() => {
            console.log("oui supprimer");
            toast.dismiss();
          }}
        >
          <SquarePen className="text-[#14B53A]" size={24} />
          Oui
        </button>

        <button
          className="flex flex-col items-center gap-2 text-gray-700 dark:text-gray-200"
          onClick={() => toast.dismiss()}
        >
          <Trash className="text-red-500" size={24} />
          Non
        </button>

      </div>
    </div>,
    { duration: Infinity }
  );
};

export default DeleteModale;
import { Clock, Map, MapPin, MapPinCheckInside, Phone } from "lucide-react";

const capacityStyle = {
  haute:   { bg: "bg-green-100",  text: "text-green-700",  border: "border-green-300",  dot: "bg-green-500"  },
  moyenne: { bg: "bg-yellow-100", text: "text-yellow-700", border: "border-yellow-300", dot: "bg-yellow-500" },
  faible:  { bg: "bg-red-100",    text: "text-red-700",    border: "border-red-300",    dot: "bg-red-500"    },
};

const getCapaciteLabel = (capacite_journaliere) => {
  if (capacite_journaliere >= 100) return "haute";
  if (capacite_journaliere >= 50)  return "moyenne";
  return "faible";
};

const Card = ({ centre }) => {
  const label = getCapaciteLabel(centre.capacite_journaliere);
  const cap = capacityStyle[label];

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="bg-[#14B53A] h-2 w-full" />
      <div className="p-4">

        <div className="flex flex-row justify-between items-center mb-3">
          <h1 className="text-base font-semibold text-gray-900">{centre.nom}</h1>
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${cap.bg} ${cap.text} ${cap.border}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cap.dot}`} />
            {centre.capacite_journaliere} / jour
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex flex-row gap-2 items-center">
            <MapPin className="text-gray-400 shrink-0" size={15} />
            <p className="text-gray-500 text-sm">{centre.commune} - {centre.province}</p>
          </div>
          <div className="flex flex-row gap-2 items-center">
            <MapPinCheckInside className="text-gray-400 shrink-0" size={15} />
            <p className="text-gray-500 text-sm">{centre.region}</p>
          </div>
          <div className="flex flex-row gap-2 items-center">
            <Clock className="text-gray-400 shrink-0" size={15} />
            <p className="text-gray-500 text-sm">Lun - Ven : 07h30 - 16h00</p>
          </div>
        </div>

        <div className="border-b border-gray-200 my-3" />

        {/* <button className="w-full flex items-center justify-center gap-2 py-2 px-3 border border-gray-200 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer">
          <Map size={15} />
          Voir sur la carte
        </button> */}

      </div>
    </div>
  );
};

export default Card;
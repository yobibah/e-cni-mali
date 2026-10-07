import { useEffect, useState } from "react";
import { NavBar } from "../../../components/ui/nav";
import {
  Banknote, FileText, TrendingDown, TrendingUp,
  Users, Wallet, Menu, Bell,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Pie, PieChart, Cell, ResponsiveContainer, Legend,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import Dash from "../../../api/admin/Dash";
import {motion} from 'framer-motion'
import { AppHeader } from "../../../components/ui/AppHeader";
import evolutionDemande from "../../../api/admin/evolutionDemande";
import evolutionCentre from "../../../api/admin/evolutionCentre";
// const evolutionDemande = [
//   { name: "Lun", inscriptions: 120, demandes: 80,  paiements: 60  },
//   { name: "Mar", inscriptions: 180, demandes: 140, paiements: 110 },
//   { name: "Mer", inscriptions: 150, demandes: 110, paiements: 90  },
//   { name: "Jeu", inscriptions: 200, demandes: 160, paiements: 130 },
//   { name: "Ven", inscriptions: 210, demandes: 190, paiements: 145 },
//   { name: "Sam", inscriptions: 90,  demandes: 70,  paiements: 50  },
//   { name: "Dim", inscriptions: 60,  demandes: 40,  paiements: 30  },
// ];

// const centres = [
//   { name: "Bamako",   value: 420, color: "#0F6E56" },
//   { name: "Bobo-Dioulasso",value: 280, color: "#5DCAA5" },
//   { name: "Koudougou",     value: 190, color: "#9FE1CB" },
//   { name: "Autres",        value: 110, color: "#E1F5EE" },
// ];

const statusStyles = {
  "En attente": "bg-yellow-50 text-yellow-700 border border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800",
  "Approuvée":  "bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
  "Rejetée":    "bg-red-50 text-red-600 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
  "En cours":   "bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
};

function Carte({ item }) {
  const Icon = item.icon;
  const hausse = item.raport > 10;
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow flex flex-col">
      <div className="flex items-start gap-3 p-4 flex-1">
        <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-3 shrink-0">
          <Icon size={18} className="text-green-700 dark:text-green-400" />
        </div>
        <div className="min-w-0">
          <p className="text-gray-400 dark:text-gray-500 text-xs font-medium truncate">{item.libelle}</p>
          <h2 className="font-bold text-xl text-gray-800 dark:text-gray-100 mt-0.5">{item.value}</h2>
        </div>
      </div>
      <div className={`flex items-center gap-2 px-4 py-2.5 rounded-b-xl text-xs font-semibold ${
        hausse ? "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400" : "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400"
      }`}>
        {hausse ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
        <span>{item.raport}%</span>
        <span className="font-normal text-gray-400 dark:text-gray-500">par rapport à hier</span>
      </div>
    </div>
  );
}

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

const { data } = useQuery({
  queryKey: ["GetDash"],
  queryFn: Dash,
});

const { data: evolutionData } = useQuery({
  queryKey: ["GetEvolution"],
  queryFn: evolutionDemande,
});

const { data: centreData } = useQuery({
  queryKey: ["GetEvolutionCentre"],
  queryFn: evolutionCentre,
});

const evolution = evolutionData?.stats ?? [];

const centres = centreData?.resp ?? [];

console.log(centres)

const [demandes, setDemande] = useState([]);
const [inscj, setInscj] = useState();
const [payj, setPayJ] = useState();
const [insnbDemandecj, SetnbDemande] = useState();
const[montantAuj, setMontantAuj] = useState();
const[percAuj ,setPercAuj]= useState(0);
const [stats,setStats] = useState([]);

useEffect(() => {
  

  if (data) {
    setDemande(data.user);
    setInscj(data.nbInscrit);
    setPayJ(data.pay)
    SetnbDemande(data.nbDemande)
    setMontantAuj(data.montant)
    setPercAuj(data.percentAuj)

  }

}, [data]);

const card = [
  { libelle: "Inscriptions du jour",      value: inscj ?? 0,        raport: percAuj,  icon: Users    },
  { libelle: "Demandes du jour",          value: insnbDemandecj ?? 0,        raport: 13.4, icon: FileText  },
  { libelle: "Paiements du jour",         value: payj ?? 0,        raport: 12.4, icon: Banknote  },
  { libelle: "Montant total aujourd'hui", value: montantAuj ?? 0 + "FCFA",raport: 12.4, icon: Wallet    },
];


  return (
    <motion.div
  //  initial={{ opacity: 0, x: -30 }}
  //             animate={{ opacity: 1, x: 0 }}
  //             transition={{ duration: 0.5 }}
     className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
     <NavBar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <AppHeader onOpenSidebar={() => setSidebarOpen(true)} />

        <main className="flex-1 p-4 md:p-6 overflow-y-auto space-y-6 mt-14">


          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {card.map((item, i) => <Carte key={i} item={item} />)}
          </div>


          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

  
            <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-sm p-4">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Évolution de la semaine</p>
                <div className="flex gap-3 text-[11px] text-gray-400 dark:text-gray-500">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-[#0F6E56] inline-block"/>Inscriptions</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-[#5DCAA5] inline-block"/>Demandes</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-[#9FE1CB] inline-block"/>Paiements</span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={evolution} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gInscriptions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#0F6E56" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#0F6E56" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="gDemandes" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#5DCAA5" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#5DCAA5" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="gPaiements" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#9FE1CB" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#9FE1CB" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: 10, border: "0.5px solid #e5e7eb", fontSize: 12, backgroundColor: "#fff", color: "#000" }}
                    cursor={{ stroke: "#e5e7eb" }}
                  />
                  <Area type="monotone" dataKey="inscriptions" stroke="#0F6E56" strokeWidth={2} fill="url(#gInscriptions)" dot={false} />
                  <Area type="monotone" dataKey="demandes"     stroke="#5DCAA5" strokeWidth={2} fill="url(#gDemandes)"     dot={false} />
                  <Area type="monotone" dataKey="paiements"    stroke="#9FE1CB" strokeWidth={2} fill="url(#gPaiements)"    dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>


            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-sm p-4 flex flex-col">
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-4">Répartition par centre</p>
              <div className="flex-1 flex items-center justify-center">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={centres}
                      cx="50%" cy="50%"
                      innerRadius="55%"
                      outerRadius="80%"
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {centres.map((c, i) => (
                        <Cell key={i} fill={c.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: 10, border: "0.5px solid #e5e7eb", fontSize: 12, backgroundColor: "#fff", color: "#000" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              {/* Légende manuelle */}
              <div className="mt-2 space-y-1.5">
                {centres.map((c, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-sm inline-block shrink-0" style={{ background: c.color }} />
                      <span className="text-gray-600 dark:text-gray-400">{c.name}</span>
                    </span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">{c.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

       
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Dernières demandes</p>
              <Link to="/admin/demandes" className="text-xs text-[#14B53A] dark:text-green-400 font-medium hover:underline">
                Voir tout 
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
                  <tr>
                    <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Référence</th>
                    <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Demandeur</th>
                    <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider hidden md:table-cell">Type</th>
                    <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider hidden lg:table-cell">Centre</th>
                    <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {demandes.map((d) => (
                    <tr key={d.reference} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                      <td className="px-5 py-3.5  text-xs text-gray-400 dark:text-gray-500">{d.reference}</td>
                      <td className="px-5 py-3.5 font-medium text-gray-800 dark:text-gray-200">{d.demandeur}</td>
                      <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400 hidden md:table-cell">{d.type}</td>
                      <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400 hidden lg:table-cell">{d.centre}</td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[d.status]}`}>
                          {d.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
               </table>
            </div>
          </div>

        </main>
      </div>
    </motion.div>
  );
};

export default Dashboard;
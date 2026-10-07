import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  FileText,
  Search,
  ArrowRight,
  AlertTriangle,
  RefreshCw,
  UserPlus,
  Upload,
  CreditCard,
  QrCode,
  Calendar,
} from "lucide-react";
import { Header } from "../components/ui/header";
import { Footer } from "../components/ui/footer";
import { useQuery } from "@tanstack/react-query";
import HandleProfile from "../api/demandeur/profil";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function Home() {
    const { data, isLoading, refetch, error } = useQuery({
      queryKey: ["Getprofil"],
      queryFn: HandleProfile,
    });

    useEffect(()=>{
      if(data){
      localStorage.setItem("nom", data.nom);
      localStorage.setItem("prenom", data.prenom);
      }
      
    },[]);
  return (
    <div className="flex flex-col  min-h-screen">
      <Header />

      <section className="relative bg-grid-light  overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
       
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-50 text-green-700 text-sm font-medium mb-6 border border-green-100">
                <ShieldCheck size={16} className="mr-2" />
                Plateforme Officielle Sécurisée
              </div>

              <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-6">
                Effectuez votre demande de{" "}
                <span className="text-[#14B53A]">CNI</span> en ligne simplement
              </h1>

              <p className="text-lg text-gray-600 mb-8 max-w-lg">
                Direction Nationale de l'État Civil simplifie vos démarches.
                Demandez, renouvelez ou déclarez la perte de votre Carte
                Nationale d'Identité Malien depuis chez vous.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/demande"
                  className="inline-flex justify-center items-center px-6 py-3 rounded-md text-white bg-[#14B53A] hover:bg-green-700 text-base font-medium shadow-sm transition-colors"
                >
                  Nouvelle demande
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  to="/dashboard"
                  className="inline-flex justify-center items-center px-6 py-3 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 text-base font-medium shadow-sm transition-colors"
                >
                  Suivre ma demande
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-[#14B53A]/20 to-yellow-400/20 rounded-3xl rotate-3 scale-105" />
              <div className="relative bg-white rounded-3xl shadow-xl border border-gray-100 p-8 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-bl-full -mr-10 -mt-10" />

                {/* Fausse CNI*/}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 p-6 shadow-sm mb-6 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 via-yellow-400 to-green-500" />
                  <div className="flex justify-between items-start mb-6 mt-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
                        <div className="w-3 h-3 bg-yellow-400 rounded-full" />
                      </div>
                      <span className="text-xs font-bold text-gray-800 uppercase">
                        Republique du Mali
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-500 font-semibold uppercase text-right">
                      Carte Nationale
                      <br />
                      d'Identité
                    </p>
                  </div>

                  <div className="flex space-x-4">
                    <div className="w-20 h-24 bg-gray-200 rounded-md flex-shrink-0 border-2 border-white shadow-sm flex items-center justify-center">
                      <UserPlus className="text-gray-400" size={32} />
                    </div>
                    <div className="space-y-3 flex-1">
                      <div>
                        <p className="text-[9px] text-gray-500 uppercase">
                          Nom
                        </p>
                        <p className="text-sm font-bold text-gray-900">
                          TALL
                        </p>
                      </div>
                      <div>
                        <p className="text-[9px] text-gray-500 uppercase">
                          Prénoms
                        </p>
                        <p className="text-sm font-semibold text-gray-800">
                          Aminata
                        </p>
                      </div>
                      <div className="flex justify-between">
                        <div>
                          <p className="text-[9px] text-gray-500 uppercase">
                            Né(e) le
                          </p>
                          <p className="text-xs font-medium text-gray-800">
                            12/05/1990
                          </p>
                        </div>
                        <div>
                          <p className="text-[9px] text-gray-500 uppercase">
                            Sexe
                          </p>
                          <p className="text-xs font-medium text-gray-800">F</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Faux statut */}
                <div className="bg-white rounded-lg border border-gray-100 p-4 shadow-sm flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <ShieldCheck className="text-[#14B53A]" size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Dossier N° DNEC-2026-892
                      </p>
                      <p className="text-xs text-gray-500">
                        Mise à jour il y a 2h
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                    Validée
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900">
              Nos Services en Ligne
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Choisissez le type de demande qui correspond à votre situation
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              {
                icon: FileText,
                color: "green",
                title: "Première demande",
                desc: "Pour les citoyens Malien n'ayant jamais possédé de Carte Nationale d'Identité.",
                path: "/premiere-demande",
              },
              {
                icon: AlertTriangle,
                color: "amber",
                title: "Déclaration de perte",
                desc: "En cas de perte ou de vol de votre CNI actuelle. Nécessite une déclaration préalable.",
                path: "/declaration-perte",
              },
              {
                icon: RefreshCw,
                color: "purple",
                title: "Renouvellement",
                desc: "Pour les cartes arrivées à expiration ou dont les informations doivent être mises à jour.",
                path: "/renouvellement",
              },
            ].map(({ icon: Icon, color, title, desc, path }) => (
              <motion.div
                key={title}
                variants={itemVariants}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 hover:shadow-md transition-shadow group"
              >
                <div
                  className={`w-14 h-14 rounded-lg flex items-center justify-center mb-6 group-hover:bg-white transition-colors`}
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center hover:shadow-md  transition-all duration-200 scale-95 hover:scale-100">
                    <Icon className={`text-${color}-600`} size={28} />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {title}
                </h3>
                <p className="text-gray-600 mb-6">{desc}</p>
                <Link
                  to={path}
                  className="text-[#14B53A] font-medium flex items-center hover:text-green-700"
                >
                  En savoir plus <ArrowRight size={16} className="ml-1" />
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-gray-900">
              Comment ça marche ?
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              6 étapes simples pour obtenir votre CNIB
            </p>
          </motion.div>

          <div className="relative">
            <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-gray-200 z-0" />

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-6 gap-8 relative z-10"
            >
              {[
                {
                  icon: UserPlus,
                  title: "Créer un compte",
                  desc: "Inscrivez-vous sur la plateforme",
                },
                {
                  icon: FileText,
                  title: "Soumettre",
                  desc: "Remplissez le formulaire en ligne",
                },
                {
                  icon: Upload,
                  title: "Documents",
                  desc: "Téléchargez vos pièces justificatives",
                },
                {
                  icon: CreditCard,
                  title: "Paiement",
                  desc: "Réglez les frais de dossier",
                },
                {
                  icon: QrCode,
                  title: "Récépissé",
                  desc: "Obtenez votre document avec QR code",
                },
                {
                  icon: Calendar,
                  title: "Rendez-vous",
                  desc: "Présentez-vous au centre pour l'enrôlement",
                },
              ].map((step, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="flex flex-col items-center text-center"
                >
                  <div className="w-24 h-24 rounded-full bg-white border-4 border-gray-50 shadow-sm flex items-center justify-center mb-4 relative scale-95 hover:scale-100">
                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-[#14B53A] text-white flex items-center justify-center font-bold text-sm border-2 border-white">
                      {index + 1}
                    </div>
                    <step.icon className="text-gray-700" size={32} />
                  </div>
                  <h4 className="text-sm font-bold text-gray-900 mb-2">
                    {step.title}
                  </h4>
                  <p className="text-xs text-gray-500">{step.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-[#14B53A] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern
                id="dots"
                x="0"
                y="0"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="20" cy="20" r="2" fill="currentColor" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center"
          >
            {[
              { value: "45 230+", label: "Demandes traitées" },
              { value: "45", label: "Centres disponibles", bordered: true },
              { value: "1 250", label: "Dossiers en cours" },
            ].map(({ value, label, bordered }) => (
              <motion.div
                key={label}
                variants={itemVariants}
                className={`p-6 ${bordered ? "border-t md:border-t-0 md:border-l md:border-r border-green-500" : "border-t md:border-t-0 border-green-500"}`}
              >
                <div className="text-5xl font-extrabold text-yellow-400 mb-2">
                  {value}
                </div>
                <div className="text-lg font-medium text-green-50 uppercase tracking-wider">
                  {label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

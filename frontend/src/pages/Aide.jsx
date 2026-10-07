import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  ChevronDown,
  Phone,
  Mail,
  MapPin,
  FileText,
} from 'lucide-react'
import { Header } from '../components/ui/header'
import { Footer } from '../components/ui/footer'
const faqs = [
  {
    question: 'Quels sont les documents requis pour une première demande ?',
    answer:
      "Pour une première demande, vous devez fournir : un extrait d'acte de naissance ou jugement supplétif, un certificat de nationalité Malien, et un certificat de résidence datant de moins de 3 mois.",
  },
  {
    question: "Combien coûte l'établissement d'une CNI ?",
    answer:
      "Les frais s'élèvent à 2 500 FCFA pour la carte, auxquels s'ajoutent 200 FCFA pour le timbre fiscal. En cas de perte, les frais sont de 2 500 FCFA.",
  },
  {
    question: 'Quel est le délai de délivrance de la CNI ?',
    answer:
      "Le délai moyen de traitement est d'environ 14 jours ouvrables après votre enrôlement physique dans un centre ONI.",
  },
  {
    question: 'Puis-je payer par Mobile Money ?',
    answer:
      'Oui, la plateforme accepte les paiements via Orange Money, Moov Money et Coris Money, ainsi que les cartes bancaires.',
  },
  {
    question: "Que faire si j'ai perdu ma CNI ?",
    answer:
      "Vous devez d'abord faire une déclaration de perte au commissariat ou à la gendarmerie. Ensuite, faites une demande de 'Déclaration de perte' sur la plateforme en fournissant le Procès-Verbal (PV) de perte.",
  },
  {
    question: 'Dois-je me déplacer pour récupérer ma carte ?',
    answer:
      "Oui, la remise de la CNI se fait en main propre au centre d'enrôlement où vous avez déposé votre dossier, après vérification de votre identité.",
  },
  {
    question: 'Quelle est la durée de validité de la CNI ?',
    answer:
      "La Carte Nationale d'Identité Malien est valide pour une durée de 10 ans à compter de sa date de délivrance.",
  },
  {
    question: "Comment suivre l'état de ma demande ?",
    answer:
      "Connectez-vous à votre espace citoyen sur la plateforme. Dans l'onglet 'Suivre ma demande', vous verrez le statut en temps réel (En attente, Validée, Enrôlée, etc.).",
  },
]
export function Aide() {
  const [searchTerm, setSearchTerm] = useState('')
  const [openIndex, setOpenIndex] = useState(0)
  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase()),
  )
  return (
    <div className="flex flex-col bg-grid-light from-gray-50 to-gray-100 min-h-screen">
      <Header/>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <motion.div

                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Centre d'aide DNEC
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Trouvez des réponses à vos questions ou contactez notre support.
          </p>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.95,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          className="relative max-w-2xl mx-auto mb-12"
        >
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-6 w-6 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Rechercher une question..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl shadow-sm focus:ring-bf-green focus:border-bf-green text-lg"
          />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* FAQ Section */}
          <motion.div
                initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
            className="md:col-span-2 space-y-4"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Foire Aux Questions
            </h2>

            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden"
                >
                  <button
                    onClick={() =>
                      setOpenIndex(openIndex === index ? null : index)
                    }
                    className="w-full text-left px-6 py-4 flex justify-between items-center focus:outline-none hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-medium text-gray-900">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${openIndex === index ? 'transform rotate-180' : ''}`}
                    />
                  </button>
                  <AnimatePresence>
                    {openIndex === index && (
                      <motion.div
                        initial={{
                          height: 0,
                          opacity: 0,
                        }}
                        animate={{
                          height: 'auto',
                          opacity: 1,
                        }}
                        exit={{
                          height: 0,
                          opacity: 0,
                        }}
                        transition={{
                          duration: 0.2,
                        }}
                      >
                        <div className="px-6 pb-4 text-gray-600 border-t border-gray-100 pt-4">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">
                Aucune question trouvée pour "{searchTerm}"
              </p>
            )}
          </motion.div>

          {/* Contact Section */}
          <motion.div
            initial={{
              opacity: 0,
              x: 20,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            className="space-y-6"
          >
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Nous contacter
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <Phone className="h-5 w-5 text-bf-green mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Assistance téléphonique
                    </p>
                    <p className="text-sm text-gray-600">+223 25 30 00 00</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <Mail className="h-5 w-5 text-bf-green mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Email</p>
                    <p className="text-sm text-gray-600">support@oni.ml</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <MapPin className="h-5 w-5 text-bf-green mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Siège ONI
                    </p>
                    <p className="text-sm text-gray-600">
                      Avenue de l'Indépendance, Bamako
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-green-50 rounded-xl border border-green-100 p-6">
              <div className="flex items-center mb-3">
                <FileText className="h-6 w-6 text-[#14B53A] mr-2" />
                <h3 className="text-lg font-bold text-green-900">Guides PDF</h3>
              </div>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-sm text-green-700 hover:underline">
                    Guide de première demande
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-green-700 hover:underline">
                    Guide de renouvellement
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-green-700 hover:underline">
                    Liste complète des pièces
                  </a>
                </li>
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
      <Footer/>
    </div>
  )
}
